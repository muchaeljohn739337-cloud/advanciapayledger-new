import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Google Gemini AI Client
 * Fast, multimodal AI for real-time processing
 */
class GeminiService {
  private client: GoogleGenerativeAI;
  private model: string;

  constructor() {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error('GOOGLE_GEMINI_API_KEY is not defined');
    }

    this.client = new GoogleGenerativeAI(apiKey);
    this.model = process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp';
  }

  getClient(): GoogleGenerativeAI {
    return this.client;
  }

  getModel(): string {
    return this.model;
  }

  async healthCheck(): Promise<boolean> {
    try {
      const model = this.client.getGenerativeModel({ model: this.model });
      const result = await model.generateContent('test');
      return result.response.text().length > 0;
    } catch (error) {
      console.error('Gemini health check failed:', error);
      return false;
    }
  }

  async chat(prompt: string, systemInstruction?: string): Promise<string> {
    try {
      const model = this.client.getGenerativeModel({
        model: this.model,
        systemInstruction,
      });

      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error('Gemini chat error:', error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();
export default geminiService;
