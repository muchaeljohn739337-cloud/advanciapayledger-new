'use client';

import React, { useState, useRef, useEffect } from 'react';

interface NoteData {
  id: string;
  content: string;
  color: string;
  positionX: number;
  positionY: number;
  width: number;
  height: number;
  zIndex: number;
  isPinned: boolean;
  createdBy?: { name: string };
}

interface Props {
  note: NoteData;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<NoteData>) => void;
  onDelete: () => void;
  onBringToFront: () => void;
}

const NOTE_COLORS = [
  { name: 'Yellow', value: '#fef3c7', text: '#92400e' },
  { name: 'Pink', value: '#fce7f3', text: '#831843' },
  { name: 'Blue', value: '#dbeafe', text: '#1e3a8a' },
  { name: 'Green', value: '#d1fae5', text: '#065f46' },
  { name: 'Purple', value: '#e9d5ff', text: '#5b21b6' },
  { name: 'Orange', value: '#fed7aa', text: '#7c2d12' },
];

export const StickyNote: React.FC<Props> = ({
  note,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  onBringToFront
}) => {
  const [content, setContent] = useState(note.content);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ width: 0, height: 0, x: 0, y: 0 });
  const noteRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-save content on blur or after delay
  useEffect(() => {
    const timer = setTimeout(() => {
      if (content !== note.content) {
        onUpdate({ content });
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [content]);

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === textareaRef.current) return;
    
    e.preventDefault();
    onBringToFront();
    onSelect();
    
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - note.positionX,
      y: e.clientY - note.positionY
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newX = Math.max(0, e.clientX - dragOffset.x);
      const newY = Math.max(0, e.clientY - dragOffset.y);
      onUpdate({ positionX: newX, positionY: newY });
    } else if (isResizing) {
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;
      const newWidth = Math.max(150, resizeStart.width + deltaX);
      const newHeight = Math.max(150, resizeStart.height + deltaY);
      onUpdate({ width: newWidth, height: newHeight });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragOffset, resizeStart]);

  // Resize handler
  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({
      width: note.width,
      height: note.height,
      x: e.clientX,
      y: e.clientY
    });
  };

  const textColor = NOTE_COLORS.find(c => c.value === note.color)?.text || '#000';

  return (
    <>
      <div
        ref={noteRef}
        className={\bsolute rounded-lg shadow-lg transition-shadow cursor-move select-none \ \\}
        style={{
          left: \\px\,
          top: \\px\,
          width: \\px\,
          height: \\px\,
          zIndex: note.zIndex,
          backgroundColor: note.color,
          color: textColor
        }}
        onMouseDown={handleMouseDown}
        onClick={onSelect}
      >
        {/* Header */}
        <div className=\"flex items-center justify-between p-2 border-b border-black/10\">
          <div className=\"flex items-center gap-2\">
            {note.isPinned && (
              <svg className=\"w-4 h-4\" fill=\"currentColor\" viewBox=\"0 0 20 20\">
                <path d=\"M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L11 4.323V3a1 1 0 011-1z\" />
              </svg>
            )}
          </div>
          
          <div className=\"flex items-center gap-1\">
            {/* Color picker */}
            <div className=\"relative\">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                className=\"p-1 hover:bg-black/10 rounded transition-colors\"
                title=\"Options\"
              >
                <svg className=\"w-4 h-4\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\">
                  <path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth={2} d=\"M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z\" />
                </svg>
              </button>

              {showMenu && (
                <div className=\"absolute right-0 top-full mt-1 bg-white rounded-lg shadow-xl border border-gray-200 p-2 z-50 w-48\">
                  <div className=\"text-xs font-medium text-gray-700 mb-2\">Color</div>
                  <div className=\"grid grid-cols-3 gap-1 mb-3\">
                    {NOTE_COLORS.map(color => (
                      <button
                        key={color.value}
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdate({ color: color.value });
                          setShowMenu(false);
                        }}
                        className={\w-full h-8 rounded border-2 \\}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdate({ isPinned: !note.isPinned });
                      setShowMenu(false);
                    }}
                    className=\"w-full text-left px-2 py-1.5 text-sm hover:bg-gray-100 rounded flex items-center gap-2\"
                  >
                    <svg className=\"w-4 h-4\" fill=\"currentColor\" viewBox=\"0 0 20 20\">
                      <path d=\"M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L11 4.323V3a1 1 0 011-1z\" />
                    </svg>
                    {note.isPinned ? 'Unpin' : 'Pin'}
                  </button>

                  <hr className=\"my-2\" />

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Delete this note?')) {
                        onDelete();
                      }
                      setShowMenu(false);
                    }}
                    className=\"w-full text-left px-2 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded flex items-center gap-2\"
                  >
                    <svg className=\"w-4 h-4\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\">
                      <path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth={2} d=\"M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16\" />
                    </svg>
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onBlur={() => onUpdate({ content })}
          placeholder=\"Type your note...\"
          className=\"w-full h-[calc(100%-3rem)] p-3 bg-transparent resize-none focus:outline-none\"
          style={{ color: textColor }}
        />

        {/* Footer */}
        <div className=\"absolute bottom-0 left-0 right-0 p-2 flex items-center justify-between text-xs opacity-50\">
          <span>{note.createdBy?.name || 'You'}</span>
        </div>

        {/* Resize handle */}
        <div
          onMouseDown={handleResizeStart}
          className=\"absolute bottom-0 right-0 w-4 h-4 cursor-se-resize\"
          style={{
            background: \linear-gradient(135deg, transparent 50%, \40 50%)\
          }}
        />
      </div>

      {/* Click outside to close menu */}
      {showMenu && (
        <div
          className=\"fixed inset-0 z-40\"
          onClick={() => setShowMenu(false)}
        />
      )}
    </>
  );
};
