import express from 'express';
import { claudeService } from '../ai-core/claude/client';
import { complianceService } from '../ai-core/claude/compliance';
import { financialAdvisor } from '../ai-core/claude/financialAdvisor';

const router = express.Router();

// Health check
router.get('/health', async (req, res) => {
  try {
    const isHealthy = await claudeService.healthCheck();
    res.json({
      status: isHealthy ? 'healthy' : 'unhealthy',
      model: claudeService.getModel(),
    });
  } catch (error) {
    res.status(500).json({ error: 'Health check failed' });
  }
});

// Compliance analysis
router.post('/analyze-compliance', async (req, res) => {
  try {
    const transaction = req.body;

    if (!transaction.userId || !transaction.amount) {
      return res.status(400).json({ error: 'Invalid transaction data' });
    }

    const analysis = await complianceService.analyzeCompliance(transaction);
    res.json(analysis);
  } catch (error) {
    console.error('Compliance analysis error:', error);
    res.status(500).json({ error: 'Analysis failed' });
  }
});

// Financial insights
router.post('/financial-insights', async (req, res) => {
  try {
    const { userId, monthlyIncome, transactions } = req.body;

    if (!userId || !transactions || !Array.isArray(transactions)) {
      return res.status(400).json({ error: 'Invalid data' });
    }

    const insights = await financialAdvisor.generateInsights({
      userId,
      monthlyIncome,
      transactions,
    });

    res.json(insights);
  } catch (error) {
    console.error('Insights error:', error);
    res.status(500).json({ error: 'Insights generation failed' });
  }
});

// General chat
router.post('/chat', async (req, res) => {
  try {
    const { message, systemPrompt } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message required' });
    }

    const response = await claudeService.chat(message, systemPrompt);
    res.json({ response });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Chat failed' });
  }
});

export default router;
