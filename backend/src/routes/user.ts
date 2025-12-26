import express from 'express';
import { authenticate } from '../middleware/auth';
import { requireRole, trackActivity } from '../middleware/accessControl';
import { PrismaClient } from '@prisma/client';
import { serializeDecimalFields } from '../utils/decimal';
import bcrypt from 'bcryptjs';

const router = express.Router();
const prisma = new PrismaClient();

// ============================================
// USER SELF-MANAGEMENT ROUTES
// Users can only access/modify their own data
// ============================================

/**
 * GET /api/user/profile - Get current user profile
 */
router.get('/profile', authenticate, trackActivity('VIEW_PROFILE'), async (req, res) => {
  try {
    const user = await prisma.users.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        usdBalance: true,
        btcBalance: true,
        ethBalance: true,
        usdtBalance: true,
        ethWalletAddress: true,
        emailVerified: true,
        totpEnabled: true,
        profilePicture: true,
        active: true,
        blocked: true,
        approvedByAdmin: true,
        trustScore: true,
        invitationTier: true,
        createdAt: true,
        lastLogin: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: serializeDecimalFields(user) });
  } catch (error) {
    console.error('[Profile Error]:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

/**
 * PUT /api/user/profile - Update user profile (limited fields)
 */
router.put('/profile', authenticate, trackActivity('UPDATE_PROFILE'), async (req, res) => {
  try {
    const { firstName, lastName, username, profilePicture } = req.body;
    
    const updates: any = {};
    if (firstName !== undefined) updates.firstName = firstName;
    if (lastName !== undefined) updates.lastName = lastName;
    if (profilePicture !== undefined) updates.profilePicture = profilePicture;
    
    // Check username uniqueness if changing
    if (username && username !== req.user!.username) {
      const existing = await prisma.users.findUnique({
        where: { username }
      });
      
      if (existing) {
        return res.status(409).json({ error: 'Username already taken' });
      }
      updates.username = username;
    }

    updates.updatedAt = new Date();

    const user = await prisma.users.update({
      where: { id: req.user!.id },
      data: updates,
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        profilePicture: true,
        updatedAt: true
      }
    });

    res.json({ 
      message: 'Profile updated successfully',
      user 
    });
  } catch (error) {
    console.error('[Profile Update Error]:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

/**
 * PUT /api/user/password - Change own password
 */
router.put('/password', authenticate, trackActivity('CHANGE_PASSWORD'), async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters' });
    }

    // Verify current password
    const user = await prisma.users.findUnique({
      where: { id: req.user!.id }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.users.update({
      where: { id: req.user!.id },
      data: { 
        password: hashedPassword,
        updatedAt: new Date()
      }
    });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('[Password Change Error]:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

/**
 * GET /api/user/balances - Get user balances
 */
router.get('/balances', authenticate, trackActivity('VIEW_BALANCES'), async (req, res) => {
  try {
    const user = await prisma.users.findUnique({
      where: { id: req.user!.id },
      select: {
        usdBalance: true,
        btcBalance: true,
        ethBalance: true,
        usdtBalance: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ balances: serializeDecimalFields(user) });
  } catch (error) {
    console.error('[Balances Error]:', error);
    res.status(500).json({ error: 'Failed to fetch balances' });
  }
});

/**
 * GET /api/user/permissions - Get user permissions
 */
router.get('/permissions', authenticate, async (req, res) => {
  try {
    const { FEATURE_PERMISSIONS, ROLE_HIERARCHY } = await import('../middleware/accessControl');
    
    const userRole = req.user!.role;
    const roleLevel = ROLE_HIERARCHY[userRole as keyof typeof ROLE_HIERARCHY] || 0;
    
    // Get all features user has access to
    const permissions = Object.entries(FEATURE_PERMISSIONS).reduce((acc, [feature, roles]) => {
      acc[feature] = roles.includes(userRole as any);
      return acc;
    }, {} as Record<string, boolean>);

    res.json({
      role: userRole,
      roleLevel,
      permissions
    });
  } catch (error) {
    console.error('[Permissions Error]:', error);
    res.status(500).json({ error: 'Failed to fetch permissions' });
  }
});

/**
 * GET /api/user/activity - Get user activity logs (own only)
 */
router.get('/activity', authenticate, trackActivity('VIEW_ACTIVITY'), async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      prisma.activity_logs.findMany({
        where: { userId: req.user!.id },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
        select: {
          id: true,
          action: true,
          ipAddress: true,
          userAgent: true,
          metadata: true,
          createdAt: true
        }
      }),
      prisma.activity_logs.count({
        where: { userId: req.user!.id }
      })
    ]);

    res.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('[Activity Logs Error]:', error);
    res.status(500).json({ error: 'Failed to fetch activity logs' });
  }
});

/**
 * GET /api/user/sessions - Get active sessions (login devices)
 */
router.get('/sessions', authenticate, async (req, res) => {
  try {
    // Get recent login activities
    const sessions = await prisma.activity_logs.findMany({
      where: {
        userId: req.user!.id,
        action: 'USER_LOGIN'
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        ipAddress: true,
        userAgent: true,
        createdAt: true,
        metadata: true
      }
    });

    res.json({ sessions });
  } catch (error) {
    console.error('[Sessions Error]:', error);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

/**
 * GET /api/user/transactions - Get user transactions (own only)
 */
router.get('/transactions', authenticate, trackActivity('VIEW_TRANSACTIONS'), async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const skip = (page - 1) * limit;
    const type = req.query.type as string;
    const status = req.query.status as string;

    const where: any = { userId: req.user!.id };
    if (type) where.type = type;
    if (status) where.status = status;

    const [transactions, total] = await Promise.all([
      prisma.transactions.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
        select: {
          id: true,
          type: true,
          amount: true,
          currency: true,
          status: true,
          description: true,
          provider: true,
          metadata: true,
          createdAt: true
        }
      }),
      prisma.transactions.count({ where })
    ]);

    res.json({
      transactions: serializeDecimalFields(transactions),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('[Transactions Error]:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

/**
 * GET /api/user/notifications - Get user notifications (own only)
 */
router.get('/notifications', authenticate, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const skip = (page - 1) * limit;
    const unreadOnly = req.query.unreadOnly === 'true';

    const where: any = { userId: req.user!.id };
    if (unreadOnly) where.read = false;

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notifications.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip
      }),
      prisma.notifications.count({ where }),
      prisma.notifications.count({ 
        where: { userId: req.user!.id, read: false } 
      })
    ]);

    res.json({
      notifications,
      unreadCount,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('[Notifications Error]:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

/**
 * PUT /api/user/notifications/:id/read - Mark notification as read
 */
router.put('/notifications/:id/read', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    // Ensure user can only mark their own notifications
    await prisma.notifications.updateMany({
      where: {
        id,
        userId: req.user!.id
      },
      data: {
        read: true,
        readAt: new Date()
      }
    });

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('[Mark Read Error]:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

/**
 * DELETE /api/user/account - Delete own account (soft delete)
 */
router.delete('/account', authenticate, trackActivity('DELETE_ACCOUNT'), async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Password confirmation required' });
    }

    // Verify password
    const user = await prisma.users.findUnique({
      where: { id: req.user!.id }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // Soft delete - deactivate account
    await prisma.users.update({
      where: { id: req.user!.id },
      data: {
        active: false,
        blocked: true,
        updatedAt: new Date()
      }
    });

    res.json({ message: 'Account deactivated successfully' });
  } catch (error) {
    console.error('[Account Delete Error]:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

// ============================================
// ADMIN USER MANAGEMENT ROUTES
// Admins can manage all users
// ============================================

/**
 * GET /api/user/admin/users - Get all users (ADMIN only)
 */
router.get('/admin/users', authenticate, requireRole('ADMIN'), trackActivity('ADMIN_VIEW_USERS'), async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const skip = (page - 1) * limit;
    const search = req.query.search as string;
    const role = req.query.role as string;
    const status = req.query.status as string;

    const where: any = {};

    // Search filter
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Role filter
    if (role) where.role = role;

    // Status filter
    if (status === 'blocked') where.blocked = true;
    if (status === 'active') where.active = true;
    if (status === 'pending') where.approvedByAdmin = false;

    const [users, total] = await Promise.all([
      prisma.users.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          role: true,
          usdBalance: true,
          btcBalance: true,
          ethBalance: true,
          usdtBalance: true,
          trustScore: true,
          active: true,
          blocked: true,
          approvedByAdmin: true,
          emailVerified: true,
          totpEnabled: true,
          createdAt: true,
          lastLogin: true,
          updatedAt: true
        }
      }),
      prisma.users.count({ where })
    ]);

    res.json({
      users: serializeDecimalFields(users),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('[Admin Users Error]:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

/**
 * GET /api/user/admin/users/:id - Get specific user details (ADMIN only)
 */
router.get('/admin/users/:id', authenticate, requireRole('ADMIN'), trackActivity('ADMIN_VIEW_USER'), async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.users.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        usdBalance: true,
        btcBalance: true,
        ethBalance: true,
        usdtBalance: true,
        ethWalletAddress: true,
        trustScore: true,
        invitationTier: true,
        active: true,
        blocked: true,
        approvedByAdmin: true,
        emailVerified: true,
        totpEnabled: true,
        profilePicture: true,
        createdAt: true,
        lastLogin: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get additional stats
    const [transactionCount, notificationCount] = await Promise.all([
      prisma.transactions.count({ where: { userId: id } }),
      prisma.notifications.count({ where: { userId: id } })
    ]);

    res.json({
      user: serializeDecimalFields(user),
      stats: {
        transactionCount,
        notificationCount
      }
    });
  } catch (error) {
    console.error('[Admin User Detail Error]:', error);
    res.status(500).json({ error: 'Failed to fetch user details' });
  }
});

/**
 * PUT /api/user/admin/users/:id - Update user (ADMIN only)
 */
router.put('/admin/users/:id', authenticate, requireRole('ADMIN'), trackActivity('ADMIN_UPDATE_USER'), async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      role, 
      active, 
      blocked, 
      approvedByAdmin, 
      trustScore, 
      emailVerified,
      firstName,
      lastName,
      username
    } = req.body;

    const updates: any = {};
    
    if (role !== undefined) updates.role = role;
    if (active !== undefined) updates.active = active;
    if (blocked !== undefined) updates.blocked = blocked;
    if (approvedByAdmin !== undefined) updates.approvedByAdmin = approvedByAdmin;
    if (trustScore !== undefined) updates.trustScore = trustScore;
    if (emailVerified !== undefined) updates.emailVerified = emailVerified;
    if (firstName !== undefined) updates.firstName = firstName;
    if (lastName !== undefined) updates.lastName = lastName;
    if (username !== undefined) updates.username = username;

    updates.updatedAt = new Date();

    const user = await prisma.users.update({
      where: { id },
      data: updates
    });

    res.json({
      message: 'User updated successfully',
      user: serializeDecimalFields(user)
    });
  } catch (error) {
    console.error('[Admin Update User Error]:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

/**
 * PUT /api/user/admin/users/:id/block - Block/Unblock user (ADMIN only)
 */
router.put('/admin/users/:id/block', authenticate, requireRole('ADMIN'), trackActivity('ADMIN_BLOCK_USER'), async (req, res) => {
  try {
    const { id } = req.params;
    const { blocked, reason } = req.body;

    const user = await prisma.users.update({
      where: { id },
      data: {
        blocked,
        active: !blocked,
        updatedAt: new Date()
      }
    });

    // Create notification for user
    const { createNotification } = await import('../services/webhookNotificationService');
    await createNotification(
      id,
      blocked ? 'Account Blocked' : 'Account Unblocked',
      blocked 
        ? `Your account has been blocked. ${reason || ''}` 
        : 'Your account has been unblocked and is now active.',
      blocked ? 'ERROR' : 'SUCCESS'
    );

    res.json({
      message: `User ${blocked ? 'blocked' : 'unblocked'} successfully`,
      user: serializeDecimalFields(user)
    });
  } catch (error) {
    console.error('[Admin Block User Error]:', error);
    res.status(500).json({ error: 'Failed to block/unblock user' });
  }
});

/**
 * PUT /api/user/admin/users/:id/approve - Approve user (ADMIN only)
 */
router.put('/admin/users/:id/approve', authenticate, requireRole('ADMIN'), trackActivity('ADMIN_APPROVE_USER'), async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.users.update({
      where: { id },
      data: {
        approvedByAdmin: true,
        active: true,
        updatedAt: new Date()
      }
    });

    // Create notification for user
    const { createNotification } = await import('../services/webhookNotificationService');
    await createNotification(
      id,
      'Account Approved',
      'Your account has been approved by an administrator. You now have full access to all features.',
      'SUCCESS'
    );

    res.json({
      message: 'User approved successfully',
      user: serializeDecimalFields(user)
    });
  } catch (error) {
    console.error('[Admin Approve User Error]:', error);
    res.status(500).json({ error: 'Failed to approve user' });
  }
});

/**
 * DELETE /api/user/admin/users/:id - Delete user permanently (SUPER_ADMIN only)
 */
router.delete('/admin/users/:id', authenticate, requireRole('SUPER_ADMIN'), trackActivity('ADMIN_DELETE_USER'), async (req, res) => {
  try {
    const { id } = req.params;

    // Delete user and all related data
    await prisma.users.delete({
      where: { id }
    });

    res.json({ message: 'User deleted permanently' });
  } catch (error) {
    console.error('[Admin Delete User Error]:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

/**
 * GET /api/user/admin/users/:id/transactions - Get user transactions (ADMIN only)
 */
router.get('/admin/users/:id/transactions', authenticate, requireRole('ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      prisma.transactions.findMany({
        where: { userId: id },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip
      }),
      prisma.transactions.count({ where: { userId: id } })
    ]);

    res.json({
      transactions: serializeDecimalFields(transactions),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('[Admin User Transactions Error]:', error);
    res.status(500).json({ error: 'Failed to fetch user transactions' });
  }
});

/**
 * GET /api/user/admin/users/:id/activity - Get user activity logs (ADMIN only)
 */
router.get('/admin/users/:id/activity', authenticate, requireRole('ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      prisma.activity_logs.findMany({
        where: { userId: id },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip
      }),
      prisma.activity_logs.count({ where: { userId: id } })
    ]);

    res.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('[Admin User Activity Error]:', error);
    res.status(500).json({ error: 'Failed to fetch user activity' });
  }
});

export default router;
