import { Request } from "express";
import winston, { format } from "winston";
import { SENTRY_DSN } from "../config";
import prisma from "../prismaClient";

const { combine, timestamp, json, errors, prettyPrint } = winston.format;

const logLevel = process.env.LOG_LEVEL || "info";
const isDevelopment = process.env.NODE_ENV === "development";

// Create logger instance
export const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.colorize({ all: isDevelopment }),
    winston.format.printf(({ timestamp, level, message, stack }) => {
      return `${timestamp} [${level}]: ${message}${stack ? `\n${stack}` : ""}`;
    })
  ),
  transports: [
    new winston.transports.Console({
      silent: process.env.NODE_ENV === "test",
    }),
  ],
});

// Add file transport for production
if (!isDevelopment) {
  logger.add(
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );

  logger.add(
    new winston.transports.File({
      filename: "logs/combined.log",
      maxsize: 5242880,
      maxFiles: 5,
    })
  );
}

// Add Sentry for error tracking in production
if (process.env.NODE_ENV === "production" && SENTRY_DSN) {
  const Sentry = require("@sentry/node");

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NODE_ENV || "development",
    tracesSampleRate: 1.0,
  });

  logger.on("error", (error) => {
    Sentry.captureException(error);
  });
}

/**
 * Backward compatible logger interface
 */
export const customLogger = {
  info: (message: string, metadata: any = {}) => {
    logger.info(message, metadata);
  },
  warn: (message: string, metadata: any = {}) => {
    logger.warn(message, metadata);
  },
  error: (message: string, error: any = {}) => {
    logger.error(message, { error });
  },
  debug: (message: string, metadata: any = {}) => {
    if (process.env.DEBUG) {
      logger.debug(message, metadata);
    }
  },
};

/**
 * Log admin login attempts for security auditing
 */
export async function logAdminLogin(
  req: Request,
  email: string,
  status: "SUCCESS" | "FAILED_PASSWORD" | "FAILED_OTP" | "OTP_SENT",
  phone?: string
): Promise<void> {
  try {
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown";
    const userAgent = req.headers["user-agent"] || "unknown";
    const ipAddress = Array.isArray(ip) ? ip[0] : ip;

    // Log to database
    await prisma.admin_login_logs.create({
      data: {
        email,
        phone,
        status,
        ipAddress,
        userAgent,
      },
    });

    // Log to winston
    logger.info("Admin login attempt", {
      email,
      status,
      ipAddress,
      userAgent,
      tags: ["security", "authentication"],
    });
  } catch (error) {
    logger.error("Failed to log admin login attempt", { error });
    // Don't throw - logging shouldn't break the auth flow
  }
}
