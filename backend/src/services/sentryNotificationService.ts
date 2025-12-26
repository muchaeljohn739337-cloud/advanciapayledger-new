/**
 * Sentry DSN Notification Service
 * Sends notifications when Sentry errors occur
 */

import * as Sentry from "@sentry/node";
import { logger } from "../utils/logger";
import { EmailPriority, queueEmail } from "./emailQueueService";

interface SentryError {
  id: string;
  title: string;
  level: string;
  timestamp: Date;
  url: string;
  user?: {
    id?: string;
    email?: string;
  };
}

class SentryNotificationService {
  private lastNotificationTime = new Map<string, number>();
  private readonly NOTIFICATION_COOLDOWN = 3600000; // 1 hour

  /**
   * Initialize Sentry with notification hooks
   */
  init() {
    if (!process.env.SENTRY_DSN) {
      logger.warn("Sentry DSN not configured, notifications disabled");
      return;
    }

    // Hook into Sentry events
    Sentry.addEventProcessor((event) => {
      this.handleSentryEvent(event);
      return event;
    });

    logger.info("✅ Sentry notification service initialized");
  }

  /**
   * Handle Sentry event
   */
  private async handleSentryEvent(event: Sentry.Event) {
    try {
      // Only notify for errors, not warnings/info
      if (event.level !== "error" && event.level !== "fatal") {
        return;
      }

      const errorId = event.event_id || "unknown";
      const now = Date.now();
      const lastNotified = this.lastNotificationTime.get(errorId) || 0;

      // Rate limiting: don't notify more than once per hour for same error
      if (now - lastNotified < this.NOTIFICATION_COOLDOWN) {
        return;
      }

      this.lastNotificationTime.set(errorId, now);

      // Send notification
      await this.sendNotification({
        id: errorId,
        title: event.message || "Sentry Error",
        level: event.level || "error",
        timestamp: new Date(event.timestamp * 1000),
        url: `https://sentry.io/organizations/advancia/issues/${errorId}/`,
        user: event.user,
      });
    } catch (error) {
      logger.error("Failed to handle Sentry event:", error);
    }
  }

  /**
   * Send notification about Sentry error
   */
  private async sendNotification(error: SentryError) {
    try {
      const adminEmail = process.env.ADMIN_EMAIL || "admin@advanciapayledger.com";

      const subject = `🚨 Sentry Error: ${error.title}`;
      const html = `
        <h2>Sentry Error Detected</h2>
        <p><strong>Error ID:</strong> ${error.id}</p>
        <p><strong>Level:</strong> ${error.level}</p>
        <p><strong>Time:</strong> ${error.timestamp.toISOString()}</p>
        <p><strong>User:</strong> ${error.user?.email || error.user?.id || "Unknown"}</p>
        <p><a href="${error.url}">View in Sentry</a></p>
      `;

      await queueEmail({
        to: adminEmail,
        subject,
        html,
        priority: EmailPriority.CRITICAL,
      });

      logger.info(`📧 Sentry notification sent for error: ${error.id}`);
    } catch (error) {
      logger.error("Failed to send Sentry notification:", error);
    }
  }

  /**
   * Manually send notification for critical error
   */
  async notifyCriticalError(error: Error, context?: any) {
    try {
      const adminEmail = process.env.ADMIN_EMAIL || "admin@advanciapayledger.com";

      const subject = `🚨 Critical Error: ${error.message}`;
      const html = `
        <h2>Critical Error Detected</h2>
        <p><strong>Message:</strong> ${error.message}</p>
        <p><strong>Stack:</strong></p>
        <pre>${error.stack || "No stack trace"}</pre>
        ${context ? `<p><strong>Context:</strong></p><pre>${JSON.stringify(context, null, 2)}</pre>` : ""}
      `;

      await queueEmail({
        to: adminEmail,
        subject,
        html,
        priority: EmailPriority.CRITICAL,
      });

      logger.info("📧 Critical error notification sent");
    } catch (err) {
      logger.error("Failed to send critical error notification:", err);
    }
  }
}

export const sentryNotificationService = new SentryNotificationService();
