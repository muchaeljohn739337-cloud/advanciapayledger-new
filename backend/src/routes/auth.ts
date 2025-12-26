import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { logger } from "../utils/logger";

const router = express.Router();
const prisma = new PrismaClient();

// Validation schemas
const registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  username: z.string().min(3, "Username must be at least 3 characters").max(30, "Username must be no more than 30 characters"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

// Register endpoint
router.post("/register", async (req, res) => {
  try {
    // Validate input
    const { email, password, username } = registerSchema.parse(req.body);

    // Check if user already exists
    const existingUser = await prisma.users.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { username }
        ]
      }
    });

    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        return res.status(409).json({ error: "Email already registered" });
      } else {
        return res.status(409).json({ error: "Username already taken" });
      }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.users.create({
      data: {
        id: crypto.randomUUID(),
        email: email.toLowerCase(),
        username,
        passwordHash,
        role: "USER",
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        active: true
      }
    });

    logger?.info(`New user registered: ${email}`);

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    logger?.error("Registration error:", error);

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

// Login endpoint
router.post("/login", async (req, res) => {
  try {
    // Validate input
    const { email, password } = loginSchema.parse(req.body);

    // Find user
    const user = await prisma.users.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Check if user is active
    if (!user.active) {
      return res.status(401).json({ error: "Account is inactive. Please contact support." });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Update last login
    await prisma.users.update({
      where: { id: user.id },
      data: { lastLogin: new Date(), updatedAt: new Date() }
    });

    // Generate JWT
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error("JWT_SECRET not configured");
    }

    const token = jwt.sign(
      { 
        userId: user.id,
        id: user.id,
        email: user.email,
        role: user.role,
        active: user.active
      },
      jwtSecret,
      { expiresIn: "1d" }
    );

    logger?.info(`User logged in: ${email}`);

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    logger?.error("Login error:", error);

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

export default router;
