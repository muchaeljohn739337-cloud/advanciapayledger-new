/**
 * IDEMPOTENCY MIDDLEWARE - Prevent duplicate financial operations
 * Uses Redis for fast lookups with 24h TTL
 */

import { Request, Response, NextFunction } from "express";
import { createClient } from "redis";
import { logger } from "../utils/logger";
import { canBypassIdempotency, getAdminContext } from "../utils/adminBypass";

const IDEMPOTENCY_TTL = 86400; // 24 hours in seconds
const IDEMPOTENCY_HEADER = "Idempotency-Key";
const IDEMPOTENCY_PREFIX = "idempotency:";

let redisClient: ReturnType<typeof createClient> | null = null;

// In-memory fallback when Redis is unavailable
const memoryStore = new Map<string, { response: any; timestamp: number }>();

async function getRedisClient() {
  if (!redisClient) {
    try {
      redisClient = createClient({ url: process.env.REDIS_URL });
      redisClient.on("error", (err) => {
        logger.warn("Redis idempotency client error, using memory fallback", err);
        redisClient = null;
      });
      await redisClient.connect();
    } catch (err) {
      logger.warn("Redis unavailable for idempotency, using memory fallback");
      redisClient = null;
    }
  }
  return redisClient;
}

function cleanupMemoryStore() {
  const now = Date.now();
  for (const [key, value] of memoryStore.entries()) {
    if (now - value.timestamp > IDEMPOTENCY_TTL * 1000) {
      memoryStore.delete(key);
    }
  }
}

setInterval(cleanupMemoryStore, 60000); // Cleanup every minute

export interface IdempotentRequest extends Request {
  idempotencyKey?: string;
  isReplay?: boolean;
}

/**
 * Idempotency middleware for financial endpoints.
 * Requires Idempotency-Key header for POST/PUT/DELETE requests.
 */
export function idempotency(options?: { required?: boolean }) {
  const required = options?.required ?? true;

  return async (req: IdempotentRequest, res: Response, next: NextFunction) => {
    // Only apply to mutating methods
    if (!["POST", "PUT", "DELETE", "PATCH"].includes(req.method)) {
      return next();
    }

    const idempotencyKey = req.headers[IDEMPOTENCY_HEADER.toLowerCase()] as string;

    if (!idempotencyKey) {
      if (required) {
        return res.status(400).json({
          error: "Missing Idempotency-Key header",
          message: "Financial operations require an Idempotency-Key header",
        });
      }
      return next();
    }

    // Validate key format (UUID or custom)
    if (idempotencyKey.length < 16 || idempotencyKey.length > 64) {
      return res.status(400).json({
        error: "Invalid Idempotency-Key",
        message: "Key must be 16-64 characters",
      });
    }

    const cacheKey = `${IDEMPOTENCY_PREFIX}${req.path}:${idempotencyKey}`;
    req.idempotencyKey = idempotencyKey;

    try {
      const redis = await getRedisClient();
      let cached: string | null = null;

      if (redis) {
        cached = await redis.get(cacheKey);
      } else {
        const memCached = memoryStore.get(cacheKey);
        if (memCached) {
          cached = JSON.stringify(memCached.response);
        }
      }

      if (cached) {
        req.isReplay = true;
        const cachedResponse = JSON.parse(cached);
        logger.info(`Idempotent replay: ${idempotencyKey}`);
        return res
          .status(cachedResponse.statusCode || 200)
          .set("Idempotency-Replay", "true")
          .json(cachedResponse.body);
      }

      // Intercept response to cache it
      const originalJson = res.json.bind(res);
      res.json = (body: any) => {
        const responseData = {
          statusCode: res.statusCode,
          body,
          timestamp: Date.now(),
        };

        // Cache the response
        (async () => {
          try {
            if (redis) {
              await redis.setEx(cacheKey, IDEMPOTENCY_TTL, JSON.stringify(responseData));
            } else {
              memoryStore.set(cacheKey, { response: responseData, timestamp: Date.now() });
            }
          } catch (err) {
            logger.error("Failed to cache idempotent response", err);
          }
        })();

        return originalJson(body);
      };

      next();
    } catch (err) {
      logger.error("Idempotency middleware error", err);
      next(); // Continue without idempotency on error
    }
  };
}

/**
 * Generate a unique idempotency key (client-side helper)
 */
export function generateIdempotencyKey(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

export default idempotency;
