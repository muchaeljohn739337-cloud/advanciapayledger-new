import crypto from 'crypto';
import axios from 'axios';

export interface CreateOrderParams {
  price_amount: number;
  price_currency: string;
  pay_currency: string;
  order_id: string;
  order_description: string;
  ipn_callback_url: string;
  success_url: string;
  cancel_url: string;
}

export interface PaymentStatus {
  payment_id: string;
  payment_status: string;
  pay_address: string;
  pay_amount: number;
  pay_currency: string;
  price_amount: number;
  price_currency: string;
  actually_paid?: number;
  outcome_amount?: number;
  outcome?: {
    hash: string;
    confirmations: number;
  };
}

export class NowPaymentsService {
  private apiKey: string;
  private ipnSecret: string;
  private baseUrl = 'https://api.nowpayments.io/v1';

  constructor() {
    this.apiKey = process.env.NOWPAYMENTS_API_KEY!;
    this.ipnSecret = process.env.NOWPAYMENTS_IPN_SECRET!;
    
    if (!this.apiKey || !this.ipnSecret) {
      throw new Error('NOWPayments API key and IPN secret are required');
    }
  }

  /**
   * Create a new payment order
   * @param params - Payment creation parameters
   * @returns Payment order response
   */
  async createPayment(params: CreateOrderParams) {
    try {
      console.log('Creating NOWPayments order:', params.order_id);
      
      const response = await axios.post(
        + "" + {this.baseUrl}/payment+ "" + ,
        params,
        {
          headers: {
            'x-api-key': this.apiKey,
            'Content-Type': 'application/json'
          },
          timeout: 30000 // 30 second timeout
        }
      );
      
      console.log('NOWPayments order created successfully:', response.data.payment_id);
      return response.data;
      
    } catch (error: any) {
      console.error('NOWPayments API error:', error.response?.data || error.message);
      
      if (error.response?.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      
      if (error.response?.status >= 500) {
        throw new Error('NOWPayments service temporarily unavailable.');
      }
      
      throw new Error(+ "" + NOWPayments API error: + "$" + {error.response?.data?.message || error.message}+ "" + );
    }
  }

  /**
   * Verify webhook signature using timing-safe comparison
   * @param payload - Raw payload string
   * @param signature - Signature from x-nowpayments-sig header
   * @returns True if signature is valid
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    try {
      if (!signature || !payload) {
        console.error('Missing signature or payload');
        return false;
      }

      const expectedSignature = crypto
        .createHmac('sha512', this.ipnSecret)
        .update(payload, 'utf8')
        .digest('hex');
      
      // Use timing-safe comparison to prevent timing attacks
      const signatureBuffer = Buffer.from(signature, 'hex');
      const expectedBuffer = Buffer.from(expectedSignature, 'hex');
      
      if (signatureBuffer.length !== expectedBuffer.length) {
        console.error('Signature length mismatch');
        return false;
      }
      
      return crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
      
    } catch (error) {
      console.error('Signature verification error:', error);
      return false;
    }
  }

  /**
   * Get payment status by payment ID
   * @param paymentId - NOWPayments payment ID
   * @returns Payment status information
   */
  async getPaymentStatus(paymentId: string): Promise<PaymentStatus> {
    try {
      const response = await axios.get(
        + "" + {this.baseUrl}/payment/+ "$" + {paymentId}+ "" + ,
        {
          headers: { 'x-api-key': this.apiKey },
          timeout: 15000 // 15 second timeout
        }
      );
      return response.data;
      
    } catch (error: any) {
      console.error('Payment status check error:', error.response?.data || error.message);
      throw new Error(+ "" + Payment status check error: + "$" + {error.response?.data?.message || error.message}+ "" + );
    }
  }

  /**
   * Get list of available currencies
   * @returns Array of supported cryptocurrencies
   */
  async getAvailableCurrencies() {
    try {
      const response = await axios.get(
        + "" + {this.baseUrl}/currencies+ "" + ,
        {
          headers: { 'x-api-key': this.apiKey },
          timeout: 15000
        }
      );
      return response.data.currencies;
      
    } catch (error: any) {
      console.error('Currency list error:', error.response?.data || error.message);
      throw new Error(+ "" + Currency list error: + "$" + {error.response?.data?.message || error.message}+ "" + );
    }
  }

  /**
   * Get estimated exchange rate
   * @param fromCurrency - Source currency (USD, EUR, etc.)
   * @param toCurrency - Target cryptocurrency
   * @param amount - Amount to convert
   * @returns Estimated exchange rate and amount
   */
  async getEstimate(fromCurrency: string, toCurrency: string, amount: number) {
    try {
      const response = await axios.get(
        + "" + {this.baseUrl}/estimate+ "" + ,
        {
          params: {
            amount,
            currency_from: fromCurrency.toLowerCase(),
            currency_to: toCurrency.toLowerCase()
          },
          headers: { 'x-api-key': this.apiKey },
          timeout: 15000
        }
      );
      return response.data;
      
    } catch (error: any) {
      console.error('Exchange rate estimate error:', error.response?.data || error.message);
      throw new Error(+ "" + Exchange rate estimate error: + "$" + {error.response?.data?.message || error.message}+ "" + );
    }
  }

  /**
   * Create payment URL for redirect
   * @param paymentId - NOWPayments payment ID
   * @returns Payment URL for user redirect
   */
  getPaymentUrl(paymentId: string): string {
    return + "" + https://nowpayments.io/payment/?iid=+ "$" + {paymentId}+ "" + ;
  }

  /**
   * Map NOWPayments status to internal status
   * @param status - NOWPayments status
   * @returns Normalized status
   */
  mapPaymentStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      'waiting': 'pending',
      'confirming': 'confirming', 
      'confirmed': 'confirmed',
      'sending': 'processing',
      'partially_paid': 'partial',
      'finished': 'completed',
      'failed': 'failed',
      'refunded': 'refunded',
      'expired': 'expired'
    };
    return statusMap[status] || 'unknown';
  }

  /**
   * Check if payment is final (completed or failed)
   * @param status - Payment status
   * @returns True if payment is in final state
   */
  isFinalStatus(status: string): boolean {
    return ['finished', 'failed', 'refunded', 'expired'].includes(status);
  }
}

// Export singleton instance
export const nowPaymentsService = new NowPaymentsService();
