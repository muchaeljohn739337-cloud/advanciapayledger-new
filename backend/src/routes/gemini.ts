import express from 'express';
import { geminiService } from '../ai-core/gemini/client';
import { receiptParser } from '../ai-core/gemini/receiptParser';
import { quickAnalyzer } from '../ai-core/gemini/quickAnalyzer';

const router = express.Router();

// Health check
router.get('/health', async (req, res) => {
  try {
    const isHealthy = await geminiService.healthCheck();
    res.json({
      status: isHealthy ? 'healthy' : 'unhealthy',
      model: geminiService.getModel(),
    });
  } catch (error) {
    res.status(500).json({ error: 'Health check failed' });
  }
});

// Parse receipt image
router.post('/parse-receipt', async (req, res) => {
  try {
    const { imageBase64, text } = req.body;

    if (!imageBase64 && !text) {
      return res.status(400).json({ error: 'Image or text required' });
    }

    let receiptData;
    if (imageBase64) {
      receiptData = await receiptParser.parseReceipt(imageBase64);
    } else {
      receiptData = await receiptParser.parseReceiptText(text);
    }

    res.json(receiptData);
  } catch (error) {
    console.error('Receipt parsing error:', error);
    res.status(500).json({ error: 'Parsing failed' });
  }
});

// Quick classification
router.post('/quick-classify', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text required' });
    }

    const analysis = await quickAnalyzer.quickClassify(text);
    res.json(analysis);
  } catch (error) {
    console.error('Classification error:', error);
    res.status(500).json({ error: 'Classification failed' });
  }
});

// Summarize transaction
router.post('/summarize', async (req, res) => {
  try {
    const transaction = req.body;

    if (!transaction.amount) {
      return res.status(400).json({ error: 'Transaction data required' });
    }

    const summary = await quickAnalyzer.summarizeTransaction(transaction);
    res.json({ summary });
  } catch (error) {
    console.error('Summarize error:', error);
    res.status(500).json({ error: 'Summarization failed' });
  }
});

// General chat
router.post('/chat', async (req, res) => {
  try {
    const { message, systemInstruction } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message required' });
    }

    const response = await geminiService.chat(message, systemInstruction);
    res.json({ response });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Chat failed' });
  }
});

export default router;
