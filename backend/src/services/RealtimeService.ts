import { PrismaClient } from "@prisma/client";
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";
import { Server as SocketIOServer } from "socket.io";
import logger from "../logger"; // Assuming logger is defined in this file

const prisma = new PrismaClient();

export class RealtimeService {
  private static instance: RealtimeService;
  private io: SocketIOServer | null = null;
  private userSockets: Map<string, Set<string>> = new Map(); // userId -> Set<socketId>
  private redisClient: any;

  private constructor() {}

  static getInstance(): RealtimeService {
    if (!RealtimeService.instance) {
      RealtimeService.instance = new RealtimeService();
    }
    return RealtimeService.instance;
  }

  async initialize(server: any) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
      },
    });

    // Redis adapter for scaling across multiple servers
    if (process.env.REDIS_URL) {
      try {
        this.redisClient = createClient({ url: process.env.REDIS_URL });
        this.redisClient.on("error", (err) => {
          logger.warn("Redis error in RealtimeService:", err);
        });
        await this.redisClient.connect();
        const pubClient = this.redisClient;
        const subClient = pubClient.duplicate();
        this.io.adapter(createAdapter(pubClient, subClient));
      } catch (err) {
        logger.warn("Failed to connect to Redis in RealtimeService, continuing without Redis", err);
        this.redisClient = null;
      }
    }

    this.setupSocketHandlers();
    console.log(" RealtimeService initialized");
  }

  private setupSocketHandlers() {
    if (!this.io) return;

    this.io.on("connection", (socket) => {
      console.log(`Socket connected: ${socket.id}`);

      // User authentication and registration
      socket.on("authenticate", async (token: string) => {
        try {
          const userId = await this.verifyToken(token);
          if (userId) {
            // Register user socket
            this.registerUserSocket(userId, socket.id);
            socket.join(`user:${userId}`);

            console.log(`User ${userId} authenticated with socket ${socket.id}`);

            // Send any pending notifications
            await this.sendPendingNotifications(userId);
          }
        } catch (error) {
          console.error("Authentication error:", error);
          socket.emit("auth_error", "Invalid token");
        }
      });

      // Join payment-specific rooms
      socket.on("join_payment_room", (transactionId: string) => {
        socket.join(`payment:${transactionId}`);
        console.log(`Socket ${socket.id} joined payment room: ${transactionId}`);
      });

      // Handle disconnection
      socket.on("disconnect", () => {
        this.unregisterUserSocket(socket.id);
        console.log(`Socket disconnected: ${socket.id}`);
      });
    });
  }

  private async verifyToken(token: string): Promise<string | null> {
    try {
      // Verify JWT token and return userId
      // This should use your existing JWT verification logic
      const jwt = require("jsonwebtoken");
      const decoded = jwt.verify(token, process.env.JWT_SECRET!);
      return decoded.userId;
    } catch (error) {
      return null;
    }
  }

  private registerUserSocket(userId: string, socketId: string) {
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId)!.add(socketId);
  }

  private unregisterUserSocket(socketId: string) {
    for (const [userId, sockets] of this.userSockets.entries()) {
      if (sockets.has(socketId)) {
        sockets.delete(socketId);
        if (sockets.size === 0) {
          this.userSockets.delete(userId);
        }
        break;
      }
    }
  }

  private async sendPendingNotifications(userId: string) {
    try {
      // Get pending notifications from database
      const notifications = await prisma.notifications.findMany({
        where: {
          userId,
          isRead: false,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
      });

      if (notifications.length > 0) {
        this.broadcastToUser(userId, "pending_notifications", notifications);
      }
    } catch (error) {
      console.error("Error sending pending notifications:", error);
    }
  }

  // ============================================
  // PUBLIC METHODS FOR BROADCASTING
  // ============================================

  broadcastToUser(userId: string, event: string, data: any) {
    if (this.io) {
      this.io.to(`user:${userId}`).emit(event, {
        ...data,
        timestamp: new Date().toISOString(),
      });
      console.log(`Broadcasting ${event} to user ${userId}:`, data);
    }
  }

  broadcastToPaymentRoom(transactionId: string, event: string, data: any) {
    if (this.io) {
      this.io.to(`payment:${transactionId}`).emit(event, {
        ...data,
        transactionId,
        timestamp: new Date().toISOString(),
      });
      console.log(`Broadcasting ${event} to payment room ${transactionId}:`, data);
    }
  }

  broadcastUpdate(event: string, data: any) {
    if (this.io) {
      this.io.emit(event, {
        ...data,
        timestamp: new Date().toISOString(),
      });
      console.log(`Broadcasting ${event} globally:`, data);
    }
  }

  // ============================================
  // PAYMENT-SPECIFIC BROADCASTS
  // ============================================

  async notifyPaymentUpdate(userId: string, transactionId: string, update: any) {
    // Update database first
    await prisma.notifications.create({
      data: {
        id: require("uuid").v4(),
        userId,
        type: "payment_update",
        priority: "high",
        category: "financial",
        title: "Payment Update",
        message: `Payment ${update.status}: $${update.amount}`,
        data: JSON.stringify(update),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Real-time notification
    this.broadcastToUser(userId, "payment_notification", {
      type: "payment_update",
      transactionId,
      ...update,
    });

    // Also broadcast to payment room for live tracking
    this.broadcastToPaymentRoom(transactionId, "status_update", update);
  }

  async notifyAccountCreated(userId: string, accountData: any) {
    // Store welcome notification
    await prisma.notifications.create({
      data: {
        id: require("uuid").v4(),
        userId,
        type: "account_created",
        priority: "high",
        category: "account",
        title: "Welcome to Advancia!",
        message: "Your account has been created successfully.",
        data: JSON.stringify(accountData),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Real-time welcome
    this.broadcastToUser(userId, "welcome_notification", {
      type: "account_created",
      message: "Welcome! Your account is ready.",
      ...accountData,
    });
  }

  async notifySubscriptionChange(userId: string, subscriptionData: any) {
    await prisma.notifications.create({
      data: {
        id: require("uuid").v4(),
        userId,
        type: "subscription_change",
        priority: "medium",
        category: "subscription",
        title: "Subscription Updated",
        message: `Your ${subscriptionData.planName} subscription has been ${subscriptionData.status}.`,
        data: JSON.stringify(subscriptionData),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    this.broadcastToUser(userId, "subscription_notification", {
      type: "subscription_change",
      ...subscriptionData,
    });
  }

  // ============================================
  // CRYPTO PAYMENT LIVE TRACKING
  // ============================================

  async startCryptoPaymentTracking(transactionId: string, userId: string) {
    // Create a dedicated room for this crypto transaction
    this.broadcastToUser(userId, "crypto_payment_started", {
      transactionId,
      message: "Monitoring blockchain for your payment...",
      room: `payment:${transactionId}`,
    });
  }

  async updateCryptoConfirmations(transactionId: string, confirmations: number, required: number = 3) {
    const progress = Math.min((confirmations / required) * 100, 100);

    this.broadcastToPaymentRoom(transactionId, "crypto_confirmations", {
      confirmations,
      required,
      progress,
      status: confirmations >= required ? "confirmed" : "pending",
    });
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  getConnectedUsers(): number {
    return this.userSockets.size;
  }

  getUserSocketCount(userId: string): number {
    return this.userSockets.get(userId)?.size || 0;
  }

  isUserOnline(userId: string): boolean {
    return this.userSockets.has(userId) && this.userSockets.get(userId)!.size > 0;
  }
}
