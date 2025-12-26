// COMPLETELY DISABLED - NO REDIS CONNECTIONS
import Redis from "ioredis";

// Redis completely disabled for local development
const redis: Redis | null = null;

export function getRedis(): Redis | null {
  // ALWAYS RETURN NULL - Redis completely disabled
  return null;
}

console.warn("⚠️ Redis completely disabled - all Redis features disabled");
