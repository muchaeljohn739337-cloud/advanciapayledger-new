import Anthropic from '@anthropic-ai/sdk';

/**
 * Claude AI Client (Anthropic)
 * High-quality reasoning for complex financial analysis
 */
class ClaudeService {
  private client: Anthropic;
  private model: string;

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY is not defined');
    }

    this.client = new Anthropic({
      apiKey,
    });

    this.model = process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-20241022';
  }

  getClient(): Anthropic {
    return this.client;
  }

  getModel(): string {
    return this.model;
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 10,
        messages: [{ role: 'user', content: 'test' }],
      });
      return response.content.length > 0;
    } catch (error) {
      console.error('Claude health check failed:', error);
      return false;
    }
  }

  async chat(
    message: string,
    systemPrompt?: string,
    maxTokens: number = 1024
  ): Promise<string> {
    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: [{ role: 'user', content: message }],
      });

      const textContent = response.content.find(c => c.type === 'text');
      return textContent ? (textContent as any).text : '';
    } catch (error) {
      console.error('Claude chat error:', error);
      throw error;
    }
  }
}

export const claudeService = new ClaudeService();
export default claudeService;
