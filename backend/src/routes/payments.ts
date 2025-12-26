import express from 'express';
import { PaymentService } from '../services/PaymentService';
import { PricingJobService } from '../services/PricingJobService';
import { authenticate } from '../middleware/auth';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();
const paymentService = new PaymentService();
const pricingService = PricingJobService.getInstance();
const prisma = new PrismaClient();

// ============================================
// INSTANT ACCOUNT CREATION & SUBSCRIPTION
// ============================================

// Create instant account with payment
router.post('/instant-account', async (req, res) => {
  try {
    const { email, planId, paymentMethod } = req.body;

    if (!email || !planId || !paymentMethod) {
      return res.status(400).json({ 
        error: 'Email, planId, and paymentMethod are required' 
      });
    }

    const result = await paymentService.createInstantAccount(email, planId, paymentMethod);

    res.json({
      success: true,
      user: result.user,
      subscription: result.subscription,
      message: 'Account created successfully! Welcome to Advancia!'
    });

  } catch (error: any) {
    console.error('Error creating instant account:', error);
    res.status(500).json({ 
      error: 'Failed to create account',
      details: error.message 
    });
  }
});

// ============================================
// PAYMENT PLANS
// ============================================

// Get all active payment plans
router.get('/plans', async (req, res) => {
  try {
    const plans = await prisma.paymentPlan.findMany({
      where: { isActive: true },
      orderBy: { priceUSD: 'asc' }
    });

    const plansWithFeatures = plans.map(plan => ({
      ...plan,
      features: JSON.parse(plan.features || '[]')
    }));

    res.json({ plans: plansWithFeatures });

  } catch (error) {
    console.error('Error fetching payment plans:', error);
    res.status(500).json({ error: 'Failed to fetch payment plans' });
  }
});

// Create new payment plan (admin only)
router.post('/plans', authenticate, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { name, description, priceUSD, intervalMonths, features } = req.body;

    if (!name || !priceUSD || !features) {
      return res.status(400).json({ 
        error: 'Name, priceUSD, and features are required' 
      });
    }

    const plan = await paymentService.createPaymentPlan({
      name,
      description,
      priceUSD: parseFloat(priceUSD),
      intervalMonths: intervalMonths || 1,
      features
    });

    res.json({ success: true, plan });

  } catch (error: any) {
    console.error('Error creating payment plan:', error);
    res.status(500).json({ 
      error: 'Failed to create payment plan',
      details: error.message 
    });
  }
});

export default router;
