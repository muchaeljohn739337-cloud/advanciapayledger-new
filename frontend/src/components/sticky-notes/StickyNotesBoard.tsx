'use client';

import React, { useState, useEffect, useRef } from 'react';
import { StickyNote } from './StickyNote';

interface Note {
  id: string;
  content: string;
  color: string;
  positionX: number;
  positionY: number;
  width: number;
  height: number;
  zIndex: number;
  isPinned: boolean;
  tags: string[];
  createdBy: { id: string; name: string; email: string };
  createdAt: string;
  updatedAt: string;
}

interface Board {
  id: string;
  name: string;
  description?: string;
  color: string;
  notes: Note[];
}

interface Props {
  boardId: string;
}

export const StickyNotesBoard: React.FC<Props> = ({ boardId }) => {
  const [board, setBoard] = useState<Board | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);

  // Fetch board and notes
  useEffect(() => {
    fetchBoard();
  }, [boardId]);

  const fetchBoard = async () => {
    try {
      const response = await fetch(\/api/sticky-notes/boards/\\, {
        headers: {
          'Authorization': \Bearer \\
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setBoard(data.board);
        setNotes(data.board.notes || []);
      }
    } catch (error) {
      console.error('Error fetching board:', error);
    } finally {
      setLoading(false);
    }
  };

  // Create new note
  const createNote = async (x: number, y: number) => {
    try {
      setIsCreatingNote(true);
      const response = await fetch('/api/sticky-notes/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \Bearer \\
        },
        body: JSON.stringify({
          boardId,
          content: '',
          positionX: x,
          positionY: y,
          color: '#fef3c7'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setNotes(prev => [...prev, data.note]);
        setSelectedNoteId(data.note.id);
      }
    } catch (error) {
      console.error('Error creating note:', error);
    } finally {
      setIsCreatingNote(false);
    }
  };

  // Update note
  const updateNote = async (noteId: string, updates: Partial<Note>) => {
    try {
      const response = await fetch(\/api/sticky-notes/notes/\\, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \Bearer \\
        },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        const data = await response.json();
        setNotes(prev => prev.map(n => n.id === noteId ? data.note : n));
      }
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };

  // Delete note
  const deleteNote = async (noteId: string) => {
    try {
      const response = await fetch(\/api/sticky-notes/notes/\\, {
        method: 'DELETE',
        headers: {
          'Authorization': \Bearer \\
        }
      });

      if (response.ok) {
        setNotes(prev => prev.filter(n => n.id !== noteId));
      }
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  // Handle board double-click to create note
  const handleBoardDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === boardRef.current && !isCreatingNote) {
      const rect = boardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - 100; // Center the note
      const y = e.clientY - rect.top - 100;
      createNote(Math.max(0, x), Math.max(0, y));
    }
  };

  // Bring note to front
  const bringToFront = (noteId: string) => {
    const maxZ = Math.max(...notes.map(n => n.zIndex), 0);
    updateNote(noteId, { zIndex: maxZ + 1 });
  };

  if (loading) {
    return (
      <div className=\"flex items-center justify-center h-screen\">
        <div className=\"animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600\"></div>
      </div>
    );
  }

  if (!board) {
    return (
      <div className=\"flex items-center justify-center h-screen\">
        <p className=\"text-gray-500\">Board not found</p>
      </div>
    );
  }

  return (
    <div className=\"h-screen flex flex-col\">
      {/* Header */}
      <div className=\"bg-white border-b px-6 py-4 flex items-center justify-between\">
        <div>
          <h1 className=\"text-2xl font-bold text-gray-900\">{board.name}</h1>
          {board.description && (
            <p className=\"text-sm text-gray-600 mt-1\">{board.description}</p>
          )}
        </div>
        
        <div className=\"flex items-center gap-3\">
          <button
            onClick={() => {
              const rect = boardRef.current?.getBoundingClientRect();
              if (rect) {
                createNote(
                  Math.random() * (rect.width - 200),
                  Math.random() * (rect.height - 200)
                );
              }
            }}
            disabled={isCreatingNote}
            className=\"px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed\"
          >
            <svg className=\"w-5 h-5\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\">
              <path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth={2} d=\"M12 4v16m8-8H4\" />
            </svg>
            Add Note
          </button>
          
          <div className=\"flex items-center gap-2 text-sm text-gray-600\">
            <svg className=\"w-4 h-4\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\">
              <path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth={2} d=\"M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10\" />
            </svg>
            <span>{notes.length} notes</span>
          </div>
        </div>
      </div>

      {/* Board Area */}
      <div
        ref={boardRef}
        onDoubleClick={handleBoardDoubleClick}
        className=\"flex-1 relative overflow-auto\"
        style={{ backgroundColor: board.color }}
      >
        {/* Instructions overlay when empty */}
        {notes.length === 0 && !isCreatingNote && (
          <div className=\"absolute inset-0 flex items-center justify-center pointer-events-none\">
            <div className=\"text-center text-gray-400\">
              <svg className=\"w-16 h-16 mx-auto mb-4\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\">
                <path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth={1.5} d=\"M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z\" />
              </svg>
              <p className=\"text-lg font-medium mb-2\">No notes yet</p>
              <p className=\"text-sm\">Double-click anywhere or click \"Add Note\" to create one</p>
            </div>
          </div>
        )}

        {/* Render all notes */}
        {notes.map(note => (
          <StickyNote
            key={note.id}
            note={note}
            isSelected={selectedNoteId === note.id}
            onSelect={() => setSelectedNoteId(note.id)}
            onUpdate={(updates) => updateNote(note.id, updates)}
            onDelete={() => deleteNote(note.id)}
            onBringToFront={() => bringToFront(note.id)}
          />
        ))}
      </div>

      {/* Hint */}
      <div className=\"bg-gray-50 border-t px-6 py-2 text-xs text-gray-500 flex items-center justify-center gap-4\">
        <span>💡 Double-click to create a note</span>
        <span>•</span>
        <span>Drag to move notes</span>
        <span>•</span>
        <span>Click to edit</span>
      </div>
    </div>
  );
};
