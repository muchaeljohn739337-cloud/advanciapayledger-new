/**
 * Email Protection Middleware
 * Validates and sanitizes email addresses to prevent injection attacks
 */

import crypto from "crypto";
import { NextFunction, Request, Response } from "express";
import prisma from "../prismaClient";
import { logger } from "../utils/logger";

class EmailProtectionService {
  /**
   * Validate email format
   */
  isValidEmail(email: string): boolean {
    if (!email || typeof email !== "string") {
      return false;
    }

    // RFC 5322 compliant regex (simplified)
    const emailRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

    if (!emailRegex.test(email)) {
      return false;
    }

    // Check length (max 254 characters per RFC)
    if (email.length > 254) {
      return false;
    }

    // Check for dangerous patterns
    const dangerousPatterns = [/<script/gi, /javascript:/gi, /on\w+\s*=/gi, /<iframe/gi, /data:text\/html/gi];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(email)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Sanitize email address
   */
  sanitizeEmail(email: string): string {
    if (!email || typeof email !== "string") {
      return "";
    }

    // Remove whitespace
    let sanitized = email.trim().toLowerCase();

    // Remove dangerous characters
    sanitized = sanitized.replace(/[<>'"&]/g, "");

    // Remove null bytes
    sanitized = sanitized.replace(/\0/g, "");

    return sanitized;
  }

  /**
   * Detect email injection attempts
   */
  detectEmailInjection(email: string): {
    isInjection: boolean;
    patterns: string[];
  } {
    const patterns: string[] = [];
    const injectionPatterns = [
      /\r\n/, // CRLF injection
      /\n/, // Newline injection
      /%0a/i, // URL encoded newline
      /%0d/i, // URL encoded carriage return
      /bcc:/i, // BCC injection
      /cc:/i, // CC injection
      /to:/i, // TO injection
      /subject:/i, // Subject injection
      /content-type:/i, // Content-Type injection
      /multipart\/mixed/i, // Multipart injection
    ];

    for (const pattern of injectionPatterns) {
      if (pattern.test(email)) {
        patterns.push(pattern.source);
      }
    }

    return {
      isInjection: patterns.length > 0,
      patterns,
    };
  }

  /**
   * Validate and sanitize email in request
   */
  validateEmail(email: string): { valid: boolean; sanitized: string; error?: string } {
    // Check for injection
    const injection = this.detectEmailInjection(email);
    if (injection.isInjection) {
      return {
        valid: false,
        sanitized: "",
        error: "Email injection attempt detected",
      };
    }

    // Sanitize
    const sanitized = this.sanitizeEmail(email);

    // Validate format
    if (!this.isValidEmail(sanitized)) {
      return {
        valid: false,
        sanitized: "",
        error: "Invalid email format",
      };
    }

    return {
      valid: true,
      sanitized,
    };
  }

  /**
   * Middleware function
   */
  middleware() {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        // Check body for email fields
        if (req.body) {
          const emailFields = ["email", "to", "from", "recipient", "sender"];

          for (const field of emailFields) {
            if (req.body[field] && typeof req.body[field] === "string") {
              const validation = this.validateEmail(req.body[field]);

              if (!validation.valid) {
                logger.warn(`🚫 Invalid email detected from ${req.ip}:`, {
                  field,
                  error: validation.error,
                });

                // Log security event
                await prisma.security_events.create({
                  data: {
                    id: crypto.randomUUID(),
                    type: "EMAIL_INJECTION_DETECTED",
                    severity: "HIGH",
                    ipAddress: req.ip || "unknown",
                    userAgent: req.headers["user-agent"] || "",
                    details: {
                      field,
                      error: validation.error,
                    },
                    createdAt: new Date(),
                  },
                });

                return res.status(400).json({
                  error: "Invalid email address",
                  message: validation.error,
                });
              }

              // Replace with sanitized version
              req.body[field] = validation.sanitized;
            }
          }
        }

        // Check query parameters
        if (req.query) {
          const emailFields = ["email", "to", "from"];

          for (const field of emailFields) {
            if (req.query[field] && typeof req.query[field] === "string") {
              const validation = this.validateEmail(req.query[field] as string);

              if (!validation.valid) {
                return res.status(400).json({
                  error: "Invalid email address",
                  message: validation.error,
                });
              }

              req.query[field] = validation.sanitized;
            }
          }
        }

        next();
      } catch (error) {
        logger.error("Email protection middleware error:", error);
        next();
      }
    };
  }
}

const emailProtection = new EmailProtectionService();
export default emailProtection;
