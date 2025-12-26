import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get all boards for current user
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    const boards = await prisma.stickyNoteBoard.findMany({
      where: {
        OR: [
          { createdById: userId },
          { members: { some: { userId } } },
          { isPublic: true }
        ]
      },
      include: {
        createdBy: {
          select: { id: true, email: true, name: true }
        },
        members: {
          include: {
            user: {
              select: { id: true, email: true, name: true }
            }
          }
        },
        _count: {
          select: { notes: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
    
    res.json({ boards });
  } catch (error) {
    console.error('Error fetching boards:', error);
    res.status(500).json({ error: 'Failed to fetch boards' });
  }
});

// Get specific board with notes
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    const board = await prisma.stickyNoteBoard.findFirst({
      where: {
        id,
        OR: [
          { createdById: userId },
          { members: { some: { userId } } },
          { isPublic: true }
        ]
      },
      include: {
        createdBy: {
          select: { id: true, email: true, name: true }
        },
        members: {
          include: {
            user: {
              select: { id: true, email: true, name: true }
            }
          }
        },
        notes: {
          include: {
            createdBy: {
              select: { id: true, email: true, name: true }
            },
            updatedBy: {
              select: { id: true, email: true, name: true }
            }
          },
          orderBy: { zIndex: 'asc' }
        }
      }
    });
    
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }
    
    res.json({ board });
  } catch (error) {
    console.error('Error fetching board:', error);
    res.status(500).json({ error: 'Failed to fetch board' });
  }
});

// Create new board
router.post('/', authenticate, async (req, res) => {
  try {
    const { name, description, isPublic, color } = req.body;
    const userId = req.user?.id;
    
    const board = await prisma.stickyNoteBoard.create({
      data: {
        name,
        description,
        isPublic: isPublic || false,
        color: color || '#f3f4f6',
        createdById: userId,
        members: {
          create: {
            userId,
            role: 'OWNER'
          }
        }
      },
      include: {
        createdBy: {
          select: { id: true, email: true, name: true }
        },
        members: {
          include: {
            user: {
              select: { id: true, email: true, name: true }
            }
          }
        }
      }
    });
    
    res.status(201).json({ board });
  } catch (error) {
    console.error('Error creating board:', error);
    res.status(500).json({ error: 'Failed to create board' });
  }
});

// Update board
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, isPublic, color } = req.body;
    const userId = req.user?.id;
    
    // Check if user has permission
    const existingBoard = await prisma.stickyNoteBoard.findFirst({
      where: {
        id,
        OR: [
          { createdById: userId },
          { members: { some: { userId, role: { in: ['OWNER', 'EDITOR'] } } } }
        ]
      }
    });
    
    if (!existingBoard) {
      return res.status(403).json({ error: 'No permission to edit this board' });
    }
    
    const board = await prisma.stickyNoteBoard.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(isPublic !== undefined && { isPublic }),
        ...(color && { color })
      },
      include: {
        createdBy: {
          select: { id: true, email: true, name: true }
        },
        members: {
          include: {
            user: {
              select: { id: true, email: true, name: true }
            }
          }
        }
      }
    });
    
    res.json({ board });
  } catch (error) {
    console.error('Error updating board:', error);
    res.status(500).json({ error: 'Failed to update board' });
  }
});

// Delete board
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    const existingBoard = await prisma.stickyNoteBoard.findFirst({
      where: {
        id,
        createdById: userId
      }
    });
    
    if (!existingBoard) {
      return res.status(403).json({ error: 'Only board owner can delete' });
    }
    
    await prisma.stickyNoteBoard.delete({ where: { id } });
    
    res.json({ success: true, message: 'Board deleted' });
  } catch (error) {
    console.error('Error deleting board:', error);
    res.status(500).json({ error: 'Failed to delete board' });
  }
});

// Add member to board
router.post('/:id/members', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { userEmail, role } = req.body;
    const userId = req.user?.id;
    
    // Check if current user is owner
    const board = await prisma.stickyNoteBoard.findFirst({
      where: { id, createdById: userId }
    });
    
    if (!board) {
      return res.status(403).json({ error: 'Only owner can add members' });
    }
    
    // Find user by email
    const userToAdd = await prisma.users.findUnique({
      where: { email: userEmail }
    });
    
    if (!userToAdd) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const member = await prisma.boardMember.create({
      data: {
        boardId: id,
        userId: userToAdd.id,
        role: role || 'VIEWER'
      },
      include: {
        user: {
          select: { id: true, email: true, name: true }
        }
      }
    });
    
    res.status(201).json({ member });
  } catch (error) {
    console.error('Error adding member:', error);
    res.status(500).json({ error: 'Failed to add member' });
  }
});

// Remove member from board
router.delete('/:id/members/:memberId', authenticate, async (req, res) => {
  try {
    const { id, memberId } = req.params;
    const userId = req.user?.id;
    
    const board = await prisma.stickyNoteBoard.findFirst({
      where: { id, createdById: userId }
    });
    
    if (!board) {
      return res.status(403).json({ error: 'Only owner can remove members' });
    }
    
    await prisma.boardMember.delete({ where: { id: memberId } });
    
    res.json({ success: true, message: 'Member removed' });
  } catch (error) {
    console.error('Error removing member:', error);
    res.status(500).json({ error: 'Failed to remove member' });
  }
});

export default router;
