/**
 * AUTO-THROTTLE MIDDLEWARE
 * Prevents system overheating
 */

import { Request, Response, NextFunction } from 'express';
import { systemMonitor } from '../system/healthMonitor';

export class RequestThrottler {
  private requestQueue: Array<() => void> = [];
  private processing = false;
  private readonly COOLING_DELAY = 1000;
  private readonly MAX_QUEUE_SIZE = 100;

  async throttle(req: Request, res: Response, next: NextFunction): Promise<void> {
    const health = systemMonitor.getSystemHealth();

    if (health.status === 'critical' || health.status === 'cooling') {
      if (this.requestQueue.length >= this.MAX_QUEUE_SIZE) {
        return res.status(503).json({
          error: 'System cooling down',
          message: 'Server is under high load. Please try again in a moment.',
        });
      }
      this.requestQueue.push(() => next());
      this.processQueue();
    } else if (health.status === 'warning') {
      await this.delay(200);
      next();
    } else {
      next();
    }
  }

  private async processQueue(): Promise<void> {
    if (this.processing) return;
    this.processing = true;

    while (this.requestQueue.length > 0) {
      const health = systemMonitor.getSystemHealth();
      if (health.status === 'critical') {
        await this.delay(this.COOLING_DELAY * 2);
        continue;
      }
      if (health.status === 'cooling') {
        await this.delay(this.COOLING_DELAY);
      }
      const next = this.requestQueue.shift();
      if (next) next();
      await this.delay(100);
    }
    this.processing = false;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const requestThrottler = new RequestThrottler();
export const autoThrottle = (req: Request, res: Response, next: NextFunction) => {
  requestThrottler.throttle(req, res, next);
};
