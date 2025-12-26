// MINIMAL REDIS-FREE BACKEND - FORCE HARD RESET
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

import cors from "cors";
import express from "express";
import http from "http";
import jwt from "jsonwebtoken";
import { Server as SocketIOServer } from "socket.io";
import prisma from "./prismaClient";
import { AgentScheduler } from './agents/scheduler';
import { logger } from "./utils/logger";

// Create Express app
const app = express();

// Create HTTP server
const server = http.createServer(app);

// Trust proxy (needed when behind Cloudflare/NGINX for correct IPs and HTTPS)
app.set("trust proxy", 1);

// Configure CORS with allowed origins
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001", process.env.FRONTEND_URL || "http://localhost:3000"],
    credentials: true,
  })
);

// JSON parser and common middlewares
app.use(express.json());

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// robots.txt - SEO & crawler control
app.get("/robots.txt", (req, res) => {
  const robotsTxt = `# Advancia Pay Ledger - Backend API
# https://advanciapay.com

User-agent: *

# Disallow all API endpoints from crawlers
Disallow: /api/

# Allow health check for monitoring
Allow: /api/health

# Sitemap (served by frontend)
# Sitemap: https://advanciapay.com/sitemap.xml
`;
  res.type("text/plain").send(robotsTxt);
});

// Basic auth route for testing
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    // For testing - accept any credentials
    const token = jwt.sign({ userId: "test-user", email }, process.env.JWT_SECRET || "fallback-secret", {
      expiresIn: "24h",
    });

    res.json({
      message: "Login successful",
      token,
      user: { id: "test-user", email, role: "USER" },
    });
  } catch (error) {
    logger.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Import enhanced crypto and AI routes
import adminRouter, { setAdminSocketIO } from "./routes/admin";
import adminLedgerRouter, { setAdminLedgerSocketIO } from "./routes/admin-ledger";
import aiCommandRouter from "./routes/ai-commands";
import aiStatusRouter from './routes/ai-status';
import aiDiagramsRouter from './routes/ai-diagrams';

import cohereRouter from './routes/cohere';

import webhookNotificationService from './services/webhookNotificationService';
import cryptoAdminRouter, { setCryptoAdminSocketIO } from "./routes/crypto-admin";
import cryptoRouter, { setCryptoSocketIO } from "./routes/crypto";

// Static file serving disabled for API-only backend
// Frontend is served separately on port 3000

import medbedBookingRouter from './routes/medbedBooking';
import userRouter from './routes/user';
import withdrawalApprovalRouter from './routes/withdrawalApproval';
import dashboardRouter from './routes/dashboard';
// Mount enhanced routes BEFORE catch-all
app.use('/api/dashboard', dashboardRouter);
app.use('/api/user', userRouter);
app.use('/api/medbeds', medbedBookingRouter);
app.use('/api/withdrawals', withdrawalApprovalRouter);

app.use("/api/crypto", cryptoRouter);
app.use("/api/crypto/admin", cryptoAdminRouter);
app.use("/api/admin", adminRouter);
app.use("/api/admin/ledger", adminLedgerRouter);
app.use("/api/ai", aiCommandRouter);
app.use('/api/ai-status', aiStatusRouter);
app.use('/api/ai-diagrams', aiDiagramsRouter);

app.use('/api/cohere', cohereRouter);


// Catch-all route for undefined API endpoints
app.get("*", (req, res) => {
  if (req.path.startsWith("/api/")) {
    res.status(404).json({ error: "API endpoint not found" });
  } else {
    res.status(404).json({
      error: "This is an API server. Frontend is available at http://localhost:3000",
    });
  }
});

const io = new SocketIOServer(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:3001", process.env.FRONTEND_URL || "http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Socket.IO connection handling
io.use(async (socket, next) => {
  try {
    const token = (socket.handshake.auth?.token as string) || (socket.handshake.query?.token as string);
    if (!token) {
      return next(new Error("Auth token required"));
    }
    const cleaned = token.startsWith("Bearer ") ? token.split(" ")[1] : token;
    const payload = jwt.verify(cleaned, process.env.JWT_SECRET || "fallback-secret") as {
      userId: string;
      email?: string;
    };
    (socket as any).data = { userId: payload.userId, email: payload.email };
    next();
  } catch (e) {
    next(new Error("Invalid token"));
  }
});

// Initialize Socket.IO for notification service
webhookNotificationService.setSocketIO(io);
logger.info('✅ Socket.IO notification service initialized');

io.on("connection", (socket) => {
  const { userId, email } = (socket as any).data || {};
  // Join user-specific room for targeted notifications
  socket.join(`user-${userId}`);
  logger.info(`Socket connected: ${userId} (${email}) - Joined room: user-${userId}`);

  socket.on("disconnect", () => {
    logger.info(`Socket disconnected: ${userId}`);
  });
});

// Start server with error handling
const PORT = Number(process.env.PORT) || 5000;

async function startServer() {
  try {
    // Test database connection
    await prisma.$connect();
    logger.info("✅ PostgreSQL database connection successful");

    // Start HTTP server
    server.listen(PORT, "0.0.0.0", () => {
      logger.info(`🚀 Redis-free server is running on port ${PORT}`);
      logger.info(`   Environment: ${process.env.NODE_ENV || "development"}`);
      logger.info(`   Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:3000"}`);
      logger.info(`   🛡️  Redis-free mode: ACTIVE`);
    });

    server.on("error", (error: NodeJS.ErrnoException) => {
      if (error.code === "EADDRINUSE") {
        logger.error(`❌ Port ${PORT} is already in use`);
        process.exit(1);
      } else {
        logger.error("❌ Server error:", error);
        process.exit(1);
      }
    });
  } catch (error) {
    logger.error("❌ Failed to start server:", error);
    logger.error("   Check DATABASE_URL and ensure database is accessible");
    process.exit(1);
  }
}

// Graceful shutdown
process.on("SIGTERM", async () => {
  logger.info("SIGTERM signal received: stopping server...");
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGINT", async () => {
  logger.info("SIGINT signal received: stopping server...");
  await prisma.$disconnect();
  process.exit(0);
});

// Start the Redis-free server
if (process.env.WORKER === "true") {
  logger.info("Starting in WORKER mode");
  // TODO: Start workers
  logger.warn("Worker startup not implemented");
} else {
  logger.info("Starting in API mode");
  startServer();
}

// Import enhanced crypto and AI routes
import adminAIControlRouter from "./routes/adminAIControl";

// Mount enhanced routes
app.use("/api/crypto", cryptoRouter);
app.use("/api/crypto/admin", cryptoAdminRouter);
app.use("/api/admin", adminRouter);
app.use("/api/admin/ledger", adminLedgerRouter);
app.use("/api/ai", aiCommandRouter);
app.use('/api/ai-status', aiStatusRouter);
app.use('/api/ai-diagrams', aiDiagramsRouter);

app.use('/api/cohere', cohereRouter);

app.use("/api/admin/ai-control", adminAIControlRouter);

// Set up Socket.IO for crypto admin
setCryptoSocketIO(io);
setCryptoAdminSocketIO(io);
setAdminSocketIO(io);
setAdminLedgerSocketIO(io);







