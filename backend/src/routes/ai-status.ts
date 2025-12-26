import { Router } from 'express';
import { localAI } from '../services/LocalAIService';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Get AI service status
router.get('/status', authenticateToken as any, async (req, res) => {
  try {
    const status = localAI.getStatus();
    const isHealthy = await localAI.healthCheck();
    const models = await localAI.getAvailableModels();

    res.json({
      success: true,
      status: {
        ...status,
        healthy: isHealthy,
        availableModels: models,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Test AI completion
router.post('/test', authenticateToken as any, async (req: any, res) => {
  try {
    const { prompt = 'Say hello in 5 words' } = req.body;
    
    const startTime = Date.now();
    const response = await localAI.complete(prompt, 100);
    const duration = Date.now() - startTime;

    res.json({
      success: true,
      response,
      duration,
      provider: 'ollama',
      local: true,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
