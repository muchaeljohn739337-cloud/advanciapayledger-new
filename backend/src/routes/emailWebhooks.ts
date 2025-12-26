import express from "express";
import crypto from "crypto";
import { logger } from "../utils/logger";

const router = express.Router();

/**
 * Postmark Webhook Handler
 * Handles delivery, bounce, spam, and other email events from Postmark
 */

interface PostmarkWebhookEvent {
  RecordType: "Delivery" | "Bounce" | "SpamComplaint" | "Open" | "Click";
  MessageID: string;
  Recipient: string;
  DeliveredAt?: string;
  BouncedAt?: string;
  Tag?: string;
  Description?: string;
  Type?: string;
  TypeCode?: number;
  Name?: string;
  Details?: string;
}

/**
 * Verify Postmark webhook signature
 */
function verifyPostmarkSignature(body: string, signature: string, secret: string): boolean {
  try {
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body, "utf8")
      .digest("base64");
    
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    console.error("Signature verification error:", error);
    return false;
  }
}

/**
 * Main Postmark webhook endpoint
 * POST /webhooks/postmark
 */
router.post("/postmark", express.raw({ type: "application/json" }), (req, res) => {
  try {
    const signature = req.headers["x-postmark-webhook-signature"] as string;
    const webhookSecret = process.env.WEBHOOK_SECRET;

    // Verify webhook signature if secret is configured
    if (webhookSecret && signature) {
      const isValid = verifyPostmarkSignature(req.body.toString(), signature, webhookSecret);
      if (!isValid) {
        console.error("[Postmark Webhook] Invalid signature");
        return res.status(401).json({ error: "Invalid signature" });
      }
    }

    const event: PostmarkWebhookEvent = JSON.parse(req.body.toString());
    
    console.log([Postmark Webhook] Received  event for );

    // Handle different event types
    switch (event.RecordType) {
      case "Delivery":
        handleDeliveryEvent(event);
        break;
      
      case "Bounce":
        handleBounceEvent(event);
        break;
      
      case "SpamComplaint":
        handleSpamComplaintEvent(event);
        break;
      
      case "Open":
        handleOpenEvent(event);
        break;
      
      case "Click":
        handleClickEvent(event);
        break;
      
      default:
        console.log([Postmark Webhook] Unhandled event type: );
    }

    res.status(200).json({ status: "success", processed: event.RecordType });
  } catch (error: any) {
    console.error("[Postmark Webhook] Error processing webhook:", error.message);
    res.status(400).json({ error: "Webhook processing failed" });
  }
});

/**
 * Handle successful email delivery
 */
function handleDeliveryEvent(event: PostmarkWebhookEvent) {
  console.log(✅ Email delivered successfully:
    - MessageID: 
    - Recipient: 
    - Delivered At: 
  );

  // Here you could update database with delivery status
  // Example: updateEmailStatus(event.MessageID, 'delivered', event.DeliveredAt);
}

/**
 * Handle email bounces
 */
function handleBounceEvent(event: PostmarkWebhookEvent) {
  console.error(❌ Email bounced:
    - MessageID: 
    - Recipient: 
    - Bounce Type:  ()
    - Description: 
    - Bounced At: 
  );

  // Handle bounces based on type
  if (event.TypeCode === 1) {
    // Hard bounce - remove from mailing list
    console.log(🚫 Hard bounce detected for  - should be removed from mailing list);
  } else {
    // Soft bounce - may retry
    console.log(⚠️ Soft bounce detected for  - may retry later);
  }

  // Update database with bounce status
  // Example: updateEmailStatus(event.MessageID, 'bounced', event.BouncedAt, event.Description);
}

/**
 * Handle spam complaints
 */
function handleSpamComplaintEvent(event: PostmarkWebhookEvent) {
  console.warn(⚠️ Spam complaint received:
    - MessageID: 
    - Recipient: 
    - Description: 
  );

  // Should immediately remove from mailing list
  console.log(🚫 Removing  from mailing list due to spam complaint);

  // Update database and suppress future emails
  // Example: suppressRecipient(event.Recipient, 'spam_complaint');
}

/**
 * Handle email opens (if tracking enabled)
 */
function handleOpenEvent(event: PostmarkWebhookEvent) {
  console.log(👀 Email opened:
    - MessageID: 
    - Recipient: 
  );

  // Track engagement
  // Example: trackEmailEngagement(event.MessageID, 'open');
}

/**
 * Handle link clicks (if tracking enabled)
 */
function handleClickEvent(event: PostmarkWebhookEvent) {
  console.log(🔗 Link clicked:
    - MessageID: 
    - Recipient: 
  );

  // Track engagement
  // Example: trackEmailEngagement(event.MessageID, 'click');
}

/**
 * Test endpoint for webhook configuration
 * GET /webhooks/postmark/test
 */
router.get("/postmark/test", (req, res) => {
  res.json({
    status: "active",
    message: "Postmark webhook endpoint is configured and ready",
    timestamp: new Date().toISOString()
  });
});

/**
 * Health check endpoint
 * GET /webhooks/health
 */
router.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "email-webhooks",
    provider: "postmark",
    timestamp: new Date().toISOString()
  });
});

export default router;
