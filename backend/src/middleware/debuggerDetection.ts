/**
 * Debugger Detection Middleware
 * Detects and prevents debugging attempts
 */

import crypto from "crypto";
import { NextFunction, Request, Response } from "express";

interface DebuggerSignature {
  devTools: boolean;
  debuggerStatements: boolean;
  consoleAccess: boolean;
  breakpoints: boolean;
  networkInspection: boolean;
}

class DebuggerDetectionService {
  private suspiciousPatterns = new Map<string, number>();
  private blockedIPs = new Set<string>();

  /**
   * Detect debugger attempts
   */
  detectDebugger(req: Request): {
    isDebugging: boolean;
    confidence: number;
    methods: string[];
  } {
    const methods: string[] = [];
    let confidence = 0;

    // Check for DevTools indicators
    if (this.detectDevTools(req)) {
      methods.push("DevTools detected");
      confidence += 0.3;
    }

    // Check for debugger statements in requests
    if (this.detectDebuggerStatements(req)) {
      methods.push("Debugger statements detected");
      confidence += 0.4;
    }

    // Check for console access patterns
    if (this.detectConsoleAccess(req)) {
      methods.push("Console access detected");
      confidence += 0.2;
    }

    // Check for breakpoint patterns
    if (this.detectBreakpoints(req)) {
      methods.push("Breakpoint patterns detected");
      confidence += 0.3;
    }

    // Check for network inspection
    if (this.detectNetworkInspection(req)) {
      methods.push("Network inspection detected");
      confidence += 0.2;
    }

    // Check for timing attacks (debugger slows execution)
    if (this.detectTimingAttack(req)) {
      methods.push("Timing attack detected");
      confidence += 0.3;
    }

    return {
      isDebugging: confidence > 0.5,
      confidence,
      methods,
    };
  }

  /**
   * Detect DevTools
   */
  private detectDevTools(req: Request): boolean {
    // Check headers that indicate DevTools
    const devToolsHeaders = ["x-devtools", "x-chrome-devtools", "x-firebug"];

    for (const header of devToolsHeaders) {
      if (req.headers[header.toLowerCase()]) {
        return true;
      }
    }

    // Check user agent for DevTools
    const userAgent = req.headers["user-agent"] || "";
    if (userAgent.includes("DevTools") || userAgent.includes("Firebug")) {
      return true;
    }

    return false;
  }

  /**
   * Detect debugger statements
   */
  private detectDebuggerStatements(req: Request): boolean {
    const body = JSON.stringify(req.body || {});
    const query = JSON.stringify(req.query || {});

    const debuggerPatterns = ["debugger", "console.debug", "console.trace", "breakpoint", "debug"];

    for (const pattern of debuggerPatterns) {
      if (body.toLowerCase().includes(pattern) || query.toLowerCase().includes(pattern)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Detect console access
   */
  private detectConsoleAccess(req: Request): boolean {
    const body = JSON.stringify(req.body || {});
    const query = JSON.stringify(req.query || {});

    const consolePatterns = ["console.log", "console.error", "console.warn", "console.info", "console.dir"];

    for (const pattern of consolePatterns) {
      if (body.toLowerCase().includes(pattern) || query.toLowerCase().includes(pattern)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Detect breakpoints
   */
  private detectBreakpoints(req: Request): boolean {
    // Check for breakpoint-related headers
    if (req.headers["x-breakpoint"] || req.headers["x-debug-break"]) {
      return true;
    }

    return false;
  }

  /**
   * Detect network inspection
   */
  private detectNetworkInspection(req: Request): boolean {
    // Check for network inspection tools
    const networkHeaders = ["x-network-inspector", "x-charles-proxy", "x-fiddler", "x-burp"];

    for (const header of networkHeaders) {
      if (req.headers[header.toLowerCase()]) {
        return true;
      }
    }

    return false;
  }

  /**
   * Detect timing attacks (debugger slows execution)
   */
  private detectTimingAttack(req: Request): boolean {
    // This would need to be implemented with timing measurements
    // For now, check for suspicious timing patterns in headers
    if (req.headers["x-timing"]) {
      const timing = parseInt(req.headers["x-timing"] as string);
      if (timing > 1000) {
        // Suspiciously slow
        return true;
      }
    }

    return false;
  }

  /**
   * Obfuscate response to prevent debugging
   */
  obfuscateResponse(data: any): any {
    // Add random delays to prevent timing analysis
    const obfuscated = JSON.parse(JSON.stringify(data));

    // Add noise to timestamps
    if (obfuscated.timestamp) {
      obfuscated.timestamp += Math.floor(Math.random() * 1000);
    }

    // Add dummy fields to confuse debuggers
    obfuscated._noise = crypto.randomBytes(8).toString("hex");

    return obfuscated;
  }

  /**
   * Middleware function
   */
  middleware() {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        // Skip health checks and admin routes
        if (
          req.path === "/api/health" ||
          req.path === "/health" ||
          req.path.startsWith("/api/admin") ||
          (req as any).user?.role === "ADMIN"
        ) {
          return next();
        }

        // Detect debugger
        const debuggerResult = this.detectDebugger(req);

        if (debuggerResult.isDebugging) {
          const ip = this.getClientIP(req);
          const count = this.suspiciousPatterns.get(ip) || 0;
          this.suspiciousPatterns.set(ip, count + 1);

          logger.warn(`🚫 Debugger detected from ${ip}:`, {
            methods: debuggerResult.methods,
            confidence: debuggerResult.confidence,
            count: count + 1,
          });

          // Block after 3 attempts
          if (count >= 2) {
            this.blockedIPs.add(ip);
            return res.status(403).json({
              error: "Access denied",
              message: "Debugging not allowed",
            });
          }

          // Log to database
          await prisma.security_events.create({
            data: {
              id: crypto.randomUUID(),
              type: "DEBUGGER_DETECTED",
              severity: "HIGH",
              ipAddress: ip,
              userAgent: req.headers["user-agent"] || "",
              details: {
                methods: debuggerResult.methods,
                confidence: debuggerResult.confidence,
              },
              createdAt: new Date(),
            },
          });

          // Obfuscate response
          const originalJson = res.json.bind(res);
          res.json = function (data: any) {
            const obfuscated = debuggerDetection.obfuscateResponse(data);
            return originalJson(obfuscated);
          };
        }

        // Add anti-debugging headers
        res.setHeader("X-Debug-Disabled", "true");
        res.setHeader("X-No-Inspect", "true");

        next();
      } catch (error) {
        logger.error("Debugger detection middleware error:", error);
        next();
      }
    };
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
}

const debuggerDetection = new DebuggerDetectionService();
export default debuggerDetection;

// Import prisma
import prisma from "../prismaClient";
import { logger } from "../utils/logger";
