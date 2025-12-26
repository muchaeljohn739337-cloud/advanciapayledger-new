import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Role hierarchy for access control
export const ROLE_HIERARCHY = {
  SUPER_ADMIN: 100,
  ADMIN: 80,
  DOCTOR: 60,
  MODERATOR: 50,
  USER: 10,
  GUEST: 0
} as const;

// Feature permissions mapping
export const FEATURE_PERMISSIONS = {
  // Financial features
  VIEW_BALANCE: ['USER', 'DOCTOR', 'MODERATOR', 'ADMIN', 'SUPER_ADMIN'],
  MAKE_PAYMENT: ['USER', 'DOCTOR', 'MODERATOR', 'ADMIN', 'SUPER_ADMIN'],
  WITHDRAW_FUNDS: ['USER', 'DOCTOR', 'ADMIN', 'SUPER_ADMIN'],
  VIEW_TRANSACTIONS: ['USER', 'DOCTOR', 'MODERATOR', 'ADMIN', 'SUPER_ADMIN'],
  
  // Crypto features
  CRYPTO_WALLET: ['USER', 'DOCTOR', 'ADMIN', 'SUPER_ADMIN'],
  CRYPTO_WITHDRAW: ['USER', 'DOCTOR', 'ADMIN', 'SUPER_ADMIN'],
  
  // Admin features
  VIEW_USERS: ['ADMIN', 'SUPER_ADMIN'],
  MANAGE_USERS: ['ADMIN', 'SUPER_ADMIN'],
  BLOCK_USERS: ['ADMIN', 'SUPER_ADMIN'],
  DELETE_USERS: ['SUPER_ADMIN'],
  VIEW_ANALYTICS: ['ADMIN', 'SUPER_ADMIN'],
  
  // Doctor features
  VERIFY_DOCTOR: ['ADMIN', 'SUPER_ADMIN'],
  MANAGE_MEDBEDS: ['DOCTOR', 'ADMIN', 'SUPER_ADMIN'],
  VIEW_BOOKINGS: ['DOCTOR', 'ADMIN', 'SUPER_ADMIN'],
  
  // Content management
  CREATE_BLOG: ['MODERATOR', 'ADMIN', 'SUPER_ADMIN'],
  EDIT_BLOG: ['MODERATOR', 'ADMIN', 'SUPER_ADMIN'],
  DELETE_BLOG: ['ADMIN', 'SUPER_ADMIN'],
  MODERATE_COMMENTS: ['MODERATOR', 'ADMIN', 'SUPER_ADMIN'],
  
  // System features
  VIEW_LOGS: ['ADMIN', 'SUPER_ADMIN'],
  MANAGE_SETTINGS: ['SUPER_ADMIN'],
  BACKUP_DATABASE: ['SUPER_ADMIN']
} as const;

/**
 * Check if user has required role level
 */
export const requireRole = (minRole: keyof typeof ROLE_HIERARCHY) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userRoleLevel = ROLE_HIERARCHY[req.user.role as keyof typeof ROLE_HIERARCHY] || 0;
    const requiredRoleLevel = ROLE_HIERARCHY[minRole];

    if (userRoleLevel < requiredRoleLevel) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: minRole,
        current: req.user.role
      });
    }

    next();
  };
};

/**
 * Check if user has permission for specific feature
 */
export const requireFeature = (feature: keyof typeof FEATURE_PERMISSIONS) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const allowedRoles = FEATURE_PERMISSIONS[feature];
    if (!allowedRoles || !allowedRoles.includes(req.user.role as any)) {
      return res.status(403).json({ 
        error: 'Feature access denied',
        feature,
        userRole: req.user.role
      });
    }

    next();
  };
};

/**
 * Check multiple features (user needs at least one)
 */
export const requireAnyFeature = (features: Array<keyof typeof FEATURE_PERMISSIONS>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const hasAccess = features.some(feature => {
      const allowedRoles = FEATURE_PERMISSIONS[feature];
      return allowedRoles && allowedRoles.includes(req.user!.role as any);
    });

    if (!hasAccess) {
      return res.status(403).json({ 
        error: 'Feature access denied',
        requiredFeatures: features,
        userRole: req.user.role
      });
    }

    next();
  };
};

/**
 * Log user activity to database
 */
export const logActivity = async (
  userId: string,
  action: string,
  ipAddress: string,
  userAgent: string,
  metadata?: any
) => {
  try {
    await prisma.activity_logs.create({
      data: {
        id: crypto.randomUUID(),
        userId,
        action,
        ipAddress,
        userAgent,
        metadata: metadata || {},
        createdAt: new Date()
      }
    });
  } catch (error) {
    console.error('[Activity Log Error]:', error);
  }
};

/**
 * Middleware to track user activity
 */
export const trackActivity = (action: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (req.user) {
      const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
      const userAgent = req.get('user-agent') || 'unknown';
      
      await logActivity(req.user.id, action, ipAddress, userAgent, {
        method: req.method,
        path: req.path,
        query: req.query,
        timestamp: new Date().toISOString()
      });
    }
    next();
  };
};

export default {
  requireRole,
  requireFeature,
  requireAnyFeature,
  logActivity,
  trackActivity,
  ROLE_HIERARCHY,
  FEATURE_PERMISSIONS
};
