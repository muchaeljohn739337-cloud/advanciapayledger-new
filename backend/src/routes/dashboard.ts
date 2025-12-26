import express from 'express';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/accessControl';
import prisma from '../prismaClient';
import { serializeDecimal, serializeDecimalFields } from '../utils/decimal';

const router = express.Router();

// ============================================
// USER DASHBOARD API
// ============================================

// Get user dashboard stats
router.get('/stats', authenticate, async (req, res) => {
  try {
    const userId = req.user!.id;

    // Get user with balances
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        balance: true,
        cryptoBalance: true,
        trustScore: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get transaction count
    const transactionCount = await prisma.transactions.count({
      where: { userId }
    });

    // Get pending notifications
    const pendingNotifications = await prisma.notifications.count({
      where: { 
        userId,
        read: false
      }
    });

    res.json({
      balance: serializeDecimal(user.balance),
      cryptoBalance: serializeDecimal(user.cryptoBalance),
      trustScore: user.trustScore || 0,
      transactionCount,
      pendingNotifications,
      user: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// Get recent transactions with pagination
router.get('/transactions', authenticate, async (req, res) => {
  try {
    const userId = req.user!.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      prisma.transactions.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
        select: {
          id: true,
          type: true,
          amount: true,
          status: true,
          description: true,
          createdAt: true,
          provider: true
        }
      }),
      prisma.transactions.count({ where: { userId } })
    ]);

    res.json({
      transactions: transactions.map(t => ({
        ...t,
        amount: serializeDecimal(t.amount)
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Get notifications with pagination
router.get('/notifications', authenticate, async (req, res) => {
  try {
    const userId = req.user!.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      prisma.notifications.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip
      }),
      prisma.notifications.count({ where: { userId } })
    ]);

    res.json({
      notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Mark notification as read
router.put('/notifications/:id/read', authenticate, async (req, res) => {
  try {
    const userId = req.user!.id;
    const notificationId = req.params.id;

    await prisma.notifications.updateMany({
      where: { 
        id: notificationId,
        userId
      },
      data: { read: true }
    });

    res.json({ success: true });

  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

// ============================================
// ADMIN DASHBOARD API
// ============================================

// Get admin dashboard stats
router.get('/admin/stats', authenticate, requireRole('ADMIN'), async (req, res) => {
  try {
    const [
      totalUsers,
      pendingApprovals,
      totalTransactions,
      activeUsers,
      blockedUsers,
      totalRevenue
    ] = await Promise.all([
      prisma.users.count(),
      prisma.users.count({ where: { approvedByAdmin: false } }),
      prisma.transactions.count(),
      prisma.users.count({ 
        where: { 
          lastLogin: { 
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) 
          } 
        } 
      }),
      prisma.users.count({ where: { blocked: true } }),
      prisma.transactions.aggregate({
        where: { 
          status: 'COMPLETED',
          type: 'DEPOSIT'
        },
        _sum: { amount: true }
      })
    ]);

    res.json({
      totalUsers,
      pendingApprovals,
      totalTransactions,
      activeUsers,
      blockedUsers,
      totalRevenue: serializeDecimal(totalRevenue._sum.amount) || '0'
    });

  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: 'Failed to fetch admin stats' });
  }
});

// Get recent activity for admin
router.get('/admin/activity', authenticate, requireRole('ADMIN'), async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [activities, total] = await Promise.all([
      prisma.activity_logs.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
        include: {
          user: {
            select: {
              email: true,
              firstName: true,
              lastName: true
            }
          }
        }
      }),
      prisma.activity_logs.count()
    ]);

    res.json({
      activities,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching admin activity:', error);
    res.status(500).json({ error: 'Failed to fetch activity' });
  }
});

// Get all users with pagination and filters
router.get('/admin/users', authenticate, requireRole('ADMIN'), async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search as string;
    const role = req.query.role as string;
    const status = req.query.status as string;

    const where: any = {};

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (role) {
      where.role = role;
    }

    if (status === 'blocked') {
      where.blocked = true;
    } else if (status === 'pending') {
      where.approvedByAdmin = false;
    } else if (status === 'active') {
      where.blocked = false;
      where.approvedByAdmin = true;
    }

    const [users, total] = await Promise.all([
      prisma.users.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          balance: true,
          cryptoBalance: true,
          trustScore: true,
          blocked: true,
          approvedByAdmin: true,
          createdAt: true,
          lastLogin: true
        }
      }),
      prisma.users.count({ where })
    ]);

    res.json({
      users: users.map(u => ({
        ...u,
        balance: serializeDecimal(u.balance),
        cryptoBalance: serializeDecimal(u.cryptoBalance)
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

export default router;
