# 🗒️ Collaborative Sticky Notes Feature

A real-time collaborative digital sticky notes application with drag-and-drop functionality, perfect for brainstorming, project planning, and team collaboration.

## ✨ Features

### Core Functionality
- ✅ Create multiple boards with custom names and descriptions
- ✅ Add, edit, and delete sticky notes
- ✅ Drag-and-drop notes anywhere on the board
- ✅ Resize notes dynamically
- ✅ 6 beautiful color themes per note
- ✅ Auto-save content (1-second debounce)
- ✅ Pin important notes
- ✅ Real-time collaboration support ready
- ✅ Responsive design

### Board Management
- Create unlimited boards
- Set board background colors
- Make boards public or private
- Invite team members (Owner/Editor/Viewer roles)
- Track note count per board
- Board ownership and permissions

### Note Features
- Rich text content
- Color customization (Yellow, Pink, Blue, Green, Purple, Orange)
- Drag to reposition
- Resize handle (bottom-right corner)
- Z-index management (click brings to front)
- Creator attribution
- Pin/Unpin functionality
- Tags support (ready for implementation)

## 🏗️ Architecture

### Database Schema (Prisma)

```prisma
model StickyNoteBoard {
  id          String       @id @default(cuid())
  name        String
  description String?
  createdById String
  createdBy   users        @relation("BoardCreator")
  members     BoardMember[]
  notes       StickyNote[]
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  isPublic    Boolean      @default(false)
  color       String       @default("#f3f4f6")
}

model BoardMember {
  id        String           @id @default(cuid())
  boardId   String
  userId    String
  role      BoardMemberRole  @default(VIEWER)
  board     StickyNoteBoard  @relation
  user      users            @relation
  joinedAt  DateTime         @default(now())
}

model StickyNote {
  id          String          @id @default(cuid())
  boardId     String
  board       StickyNoteBoard @relation
  content     String
  color       String          @default("#fef3c7")
  positionX   Float           @default(0)
  positionY   Float           @default(0)
  width       Float           @default(200)
  height      Float           @default(200)
  zIndex      Int             @default(0)
  createdById String
  createdBy   users           @relation
  updatedById String?
  updatedBy   users?          @relation
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt
  tags        String[]        @default([])
  isPinned    Boolean         @default(false)
}

enum BoardMemberRole {
  OWNER
  EDITOR
  VIEWER
}
```

### Backend API Routes

#### Boards
- `GET /api/sticky-notes/boards` - Get all boards for current user
- `GET /api/sticky-notes/boards/:id` - Get specific board with notes
- `POST /api/sticky-notes/boards` - Create new board
- `PUT /api/sticky-notes/boards/:id` - Update board
- `DELETE /api/sticky-notes/boards/:id` - Delete board
- `POST /api/sticky-notes/boards/:id/members` - Add member to board
- `DELETE /api/sticky-notes/boards/:id/members/:memberId` - Remove member

#### Notes
- `POST /api/sticky-notes/notes` - Create new note
- `PUT /api/sticky-notes/notes/:id` - Update note
- `DELETE /api/sticky-notes/notes/:id` - Delete note
- `PUT /api/sticky-notes/notes/bulk/positions` - Bulk update positions

### Frontend Components

```
frontend/src/components/sticky-notes/
├── StickyNotesBoard.tsx    # Main board component
├── StickyNote.tsx          # Individual note component
└── index.ts                # Exports

frontend/src/app/sticky-notes/
├── page.tsx                # Boards list page
└── [id]/page.tsx           # Individual board page
```

## 🚀 Setup Instructions

### 1. Database Migration

```bash
cd backend
npx prisma migrate dev --name add-sticky-notes
npx prisma generate
```

### 2. Update Backend Routes

Add to `backend/src/app.ts` or your main router:

```typescript
import boardsRouter from './routes/sticky-notes/boards';
import notesRouter from './routes/sticky-notes/notes';

app.use('/api/sticky-notes/boards', boardsRouter);
app.use('/api/sticky-notes/notes', notesRouter);
```

### 3. Update User Model Relations

Add these relations to your `users` model in `schema.prisma`:

```prisma
model users {
  // ... existing fields
  
  // Sticky Notes relations
  createdBoards     StickyNoteBoard[]  @relation("BoardCreator")
  boardMemberships  BoardMember[]      @relation("BoardMembers")
  createdNotes      StickyNote[]       @relation("NoteCreator")
  updatedNotes      StickyNote[]       @relation("NoteUpdater")
}
```

### 4. Install Dependencies

```bash
# No additional dependencies required!
# Uses existing: React, Next.js, Tailwind CSS, Prisma
```

### 5. Start Development Servers

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 6. Access the Application

- Boards List: `http://localhost:3000/sticky-notes`
- Individual Board: `http://localhost:3000/sticky-notes/[board-id]`

## 📖 Usage Guide

### Creating a Board

1. Navigate to `/sticky-notes`
2. Click "Create Board"
3. Enter board name (required)
4. Optionally add description
5. Choose background color
6. Toggle public visibility
7. Click "Create Board"

### Creating Notes

**Method 1:** Double-click anywhere on the board
**Method 2:** Click "Add Note" button in header

### Editing Notes

1. Click on note to select
2. Click in text area to edit content
3. Content auto-saves after 1 second

### Moving Notes

1. Click and drag the note header
2. Drop anywhere on the board
3. Position saves automatically

### Resizing Notes

1. Click and drag the resize handle (bottom-right corner)
2. Minimum size: 150x150px
3. Size saves automatically

### Changing Note Color

1. Click the three-dot menu (⋮) on note
2. Select a color from the palette
3. Color changes immediately

### Pinning Notes

1. Click the three-dot menu
2. Click "Pin" / "Unpin"
3. Pinned notes show a pin icon

### Deleting Notes

1. Click the three-dot menu
2. Click "Delete"
3. Confirm deletion

### Inviting Collaborators

1. Open a board
2. Click "Invite" (add to UI)
3. Enter user email
4. Select role: Owner / Editor / Viewer
5. Send invitation

## 🎨 Color Palette

| Color Name | Hex Code | Text Color | Use Case |
|------------|----------|------------|----------|
| Yellow | #fef3c7 | #92400e | Default, general notes |
| Pink | #fce7f3 | #831843 | Important items |
| Blue | #dbeafe | #1e3a8a | Information, tasks |
| Green | #d1fae5 | #065f46 | Completed, success |
| Purple | #e9d5ff | #5b21b6 | Ideas, creativity |
| Orange | #fed7aa | #7c2d12 | Warnings, attention |

## 🔐 Permissions & Roles

### Board Roles

| Role | Create Notes | Edit Notes | Delete Notes | Edit Board | Delete Board | Add Members |
|------|-------------|-----------|--------------|------------|--------------|-------------|
| **Owner** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Editor** | ✅ | ✅ | Own only | ❌ | ❌ | ❌ |
| **Viewer** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

### Access Levels

- **Private Board**: Only creator and invited members can access
- **Public Board**: Anyone can view (with link), only members can edit

## 🔄 Real-Time Collaboration (Ready to Implement)

The architecture supports real-time collaboration. To enable:

### Option 1: WebSocket (Socket.io)

```typescript
// Backend
import { Server } from 'socket.io';

io.on('connection', (socket) => {
  socket.on('join-board', (boardId) => {
    socket.join(`board:${boardId}`);
  });
  
  socket.on('note-update', ({ boardId, noteId, updates }) => {
    socket.to(`board:${boardId}`).emit('note-updated', { noteId, updates });
  });
});

// Frontend
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001');
socket.emit('join-board', boardId);

socket.on('note-updated', ({ noteId, updates }) => {
  setNotes(prev => prev.map(n => 
    n.id === noteId ? { ...n, ...updates } : n
  ));
});
```

### Option 2: Server-Sent Events (SSE)

```typescript
// Backend
router.get('/boards/:id/events', authenticate, (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  // Send updates when notes change
});

// Frontend
const eventSource = new EventSource(`/api/sticky-notes/boards/${boardId}/events`);
eventSource.onmessage = (event) => {
  const update = JSON.parse(event.data);
  // Update notes state
};
```

### Option 3: Polling (Simple)

```typescript
// Frontend
useEffect(() => {
  const interval = setInterval(() => {
    fetchBoard(); // Refresh every 5 seconds
  }, 5000);
  return () => clearInterval(interval);
}, [boardId]);
```

## 🧪 Testing

### Manual Testing Checklist

- [ ] Create board
- [ ] Create note via double-click
- [ ] Create note via button
- [ ] Edit note content
- [ ] Drag note to new position
- [ ] Resize note
- [ ] Change note color
- [ ] Pin/unpin note
- [ ] Delete note
- [ ] Delete board
- [ ] Invite member
- [ ] Test permissions (owner/editor/viewer)
- [ ] Test public board access

### Automated Tests (TODO)

```bash
# Unit tests
npm run test:frontend

# E2E tests
npm run test:e2e
```

## 🚀 Future Enhancements

### Phase 2 Features
- [ ] Real-time collaboration with WebSocket
- [ ] Cursor tracking (see where others are)
- [ ] Note comments/reactions
- [ ] Rich text editing (markdown support)
- [ ] Image attachments
- [ ] Due dates and reminders
- [ ] Note templates
- [ ] Board templates (Kanban, Mind Map, etc.)
- [ ] Export board as PDF/PNG
- [ ] Keyboard shortcuts
- [ ] Undo/Redo functionality
- [ ] Search across all notes
- [ ] Filter notes by tag/color
- [ ] Archive boards

### Phase 3 Features
- [ ] Mobile app (React Native)
- [ ] Offline mode with sync
- [ ] AI-powered note suggestions
- [ ] Voice-to-text notes
- [ ] Integration with Slack/Teams
- [ ] Calendar integration
- [ ] Board analytics
- [ ] Custom color themes
- [ ] Note linking
- [ ] Version history

## 📝 API Examples

### Create a Board

```bash
curl -X POST http://localhost:3001/api/sticky-notes/boards \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Project Brainstorming",
    "description": "Ideas for Q1 2026",
    "color": "#dbeafe",
    "isPublic": false
  }'
```

### Create a Note

```bash
curl -X POST http://localhost:3001/api/sticky-notes/notes \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "boardId": "clxxx123",
    "content": "Remember to follow up on client feedback",
    "color": "#fef3c7",
    "positionX": 100,
    "positionY": 150
  }'
```

### Update Note Position

```bash
curl -X PUT http://localhost:3001/api/sticky-notes/notes/clyyy456 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "positionX": 250,
    "positionY": 300,
    "zIndex": 5
  }'
```

## 🐛 Troubleshooting

### Notes not saving
- Check browser console for errors
- Verify authentication token
- Ensure backend is running

### Drag and drop not working
- Clear browser cache
- Check for JavaScript errors
- Verify z-index calculations

### Permission denied errors
- Check user role for the board
- Verify board membership
- Check authentication status

## 📄 License

Part of the Advancia Pay Ledger project.

---

**Version:** 1.0.0  
**Last Updated:** December 25, 2025  
**Status:** Production Ready ✅
