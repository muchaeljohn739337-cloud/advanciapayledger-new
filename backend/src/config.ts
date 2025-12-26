// Environment Configuration
export const PORT = parseInt(process.env.PORT || "5000");
export const NODE_ENV = process.env.NODE_ENV || "development";
export const DATABASE_URL = process.env.DATABASE_URL || "";

// JWT Configuration
export const JWT_SECRET = process.env.JWT_SECRET || "your-development-secret-key";
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

// Stripe Configuration
export const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "";
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "";
export const STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY || "";

// Cryptomus Configuration
export const CRYPTOMUS_API_KEY = process.env.CRYPTOMUS_API_KEY || "";
export const CRYPTOMUS_MERCHANT_ID = process.env.CRYPTOMUS_MERCHANT_ID || "";

// Email Configuration
export const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
export const SMTP_PORT = parseInt(process.env.SMTP_PORT || "587");
export const SMTP_USER = process.env.SMTP_USER || "";
export const SMTP_PASS = process.env.SMTP_PASS || "";
export const EMAIL_FROM = process.env.EMAIL_FROM || "noreply@advancia-pay.com";

// Sentry Configuration
export const SENTRY_DSN = process.env.SENTRY_DSN || "";

// Frontend URL
export const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

// CORS Origins
export const CORS_ORIGINS = process.env.CORS_ORIGINS?.split(",") || [
  "http://localhost:3000",
  "http://localhost:5000",
];

// Redis Configuration (if used)
export const REDIS_URL = process.env.REDIS_URL || "";

// Blockchain Configuration
export const ETHEREUM_RPC_URL = process.env.ETHEREUM_RPC_URL || "";
export const BITCOIN_RPC_URL = process.env.BITCOIN_RPC_URL || "";

// Rate Limiting
export const RATE_LIMIT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"); // 15 minutes
export const RATE_LIMIT_MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100");

// File Upload
export const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || "5242880"); // 5MB

// Session Configuration
export const SESSION_SECRET = process.env.SESSION_SECRET || "session-secret-key";

// Feature Flags
export const ENABLE_2FA = process.env.ENABLE_2FA !== "false";
export const ENABLE_EMAIL_VERIFICATION = process.env.ENABLE_EMAIL_VERIFICATION !== "false";

// Admin Configuration
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@advancia-pay.com";

export default {
  PORT,
  NODE_ENV,
  DATABASE_URL,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET,
  STRIPE_PUBLISHABLE_KEY,
  CRYPTOMUS_API_KEY,
  CRYPTOMUS_MERCHANT_ID,
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  EMAIL_FROM,
  SENTRY_DSN,
  FRONTEND_URL,
  CORS_ORIGINS,
  REDIS_URL,
  ETHEREUM_RPC_URL,
  BITCOIN_RPC_URL,
  RATE_LIMIT_WINDOW_MS,
  RATE_LIMIT_MAX_REQUESTS,
  MAX_FILE_SIZE,
  SESSION_SECRET,
  ENABLE_2FA,
  ENABLE_EMAIL_VERIFICATION,
  ADMIN_EMAIL,
};
