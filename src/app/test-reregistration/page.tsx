"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { authService } from "@/lib/auth";

export default function TestReregistrationPage() {
  const [testEmail, setTestEmail] = useState("test.reregistration@example.com");
  const [testPassword, setTestPassword] = useState("testpass123");
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const testReregistrationFlow = async () => {
    setIsLoading(true);
    clearResults();

    try {
      addResult("🧪 Starting re-registration flow test...");

      // Step 1: Try to sign up with the test email
      addResult(`📝 Step 1: Attempting initial signup with ${testEmail}`);
      try {
        const signupResult = await authService.signUp(testEmail, testPassword);
        if (signupResult.user) {
          addResult(`✅ Initial signup successful! User ID: ${signupResult.user.id}`);
          addResult(`📧 User created with email: ${signupResult.user.email}`);

          // Note: In a real scenario, this user would now be pending admin approval
          addResult(`⏳ User is now pending admin approval (this is expected)`);
          addResult(`🎯 Test Result: User can successfully register with this email`);

        } else {
          addResult(`❌ Signup failed - no user returned`);
        }
      } catch (signupError) {
        if (signupError instanceof Error && signupError.message.includes('already registered')) {
          addResult(`🔄 Email already in use - this confirms a user with this email exists`);
          addResult(`📝 This means either:`);
          addResult(`   • The user was NOT properly deleted from a previous test`);
          addResult(`   • OR the user already exists in the system`);
        } else {
          addResult(`❌ Signup error: ${signupError instanceof Error ? signupError.message : 'Unknown error'}`);
        }
      }

      addResult(`\n🏁 Test completed! Check the results above.`);

    } catch (error) {
      addResult(`💥 Critical error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testLoginFlow = async () => {
    setIsLoading(true);

    try {
      addResult("🔐 Testing login with test credentials...");

      const loginResult = await authService.signIn(testEmail, testPassword);
      if (loginResult.user) {
        addResult(`✅ Login successful! User ID: ${loginResult.user.id}`);
        addResult(`📧 Logged in as: ${loginResult.user.email}`);

        // Try to get user profile
        const profile = await authService.getUserProfile();
        if (profile) {
          addResult(`👤 Profile found: ${profile.approval_status} status`);
        } else {
          addResult(`❌ No profile found for user`);
        }

        // Logout
        await authService.signOut();
        addResult(`🚪 Logged out successfully`);
      } else {
        addResult(`❌ Login failed - no user returned`);
      }
    } catch (loginError) {
      addResult(`❌ Login error: ${loginError instanceof Error ? loginError.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">🔄 Re-registration Testing</h1>
            <p className="text-gray-400">Test that deleted users can successfully sign up again</p>
          </div>
          <div className="flex space-x-4">
            <Button
              onClick={() => window.location.href = '/'}
              className="bg-gray-600 hover:bg-gray-700 text-white"
            >
              Back to Home
            </Button>
            <Button
              onClick={() => window.location.href = '/test-access'}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              Access Control Tests
            </Button>
          </div>
        </div>

        {/* Test Configuration */}
        <Card className="bg-[#1E293B] border border-blue-500/30 rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-bold text-blue-400 mb-4">Test Configuration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Test Email
              </label>
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-[#2A3441] border border-blue-500/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter test email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Test Password
              </label>
              <input
                type="password"
                value={testPassword}
                onChange={(e) => setTestPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-[#2A3441] border border-blue-500/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter test password"
              />
            </div>
          </div>
        </Card>

        {/* Test Actions */}
        <Card className="bg-[#1E293B] border border-green-500/30 rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-bold text-green-400 mb-4">🧪 Test Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={testReregistrationFlow}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold"
            >
              {isLoading ? 'Testing...' : '🔄 Test Re-registration Flow'}
            </Button>
            <Button
              onClick={testLoginFlow}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold"
            >
              {isLoading ? 'Testing...' : '🔐 Test Login Flow'}
            </Button>
          </div>
          <div className="mt-4">
            <Button
              onClick={clearResults}
              className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg text-sm"
            >
              🗑️ Clear Results
            </Button>
          </div>
        </Card>

        {/* Test Results */}
        <Card className="bg-[#1E293B] border border-yellow-500/30 rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-bold text-yellow-400 mb-4">📊 Test Results</h2>

          {testResults.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 text-lg mb-2">No test results yet</div>
              <div className="text-gray-500 text-sm">Run a test to see results here</div>
            </div>
          ) : (
            <div className="bg-[#2A3441] rounded-lg p-4">
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {testResults.map((result, index) => (
                  <div key={index} className="text-gray-300 text-sm font-mono">
                    {result}
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* How Re-registration Works */}
        <Card className="bg-[#1E293B] border border-purple-500/30 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-purple-400 mb-4">📋 How Re-registration Works</h2>
          <div className="space-y-4">
            <div className="bg-[#2A3441] rounded-lg p-4">
              <h3 className="text-white font-medium mb-2">✅ When a User is Deleted:</h3>
              <ul className="text-green-400 text-sm space-y-1">
                <li>• User profile is completely removed from database</li>
                <li>• User authentication record is deleted from Supabase Auth</li>
                <li>• Deletion activity is logged for tracking purposes</li>
                <li>• Email address becomes available for re-registration</li>
              </ul>
            </div>

            <div className="bg-[#2A3441] rounded-lg p-4">
              <h3 className="text-white font-medium mb-2">🔄 When User Re-registers:</h3>
              <ul className="text-blue-400 text-sm space-y-1">
                <li>• System checks for previous deletion in activity logs</li>
                <li>• New authentication record created with fresh user ID</li>
                <li>• New user profile created with "pending" approval status</li>
                <li>• Re-registration activity is logged for admin tracking</li>
                <li>• Admin receives email notification with "returning user" flag</li>
                <li>• User starts fresh with no previous data or history</li>
              </ul>
            </div>

            <div className="bg-[#2A3441] rounded-lg p-4">
              <h3 className="text-white font-medium mb-2">🎯 Expected Test Results:</h3>
              <ul className="text-yellow-400 text-sm space-y-1">
                <li>• Signup should succeed if email was properly deleted</li>
                <li>• User gets new unique ID (different from deleted user)</li>
                <li>• User starts with "pending" approval status</li>
                <li>• Login should work after successful signup</li>
                <li>• Admin should receive notification about returning user</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
