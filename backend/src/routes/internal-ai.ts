import express from 'express';
import { adminOnly, superAdminOnly } from '../middleware/adminAuth';
import { internalAI } from '../ai-core/admin/orchestrator';

/**
 * INTERNAL AI ROUTES
 * Admin/Developer Only - NOT for end users
 * Protected by admin authentication
 */

const router = express.Router();

// All routes require admin authentication
router.use(adminOnly);

// ============================================
// HEALTH & MONITORING
// ============================================

router.get('/health', async (req, res) => {
  try {
    const health = await internalAI.healthCheck();
    res.json({
      status: 'Internal AI Systems',
      providers: health,
      note: 'Admin-only endpoints',
    });
  } catch (error) {
    res.status(500).json({ error: 'Health check failed' });
  }
});

// ============================================
// BACKEND PROCESSING (Auto-triggered)
// ============================================

router.post('/analyze-fraud', async (req, res) => {
  try {
    const result = await internalAI.executeTask({
      task: 'fraud-detection',
      data: req.body,
    });
    
    res.json({
      note: 'Internal fraud analysis - not shown to user',
      result,
    });
  } catch (error) {
    console.error('Fraud analysis error:', error);
    res.status(500).json({ error: 'Analysis failed' });
  }
});

router.post('/analyze-compliance', async (req, res) => {
  try {
    const result = await internalAI.executeTask({
      task: 'compliance',
      data: req.body,
    });
    
    res.json({
      note: 'Internal compliance check - admin review only',
      result,
    });
  } catch (error) {
    res.status(500).json({ error: 'Compliance check failed' });
  }
});

router.post('/classify-transaction', async (req, res) => {
  try {
    const result = await internalAI.executeTask({
      task: 'classification',
      data: req.body,
    });
    
    res.json({
      note: 'Backend classification - applied automatically',
      result,
    });
  } catch (error) {
    res.status(500).json({ error: 'Classification failed' });
  }
});

// ============================================
// ADMIN ANALYTICS & INSIGHTS
// ============================================

router.post('/admin-analytics', async (req, res) => {
  try {
    const result = await internalAI.executeTask({
      task: 'analytics',
      data: req.body,
    });
    
    res.json({
      note: 'Admin analytics dashboard data',
      result,
    });
  } catch (error) {
    res.status(500).json({ error: 'Analytics failed' });
  }
});

// ============================================
// DEVELOPER TOOLS (Super Admin Only)
// ============================================

router.post('/generate-code', superAdminOnly, async (req, res) => {
  try {
    const { type, description } = req.body;

    if (!type || !description) {
      return res.status(400).json({ error: 'Type and description required' });
    }

    const result = await internalAI.executeTask({
      task: 'code-gen',
      data: { type, description },
    });
    
    res.json({
      note: 'AI-generated code for developers',
      code: result,
    });
  } catch (error) {
    res.status(500).json({ error: 'Code generation failed' });
  }
});

router.post('/generate-docs', superAdminOnly, async (req, res) => {
  try {
    const { feature, code } = req.body;

    if (!feature) {
      return res.status(400).json({ error: 'Feature name required' });
    }

    const result = await internalAI.executeTask({
      task: 'docs-gen',
      data: { feature, code },
    });
    
    res.json({
      note: 'Auto-generated documentation',
      documentation: result,
    });
  } catch (error) {
    res.status(500).json({ error: 'Documentation generation failed' });
  }
});

router.post('/monitor-system', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message required' });
    }

    const result = await internalAI.executeTask({
      task: 'monitoring',
      data: { message },
    });
    
    res.json({
      note: 'System monitoring analysis',
      result,
    });
  } catch (error) {
    res.status(500).json({ error: 'Monitoring failed' });
  }
});

// ============================================
// ORCHESTRATION
// ============================================

router.post('/execute-task', async (req, res) => {
  try {
    const { task, data, preferredProvider } = req.body;

    if (!task || !data) {
      return res.status(400).json({ error: 'Task and data required' });
    }

    const result = await internalAI.executeTask({
      task,
      data,
      preferredProvider,
    });
    
    res.json({
      note: 'Internal AI task execution',
      result,
    });
  } catch (error) {
    console.error('Task execution error:', error);
    res.status(500).json({ error: 'Task execution failed' });
  }
});

export default router;
