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
    } catch (error: any) {
      console.error('Failed to render diagram:', error);
      containerRef.current.innerHTML = `
        <div class="text-red-600 p-4 border border-red-300 rounded-lg">
          <p class="font-semibold">Invalid Diagram Code</p>
          <p class="text-sm mt-1">${error?.message || 'Unknown error'}</p>
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
