"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";

export default function NotificationsPage() {
  const [isTestLoading, setIsTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<string>('');
  const [emailConfig, setEmailConfig] = useState({
    configured: false,
    status: 'checking',
    adminEmail: 'giomurdamon@gmail.com'
  });
  const [emailSettings, setEmailSettings] = useState({
    newUserNotifications: true,
    approvalNotifications: true,
    dailySummary: true,
    adminEmail: 'giomurdamon@gmail.com'
  });

  useEffect(() => {
    // Check email configuration status on page load
    const checkEmailConfig = async () => {
      try {
        const response = await fetch('/api/email-config');
        const config = await response.json();
        setEmailConfig(config);
        setEmailSettings(prev => ({
          ...prev,
          adminEmail: config.adminEmail
        }));
      } catch (error) {
        console.error('Failed to check email config:', error);
        setEmailConfig({
          configured: false,
          status: 'error',
          adminEmail: 'giomurdamon@gmail.com'
        });
      }
    };

    checkEmailConfig();
  }, []);
  const router = useRouter();

  const testEmailNotification = async (type: string) => {
    setIsTestLoading(true);
    setTestResult('');

    try {
      const testData = {
        new_user_registration: {
          email: 'test@example.com',
          userId: 'test-user-123',
          registrationDate: new Date().toISOString(),
          userAgent: navigator.userAgent,
          ipAddress: '127.0.0.1'
        },
        user_approved: {
          email: 'test@example.com'
        },
        user_rejected: {
          email: 'test@example.com',
          reason: 'Test rejection for demo purposes'
        },
        daily_summary: {
          stats: {
            totalUsers: 15,
            pendingUsers: 3,
            approvedToday: 2,
            rejectedToday: 1,
            newSignupsToday: 4
          }
        }
      };

      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          data: testData[type as keyof typeof testData]
        })
      });

      const result = await response.json();

      if (result.success) {
        setTestResult(`✅ Test email sent successfully! Check your inbox: ${emailConfig.adminEmail}`);
      } else {
        setTestResult(`❌ Failed to send test email. Make sure RESEND_API_KEY is configured.`);
      }
    } catch (error) {
      console.error('Test email error:', error);
      setTestResult(`❌ Error sending test email: ${error}`);
    } finally {
      setIsTestLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">📧 Email Notifications</h1>
            <p className="text-gray-400">Configure and test admin email alerts</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => router.push('/admin')}
              className="bg-gray-600 hover:bg-gray-700 text-white"
            >
              ← Back to Admin
            </Button>
          </div>
        </div>

        {/* Email Configuration Status */}
        <Card className="bg-[#1E293B] border border-blue-500/30 rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">📋 Configuration Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-300">Email Service (Resend)</span>
                <span className="text-green-400 text-sm">✅ Installed</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${
                  emailConfig.configured ? 'bg-green-500' : 'bg-orange-500'
                }`}></div>
                <span className="text-gray-300">API Key Configuration</span>
                <span className={`text-sm ${
                  emailConfig.configured ? 'text-green-400' : 'text-orange-400'
                }`}>
                  {emailConfig.configured ? '✅ Configured' : '⚠️ Needs Setup'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-300">Admin Email</span>
                <span className="text-green-400 text-sm">✅ {emailConfig.adminEmail}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-300">Email Templates</span>
                <span className="text-green-400 text-sm">✅ Ready</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-300">API Endpoints</span>
                <span className="text-green-400 text-sm">✅ Active</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-300">Notification Integration</span>
                <span className="text-green-400 text-sm">✅ Integrated</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Setup Instructions - Only show if not configured */}
        {!emailConfig.configured && (
          <Card className="bg-orange-900/20 border border-orange-500/30 rounded-2xl p-6 mb-6">
            <h2 className="text-xl font-bold text-orange-400 mb-4">⚙️ Setup Required</h2>
          <div className="space-y-4">
            <p className="text-gray-300">
              To activate email notifications, you need to set up a Resend API key:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-gray-300 ml-4">
              <li>Visit <a href="https://resend.com" target="_blank" className="text-blue-400 hover:text-blue-300">resend.com</a> and create a free account</li>
              <li>Go to API Keys section and create a new API key</li>
              <li>Copy the API key (starts with "re_")</li>
              <li>Add it to your <code className="bg-gray-800 px-2 py-1 rounded">.env.local</code> file:</li>
            </ol>
            <div className="bg-gray-800 p-4 rounded-lg border">
              <code className="text-green-400">RESEND_API_KEY=re_your_api_key_here</code>
            </div>
            <p className="text-gray-400 text-sm">
              🔒 Free plan includes 3,000 emails/month - perfect for admin notifications!
            </p>
          </div>
        </Card>
        )}

        {/* Success Message - Show when configured */}
        {emailConfig.configured && (
          <Card className="bg-green-900/20 border border-green-500/30 rounded-2xl p-6 mb-6">
            <h2 className="text-xl font-bold text-green-400 mb-4">✅ Email Notifications Active</h2>
            <div className="space-y-2">
              <p className="text-gray-300">
                🎉 Great! Your email notification system is fully configured and ready to use.
              </p>
              <div className="flex items-center space-x-4 text-sm">
                <span className="text-gray-400">Admin Email:</span>
                <span className="text-green-400 font-mono">{emailConfig.adminEmail}</span>
                <span className="text-gray-400">Status:</span>
                <span className="text-green-400">✅ Active</span>
              </div>
              <p className="text-gray-400 text-sm mt-3">
                📧 You'll receive instant notifications for user registrations, approvals, and daily summaries.
              </p>
            </div>
          </Card>
        )}

        {/* Email Settings */}
        <Card className="bg-[#1E293B] border border-blue-500/30 rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">⚙️ Notification Settings</h2>
          <div className="space-y-4">
            {Object.entries({
              newUserNotifications: 'New User Registration Alerts',
              approvalNotifications: 'User Approval/Rejection Confirmations',
              dailySummary: 'Daily Platform Summary'
            }).map(([key, label]) => (
              <div key={key} className="flex items-center justify-between p-3 bg-[#2A3441] rounded-lg">
                <div>
                  <div className="text-white font-medium">{label}</div>
                  <div className="text-gray-400 text-sm">
                    {key === 'newUserNotifications' && 'Get notified immediately when users sign up'}
                    {key === 'approvalNotifications' && 'Confirmation emails when you approve/reject users'}
                    {key === 'dailySummary' && 'Daily stats and activity summary'}
                  </div>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={emailSettings[key as keyof typeof emailSettings] as boolean}
                    onChange={(e) => setEmailSettings(prev => ({
                      ...prev,
                      [key]: e.target.checked
                    }))}
                    className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-green-400">✅</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Test Email Section */}
        <Card className="bg-[#1E293B] border border-purple-500/30 rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-bold text-purple-400 mb-4">🧪 Test Email Notifications</h2>
          <p className="text-gray-300 mb-4">
            Test your email configuration by sending sample notifications:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Button
              onClick={() => testEmailNotification('new_user_registration')}
              disabled={isTestLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white p-3"
            >
              📧 Test New User Alert
            </Button>
            <Button
              onClick={() => testEmailNotification('user_approved')}
              disabled={isTestLoading}
              className="bg-green-600 hover:bg-green-700 text-white p-3"
            >
              ✅ Test Approval Alert
            </Button>
            <Button
              onClick={() => testEmailNotification('user_rejected')}
              disabled={isTestLoading}
              className="bg-red-600 hover:bg-red-700 text-white p-3"
            >
              ❌ Test Rejection Alert
            </Button>
            <Button
              onClick={() => testEmailNotification('daily_summary')}
              disabled={isTestLoading}
              className="bg-purple-600 hover:bg-purple-700 text-white p-3"
            >
              📊 Test Daily Summary
            </Button>
          </div>

          {testResult && (
            <div className={`p-4 rounded-lg border ${
              testResult.includes('✅')
                ? 'bg-green-900/20 border-green-500/30 text-green-400'
                : 'bg-red-900/20 border-red-500/30 text-red-400'
            }`}>
              {testResult}
            </div>
          )}
        </Card>

        {/* Email Templates Preview */}
        <Card className="bg-[#1E293B] border border-blue-500/30 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">📄 Email Templates</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-[#2A3441] rounded-lg">
              <div>
                <div className="text-white font-medium">🚨 New User Registration Alert</div>
                <div className="text-gray-400 text-sm">Professional HTML template with user details and quick actions</div>
              </div>
              <span className="text-blue-400">Ready</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-[#2A3441] rounded-lg">
              <div>
                <div className="text-white font-medium">✅ User Approval Confirmation</div>
                <div className="text-gray-400 text-sm">Clean confirmation email for approved users</div>
              </div>
              <span className="text-green-400">Ready</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-[#2A3441] rounded-lg">
              <div>
                <div className="text-white font-medium">❌ User Rejection Notification</div>
                <div className="text-gray-400 text-sm">Professional rejection notice with optional reason</div>
              </div>
              <span className="text-red-400">Ready</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-[#2A3441] rounded-lg">
              <div>
                <div className="text-white font-medium">📊 Daily Admin Summary</div>
                <div className="text-gray-400 text-sm">Complete platform statistics and activity report</div>
              </div>
              <span className="text-purple-400">Ready</span>
            </div>
          </div>
        </Card>

        {/* Footer Info */}
        <div className="mt-6 text-center text-gray-400 text-sm">
          <p>📧 Email notifications help you stay on top of user management and platform activity</p>
          <p>All notifications are sent to: <span className="text-blue-400">{emailConfig.adminEmail}</span></p>
        </div>
      </div>
    </div>
  );
}
