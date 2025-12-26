import { geminiService } from './client';

export interface ReceiptData {
  merchant: string;
  amount: number;
  date: string;
  category: string;
  items: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
  paymentMethod?: string;
  confidence: number;
}

export class ReceiptParser {
  async parseReceipt(imageBase64: string): Promise<ReceiptData> {
    const prompt = `
Extract structured data from this receipt image:

Return JSON format:
{
  "merchant": "Store Name",
  "amount": 123.45,
  "date": "2025-12-26",
  "category": "Food & Dining",
  "items": [
    {"name": "Item", "price": 10.00, "quantity": 1}
  ],
  "paymentMethod": "Credit Card",
  "confidence": 0.95
}
`;

    try {
      const model = geminiService.getClient().getGenerativeModel({
        model: geminiService.getModel(),
      });

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: imageBase64,
            mimeType: 'image/jpeg',
          },
        },
      ]);

      return this.parseReceiptResponse(result.response.text());
    } catch (error) {
      console.error('Receipt parsing error:', error);
      throw new Error('Failed to parse receipt');
    }
  }

  async parseReceiptText(text: string): Promise<ReceiptData> {
    const prompt = `
Extract structured data from this receipt text:

${text}

Return JSON format with merchant, amount, date, category, items, paymentMethod, confidence.
`;

    try {
      const response = await geminiService.chat(prompt, 'Extract receipt data accurately.');
      return this.parseReceiptResponse(response);
    } catch (error) {
      throw new Error('Failed to parse receipt text');
    }
  }

  private parseReceiptResponse(text: string): ReceiptData {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON');

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      return {
        merchant: 'Unknown',
        amount: 0,
        date: new Date().toISOString(),
        category: 'Other',
        items: [],
        confidence: 0,
      };
    }
  }
}

export const receiptParser = new ReceiptParser();
