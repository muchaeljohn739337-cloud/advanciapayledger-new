/**
 * FORTRESS FIREWALL
 * Blocks ALL user access to admin/backend features
 */

import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';

export const fortressFirewall = (req: Request, res: Response, next: NextFunction) => {
  const forbiddenPaths = [
    '/api/internal-ai',
    '/api/admin',
    '/god',
    '/system',
    '/dev',
    '/internal',
  ];

  const requestPath = req.path.toLowerCase();
  
  for (const forbidden of forbiddenPaths) {
    if (requestPath.startsWith(forbidden)) {
      console.warn(`[FORTRESS] 🛡️  BLOCKED: ${requestPath}`);
      return res.status(404).json({
        error: 'Not Found',
        message: 'The requested resource does not exist',
      });
    }
  }
  next();
};

export const userRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests', message: 'Please slow down' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const strictRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: 'Rate limit exceeded' },
});

export const suspiciousActivityDetector = (req: Request, res: Response, next: NextFunction) => {
  const suspiciousPatterns = ['admin', 'internal', 'god', 'system', 'ai', 'root', '.env'];
  const requestUrl = req.url.toLowerCase();
  
  for (const pattern of suspiciousPatterns) {
    if (requestUrl.includes(pattern)) {
      console.error(`[FORTRESS] 🚨 SUSPICIOUS: Pattern "${pattern}" detected from ${req.ip}`);
    }
  }
  next();
};

export const blockDirectAccess = (req: Request, res: Response, next: NextFunction) => {
  const dangerousExtensions = ['.env', '.ts', '.js', '.json', '.config', '.key'];
  const requestPath = req.path.toLowerCase();
  
  for (const ext of dangerousExtensions) {
    if (requestPath.endsWith(ext)) {
      console.error(`[FORTRESS] 🚨 BLOCKED FILE ACCESS: ${requestPath}`);
      return res.status(403).json({ error: 'Forbidden' });
    }
  }
  next();
};
