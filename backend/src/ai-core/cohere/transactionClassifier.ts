import { cohereService } from './client';

export interface TransactionClassification {
  category: string;
  confidence: number;
  subcategory?: string;
  riskLevel: 'low' | 'medium' | 'high';
  fraudProbability: number;
  reasoning: string;
}

export class TransactionClassifier {
  async classifyTransaction(
    amount: number,
    description: string,
    merchant?: string,
    location?: string,
    userId?: string
  ): Promise<TransactionClassification> {
    const prompt = `
Classify this financial transaction:

Amount: $${amount.toFixed(2)}
Description: ${description}
${merchant ? `Merchant: ${merchant}` : ''}
${location ? `Location: ${location}` : ''}

Provide a JSON response with:
{
  "category": "Food & Dining" | "Shopping" | "Transportation" | "Bills & Utilities" | "Entertainment" | "Healthcare" | "Transfer" | "Other",
  "subcategory": "string",
  "confidence": 0.95,
  "riskLevel": "low" | "medium" | "high",
  "fraudProbability": 0.02,
  "reasoning": "brief explanation"
}
`;

    try {
      const response = await cohereService.getClient().chat({
        model: cohereService.getModel(),
        message: prompt,
        temperature: 0.3,
        preamble: 'You are a financial transaction classifier. Provide only JSON responses.',
      });

      return this.parseClassificationResponse(response.text);
    } catch (error) {
      console.error('Transaction classification error:', error);
      throw new Error('Failed to classify transaction');
    }
  }

  async batchClassify(
    transactions: Array<{
      id: string;
      amount: number;
      description: string;
      merchant?: string;
    }>
  ): Promise<Map<string, TransactionClassification>> {
    const results = new Map<string, TransactionClassification>();
    const batchSize = 5;
    
    for (let i = 0; i < transactions.length; i += batchSize) {
      const batch = transactions.slice(i, i + batchSize);
      const promises = batch.map(async (tx) => {
        const classification = await this.classifyTransaction(
          tx.amount,
          tx.description,
          tx.merchant
        );
        return { id: tx.id, classification };
      });

      const batchResults = await Promise.all(promises);
      batchResults.forEach(({ id, classification }) => {
        results.set(id, classification);
      });
    }

    return results;
  }

  private parseClassificationResponse(responseText: string): TransactionClassification {
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found');

      const parsed = JSON.parse(jsonMatch[0]);
      return {
        category: parsed.category || 'Other',
        confidence: parsed.confidence || 0.5,
        subcategory: parsed.subcategory,
        riskLevel: parsed.riskLevel || 'medium',
        fraudProbability: parsed.fraudProbability || 0,
        reasoning: parsed.reasoning || 'Classification completed',
      };
    } catch (error) {
      return {
        category: 'Other',
        confidence: 0.5,
        riskLevel: 'medium',
        fraudProbability: 0,
        reasoning: 'Unable to parse classification',
      };
    }
  }
}

export const transactionClassifier = new TransactionClassifier();
