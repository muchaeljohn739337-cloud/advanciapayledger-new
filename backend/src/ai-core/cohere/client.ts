import { CohereClient } from 'cohere-ai';

/**
 * Cohere AI Client Configuration
 * Provides unified access to Cohere's AI capabilities
 */
class CohereService {
  private client: CohereClient;
  private model: string;
  private embedModel: string;

  constructor() {
    const apiKey = process.env.COHERE_API_KEY;
    
    if (!apiKey) {
      throw new Error('COHERE_API_KEY is not defined in environment variables');
    }

    this.client = new CohereClient({
      token: apiKey,
    });

    this.model = process.env.COHERE_MODEL || 'command-r-plus';
    this.embedModel = process.env.COHERE_EMBED_MODEL || 'embed-english-v3.0';
  }

  getClient(): CohereClient {
    return this.client;
  }

  getModel(): string {
    return this.model;
  }

  getEmbedModel(): string {
    return this.embedModel;
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.client.embed({
        texts: ['test'],
        model: this.embedModel,
      });
      return true;
    } catch (error) {
      console.error('Cohere health check failed:', error);
      return false;
    }
  }
}

export const cohereService = new CohereService();
export default cohereService;
