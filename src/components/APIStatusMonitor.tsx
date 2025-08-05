"use client";

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';

interface APIStatus {
  name: string;
  endpoint: string;
  status: 'healthy' | 'degraded' | 'down';
  responseTime: number;
  lastChecked: Date;
  uptime: number;
  errors: number;
}

export function APIStatusMonitor() {
  const [apiStatuses, setApiStatuses] = useState<APIStatus[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    // Initialize API statuses
    const initialAPIs: APIStatus[] = [
      {
        name: 'Email Service',
        endpoint: 'resend.com/api',
        status: 'healthy',
        responseTime: 45,
        lastChecked: new Date(),
        uptime: 99.9,
        errors: 0
      },
      {
        name: 'Database',
        endpoint: 'supabase.co/api',
        status: 'healthy',
        responseTime: 23,
        lastChecked: new Date(),
        uptime: 99.8,
        errors: 1
      },
      {
        name: 'Authentication',
        endpoint: 'auth.gmillibot.com',
        status: 'healthy',
        responseTime: 67,
        lastChecked: new Date(),
        uptime: 99.7,
        errors: 2
      },
      {
        name: 'File Storage',
        endpoint: 'storage.googleapis.com',
        status: 'degraded',
        responseTime: 156,
        lastChecked: new Date(),
        uptime: 98.9,
        errors: 5
      },
      {
        name: 'Analytics',
        endpoint: 'analytics.google.com',
        status: 'healthy',
        responseTime: 89,
        lastChecked: new Date(),
        uptime: 99.5,
        errors: 0
      },
      {
        name: 'CDN',
        endpoint: 'cdn.gmillibot.com',
        status: 'healthy',
        responseTime: 12,
        lastChecked: new Date(),
        uptime: 99.9,
        errors: 0
      }
    ];

    setApiStatuses(initialAPIs);

    // Simulate real-time API monitoring
    const updateAPIStatuses = () => {
      setApiStatuses(prev => prev.map(api => {
        const variation = (Math.random() - 0.5) * 20; // ±10ms variation
        const newResponseTime = Math.max(10, api.responseTime + variation);

        // Simulate occasional status changes
        let newStatus = api.status;
        if (Math.random() < 0.05) { // 5% chance of status change
          const statuses: ('healthy' | 'degraded' | 'down')[] = ['healthy', 'degraded', 'down'];
          const weights = [0.8, 0.15, 0.05]; // 80% healthy, 15% degraded, 5% down
          const random = Math.random();
          if (random < weights[0]) newStatus = 'healthy';
          else if (random < weights[0] + weights[1]) newStatus = 'degraded';
          else newStatus = 'down';
        }

        // Update uptime based on status
        let uptimeChange = 0;
        if (newStatus === 'healthy') uptimeChange = Math.random() * 0.01;
        else if (newStatus === 'degraded') uptimeChange = -Math.random() * 0.02;
        else uptimeChange = -Math.random() * 0.1;

        const newUptime = Math.max(95, Math.min(100, api.uptime + uptimeChange));

        return {
          ...api,
          status: newStatus,
          responseTime: Math.round(newResponseTime),
          lastChecked: new Date(),
          uptime: Math.round(newUptime * 100) / 100,
          errors: newStatus === 'down' ? api.errors + 1 : api.errors
        };
      }));

      setLastUpdate(new Date());
    };

    // Update every 10 seconds
    const interval = setInterval(updateAPIStatuses, 10000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-400 bg-green-500/20';
      case 'degraded': return 'text-yellow-400 bg-yellow-500/20';
      case 'down': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return '✅';
      case 'degraded': return '⚠️';
      case 'down': return '❌';
      default: return '❓';
    }
  };

  const getResponseTimeColor = (responseTime: number) => {
    if (responseTime < 50) return 'text-green-400';
    if (responseTime < 100) return 'text-yellow-400';
    return 'text-red-400';
  };

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const overallHealth = apiStatuses.length > 0 ?
    apiStatuses.filter(api => api.status === 'healthy').length / apiStatuses.length * 100 : 100;

  return (
    <Card className="bg-[#1E293B] border border-cyan-500/30 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-cyan-400">🔗 API Status Monitor</h3>
        <div className="flex items-center space-x-3">
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            overallHealth >= 90 ? 'bg-green-500/20 text-green-400' :
            overallHealth >= 70 ? 'bg-yellow-500/20 text-yellow-400' :
            'bg-red-500/20 text-red-400'
          }`}>
            {Math.round(overallHealth)}% Healthy
          </div>
          <div className="text-gray-400 text-sm">
            {formatTime(lastUpdate)}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {apiStatuses.map((api, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 bg-[#2A3441] rounded-lg border border-gray-600/30"
          >
            <div className="flex items-center space-x-3">
              <span className="text-lg">{getStatusIcon(api.status)}</span>
              <div>
                <div className="text-white font-medium text-sm">{api.name}</div>
                <div className="text-gray-400 text-xs">{api.endpoint}</div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className={`text-sm font-medium ${getResponseTimeColor(api.responseTime)}`}>
                  {api.responseTime}ms
                </div>
                <div className="text-gray-500 text-xs">Response</div>
              </div>

              <div className="text-center">
                <div className="text-sm font-medium text-blue-400">
                  {api.uptime}%
                </div>
                <div className="text-gray-500 text-xs">Uptime</div>
              </div>

              <div className="text-center">
                <div className="text-sm font-medium text-purple-400">
                  {api.errors}
                </div>
                <div className="text-gray-500 text-xs">Errors</div>
              </div>

              <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(api.status)}`}>
                {api.status.toUpperCase()}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-600">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-green-400">
              {apiStatuses.filter(api => api.status === 'healthy').length}
            </div>
            <div className="text-gray-400 text-xs">Healthy</div>
          </div>
          <div>
            <div className="text-lg font-bold text-yellow-400">
              {apiStatuses.filter(api => api.status === 'degraded').length}
            </div>
            <div className="text-gray-400 text-xs">Degraded</div>
          </div>
          <div>
            <div className="text-lg font-bold text-red-400">
              {apiStatuses.filter(api => api.status === 'down').length}
            </div>
            <div className="text-gray-400 text-xs">Down</div>
          </div>
        </div>
      </div>

      <div className="mt-3 text-center">
        <div className="text-gray-400 text-xs">
          Auto-refresh every 10 seconds • Last check: {formatTime(lastUpdate)}
        </div>
      </div>
    </Card>
  );
}
