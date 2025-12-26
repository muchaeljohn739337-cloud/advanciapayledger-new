/**
 * Email Queue Service
 * Production-grade email queue management with retry, priority, and rate limiting
 */

// COMPLETELY DISABLED - NO REDIS CONNECTIONS
import { Job, Queue, Worker } from "bullmq";
import IORedis from "ioredis";
import { logger } from "../utils/logger";

// Redis connection completely disabled
const redisConnection: IORedis | null = null;

// Email Queue Configuration (disabled - no Redis)
const emailQueue: Queue | null = null;

console.warn("⚠️ Email queue disabled - Redis completely disabled");

// Priority levels
export enum EmailPriority {
  CRITICAL = 1, // Security alerts, system failures
  HIGH = 2, // Important notifications
  NORMAL = 3, // Regular emails
  LOW = 4, // Marketing, newsletters
}

// Email Worker (disabled - no Redis)
const emailWorker: Worker | null = null;

console.warn("⚠️ Email worker disabled - Redis completely disabled");

// Export for access in index.ts
export { emailQueue, emailWorker };

/**
 * Queue email for sending
 */
export async function queueEmail(options: {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  template?: string;
  data?: any;
  priority?: EmailPriority;
  delay?: number; // Delay in milliseconds
}): Promise<Job> {
  // Redis disabled - send email directly
  const { to, subject, html, text, from, template, data } = options;

  logger.warn("⚠️ Email queue disabled - sending email directly");

  // Send email directly without queue
  const emailService = EmailService.getInstance();
  await emailService.send({
    to: Array.isArray(to) ? to : [to],
    subject,
    html,
    text,
    from,
    template,
    data,
  });

  // Return mock job
  return {
    id: `direct-${Date.now()}`,
    data: options,
    updateProgress: async () => {},
  } as Job;
}

/**
 * Get email queue statistics
 */
export async function getEmailQueueStats() {
  // Redis disabled - return empty stats
  return {
    waiting: 0,
    active: 0,
    completed: 0,
    failed: 0,
    delayed: 0,
    total: 0,
  };
}

/**
 * Retry failed email
 */
export async function retryFailedEmail(jobId: string) {
  // Redis disabled - do nothing
  logger.warn(`⚠️ Cannot retry email ${jobId} - Redis disabled`);
}

/**
 * Clean up old jobs
 */
export async function cleanupEmailQueue() {
  // Redis disabled - do nothing
  logger.warn("⚠️ Cannot cleanup email queue - Redis disabled");
}
