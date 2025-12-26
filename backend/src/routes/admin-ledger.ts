import { Router } from "express";
import type { Server as IOServer } from "socket.io";
import { Decimal } from "decimal.js";
import { authenticateToken, requireAdmin } from "../middleware/auth";
import { idempotency, IdempotentRequest } from "../middleware/idempotency";
import prisma from "../prismaClient";
import { serializeDecimalFields } from "../utils/decimal";
import { getBalanceFromLedger } from "../utils/ledger";
import { logger } from "../utils/logger";

const router = Router();

let ioRef: IOServer | null = null;
export function setAdminLedgerSocketIO(io: IOServer) {
  ioRef = io;
}

// ============================================================
// ADMIN LEDGER SYSTEM - Financial Operations Management
// ============================================================
// v2.0 - Fintech-Grade with:
// - Idempotency via headers (replaces 1-min duplicate check)
// - Atomic transactions (prisma.$transaction)
// - Fund holds for pending operations
// - Decimal.js precision (no more parseFloat)
// - Ledger-computed balances
// ============================================================

// Threshold for high-risk operations requiring approval
const HIGH_RISK_THRESHOLD = 1000;

// Helper: Create audit log entry
async function createAuditLog(
  action: string,
  userId: string,
  adminId: string,
  details: any,
  tx?: typeof prisma
) {
  const db = tx || prisma;
  await db.audit_logs.create({
    data: {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      action,
      userId,
      adminId,
      details,
      timestamp: new Date(),
    },
  });
}

// Helper: Notify user via Socket.IO
function notifyUser(userId: string, event: string, data: Record<string, unknown>) {
  if (ioRef) {
    ioRef.to(`user-${userId}`).emit(event, data);
  }
}

// Helper: Check user suspension status
async function checkUserStatus(userId: string) {
  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: { active: true, suspended: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (user.suspended) {
    throw new Error("User account is suspended. Cannot process financial operations.");
  }

  return user;
}

// Helper: Determine if operation requires approval based on amount
function requiresManualApproval(amount: Decimal, forceApproval: boolean): boolean {
  return forceApproval || amount.greaterThan(HIGH_RISK_THRESHOLD);
}

// ============================================================
// POST /api/admin/ledger/deduction
// Admin-only: Deduct funds from user account
// ============================================================
router.post(
  "/deduction",
  authenticateToken as any,
  requireAdmin as any,
  idempotency({ required: true }),
  async (req: IdempotentRequest, res) => {
    try {
      const adminId = (req as any).user.userId;
      const { userId, amount, currency, reason, requiresApproval = true } = req.body;

      // Validation
      if (!userId || !amount || !currency || !reason) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields: userId, amount, currency, reason",
        });
      }

      const amountDecimal = new Decimal(amount);
      if (amountDecimal.lte(0)) {
        return res.status(400).json({
          success: false,
          message: "Amount must be greater than 0",
        });
      }

      if (reason.trim().length < 10) {
        return res.status(400).json({
          success: false,
          message: "Reason must be at least 10 characters long for audit compliance",
        });
      }

      // Check user status
      await checkUserStatus(userId);

      // Get balance from ledger (not from wallet table)
      const balanceInfo = await getBalanceFromLedger(userId, currency);
      if (balanceInfo.availableBalance.lessThan(amountDecimal)) {
        return res.status(400).json({
          success: false,
          message: `Insufficient available balance. User has ${balanceInfo.availableBalance} ${currency} available`,
        });
      }

      const needsApproval = requiresManualApproval(amountDecimal, requiresApproval);
      const status = needsApproval ? "PENDING" : "APPROVED";
      const ledgerId = `ledger-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      const holdId = status === "PENDING" ? `hold-${Date.now()}-${Math.random().toString(36).substring(7)}` : null;

      // Atomic transaction: create ledger entry + hold funds if pending
      await prisma.$transaction(async (tx) => {
        // Create ledger entry
        await tx.financial_ledger.create({
          data: {
            id: ledgerId,
            userId,
            type: "DEDUCTION",
            amount: amountDecimal,
            currency,
            actorId: adminId,
            reason,
            status,
            txHash: holdId,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });

        // If PENDING, hold the funds immediately
        if (status === "PENDING" && holdId) {
          await tx.crypto_ledger.create({
            data: {
              id: holdId,
              userId,
              currency,
              amount: amountDecimal.negated(),
              type: "WITHDRAWAL_HOLD",
              txHash: ledgerId,
              actorId: adminId,
              status: "APPROVED",
              createdAt: new Date(),
            },
          });
          logger.info(`Hold created: ${holdId} for pending transaction ${ledgerId}`);
        }

        // If auto-approved, process deduction immediately
        if (status === "APPROVED") {
          await tx.crypto_ledger.create({
            data: {
              id: `deduct-${Date.now()}-${Math.random().toString(36).substring(7)}`,
              userId,
              currency,
              amount: amountDecimal.negated(),
              type: "DEDUCTION",
              txHash: ledgerId,
              actorId: adminId,
              status: "APPROVED",
              createdAt: new Date(),
            },
          });

          await tx.transactions.create({
            data: {
              id: `txn-${Date.now()}-${Math.random().toString(36).substring(7)}`,
              userId,
              type: "DEDUCTION",
              amount: amountDecimal,
              status: "COMPLETED",
              description: `Admin deduction (${currency}): ${reason}`,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          });
        }

        await createAuditLog("deduction", userId, adminId, {
          amount: amountDecimal.toString(),
          currency,
          reason,
          ledgerId,
          holdId,
          status,
          idempotencyKey: req.idempotencyKey,
        }, tx as any);
      });

      notifyUser(userId, "ledger-update", {
        type: "DEDUCTION",
        amount: amountDecimal.toString(),
        currency,
        status,
        message: status === "PENDING" 
          ? "Transaction pending. If not resolved within 24 hours, please contact support."
          : "Transaction completed successfully",
      });

      const ledgerEntry = await prisma.financial_ledger.findUnique({ where: { id: ledgerId } });

      res.json({
        success: true,
        message: status === "PENDING" 
          ? "Transaction pending. If not resolved within 24 hours, please contact support."
          : "Transaction completed successfully",
        ledgerEntry: serializeDecimalFields(ledgerEntry as any),
        requiresApproval: status === "PENDING",
        holdId,
      });
    } catch (error: any) {
      logger.error("Deduction error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to process deduction",
      });
    }
  }
);

// ============================================================
// POST /api/admin/ledger/credit
// Admin-only: Add funds to user account
// ============================================================
router.post(
  "/credit",
  authenticateToken as any,
  requireAdmin as any,
  idempotency({ required: true }),
  async (req: IdempotentRequest, res) => {
    try {
      const adminId = (req as any).user.userId;
      const { userId, amount, currency, reason, txHash } = req.body;

      if (!userId || !amount || !currency || !reason) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields: userId, amount, currency, reason",
        });
      }

      const amountDecimal = new Decimal(amount);
      if (amountDecimal.lte(0)) {
        return res.status(400).json({
          success: false,
          message: "Amount must be greater than 0",
        });
      }

      await checkUserStatus(userId);

      const ledgerId = `ledger-${Date.now()}-${Math.random().toString(36).substring(7)}`;

      const result = await prisma.$transaction(async (tx) => {
        const ledgerEntry = await tx.financial_ledger.create({
          data: {
            id: ledgerId,
            userId,
            type: "CREDIT",
            amount: amountDecimal,
            currency,
            actorId: adminId,
            reason,
            status: "APPROVED",
            txHash: txHash || null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });

        await tx.crypto_ledger.create({
          data: {
            id: `credit-${Date.now()}-${Math.random().toString(36).substring(7)}`,
            userId,
            currency,
            amount: amountDecimal,
            type: "CREDIT",
            txHash: ledgerId,
            actorId: adminId,
            status: "APPROVED",
            createdAt: new Date(),
          },
        });

        await tx.transactions.create({
          data: {
            id: `txn-${Date.now()}-${Math.random().toString(36).substring(7)}`,
            userId,
            type: "CREDIT",
            amount: amountDecimal,
            status: "COMPLETED",
            description: `Admin credit (${currency}): ${reason}`,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });

        await createAuditLog("credit", userId, adminId, {
          amount: amountDecimal.toString(),
          currency,
          reason,
          ledgerId,
          txHash,
          idempotencyKey: req.idempotencyKey,
        }, tx as any);

        return ledgerEntry;
      });

      const newBalance = await getBalanceFromLedger(userId, currency);

      notifyUser(userId, "ledger-update", {
        type: "CREDIT",
        amount: amountDecimal.toString(),
        currency,
        status: "APPROVED",
        message: "Funds credited to your account",
      });

      res.json({
        success: true,
        message: "Credit processed successfully",
        ledgerEntry: serializeDecimalFields(result as any),
        newBalance: newBalance.balance.toString(),
        availableBalance: newBalance.availableBalance.toString(),
      });
    } catch (error: any) {
      logger.error("Credit error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to process credit",
      });
    }
  }
);

// ============================================================
// POST /api/admin/ledger/adjustment
// Admin-only: Manual balance adjustment (correction)
// ============================================================
router.post(
  "/adjustment",
  authenticateToken as any,
  requireAdmin as any,
  idempotency({ required: true }),
  async (req: IdempotentRequest, res) => {
    try {
      const adminId = (req as any).user.userId;
      const { userId, amount, currency, reason } = req.body;

      if (!userId || amount === undefined || !currency || !reason) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields: userId, amount, currency, reason",
        });
      }

      if (reason.trim().length < 15) {
        return res.status(400).json({
          success: false,
          message: "Adjustment reason must be at least 15 characters for audit compliance",
        });
      }

      const amountDecimal = new Decimal(amount);

      await checkUserStatus(userId);

      if (amountDecimal.lessThan(0)) {
        const balanceInfo = await getBalanceFromLedger(userId, currency);
        if (balanceInfo.availableBalance.lessThan(amountDecimal.abs())) {
          return res.status(400).json({
            success: false,
            message: `Insufficient available balance for negative adjustment`,
          });
        }
      }

      const ledgerId = `ledger-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      const holdId = amountDecimal.lessThan(0) 
        ? `hold-${Date.now()}-${Math.random().toString(36).substring(7)}` 
        : null;

      await prisma.$transaction(async (tx) => {
        await tx.financial_ledger.create({
          data: {
            id: ledgerId,
            userId,
            type: "ADJUSTMENT",
            amount: amountDecimal,
            currency,
            actorId: adminId,
            reason,
            status: "PENDING",
            txHash: holdId,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });

        if (holdId) {
          await tx.crypto_ledger.create({
            data: {
              id: holdId,
              userId,
              currency,
              amount: amountDecimal,
              type: "WITHDRAWAL_HOLD",
              txHash: ledgerId,
              actorId: adminId,
              status: "APPROVED",
              createdAt: new Date(),
            },
          });
          logger.info(`Hold created: ${holdId} for pending adjustment ${ledgerId}`);
        }

        await createAuditLog("adjustment", userId, adminId, {
          amount: amountDecimal.toString(),
          currency,
          reason,
          ledgerId,
          holdId,
          idempotencyKey: req.idempotencyKey,
        }, tx as any);
      });

      notifyUser(userId, "ledger-update", {
        type: "ADJUSTMENT",
        amount: amountDecimal.toString(),
        currency,
        status: "PENDING",
        message: "Transaction pending. If not resolved within 24 hours, please contact support.",
      });

      const ledgerEntry = await prisma.financial_ledger.findUnique({ where: { id: ledgerId } });

      res.json({
        success: true,
        message: "Adjustment created and pending supervisor approval",
        ledgerEntry: serializeDecimalFields(ledgerEntry as any),
        requiresApproval: true,
        holdId,
      });
    } catch (error: any) {
      logger.error("Adjustment error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to create adjustment",
      });
    }
  }
);

// ============================================================
// POST /api/admin/ledger/approve/:id
// Admin-only: Approve pending ledger entry
// ============================================================
router.post(
  "/approve/:id",
  authenticateToken as any,
  requireAdmin as any,
  idempotency({ required: true }),
  async (req: IdempotentRequest, res) => {
    try {
      const adminId = (req as any).user.userId;
      const { id } = req.params;

      const ledgerEntry = await prisma.financial_ledger.findUnique({ where: { id } });

      if (!ledgerEntry) {
        return res.status(404).json({ success: false, message: "Ledger entry not found" });
      }

      if (ledgerEntry.status !== "PENDING") {
        return res.status(400).json({
          success: false,
          message: `Ledger entry already ${ledgerEntry.status.toLowerCase()}`,
        });
      }

      const amountDecimal = new Decimal(ledgerEntry.amount.toString());
      const holdId = ledgerEntry.txHash;

      const updatedEntry = await prisma.$transaction(async (tx) => {
        const updated = await tx.financial_ledger.update({
          where: { id },
          data: { status: "APPROVED", updatedAt: new Date() },
        });

        if (holdId) {
          await tx.crypto_ledger.create({
            data: {
              id: `release-${Date.now()}-${Math.random().toString(36).substring(7)}`,
              userId: ledgerEntry.userId,
              currency: ledgerEntry.currency,
              amount: amountDecimal.abs(),
              type: "WITHDRAWAL_RELEASE",
              txHash: id,
              actorId: adminId,
              status: "APPROVED",
              createdAt: new Date(),
            },
          });
        }

        const finalAmount = ledgerEntry.type === "DEDUCTION" 
          ? amountDecimal.negated() 
          : amountDecimal;

        await tx.crypto_ledger.create({
          data: {
            id: `final-${Date.now()}-${Math.random().toString(36).substring(7)}`,
            userId: ledgerEntry.userId,
            currency: ledgerEntry.currency,
            amount: finalAmount,
            type: ledgerEntry.type as any,
            txHash: id,
            actorId: adminId,
            status: "APPROVED",
            createdAt: new Date(),
          },
        });

        await tx.transactions.create({
          data: {
            id: `txn-${Date.now()}-${Math.random().toString(36).substring(7)}`,
            userId: ledgerEntry.userId,
            type: ledgerEntry.type,
            amount: amountDecimal,
            status: "COMPLETED",
            description: `Admin ${ledgerEntry.type.toLowerCase()} (${ledgerEntry.currency}): ${ledgerEntry.reason}`,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });

        await createAuditLog("ledger_approval", ledgerEntry.userId, adminId, {
          ledgerId: id,
          type: ledgerEntry.type,
          amount: amountDecimal.toString(),
          currency: ledgerEntry.currency,
          holdId,
          idempotencyKey: req.idempotencyKey,
        }, tx as any);

        return updated;
      });

      notifyUser(ledgerEntry.userId, "ledger-update", {
        type: ledgerEntry.type,
        amount: amountDecimal.toString(),
        currency: ledgerEntry.currency,
        status: "APPROVED",
        message: "Transaction completed successfully",
      });

      res.json({
        success: true,
        message: "Ledger entry approved and processed",
        ledgerEntry: serializeDecimalFields(updatedEntry as any),
      });
    } catch (error: any) {
      logger.error("Approval error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to approve ledger entry",
      });
    }
  }
);

// ============================================================
// POST /api/admin/ledger/reject/:id
// Admin-only: Reject pending ledger entry (release held funds)
// ============================================================
router.post(
  "/reject/:id",
  authenticateToken as any,
  requireAdmin as any,
  idempotency({ required: true }),
  async (req: IdempotentRequest, res) => {
    try {
      const adminId = (req as any).user.userId;
      const { id } = req.params;
      const { reason } = req.body;

      if (!reason || reason.trim().length < 10) {
        return res.status(400).json({
          success: false,
          message: "Rejection reason must be at least 10 characters",
        });
      }

      const ledgerEntry = await prisma.financial_ledger.findUnique({ where: { id } });

      if (!ledgerEntry) {
        return res.status(404).json({ success: false, message: "Ledger entry not found" });
      }

      if (ledgerEntry.status !== "PENDING") {
        return res.status(400).json({
          success: false,
          message: `Ledger entry already ${ledgerEntry.status.toLowerCase()}`,
        });
      }

      const amountDecimal = new Decimal(ledgerEntry.amount.toString());
      const holdId = ledgerEntry.txHash;

      const updatedEntry = await prisma.$transaction(async (tx) => {
        const updated = await tx.financial_ledger.update({
          where: { id },
          data: {
            status: "REJECTED",
            reason: `${ledgerEntry.reason} [REJECTED: ${reason}]`,
            updatedAt: new Date(),
          },
        });

        if (holdId) {
          await tx.crypto_ledger.create({
            data: {
              id: `release-${Date.now()}-${Math.random().toString(36).substring(7)}`,
              userId: ledgerEntry.userId,
              currency: ledgerEntry.currency,
              amount: amountDecimal.abs(),
              type: "WITHDRAWAL_RELEASE",
              txHash: id,
              actorId: adminId,
              status: "APPROVED",
              createdAt: new Date(),
            },
          });
          logger.info(`Funds released due to rejection: ${holdId}`);
        }

        await createAuditLog("ledger_rejection", ledgerEntry.userId, adminId, {
          ledgerId: id,
          type: ledgerEntry.type,
          amount: amountDecimal.toString(),
          currency: ledgerEntry.currency,
          rejectionReason: reason,
          holdId,
          fundsReleased: !!holdId,
          idempotencyKey: req.idempotencyKey,
        }, tx as any);

        return updated;
      });

      notifyUser(ledgerEntry.userId, "ledger-update", {
        type: ledgerEntry.type,
        amount: amountDecimal.toString(),
        currency: ledgerEntry.currency,
        status: "REJECTED",
        message: `Transaction rejected: ${reason}`,
      });

      res.json({
        success: true,
        message: holdId ? "Ledger entry rejected. Held funds released." : "Ledger entry rejected",
        ledgerEntry: serializeDecimalFields(updatedEntry as any),
        fundsReleased: !!holdId,
      });
    } catch (error: any) {
      logger.error("Rejection error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to reject ledger entry",
      });
    }
  }
);

// ============================================================
// POST /api/admin/ledger/freeze-account
// ============================================================
router.post("/freeze-account", authenticateToken as any, requireAdmin as any, async (req, res) => {
  try {
    const adminId = (req as any).user.userId;
    const { userId, reason } = req.body;

    if (!userId || !reason || reason.trim().length < 15) {
      return res.status(400).json({
        success: false,
        message: "Missing fields or reason too short (min 15 chars)",
      });
    }

    const user = await prisma.users.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    if (user.suspended) return res.status(400).json({ success: false, message: "User already frozen" });

    await prisma.users.update({
      where: { id: userId },
      data: { suspended: true, active: false },
    });

    await createAuditLog("account_freeze", userId, adminId, { reason });
    notifyUser(userId, "account-status", { status: "FROZEN", message: "Your account has been frozen. Please contact support.", reason });

    res.json({ success: true, message: "User account frozen successfully", userId });
  } catch (error: any) {
    logger.error("Freeze error:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to freeze account" });
  }
});

// ============================================================
// POST /api/admin/ledger/unfreeze-account
// ============================================================
router.post("/unfreeze-account", authenticateToken as any, requireAdmin as any, async (req, res) => {
  try {
    const adminId = (req as any).user.userId;
    const { userId, reason } = req.body;

    if (!userId || !reason) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const user = await prisma.users.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    if (!user.suspended) return res.status(400).json({ success: false, message: "User not frozen" });

    await prisma.users.update({
      where: { id: userId },
      data: { suspended: false, active: true },
    });

    await createAuditLog("account_unfreeze", userId, adminId, { reason });
    notifyUser(userId, "account-status", { status: "ACTIVE", message: "Your account has been unfrozen.", reason });

    res.json({ success: true, message: "User account unfrozen successfully", userId });
  } catch (error: any) {
    logger.error("Unfreeze error:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to unfreeze account" });
  }
});

// ============================================================
// GET /api/admin/ledger/history
// ============================================================
router.get("/history", authenticateToken as any, requireAdmin as any, async (req, res) => {
  try {
    const { userId, type, status, page = "1", limit = "50" } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = Math.min(parseInt(limit as string), 100);

    const where: Record<string, unknown> = {};
    if (userId) where.userId = userId;
    if (type) where.type = type;
    if (status) where.status = status;

    const [total, entries] = await Promise.all([
      prisma.financial_ledger.count({ where }),
      prisma.financial_ledger.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        include: {
          user: { select: { id: true, email: true, username: true } },
          actor: { select: { id: true, email: true, username: true } },
        },
      }),
    ]);

    res.json({
      success: true,
      data: entries.map((e) => serializeDecimalFields(e as any)),
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error: any) {
    logger.error("History error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch ledger history" });
  }
});

// ============================================================
// GET /api/admin/ledger/audit-logs
// ============================================================
router.get("/audit-logs", authenticateToken as any, requireAdmin as any, async (req, res) => {
  try {
    const { userId, adminId, action, page = "1", limit = "50" } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = Math.min(parseInt(limit as string), 100);

    const where: Record<string, unknown> = {};
    if (userId) where.userId = userId;
    if (adminId) where.adminId = adminId;
    if (action) where.action = action;

    const [total, logs] = await Promise.all([
      prisma.audit_logs.count({ where }),
      prisma.audit_logs.findMany({
        where,
        orderBy: { timestamp: "desc" },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
    ]);

    res.json({
      success: true,
      data: logs,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error: any) {
    logger.error("Audit logs error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch audit logs" });
  }
});

// ============================================================
// GET /api/admin/ledger/pending
// ============================================================
router.get("/pending", authenticateToken as any, requireAdmin as any, async (req, res) => {
  try {
    const entries = await prisma.financial_ledger.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, email: true, username: true } },
        actor: { select: { id: true, email: true, username: true } },
      },
    });

    res.json({
      success: true,
      data: entries.map((e) => serializeDecimalFields(e as any)),
      count: entries.length,
    });
  } catch (error: any) {
    logger.error("Pending entries error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch pending entries" });
  }
});

// ============================================================
// GET /api/admin/ledger/user-balance/:userId
// ============================================================
router.get("/user-balance/:userId", authenticateToken as any, requireAdmin as any, async (req, res) => {
  try {
    const { userId } = req.params;
    const { currency } = req.query;

    if (!currency) {
      return res.status(400).json({ success: false, message: "Currency query parameter required" });
    }

    const balanceInfo = await getBalanceFromLedger(userId, currency as string);

    res.json({
      success: true,
      data: {
        userId,
        currency,
        balance: balanceInfo.balance.toString(),
        availableBalance: balanceInfo.availableBalance.toString(),
        heldBalance: balanceInfo.heldBalance.toString(),
        lastUpdated: balanceInfo.lastUpdated,
      },
    });
  } catch (error: any) {
    logger.error("User balance error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch user balance" });
  }
});

export default router;
