/**
 * ADMIN BYPASS UTILITY
 * Centralized logic for admin privilege bypass in SaaS self-hosted deployments
 * 
 * Admins can bypass:
 * - Rate limits
 * - Transaction thresholds (HIGH_RISK approval)
 * - Idempotency requirements
 */

import { Request } from "express";
import jwt from "jsonwebtoken";

export interface AdminContext {
  isAdmin: boolean;
  adminId?: string;
  email?: string;
  bypassReason?: string;
}

/**
 * Check if request is from an authenticated admin
 * Checks both x-admin-key header AND JWT role
 */
export function getAdminContext(req: Request): AdminContext {
  // Method 1: Check x-admin-key header
  const adminKey = req.headers["x-admin-key"] as string;
  const expectedKey = process.env.ADMIN_KEY;
  
  if (adminKey && expectedKey && adminKey === expectedKey) {
    return {
      isAdmin: true,
      adminId: "admin-key-auth",
      bypassReason: "Admin API key authentication",
    };
  }

  // Method 2: Check JWT for admin role
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        userId?: string;
        email?: string;
        role?: string;
      };
      
      if (decoded.role?.toUpperCase() === "ADMIN") {
        return {
          isAdmin: true,
          adminId: decoded.userId,
          email: decoded.email,
          bypassReason: "Admin JWT authentication",
        };
      }
    }
  } catch {
    // Invalid token, not an admin
  }

  // Method 3: Check if already set by previous middleware
  const user = (req as any).user;
  if (user?.role?.toUpperCase() === "ADMIN") {
    return {
      isAdmin: true,
      adminId: user.userId || user.id,
      email: user.email,
      bypassReason: "Admin role from auth middleware",
    };
  }

  return { isAdmin: false };
}

/**
 * Check if admin can bypass rate limits
 */
export function canBypassRateLimit(req: Request): boolean {
  const { isAdmin } = getAdminContext(req);
  return isAdmin && process.env.ADMIN_BYPASS_RATE_LIMIT !== "false";
}

/**
 * Check if admin can bypass transaction thresholds
 */
export function canBypassTransactionThreshold(req: Request): boolean {
  const { isAdmin } = getAdminContext(req);
  return isAdmin && process.env.ADMIN_BYPASS_THRESHOLD !== "false";
}

/**
 * Check if admin can bypass idempotency requirements
 */
export function canBypassIdempotency(req: Request): boolean {
  const { isAdmin } = getAdminContext(req);
  return isAdmin && process.env.ADMIN_BYPASS_IDEMPOTENCY !== "false";
}

/**
 * Get transaction threshold for user (admins get unlimited)
 */
export function getEffectiveThreshold(req: Request, defaultThreshold: number): number {
  if (canBypassTransactionThreshold(req)) {
    return Infinity;
  }
  return defaultThreshold;
}

export default {
  getAdminContext,
  canBypassRateLimit,
  canBypassTransactionThreshold,
  canBypassIdempotency,
  getEffectiveThreshold,
};
