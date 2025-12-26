/**
 * Anti-Tracking Middleware
 * Prevents API callers from tracking and fingerprinting the system
 */

import crypto from "crypto";
import { NextFunction, Request, Response } from "express";

interface TrackingSignature {
  userAgent: string;
  ip: string;
  headers: Record<string, string>;
  fingerprint: string;
}

class AntiTrackingService {
  private trackingPatterns = new Map<string, TrackingSignature>();
  private suspiciousIPs = new Set<string>();
  private rateLimitMap = new Map<string, number[]>();

  /**
   * Detect tracking attempts
   */
  detectTracking(req: Request): {
    isTracking: boolean;
    confidence: number;
    reasons: string[];
  } {
    const reasons: string[] = [];
    let confidence = 0;

    // Check for common tracking headers
    const trackingHeaders = ["x-tracking-id", "x-fingerprint", "x-device-id", "x-session-id", "x-user-id"];

    for (const header of trackingHeaders) {
      if (req.headers[header.toLowerCase()]) {
        reasons.push(`Tracking header detected: ${header}`);
        confidence += 0.2;
      }
    }

    // Check for suspicious user agents (scrapers, bots)
    const userAgent = req.headers["user-agent"] || "";
    const suspiciousAgents = ["scraper", "crawler", "bot", "spider", "monitor", "tracker", "analytics"];

    for (const agent of suspiciousAgents) {
      if (userAgent.toLowerCase().includes(agent)) {
        reasons.push(`Suspicious user agent: ${agent}`);
        confidence += 0.15;
      }
    }

    // Check for fingerprinting attempts
    if (this.detectFingerprinting(req)) {
      reasons.push("Fingerprinting attempt detected");
      confidence += 0.3;
    }

    // Check rate limiting (rapid requests = tracking)
    const ip = this.getClientIP(req);
    if (this.isRateLimited(ip)) {
      reasons.push("Rate limit exceeded (possible tracking)");
      confidence += 0.25;
    }

    return {
      isTracking: confidence > 0.5,
      confidence,
      reasons,
    };
  }

  /**
   * Detect fingerprinting attempts
   */
  private detectFingerprinting(req: Request): boolean {
    // Check for canvas fingerprinting
    if (req.body?.canvasFingerprint || req.query?.canvas) {
      return true;
    }

    // Check for WebGL fingerprinting
    if (req.body?.webglFingerprint || req.query?.webgl) {
      return true;
    }

    // Check for audio fingerprinting
    if (req.body?.audioFingerprint || req.query?.audio) {
      return true;
    }

    // Check for font fingerprinting
    if (req.body?.fontFingerprint || req.query?.fonts) {
      return true;
    }

    return false;
  }

  /**
   * Rate limiting check
   */
  private isRateLimited(ip: string): boolean {
    const now = Date.now();
    const window = 60000; // 1 minute
    const maxRequests = 60; // 60 requests per minute

    const requests = this.rateLimitMap.get(ip) || [];
    const recentRequests = requests.filter((time) => now - time < window);

    if (recentRequests.length >= maxRequests) {
      return true;
    }

    recentRequests.push(now);
    this.rateLimitMap.set(ip, recentRequests);

    return false;
  }

  /**
   * Get client IP (handles proxies)
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
   * Generate response fingerprint (to detect tracking)
   */
  generateResponseFingerprint(): string {
    return crypto.randomBytes(16).toString("hex");
  }

  /**
   * Sanitize response to prevent tracking
   */
  sanitizeResponse(data: any): any {
    // Remove internal IDs
    const sanitized = JSON.parse(JSON.stringify(data));

    // Remove timestamps (can be used for tracking)
    if (sanitized.timestamp) {
      sanitized.timestamp = Math.floor(Date.now() / 1000); // Round to seconds
    }

    // Remove internal paths
    if (sanitized.path) {
      delete sanitized.path;
    }

    // Remove server information
    if (sanitized.server) {
      delete sanitized.server;
    }

    return sanitized;
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

        // Detect tracking
        const tracking = this.detectTracking(req);

        if (tracking.isTracking) {
          const ip = this.getClientIP(req);
          this.suspiciousIPs.add(ip);

          logger.warn(`🚫 Tracking attempt detected from ${ip}:`, {
            reasons: tracking.reasons,
            confidence: tracking.confidence,
          });

          // Log to database
          await prisma.security_events.create({
            data: {
              id: crypto.randomUUID(),
              type: "TRACKING_ATTEMPT",
              severity: "MEDIUM",
              ipAddress: ip,
              userAgent: req.headers["user-agent"] || "",
              details: {
                reasons: tracking.reasons,
                confidence: tracking.confidence,
              },
              createdAt: new Date(),
            },
          });

          // Block if high confidence
          if (tracking.confidence > 0.8) {
            return res.status(403).json({
              error: "Access denied",
              message: "Tracking attempt detected",
            });
          }
        }

        // Add anti-tracking headers
        res.setHeader("X-Content-Type-Options", "nosniff");
        res.setHeader("X-Frame-Options", "DENY");
        res.setHeader("X-XSS-Protection", "1; mode=block");
        res.setHeader("Referrer-Policy", "no-referrer");
        res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");

        // Add response fingerprint (for our own tracking)
        res.setHeader("X-Response-ID", this.generateResponseFingerprint());

        // Sanitize response
        const originalJson = res.json.bind(res);
        res.json = function (data: any) {
          const sanitized = antiTracking.sanitizeResponse(data);
          return originalJson(sanitized);
        };

        next();
      } catch (error) {
        logger.error("Anti-tracking middleware error:", error);
        next();
      }
    };
  }
}

const antiTracking = new AntiTrackingService();
export default antiTracking;

// Import prisma
import prisma from "../prismaClient";
import { logger } from "../utils/logger";
