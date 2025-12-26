/**
 * Scam Detector Middleware
 * Detects scam patterns, phishing attempts, and fraudulent activity
 */

import crypto from "crypto";
import { NextFunction, Request, Response } from "express";
import prisma from "../prismaClient";
import { logger } from "../utils/logger";

class ScamDetectorService {
  /**
   * Detect scam patterns
   */
  detectScam(
    req: Request,
    body?: any
  ): {
    isScam: boolean;
    confidence: number;
    patterns: string[];
  } {
    const patterns: string[] = [];
    let confidence = 0;

    const content = JSON.stringify(body || req.body || {});
    const lowerContent = content.toLowerCase();

    // Phishing patterns
    const phishingPatterns = [
      /verify\s+your\s+account/i,
      /click\s+here\s+to\s+verify/i,
      /urgent\s+action\s+required/i,
      /your\s+account\s+will\s+be\s+closed/i,
      /suspended\s+account/i,
      /verify\s+your\s+identity/i,
      /confirm\s+your\s+email/i,
      /update\s+your\s+payment\s+information/i,
      /your\s+payment\s+failed/i,
      /immediate\s+attention\s+required/i,
    ];

    for (const pattern of phishingPatterns) {
      if (pattern.test(lowerContent)) {
        patterns.push("phishing_pattern");
        confidence += 0.2;
      }
    }

    // Suspicious URLs
    const suspiciousUrlPatterns = [
      /bit\.ly/i,
      /tinyurl\.com/i,
      /short\.link/i,
      /goo\.gl/i,
      /t\.co/i,
      /http:\/\/(?!localhost|127\.0\.0\.1)/i, // HTTP (not localhost)
      /[a-z0-9-]+\.tk/i, // .tk domains (often used for scams)
      /[a-z0-9-]+\.ml/i, // .ml domains
    ];

    for (const pattern of suspiciousUrlPatterns) {
      if (pattern.test(lowerContent)) {
        patterns.push("suspicious_url");
        confidence += 0.15;
      }
    }

    // Fake payment requests
    const paymentScamPatterns = [
      /send\s+money\s+to/i,
      /wire\s+transfer/i,
      /western\s+union/i,
      /money\s+gram/i,
      /gift\s+card/i,
      /itunes\s+card/i,
      /google\s+play\s+card/i,
      /bitcoin\s+address/i,
      /crypto\s+wallet/i,
      /urgent\s+payment/i,
    ];

    for (const pattern of paymentScamPatterns) {
      if (pattern.test(lowerContent)) {
        patterns.push("payment_scam");
        confidence += 0.25;
      }
    }

    // Social engineering patterns
    const socialEngineeringPatterns = [
      /act\s+now/i,
      /limited\s+time\s+offer/i,
      /exclusive\s+deal/i,
      /you\s+have\s+won/i,
      /congratulations/i,
      /claim\s+your\s+prize/i,
      /free\s+money/i,
      /guaranteed\s+profit/i,
      /no\s+risk/i,
      /get\s+rich\s+quick/i,
    ];

    for (const pattern of socialEngineeringPatterns) {
      if (pattern.test(lowerContent)) {
        patterns.push("social_engineering");
        confidence += 0.15;
      }
    }

    // Suspicious email patterns
    const emailScamPatterns = [
      /noreply@[a-z0-9-]+\.(tk|ml|ga|cf)/i,
      /support@[a-z0-9-]+\.(tk|ml|ga|cf)/i,
      /admin@[a-z0-9-]+\.(tk|ml|ga|cf)/i,
      /[a-z0-9-]+@[a-z0-9-]+\.(tk|ml|ga|cf)/i,
    ];

    for (const pattern of emailScamPatterns) {
      if (pattern.test(lowerContent)) {
        patterns.push("suspicious_email_domain");
        confidence += 0.2;
      }
    }

    // Check for excessive urgency
    const urgencyWords = ["urgent", "immediate", "asap", "now", "today", "expires"];
    const urgencyCount = urgencyWords.filter((word) => lowerContent.includes(word)).length;
    if (urgencyCount >= 3) {
      patterns.push("excessive_urgency");
      confidence += 0.2;
    }

    return {
      isScam: confidence > 0.5,
      confidence: Math.min(confidence, 1.0),
      patterns,
    };
  }

  /**
   * Detect suspicious transaction patterns
   */
  async detectSuspiciousTransaction(
    userId: string,
    amount: number
  ): Promise<{
    isSuspicious: boolean;
    score: number;
    reasons: string[];
  }> {
    const reasons: string[] = [];
    let score = 0;

    // Check user's transaction history
    const recentTransactions = await prisma.transactions.findMany({
      where: {
        userId,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    // Check for rapid transactions
    if (recentTransactions.length > 5) {
      reasons.push("high_transaction_velocity");
      score += 20;
    }

    // Check for unusual amounts
    const avgAmount =
      recentTransactions.reduce((sum, t) => sum + Number(t.amount || 0), 0) / recentTransactions.length || 0;
    if (amount > avgAmount * 10 && avgAmount > 0) {
      reasons.push("unusual_amount");
      score += 30;
    }

    // Check for round numbers (common in scams)
    if (amount % 1000 === 0 && amount > 1000) {
      reasons.push("round_number_pattern");
      score += 10;
    }

    return {
      isSuspicious: score > 40,
      score,
      reasons,
    };
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

        // Detect scam patterns in request
        const scam = this.detectScam(req, req.body);

        if (scam.isScam) {
          const ip = req.ip || req.socket.remoteAddress || "unknown";

          logger.warn(`🚫 Scam detected from ${ip}:`, {
            patterns: scam.patterns,
            confidence: scam.confidence,
            path: req.path,
          });

          // Log security event
          await prisma.security_events.create({
            data: {
              id: crypto.randomUUID(),
              type: "SCAM_DETECTED",
              severity: "HIGH",
              ipAddress: ip,
              userAgent: req.headers["user-agent"] || "",
              details: {
                patterns: scam.patterns,
                confidence: scam.confidence,
                path: req.path,
              },
              createdAt: new Date(),
            },
          });

          // Block high-confidence scams
          if (scam.confidence > 0.8) {
            return res.status(403).json({
              error: "Access denied",
              message: "Suspicious activity detected",
            });
          }
        }

        next();
      } catch (error) {
        logger.error("Scam detector middleware error:", error);
        next();
      }
    };
  }
}

const scamDetector = new ScamDetectorService();
export default scamDetector;
