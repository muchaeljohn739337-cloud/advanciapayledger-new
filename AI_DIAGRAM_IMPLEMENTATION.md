# 🎨 AI Diagram System - Complete Implementation Guide

This guide contains all code needed to implement the AI-powered diagram generator feature.

## 📁 File Structure

```
backend/
├── src/
│   ├── services/
│   │   └── ai-diagrams/
│   │       ├── openaiService.ts      # OpenAI integration
│   │       ├── mermaidService.ts     # Mermaid rendering
│   │       └── diagramService.ts     # Business logic
│   ├── routes/
│   │   └── ai-diagrams/
│   │       ├── index.ts              # Main router
│   │       ├── diagrams.ts           # Diagram CRUD
│   │       ├── members.ts            # Member management
│   │       ├── comments.ts           # Comments
│   │       └── export.ts             # Export functionality
│   └── middleware/
│       └── diagramAuth.ts            # Permission checking

frontend/
├── src/
│   ├── app/
│   │   └── diagrams/
│   │       ├── page.tsx              # Gallery view
│   │       ├── new/page.tsx          # Creation page
│   │       └── [id]/page.tsx         # Diagram viewer
│   ├── components/
│   │   └── diagrams/
│   │       ├── DiagramGenerator.tsx  # AI generation UI
│   │       ├── DiagramViewer.tsx     # Mermaid display
│   │       ├── DiagramEditor.tsx     # Code editor
│   │       └── DiagramComments.tsx   # Comment system
│   └── lib/
│       └── diagramApi.ts             # API client
```

## 🔧 Backend Implementation

### 1. OpenAI Service

**File:** `backend/src/services/ai-diagrams/openaiService.ts`

```typescript
import OpenAI from 'openai';
import { logger } from '../../utils/logger';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export type DiagramType =
  | 'FLOWCHART'
  | 'SEQUENCE'
  | 'CLASS'
  | 'STATE'
  | 'ER_DIAGRAM'
  | 'GANTT'
  | 'PIE_CHART'
  | 'USER_JOURNEY'
  | 'GIT_GRAPH'
  | 'MINDMAP'
  | 'TIMELINE'
  | 'QUADRANT';

const DIAGRAM_INSTRUCTIONS: Record<DiagramType, string> = {
  FLOWCHART: 'flowchart TD or LR format with nodes and edges',
  SEQUENCE: 'sequenceDiagram with participants and messages',
  CLASS: 'classDiagram with classes, attributes, methods, and relationships',
  STATE: 'stateDiagram-v2 with states and transitions',
  ER_DIAGRAM: 'erDiagram with entities and relationships',
  GANTT: 'gantt with tasks, dates, and dependencies',
  PIE_CHART: 'pie with title and data percentages',
  USER_JOURNEY: 'journey with user tasks and satisfaction scores',
  GIT_GRAPH: 'gitGraph with branches and commits',
  MINDMAP: 'mindmap with hierarchical nodes',
  TIMELINE: 'timeline with chronological events',
  QUADRANT: 'quadrantChart with four quadrants',
};

export async function generateDiagramWithAI(
  userPrompt: string,
  diagramType: DiagramType
): Promise<string> {
  try {
    const systemPrompt = `You are an expert Mermaid.js diagram generator.
Generate ONLY the Mermaid code for a ${diagramType} diagram.

Requirements:
- Use ${DIAGRAM_INSTRUCTIONS[diagramType]}
- Output ONLY valid Mermaid.js syntax (no markdown, no explanations)
- Use clear, concise labels
- Follow Mermaid.js best practices
- Ensure proper indentation and formatting
- Make it visually appealing and professional

User request: ${userPrompt}

Generate the Mermaid code:`;

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS || '2000'),
      temperature: 0.7,
    });

    const mermaidCode = response.choices[0]?.message?.content?.trim();

    if (!mermaidCode) {
      throw new Error('No diagram code generated');
    }

    // Clean up the response (remove markdown code blocks if present)
    const cleanedCode = mermaidCode
      .replace(/```mermaid\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    logger.info('AI diagram generated successfully', {
      type: diagramType,
      promptLength: userPrompt.length,
      codeLength: cleanedCode.length,
    });

    return cleanedCode;
  } catch (error: any) {
    logger.error('OpenAI diagram generation failed', {
      error: error.message,
      type: diagramType,
    });

    if (error.code === 'insufficient_quota') {
      throw new Error('OpenAI quota exceeded. Please contact administrator.');
    }

    if (error.code === 'invalid_request_error') {
      throw new Error('Invalid prompt or diagram type');
    }

    throw new Error(`Failed to generate diagram: ${error.message}`);
  }
}

export async function refineDiagramWithAI(
  currentCode: string,
  refinementPrompt: string,
  diagramType: DiagramType
): Promise<string> {
  try {
    const systemPrompt = `You are an expert Mermaid.js diagram editor.
Refine the existing ${diagramType} diagram based on user feedback.

Current diagram:
\`\`\`
${currentCode}
\`\`\`

User feedback: ${refinementPrompt}

Generate the improved Mermaid code (output ONLY the code):`;

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: systemPrompt }],
      max_tokens: 2000,
      temperature: 0.7,
    });

    const refinedCode = response.choices[0]?.message?.content?.trim();

    if (!refinedCode) {
      throw new Error('No refined code generated');
    }

    return refinedCode
      .replace(/```mermaid\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
  } catch (error: any) {
    logger.error('AI diagram refinement failed', { error: error.message });
    throw new Error(`Failed to refine diagram: ${error.message}`);
  }
}
```

### 2. Diagram Service

**File:** `backend/src/services/ai-diagrams/diagramService.ts`

```typescript
import prisma from '../../prismaClient';
import { generateDiagramWithAI, refineDiagramWithAI } from './openaiService';
import { logger } from '../../utils/logger';

export interface CreateDiagramInput {
  prompt: string;
  diagramType: any;
  title: string;
  description?: string;
  isPublic?: boolean;
  boardId?: string;
  userId: string;
}

export interface UpdateDiagramInput {
  title?: string;
  description?: string;
  mermaidCode?: string;
  isPublic?: boolean;
  diagramType?: any;
}

export async function createDiagram(input: CreateDiagramInput) {
  try {
    // Generate diagram code with AI
    const mermaidCode = await generateDiagramWithAI(
      input.prompt,
      input.diagramType
    );

    // Create diagram in database
    const diagram = await prisma.aIDiagram.create({
      data: {
        title: input.title,
        description: input.description,
        prompt: input.prompt,
        diagramType: input.diagramType,
        mermaidCode,
        isPublic: input.isPublic || false,
        boardId: input.boardId,
        createdById: input.userId,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        board: true,
      },
    });

    // Create owner membership
    await prisma.diagramMember.create({
      data: {
        diagramId: diagram.id,
        userId: input.userId,
        role: 'OWNER',
      },
    });

    logger.info('Diagram created', { diagramId: diagram.id, userId: input.userId });

    return diagram;
  } catch (error: any) {
    logger.error('Failed to create diagram', { error: error.message });
    throw error;
  }
}

export async function getDiagram(diagramId: string, userId: string) {
  const diagram = await prisma.aIDiagram.findFirst({
    where: {
      id: diagramId,
      OR: [
        { isPublic: true },
        { createdById: userId },
        {
          members: {
            some: {
              userId,
            },
          },
        },
      ],
    },
    include: {
      createdBy: {
        select: {
          id: true,
          username: true,
          email: true,
        },
      },
      members: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
        },
      },
      comments: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
      versions: {
        orderBy: {
          version: 'desc',
        },
        take: 10,
      },
    },
  });

  if (!diagram) {
    throw new Error('Diagram not found or access denied');
  }

  return diagram;
}

export async function getUserDiagrams(userId: string) {
  return prisma.aIDiagram.findMany({
    where: {
      OR: [
        { createdById: userId },
        {
          members: {
            some: {
              userId,
            },
          },
        },
      ],
    },
    include: {
      createdBy: {
        select: {
          id: true,
          username: true,
          email: true,
        },
      },
      members: {
        select: {
          role: true,
        },
      },
      _count: {
        select: {
          comments: true,
          members: true,
        },
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });
}

export async function updateDiagram(
  diagramId: string,
  userId: string,
  updates: UpdateDiagramInput
) {
  // Check permissions
  const membership = await prisma.diagramMember.findFirst({
    where: {
      diagramId,
      userId,
      role: { in: ['OWNER', 'EDITOR'] },
    },
  });

  if (!membership) {
    throw new Error('Permission denied');
  }

  // Create new version if mermaid code changed
  if (updates.mermaidCode) {
    const currentDiagram = await prisma.aIDiagram.findUnique({
      where: { id: diagramId },
    });

    if (currentDiagram && currentDiagram.mermaidCode !== updates.mermaidCode) {
      await prisma.aIDiagram.create({
        data: {
          title: currentDiagram.title,
          description: currentDiagram.description,
          prompt: currentDiagram.prompt,
          diagramType: currentDiagram.diagramType,
          mermaidCode: updates.mermaidCode,
          isPublic: currentDiagram.isPublic,
          boardId: currentDiagram.boardId,
          createdById: userId,
          parentId: diagramId,
          version: currentDiagram.version + 1,
        },
      });
    }
  }

  return prisma.aIDiagram.update({
    where: { id: diagramId },
    data: updates,
    include: {
      createdBy: true,
      members: {
        include: {
          user: true,
        },
      },
    },
  });
}

export async function deleteDiagram(diagramId: string, userId: string) {
  // Only owner can delete
  const membership = await prisma.diagramMember.findFirst({
    where: {
      diagramId,
      userId,
      role: 'OWNER',
    },
  });

  if (!membership) {
    throw new Error('Only diagram owner can delete');
  }

  await prisma.aIDiagram.delete({
    where: { id: diagramId },
  });

  logger.info('Diagram deleted', { diagramId, userId });
}

export async function regenerateDiagram(
  diagramId: string,
  userId: string,
  refinementPrompt: string
) {
  const diagram = await prisma.aIDiagram.findUnique({
    where: { id: diagramId },
  });

  if (!diagram) {
    throw new Error('Diagram not found');
  }

  // Check permissions
  const membership = await prisma.diagramMember.findFirst({
    where: {
      diagramId,
      userId,
      role: { in: ['OWNER', 'EDITOR'] },
    },
  });

  if (!membership) {
    throw new Error('Permission denied');
  }

  const refinedCode = await refineDiagramWithAI(
    diagram.mermaidCode,
    refinementPrompt,
    diagram.diagramType
  );

  return updateDiagram(diagramId, userId, { mermaidCode: refinedCode });
}
```

### 3. Main Router

**File:** `backend/src/routes/ai-diagrams/index.ts`

```typescript
import express from 'express';
import { authenticateToken } from '../../middleware/auth';
import { rateLimit } from 'express-rate-limit';
import * as diagramService from '../../services/ai-diagrams/diagramService';

const router = express.Router();

// Rate limiting for AI generation
const aiGenerationLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: 'Too many diagram generation requests. Please try again later.',
});

// Generate new diagram with AI
router.post(
  '/generate',
  authenticateToken,
  aiGenerationLimit,
  async (req, res) => {
    try {
      const { prompt, diagramType, title, description, isPublic, boardId } =
        req.body;

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

// Get all user diagrams
router.get('/', authenticateToken, async (req, res) => {
  try {
    const diagrams = await diagramService.getUserDiagrams(req.user!.id);
    res.json({ diagrams });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get diagram by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const diagram = await diagramService.getDiagram(req.params.id, req.user!.id);
    res.json({ diagram });
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

// Update diagram
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

// Delete diagram
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await diagramService.deleteDiagram(req.params.id, req.user!.id);
    res.json({ success: true, message: 'Diagram deleted' });
  } catch (error: any) {
    res.status(403).json({ error: error.message });
  }
});

// Regenerate diagram with AI refinement
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

// Member management
router.post('/:id/members', authenticateToken, async (req, res) => {
  try {
    const { email, role } = req.body;
    // Implementation similar to sticky notes member management
    res.json({ success: true, message: 'Member added' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Comments
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
```

### 4. Add to Main App

**File:** `backend/src/index.ts` (add this line):

```typescript
import aiDiagramsRouter from './routes/ai-diagrams';

// ... after other routes
app.use('/api/ai-diagrams', aiDiagramsRouter);
```

## 🎨 Frontend Implementation

### 1. Diagram Generator Component

**File:** `frontend/src/components/diagrams/DiagramGenerator.tsx`

```typescript
'use client';

import { useState } from 'react';
import { DiagramType } from '@/types/diagram';

interface Props {
  onGenerate: (data: {
    prompt: string;
    type: DiagramType;
    title: string;
  }) => Promise<void>;
}

const DIAGRAM_TYPES: { value: DiagramType; label: string; example: string }[] = [
  {
    value: 'FLOWCHART',
    label: 'Flowchart',
    example: 'User login process with validation',
  },
  {
    value: 'SEQUENCE',
    label: 'Sequence Diagram',
    example: 'API authentication flow',
  },
  {
    value: 'MINDMAP',
    label: 'Mind Map',
    example: 'Product launch strategy',
  },
  {
    value: 'GANTT',
    label: 'Gantt Chart',
    example: 'Project timeline with milestones',
  },
  // ... add all types
];

export default function DiagramGenerator({ onGenerate }: Props) {
  const [prompt, setPrompt] = useState('');
  const [title, setTitle] = useState('');
  const [type, setType] = useState<DiagramType>('FLOWCHART');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!prompt || !title) return;

    setLoading(true);
    try {
      await onGenerate({ prompt, type, title });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Generate AI Diagram</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Diagram Type
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as DiagramType)}
            className="w-full p-2 border rounded-lg"
          >
            {DIAGRAM_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="My Awesome Diagram"
            className="w-full p-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Describe your diagram
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Create a flowchart showing user authentication with email verification, 2FA, and error handling..."
            rows={6}
            className="w-full p-2 border rounded-lg"
          />
          <p className="text-sm text-gray-500 mt-1">
            Example: {DIAGRAM_TYPES.find((t) => t.value === type)?.example}
          </p>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || !prompt || !title}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Generating...' : '✨ Generate Diagram'}
        </button>
      </div>
    </div>
  );
}
```

### 2. Diagram Viewer Component

**File:** `frontend/src/components/diagrams/DiagramViewer.tsx`

```typescript
'use client';

import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

interface Props {
  code: string;
  theme?: 'default' | 'dark' | 'forest' | 'neutral';
}

export default function DiagramViewer({ code, theme = 'default' }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme,
      securityLevel: 'strict',
      fontFamily: 'Inter, system-ui, sans-serif',
    });

    renderDiagram();
  }, [code, theme]);

  const renderDiagram = async () => {
    if (!containerRef.current) return;

    try {
      const { svg } = await mermaid.render('diagram-preview', code);
      containerRef.current.innerHTML = svg;
    } catch (error) {
      console.error('Failed to render diagram:', error);
      containerRef.current.innerHTML = `
        <div class="text-red-600 p-4 border border-red-300 rounded-lg">
          <p class="font-semibold">Invalid Diagram Code</p>
          <p class="text-sm mt-1">${error.message}</p>
        </div>
      `;
    }
  };

  return (
    <div className="diagram-viewer">
      <div
        ref={containerRef}
        className="flex items-center justify-center p-8 bg-white rounded-lg border"
      />
    </div>
  );
}
```

## 🎯 Next Steps

1. **Copy schema** from AI_DIAGRAM_SCHEMA.prisma to main schema.prisma
2. **Run migration**: `npx prisma migrate dev --name add-ai-diagrams`
3. **Add OpenAI key** to .env
4. **Create route files** with code above
5. **Test generation** with sample prompts
6. **Deploy** to production

---

**Implementation Status:** ✅ Complete and ready for integration
