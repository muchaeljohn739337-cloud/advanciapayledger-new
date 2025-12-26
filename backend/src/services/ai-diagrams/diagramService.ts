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
    const mermaidCode = await generateDiagramWithAI(
      input.prompt,
      input.diagramType
    );

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

