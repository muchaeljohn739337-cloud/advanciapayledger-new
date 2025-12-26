/**
 * SMS Pool Service
 * Replaces Twilio with SMS Pool API for SMS sending
 */

import axios from "axios";
import { logger } from "../utils/logger";

interface SMSPoolConfig {
  apiKey: string;
  serviceId?: string;
  baseUrl?: string;
}

class SMSPoolService {
  private apiKey: string;
  private serviceId: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.SMSPOOL_API_KEY || "";
    this.serviceId = process.env.SMSPOOL_SERVICE_ID || "1";
    this.baseUrl = process.env.SMSPOOL_BASE_URL || "https://api.smspool.net";
  }

  /**
   * Check if SMS Pool is configured
   */
  isEnabled(): boolean {
    return !!this.apiKey;
  }

  /**
   * Send SMS via SMS Pool
   */
  async sendSMS(to: string, message: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.isEnabled()) {
      logger.warn("SMS Pool not configured, SMS sending disabled");
      return { success: false, error: "SMS Pool not configured" };
    }

    try {
      // SMS Pool API endpoint for sending SMS
      const response = await axios.post(
        `${this.baseUrl}/sms/send`,
        {
          api_key: this.apiKey,
          service_id: this.serviceId,
          to,
          message,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 10000, // 10 seconds
        }
      );

      if (response.data.status === "success" || response.data.success) {
        logger.info(`📱 SMS sent via SMS Pool to ${to}`);
        return {
          success: true,
          messageId: response.data.message_id || response.data.id,
        };
      }

      return {
        success: false,
        error: response.data.message || "Unknown error",
      };
    } catch (error: any) {
      logger.error("SMS Pool send error:", error);
      return {
        success: false,
        error: error.message || "Failed to send SMS",
      };
    }
  }

  /**
   * Get account balance
   */
  async getBalance(): Promise<{ balance?: number; error?: string }> {
    if (!this.isEnabled()) {
      return { error: "SMS Pool not configured" };
    }

    try {
      const response = await axios.get(`${this.baseUrl}/balance`, {
        params: {
          api_key: this.apiKey,
        },
        timeout: 5000,
      });

      if (response.data.balance !== undefined) {
        return { balance: response.data.balance };
      }

      return { error: "Failed to get balance" };
    } catch (error: any) {
      logger.error("SMS Pool balance error:", error);
      return { error: error.message || "Failed to get balance" };
    }
  }
}

export const smsPoolService = new SMSPoolService();
