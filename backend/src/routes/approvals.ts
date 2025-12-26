import express from "express";
import { PrismaClient } from "@prisma/client";
import { authenticate, requireAdmin } from "../middleware/auth";
import { requireFeature, trackActivity } from "../middleware/accessControl";
import { logger } from "../utils/logger";
import { emailService } from "../services/emailService";

const router = express.Router();
const prisma = new PrismaClient();

/**
 * GET /api/approvals/pending - Get all pending user approvals
 */
router.get("/pending", authenticate, requireFeature("MANAGE_USERS"), async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.users.findMany({
        where: {
          approvedByAdmin: false,
          active: true,
          suspended: false
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip,
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          role: true,
          createdAt: true,
          emailVerified: true
        }
      }),
      prisma.users.count({
        where: {
          approvedByAdmin: false,
          active: true,
          suspended: false
        }
      })
    ]);

    res.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger?.error("[Pending Approvals Error]:", error);
    res.status(500).json({ error: "Failed to fetch pending approvals" });
  }
});

/**
 * POST /api/approvals/approve/:userId - Approve user account
 */
router.post("/approve/:userId", 
  authenticate, 
  requireFeature("MANAGE_USERS"),
  trackActivity("APPROVE_USER"),
  async (req, res) => {
    try {
      const { userId } = req.params;
      const { role } = req.body;

      // Find user
      const user = await prisma.users.findUnique({
        where: { id: userId }
      });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      if (user.approvedByAdmin) {
        return res.status(400).json({ error: "User is already approved" });
      }

      // Update user approval
      const updatedUser = await prisma.users.update({
        where: { id: userId },
        data: {
          approvedByAdmin: true,
          approvedAt: new Date(),
          approvedBy: req.user!.id,
          role: role || user.role, // Allow admin to set role during approval
          updatedAt: new Date()
        },
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          role: true,
          approvedAt: true
        }
      });

      logger?.info(`User approved: ${user.email} by admin ${req.user!.email}`);

      // Send approval email
      try {
        await emailService.send({
          to: user.email,
          template: "notification",
          data: {
            subject: "Account Approved - Welcome to Advancia Pay!",
            message: `Good news! Your account has been approved. You can now login and access all features.`,
            dashboardUrl: `${process.env.FRONTEND_URL}/login`
          }
        });
      } catch (emailError) {
        logger?.error("Failed to send approval email:", emailError);
      }

      res.json({
        message: "User approved successfully",
        user: updatedUser
      });
    } catch (error) {
      logger?.error("[Approve User Error]:", error);
      res.status(500).json({ error: "Failed to approve user" });
    }
  }
);

/**
 * POST /api/approvals/reject/:userId - Reject user account
 */
router.post("/reject/:userId",
  authenticate,
  requireFeature("MANAGE_USERS"),
  trackActivity("REJECT_USER"),
  async (req, res) => {
    try {
      const { userId } = req.params;
      const { reason } = req.body;

      // Find user
      const user = await prisma.users.findUnique({
        where: { id: userId }
      });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Deactivate user (soft rejection)
      await prisma.users.update({
        where: { id: userId },
        data: {
          active: false,
          blockedAt: new Date(),
          blockedReason: reason || "Account registration rejected",
          blockedBy: req.user!.id,
          updatedAt: new Date()
        }
      });

      logger?.info(`User rejected: ${user.email} by admin ${req.user!.email}`);

      // Send rejection email
      try {
        await emailService.send({
          to: user.email,
          template: "notification",
          data: {
            subject: "Account Registration Update",
            message: `Your account registration has been reviewed. ${reason || "Please contact support for more information."}`,
            dashboardUrl: `${process.env.FRONTEND_URL}/contact`
          }
        });
      } catch (emailError) {
        logger?.error("Failed to send rejection email:", emailError);
      }

      res.json({ message: "User rejected successfully" });
    } catch (error) {
      logger?.error("[Reject User Error]:", error);
      res.status(500).json({ error: "Failed to reject user" });
    }
  }
);

/**
 * POST /api/approvals/bulk-approve - Bulk approve users
 */
router.post("/bulk-approve",
  authenticate,
  requireFeature("MANAGE_USERS"),
  trackActivity("BULK_APPROVE_USERS"),
  async (req, res) => {
    try {
      const { userIds } = req.body;

      if (!Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({ error: "User IDs array is required" });
      }

      const updatedUsers = await prisma.users.updateMany({
        where: {
          id: { in: userIds },
          approvedByAdmin: false
        },
        data: {
          approvedByAdmin: true,
          approvedAt: new Date(),
          approvedBy: req.user!.id,
          updatedAt: new Date()
        }
      });

      logger?.info(`Bulk approved ${updatedUsers.count} users by admin ${req.user!.email}`);

      res.json({
        message: `Successfully approved ${updatedUsers.count} users`,
        count: updatedUsers.count
      });
    } catch (error) {
      logger?.error("[Bulk Approve Error]:", error);
      res.status(500).json({ error: "Failed to bulk approve users" });
    }
  }
);

export default router;
