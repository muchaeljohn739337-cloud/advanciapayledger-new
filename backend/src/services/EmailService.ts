import { ServerClient } from "postmark";
import nodemailer, { Transporter } from "nodemailer";
import prisma from "../prismaClient";
import { logger } from "../utils/logger";

interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

interface EmailOptions {
  to: string | string[];
  template: string;
  data: Record<string, any>;
  from?: string;
  replyTo?: string;
}

/**
 * EmailService - Unified email sending service
 * Primary: Postmark for production transactional emails (superior delivery)
 * Fallback: Nodemailer/SMTP for development/backup
 */
export class EmailService {
  private static instance: EmailService;
  private postmarkClient: ServerClient | null = null;
  private postmarkConfigured: boolean = false;
  private smtpClient: Transporter | null = null;
  private defaultFrom: string = process.env.EMAIL_FROM || "noreply@advanciapayledger.com";

  private constructor() {
    this.initializePostmark();
    this.initializeNodemailer();
  }

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  /**
   * Initialize Postmark (primary email service)
   */
  private initializePostmark(): void {
    const apiKey = process.env.POSTMARK_API_KEY;

    if (apiKey && apiKey.length > 0) {
      try {
        this.postmarkClient = new ServerClient(apiKey);
        this.postmarkConfigured = true;
        console.log("[EmailService] ✅ Postmark configured as primary email provider");
      } catch (error) {
        console.error("[EmailService] ❌ Postmark configuration failed:", error);
        this.postmarkConfigured = false;
      }
    } else {
      console.warn("[EmailService] ⚠️  Postmark API key not found, using SMTP fallback");
      this.postmarkConfigured = false;
    }
  }

  /**
   * Initialize Nodemailer (fallback SMTP service)
   */
  private initializeNodemailer(): void {
    const smtpHost = process.env.SMTP_HOST; console.log("[EmailService] DEBUG SMTP_HOST:", smtpHost, "SMTP_USER:", process.env.SMTP_USER);
    const smtpPort = parseInt(process.env.SMTP_PORT || "587", 10);
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (smtpHost && smtpUser && smtpPass) {
      try {
        this.smtpClient = nodemailer.createTransporter({
          host: smtpHost,
          port: smtpPort,
          secure: smtpPort === 465,
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
        });
        console.log("[EmailService] ✅ Nodemailer (SMTP) configured as fallback");
      } catch (error) {
        console.error("[EmailService] ❌ Nodemailer configuration failed:", error);
        this.smtpClient = null;
      }
    } else {
      console.warn("[EmailService] ⚠️  SMTP credentials not found, no fallback available");
    }
  }

  /**
   * Send email using Postmark (primary method)
   */
  private async sendViaPostmark(options: EmailOptions, template: EmailTemplate): Promise<boolean> {
    if (!this.postmarkClient || !this.postmarkConfigured) {
      throw new Error("Postmark not configured");
    }

    try {
      const recipients = Array.isArray(options.to) ? options.to.join(", ") : options.to;
      
      const response = await this.postmarkClient.sendEmail({
        From: options.from || this.defaultFrom,
        To: recipients,
        ReplyTo: options.replyTo || process.env.EMAIL_REPLY_TO,
        Subject: template.subject,
        HtmlBody: template.html,
        TextBody: template.text || this.generateTextFromHtml(template.html),
        MessageStream: "outbound" // Postmark message stream
      });

      console.log("[EmailService] ✅ Email sent via Postmark");
      return true;
    } catch (error: any) {
      console.error("[EmailService] Postmark error:", error.message);
      throw error;
    }
  }

  /**
   * Send email using Nodemailer (fallback method)
   */
  private async sendViaNodemailer(options: EmailOptions, template: EmailTemplate): Promise<boolean> {
    if (!this.smtpClient) {
      throw new Error("Nodemailer not configured");
    }

    try {
      const recipients = Array.isArray(options.to) ? options.to.join(", ") : options.to;

      const info = await this.smtpClient.sendMail({
        from: options.from || this.defaultFrom,
        to: recipients,
        replyTo: options.replyTo || process.env.EMAIL_REPLY_TO,
        subject: template.subject,
        html: template.html,
        text: template.text || this.generateTextFromHtml(template.html),
      });

      console.log("[EmailService] ✅ Email sent via SMTP");
      return true;
    } catch (error: any) {
      console.error("[EmailService] SMTP error:", error.message);
      throw error;
    }
  }

  /**
   * Send email with automatic fallback
   * Tries Postmark first, falls back to SMTP on failure
   */
  public async send(options: EmailOptions): Promise<boolean> {
    try {
      // Load and render template
      const template = await this.loadTemplate(options.template, options.data);

      // Try Postmark first (primary)
      if (this.postmarkConfigured) {
        try {
          return await this.sendViaPostmark(options, template);
        } catch (postmarkError) {
          console.warn("[EmailService] Postmark failed, trying SMTP fallback...");

          // Fallback to SMTP if Postmark fails
          if (this.smtpClient) {
            return await this.sendViaNodemailer(options, template);
          }
          throw postmarkError;
        }
      }

      // Use SMTP if Postmark not configured
      if (this.smtpClient) {
        return await this.sendViaNodemailer(options, template);
      }

      // No email service available
      console.error("[EmailService] ❌ No email service configured");

      // In development, log email instead of failing
      if (process.env.NODE_ENV === "development") {
        console.log("[EmailService] 📧 [DEV MODE] Email would be sent:");
        console.log("To: " + options.to);
        console.log("Template: " + options.template);
        console.log("Subject: " + template.subject);
        console.log("---");
        return true;
      }

      throw new Error("No email service available");
    } catch (error) {
      console.error("[EmailService] ❌ Failed to send email:", error);
      await this.logFailedEmail(options, error);
      throw error;
    }
  }

  /**
   * Test email configuration
   */
  public async testConfiguration(): Promise<{ postmark: boolean; smtp: boolean }> {
    return {
      postmark: this.postmarkConfigured,
      smtp: this.smtpClient !== null,
    };
  }

  /**
   * Generate plain text from HTML
   */
  private generateTextFromHtml(html: string): string {
    return html
      .replace(/<[^>]*>/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  /**
   * Load and render email template
   */
  private async loadTemplate(templateName: string, data: Record<string, any>): Promise<EmailTemplate> {
    try {
      const fs = await import("fs");
      const path = await import("path");

      const templatePath = path.join(__dirname, "..", "templates", "emails", `${templateName}.html`);
      
      if (!fs.existsSync(templatePath)) {
        // Return basic template if file doesn't exist
        return {
          subject: data.subject || "Notification from Advancia Pay",
          html: 
            `<html>
              <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #004aad;">Advancia Pay Ledger</h2>
                <div></div>
                <br>
                <p style="color: #666; font-size: 12px;">
                  Thank you,<br>The Advancia Pay Team
                </p>
              </body>
            </html>`
          
        };
      }

      let html = fs.readFileSync(templatePath, "utf-8");
      
      // Replace variables
      Object.entries(data).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, "g");
        html = html.replace(regex, String(value));
      });

      // Extract subject from HTML or use default
      const subjectMatch = html.match(/<title>(.*?)<\/title>/i);
      const subject = subjectMatch ? subjectMatch[1] : (data.subject || "Notification from Advancia Pay");

      return { subject, html };
    } catch (error) {
      logger?.error("Template loading error:", error);
      
      // Fallback basic template
      return {
        subject: data.subject || "Notification from Advancia Pay",
        html: 
          `<html>
            <body style="font-family: Arial, sans-serif;">
              <h2>Advancia Pay Ledger</h2>
              <p></p>
            </body>
          </html>`
        
      };
    }
  }

  /**
   * Log failed email attempts
   */
  private async logFailedEmail(options: EmailOptions, error: any): Promise<void> {
    try {
      console.error("[EmailService] Failed to send email to " + options.to + ": " + error.message);
    } catch (logError) {
      console.error("[EmailService] Failed to log email error:", logError);
    }
  }

  // Convenience methods for common email types
  public async sendWelcomeEmail(to: string, userData: { name: string; email: string }) {
    return this.send({
      to,
      template: "welcome",
      data: {
        name: userData.name,
        email: userData.email,
        loginUrl: `${process.env.FRONTEND_URL}/login`,
        dashboardUrl: `${process.env.FRONTEND_URL}/dashboard`
      }
    });
  }

  public async sendPaymentConfirmation(to: string, paymentData: { amount: number; currency: string; transactionId: string }) {
    return this.send({
      to,
      template: "payment_confirmation",
      data: {
        amount: paymentData.amount,
        currency: paymentData.currency,
        transactionId: paymentData.transactionId,
        date: new Date().toLocaleDateString(),
        dashboardUrl: `${process.env.FRONTEND_URL}/dashboard`
      }
    });
  }

  public async sendPaymentFailure(to: string, failureData: { amount: number; currency: string; reason: string }) {
    return this.send({
      to,
      template: "payment_failed",
      data: {
        amount: failureData.amount,
        currency: failureData.currency,
        reason: failureData.reason,
        retryUrl: `${process.env.FRONTEND_URL}/payments`,
        supportUrl: `${process.env.FRONTEND_URL}/support`
      }
    });
  }

  public async sendWithdrawalConfirmation(to: string, withdrawalData: { amount: number; currency: string; status: string; referenceId: string }) {
    return this.send({
      to,
      template: "withdrawal_confirmation",
      data: {
        amount: withdrawalData.amount,
        currency: withdrawalData.currency,
        status: withdrawalData.status,
        referenceId: withdrawalData.referenceId,
        dashboardUrl: `${process.env.FRONTEND_URL}/dashboard`
      }
    });
  }
}

// Export singleton
export const emailService = EmailService.getInstance();

/**
 * Send generic notification email
 */
export async function sendNotificationEmail(to: string, subject: string, message: string): Promise<boolean> {
  try {
    return await emailService.send({
      to,
      template: 'notification',
      data: {
        subject,
        message,
        dashboardUrl: `${process.env.FRONTEND_URL}/dashboard`
      }
    });
  } catch (error) {
    logger.error('[EmailService] Failed to send notification email:', error);
    return false;
  }
}
