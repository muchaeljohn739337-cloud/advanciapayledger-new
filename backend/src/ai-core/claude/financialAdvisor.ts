import { claudeService } from './client';

export interface FinancialInsight {
  summary: string;
  spendingPatterns: string[];
  recommendations: string[];
  budgetSuggestions: {
    category: string;
    suggestedLimit: number;
    reasoning: string;
  }[];
  savingsOpportunities: string[];
}

export class FinancialAdvisor {
  async generateInsights(data: {
    userId: string;
    monthlyIncome?: number;
    transactions: Array<{
      amount: number;
      category: string;
      date: string;
    }>;
  }): Promise<FinancialInsight> {
    const totalSpent = data.transactions.reduce((sum, t) => sum + t.amount, 0);
    const categories = this.groupByCategory(data.transactions);

    const prompt = `
Analyze financial data and provide personalized insights:

Monthly Income: ${data.monthlyIncome ? `$${data.monthlyIncome}` : 'Unknown'}
Total Spent: $${totalSpent}
Transactions: ${data.transactions.length}

Spending by Category:
${Object.entries(categories).map(([cat, amt]) => `- ${cat}: $${amt}`).join('\n')}

Provide actionable financial advice in JSON:
{
  "summary": "brief overview",
  "spendingPatterns": ["pattern1"],
  "recommendations": ["advice1"],
  "budgetSuggestions": [
    {
      "category": "Food & Dining",
      "suggestedLimit": 500,
      "reasoning": "explanation"
    }
  ],
  "savingsOpportunities": ["opportunity1"]
}
`;

    try {
      const response = await claudeService.chat(
        prompt,
        'You are a personal financial advisor. Provide practical, actionable advice.',
        2048
      );

      return this.parseInsights(response);
    } catch (error) {
      console.error('Financial insights error:', error);
      return {
        summary: 'Analysis unavailable',
        spendingPatterns: [],
        recommendations: ['Review spending manually'],
        budgetSuggestions: [],
        savingsOpportunities: [],
      };
    }
  }

  private groupByCategory(transactions: Array<{ amount: number; category: string }>): Record<string, number> {
    return transactions.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);
  }

  private parseInsights(text: string): FinancialInsight {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON');

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      return {
        summary: 'Unable to parse insights',
        spendingPatterns: [],
        recommendations: [],
        budgetSuggestions: [],
        savingsOpportunities: [],
      };
    }
  }
}

export const financialAdvisor = new FinancialAdvisor();
