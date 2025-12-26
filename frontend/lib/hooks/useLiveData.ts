import { useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface LiveDataOptions {
  autoConnect?: boolean;
  url?: string;
}

interface PaymentUpdate {
  transactionId: string;
  status: string;
  amount?: number;
  currency?: string;
  confirmations?: number;
  txHash?: string;
}

interface NotificationData {
  type: string;
  message: string;
  timestamp: string;
  [key: string]: any;
}

export const useLiveData = (userId?: string, options: LiveDataOptions = {}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [paymentUpdates, setPaymentUpdates] = useState<PaymentUpdate[]>([]);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [cryptoConfirmations, setCryptoConfirmations] = useState<{ [key: string]: number }>({});

  const { 
    autoConnect = true, 
    url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000' 
  } = options;

  // Initialize socket connection
  const connect = useCallback(() => {
    if (socket?.connected) return;

    const newSocket = io(url, {
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('🔄 Socket connected');
      setConnected(true);
      
      // Authenticate with JWT token
      const token = localStorage.getItem('authToken');
      if (token && userId) {
        newSocket.emit('authenticate', token);
      }
    });

    newSocket.on('disconnect', () => {
      console.log('🔄 Socket disconnected');
      setConnected(false);
    });

    // Payment update events
    newSocket.on('payment_confirmed', (data: PaymentUpdate) => {
      console.log('💰 Payment confirmed:', data);
      setPaymentUpdates(prev => [data, ...prev.slice(0, 19)]); // Keep latest 20
      
      // Show success notification
      setNotifications(prev => [{
        type: 'success',
        message: `Payment of $${data.amount} confirmed!`,
        timestamp: new Date().toISOString(),
        ...data
      }, ...prev.slice(0, 9)]);
    });

    newSocket.on('payment_failed', (data: PaymentUpdate) => {
      console.log('❌ Payment failed:', data);
      setPaymentUpdates(prev => [data, ...prev.slice(0, 19)]);
      
      setNotifications(prev => [{
        type: 'error',
        message: 'Payment failed. Please try again.',
        timestamp: new Date().toISOString(),
        ...data
      }, ...prev.slice(0, 9)]);
    });

    newSocket.on('crypto_payment_update', (data: PaymentUpdate) => {
      console.log('🔗 Crypto payment update:', data);
      setPaymentUpdates(prev => [data, ...prev.slice(0, 19)]);
      
      if (data.confirmations !== undefined) {
        setCryptoConfirmations(prev => ({
          ...prev,
          [data.transactionId]: data.confirmations!
        }));
      }
    });

    newSocket.on('crypto_confirmations', (data: any) => {
      console.log('✅ Crypto confirmations:', data);
      setCryptoConfirmations(prev => ({
        ...prev,
        [data.transactionId]: data.confirmations
      }));
      
      if (data.status === 'confirmed') {
        setNotifications(prev => [{
          type: 'success',
          message: `Crypto payment confirmed! (${data.confirmations}/${data.required} confirmations)`,
          timestamp: new Date().toISOString(),
          ...data
        }, ...prev.slice(0, 9)]);
      }
    });

    // Account creation events
    newSocket.on('welcome_notification', (data: NotificationData) => {
      console.log('🎉 Welcome notification:', data);
      setNotifications(prev => [data, ...prev.slice(0, 9)]);
    });

    // General notifications
    newSocket.on('payment_notification', (data: NotificationData) => {
      setNotifications(prev => [data, ...prev.slice(0, 9)]);
    });

    newSocket.on('subscription_notification', (data: NotificationData) => {
      setNotifications(prev => [data, ...prev.slice(0, 9)]);
    });

    // Authentication errors
    newSocket.on('auth_error', (error: string) => {
      console.error('🔐 Auth error:', error);
      // Could redirect to login or refresh token
    });

    setSocket(newSocket);
  }, [userId, url, socket]);

  // Disconnect socket
  const disconnect = useCallback(() => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setConnected(false);
    }
  }, [socket]);

  // Join a specific payment room for live tracking
  const joinPaymentRoom = useCallback((transactionId: string) => {
    if (socket && connected) {
      socket.emit('join_payment_room', transactionId);
      console.log(`🏠 Joined payment room: ${transactionId}`);
    }
  }, [socket, connected]);

  // Clear notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Remove specific notification
  const removeNotification = useCallback((index: number) => {
    setNotifications(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Initialize connection
  useEffect(() => {
    if (autoConnect && userId) {
      connect();
    }

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [autoConnect, userId, connect]);

  return {
    // Connection state
    connected,
    connect,
    disconnect,
    
    // Data
    paymentUpdates,
    notifications,
    cryptoConfirmations,
    
    // Actions
    joinPaymentRoom,
    clearNotifications,
    removeNotification,
    
    // Utils
    socket
  };
};

// Specific hook for payment status tracking
export const usePaymentTracking = (transactionId: string, userId?: string) => {
  const { 
    connected, 
    paymentUpdates, 
    cryptoConfirmations, 
    joinPaymentRoom,
    ...liveData 
  } = useLiveData(userId);

  // Find updates for this specific transaction
  const transactionUpdates = paymentUpdates.filter(
    update => update.transactionId === transactionId
  );

  const confirmations = cryptoConfirmations[transactionId] || 0;

  // Auto-join payment room when connected
  useEffect(() => {
    if (connected && transactionId) {
      joinPaymentRoom(transactionId);
    }
  }, [connected, transactionId, joinPaymentRoom]);

  return {
    ...liveData,
    connected,
    transactionUpdates,
    confirmations,
    latestUpdate: transactionUpdates[0] || null
  };
};

// Hook for global payment notifications
export const usePaymentNotifications = (userId?: string) => {
  const { notifications, clearNotifications, removeNotification } = useLiveData(userId);
  
  const paymentNotifications = notifications.filter(
    n => n.type === 'payment_update' || n.type === 'success' || n.type === 'error'
  );
  
  const unreadCount = paymentNotifications.length;
  
  return {
    notifications: paymentNotifications,
    unreadCount,
    clearNotifications,
    removeNotification
  };
};
