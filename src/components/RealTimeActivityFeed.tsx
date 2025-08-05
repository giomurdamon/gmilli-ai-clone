"use client";

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ActivityEvent {
  id: string;
  type: 'user_action' | 'system_event' | 'admin_action' | 'api_call';
  title: string;
  description: string;
  timestamp: Date;
  user?: string;
  metadata?: any;
  severity: 'low' | 'medium' | 'high';
}

export function RealTimeActivityFeed() {
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    if (!isLive) return;

    // Simulate real-time activity events
    const activityTypes = [
      {
        type: 'user_action' as const,
        titles: [
          'User Registration',
          'Login Attempt',
          'Profile Update',
          'Password Reset',
          'Email Verification',
          'Account Deletion'
        ],
        descriptions: [
          'New user signed up from mobile app',
          'Successful login from new device',
          'User updated profile information',
          'Password reset request initiated',
          'Email verification completed',
          'User account deactivated'
        ]
      },
      {
        type: 'system_event' as const,
        titles: [
          'Database Backup',
          'Cache Refresh',
          'Security Scan',
          'Performance Check',
          'Log Rotation',
          'Health Check'
        ],
        descriptions: [
          'Automated database backup completed',
          'Application cache refreshed successfully',
          'Security vulnerability scan finished',
          'System performance check passed',
          'Log files rotated and archived',
          'All system health checks passed'
        ]
      },
      {
        type: 'admin_action' as const,
        titles: [
          'User Approval',
          'Settings Update',
          'Configuration Change',
          'Manual Override',
          'Bulk Action',
          'System Maintenance'
        ],
        descriptions: [
          'Admin approved pending user account',
          'Platform settings updated by admin',
          'Email configuration modified',
          'Manual user status override applied',
          'Bulk user operation completed',
          'Scheduled maintenance window started'
        ]
      },
      {
        type: 'api_call' as const,
        titles: [
          'Email API',
          'Payment API',
          'Authentication API',
          'Database API',
          'Storage API',
          'Analytics API'
        ],
        descriptions: [
          'Email notification sent successfully',
          'Payment processing completed',
          'User authentication verified',
          'Database query executed',
          'File upload processed',
          'Analytics data collected'
        ]
      }
    ];

    const generateActivity = () => {
      const categoryIndex = Math.floor(Math.random() * activityTypes.length);
      const category = activityTypes[categoryIndex];
      const eventIndex = Math.floor(Math.random() * category.titles.length);

      const activity: ActivityEvent = {
        id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: category.type,
        title: category.titles[eventIndex],
        description: category.descriptions[eventIndex],
        timestamp: new Date(),
        user: category.type === 'user_action' ? `user${Math.floor(Math.random() * 1000)}@example.com` : undefined,
        metadata: {
          server: `srv-${Math.floor(Math.random() * 5) + 1}`,
          duration: `${Math.floor(Math.random() * 500 + 10)}ms`,
          status: Math.random() > 0.1 ? 'success' : 'warning'
        },
        severity: Math.random() > 0.8 ? 'high' : Math.random() > 0.5 ? 'medium' : 'low'
      };

      setActivities(prev => [activity, ...prev.slice(0, 49)]); // Keep last 50 activities
    };

    // Generate initial activity
    generateActivity();

    // Generate new activity every 2-8 seconds
    const generateRandomActivity = () => {
      if (!isLive) return;
      generateActivity();
      const nextDelay = Math.random() * 6000 + 2000; // 2-8 seconds
      setTimeout(generateRandomActivity, nextDelay);
    };

    setTimeout(generateRandomActivity, 2000);

    return () => {
      setIsLive(false);
    };
  }, [isLive]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_action': return '👤';
      case 'system_event': return '⚙️';
      case 'admin_action': return '👑';
      case 'api_call': return '🔗';
      default: return '📝';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'user_action': return 'border-blue-500/30 bg-blue-500/10';
      case 'system_event': return 'border-green-500/30 bg-green-500/10';
      case 'admin_action': return 'border-purple-500/30 bg-purple-500/10';
      case 'api_call': return 'border-orange-500/30 bg-orange-500/10';
      default: return 'border-gray-500/30 bg-gray-500/10';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatRelativeTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const seconds = Math.floor(diff / 1000);

    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  const clearActivities = () => {
    setActivities([]);
  };

  return (
    <Card className="bg-[#1E293B] border border-orange-500/30 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <h3 className="text-lg font-bold text-orange-400">⚡ Live Activity Feed</h3>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span className="text-orange-400 text-sm">{isLive ? 'Live' : 'Paused'}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            onClick={() => setIsLive(!isLive)}
            className={`px-3 py-1 text-xs ${isLive ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} text-white`}
          >
            {isLive ? 'Pause' : 'Resume'}
          </Button>
          {activities.length > 0 && (
            <Button
              onClick={clearActivities}
              className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 text-xs"
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      <div className="max-h-80 overflow-y-auto space-y-2">
        {activities.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <div className="text-4xl mb-2">⚡</div>
            <div>No recent activity</div>
            <div className="text-sm mt-1">Live monitoring active</div>
          </div>
        ) : (
          activities.map((activity) => (
            <div
              key={activity.id}
              className={`border rounded-lg p-3 ${getActivityColor(activity.type)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <span className="text-lg">{getActivityIcon(activity.type)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-white font-medium text-sm">{activity.title}</span>
                      <div className={`w-2 h-2 rounded-full ${getSeverityColor(activity.severity)}`}></div>
                    </div>
                    <div className="text-gray-300 text-xs mb-1">{activity.description}</div>
                    <div className="text-gray-500 text-xs">
                      {formatTime(activity.timestamp)} • {formatRelativeTime(activity.timestamp)}
                      {activity.user && ` • ${activity.user}`}
                    </div>
                    {activity.metadata && (
                      <div className="text-gray-500 text-xs mt-1 font-mono">
                        {activity.metadata.server} • {activity.metadata.duration} • {activity.metadata.status}
                      </div>
                    )}
                  </div>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-medium ${
                  activity.type === 'user_action' ? 'bg-blue-500 text-white' :
                  activity.type === 'system_event' ? 'bg-green-500 text-white' :
                  activity.type === 'admin_action' ? 'bg-purple-500 text-white' :
                  'bg-orange-500 text-white'
                }`}>
                  {activity.type.replace('_', ' ').toUpperCase()}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {activities.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-600 text-center">
          <div className="text-gray-400 text-sm">
            Showing {activities.length} recent activities • Updated in real-time
          </div>
        </div>
      )}
    </Card>
  );
}
