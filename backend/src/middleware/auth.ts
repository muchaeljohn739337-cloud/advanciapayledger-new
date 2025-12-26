import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        firstName?: string;
        lastName?: string;
      };
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET not configured');
    }

    const decoded = jwt.verify(token, jwtSecret) as any;
    
    // Support both 'id' and 'userId' from JWT token
    const userId = decoded.id || decoded.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Invalid token format.' });
    }
    
    // Fetch user from database to ensure they still exist and get latest data
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid token. User not found.' });
    }

    req.user = user;
    next();

  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Invalid token.' });
  }
};

export const adminRequired = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await authenticate(req, res, () => {
      if (req.user?.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Admin access required.' });
      }
      next();
    });
  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(403).json({ error: 'Admin access required.' });
  }
};

export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      // No token provided, continue without user
      return next();
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET not configured');
    }

    const decoded = jwt.verify(token, jwtSecret) as any;
    
    // Support both 'id' and 'userId' from JWT token
    const userId = decoded.id || decoded.userId;
    
    if (userId) {
      const user = await prisma.users.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          role: true,
          firstName: true,
          lastName: true,
        }
      });

      if (user) {
        req.user = user;
      }
    }

    next();

  } catch (error) {
    // Invalid token, but continue without user
    console.error('Optional auth error:', error);
    next();
  }
};

// Alias for backward compatibility
export const authenticateToken = authenticate;
export const requireAdmin = adminRequired;

// Log admin actions middleware
export const logAdminAction = async (req: Request, res: Response, next: NextFunction) => {
  // Store original send function
  const originalSend = res.send.bind(res);
  
  // Override send to log after response
  res.send = function(data: any) {
    // Log the admin action
    if (req.user && res.statusCode < 400) {
      console.log('[Admin Action]', {
        userId: req.user.id,
        email: req.user.email,
        method: req.method,
        path: req.path,
        timestamp: new Date().toISOString()
      });
    }
    return originalSend(data);
  };
  
  next();
};
