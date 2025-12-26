import { geminiService } from './client';

export interface QuickAnalysis {
  category: string;
  isUrgent: boolean;
  suggestedAction: string;
  confidence: number;
}

export class QuickAnalyzer {
  async quickClassify(text: string): Promise<QuickAnalysis> {
    const prompt = `
Quickly classify: "${text}"

Return JSON:
{
  "category": "category",
  "isUrgent": boolean,
  "suggestedAction": "action",
  "confidence": 0.9
}
`;

    try {
      const response = await geminiService.chat(prompt);
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('Quick analysis error:', error);
    }

    return {
      category: 'Unknown',
      isUrgent: false,
      suggestedAction: 'Review manually',
      confidence: 0,
    };
  }

  async summarizeTransaction(transaction: {
    amount: number;
    description: string;
    merchant?: string;
  }): Promise<string> {
    const prompt = `Summarize in one sentence: $${transaction.amount} at ${transaction.merchant || transaction.description}`;

    try {
      return await geminiService.chat(prompt, 'Provide brief, clear summaries.');
    } catch (error) {
      return `${transaction.merchant || 'Payment'}: $${transaction.amount}`;
    }
  }
}

export const quickAnalyzer = new QuickAnalyzer();
