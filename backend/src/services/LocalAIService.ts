/**
 * Local-Only AI Service
 * Wrapper around UnifiedAIGateway that enforces local Ollama usage only
 * Prevents any third-party API calls
 */

import { UnifiedAIGateway, AIRequest, AIResponse } from './UnifiedAIGateway';

export class LocalAIService {
  private gateway: UnifiedAIGateway;
  private ollamaEndpoint: string;
  private ollamaModel: string;
  private enforceLocal: boolean;

  constructor() {
    this.ollamaEndpoint = process.env.OLLAMA_ENDPOINT || 'http://127.0.0.1:11434';
    this.ollamaModel = process.env.OLLAMA_MODEL || 'llama3.2:1b';
    this.enforceLocal = process.env.USE_LOCAL_AI_ONLY === 'true';
    
    this.gateway = new UnifiedAIGateway();
    
    if (this.enforceLocal) {
      console.log('🔒 LOCAL-ONLY AI MODE ENABLED');
      console.log(`   Using Ollama: ${this.ollamaEndpoint}`);
      console.log(`   Model: ${this.ollamaModel}`);
      console.log('   All third-party AI providers disabled');
    }
  }

  /**
   * Chat completion using local Ollama only
   */
  async chat(prompt: string, options: Partial<AIRequest> = {}): Promise<AIResponse> {
    // Force Ollama provider if local-only mode is enabled
    const request: AIRequest = {
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      ...options,
      // Override provider to force Ollama
      ...(this.enforceLocal && { 
        provider: 'ollama' as any,
        model: this.ollamaModel 
      }),
    };

    // Block third-party providers
    if (this.enforceLocal && request.provider && request.provider !== 'ollama') {
      throw new Error('Third-party AI providers are disabled. Use local Ollama only.');
    }

    try {
      return await this.gateway.chat(request);
    } catch (error: any) {
      console.error('Local AI error:', error.message);
      throw new Error(`Local AI failed: ${error.message}`);
    }
  }

  /**
   * Simple text completion for agents
   */
  async complete(prompt: string, maxTokens: number = 1000): Promise<string> {
    const response = await this.chat(prompt, {
      maxTokens,
      temperature: 0.7,
    });
    return response.content;
  }

  /**
   * Check if Ollama is available
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.ollamaEndpoint}/api/tags`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get available local models
   */
  async getAvailableModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.ollamaEndpoint}/api/tags`);
      const data = await response.json();
      return data.models?.map((m: any) => m.name) || [];
    } catch (error) {
      console.error('Failed to fetch Ollama models:', error);
      return [];
    }
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      enforceLocal: this.enforceLocal,
      endpoint: this.ollamaEndpoint,
      model: this.ollamaModel,
      provider: 'ollama',
      cloudProvidersDisabled: this.enforceLocal,
    };
  }
}

// Export singleton instance
export const localAI = new LocalAIService();
