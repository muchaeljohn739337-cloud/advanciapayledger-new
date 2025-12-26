/**
 * Admin Password Recovery Routes
 * Secure password recovery for admin accounts with MFA
 */

import bcrypt from "bcryptjs";
import { Router } from "express";
import { z } from "zod";
import prisma from "../prismaClient";
import { EmailPriority, queueEmail } from "../services/emailQueueService";
import { generateOTP } from "../services/otpService";
import { logger } from "../utils/logger";

const router = Router();

const forgotPasswordSchema = z.object({
  email: z.string().email(),
  phone: z.string().optional(),
});

const verifyOTPSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
});

const resetPasswordSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
  newPassword: z.string().min(8),
});

// POST /api/auth/admin/forgot-password
router.post("/forgot-password", async (req, res) => {
  try {
    const { email, phone } = forgotPasswordSchema.parse(req.body);

    // Verify admin email
    if (email !== process.env.ADMIN_EMAIL) {
      return res.status(404).json({ error: "Admin account not found" });
    }

    // Get admin user
    const admin = await prisma.users.findFirst({
      where: {
        email,
        role: { in: ["ADMIN", "SUPER_ADMIN"] },
      },
    });

    if (!admin) {
      return res.status(404).json({ error: "Admin account not found" });
    }

    // Generate OTP
    const otp = generateOTP();
    const expires = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store OTP (use Redis if available, otherwise in-memory)
    const redis = (await import("../services/redisClient")).getRedis();
    const otpKey = `admin:reset:otp:${email}`;

    if (redis) {
      await redis.setex(otpKey, 600, otp); // 10 minutes TTL
    } else {
      // In-memory fallback
      const mem: any = (global as any).__adminResetMem || ((global as any).__adminResetMem = new Map());
      mem.set(otpKey, { otp, expires });
    }

    // Send OTP via SMS Pool if phone provided
    if (phone) {
      try {
        const smsResult = await smsPoolService.sendSMS(
          phone,
          `Your admin password reset OTP: ${otp}. Valid for 10 minutes.`
        );
        if (smsResult.success) {
          logger.info(`📱 Admin reset OTP sent via SMS Pool to ${phone}`);
        } else {
          logger.warn(`Failed to send SMS via SMS Pool: ${smsResult.error}`);
        }
      } catch (smsError) {
        logger.error("Failed to send SMS OTP:", smsError);
      }
    }

    // Also send email as backup
    await queueEmail({
      to: email,
      subject: "Admin Password Reset OTP",
      html: `
        <h2>Admin Password Reset</h2>
        <p>Your OTP code: <strong>${otp}</strong></p>
        <p>Valid for 10 minutes.</p>
        <p>If you didn't request this, please contact security immediately.</p>
      `,
      priority: EmailPriority.CRITICAL,
    });

    // Log security event
    await prisma.audit_logs.create({
      data: {
        id: `audit-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        userId: admin.id,
        adminId: admin.id,
        action: "ADMIN_PASSWORD_RESET_REQUEST",
        details: {
          email,
          phone: phone ? "provided" : "not provided",
          ipAddress: req.ip || "unknown",
        },
        timestamp: new Date(),
      },
    });

    res.json({
      message: "OTP sent to admin email and phone (if provided)",
      expiresIn: 600, // 10 minutes
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({ error: error.errors });
    }
    logger.error("Admin forgot password error:", error);
    res.status(500).json({ error: "Failed to process request" });
  }
});

// POST /api/auth/admin/verify-otp
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = verifyOTPSchema.parse(req.body);

    // Verify admin email
    if (email !== process.env.ADMIN_EMAIL) {
      return res.status(404).json({ error: "Admin account not found" });
    }

    // Verify OTP
    const redis = (await import("../services/redisClient")).getRedis();
    const otpKey = `admin:reset:otp:${email}`;

    let storedOTP: string | null = null;

    if (redis) {
      storedOTP = await redis.get(otpKey);
    } else {
      const mem: any = (global as any).__adminResetMem || new Map();
      const entry = mem.get(otpKey);
      if (entry && entry.expires > Date.now()) {
        storedOTP = entry.otp;
      }
    }

    if (!storedOTP || storedOTP !== otp) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    // Generate temporary reset token
    const resetToken = require("crypto").randomBytes(32).toString("hex");
    const tokenKey = `admin:reset:token:${email}`;

    if (redis) {
      await redis.setex(tokenKey, 600, resetToken); // 10 minutes
      await redis.del(otpKey); // Delete OTP after use
    } else {
      const mem: any = (global as any).__adminResetMem || new Map();
      mem.set(tokenKey, { token: resetToken, expires: Date.now() + 600000 });
      mem.delete(otpKey);
    }

    res.json({
      message: "OTP verified",
      resetToken,
      expiresIn: 600,
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({ error: error.errors });
    }
    logger.error("Admin verify OTP error:", error);
    res.status(500).json({ error: "Failed to verify OTP" });
  }
});

// POST /api/auth/admin/reset-password
router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = resetPasswordSchema.parse(req.body);

    // Verify admin email
    if (email !== process.env.ADMIN_EMAIL) {
      return res.status(404).json({ error: "Admin account not found" });
    }

    // Verify OTP again
    const redis = (await import("../services/redisClient")).getRedis();
    const otpKey = `admin:reset:otp:${email}`;

    let storedOTP: string | null = null;

    if (redis) {
      storedOTP = await redis.get(otpKey);
    } else {
      const mem: any = (global as any).__adminResetMem || new Map();
      const entry = mem.get(otpKey);
      if (entry && entry.expires > Date.now()) {
        storedOTP = entry.otp;
      }
    }

    if (!storedOTP || storedOTP !== otp) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    // Get admin user
    const admin = await prisma.users.findFirst({
      where: {
        email,
        role: { in: ["ADMIN", "SUPER_ADMIN"] },
      },
    });

    if (!admin) {
      return res.status(404).json({ error: "Admin account not found" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await prisma.users.update({
      where: { id: admin.id },
      data: { passwordHash: hashedPassword },
    });

    // Clean up OTP
    if (redis) {
      await redis.del(otpKey);
    } else {
      const mem: any = (global as any).__adminResetMem || new Map();
      mem.delete(otpKey);
    }

    // Log security event
    await prisma.audit_logs.create({
      data: {
        id: `audit-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        userId: admin.id,
        adminId: admin.id,
        action: "ADMIN_PASSWORD_RESET_COMPLETE",
        details: {
          email,
          ipAddress: req.ip || "unknown",
        },
        timestamp: new Date(),
      },
    });

    // Send confirmation email
    await queueEmail({
      to: email,
      subject: "Admin Password Reset Successful",
      html: `
        <h2>Password Reset Successful</h2>
        <p>Your admin password has been reset successfully.</p>
        <p>If you didn't perform this action, please contact security immediately.</p>
      `,
      priority: EmailPriority.CRITICAL,
    });

    res.json({
      message: "Admin password reset successfully",
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({ error: error.errors });
    }
    logger.error("Admin reset password error:", error);
    res.status(500).json({ error: "Failed to reset password" });
  }
});

export default router;
