/**
 * HTML Protection Middleware
 * Sanitizes HTML input and output to prevent XSS attacks
 */

import crypto from "crypto";
import { NextFunction, Request, Response } from "express";
import DOMPurify from "isomorphic-dompurify";
import prisma from "../prismaClient";
import { logger } from "../utils/logger";

class HTMLProtectionService {
  /**
   * Sanitize HTML string
   */
  sanitizeHTML(html: string): string {
    try {
      return DOMPurify.sanitize(html, {
        ALLOWED_TAGS: ["p", "br", "strong", "em", "u", "a", "ul", "ol", "li", "h1", "h2", "h3", "h4", "h5", "h6"],
        ALLOWED_ATTR: ["href", "target", "rel"],
        ALLOW_DATA_ATTR: false,
        FORBID_TAGS: ["script", "iframe", "object", "embed", "form", "input", "button"],
        FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover"],
      });
    } catch (error) {
      logger.error("HTML sanitization error:", error);
      return ""; // Return empty string on error
    }
  }

  /**
   * Sanitize object recursively
   */
  sanitizeObject(obj: any): any {
    if (typeof obj === "string") {
      return this.sanitizeHTML(obj);
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitizeObject(item));
    }

    if (obj && typeof obj === "object") {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = this.sanitizeObject(value);
      }
      return sanitized;
    }

    return obj;
  }

  /**
   * Detect malicious HTML patterns
   */
  detectMaliciousHTML(content: string): {
    isMalicious: boolean;
    patterns: string[];
  } {
    const patterns: string[] = [];
    const maliciousPatterns = [
      /<script[^>]*>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi, // onclick, onerror, etc.
      /<iframe[^>]*>/gi,
      /<object[^>]*>/gi,
      /<embed[^>]*>/gi,
      /<form[^>]*>/gi,
      /eval\s*\(/gi,
      /expression\s*\(/gi,
      /vbscript:/gi,
      /data:text\/html/gi,
    ];

    for (const pattern of maliciousPatterns) {
      if (pattern.test(content)) {
        patterns.push(pattern.source);
      }
    }

    return {
      isMalicious: patterns.length > 0,
      patterns,
    };
  }

  /**
   * Middleware function
   */
  middleware() {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        // Sanitize request body
        if (req.body && typeof req.body === "object") {
          // Check for malicious HTML
          const bodyString = JSON.stringify(req.body);
          const malicious = this.detectMaliciousHTML(bodyString);

          if (malicious.isMalicious) {
            logger.warn(`🚫 Malicious HTML detected from ${req.ip}:`, {
              patterns: malicious.patterns,
              path: req.path,
            });

            // Log security event
            await prisma.security_events.create({
              data: {
                id: crypto.randomUUID(),
                type: "MALICIOUS_HTML_DETECTED",
                severity: "HIGH",
                ipAddress: req.ip || "unknown",
                userAgent: req.headers["user-agent"] || "",
                details: {
                  patterns: malicious.patterns,
                  path: req.path,
                },
                createdAt: new Date(),
              },
            });

            return res.status(400).json({
              error: "Malicious content detected",
              message: "Request contains potentially dangerous HTML",
            });
          }

          // Sanitize body
          req.body = this.sanitizeObject(req.body);
        }

        // Sanitize query parameters
        if (req.query && typeof req.query === "object") {
          req.query = this.sanitizeObject(req.query);
        }

        // Sanitize response
        const originalJson = res.json.bind(res);
        res.json = function (data: any) {
          const sanitized = htmlProtection.sanitizeObject(data);
          return originalJson(sanitized);
        };

        next();
      } catch (error) {
        logger.error("HTML protection middleware error:", error);
        next();
      }
    };
  }
}

const htmlProtection = new HTMLProtectionService();
export default htmlProtection;
