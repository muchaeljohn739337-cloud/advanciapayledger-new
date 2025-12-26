import Decimal from "decimal.js";
import { Router } from "express";
import { Server } from "socket.io";
import { authenticateToken, requireAdmin } from "../middleware/auth";
import prisma from "../prismaClient";
import { serializeDecimal, serializeDecimalFields } from "../utils/decimal";

const router = Router();
let io: Server;

export function setCryptoAdminSocketIO(socketIO: Server) {
  io = socketIO;
}

// Get pending deposits/withdrawals
router.get("/pending", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [deposits, withdrawals] = await Promise.all([
      prisma.crypto_deposits.findMany({
        where: { status: "PENDING" },
        include: { user: { select: { id: true, email: true, name: true, tier: true, kycStatus: true } } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.crypto_withdrawals.findMany({
        where: { status: "PENDING", requiresApproval: true },
        include: { user: { select: { id: true, email: true, name: true, tier: true, kycStatus: true } } },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    res.json({
      deposits: deposits.map((d) => serializeDecimalFields(d)),
      withdrawals: withdrawals.map((w) => serializeDecimalFields(w)),
    });
  } catch (error) {
    console.error("Get pending transactions error:", error);
    res.status(500).json({ error: "Failed to fetch pending transactions" });
  }
});

// Get pending deposits/withdrawals with AI analysis
router.get("/pending-with-ai", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [deposits, withdrawals] = await Promise.all([
      prisma.crypto_deposits.findMany({
        where: { status: "PENDING" },
        include: {
          user: { select: { id: true, email: true, name: true, tier: true, kycStatus: true, createdAt: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.crypto_withdrawals.findMany({
        where: { status: "PENDING", requiresApproval: true },
        include: {
          user: { select: { id: true, email: true, name: true, tier: true, kycStatus: true, createdAt: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    // Add AI analysis to each withdrawal
    const withdrawalsWithAI = await Promise.all(
      withdrawals.map(async (withdrawal) => {
        const aiAnalysis = await generateAIAnalysis(withdrawal);
        const accountAge = Math.floor((Date.now() - withdrawal.user.createdAt.getTime()) / (1000 * 60 * 60 * 24));

        return {
          ...serializeDecimalFields(withdrawal),
          user: {
            ...withdrawal.user,
            accountAge,
          },
          aiAnalysis,
        };
      })
    );

    res.json({
      deposits: deposits.map((d) => serializeDecimalFields(d)),
      withdrawals: withdrawalsWithAI,
    });
  } catch (error) {
    console.error("Get pending transactions with AI error:", error);
    res.status(500).json({ error: "Failed to fetch pending transactions" });
  }
});

// Enhanced bulk approval endpoint
router.post("/bulk-approve", authenticateToken, requireAdmin, async (req, res) => {
  const { withdrawalIds } = req.body;
  const adminId = req.user!.userId;

  if (!Array.isArray(withdrawalIds)) {
    return res.status(400).json({ error: "withdrawalIds must be an array" });
  }

  try {
    const results = await Promise.all(
      withdrawalIds.map(async (id) => {
        try {
          const withdrawal = await prisma.crypto_withdrawals.findUnique({
            where: { id },
            include: { user: true },
          });

          if (!withdrawal || withdrawal.status !== "PENDING") {
            return { id, success: false, error: "Invalid withdrawal" };
          }

          // Execute blockchain transaction
          const txHash = await executeBlockchainTransaction(
            withdrawal.currency,
            withdrawal.sourceWallet,
            withdrawal.destinationWallet,
            withdrawal.amount.toString()
          );

          await prisma.crypto_withdrawals.update({
            where: { id },
            data: {
              status: "APPROVED",
              reviewedBy: adminId,
              reviewedAt: new Date(),
              txHash,
            },
          });

          return { id, success: true, txHash };
        } catch (error: any) {
          return { id, success: false, error: error.message };
        }
      })
    );

    res.json({ results });
  } catch (error) {
    console.error("Bulk approve error:", error);
    res.status(500).json({ error: "Failed to process bulk approval" });
  }
});

// AI Dashboard analytics endpoint
router.get("/ai-dashboard", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [pendingWithdrawals, highRiskWithdrawals, totalValueResult, completedToday] = await Promise.all([
      prisma.crypto_withdrawals.count({ where: { status: "PENDING" } }),
      prisma.crypto_withdrawals.count({
        where: {
          status: "PENDING",
          // Add AI risk score filter when implemented
        },
      }),
      prisma.crypto_withdrawals.aggregate({
        where: { status: "PENDING" },
        _sum: { usdEquivalent: true },
      }),
      prisma.crypto_withdrawals.count({
        where: {
          status: "APPROVED",
          approvedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
      }),
    ]);

    const approvalRate =
      pendingWithdrawals > 0 ? Math.round((completedToday / (pendingWithdrawals + completedToday)) * 100) : 100;

    res.json({
      analytics: {
        totalPending: pendingWithdrawals,
        highRiskCount: Math.floor(pendingWithdrawals * 0.3), // Mock high risk count
        totalValueUSD: Math.round(parseFloat(totalValueResult._sum.usdEquivalent?.toString() || "0")),
        avgProcessingTime: 2.5, // Mock average processing time in hours
        approvalRate,
        topCurrency: "BTC",
      },
    });
  } catch (error) {
    console.error("AI dashboard error:", error);
    res.status(500).json({ error: "Failed to fetch AI dashboard data" });
  }
});

// Approve deposit
router.post("/deposits/:id/approve", authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const adminId = req.user!.userId;
  const { notes } = req.body;

  try {
    const deposit = await prisma.crypto_deposits.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!deposit || deposit.status !== "PENDING") {
      return res.status(400).json({ error: "Invalid deposit" });
    }

    // Update deposit status
    await prisma.crypto_deposits.update({
      where: { id },
      data: {
        status: "APPROVED",
        reviewedBy: adminId,
        reviewedAt: new Date(),
      },
    });

    // Credit user crypto balance
    await prisma.user_crypto_balances.upsert({
      where: {
        userId_currency: {
          userId: deposit.userId,
          currency: deposit.currency,
        },
      },
      update: {
        balance: { increment: deposit.amount },
      },
      create: {
        userId: deposit.userId,
        currency: deposit.currency,
        balance: deposit.amount,
      },
    });

    // Create ledger entry
    await prisma.crypto_ledger.create({
      data: {
        userId: deposit.userId,
        type: "DEPOSIT",
        amount: deposit.amount,
        currency: deposit.currency,
        txHash: deposit.txHash,
        actorId: adminId,
        status: "APPROVED",
      },
    });

    // Create audit log
    await prisma.audit_logs.create({
      data: {
        userId: adminId,
        action: "CRYPTO_DEPOSIT_APPROVED",
        resourceType: "CryptoDeposit",
        resourceId: id,
        details: {
          depositId: id,
          amount: serializeDecimal(deposit.amount),
          currency: deposit.currency,
          userId: deposit.userId,
          notes,
        },
        ipAddress: req.ip || "unknown",
      },
    });

    // Notify user
    if (io) {
      io.to(`user-${deposit.userId}`).emit("crypto-deposit-approved", {
        depositId: id,
        amount: serializeDecimal(deposit.amount),
        currency: deposit.currency,
        message: "Deposit successful ✅ Funds are available",
      });
    }

    res.json({ message: "Deposit approved" });
  } catch (error) {
    console.error("Approve deposit error:", error);
    res.status(500).json({ error: "Failed to approve deposit" });
  }
});

// Reject deposit
router.post("/deposits/:id/reject", authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const adminId = req.user!.userId;
  const { reason } = req.body;

  if (!reason) {
    return res.status(400).json({ error: "Rejection reason required" });
  }

  try {
    const deposit = await prisma.crypto_deposits.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!deposit || deposit.status !== "PENDING") {
      return res.status(400).json({ error: "Invalid deposit" });
    }

    // Update deposit status
    await prisma.crypto_deposits.update({
      where: { id },
      data: {
        status: "REJECTED",
        reviewedBy: adminId,
        reviewedAt: new Date(),
        rejectionReason: reason,
      },
    });

    // Create audit log
    await prisma.audit_logs.create({
      data: {
        userId: adminId,
        action: "CRYPTO_DEPOSIT_REJECTED",
        resourceType: "CryptoDeposit",
        resourceId: id,
        details: {
          depositId: id,
          amount: serializeDecimal(deposit.amount),
          currency: deposit.currency,
          userId: deposit.userId,
          reason,
        },
        ipAddress: req.ip || "unknown",
      },
    });

    // Notify user
    if (io) {
      io.to(`user-${deposit.userId}`).emit("crypto-deposit-rejected", {
        depositId: id,
        amount: serializeDecimal(deposit.amount),
        currency: deposit.currency,
        reason,
        message: "Deposit was rejected ⚠️ Please contact support",
      });
    }

    res.json({ message: "Deposit rejected" });
  } catch (error) {
    console.error("Reject deposit error:", error);
    res.status(500).json({ error: "Failed to reject deposit" });
  }
});

// Approve withdrawal
router.post("/withdrawals/:id/approve", authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const adminId = req.user!.userId;

  try {
    const withdrawal = await prisma.crypto_withdrawals.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!withdrawal || withdrawal.status !== "PENDING") {
      return res.status(400).json({ error: "Invalid withdrawal" });
    }

    // Execute blockchain transaction
    const txHash = await executeBlockchainTransaction(
      withdrawal.currency,
      withdrawal.sourceWallet,
      withdrawal.destinationWallet,
      withdrawal.amount.toString()
    );

    // Update withdrawal
    await prisma.crypto_withdrawals.update({
      where: { id },
      data: {
        status: "APPROVED",
        reviewedBy: adminId,
        reviewedAt: new Date(),
        txHash,
      },
    });

    // Create ledger entry
    await prisma.crypto_ledger.create({
      data: {
        userId: withdrawal.userId,
        type: "WITHDRAWAL",
        amount: withdrawal.amount,
        currency: withdrawal.currency,
        txHash,
        actorId: adminId,
        status: "APPROVED",
      },
    });

    // Create audit log
    await prisma.audit_logs.create({
      data: {
        userId: adminId,
        action: "CRYPTO_WITHDRAWAL_APPROVED",
        resourceType: "CryptoWithdrawal",
        resourceId: id,
        details: {
          withdrawalId: id,
          amount: serializeDecimal(withdrawal.amount),
          currency: withdrawal.currency,
          userId: withdrawal.userId,
          txHash,
        },
        ipAddress: req.ip || "unknown",
      },
    });

    // Notify user
    if (io) {
      io.to(`user-${withdrawal.userId}`).emit("crypto-withdrawal-approved", {
        withdrawalId: id,
        amount: serializeDecimal(withdrawal.amount),
        currency: withdrawal.currency,
        txHash,
        message: "Withdrawal successful ✅ Funds have been sent",
      });
    }

    res.json({ message: "Withdrawal approved", txHash });
  } catch (error) {
    console.error("Approve withdrawal error:", error);
    res.status(500).json({ error: "Failed to approve withdrawal" });
  }
});

// Reject withdrawal
router.post("/withdrawals/:id/reject", authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const adminId = req.user!.userId;
  const { reason } = req.body;

  if (!reason) {
    return res.status(400).json({ error: "Rejection reason required" });
  }

  try {
    const withdrawal = await prisma.crypto_withdrawals.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!withdrawal || withdrawal.status !== "PENDING") {
      return res.status(400).json({ error: "Invalid withdrawal" });
    }

    // Update withdrawal status
    await prisma.crypto_withdrawals.update({
      where: { id },
      data: {
        status: "REJECTED",
        reviewedBy: adminId,
        reviewedAt: new Date(),
        rejectionReason: reason,
      },
    });

    // Refund to user balance
    await prisma.user_crypto_balances.update({
      where: {
        userId_currency: {
          userId: withdrawal.userId,
          currency: withdrawal.currency,
        },
      },
      data: {
        balance: {
          increment: withdrawal.totalAmount,
        },
      },
    });

    // Create audit log
    await prisma.audit_logs.create({
      data: {
        userId: adminId,
        action: "CRYPTO_WITHDRAWAL_REJECTED",
        resourceType: "CryptoWithdrawal",
        resourceId: id,
        details: {
          withdrawalId: id,
          amount: serializeDecimal(withdrawal.amount),
          currency: withdrawal.currency,
          userId: withdrawal.userId,
          reason,
        },
        ipAddress: req.ip || "unknown",
      },
    });

    // Notify user
    if (io) {
      io.to(`user-${withdrawal.userId}`).emit("crypto-withdrawal-rejected", {
        withdrawalId: id,
        amount: serializeDecimal(withdrawal.amount),
        currency: withdrawal.currency,
        reason,
        message: "Your withdrawal was rejected ⚠️ Try again later",
      });
    }

    res.json({ message: "Withdrawal rejected" });
  } catch (error) {
    console.error("Reject withdrawal error:", error);
    res.status(500).json({ error: "Failed to reject withdrawal" });
  }
});

// Get crypto statistics
router.get("/stats", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [depositStats, withdrawalStats] = await Promise.all([
      prisma.crypto_deposits.groupBy({
        by: ["status", "currency"],
        _count: true,
        _sum: { amount: true },
      }),
      prisma.crypto_withdrawals.groupBy({
        by: ["status", "currency"],
        _count: true,
        _sum: { amount: true },
      }),
    ]);

    const pendingCount = await prisma.$transaction([
      prisma.crypto_deposits.count({ where: { status: "PENDING" } }),
      prisma.crypto_withdrawals.count({ where: { status: "PENDING", requiresApproval: true } }),
    ]);

    res.json({
      deposits: depositStats.map((s) => ({
        status: s.status,
        currency: s.currency,
        count: s._count,
        totalAmount: serializeDecimal(s._sum.amount || 0),
      })),
      withdrawals: withdrawalStats.map((s) => ({
        status: s.status,
        currency: s.currency,
        count: s._count,
        totalAmount: serializeDecimal(s._sum.amount || 0),
      })),
      pendingDeposits: pendingCount[0],
      pendingWithdrawals: pendingCount[1],
    });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({ error: "Failed to fetch statistics" });
  }
});

// Admin send crypto to user wallet
router.post("/send", authenticateToken, requireAdmin, async (req, res) => {
  const { userId, currency, amount, destinationWallet, reason } = req.body;
  const adminId = req.user!.userId;

  if (!userId || !currency || !amount || !reason) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  if (reason.trim().length < 10) {
    return res.status(400).json({ error: "Reason must be at least 10 characters" });
  }

  try {
    // Get user
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, active: true, suspended: true },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.suspended || !user.active) {
      return res.status(400).json({ error: "User account is suspended or inactive" });
    }

    // Get or validate destination wallet
    let walletAddress = destinationWallet;
    if (!walletAddress) {
      // Try to get user's saved wallet address
      const userWallet = await prisma.user_crypto_balances.findUnique({
        where: { userId_currency: { userId, currency } },
        select: { walletAddress: true },
      });
      walletAddress = userWallet?.walletAddress || null;
    }

    if (!walletAddress) {
      return res.status(400).json({ error: "Destination wallet address required" });
    }

    // Validate wallet address format
    if (!isValidWalletAddress(currency, walletAddress)) {
      return res.status(400).json({ error: "Invalid wallet address format" });
    }

    // Get platform wallet
    const platformWallet = await getPlatformWallet(currency);
    const platformBalance = await getPlatformBalance(currency);

    const amountDecimal = new Decimal(amount);
    const networkFee = await estimateNetworkFee(currency, amount);

    if (platformBalance.lt(amountDecimal.plus(networkFee))) {
      return res.status(400).json({
        error: "Insufficient platform balance",
        available: serializeDecimal(platformBalance),
        required: serializeDecimal(amountDecimal.plus(networkFee)),
      });
    }

    // Execute blockchain transaction
    const txHash = await executeBlockchainTransaction(
      currency,
      platformWallet.address,
      walletAddress,
      amountDecimal.toString()
    );

    // Credit user crypto balance
    await prisma.user_crypto_balances.upsert({
      where: {
        userId_currency: {
          userId,
          currency,
        },
      },
      update: {
        balance: { increment: amountDecimal },
      },
      create: {
        userId,
        currency,
        balance: amountDecimal,
        walletAddress,
      },
    });

    // Create ledger entry
    await prisma.crypto_ledger.create({
      data: {
        userId,
        type: "ADMIN_SEND",
        amount: amountDecimal,
        currency,
        txHash,
        actorId: adminId,
        status: "APPROVED",
        metadata: { reason, destinationWallet: walletAddress },
      },
    });

    // Create audit log
    await prisma.audit_logs.create({
      data: {
        userId: adminId,
        action: "CRYPTO_ADMIN_SEND",
        resourceType: "CryptoTransfer",
        resourceId: txHash,
        details: {
          userId,
          currency,
          amount: serializeDecimal(amountDecimal),
          destinationWallet: walletAddress,
          txHash,
          reason,
        },
        ipAddress: req.ip || "unknown",
      },
    });

    // Notify user
    if (io) {
      io.to(`user-${userId}`).emit("crypto-admin-send", {
        currency,
        amount: serializeDecimal(amountDecimal),
        txHash,
        message: `✅ Admin sent ${amount} ${currency} to your wallet`,
      });
    }

    res.json({
      success: true,
      message: "Crypto sent successfully",
      txHash,
      amount: serializeDecimal(amountDecimal),
      currency,
    });
  } catch (error) {
    console.error("Admin send crypto error:", error);
    res.status(500).json({ error: "Failed to send crypto" });
  }
});

// Helper: Validate wallet address
function isValidWalletAddress(currency: string, address: string): boolean {
  try {
    if (currency === "BTC") {
      return /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/.test(address);
    } else if (["ETH", "USDT", "USDC"].includes(currency)) {
      const { ethers } = require("ethers");
      return ethers.utils.isAddress(address);
    }
    return false;
  } catch {
    return false;
  }
}

// Helper: Get platform wallet
async function getPlatformWallet(currency: string) {
  // In production: Get from admin_portfolios or platform_wallets table
  const wallet = await prisma.admin_portfolios.findFirst({
    where: { currency },
  });
  if (!wallet) throw new Error(`Platform wallet not found for ${currency}`);
  return { address: wallet.walletAddress || "0x0000000000000000000000000000000000000000" };
}

// Helper: Get platform balance
async function getPlatformBalance(currency: string): Promise<Decimal> {
  const portfolio = await prisma.admin_portfolios.findFirst({
    where: { currency },
  });
  return portfolio ? new Decimal(portfolio.balance.toString()) : new Decimal(0);
}

// Helper: Estimate network fee
async function estimateNetworkFee(currency: string, amount: string): Promise<Decimal> {
  const feeRates: { [key: string]: Decimal } = {
    BTC: new Decimal(0.0001),
    ETH: new Decimal(0.001),
    USDT: new Decimal(0.002),
    USDC: new Decimal(0.002),
  };
  return feeRates[currency] || new Decimal(0);
}

// Helper: Execute blockchain transaction (placeholder)
async function executeBlockchainTransaction(
  currency: string,
  from: string,
  to: string,
  amount: string
): Promise<string> {
  // In production: Use ethers.js, bitcoinjs-lib, etc.
  // For now, return mock tx hash
  return "0x" + Math.random().toString(16).substr(2, 64);
}

// Helper: Generate AI analysis for withdrawal
async function generateAIAnalysis(withdrawal: any) {
  try {
    // Calculate risk score based on multiple factors
    let riskScore = 0;
    const factors = [];

    // Amount-based risk
    if (withdrawal.amount.gt(new Decimal(10000))) {
      riskScore += 30;
      factors.push("High amount withdrawal");
    } else if (withdrawal.amount.gt(new Decimal(5000))) {
      riskScore += 15;
      factors.push("Moderate amount withdrawal");
    }

    // User tier risk
    if (withdrawal.user.tier === "FREE") {
      riskScore += 15;
      factors.push("Free tier user");
    }

    // KYC status risk
    if (withdrawal.user.kycStatus !== "APPROVED") {
      riskScore += 25;
      factors.push("KYC not approved");
    }

    // Account age risk
    const accountAge = Math.floor((Date.now() - withdrawal.user.createdAt.getTime()) / (1000 * 60 * 60 * 24));
    if (accountAge < 30) {
      riskScore += 20;
      factors.push("New account (< 30 days)");
    }

    // Velocity check
    const [recent24h, recent7d] = await Promise.all([
      prisma.crypto_withdrawals.count({
        where: {
          userId: withdrawal.userId,
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
      }),
      prisma.crypto_withdrawals.count({
        where: {
          userId: withdrawal.userId,
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      }),
    ]);

    const isHighVelocity = recent24h > 3 || recent7d > 10;
    if (isHighVelocity) {
      riskScore += 20;
      factors.push("High velocity withdrawals");
    }

    // Determine recommendation
    let recommendation = "APPROVE";
    if (riskScore > 70) recommendation = "REJECT";
    else if (riskScore > 40) recommendation = "REVIEW";

    return {
      riskScore: Math.min(riskScore, 100),
      recommendation,
      factors,
      confidence: 0.85,
      velocityCheck: {
        recent24h,
        recent7d,
        isHighVelocity,
      },
    };
  } catch (error) {
    console.error("AI analysis error:", error);
    return {
      riskScore: 50,
      recommendation: "REVIEW",
      factors: ["Analysis error - manual review required"],
      confidence: 0.1,
      velocityCheck: {
        recent24h: 0,
        recent7d: 0,
        isHighVelocity: false,
      },
    };
  }
}

export default router;
