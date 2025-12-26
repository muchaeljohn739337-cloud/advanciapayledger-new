/**
 * LOCAL CODE GENERATOR
 * Uses Ollama for 100% private code generation
 * Perfect for admin: TONS of code, $0 cost, unlimited usage
 */

import { ollamaClient } from './client';

export interface CodeGenerationRequest {
  type: 'function' | 'class' | 'component' | 'api' | 'test' | 'refactor' | 'fix' | 'explain';
  language: 'typescript' | 'javascript' | 'python' | 'sql' | 'prisma';
  description: string;
  context?: string;
  existingCode?: string;
  model?: string;
}

export class LocalCodeGenerator {
  private defaultModel = 'qwen2.5-coder:7b'; // Fast & high quality
  private heavyModel = 'deepseek-coder-v2:16b'; // Complex tasks

  async generateCode(request: CodeGenerationRequest): Promise<{ code: string; explanation: string }> {
    const model = request.model || this.selectModel(request.type);
    const prompt = this.buildPrompt(request);

    console.log(`[LOCAL AI] Generating ${request.type} in ${request.language} using ${model}`);

    try {
      const response = await ollamaClient.chat({
        model,
        messages: [
          { role: 'system', content: this.getSystemPrompt(request.language, request.type) },
          { role: 'user', content: prompt },
        ],
        options: {
          temperature: 0.3, // More deterministic for code
          top_p: 0.9,
        },
      });

      return this.parseResponse(response);
    } catch (error: any) {
      throw new Error(`Code generation failed: ${error.message}`);
    }
  }

  async refactorCode(code: string, instructions: string, language: string): Promise<string> {
    console.log(`[LOCAL AI] Refactoring ${language} code`);

    const response = await ollamaClient.chat({
      model: this.heavyModel,
      messages: [
        { role: 'system', content: `You are an expert ${language} developer. Refactor code following best practices.` },
        { role: 'user', content: `Refactor this code:\n\n${code}\n\nInstructions: ${instructions}\n\nReturn ONLY the refactored code.` },
      ],
      options: { temperature: 0.2 },
    });

    return response;
  }

  async explainCode(code: string, language: string): Promise<string> {
    console.log(`[LOCAL AI] Explaining ${language} code`);

    const response = await ollamaClient.chat({
      model: this.defaultModel,
      messages: [
        { role: 'system', content: `You are a code documentation expert.` },
        { role: 'user', content: `Explain this ${language} code:\n\n${code}` },
      ],
    });

    return response;
  }

  async fixCode(brokenCode: string, errorMessage: string, language: string): Promise<string> {
    console.log(`[LOCAL AI] Fixing ${language} code`);

    const response = await ollamaClient.chat({
      model: this.defaultModel,
      messages: [
        { role: 'system', content: `You are a debugging expert. Fix code issues.` },
        { role: 'user', content: `Fix this ${language} code:\n\n${brokenCode}\n\nError: ${errorMessage}\n\nReturn ONLY the fixed code.` },
      ],
      options: { temperature: 0.2 },
    });

    return response;
  }

  private selectModel(type: string): string {
    // Use heavy model for complex tasks
    if (type === 'refactor' || type === 'class' || type === 'component') {
      return this.heavyModel;
    }
    // Fast model for simple tasks
    return this.defaultModel;
  }

  private getSystemPrompt(language: string, type: string): string {
    return `You are an expert ${language} developer. Generate clean, production-ready code following best practices. 
Type: ${type}. Return code with brief explanation.`;
  }

  private buildPrompt(request: CodeGenerationRequest): string {
    let prompt = `Generate a ${request.language} ${request.type}:\n\n${request.description}`;

    if (request.context) {
      prompt += `\n\nContext:\n${request.context}`;
    }

    if (request.existingCode) {
      prompt += `\n\nExisting code:\n${request.existingCode}`;
    }

    prompt += `\n\nReturn clean, well-structured code with comments.`;

    return prompt;
  }

  private parseResponse(response: string): { code: string; explanation: string } {
    // Try to extract code blocks
    const codeBlockMatch = response.match(/```[\w]*\n([\s\S]*?)```/);
    
    if (codeBlockMatch) {
      const code = codeBlockMatch[1].trim();
      const explanation = response.replace(codeBlockMatch[0], '').trim();
      return { code, explanation: explanation || 'Code generated successfully' };
    }

    // No code block found, return as-is
    return {
      code: response,
      explanation: 'Code generated (no markdown formatting detected)',
    };
  }
}

export const localCodeGenerator = new LocalCodeGenerator();
