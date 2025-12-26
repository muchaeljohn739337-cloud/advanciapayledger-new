import express from 'express';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/accessControl';
import prisma from '../prismaClient';
import { v4 as uuidv4 } from 'uuid';
import { Decimal } from 'decimal.js';
import { serializeDecimal } from '../utils/decimal';
import webhookNotificationService from '../services/webhookNotificationService';

const router = express.Router();

// ============================================
// USER WITHDRAWAL REQUESTS
// ============================================

// Create withdrawal request
router.post('/request', authenticate, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { amount, currency, withdrawalAddress, notes } = req.body;

    if (!amount || !currency || !withdrawalAddress) {
      return res.status(400).json({ 
        error: 'Amount, currency, and withdrawal address are required' 
      });
    }

    // Validate amount
    const withdrawAmount = new Decimal(amount);
    if (withdrawAmount.lte(0)) {
      return res.status(400).json({ error: 'Amount must be greater than 0' });
    }

    // Get user balance
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { 
        balance: true, 
        cryptoBalance: true,
        email: true,
        firstName: true,
        lastName: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check balance based on currency
    let currentBalance: Decimal;
    if (currency === 'USD' || currency === 'FIAT') {
      currentBalance = new Decimal(user.balance);
    } else {
      currentBalance = new Decimal(user.cryptoBalance);
    }

    if (currentBalance.lt(withdrawAmount)) {
      return res.status(400).json({ 
        error: 'Insufficient balance',
        required: serializeDecimal(withdrawAmount),
        current: serializeDecimal(currentBalance)
      });
    }

    // Create withdrawal request
    const withdrawal = await prisma.crypto_withdrawals.create({
      data: {
        id: uuidv4(),
        userId,
        amount: withdrawAmount,
        currency,
        status: 'PENDING',
        walletAddress: withdrawalAddress,
        notes: notes || null,
        requestedAt: new Date()
      }
    });

    // Hold the funds (deduct from balance temporarily)
    if (currency === 'USD' || currency === 'FIAT') {
      await prisma.users.update({
        where: { id: userId },
        data: {
          balance: {
            decrement: withdrawAmount
          }
        }
      });
    } else {
      await prisma.users.update({
        where: { id: userId },
        data: {
          cryptoBalance: {
            decrement: withdrawAmount
          }
        }
      });
    }

    // Create pending transaction
    await prisma.transactions.create({
      data: {
        id: uuidv4(),
        userId,
        type: 'WITHDRAWAL',
        amount: withdrawAmount,
        status: 'PENDING',
        description: `Withdrawal request - ${currency}`,
        metadata: JSON.stringify({ 
          withdrawalId: withdrawal.id,
          address: withdrawalAddress 
        })
      }
    });

    // Notify user
    await webhookNotificationService.createNotification(
      userId,
      'Withdrawal Request Submitted',
      `Your withdrawal request for ${serializeDecimal(withdrawAmount)} ${currency} is pending admin approval.`,
      'INFO',
      { withdrawalId: withdrawal.id, amount: serializeDecimal(withdrawAmount), currency }
    );

    // Notify all admins
    const admins = await prisma.users.findMany({
      where: {
        role: {
          in: ['ADMIN', 'SUPER_ADMIN']
        }
      },
      select: { id: true }
    });

    for (const admin of admins) {
      await webhookNotificationService.createNotification(
        admin.id,
        'New Withdrawal Request',
        `${user.firstName || user.email} requested withdrawal of ${serializeDecimal(withdrawAmount)} ${currency}`,
        'WARNING',
        { 
          withdrawalId: withdrawal.id, 
          userId, 
          amount: serializeDecimal(withdrawAmount),
          currency,
          address: withdrawalAddress
        }
      );
    }

    res.json({
      success: true,
      withdrawal: {
        ...withdrawal,
        amount: serializeDecimal(withdrawal.amount)
      },
      message: 'Withdrawal request submitted. Waiting for admin approval.'
    });

  } catch (error) {
    console.error('Error creating withdrawal request:', error);
    res.status(500).json({ error: 'Failed to create withdrawal request' });
  }
});

// Get user's withdrawal requests
router.get('/my-requests', authenticate, async (req, res) => {
  try {
    const userId = req.user!.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [withdrawals, total] = await Promise.all([
      prisma.crypto_withdrawals.findMany({
        where: { userId },
        orderBy: { requestedAt: 'desc' },
        take: limit,
        skip
      }),
      prisma.crypto_withdrawals.count({ where: { userId } })
    ]);

    res.json({
      withdrawals: withdrawals.map(w => ({
        ...w,
        amount: serializeDecimal(w.amount)
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching withdrawals:', error);
    res.status(500).json({ error: 'Failed to fetch withdrawals' });
  }
});

// ============================================
// ADMIN WITHDRAWAL MANAGEMENT
// ============================================

// Get all pending withdrawal requests (admin only)
router.get('/admin/pending', authenticate, requireRole('ADMIN'), async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [withdrawals, total] = await Promise.all([
      prisma.crypto_withdrawals.findMany({
        where: { status: 'PENDING' },
        include: {
          user: {
            select: {
              email: true,
              firstName: true,
              lastName: true,
              trustScore: true
            }
          }
        },
        orderBy: { requestedAt: 'asc' },
        take: limit,
        skip
      }),
      prisma.crypto_withdrawals.count({ where: { status: 'PENDING' } })
    ]);

    res.json({
      withdrawals: withdrawals.map(w => ({
        ...w,
        amount: serializeDecimal(w.amount)
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching pending withdrawals:', error);
    res.status(500).json({ error: 'Failed to fetch pending withdrawals' });
  }
});

// Approve withdrawal (admin only)
router.post('/admin/approve/:withdrawalId', authenticate, requireRole('ADMIN'), async (req, res) => {
  try {
    const adminId = req.user!.id;
    const { withdrawalId } = req.params;
    const { txHash, notes } = req.body;

    const withdrawal = await prisma.crypto_withdrawals.findUnique({
      where: { id: withdrawalId },
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            balance: true,
            cryptoBalance: true
          }
        }
      }
    });

    if (!withdrawal) {
      return res.status(404).json({ error: 'Withdrawal request not found' });
    }

    if (withdrawal.status !== 'PENDING') {
      return res.status(400).json({ 
        error: `Withdrawal is already ${withdrawal.status.toLowerCase()}` 
      });
    }

    // Update withdrawal status
    await prisma.crypto_withdrawals.update({
      where: { id: withdrawalId },
      data: {
        status: 'COMPLETED',
        processedAt: new Date(),
        processedBy: adminId,
        txHash: txHash || null,
        adminNotes: notes || null
      }
    });

    // Update transaction status
    await prisma.transactions.updateMany({
      where: {
        userId: withdrawal.userId,
        type: 'WITHDRAWAL',
        metadata: {
          path: ['withdrawalId'],
          equals: withdrawalId
        }
      },
      data: {
        status: 'COMPLETED',
        metadata: JSON.stringify({ 
          withdrawalId, 
          address: withdrawal.walletAddress,
          txHash 
        })
      }
    });

    // Notify user
    await webhookNotificationService.createNotification(
      withdrawal.userId,
      'Withdrawal Approved',
      `Your withdrawal of ${serializeDecimal(withdrawal.amount)} ${withdrawal.currency} has been approved and processed.${txHash ? ` TX: ${txHash}` : ''}`,
      'SUCCESS',
      { 
        withdrawalId, 
        amount: serializeDecimal(withdrawal.amount), 
        currency: withdrawal.currency,
        txHash 
      }
    );

    // Send real-time notification
    await webhookNotificationService.notifyTransaction(
      withdrawal.userId,
      withdrawalId,
      'WITHDRAWAL',
      parseFloat(serializeDecimal(withdrawal.amount)),
      'COMPLETED'
    );

    res.json({
      success: true,
      message: 'Withdrawal approved successfully'
    });

  } catch (error) {
    console.error('Error approving withdrawal:', error);
    res.status(500).json({ error: 'Failed to approve withdrawal' });
  }
});

// Reject withdrawal (admin only)
router.post('/admin/reject/:withdrawalId', authenticate, requireRole('ADMIN'), async (req, res) => {
  try {
    const adminId = req.user!.id;
    const { withdrawalId } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ error: 'Rejection reason is required' });
    }

    const withdrawal = await prisma.crypto_withdrawals.findUnique({
      where: { id: withdrawalId }
    });

    if (!withdrawal) {
      return res.status(404).json({ error: 'Withdrawal request not found' });
    }

    if (withdrawal.status !== 'PENDING') {
      return res.status(400).json({ 
        error: `Withdrawal is already ${withdrawal.status.toLowerCase()}` 
      });
    }

    // Update withdrawal status
    await prisma.crypto_withdrawals.update({
      where: { id: withdrawalId },
      data: {
        status: 'REJECTED',
        processedAt: new Date(),
        processedBy: adminId,
        adminNotes: reason
      }
    });

    // Refund the user (return held funds)
    if (withdrawal.currency === 'USD' || withdrawal.currency === 'FIAT') {
      await prisma.users.update({
        where: { id: withdrawal.userId },
        data: {
          balance: {
            increment: withdrawal.amount
          }
        }
      });
    } else {
      await prisma.users.update({
        where: { id: withdrawal.userId },
        data: {
          cryptoBalance: {
            increment: withdrawal.amount
          }
        }
      });
    }

    // Update transaction status
    await prisma.transactions.updateMany({
      where: {
        userId: withdrawal.userId,
        type: 'WITHDRAWAL',
        metadata: {
          path: ['withdrawalId'],
          equals: withdrawalId
        }
      },
      data: {
        status: 'FAILED',
        metadata: JSON.stringify({ 
          withdrawalId, 
          rejectionReason: reason 
        })
      }
    });

    // Notify user
    await webhookNotificationService.createNotification(
      withdrawal.userId,
      'Withdrawal Rejected',
      `Your withdrawal request for ${serializeDecimal(withdrawal.amount)} ${withdrawal.currency} was rejected. Reason: ${reason}. Funds have been returned to your balance.`,
      'ERROR',
      { 
        withdrawalId, 
        amount: serializeDecimal(withdrawal.amount), 
        currency: withdrawal.currency,
        reason 
      }
    );

    // Send real-time notification
    await webhookNotificationService.notifyTransaction(
      withdrawal.userId,
      withdrawalId,
      'WITHDRAWAL',
      parseFloat(serializeDecimal(withdrawal.amount)),
      'FAILED'
    );

    res.json({
      success: true,
      message: 'Withdrawal rejected and funds refunded'
    });

  } catch (error) {
    console.error('Error rejecting withdrawal:', error);
    res.status(500).json({ error: 'Failed to reject withdrawal' });
  }
});

export default router;
