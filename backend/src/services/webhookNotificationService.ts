import { Server as SocketIOServer } from 'socket.io';
import prisma from '../prismaClient';
import { logger } from '../utils/logger';

let io: SocketIOServer | null = null;

export function setSocketIO(socketInstance: SocketIOServer) {
  io = socketInstance;
  logger.info('[WebhookNotification] Socket.IO instance set');
}

/**
 * Send real-time notification via Socket.IO
 */
export async function sendRealtimeNotification(
  userId: string,
  type: 'balance_update' | 'transaction' | 'payment_received' | 'withdrawal_complete' | 'system',
  data: any
) {
  try {
    if (!io) {
      logger.warn('[WebhookNotification] Socket.IO not initialized');
      return;
    }

    // Send to user-specific room
    io.to(`user-${userId}`).emit('notification', {
      type,
      data,
      timestamp: new Date().toISOString()
    });

    logger.info(`[WebhookNotification] Sent to user-${userId}`, { type, data });

  } catch (error) {
    logger.error('[WebhookNotification] Error sending real-time notification:', error);
  }
}

/**
 * Create notification in database and send via Socket.IO
 */
export async function createNotification(
  userId: string,
  title: string,
  message: string,
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' = 'INFO',
  metadata?: Record<string, any>
) {
  try {
    // Create notification in database
    const notification = await prisma.notifications.create({
      data: {
        id: require('uuid').v4(),
        userId,
        title,
        message,
        type,
        metadata: metadata ? JSON.stringify(metadata) : null,
        read: false
      }
    });

    // Send real-time update
    if (io) {
      io.to(`user-${userId}`).emit('new_notification', {
        ...notification,
        metadata: metadata
      });
    }

    logger.info(`[WebhookNotification] Created notification for user ${userId}`, { title });

    return notification;

  } catch (error) {
    logger.error('[WebhookNotification] Error creating notification:', error);
    throw error;
  }
}

/**
 * Send balance update notification
 */
export async function notifyBalanceUpdate(
  userId: string,
  newBalance: number,
  change: number,
  reason: string
) {
  try {
    await createNotification(
      userId,
      'Balance Updated',
      `Your balance has been updated by $${Math.abs(change).toFixed(2)}. Reason: ${reason}`,
      change > 0 ? 'SUCCESS' : 'INFO',
      { newBalance, change, reason }
    );

    // Send real-time balance update
    await sendRealtimeNotification(userId, 'balance_update', {
      newBalance,
      change,
      reason
    });

  } catch (error) {
    logger.error('[WebhookNotification] Error notifying balance update:', error);
  }
}

/**
 * Send transaction notification
 */
export async function notifyTransaction(
  userId: string,
  transactionId: string,
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'PAYMENT' | 'TRANSFER',
  amount: number,
  status: 'PENDING' | 'COMPLETED' | 'FAILED'
) {
  try {
    const title = `${type.charAt(0) + type.slice(1).toLowerCase()} ${status}`;
    const message = `Your ${type.toLowerCase()} of $${amount.toFixed(2)} is ${status.toLowerCase()}`;

    await createNotification(
      userId,
      title,
      message,
      status === 'COMPLETED' ? 'SUCCESS' : status === 'FAILED' ? 'ERROR' : 'INFO',
      { transactionId, type, amount, status }
    );

    // Send real-time transaction update
    await sendRealtimeNotification(userId, 'transaction', {
      transactionId,
      type,
      amount,
      status
    });

  } catch (error) {
    logger.error('[WebhookNotification] Error notifying transaction:', error);
  }
}

/**
 * Send payment received notification (Stripe/Alchemy/NOWPayments)
 */
export async function notifyPaymentReceived(
  userId: string,
  amount: number,
  provider: 'stripe' | 'alchemy' | 'nowpayments',
  transactionId: string
) {
  try {
    await createNotification(
      userId,
      'Payment Received',
      `We received your payment of $${amount.toFixed(2)} via ${provider}. Processing now.`,
      'SUCCESS',
      { amount, provider, transactionId }
    );

    await sendRealtimeNotification(userId, 'payment_received', {
      amount,
      provider,
      transactionId
    });

  } catch (error) {
    logger.error('[WebhookNotification] Error notifying payment:', error);
  }
}

export default {
  setSocketIO,
  sendRealtimeNotification,
  createNotification,
  notifyBalanceUpdate,
  notifyTransaction,
  notifyPaymentReceived
};
