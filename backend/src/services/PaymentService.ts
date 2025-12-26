import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { RealtimeService } from './RealtimeService';

const prisma = new PrismaClient();

export class PaymentService {
  private stripe: Stripe;
  private realtime: RealtimeService;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2024-12-18.acacia'
    });
    this.realtime = RealtimeService.getInstance();
  }

  // ============================================
  // INSTANT ACCOUNT CREATION ("Tara-style")
  // ============================================

  async createInstantAccount(email: string, planId: string, paymentMethod: any) {
    try {
      // 1. Create user account instantly
      const user = await this.createUserAccount(email);
      
      // 2. Create Stripe customer
      const stripeCustomer = await this.stripe.customers.create({
        email,
        metadata: { userId: user.id }
      });

      // 3. Attach payment method to customer
      await this.stripe.paymentMethods.attach(paymentMethod.id, {
        customer: stripeCustomer.id,
      });

      // 4. Set as default payment method
      await this.stripe.customers.update(stripeCustomer.id, {
        invoice_settings: {
          default_payment_method: paymentMethod.id,
        },
      });

      // 5. Create subscription
      const plan = await prisma.paymentPlan.findUnique({ where: { id: planId } });
      if (!plan) throw new Error('Plan not found');

      const subscription = await this.stripe.subscriptions.create({
        customer: stripeCustomer.id,
        items: [{ price: plan.stripePriceId! }],
        default_payment_method: paymentMethod.id,
        expand: ['latest_invoice.payment_intent'],
      });

      // 6. Save to database
      const dbSubscription = await prisma.paymentSubscription.create({
        data: {
          id: uuidv4(),
          userId: user.id,
          planId: plan.id,
          status: 'active',
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: stripeCustomer.id,
        }
      });

      // 7. Save payment method
      await prisma.paymentMethod.create({
        data: {
          id: uuidv4(),
          userId: user.id,
          type: 'stripe_card',
          provider: 'stripe',
          stripePaymentMethodId: paymentMethod.id,
          last4: paymentMethod.card.last4,
          brand: paymentMethod.card.brand,
          expiryMonth: paymentMethod.card.exp_month,
          expiryYear: paymentMethod.card.exp_year,
          isDefault: true,
        }
      });

      // 8. Real-time update
      this.realtime.broadcastUpdate('account_created', {
        userId: user.id,
        email,
        subscriptionId: dbSubscription.id,
        planName: plan.name
      });

      return {
        user,
        subscription: dbSubscription,
        stripeSubscription: subscription
      };

    } catch (error) {
      console.error('Error creating instant account:', error);
      throw error;
    }
  }

  private async createUserAccount(email: string) {
    // Generate random password for instant account
    const tempPassword = Math.random().toString(36).substring(2, 15);
    const passwordHash = await bcrypt.hash(tempPassword, 10);
    
    // Generate unique username from email
    const username = email.split('@')[0] + '_' + Date.now();

    const user = await prisma.users.create({
      data: {
        id: uuidv4(),
        email,
        username,
        passwordHash,
        emailVerified: true, // Auto-verify for payment users
        emailVerifiedAt: new Date(),
        termsAccepted: true,
        termsAcceptedAt: new Date(),
      }
    });

    return user;
  }

  // ============================================
  // STRIPE PAYMENT PROCESSING
  // ============================================

  async processStripeWebhook(eventType: string, data: any) {
    try {
      switch (eventType) {
        case 'payment_intent.succeeded':
          return await this.handleStripePaymentSuccess(data);
        
        case 'payment_intent.payment_failed':
          return await this.handleStripePaymentFailed(data);
          
        case 'invoice.payment_succeeded':
          return await this.handleStripeInvoiceSuccess(data);
          
        case 'customer.subscription.updated':
          return await this.handleStripeSubscriptionUpdate(data);
          
        default:
          console.log(`Unhandled Stripe event: ${eventType}`);
      }
    } catch (error) {
      console.error('Error processing Stripe webhook:', error);
      throw error;
    }
  }

  private async handleStripePaymentSuccess(paymentIntent: any) {
    const transaction = await prisma.paymentTransaction.findFirst({
      where: { stripePaymentIntentId: paymentIntent.id }
    });

    if (transaction) {
      const updatedTransaction = await prisma.paymentTransaction.update({
        where: { id: transaction.id },
        data: {
          status: 'completed',
          processedAt: new Date(),
          confirmedAt: new Date()
        }
      });

      // Real-time update
      this.realtime.broadcastToUser(transaction.userId, 'payment_confirmed', {
        transactionId: transaction.id,
        amount: transaction.amountUSD,
        status: 'completed'
      });

      return updatedTransaction;
    }
  }

  private async handleStripePaymentFailed(paymentIntent: any) {
    const transaction = await prisma.paymentTransaction.findFirst({
      where: { stripePaymentIntentId: paymentIntent.id }
    });

    if (transaction) {
      const updatedTransaction = await prisma.paymentTransaction.update({
        where: { id: transaction.id },
        data: {
          status: 'failed',
          failedAt: new Date(),
          failureReason: paymentIntent.last_payment_error?.message
        }
      });

      // Real-time update
      this.realtime.broadcastToUser(transaction.userId, 'payment_failed', {
        transactionId: transaction.id,
        error: paymentIntent.last_payment_error?.message
      });

      return updatedTransaction;
    }
  }

  // ============================================
  // CRYPTO PAYMENT PROCESSING (NOWPayments)
  // ============================================

  async processNowPaymentsWebhook(payload: any) {
    try {
      const {
        payment_id,
        payment_status,
        pay_address,
        pay_amount,
        pay_currency,
        price_amount,
        price_currency,
        actually_paid,
        outcome_amount,
        outcome
      } = payload;

      // Find or create transaction
      let transaction = await prisma.paymentTransaction.findFirst({
        where: { providerTransactionId: payment_id }
      });

      if (!transaction) {
        // Create new crypto transaction
        transaction = await prisma.paymentTransaction.create({
          data: {
            id: uuidv4(),
            userId: payload.order_id, // Assuming order_id contains user_id
            provider: 'nowpayments',
            amountUSD: parseFloat(price_amount),
            amountCrypto: parseFloat(actually_paid || pay_amount),
            cryptoCurrency: pay_currency.toUpperCase(),
            status: this.mapNowPaymentsStatus(payment_status),
            type: 'one_time',
            providerTransactionId: payment_id,
            walletAddress: pay_address,
            txHash: outcome?.hash,
            metadata: JSON.stringify(payload)
          }
        });
      } else {
        // Update existing transaction
        transaction = await prisma.paymentTransaction.update({
          where: { id: transaction.id },
          data: {
            status: this.mapNowPaymentsStatus(payment_status),
            amountCrypto: parseFloat(actually_paid || pay_amount),
            txHash: outcome?.hash,
            confirmations: outcome?.confirmations || 0,
            processedAt: payment_status === 'finished' ? new Date() : undefined,
            confirmedAt: payment_status === 'confirmed' ? new Date() : undefined,
            metadata: JSON.stringify(payload)
          }
        });
      }

      // Real-time updates
      this.realtime.broadcastToUser(transaction.userId, 'crypto_payment_update', {
        transactionId: transaction.id,
        status: transaction.status,
        txHash: transaction.txHash,
        confirmations: transaction.confirmations,
        amount: transaction.amountCrypto,
        currency: transaction.cryptoCurrency
      });

      return transaction;

    } catch (error) {
      console.error('Error processing NOWPayments webhook:', error);
      throw error;
    }
  }

  private mapNowPaymentsStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      'waiting': 'pending',
      'confirming': 'pending', 
      'confirmed': 'completed',
      'sending': 'pending',
      'partially_paid': 'pending',
      'finished': 'completed',
      'failed': 'failed',
      'refunded': 'refunded',
      'expired': 'failed'
    };
    return statusMap[status] || 'pending';
  }

  // ============================================
  // ALCHEMY PAY PROCESSING
  // ============================================

  async processAlchemyPayWebhook(payload: any) {
    try {
      // Alchemy Pay webhook processing
      const {
        merchantOrderNo,
        orderAmount,
        cryptoAmount,
        cryptoCurrency,
        status,
        txHash,
        network
      } = payload;

      let transaction = await prisma.paymentTransaction.findFirst({
        where: { providerTransactionId: merchantOrderNo }
      });

      if (transaction) {
        transaction = await prisma.paymentTransaction.update({
          where: { id: transaction.id },
          data: {
            status: this.mapAlchemyPayStatus(status),
            amountCrypto: parseFloat(cryptoAmount),
            txHash: txHash,
            processedAt: status === 'SUCCESS' ? new Date() : undefined,
            metadata: JSON.stringify(payload)
          }
        });

        // Real-time update
        this.realtime.broadcastToUser(transaction.userId, 'alchemy_payment_update', {
          transactionId: transaction.id,
          status: transaction.status,
          txHash: transaction.txHash,
          amount: transaction.amountCrypto,
          currency: transaction.cryptoCurrency
        });
      }

      return transaction;

    } catch (error) {
      console.error('Error processing Alchemy Pay webhook:', error);
      throw error;
    }
  }

  private mapAlchemyPayStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      'SUCCESS': 'completed',
      'PENDING': 'pending',
      'FAILED': 'failed',
      'CANCELLED': 'cancelled'
    };
    return statusMap[status] || 'pending';
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  async createPaymentPlan(planData: {
    name: string;
    description?: string;
    priceUSD: number;
    intervalMonths: number;
    features: string[];
  }) {
    try {
      // Create Stripe product and price
      const stripeProduct = await this.stripe.products.create({
        name: planData.name,
        description: planData.description,
      });

      const stripePrice = await this.stripe.prices.create({
        unit_amount: Math.round(planData.priceUSD * 100), // Convert to cents
        currency: 'usd',
        recurring: {
          interval: planData.intervalMonths === 1 ? 'month' : 'year',
        },
        product: stripeProduct.id,
      });

      // Create in database
      const plan = await prisma.paymentPlan.create({
        data: {
          id: uuidv4(),
          name: planData.name,
          description: planData.description,
          priceUSD: planData.priceUSD,
          intervalMonths: planData.intervalMonths,
          features: JSON.stringify(planData.features),
          stripePriceId: stripePrice.id,
        }
      });

      return plan;

    } catch (error) {
      console.error('Error creating payment plan:', error);
      throw error;
    }
  }

  async getUserSubscription(userId: string) {
    return await prisma.paymentSubscription.findFirst({
      where: { 
        userId, 
        status: 'active' 
      },
      include: {
        plan: true,
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });
  }

  async getPaymentHistory(userId: string, limit: number = 50) {
    return await prisma.paymentTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        subscription: {
          include: { plan: true }
        },
        paymentMethod: true
      }
    });
  }
}
