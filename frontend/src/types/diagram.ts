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

export type DiagramRole = 'OWNER' | 'EDITOR' | 'VIEWER';

export type ExportFormat = 'PNG' | 'SVG' | 'PDF' | 'MERMAID' | 'JSON';

export interface AIDiagram {
  id: string;
  title: string;
  description?: string;
  prompt: string;
  diagramType: DiagramType;
  mermaidCode: string;
  svgContent?: string;
  version: number;
  parentId?: string;
  isPublic: boolean;
  boardId?: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    username: string;
    email: string;
  };
  members?: DiagramMember[];
  comments?: DiagramComment[];
  versions?: AIDiagram[];
}

export interface DiagramMember {
  id: string;
  diagramId: string;
  userId: string;
  role: DiagramRole;
  joinedAt: string;
  user: {
    id: string;
    username: string;
    email: string;
  };
}

export interface DiagramComment {
  id: string;
  diagramId: string;
  userId: string;
  content: string;
  positionX?: number;
  positionY?: number;
  createdAt: string;
  user: {
    id: string;
    username: string;
    email: string;
  };
}

export interface DiagramExport {
  id: string;
  diagramId: string;
  userId: string;
  format: ExportFormat;
  url: string;
  createdAt: string;
}
