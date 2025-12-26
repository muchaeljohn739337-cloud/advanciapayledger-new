-- CreateEnum
CREATE TYPE "BoardMemberRole" AS ENUM ('OWNER', 'EDITOR', 'VIEWER');

-- CreateEnum
CREATE TYPE "DiagramType" AS ENUM ('FLOWCHART', 'SEQUENCE', 'CLASS', 'STATE', 'ER_DIAGRAM', 'GANTT', 'PIE_CHART', 'USER_JOURNEY', 'GIT_GRAPH', 'MINDMAP', 'TIMELINE', 'QUADRANT');

-- CreateEnum
CREATE TYPE "DiagramRole" AS ENUM ('OWNER', 'EDITOR', 'VIEWER');

-- CreateEnum
CREATE TYPE "ExportFormat" AS ENUM ('PNG', 'SVG', 'PDF', 'MERMAID', 'JSON');

-- CreateTable
CREATE TABLE "sticky_note_boards" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "color" TEXT NOT NULL DEFAULT '#f3f4f6',

    CONSTRAINT "sticky_note_boards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "board_members" (
    "id" TEXT NOT NULL,
    "boardId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "BoardMemberRole" NOT NULL DEFAULT 'VIEWER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "board_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sticky_notes" (
    "id" TEXT NOT NULL,
    "boardId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#fef3c7',
    "positionX" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "positionY" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "width" DOUBLE PRECISION NOT NULL DEFAULT 200,
    "height" DOUBLE PRECISION NOT NULL DEFAULT 200,
    "zIndex" INTEGER NOT NULL DEFAULT 0,
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isPinned" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "sticky_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_diagrams" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "prompt" TEXT NOT NULL,
    "diagramType" "DiagramType" NOT NULL DEFAULT 'FLOWCHART',
    "mermaidCode" TEXT NOT NULL,
    "svgContent" TEXT,
    "createdById" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "boardId" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_diagrams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diagram_members" (
    "id" TEXT NOT NULL,
    "diagramId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "DiagramRole" NOT NULL DEFAULT 'VIEWER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "diagram_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diagram_comments" (
    "id" TEXT NOT NULL,
    "diagramId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "positionX" DOUBLE PRECISION,
    "positionY" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "diagram_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diagram_exports" (
    "id" TEXT NOT NULL,
    "diagramId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "format" "ExportFormat" NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "diagram_exports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sticky_note_boards_createdById_idx" ON "sticky_note_boards"("createdById");

-- CreateIndex
CREATE INDEX "sticky_note_boards_isPublic_idx" ON "sticky_note_boards"("isPublic");

-- CreateIndex
CREATE INDEX "board_members_boardId_idx" ON "board_members"("boardId");

-- CreateIndex
CREATE INDEX "board_members_userId_idx" ON "board_members"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "board_members_boardId_userId_key" ON "board_members"("boardId", "userId");

-- CreateIndex
CREATE INDEX "sticky_notes_boardId_idx" ON "sticky_notes"("boardId");

-- CreateIndex
CREATE INDEX "sticky_notes_createdById_idx" ON "sticky_notes"("createdById");

-- CreateIndex
CREATE INDEX "sticky_notes_isPinned_idx" ON "sticky_notes"("isPinned");

-- CreateIndex
CREATE INDEX "ai_diagrams_createdById_idx" ON "ai_diagrams"("createdById");

-- CreateIndex
CREATE INDEX "ai_diagrams_boardId_idx" ON "ai_diagrams"("boardId");

-- CreateIndex
CREATE INDEX "ai_diagrams_isPublic_idx" ON "ai_diagrams"("isPublic");

-- CreateIndex
CREATE INDEX "ai_diagrams_createdAt_idx" ON "ai_diagrams"("createdAt");

-- CreateIndex
CREATE INDEX "diagram_members_userId_idx" ON "diagram_members"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "diagram_members_diagramId_userId_key" ON "diagram_members"("diagramId", "userId");

-- CreateIndex
CREATE INDEX "diagram_comments_diagramId_idx" ON "diagram_comments"("diagramId");

-- CreateIndex
CREATE INDEX "diagram_comments_userId_idx" ON "diagram_comments"("userId");

-- CreateIndex
CREATE INDEX "diagram_exports_diagramId_idx" ON "diagram_exports"("diagramId");

-- CreateIndex
CREATE INDEX "diagram_exports_userId_idx" ON "diagram_exports"("userId");

-- AddForeignKey
ALTER TABLE "sticky_note_boards" ADD CONSTRAINT "sticky_note_boards_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "board_members" ADD CONSTRAINT "board_members_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "sticky_note_boards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "board_members" ADD CONSTRAINT "board_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sticky_notes" ADD CONSTRAINT "sticky_notes_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "sticky_note_boards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sticky_notes" ADD CONSTRAINT "sticky_notes_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sticky_notes" ADD CONSTRAINT "sticky_notes_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_diagrams" ADD CONSTRAINT "ai_diagrams_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_diagrams" ADD CONSTRAINT "ai_diagrams_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "sticky_note_boards"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_diagrams" ADD CONSTRAINT "ai_diagrams_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "ai_diagrams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagram_members" ADD CONSTRAINT "diagram_members_diagramId_fkey" FOREIGN KEY ("diagramId") REFERENCES "ai_diagrams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagram_members" ADD CONSTRAINT "diagram_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagram_comments" ADD CONSTRAINT "diagram_comments_diagramId_fkey" FOREIGN KEY ("diagramId") REFERENCES "ai_diagrams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagram_comments" ADD CONSTRAINT "diagram_comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagram_exports" ADD CONSTRAINT "diagram_exports_diagramId_fkey" FOREIGN KEY ("diagramId") REFERENCES "ai_diagrams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagram_exports" ADD CONSTRAINT "diagram_exports_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
