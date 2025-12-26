/**
 * GOD-MODE ADMIN SERVER - UPDATED
 * ADMIN NEVER LOCKED OUT
 * Multiple authentication methods
 */

import express from 'express';
import jwt from 'jsonwebtoken';
import { systemMonitor } from '../system/healthMonitor';
import { internalAI } from '../ai-core/admin/orchestrator';

const ADMIN_PORT = parseInt(process.env.ADMIN_PORT || '5000');
const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY || 'CHANGE_THIS_IMMEDIATELY';
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

export class AdminGodServer {
  private app: express.Application;
  private server: any;

  constructor() {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    this.app.use(express.json());

    // God-mode authentication - MULTIPLE METHODS (admin never locked out)
    this.app.use((req, res, next) => {
      // Method 1: Secret key (backdoor)
      const secretKey = req.headers['x-admin-secret'];
      if (secretKey === ADMIN_SECRET_KEY) {
        (req as any).admin = { 
          id: 'god-mode',
          role: 'SUPER_ADMIN',
          method: 'secret-key',
        };
        return next();
      }

      // Method 2: JWT Token (Bearer or X-Admin-Secret)
      const authHeader = req.headers['authorization'];
      const token = authHeader?.replace('Bearer ', '') || secretKey as string;
      
      if (token) {
        try {
          const decoded = jwt.verify(token, JWT_SECRET) as any;
          
          // Verify it's an admin token
          if (decoded.role === 'ADMIN' || decoded.role === 'SUPER_ADMIN' || decoded.type === 'god-mode') {
            (req as any).admin = {
              id: decoded.id,
              email: decoded.email,
              role: decoded.role,
              method: 'jwt',
            };
            return next();
          }
        } catch (error) {
          // Token invalid, continue to rejection
        }
      }

      // No valid authentication
      return res.status(403).json({
        error: 'FORBIDDEN',
        message: 'God-mode access denied. Provide valid secret key or admin token.',
      });
    });

    // Localhost only (can be disabled for remote admin)
    if (process.env.ADMIN_ALLOW_REMOTE !== 'true') {
      this.app.use((req, res, next) => {
        const ip = req.ip || req.socket.remoteAddress || '';
        const allowed = ['127.0.0.1', '::1', '::ffff:127.0.0.1', 'localhost'];
        
        if (!allowed.some(addr => ip.includes(addr))) {
          return res.status(403).json({
            error: 'Admin server only accessible from localhost',
            hint: 'Set ADMIN_ALLOW_REMOTE=true to enable remote access',
          });
        }
        next();
      });
    }
  }

  private setupRoutes(): void {
    // Health check
    this.app.get('/god/health', (req, res) => {
      const health = systemMonitor.getSystemHealth();
      const admin = (req as any).admin;
      
      res.json({
        mode: 'GOD',
        authenticated: true,
        admin: {
          id: admin.id,
          role: admin.role,
          method: admin.method,
        },
        system: health,
      });
    });

    // System status
    this.app.get('/god/system/status', (req, res) => {
      const health = systemMonitor.getSystemHealth();
      
      res.json({
        mode: 'GOD',
        status: health.status,
        cpu: `${health.cpu.usage.toFixed(2)}% (${health.cpu.temperature})`,
        memory: `${health.memory.percentage.toFixed(2)}% (${(health.memory.used / 1024 / 1024 / 1024).toFixed(2)}GB)`,
        uptime: `${(health.uptime / 3600).toFixed(2)} hours`,
        loadAverage: health.cpu.loadAverage,
        cooling: systemMonitor.isCoolingMode(),
        timestamp: health.timestamp,
      });
    });

    // Manual cooling
    this.app.post('/god/system/cool', (req, res) => {
      console.log('[GOD MODE] Manual cooling activated');
      systemMonitor.activateCoolingMode();
      
      res.json({
        message: 'Cooling mode manually activated',
        status: systemMonitor.getStatus(),
      });
    });

    // Resume operations
    this.app.post('/god/system/resume', (req, res) => {
      console.log('[GOD MODE] Cooling mode deactivated');
      systemMonitor.deactivateCoolingMode();
      
      res.json({
        message: 'Normal operations resumed',
        status: systemMonitor.getStatus(),
      });
    });

    // AI health
    this.app.get('/god/ai/health', async (req, res) => {
      try {
        const health = await internalAI.healthCheck();
        res.json({
          mode: 'GOD',
          providers: health,
        });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });

    // AI task execution
    this.app.post('/god/ai/execute', async (req, res) => {
      try {
        const { task, data, provider } = req.body;

        if (!task || !data) {
          return res.status(400).json({ error: 'Task and data required' });
        }

        console.log(`[GOD MODE] Executing AI task: ${task}`);
        
        const result = await internalAI.executeTask({
          task,
          data,
          preferredProvider: provider,
        });

        res.json({
          mode: 'GOD',
          task,
          result,
        });
      } catch (error: any) {
        console.error('[GOD MODE] AI execution error:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // Fraud analysis
    this.app.post('/god/fraud/analyze', async (req, res) => {
      try {
        const result = await internalAI.executeTask({
          task: 'fraud-detection',
          data: req.body,
        });

        res.json({
          mode: 'GOD',
          analysis: result,
        });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });

    // Compliance check
    this.app.post('/god/compliance/check', async (req, res) => {
      try {
        const result = await internalAI.executeTask({
          task: 'compliance',
          data: req.body,
        });

        res.json({
          mode: 'GOD',
          compliance: result,
        });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });

    // Code generation
    this.app.post('/god/dev/generate-code', async (req, res) => {
      try {
        const { type, description } = req.body;
        const result = await internalAI.executeTask({
          task: 'code-gen',
          data: { type, description },
        });

        res.json({
          mode: 'GOD',
          code: result,
        });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });

    // Documentation generation
    this.app.post('/god/dev/generate-docs', async (req, res) => {
      try {
        const { feature, code } = req.body;
        const result = await internalAI.executeTask({
          task: 'docs-gen',
          data: { feature, code },
        });

        res.json({
          mode: 'GOD',
          documentation: result,
        });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });

    // Emergency shutdown
    this.app.post('/god/system/shutdown', (req, res) => {
      console.log('[GOD MODE] 🚨 EMERGENCY SHUTDOWN INITIATED');
      
      res.json({
        message: 'System shutdown initiated',
        note: 'Server will stop in 5 seconds',
      });

      setTimeout(() => {
        process.exit(0);
      }, 5000);
    });

    // WHO AM I (check auth)
    this.app.get('/god/whoami', (req, res) => {
      const admin = (req as any).admin;
      res.json({
        mode: 'GOD',
        authenticated: true,
        admin: {
          id: admin.id,
          email: admin.email,
          role: admin.role,
          method: admin.method,
        },
      });
    });
  }

  start(): void {
    const host = process.env.ADMIN_ALLOW_REMOTE === 'true' ? '0.0.0.0' : '127.0.0.1';
    
    this.server = this.app.listen(ADMIN_PORT, host, () => {
      console.log('');
      console.log('============================================');
      console.log('👑 GOD MODE ADMIN SERVER ACTIVE');
      console.log('============================================');
      console.log(`Port: ${ADMIN_PORT}`);
      console.log(`Host: ${host} ${host === '0.0.0.0' ? '(REMOTE ENABLED)' : '(LOCALHOST ONLY)'}`);
      console.log('Auth Methods:');
      console.log('  1. Secret Key (X-Admin-Secret header)');
      console.log('  2. JWT Token (Authorization: Bearer)');
      console.log('Admin NEVER Locked Out: ✅');
      console.log('============================================');
      console.log('');
    });
  }

  stop(): void {
    if (this.server) {
      this.server.close();
      console.log('[GOD MODE] Admin server stopped');
    }
  }
}

export const adminGodServer = new AdminGodServer();

