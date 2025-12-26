import { claudeService } from './client';

export interface ComplianceAnalysis {
  isCompliant: boolean;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  violations: string[];
  recommendations: string[];
  regulatoryFlags: {
    aml: boolean;
    kyc: boolean;
    sanctions: boolean;
    pep: boolean;
  };
  reasoning: string;
}

export class ComplianceService {
  async analyzeCompliance(transaction: {
    userId: string;
    amount: number;
    description: string;
    sourceCountry: string;
    destinationCountry?: string;
    purpose?: string;
  }): Promise<ComplianceAnalysis> {
    const prompt = `
Analyze this transaction for AML/KYC compliance:

Transaction Details:
- Amount: $${transaction.amount}
- Description: ${transaction.description}
- Source: ${transaction.sourceCountry}
- Destination: ${transaction.destinationCountry || 'N/A'}
- Purpose: ${transaction.purpose || 'N/A'}

Provide JSON response:
{
  "isCompliant": boolean,
  "riskLevel": "low" | "medium" | "high" | "critical",
  "violations": ["violation1"],
  "recommendations": ["action1"],
  "regulatoryFlags": {
    "aml": boolean,
    "kyc": boolean,
    "sanctions": boolean,
    "pep": boolean
  },
  "reasoning": "detailed explanation"
}
`;

    try {
      const response = await claudeService.chat(
        prompt,
        'You are a compliance expert for fintech. Analyze transactions for AML/KYC/sanctions compliance.'
      );

      return this.parseCompliance(response);
    } catch (error) {
      console.error('Compliance analysis error:', error);
      return {
        isCompliant: false,
        riskLevel: 'critical',
        violations: ['Analysis failed'],
        recommendations: ['Manual review required'],
        regulatoryFlags: { aml: true, kyc: true, sanctions: true, pep: true },
        reasoning: 'System error - requires manual review',
      };
    }
  }

  private parseCompliance(text: string): ComplianceAnalysis {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON');

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      return {
        isCompliant: false,
        riskLevel: 'medium',
        violations: [],
        recommendations: ['Review required'],
        regulatoryFlags: { aml: false, kyc: false, sanctions: false, pep: false },
        reasoning: 'Parse error',
      };
    }
  }
}

export const complianceService = new ComplianceService();
