import { cohereService } from './client';

export interface FraudAnalysis {
  isFraudulent: boolean;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  flags: string[];
  reasoning: string;
  recommendations: string[];
}

export class FraudDetectionService {
  async analyzeTransaction(transaction: {
    userId: string;
    amount: number;
    description: string;
    merchant?: string;
    location?: string;
    ipAddress?: string;
    timestamp: Date;
    userHistory?: {
      averageTransaction: number;
      totalTransactions: number;
    };
  }): Promise<FraudAnalysis> {
    const prompt = `
Analyze this transaction for fraud:

Amount: $${transaction.amount}
Description: ${transaction.description}
Merchant: ${transaction.merchant || 'N/A'}
Location: ${transaction.location || 'N/A'}
Time: ${transaction.timestamp.toISOString()}

${transaction.userHistory ? `User History:
- Average: $${transaction.userHistory.averageTransaction}
- Total Txns: ${transaction.userHistory.totalTransactions}` : ''}

Provide JSON:
{
  "isFraudulent": boolean,
  "riskScore": 0-100,
  "riskLevel": "low" | "medium" | "high" | "critical",
  "flags": ["flag1", "flag2"],
  "reasoning": "explanation",
  "recommendations": ["action1"]
}
`;

    try {
      const response = await cohereService.getClient().chat({
        model: cohereService.getModel(),
        message: prompt,
        temperature: 0.2,
        preamble: 'You are a fraud detection expert. Analyze transactions for suspicious patterns.',
      });

      return this.parseFraudResponse(response.text);
    } catch (error) {
      console.error('Fraud detection error:', error);
      return {
        isFraudulent: false,
        riskScore: 50,
        riskLevel: 'medium',
        flags: ['Analysis error'],
        reasoning: 'Unable to complete analysis',
        recommendations: ['Manual review required'],
      };
    }
  }

  private parseFraudResponse(responseText: string): FraudAnalysis {
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON');

      const parsed = JSON.parse(jsonMatch[0]);
      return {
        isFraudulent: parsed.isFraudulent || false,
        riskScore: parsed.riskScore || 0,
        riskLevel: parsed.riskLevel || 'low',
        flags: parsed.flags || [],
        reasoning: parsed.reasoning || '',
        recommendations: parsed.recommendations || [],
      };
    } catch (error) {
      return {
        isFraudulent: false,
        riskScore: 0,
        riskLevel: 'low',
        flags: ['Parse error'],
        reasoning: 'Unable to parse',
        recommendations: ['Manual review'],
      };
    }
  }
}

export const fraudDetectionService = new FraudDetectionService();
