import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

/**
 * Admin-Only Middleware
 * Protects internal AI endpoints from public access
 */

export interface AdminRequest extends Request {
  admin?: {
    id: string;
    email: string;
    role: string;
  };
}

export const adminOnly = async (
  req: AdminRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Admin authentication required' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;

    // Check if user has admin role
    if (decoded.role !== 'ADMIN' && decoded.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Admin privileges required' });
    }

    req.admin = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    return res.status(401).json({ error: 'Invalid admin token' });
  }
};

export const superAdminOnly = async (
  req: AdminRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    await adminOnly(req, res, () => {});

    if (req.admin?.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Super admin privileges required' });
    }

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Super admin authentication failed' });
  }
};
