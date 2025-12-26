// COMPLETELY DISABLED - NO REDIS CONNECTIONS
import { Job, Queue, QueueEvents, Worker } from "bullmq";
import { logger } from "../utils/logger";

// Redis connection completely disabled
const redis: any = null;

console.warn("⚠️ JobService completely disabled - Redis disabled");

/**
 * JobService - Manages background jobs with BullMQ
 * COMPLETELY DISABLED - Redis not available
 */
class JobService {
  private static instance: JobService;
  private queues: Map<string, Queue> = new Map();
  private workers: Map<string, Worker> = new Map();
  private queueEvents: Map<string, QueueEvents> = new Map();

  private constructor() {
    logger.warn(" JobService disabled - Redis not available");
  }

  static getInstance(): JobService {
    if (!JobService.instance) {
      JobService.instance = new JobService();
    }
    return JobService.instance;
  }

  async initialize(): Promise<void> {
    logger.warn(" JobService initialization skipped - Redis disabled");
  }

  createQueue(name: string): Queue | null {
    logger.warn(` Cannot create queue "${name}" - Redis disabled`);
    return null;
  }

  createWorker(name: string, processor: (job: Job) => Promise<any>): Worker | null {
    logger.warn(` Cannot create worker "${name}" - Redis disabled`);
    return null;
  }

  async addJob<T = any>(
    type: string,
    data: any,
    options: any = {},
    queueName: string = "default"
  ): Promise<Job<T> | null> {
    logger.warn(` Cannot add job to queue "${queueName}" - Redis disabled`);
    return null;
  }

  async getQueueStats(queueName: string): Promise<any> {
    return {
      waiting: 0,
      active: 0,
      completed: 0,
      failed: 0,
      delayed: 0,
      total: 0,
    };
  }

  async shutdown(): Promise<void> {
    logger.warn(" JobService shutdown - Redis disabled");
  }

  async scheduleJob(
    type: string,
    cronPattern: string,
    data: any,
    jobName: string,
    queueName: string = "default"
  ): Promise<void> {
    logger.warn(` Cannot schedule job "${jobName}" - Redis disabled`);
  }

  private setupQueueEvents(queue: Queue, queueEvents: QueueEvents) {
    // No-op
  }
}

export type JobType =
  | "PROCESS_TRANSACTION"
  | "SEND_EMAIL"
  | "GENERATE_REPORT"
  | "CLEANUP_JOBS"
  | "SEND_NOTIFICATION"
  | "PROCESS_WITHDRAWAL"
  | "UPDATE_EXCHANGE_RATES"
  | string;

export interface JobData {
  [key: string]: any;
}

export interface JobOptions {
  priority?: number;
  delay?: number;
  attempts?: number;
  backoff?: {
    type: "exponential" | "fixed";
    delay: number;
  };
}

// Singleton export
export const jobService = JobService.getInstance();

// Graceful shutdown
const shutdown = async () => {
  logger.info("Received shutdown signal. Shutting down job service...");
  await jobService.shutdown();
  process.exit(0);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

export default jobService;
