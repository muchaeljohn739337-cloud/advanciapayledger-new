/**
 * OLLAMA CLIENT - LOCAL AI using Node.js http module
 */

import http from 'http';

interface OllamaMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OllamaRequest {
  model: string;
  messages: OllamaMessage[];
  stream?: boolean;
  options?: {
    temperature?: number;
    top_p?: number;
  };
}

interface OllamaResponse {
  model: string;
  message: {
    role: string;
    content: string;
  };
  done: boolean;
}

export class OllamaClient {
  private baseUrl: string = 'localhost';
  private port: number = 11434;

  private async makeRequest(path: string, method: string, body?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const postData = body ? JSON.stringify(body) : undefined;
      
      const options = {
        hostname: this.baseUrl,
        port: this.port,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(postData && { 'Content-Length': Buffer.byteLength(postData) }),
        },
      };

      const req = http.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (error) {
            reject(new Error('Invalid JSON response'));
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      if (postData) {
        req.write(postData);
      }

      req.end();
    });
  }

  async chat(request: OllamaRequest): Promise<string> {
    try {
      const data: OllamaResponse = await this.makeRequest(
        '/api/chat',
        'POST',
        { ...request, stream: false }
      );
      return data.message.content;
    } catch (error: any) {
      throw new Error(`Ollama chat failed: ${error.message}`);
    }
  }

  async generate(model: string, prompt: string, options?: any): Promise<string> {
    try {
      const data = await this.makeRequest(
        '/api/generate',
        'POST',
        { model, prompt, stream: false, ...options }
      );
      return data.response;
    } catch (error: any) {
      throw new Error(`Ollama generate failed: ${error.message}`);
    }
  }

  async listModels(): Promise<any[]> {
    try {
      const data = await this.makeRequest('/api/tags', 'GET');
      return data.models || [];
    } catch (error: any) {
      throw new Error(`Failed to list models: ${error.message}`);
    }
  }

  async pullModel(modelName: string): Promise<void> {
    await this.makeRequest('/api/pull', 'POST', { name: modelName });
  }

  async healthCheck(): Promise<{ healthy: boolean; version?: string }> {
    try {
      const data = await this.makeRequest('/api/version', 'GET');
      return { healthy: true, version: data.version };
    } catch (error) {
      return { healthy: false };
    }
  }
}

export const ollamaClient = new OllamaClient();
