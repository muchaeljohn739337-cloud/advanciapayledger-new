/*
 * AI Analytics Service - Advancia Pay Ledger
 * 
 * Advanced analytics service powered by AI that analyzes user behavior, 
 * transaction patterns, and business metrics using PostgreSQL + Prisma ORM
 * 
 * Features:
 * - User behavior analysis using Prisma models
 * - Transaction pattern recognition  
 * - Revenue forecasting with ML algorithms
 * - Real-time business intelligence
 * - Automated insights generation
 * 
 * Database Integration:
 * Uses Prisma ORM with PostgreSQL for all analytics operations:
 * - crypto_wallets table for wallet analysis
 * - transactions table for transaction patterns
 * - products table for product analytics  
 * - orders table for order analysis
 */

import { PrismaClient, Prisma } from '@prisma/client';
import prisma from '../prismaClient';
import { logger } from '../utils/logger';
import { serializeDecimal, serializeDecimalFields } from '../utils/decimal';

export class AIAnalyticsService {
  // ... rest of the content remains the same
