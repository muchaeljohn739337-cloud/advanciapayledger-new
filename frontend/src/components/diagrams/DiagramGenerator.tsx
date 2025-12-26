'use client';

import { useState } from 'react';
import { DiagramType } from '../../types/diagram';

interface Props {
  onGenerate: (data: {
    prompt: string;
    type: DiagramType;
    title: string;
  }) => Promise<void>;
}

const DIAGRAM_TYPES: { value: DiagramType; label: string; example: string }[] = [
  { value: 'FLOWCHART', label: 'Flowchart', example: 'User login process with validation' },
  { value: 'SEQUENCE', label: 'Sequence Diagram', example: 'API authentication flow' },
  { value: 'MINDMAP', label: 'Mind Map', example: 'Product launch strategy' },
  { value: 'GANTT', label: 'Gantt Chart', example: 'Project timeline with milestones' },
  { value: 'CLASS', label: 'Class Diagram', example: 'E-commerce system architecture' },
  { value: 'STATE', label: 'State Diagram', example: 'Order processing states' },
  { value: 'ER_DIAGRAM', label: 'ER Diagram', example: 'Database schema relationships' },
  { value: 'PIE_CHART', label: 'Pie Chart', example: 'Market share distribution' },
  { value: 'USER_JOURNEY', label: 'User Journey', example: 'Customer onboarding experience' },
  { value: 'GIT_GRAPH', label: 'Git Graph', example: 'Feature branch workflow' },
  { value: 'TIMELINE', label: 'Timeline', example: 'Company history milestones' },
  { value: 'QUADRANT', label: 'Quadrant Chart', example: 'Priority matrix' },
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
          <label className="block text-sm font-medium mb-2">Diagram Type</label>
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
          <label className="block text-sm font-medium mb-2">Describe your diagram</label>
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
