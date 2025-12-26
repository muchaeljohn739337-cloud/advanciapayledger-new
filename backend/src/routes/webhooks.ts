import express from 'express';
import crypto from 'crypto';
import { PaymentService } from '../services/PaymentService';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const paymentService = new PaymentService();
const prisma = new PrismaClient();

// ============================================
// STRIPE WEBHOOKS
// ============================================

router.post('/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'] as string;
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;
    
    let event;
    
    try {
      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY!);
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err: any) {
      console.error('Stripe webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Log webhook event
    await prisma.webhookEvent.create({
      data: {
        id: require('uuid').v4(),
        provider: 'stripe',
        eventType: event.type,
        eventId: event.id,
        payload: JSON.stringify(event),
        signature: sig,
        processed: false
      }
    });

    console.log('Stripe webhook event received:', event.type);

    // Process the event
    try {
      await paymentService.processStripeWebhook(event.type, event.data.object);
      
      // Mark as processed
      await prisma.webhookEvent.updateMany({
        where: { eventId: event.id, provider: 'stripe' },
        data: { 
          processed: true, 
          processedAt: new Date(),
          processingResult: 'success'
        }
      });

      res.status(200).json({ received: true });

    } catch (error: any) {
      console.error('Error processing Stripe webhook:', error);
      
      // Mark as failed
      await prisma.webhookEvent.updateMany({
        where: { eventId: event.id, provider: 'stripe' },
        data: { 
          processed: true, 
          processedAt: new Date(),
          processingResult: 'error',
          errorMessage: error.message
        }
      });

      res.status(500).json({ error: 'Webhook processing failed' });
    }

  } catch (error) {
    console.error('Stripe webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================
// NOWPAYMENTS WEBHOOKS
// ============================================

router.post('/nowpayments', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const rawPayload = req.body.toString('utf8');
    const payload = JSON.parse(rawPayload);
    const signature = req.headers['x-nowpayments-sig'] as string;
    
    // Verify NOWPayments signature
    // Import secure NOWPayments service
    const { nowPaymentsService } = await import('../services/nowPaymentsService');
    
    // Verify signature using timing-safe comparison
    if (!nowPaymentsService.verifyWebhookSignature(rawPayload, signature)) {
      console.error('NOWPayments webhook signature verification failed');
      return res.status(400).json({ error: 'Invalid signature' });
    });
    }

    // Log webhook event
    const webhookEvent = await prisma.webhookEvent.create({
      data: {
        id: require('uuid').v4(),
        provider: 'nowpayments',
        eventType: 'payment_update',
        eventId: payload.payment_id,
        payload: JSON.stringify(payload),
        signature: signature,
        processed: false
      }
    });

    console.log('NOWPayments webhook received:', payload.payment_status);

    try {
      await paymentService.processNowPaymentsWebhook(payload);
      
      // Mark as processed
      await prisma.webhookEvent.update({
        where: { id: webhookEvent.id },
        data: { 
          processed: true, 
          processedAt: new Date(),
          processingResult: 'success'
        }
      });

      res.status(200).json({ received: true });

    } catch (error: any) {
      console.error('Error processing NOWPayments webhook:', error);
      
      // Mark as failed
      await prisma.webhookEvent.update({
        where: { id: webhookEvent.id },
        data: { 
          processed: true, 
          processedAt: new Date(),
          processingResult: 'error',
          errorMessage: error.message
        }
      });

      res.status(500).json({ error: 'Webhook processing failed' });
    }

  } catch (error) {
    console.error('NOWPayments webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================
// ALCHEMY PAY WEBHOOKS
// ============================================

router.post('/alchemy-pay', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const rawPayload = req.body.toString('utf8');
    const payload = JSON.parse(rawPayload);
    const signature = req.headers['signature'] as string;
    
    // Verify Alchemy Pay signature
    const secret = process.env.ALCHEMY_PAY_SECRET!;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');

    if (signature !== expectedSignature) {
      console.error('Alchemy Pay webhook signature verification failed');
      return res.status(400).json({ error: 'Invalid signature' });
    }

    // Log webhook event
    const webhookEvent = await prisma.webhookEvent.create({
      data: {
        id: require('uuid').v4(),
        provider: 'alchemy_pay',
        eventType: 'payment_update',
        eventId: payload.merchantOrderNo,
        payload: JSON.stringify(payload),
        signature: signature,
        processed: false
      }
    });

    console.log('Alchemy Pay webhook received:', payload.status);

    try {
      await paymentService.processAlchemyPayWebhook(payload);
      
      // Mark as processed
      await prisma.webhookEvent.update({
        where: { id: webhookEvent.id },
        data: { 
          processed: true, 
          processedAt: new Date(),
          processingResult: 'success'
        }
      });

      res.status(200).json({ received: true });

    } catch (error: any) {
      console.error('Error processing Alchemy Pay webhook:', error);
      
      // Mark as failed
      await prisma.webhookEvent.update({
        where: { id: webhookEvent.id },
        data: { 
          processed: true, 
          processedAt: new Date(),
          processingResult: 'error',
          errorMessage: error.message
        }
      });

      res.status(500).json({ error: 'Webhook processing failed' });
    }

  } catch (error) {
    console.error('Alchemy Pay webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================
// WEBHOOK STATUS AND RETRY ENDPOINTS
// ============================================

router.get('/status', async (req, res) => {
  try {
    const recentEvents = await prisma.webhookEvent.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: {
        provider: true,
        eventType: true,
        processed: true,
        processingResult: true,
        createdAt: true,
        retryCount: true
      }
    });

    const stats = {
      total: recentEvents.length,
      processed: recentEvents.filter(e => e.processed).length,
      failed: recentEvents.filter(e => e.processingResult === 'error').length,
      byProvider: {
        stripe: recentEvents.filter(e => e.provider === 'stripe').length,
        nowpayments: recentEvents.filter(e => e.provider === 'nowpayments').length,
        alchemy_pay: recentEvents.filter(e => e.provider === 'alchemy_pay').length
      }
    };

    res.json({ stats, recentEvents });

  } catch (error) {
    console.error('Error fetching webhook status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Retry failed webhooks
router.post('/retry/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    
    const webhookEvent = await prisma.webhookEvent.findUnique({
      where: { id: eventId }
    });

    if (!webhookEvent) {
      return res.status(404).json({ error: 'Webhook event not found' });
    }

    if (webhookEvent.retryCount >= webhookEvent.maxRetries) {
      return res.status(400).json({ error: 'Maximum retry attempts reached' });
    }

    // Increment retry count
    await prisma.webhookEvent.update({
      where: { id: eventId },
      data: { 
        retryCount: webhookEvent.retryCount + 1,
        processed: false,
        processingResult: null,
        errorMessage: null
      }
    });

    // Retry processing based on provider
    try {
      const payload = JSON.parse(webhookEvent.payload);
      
      switch (webhookEvent.provider) {
        case 'stripe':
          await paymentService.processStripeWebhook(webhookEvent.eventType, payload.data.object);
          break;
        case 'nowpayments':
          await paymentService.processNowPaymentsWebhook(payload);
          break;
        case 'alchemy_pay':
          await paymentService.processAlchemyPayWebhook(payload);
          break;
        default:
          throw new Error(`Unknown provider: ${webhookEvent.provider}`);
      }

      // Mark as successfully processed
      await prisma.webhookEvent.update({
        where: { id: eventId },
        data: { 
          processed: true,
          processedAt: new Date(),
          processingResult: 'success'
        }
      });

      res.json({ success: true, message: 'Webhook retried successfully' });

    } catch (error: any) {
      console.error('Webhook retry failed:', error);
      
      // Mark retry as failed
      await prisma.webhookEvent.update({
        where: { id: eventId },
        data: { 
          processed: true,
          processedAt: new Date(),
          processingResult: 'error',
          errorMessage: error.message
        }
      });

      res.status(500).json({ error: 'Webhook retry failed', details: error.message });
    }

  } catch (error) {
    console.error('Error retrying webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;


