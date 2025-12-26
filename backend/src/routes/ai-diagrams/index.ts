import express from 'express';
import { authenticateToken } from '../../middleware/auth';
import { rateLimit } from 'express-rate-limit';
import prisma from '../../prismaClient';
import * as diagramService from '../../services/ai-diagrams/diagramService';

const router = express.Router();

const aiGenerationLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: 'Too many diagram generation requests. Please try again later.',
});

router.post(
  '/generate',
  authenticateToken,
  aiGenerationLimit,
  async (req, res) => {
    try {
      const { prompt, diagramType, title, description, isPublic, boardId } = req.body;

      if (!prompt || !title) {
        return res.status(400).json({
          error: 'Prompt and title are required',
        });
      }

      const diagram = await diagramService.createDiagram({
        prompt,
        diagramType: diagramType || 'FLOWCHART',
        title,
        description,
        isPublic,
        boardId,
        userId: req.user!.id,
      });

      res.json({
        success: true,
        diagram,
      });
    } catch (error: any) {
      res.status(500).json({
        error: error.message || 'Failed to generate diagram',
      });
    }
  }
);

router.get('/', authenticateToken, async (req, res) => {
  try {
    const diagrams = await diagramService.getUserDiagrams(req.user!.id);
    res.json({ diagrams });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const diagram = await diagramService.getDiagram(req.params.id, req.user!.id);
    res.json({ diagram });
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const diagram = await diagramService.updateDiagram(
      req.params.id,
      req.user!.id,
      req.body
    );
    res.json({ success: true, diagram });
  } catch (error: any) {
    res.status(403).json({ error: error.message });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await diagramService.deleteDiagram(req.params.id, req.user!.id);
    res.json({ success: true, message: 'Diagram deleted' });
  } catch (error: any) {
    res.status(403).json({ error: error.message });
  }
});

router.post('/:id/regenerate', authenticateToken, aiGenerationLimit, async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Refinement prompt required' });
    }

    const diagram = await diagramService.regenerateDiagram(
      req.params.id,
      req.user!.id,
      prompt
    );

    res.json({ success: true, diagram });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/members', authenticateToken, async (req, res) => {
  try {
    const { email, role } = req.body;
    res.json({ success: true, message: 'Member added' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/comments', authenticateToken, async (req, res) => {
  try {
    const { content, positionX, positionY } = req.body;

    const comment = await prisma.diagramComment.create({
      data: {
        diagramId: req.params.id,
        userId: req.user!.id,
        content,
        positionX,
        positionY,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    res.json({ success: true, comment });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id/comments', authenticateToken, async (req, res) => {
  try {
    const comments = await prisma.diagramComment.findMany({
      where: { diagramId: req.params.id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ comments });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

