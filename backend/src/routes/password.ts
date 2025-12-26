import express from "express";
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { logger } from "../utils/logger";
import { emailService } from "../services/emailService";

const router = express.Router();
const prisma = new PrismaClient();

// Validation schemas
const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email format"),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

/**
 * POST /api/password/forgot - Request password reset
 */
router.post("/forgot", async (req, res) => {
  try {
    const { email } = forgotPasswordSchema.parse(req.body);

    // Find user
    const user = await prisma.users.findUnique({
      where: { email: email.toLowerCase() }
    });

    // Always return success to prevent email enumeration
    if (!user) {
      logger?.info(`Password reset requested for non-existent email: ${email}`);
      return res.json({ 
        message: "If an account exists with this email, you will receive a password reset link." 
      });
    }

    // Check if user is active
    if (!user.active || user.suspended) {
      logger?.info(`Password reset requested for inactive/suspended account: ${email}`);
      return res.json({ 
        message: "If an account exists with this email, you will receive a password reset link." 
      });
    }

    // Generate reset token (32 bytes = 64 hex characters)
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    
    // Token expires in 1 hour
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    // Save hashed token to database
    await prisma.users.update({
      where: { id: user.id },
      data: {
        passwordResetToken: hashedToken,
        passwordResetExpires: expiresAt,
        updatedAt: new Date()
      }
    });

    // Send reset email
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    try {
      await emailService.send({
        to: user.email,
        template: "password-reset",
        data: {
          firstName: user.firstName || user.username,
          resetUrl,
          expiresIn: "1 hour"
        }
      });

      logger?.info(`Password reset email sent to: ${email}`);
    } catch (emailError) {
      logger?.error("Failed to send password reset email:", emailError);
      // Don't expose email errors to user
    }

    res.json({ 
      message: "If an account exists with this email, you will receive a password reset link." 
    });

  } catch (error) {
    logger?.error("Forgot password error:", error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Validation failed",
        details: error.errors.map(e => ({
          field: e.path.join("."),
          message: e.message
        }))
      });
    }

    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /api/password/reset - Reset password with token
 */
router.post("/reset", async (req, res) => {
  try {
    const { token, password } = resetPasswordSchema.parse(req.body);

    // Hash the provided token to match database
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find user with valid reset token
    const user = await prisma.users.findFirst({
      where: {
        passwordResetToken: hashedToken,
        passwordResetExpires: {
          gt: new Date() // Token not expired
        }
      }
    });

    if (!user) {
      return res.status(400).json({ 
        error: "Invalid or expired reset token" 
      });
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(password, 12);

    // Update password and clear reset token
    await prisma.users.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordResetToken: null,
        passwordResetExpires: null,
        updatedAt: new Date()
      }
    });

    logger?.info(`Password reset successful for user: ${user.email}`);

    // Send confirmation email
    try {
      await emailService.send({
        to: user.email,
        template: "notification",
        data: {
          subject: "Password Changed Successfully",
          message: "Your password has been changed successfully. If you did not make this change, please contact support immediately.",
          dashboardUrl: `${process.env.FRONTEND_URL}/login`
        }
      });
    } catch (emailError) {
      logger?.error("Failed to send password change confirmation:", emailError);
    }

    res.json({ 
      message: "Password reset successful. You can now login with your new password." 
    });

  } catch (error) {
    logger?.error("Reset password error:", error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Validation failed",
        details: error.errors.map(e => ({
          field: e.path.join("."),
          message: e.message
        }))
      });
    }

    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/password/verify-token/:token - Verify reset token validity
 */
router.get("/verify-token/:token", async (req, res) => {
  try {
    const { token } = req.params;
    
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await prisma.users.findFirst({
      where: {
        passwordResetToken: hashedToken,
        passwordResetExpires: {
          gt: new Date()
        }
      },
      select: {
        id: true,
        email: true
      }
    });

    if (!user) {
      return res.status(400).json({ 
        valid: false,
        error: "Invalid or expired reset token" 
      });
    }

    res.json({ 
      valid: true,
      email: user.email 
    });

  } catch (error) {
    logger?.error("Verify token error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
