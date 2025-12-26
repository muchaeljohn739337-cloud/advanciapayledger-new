import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

export class PricingJobService {
  private static instance: PricingJobService;
  private isRunning = false;
  private intervalId: NodeJS.Timeout | null = null;

  private constructor() {}

  static getInstance(): PricingJobService {
    if (!PricingJobService.instance) {
      PricingJobService.instance = new PricingJobService();
    }
    return PricingJobService.instance;
  }

  // Currencies to track
  private readonly CURRENCIES = ['BTC', 'ETH', 'USDT', 'USDC', 'DAI', 'LTC', 'XRP', 'ADA', 'DOT'];

  start() {
    if (this.isRunning) {
      console.log('📈 PricingJobService already running');
      return;
    }

    this.isRunning = true;
    console.log('📈 PricingJobService started');

    // Update prices immediately
    this.updatePrices();

    // Update every 2 minutes
    this.intervalId = setInterval(() => {
      this.updatePrices();
    }, 2 * 60 * 1000);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('📈 PricingJobService stopped');
  }

  async updatePrices() {
    try {
      console.log('📈 Updating crypto prices...');

      // Use CoinGecko API (free tier)
      const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
        params: {
          ids: this.getCoinGeckoIds().join(','),
          vs_currencies: 'usd',
          include_24hr_change: true
        },
        timeout: 10000 // 10 second timeout
      });

      const priceData = response.data;
      const updates: any[] = [];

      for (const [coinId, data] of Object.entries(priceData)) {
        const currency = this.mapCoinGeckoIdToCurrency(coinId);
        if (currency) {
          updates.push({
            id: uuidv4(),
            currency,
            priceUSD: data.usd,
            change24h: data.usd_24h_change || 0,
            lastUpdated: new Date(),
            source: 'coingecko',
            createdAt: new Date()
          });
        }
      }

      if (updates.length > 0) {
        // Use transaction to update all prices atomically
        await prisma.$transaction(async (tx) => {
          // Delete old prices (keep only latest 100 per currency)
          for (const currency of this.CURRENCIES) {
            const oldPrices = await tx.cryptoPriceData.findMany({
              where: { currency },
              orderBy: { createdAt: 'desc' },
              skip: 50, // Keep 50 most recent
            });

            if (oldPrices.length > 0) {
              await tx.cryptoPriceData.deleteMany({
                where: {
                  id: { in: oldPrices.map(p => p.id) }
                }
              });
            }
          }

          // Insert new prices
          await tx.cryptoPriceData.createMany({
            data: updates
          });
        });

        console.log(`📈 Updated prices for ${updates.length} currencies`);
      }

    } catch (error: any) {
      console.error('❌ Error updating crypto prices:', error.message);
      
      // Fallback to Coinbase API if CoinGecko fails
      if (error.response?.status === 429) {
        console.log('📈 Rate limited, trying Coinbase API...');
        await this.updatePricesFromCoinbase();
      }
    }
  }

  private async updatePricesFromCoinbase() {
    try {
      const updates: any[] = [];

      // Coinbase Pro API - get prices for major currencies
      for (const currency of ['BTC', 'ETH', 'LTC']) {
        try {
          const response = await axios.get(
            `https://api.coinbase.com/v2/exchange-rates?currency=${currency}`,
            { timeout: 5000 }
          );

          const usdRate = parseFloat(response.data.data.rates.USD);
          if (usdRate > 0) {
            updates.push({
              id: uuidv4(),
              currency,
              priceUSD: usdRate,
              change24h: null,
              lastUpdated: new Date(),
              source: 'coinbase',
              createdAt: new Date()
            });
          }
        } catch (currencyError) {
          console.error(`❌ Error fetching ${currency} from Coinbase:`, currencyError.message);
        }
      }

      if (updates.length > 0) {
        await prisma.cryptoPriceData.createMany({
          data: updates
        });
        console.log(`📈 Updated ${updates.length} prices from Coinbase fallback`);
      }

    } catch (error: any) {
      console.error('❌ Coinbase fallback failed:', error.message);
    }
  }

  private getCoinGeckoIds(): string[] {
    return [
      'bitcoin',
      'ethereum', 
      'tether',
      'usd-coin',
      'dai',
      'litecoin',
      'ripple',
      'cardano',
      'polkadot'
    ];
  }

  private mapCoinGeckoIdToCurrency(coinId: string): string | null {
    const mapping: { [key: string]: string } = {
      'bitcoin': 'BTC',
      'ethereum': 'ETH',
      'tether': 'USDT',
      'usd-coin': 'USDC',
      'dai': 'DAI',
      'litecoin': 'LTC',
      'ripple': 'XRP',
      'cardano': 'ADA',
      'polkadot': 'DOT'
    };
    return mapping[coinId] || null;
  }

  // Get current prices (for API endpoints)
  async getCurrentPrices() {
    try {
      const prices = await prisma.cryptoPriceData.findMany({
        orderBy: { lastUpdated: 'desc' }
      });

      // Group by currency, keep only latest
      const latestPrices: { [key: string]: any } = {};
      
      prices.forEach(price => {
        if (!latestPrices[price.currency] || 
            new Date(price.lastUpdated) > new Date(latestPrices[price.currency].lastUpdated)) {
          latestPrices[price.currency] = price;
        }
      });

      return Object.values(latestPrices);
    } catch (error) {
      console.error('Error fetching current prices:', error);
      return [];
    }
  }

  // Get price for specific currency
  async getPrice(currency: string): Promise<number | null> {
    try {
      const price = await prisma.cryptoPriceData.findFirst({
        where: { currency: currency.toUpperCase() },
        orderBy: { lastUpdated: 'desc' }
      });

      return price ? parseFloat(price.priceUSD.toString()) : null;
    } catch (error) {
      console.error(`Error fetching price for ${currency}:`, error);
      return null;
    }
  }

  // Calculate USD equivalent for crypto amount
  async calculateUSDValue(amount: number, currency: string): Promise<number | null> {
    const price = await this.getPrice(currency);
    if (!price) return null;

    return amount * price;
  }

  // Calculate crypto amount for USD value
  async calculateCryptoAmount(usdAmount: number, currency: string): Promise<number | null> {
    const price = await this.getPrice(currency);
    if (!price) return null;

    return usdAmount / price;
  }

  // Health check
  getStatus() {
    return {
      isRunning: this.isRunning,
      currencies: this.CURRENCIES,
      lastUpdate: 'Check database for latest updates'
    };
  }
}
