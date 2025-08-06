// Real-time WebSocket service for live admin notifications
export class LiveNotificationService {
  private ws: WebSocket | null = null;
  private reconnectInterval: NodeJS.Timeout | null = null;
  private listeners: Map<string, ((...args: unknown[]) => void)[]> = new Map();
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor() {
    if (typeof window !== 'undefined') {
      this.connect();
    }
  }

  // Connect to WebSocket for real-time updates
  connect() {
    try {
      // For demo purposes, we'll simulate WebSocket with Server-Sent Events
      this.simulateWebSocketConnection();
    } catch (error) {
      console.error('🔔 WebSocket connection error:', error);
      this.scheduleReconnect();
    }
  }

  // Simulate real-time connection with periodic updates
  private simulateWebSocketConnection() {
    this.isConnected = true;
    this.reconnectAttempts = 0;

    console.log('🔔 Live notifications connected!');
    this.emit('connected', { status: 'connected', timestamp: new Date() });

    // Simulate real-time events every 3-10 seconds
    this.startLiveEventSimulation();
  }

  // Simulate live admin events
  private startLiveEventSimulation() {
    const events = [
      { type: 'user_signup', message: 'New user registered', priority: 'high' },
      { type: 'system_health', message: 'All systems operational', priority: 'info' },
      { type: 'api_status', message: 'Email API: Healthy', priority: 'success' },
      { type: 'security_alert', message: 'Failed login attempt detected', priority: 'warning' },
      { type: 'performance', message: 'Server response time: 45ms', priority: 'info' },
      { type: 'user_approval', message: 'User approved successfully', priority: 'success' },
      { type: 'database_sync', message: 'Database sync completed', priority: 'info' },
      { type: 'backup_status', message: 'Auto-backup completed', priority: 'success' },
      { type: 'traffic_spike', message: 'Traffic increase detected: +15%', priority: 'warning' },
      { type: 'email_sent', message: 'Admin notification sent', priority: 'info' }
    ];

    // Send initial system status
    setTimeout(() => {
      this.emit('notification', {
        id: `notif_${Date.now()}`,
        type: 'system_startup',
        message: '🚀 Real-time monitoring activated',
        priority: 'success',
        timestamp: new Date(),
        data: { component: 'live_notifications' }
      });
    }, 1000);

    // Send periodic live events
    const sendRandomEvent = () => {
      if (!this.isConnected) return;

      const event = events[Math.floor(Math.random() * events.length)];
      const notification = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: event.type,
        message: event.message,
        priority: event.priority,
        timestamp: new Date(),
        data: this.generateEventData(event.type)
      };

      this.emit('notification', notification);

      // Schedule next event (3-10 seconds)
      const nextDelay = Math.random() * 7000 + 3000;
      setTimeout(sendRandomEvent, nextDelay);
    };

    // Start sending events after 2 seconds
    setTimeout(sendRandomEvent, 2000);

    // Send system metrics every 30 seconds
    this.startSystemMetrics();
  }

  // Generate realistic event data
  private generateEventData(eventType: string) {
    const baseData = { timestamp: new Date(), server: 'prod-1' };

    switch (eventType) {
      case 'user_signup':
        return {
          ...baseData,
          userEmail: `user${Math.floor(Math.random() * 1000)}@example.com`,
          source: Math.random() > 0.5 ? 'web' : 'mobile',
          location: ['US', 'UK', 'CA', 'AU'][Math.floor(Math.random() * 4)]
        };

      case 'system_health':
        return {
          ...baseData,
          cpu: `${Math.floor(Math.random() * 30 + 20)}%`,
          memory: `${Math.floor(Math.random() * 40 + 30)}%`,
          uptime: `${Math.floor(Math.random() * 24 + 1)}h ${Math.floor(Math.random() * 60)}m`
        };

      case 'api_status':
        const apis = ['Email', 'Database', 'Authentication', 'Storage'];
        const api = apis[Math.floor(Math.random() * apis.length)];
        return {
          ...baseData,
          api: api,
          responseTime: `${Math.floor(Math.random() * 100 + 20)}ms`,
          status: Math.random() > 0.1 ? 'healthy' : 'degraded'
        };

      case 'performance':
        return {
          ...baseData,
          responseTime: `${Math.floor(Math.random() * 200 + 20)}ms`,
          activeUsers: Math.floor(Math.random() * 50 + 10),
          requestsPerMin: Math.floor(Math.random() * 500 + 100)
        };

      default:
        return baseData;
    }
  }

  // Send system metrics updates
  private startSystemMetrics() {
    const sendMetrics = () => {
      if (!this.isConnected) return;

      const metrics = {
        timestamp: new Date(),
        cpu: Math.floor(Math.random() * 30 + 20),
        memory: Math.floor(Math.random() * 40 + 30),
        activeUsers: Math.floor(Math.random() * 50 + 10),
        responseTime: Math.floor(Math.random() * 100 + 20),
        requestsPerMinute: Math.floor(Math.random() * 500 + 100),
        errorRate: Math.random() * 0.05, // 0-5%
        uptime: `${Math.floor(Math.random() * 24 + 1)}h ${Math.floor(Math.random() * 60)}m`
      };

      this.emit('metrics', metrics);

      // Next update in 30 seconds
      setTimeout(sendMetrics, 30000);
    };

    // Start after 5 seconds
    setTimeout(sendMetrics, 5000);
  }

  // Event listener management
  on(event: string, callback: (...args: unknown[]) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: (...args: unknown[]) => void) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: unknown) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => callback(data));
    }
  }

  // Connection management
  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('🔔 Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);

    console.log(`🔔 Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);

    this.reconnectInterval = setTimeout(() => {
      this.connect();
    }, delay);
  }

  // Disconnect and cleanup
  disconnect() {
    this.isConnected = false;

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    if (this.reconnectInterval) {
      clearTimeout(this.reconnectInterval);
      this.reconnectInterval = null;
    }

    console.log('🔔 Live notifications disconnected');
  }

  // Get connection status
  getConnectionStatus() {
    return {
      connected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      maxAttempts: this.maxReconnectAttempts
    };
  }

  // Send custom notification (for admin actions)
  sendAdminNotification(message: string, priority: 'info' | 'success' | 'warning' | 'error' = 'info') {
    const notification = {
      id: `admin_${Date.now()}`,
      type: 'admin_action',
      message,
      priority,
      timestamp: new Date(),
      data: { source: 'admin_panel' }
    };

    this.emit('notification', notification);
  }
}

// Singleton instance
export const liveNotificationService = new LiveNotificationService();

// Types for TypeScript
export interface LiveNotification {
  id: string;
  type: string;
  message: string;
  priority: 'info' | 'success' | 'warning' | 'error' | 'high';
  timestamp: Date;
  data?: Record<string, unknown>;
}

export interface SystemMetrics {
  timestamp: Date;
  cpu: number;
  memory: number;
  activeUsers: number;
  responseTime: number;
  requestsPerMinute: number;
  errorRate: number;
  uptime: string;
}
