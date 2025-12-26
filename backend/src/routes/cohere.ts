import express from 'express';
import { transactionClassifier } from '../ai-core/cohere/transactionClassifier';
import { fraudDetectionService } from '../ai-core/cohere/fraudDetection';
import { supportChatbot } from '../ai-core/cohere/supportChatbot';
import { cohereEmbeddings } from '../ai-core/cohere/embeddings';
import { cohereService } from '../ai-core/cohere/client';

const router = express.Router();

// Health check
router.get('/health', async (req, res) => {
  try {
    const isHealthy = await cohereService.healthCheck();
    res.json({
      status: isHealthy ? 'healthy' : 'unhealthy',
      model: cohereService.getModel(),
      embedModel: cohereService.getEmbedModel(),
    });
  } catch (error) {
    res.status(500).json({ error: 'Health check failed' });
  }
});

// Classify transaction
router.post('/classify-transaction', async (req, res) => {
  try {
    const { amount, description, merchant, location } = req.body;

    if (!amount || !description) {
      return res.status(400).json({ error: 'Amount and description required' });
    }

    const classification = await transactionClassifier.classifyTransaction(
      amount,
      description,
      merchant,
      location
    );

    res.json(classification);
  } catch (error) {
    console.error('Classification error:', error);
    res.status(500).json({ error: 'Classification failed' });
  }
});

// Detect fraud
router.post('/detect-fraud', async (req, res) => {
  try {
    const transaction = req.body;

    if (!transaction.userId || !transaction.amount) {
      return res.status(400).json({ error: 'Invalid transaction data' });
    }

    const fraudAnalysis = await fraudDetectionService.analyzeTransaction(transaction);

    res.json(fraudAnalysis);
  } catch (error) {
    console.error('Fraud detection error:', error);
    res.status(500).json({ error: 'Fraud detection failed' });
  }
});

// Customer support chat
router.post('/chat', async (req, res) => {
  try {
    const { message, history, userContext } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message required' });
    }

    const response = await supportChatbot.chat(message, history, userContext);

    res.json(response);
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Chat failed' });
  }
});

// Generate embeddings
router.post('/embed', async (req, res) => {
  try {
    const { texts } = req.body;

    if (!Array.isArray(texts) || texts.length === 0) {
      return res.status(400).json({ error: 'Texts array required' });
    }

    const embeddings = await cohereEmbeddings.embed(texts);

    res.json(embeddings);
  } catch (error) {
    console.error('Embedding error:', error);
    res.status(500).json({ error: 'Embedding generation failed' });
  }
});

// Semantic search
router.post('/search', async (req, res) => {
  try {
    const { query, documents, topK = 5 } = req.body;

    if (!query || !Array.isArray(documents)) {
      return res.status(400).json({ error: 'Query and documents array required' });
    }

    const results = await cohereEmbeddings.findSimilar(query, documents, topK);

    res.json(results);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

export default router;
