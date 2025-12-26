/**
 * GOD-MODE ADMIN SERVER - WITH LOCAL OLLAMA AI
 * ADMIN NEVER LOCKED OUT
 * 100% Private Code Generation
 */

import express from 'express';
import jwt from 'jsonwebtoken';
import { systemMonitor } from '../system/healthMonitor';
import { ollamaClient } from '../ai-core/ollama/client';
import { localCodeGenerator } from '../ai-core/ollama/codeGenerator';

const ADMIN_PORT = parseInt(process.env.ADMIN_PORT || '5000');
const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY || 'CHANGE_THIS_IMMEDIATELY';
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

// Try to load cloud AI (optional)
let internalAI: any = null;
try {
  const orchestrator = require('../ai-core/admin/orchestrator');
  internalAI = orchestrator.internalAI;
  console.log('[GOD MODE] Cloud AI loaded (optional)');
} catch (error) {
  console.log('[GOD MODE] Cloud AI not available (using Ollama only)');
}

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

    // God-mode authentication - MULTIPLE METHODS
    this.app.use((req, res, next) => {
      const secretKey = req.headers['x-admin-secret'];
      if (secretKey === ADMIN_SECRET_KEY) {
        (req as any).admin = { 
          id: 'god-mode',
          role: 'SUPER_ADMIN',
          method: 'secret-key',
        };
        return next();
      }

      const authHeader = req.headers['authorization'];
      const token = authHeader?.replace('Bearer ', '') || secretKey as string;
      
      if (token) {
        try {
          const decoded = jwt.verify(token, JWT_SECRET) as any;
          
          if (decoded.role === 'ADMIN' || decoded.role === 'SUPER_ADMIN' || decoded.type === 'god-mode') {
            (req as any).admin = {
              id: decoded.id,
              email: decoded.email,
              role: decoded.role,
              method: 'jwt',
            };
            return next();
          }
        } catch (error) {}
      }

      return res.status(403).json({
        error: 'FORBIDDEN',
        message: 'God-mode access denied',
      });
    });

    // Localhost only
    if (process.env.ADMIN_ALLOW_REMOTE !== 'true') {
      this.app.use((req, res, next) => {
        const ip = req.ip || req.socket.remoteAddress || '';
        const allowed = ['127.0.0.1', '::1', '::ffff:127.0.0.1', 'localhost'];
        
        if (!allowed.some(addr => ip.includes(addr))) {
          return res.status(403).json({
            error: 'Admin server only accessible from localhost',
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
        cpu: `${health.cpu.usage.toFixed(2)}%`,
        memory: `${health.memory.percentage.toFixed(2)}%`,
        uptime: `${(health.uptime / 3600).toFixed(2)} hours`,
        cooling: systemMonitor.isCoolingMode(),
      });
    });

    // ====================
    // OLLAMA ENDPOINTS (LOCAL AI)
    // ====================

    // Ollama health check
    this.app.get('/god/ollama/health', async (req, res) => {
      try {
        const health = await ollamaClient.healthCheck();
        const models = health.healthy ? await ollamaClient.listModels() : [];

        res.json({
          mode: 'GOD',
          ollama: health,
          models: models.map((m: any) => ({
            name: m.name,
            size: m.size,
            modified: m.modified_at,
          })),
        });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });

    // List Ollama models
    this.app.get('/god/ollama/models', async (req, res) => {
      try {
        const models = await ollamaClient.listModels();
        res.json({
          mode: 'GOD',
          count: models.length,
          models: models.map((m: any) => ({
            name: m.name,
            size: m.size,
            family: m.details?.family,
            modified: m.modified_at,
          })),
        });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });

    // Pull new Ollama model
    this.app.post('/god/ollama/pull', async (req, res) => {
      try {
        const { model } = req.body;
        if (!model) return res.status(400).json({ error: 'Model name required' });

        console.log(`[GOD MODE] Pulling Ollama model: ${model}`);
        await ollamaClient.pullModel(model);

        res.json({
          mode: 'GOD',
          message: `Pulling model: ${model}`,
          note: 'Check terminal for download progress',
        });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });

    // Generate code (LOCAL AI)
    this.app.post('/god/ollama/generate-code', async (req, res) => {
      try {
        const { type, language, description, context, existingCode, model } = req.body;

        if (!type || !language || !description) {
          return res.status(400).json({ 
            error: 'Required: type, language, description' 
          });
        }

        console.log(`[GOD MODE] 💻 Generating ${type} in ${language}`);

        const result = await localCodeGenerator.generateCode({
          type,
          language,
          description,
          context,
          existingCode,
          model,
        });

        res.json({
          mode: 'GOD',
          type,
          language,
          code: result.code,
          explanation: result.explanation,
          cost: '$0.00',
          privacy: '100% LOCAL',
        });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });

    // Refactor code (LOCAL AI)
    this.app.post('/god/ollama/refactor', async (req, res) => {
      try {
        const { code, instructions, language } = req.body;

        if (!code || !instructions || !language) {
          return res.status(400).json({ 
            error: 'Required: code, instructions, language' 
          });
        }

        console.log(`[GOD MODE] 🔧 Refactoring ${language} code`);

        const refactoredCode = await localCodeGenerator.refactorCode(
          code,
          instructions,
          language
        );

        res.json({
          mode: 'GOD',
          language,
          original: code,
          refactored: refactoredCode,
          cost: '$0.00',
        });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });

    // Explain code (LOCAL AI)
    this.app.post('/god/ollama/explain', async (req, res) => {
      try {
        const { code, language } = req.body;

        if (!code || !language) {
          return res.status(400).json({ error: 'Required: code, language' });
        }

        console.log(`[GOD MODE] 📖 Explaining ${language} code`);

        const explanation = await localCodeGenerator.explainCode(code, language);

        res.json({
          mode: 'GOD',
          language,
          code,
          explanation,
        });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });

    // Fix code (LOCAL AI)
    this.app.post('/god/ollama/fix', async (req, res) => {
      try {
        const { code, error: errorMessage, language } = req.body;

        if (!code || !errorMessage || !language) {
          return res.status(400).json({ 
            error: 'Required: code, error, language' 
          });
        }

        console.log(`[GOD MODE] 🩹 Fixing ${language} code`);

        const fixedCode = await localCodeGenerator.fixCode(
          code,
          errorMessage,
          language
        );

        res.json({
          mode: 'GOD',
          language,
          original: code,
          fixed: fixedCode,
          error: errorMessage,
        });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });

    // ====================
    // CLOUD AI ENDPOINTS (OPTIONAL)
    // ====================

    if (internalAI) {
      this.app.get('/god/ai/health', async (req, res) => {
        try {
          const health = await internalAI.healthCheck();
          res.json({ mode: 'GOD', providers: health });
        } catch (error: any) {
          res.status(500).json({ error: error.message });
        }
      });

      this.app.post('/god/ai/execute', async (req, res) => {
        try {
          const { task, data, provider } = req.body;
          if (!task || !data) {
            return res.status(400).json({ error: 'Task and data required' });
          }

          const result = await internalAI.executeTask({
            task,
            data,
            preferredProvider: provider,
          });

          res.json({ mode: 'GOD', task, result });
        } catch (error: any) {
          res.status(500).json({ error: error.message });
        }
      });
    }

    // System cooling
    this.app.post('/god/system/cool', (req, res) => {
      systemMonitor.activateCoolingMode();
      res.json({ message: 'Cooling mode activated' });
    });

    this.app.post('/god/system/resume', (req, res) => {
      systemMonitor.deactivateCoolingMode();
      res.json({ message: 'Normal operations resumed' });
    });

    // Shutdown
    this.app.post('/god/system/shutdown', (req, res) => {
      console.log('[GOD MODE] 🚨 SHUTDOWN INITIATED');
      res.json({ message: 'Shutting down in 5 seconds' });
      setTimeout(() => process.exit(0), 5000);
    });

    // WHO AM I
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
      console.log(`Host: ${host}`);
      console.log('Auth: Dual (Secret Key + JWT)');
      console.log('LOCAL AI: ✅ Ollama (100% Private)');
      console.log(`Cloud AI: ${internalAI ? '✅ Available' : '❌ Disabled'}`);
      console.log('============================================');
      console.log('');
    });
  }

  stop(): void {
    if (this.server) {
      this.server.close();
    }
  }
}

export const adminGodServer = new AdminGodServer();
