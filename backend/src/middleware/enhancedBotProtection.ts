/**
 * Enhanced Bot Attack Protection
 * Advanced bot detection and mitigation
 */

import crypto from "crypto";
import { NextFunction, Request, Response } from "express";
import prisma from "../prismaClient";
import { detectBot } from "../services/botDetection";
import { logger } from "../utils/logger";

class EnhancedBotProtectionService {
  private attackCounters = new Map<string, number>();
  private blockedIPs = new Set<string>();
  private readonly MAX_ATTEMPTS = 5;
  private readonly BLOCK_DURATION = 3600000; // 1 hour

  /**
   * Detect bot attacks
   */
  async detectBotAttack(req: Request): Promise<{
    isAttack: boolean;
    confidence: number;
    attackType: string;
  }> {
    const ip = this.getClientIP(req);

    // Use existing bot detection
    const botDetection = await detectBot(req);

    if (botDetection.isBot) {
      const count = this.attackCounters.get(ip) || 0;
      this.attackCounters.set(ip, count + 1);

      // Determine attack type
      let attackType = "BOT";
      if (botDetection.signals?.userAgentFlags?.includes("known_bot_pattern")) {
        attackType = "CRAWLER";
      }
      if (botDetection.signals?.patternFlags?.includes("excessive_clicks")) {
        attackType = "CLICK_BOT";
      }
      if (botDetection.signals?.ipFlags?.includes("repeated_bot_activity")) {
        attackType = "REPEATED_BOT";
      }

      return {
        isAttack: true,
        confidence: botDetection.confidence,
        attackType,
      };
    }

    // Check for DDoS patterns
    const recentRequests = await this.getRecentRequestCount(ip);
    if (recentRequests > 100) {
      return {
        isAttack: true,
        confidence: 0.9,
        attackType: "DDOS",
      };
    }

    return {
      isAttack: false,
      confidence: 0,
      attackType: "",
    };
  }

  /**
   * Get recent request count for IP
   */
  private async getRecentRequestCount(ip: string): Promise<number> {
    try {
      const count = await prisma.bot_detections.count({
        where: {
          ipAddress: ip,
          createdAt: {
            gte: new Date(Date.now() - 60000), // Last minute
          },
        },
      });
      return count;
    } catch {
      return 0;
    }
  }

  /**
   * Get client IP
   */
  private getClientIP(req: Request): string {
    return (
      (req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
      (req.headers["x-real-ip"] as string) ||
      req.ip ||
      req.socket.remoteAddress ||
      "unknown"
    );
  }

  /**
   * Middleware function
   */
  middleware() {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        // Skip health checks
        if (req.path === "/api/health" || req.path === "/health") {
          return next();
        }

        const ip = this.getClientIP(req);

        // Check if IP is blocked
        if (this.blockedIPs.has(ip)) {
          return res.status(403).json({
            error: "Access denied",
            message: "IP blocked for bot activity",
          });
        }

        // Detect bot attack
        const attack = await this.detectBotAttack(req);

        if (attack.isAttack) {
          const count = this.attackCounters.get(ip) || 0;

          logger.warn(`🚫 Bot attack detected from ${ip}:`, {
            attackType: attack.attackType,
            confidence: attack.confidence,
            count: count + 1,
          });

          // Log security event
          await prisma.security_events.create({
            data: {
              id: crypto.randomUUID(),
              type: "BOT_ATTACK_DETECTED",
              severity: attack.attackType === "DDOS" ? "CRITICAL" : "HIGH",
              ipAddress: ip,
              userAgent: req.headers["user-agent"] || "",
              details: {
                attackType: attack.attackType,
                confidence: attack.confidence,
                count: count + 1,
              },
              createdAt: new Date(),
            },
          });

          // Block after max attempts
          if (count >= this.MAX_ATTEMPTS - 1) {
            this.blockedIPs.add(ip);
            // Auto-unblock after duration
            setTimeout(() => {
              this.blockedIPs.delete(ip);
              this.attackCounters.delete(ip);
            }, this.BLOCK_DURATION);

            return res.status(403).json({
              error: "Access denied",
              message: "Bot activity detected",
            });
          }

          // Rate limit for suspicious activity
          if (attack.confidence > 0.7) {
            res.setHeader("Retry-After", "60");
            return res.status(429).json({
              error: "Too many requests",
              message: "Please slow down",
            });
          }
        }

        next();
      } catch (error) {
        logger.error("Enhanced bot protection middleware error:", error);
        next();
      }
    };
  }
}

const enhancedBotProtection = new EnhancedBotProtectionService();
export default enhancedBotProtection;
