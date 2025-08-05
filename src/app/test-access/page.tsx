"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { authService } from "@/lib/auth";
import { AnalyzerPopup } from "@/components/AnalyzerPopup";

export default function TestAccessPage() {
  const [isAnalyzerOpen, setIsAnalyzerOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [accessResult, setAccessResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkCurrentUser();
  }, []);

  const checkCurrentUser = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);

      if (currentUser) {
        const profile = await authService.getUserProfile();
        setUserProfile(profile);
      }
    } catch (error) {
      console.error('Failed to check user:', error);
    }
  };

  const testAnalyzerAccess = async () => {
    setIsLoading(true);
    try {
      const access = await authService.canUserAccessAnalyzer();
      setAccessResult(access);
    } catch (error) {
      setAccessResult({
        canAccess: false,
        reason: 'Error checking access: ' + (error as Error).message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const simulateUserStates = [
    {
      name: "Unauthenticated User",
      description: "No user logged in",
      action: () => {
        setUser(null);
        setUserProfile(null);
        setAccessResult(null);
      }
    },
    {
      name: "Pending Approval",
      description: "User logged in but pending admin approval",
      action: () => {
        setUser({ id: 'test-user', email: 'test@example.com' });
        setUserProfile({
          id: 'test-user',
          email: 'test@example.com',
          approval_status: 'pending',
          status: 'active'
        });
        setAccessResult(null);
      }
    },
    {
      name: "Rejected User",
      description: "User account has been rejected",
      action: () => {
        setUser({ id: 'test-user', email: 'test@example.com' });
        setUserProfile({
          id: 'test-user',
          email: 'test@example.com',
          approval_status: 'rejected',
          status: 'active'
        });
        setAccessResult(null);
      }
    },
    {
      name: "Suspended User",
      description: "Approved user but currently suspended",
      action: () => {
        setUser({ id: 'test-user', email: 'test@example.com' });
        setUserProfile({
          id: 'test-user',
          email: 'test@example.com',
          approval_status: 'approved',
          status: 'suspended'
        });
        setAccessResult(null);
      }
    },
    {
      name: "Approved & Active",
      description: "User with full access",
      action: () => {
        setUser({ id: 'test-user', email: 'test@example.com' });
        setUserProfile({
          id: 'test-user',
          email: 'test@example.com',
          approval_status: 'approved',
          status: 'active'
        });
        setAccessResult(null);
      }
    }
  ];

  return (
    <div className="min-h-screen bg-[#0F172A] p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">🧪 Access Control Testing</h1>
            <p className="text-gray-400">Test analyzer access control for different user states</p>
          </div>
          <div className="flex space-x-4">
            <Button
              onClick={() => window.location.href = '/'}
              className="bg-gray-600 hover:bg-gray-700 text-white"
            >
              Back to Home
            </Button>
            <Button
              onClick={() => setIsAnalyzerOpen(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              Test Analyzer Access
            </Button>
          </div>
        </div>

        {/* Current User Status */}
        <Card className="bg-[#1E293B] border border-blue-500/30 rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-bold text-blue-400 mb-4">Current User Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-white font-medium mb-2">Authentication</h3>
              <div className="bg-[#2A3441] rounded-lg p-4">
                {user ? (
                  <div>
                    <div className="text-green-400 font-medium">✅ Logged In</div>
                    <div className="text-gray-300 text-sm">Email: {user.email}</div>
                    <div className="text-gray-300 text-sm">ID: {user.id}</div>
                  </div>
                ) : (
                  <div className="text-red-400 font-medium">❌ Not Logged In</div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-white font-medium mb-2">Profile Status</h3>
              <div className="bg-[#2A3441] rounded-lg p-4">
                {userProfile ? (
                  <div>
                    <div className="text-gray-300 text-sm">Approval: <span className={`font-medium ${
                      userProfile.approval_status === 'approved' ? 'text-green-400' :
                      userProfile.approval_status === 'pending' ? 'text-yellow-400' : 'text-red-400'
                    }`}>{userProfile.approval_status}</span></div>
                    <div className="text-gray-300 text-sm">Status: <span className={`font-medium ${
                      userProfile.status === 'active' ? 'text-green-400' :
                      userProfile.status === 'suspended' ? 'text-yellow-400' : 'text-red-400'
                    }`}>{userProfile.status}</span></div>
                  </div>
                ) : (
                  <div className="text-gray-400">No profile data</div>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* User State Simulators */}
        <Card className="bg-[#1E293B] border border-green-500/30 rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-bold text-green-400 mb-4">🎭 Simulate User States</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {simulateUserStates.map((state, index) => (
              <div key={index} className="bg-[#2A3441] rounded-lg p-4">
                <h3 className="text-white font-medium mb-2">{state.name}</h3>
                <p className="text-gray-400 text-sm mb-3">{state.description}</p>
                <Button
                  onClick={state.action}
                  className="w-full bg-green-600 hover:bg-green-700 text-white text-sm py-2"
                >
                  Simulate
                </Button>
              </div>
            ))}
          </div>
        </Card>

        {/* Access Control Test */}
        <Card className="bg-[#1E293B] border border-purple-500/30 rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-bold text-purple-400 mb-4">🔒 Access Control Test</h2>

          <div className="flex items-center space-x-4 mb-6">
            <Button
              onClick={testAnalyzerAccess}
              disabled={isLoading}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3"
            >
              {isLoading ? 'Testing Access...' : 'Test Analyzer Access'}
            </Button>
            <Button
              onClick={() => setIsAnalyzerOpen(true)}
              className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3"
            >
              Open Analyzer Popup
            </Button>
          </div>

          {accessResult && (
            <div className="bg-[#2A3441] rounded-lg p-4">
              <h3 className="text-white font-medium mb-3">Access Test Result:</h3>
              <div className={`p-3 rounded border ${
                accessResult.canAccess
                  ? 'bg-green-900/20 border-green-500/30 text-green-400'
                  : 'bg-red-900/20 border-red-500/30 text-red-400'
              }`}>
                <div className="font-medium mb-2">
                  {accessResult.canAccess ? '✅ ACCESS GRANTED' : '❌ ACCESS DENIED'}
                </div>
                {accessResult.reason && (
                  <div className="text-sm">{accessResult.reason}</div>
                )}
              </div>
            </div>
          )}
        </Card>

        {/* Expected Behaviors */}
        <Card className="bg-[#1E293B] border border-yellow-500/30 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-yellow-400 mb-4">📋 Expected Access Control Behaviors</h2>
          <div className="space-y-4">
            <div className="bg-[#2A3441] rounded-lg p-4">
              <h3 className="text-white font-medium mb-2">✅ Should GRANT Access:</h3>
              <ul className="text-green-400 text-sm space-y-1">
                <li>• User is logged in</li>
                <li>• approval_status = 'approved'</li>
                <li>• status = 'active'</li>
              </ul>
            </div>

            <div className="bg-[#2A3441] rounded-lg p-4">
              <h3 className="text-white font-medium mb-2">❌ Should DENY Access:</h3>
              <ul className="text-red-400 text-sm space-y-1">
                <li>• User not logged in → "Please login to access the analyzer"</li>
                <li>• approval_status = 'pending' → "Account pending admin approval..."</li>
                <li>• approval_status = 'rejected' → "Account access has been denied..."</li>
                <li>• status = 'suspended' → "Account is temporarily suspended..."</li>
                <li>• status = 'terminated' → "Account has been terminated..."</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>

      {/* Analyzer Popup for Testing */}
      <AnalyzerPopup
        isOpen={isAnalyzerOpen}
        onClose={() => setIsAnalyzerOpen(false)}
      />
    </div>
  );
}
