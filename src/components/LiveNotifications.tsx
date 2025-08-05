"use client";

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { liveNotificationService, LiveNotification, SystemMetrics } from '@/lib/websocket';

// Live Notification Panel Component
export function LiveNotificationPanel() {
  const [notifications, setNotifications] = useState<LiveNotification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);

  useEffect(() => {
    // Listen for connection status
    const handleConnection = (data: any) => {
      setIsConnected(true);
      console.log('🔔 Connected to live notifications:', data);
    };

    // Listen for new notifications
    const handleNotification = (notification: LiveNotification) => {
      setNotifications(prev => [notification, ...prev.slice(0, 19)]); // Keep last 20

      // Show browser notification for high priority alerts
      if (notification.priority === 'high' || notification.priority === 'error') {
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(`Gmilli AI Admin Alert`, {
            body: notification.message,
            icon: '/favicon.ico',
            badge: '/favicon.ico'
          });
        }
      }
    };

    // Listen for system metrics
    const handleMetrics = (newMetrics: SystemMetrics) => {
      setMetrics(newMetrics);
    };

    // Set up event listeners
    liveNotificationService.on('connected', handleConnection);
    liveNotificationService.on('notification', handleNotification);
    liveNotificationService.on('metrics', handleMetrics);

    // Request notification permissions
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Cleanup
    return () => {
      liveNotificationService.off('connected', handleConnection);
      liveNotificationService.off('notification', handleNotification);
      liveNotificationService.off('metrics', handleMetrics);
    };
  }, []);

  const clearNotifications = () => {
    setNotifications([]);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'user_signup': return '👤';
      case 'system_health': return '🔧';
      case 'api_status': return '🔗';
      case 'security_alert': return '🔒';
      case 'performance': return '⚡';
      case 'user_approval': return '✅';
      case 'database_sync': return '🗄️';
      case 'backup_status': return '💾';
      case 'traffic_spike': return '📈';
      case 'email_sent': return '📧';
      case 'system_startup': return '🚀';
      default: return '🔔';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-500 bg-red-500/10';
      case 'error': return 'border-red-500 bg-red-500/10';
      case 'warning': return 'border-yellow-500 bg-yellow-500/10';
      case 'success': return 'border-green-500 bg-green-500/10';
      case 'info': return 'border-blue-500 bg-blue-500/10';
      default: return 'border-gray-500 bg-gray-500/10';
    }
  };

  const formatTime = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="space-y-4">
      {/* Connection Status */}
      <Card className="bg-[#1E293B] border border-blue-500/30 rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-white font-medium">
              {isConnected ? '🔔 Live Notifications Active' : '⚠️ Connection Lost'}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-gray-400 text-sm">
              {notifications.length} alerts
            </span>
            {notifications.length > 0 && (
              <Button
                onClick={clearNotifications}
                className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 text-xs"
              >
                Clear
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Live Notifications Feed */}
      <Card className="bg-[#1E293B] border border-purple-500/30 rounded-2xl p-4 max-h-96 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-purple-400">🔔 Live Admin Alerts</h3>
          <div className="flex items-center space-x-2">
            <div className="animate-pulse w-2 h-2 bg-purple-500 rounded-full"></div>
            <span className="text-purple-400 text-sm">Live</span>
          </div>
        </div>

        <div className="space-y-2">
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <div className="text-4xl mb-2">🔔</div>
              <div>Waiting for live notifications...</div>
              <div className="text-sm mt-1">System monitoring active</div>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`border rounded-lg p-3 ${getPriorityColor(notification.priority)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                    <div className="flex-1">
                      <div className="text-white font-medium text-sm">
                        {notification.message}
                      </div>
                      <div className="text-gray-400 text-xs mt-1">
                        {formatTime(notification.timestamp)} • {notification.type}
                      </div>
                      {notification.data && (
                        <div className="text-gray-500 text-xs mt-1">
                          {JSON.stringify(notification.data, null, 2).slice(0, 100)}...
                        </div>
                      )}
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    notification.priority === 'high' || notification.priority === 'error' ? 'bg-red-500 text-white' :
                    notification.priority === 'warning' ? 'bg-yellow-500 text-black' :
                    notification.priority === 'success' ? 'bg-green-500 text-white' :
                    'bg-blue-500 text-white'
                  }`}>
                    {notification.priority.toUpperCase()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* System Health Monitor */}
      {metrics && (
        <SystemHealthMonitor metrics={metrics} />
      )}
    </div>
  );
}

// System Health Monitoring Component
function SystemHealthMonitor({ metrics }: { metrics: SystemMetrics }) {
  const getHealthColor = (value: number, type: 'cpu' | 'memory' | 'error') => {
    if (type === 'error') {
      return value < 1 ? 'text-green-400' : value < 3 ? 'text-yellow-400' : 'text-red-400';
    }
    return value < 50 ? 'text-green-400' : value < 80 ? 'text-yellow-400' : 'text-red-400';
  };

  return (
    <Card className="bg-[#1E293B] border border-green-500/30 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-green-400">🔧 System Health</h3>
        <div className="text-green-400 text-sm">
          Updated: {formatTime(metrics.timestamp)}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className={`text-2xl font-bold ${getHealthColor(metrics.cpu, 'cpu')}`}>
            {metrics.cpu}%
          </div>
          <div className="text-gray-400 text-sm">CPU Usage</div>
        </div>

        <div className="text-center">
          <div className={`text-2xl font-bold ${getHealthColor(metrics.memory, 'memory')}`}>
            {metrics.memory}%
          </div>
          <div className="text-gray-400 text-sm">Memory</div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-blue-400">
            {metrics.activeUsers}
          </div>
          <div className="text-gray-400 text-sm">Active Users</div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-purple-400">
            {metrics.responseTime}ms
          </div>
          <div className="text-gray-400 text-sm">Response Time</div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-600">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Requests/min:</span>
            <span className="text-white">{metrics.requestsPerMinute}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Error Rate:</span>
            <span className={getHealthColor(metrics.errorRate * 100, 'error')}>
              {(metrics.errorRate * 100).toFixed(2)}%
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Uptime:</span>
            <span className="text-green-400">{metrics.uptime}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

// Live Alert Badge Component
export function LiveAlertBadge() {
  const [alertCount, setAlertCount] = useState(0);
  const [hasNewAlert, setHasNewAlert] = useState(false);

  useEffect(() => {
    const handleNotification = (notification: LiveNotification) => {
      if (notification.priority === 'high' || notification.priority === 'error') {
        setAlertCount(prev => prev + 1);
        setHasNewAlert(true);

        // Reset animation after 3 seconds
        setTimeout(() => setHasNewAlert(false), 3000);
      }
    };

    liveNotificationService.on('notification', handleNotification);

    return () => {
      liveNotificationService.off('notification', handleNotification);
    };
  }, []);

  if (alertCount === 0) return null;

  return (
    <div className={`relative inline-flex items-center justify-center w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full ${
      hasNewAlert ? 'animate-bounce' : ''
    }`}>
      {alertCount > 99 ? '99+' : alertCount}
      {hasNewAlert && (
        <div className="absolute -inset-1 bg-red-500 rounded-full animate-ping opacity-75"></div>
      )}
    </div>
  );
}

// Helper function to format time
function formatTime(timestamp: Date) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}
