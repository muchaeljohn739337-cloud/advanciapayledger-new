import OpenAI from 'openai';
import { logger } from '../../utils/logger';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

const DIAGRAM_INSTRUCTIONS: Record<DiagramType, string> = {
  FLOWCHART: 'flowchart TD or LR format with nodes and edges',
  SEQUENCE: 'sequenceDiagram with participants and messages',
  CLASS: 'classDiagram with classes, attributes, methods, and relationships',
  STATE: 'stateDiagram-v2 with states and transitions',
  ER_DIAGRAM: 'erDiagram with entities and relationships',
  GANTT: 'gantt with tasks, dates, and dependencies',
  PIE_CHART: 'pie with title and data percentages',
  USER_JOURNEY: 'journey with user tasks and satisfaction scores',
  GIT_GRAPH: 'gitGraph with branches and commits',
  MINDMAP: 'mindmap with hierarchical nodes',
  TIMELINE: 'timeline with chronological events',
  QUADRANT: 'quadrantChart with four quadrants',
};

export async function generateDiagramWithAI(
  userPrompt: string,
  diagramType: DiagramType
): Promise<string> {
  try {
    const systemPrompt = `You are an expert Mermaid.js diagram generator.
Generate ONLY the Mermaid code for a ${diagramType} diagram.

Requirements:
- Use ${DIAGRAM_INSTRUCTIONS[diagramType]}
- Output ONLY valid Mermaid.js syntax (no markdown, no explanations)
- Use clear, concise labels
- Follow Mermaid.js best practices
- Ensure proper indentation and formatting
- Make it visually appealing and professional

User request: ${userPrompt}

Generate the Mermaid code:`;

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS || '2000'),
      temperature: 0.7,
    });

    const mermaidCode = response.choices[0]?.message?.content?.trim();

    if (!mermaidCode) {
      throw new Error('No diagram code generated');
    }

    const cleanedCode = mermaidCode
      .replace(/```mermaid\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    logger.info('AI diagram generated successfully', {
      type: diagramType,
      promptLength: userPrompt.length,
      codeLength: cleanedCode.length,
    });

    return cleanedCode;
  } catch (error: any) {
    logger.error('OpenAI diagram generation failed', {
      error: error.message,
      type: diagramType,
    });

    if (error.code === 'insufficient_quota') {
      throw new Error('OpenAI quota exceeded. Please contact administrator.');
    }

    if (error.code === 'invalid_request_error') {
      throw new Error('Invalid prompt or diagram type');
    }

    throw new Error(`Failed to generate diagram: ${error.message}`);
  }
}

export async function refineDiagramWithAI(
  currentCode: string,
  refinementPrompt: string,
  diagramType: DiagramType
): Promise<string> {
  try {
    const systemPrompt = `You are an expert Mermaid.js diagram editor.
Refine the existing ${diagramType} diagram based on user feedback.

Current diagram:
\`\`\`
${currentCode}
\`\`\`

User feedback: ${refinementPrompt}

Generate the improved Mermaid code (output ONLY the code):`;

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: systemPrompt }],
      max_tokens: 2000,
      temperature: 0.7,
    });

    const refinedCode = response.choices[0]?.message?.content?.trim();

    if (!refinedCode) {
      throw new Error('No refined code generated');
    }

    return refinedCode
      .replace(/```mermaid\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
  } catch (error: any) {
    logger.error('AI diagram refinement failed', { error: error.message });
    throw new Error(`Failed to refine diagram: ${error.message}`);
  }
}
