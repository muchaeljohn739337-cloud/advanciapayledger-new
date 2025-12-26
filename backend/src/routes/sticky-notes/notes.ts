import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Create sticky note
router.post('/', authenticate, async (req, res) => {
  try {
    const { boardId, content, color, positionX, positionY, width, height, tags } = req.body;
    const userId = req.user?.id;
    
    // Check if user has permission to create notes on this board
    const board = await prisma.stickyNoteBoard.findFirst({
      where: {
        id: boardId,
        OR: [
          { createdById: userId },
          { members: { some: { userId, role: { in: ['OWNER', 'EDITOR'] } } } }
        ]
      }
    });
    
    if (!board) {
      return res.status(403).json({ error: 'No permission to add notes to this board' });
    }
    
    // Get max zIndex for this board
    const maxZNote = await prisma.stickyNote.findFirst({
      where: { boardId },
      orderBy: { zIndex: 'desc' }
    });
    
    const note = await prisma.stickyNote.create({
      data: {
        boardId,
        content: content || '',
        color: color || '#fef3c7',
        positionX: positionX || 0,
        positionY: positionY || 0,
        width: width || 200,
        height: height || 200,
        zIndex: (maxZNote?.zIndex || 0) + 1,
        tags: tags || [],
        createdById: userId
      },
      include: {
        createdBy: {
          select: { id: true, email: true, name: true }
        }
      }
    });
    
    res.status(201).json({ note });
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).json({ error: 'Failed to create note' });
  }
});

// Update sticky note
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { content, color, positionX, positionY, width, height, tags, isPinned, zIndex } = req.body;
    const userId = req.user?.id;
    
    // Check permission
    const existingNote = await prisma.stickyNote.findUnique({
      where: { id },
      include: {
        board: {
          include: {
            members: true
          }
        }
      }
    });
    
    if (!existingNote) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    const hasPermission = 
      existingNote.board.createdById === userId ||
      existingNote.board.members.some(m => m.userId === userId && ['OWNER', 'EDITOR'].includes(m.role));
    
    if (!hasPermission) {
      return res.status(403).json({ error: 'No permission to edit this note' });
    }
    
    const note = await prisma.stickyNote.update({
      where: { id },
      data: {
        ...(content !== undefined && { content }),
        ...(color && { color }),
        ...(positionX !== undefined && { positionX }),
        ...(positionY !== undefined && { positionY }),
        ...(width !== undefined && { width }),
        ...(height !== undefined && { height }),
        ...(tags && { tags }),
        ...(isPinned !== undefined && { isPinned }),
        ...(zIndex !== undefined && { zIndex }),
        updatedById: userId
      },
      include: {
        createdBy: {
          select: { id: true, email: true, name: true }
        },
        updatedBy: {
          select: { id: true, email: true, name: true }
        }
      }
    });
    
    res.json({ note });
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).json({ error: 'Failed to update note' });
  }
});

// Delete sticky note
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    const existingNote = await prisma.stickyNote.findUnique({
      where: { id },
      include: {
        board: {
          include: {
            members: true
          }
        }
      }
    });
    
    if (!existingNote) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    const hasPermission = 
      existingNote.board.createdById === userId ||
      existingNote.board.members.some(m => m.userId === userId && ['OWNER', 'EDITOR'].includes(m.role)) ||
      existingNote.createdById === userId;
    
    if (!hasPermission) {
      return res.status(403).json({ error: 'No permission to delete this note' });
    }
    
    await prisma.stickyNote.delete({ where: { id } });
    
    res.json({ success: true, message: 'Note deleted' });
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

// Bulk update note positions (for drag & drop)
router.put('/bulk/positions', authenticate, async (req, res) => {
  try {
    const { notes } = req.body; // Array of { id, positionX, positionY, zIndex }
    const userId = req.user?.id;
    
    // Update all notes
    const updates = await Promise.all(
      notes.map((note: any) =>
        prisma.stickyNote.update({
          where: { id: note.id },
          data: {
            positionX: note.positionX,
            positionY: note.positionY,
            zIndex: note.zIndex,
            updatedById: userId
          }
        })
      )
    );
    
    res.json({ success: true, updated: updates.length });
  } catch (error) {
    console.error('Error bulk updating positions:', error);
    res.status(500).json({ error: 'Failed to update positions' });
  }
});

export default router;
