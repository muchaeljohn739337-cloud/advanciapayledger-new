/**
 * INTERNAL AI ORCHESTRATOR
 * Admin/Developer-Only Tool
 * NOT accessible to end users
 */

import { cohereService } from '../cohere/client';
import { claudeService } from '../claude/client';
import { geminiService } from '../gemini/client';

export type AIProvider = 'cohere' | 'claude' | 'gemini';

export interface AIRequest {
  task: 'fraud-detection' | 'compliance' | 'classification' | 'analytics' | 'monitoring' | 'code-gen' | 'docs-gen';
  data: any;
  preferredProvider?: AIProvider;
}

export class InternalAIOrchestrator {
  /**
   * Route AI tasks to optimal provider
   * INTERNAL USE ONLY - Never exposed to users
   */
  async executeTask(request: AIRequest): Promise<any> {
    const provider = request.preferredProvider || this.selectOptimalProvider(request.task);

    console.log(`[INTERNAL AI] Task: ${request.task}, Provider: ${provider}`);

    switch (request.task) {
      case 'fraud-detection':
        return this.handleFraudDetection(request.data, provider);
      case 'compliance':
        return this.handleCompliance(request.data);
      case 'classification':
        return this.handleClassification(request.data, provider);
      case 'analytics':
        return this.handleAnalytics(request.data);
      case 'monitoring':
        return this.handleMonitoring(request.data);
      case 'code-gen':
        return this.handleCodeGeneration(request.data);
      case 'docs-gen':
        return this.handleDocumentationGeneration(request.data);
      default:
        throw new Error('Invalid task type');
    }
  }

  private selectOptimalProvider(task: string): AIProvider {
    const taskProviderMap: Record<string, AIProvider> = {
      'fraud-detection': 'cohere',      // Fast real-time analysis
      'compliance': 'claude',            // Complex reasoning
      'classification': 'cohere',        // Efficient embeddings
      'analytics': 'claude',             // Deep insights
      'monitoring': 'gemini',            // Quick responses
      'code-gen': 'claude',              // Best for code
      'docs-gen': 'gemini',              // Fast generation
    };

    return taskProviderMap[task] || 'cohere';
  }

  private async handleFraudDetection(data: any, provider: AIProvider): Promise<any> {
    // Backend fraud analysis - never shown directly to users
    if (provider === 'cohere') {
      const { fraudDetectionService } = await import('../cohere/fraudDetection');
      return fraudDetectionService.analyzeTransaction(data);
    }
    throw new Error('Fraud detection only available via Cohere');
  }

  private async handleCompliance(data: any): Promise<any> {
    // Internal compliance checking for admins
    const { complianceService } = await import('../claude/compliance');
    return complianceService.analyzeCompliance(data);
  }

  private async handleClassification(data: any, provider: AIProvider): Promise<any> {
    // Backend transaction classification
    if (provider === 'cohere') {
      const { transactionClassifier } = await import('../cohere/transactionClassifier');
      return transactionClassifier.classifyTransaction(
        data.amount,
        data.description,
        data.merchant,
        data.location
      );
    }
    throw new Error('Classification only via Cohere');
  }

  private async handleAnalytics(data: any): Promise<any> {
    // Admin analytics dashboard insights
    const { financialAdvisor } = await import('../claude/financialAdvisor');
    return financialAdvisor.generateInsights(data);
  }

  private async handleMonitoring(data: any): Promise<any> {
    // System monitoring and anomaly detection
    const { quickAnalyzer } = await import('../gemini/quickAnalyzer');
    return quickAnalyzer.quickClassify(data.message);
  }

  private async handleCodeGeneration(data: any): Promise<any> {
    // Generate code for admins/developers
    const prompt = `Generate ${data.type} code for: ${data.description}`;
    return claudeService.chat(prompt, 'You are a senior developer. Generate clean, production-ready code.', 4096);
  }

  private async handleDocumentationGeneration(data: any): Promise<any> {
    // Auto-generate internal documentation
    const prompt = `Generate documentation for: ${data.feature}\n\nCode:\n${data.code}`;
    return geminiService.chat(prompt, 'Generate clear, concise technical documentation.');
  }

  async healthCheck(): Promise<{ cohere: boolean; claude: boolean; gemini: boolean }> {
    const [cohere, claude, gemini] = await Promise.all([
      cohereService.healthCheck(),
      claudeService.healthCheck(),
      geminiService.healthCheck(),
    ]);

    return { cohere, claude, gemini };
  }
}

export const internalAI = new InternalAIOrchestrator();
