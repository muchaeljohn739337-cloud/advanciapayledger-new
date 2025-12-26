import { io, Socket } from 'socket.io-client';
import { authService } from './auth';

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private listeners: Map<string, Function[]> = new Map();

  connect(): Socket | null {
    if (this.socket?.connected) {
      return this.socket;
    }

    try {
      const token = authService.getToken();
      if (!token) {
        console.log('No auth token found, cannot connect to socket');
        return null;
      }

      // Connect to the backend server
      this.socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000', {
        auth: {
          token: token
        },
        transports: ['websocket', 'polling']
      });

      this.setupEventListeners();
      return this.socket;
    } catch (error) {
      console.error('Socket connection error:', error);
      return null;
    }
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ Socket connected');
      this.reconnectAttempts = 0;
      this.emit('socket:connected');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      this.emit('socket:disconnected', reason);
      
      if (reason === 'io server disconnect') {
        // Reconnect manually if server disconnected the client
        setTimeout(() => this.reconnect(), 1000);
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.emit('socket:error', error);
      
      if (error.message.includes('Authentication')) {
        console.log('Socket auth failed, logging out');
        authService.logout();
      } else if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        setTimeout(() => this.reconnect(), 2000 * this.reconnectAttempts);
      }
    });

    // Real-time notification events
    this.socket.on('balance_update', (data) => {
      console.log('💰 Balance updated:', data);
      this.emit('balance_update', data);
    });

    this.socket.on('new_notification', (data) => {
      console.log('🔔 New notification:', data);
      this.emit('new_notification', data);
    });

    this.socket.on('transaction_update', (data) => {
      console.log('💸 Transaction update:', data);
      this.emit('transaction_update', data);
    });

    this.socket.on('booking_update', (data) => {
      console.log('📅 Booking update:', data);
      this.emit('booking_update', data);
    });

    this.socket.on('withdrawal_update', (data) => {
      console.log('💳 Withdrawal update:', data);
      this.emit('withdrawal_update', data);
    });

    this.socket.on('admin_notification', (data) => {
      console.log('👑 Admin notification:', data);
      this.emit('admin_notification', data);
    });
  }

  private reconnect(): void {
    if (this.socket?.connected) return;
    
    console.log(`🔄 Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    this.connect();
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.listeners.clear();
    this.reconnectAttempts = 0;
  }

  // Event listener management
  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback?: Function): void {
    if (!this.listeners.has(event)) return;
    
    if (callback) {
      const callbacks = this.listeners.get(event)!;
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    } else {
      this.listeners.delete(event);
    }
  }

  private emit(event: string, data?: any): void {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach(callback => callback(data));
  }

  // Check if socket is connected
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Get socket instance for direct use
  getSocket(): Socket | null {
    return this.socket;
  }
}

// Singleton instance
export const socketService = new SocketService();

// React hook for using socket in components
export function useSocket() {
  return {
    connect: () => socketService.connect(),
    disconnect: () => socketService.disconnect(),
    on: (event: string, callback: Function) => socketService.on(event, callback),
    off: (event: string, callback?: Function) => socketService.off(event, callback),
    isConnected: () => socketService.isConnected(),
    socket: socketService.getSocket()
  };
}

export default socketService;
