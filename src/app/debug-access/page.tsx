"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { authService } from "@/lib/auth";

export default function DebugAccessPage() {
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [accessResult, setAccessResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [debugLog, setDebugLog] = useState<string[]>([]);
  const [missingProfile, setMissingProfile] = useState<{userId: string, email: string} | null>(null);
  const [rlsError, setRlsError] = useState<{userId: string, email: string} | null>(null);
  const [adminDiagnostics, setAdminDiagnostics] = useState<any>(null);
  const [isRunningAdminDiag, setIsRunningAdminDiag] = useState(false);
  const [isCreatingProfiles, setIsCreatingProfiles] = useState(false);

  const addLog = (message: string) => {
    setDebugLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const checkUserAccess = async () => {
    setIsLoading(true);
    setDebugLog([]);
    addLog("🔍 Starting access debug check...");

    try {
      // Step 1: Check current user
      addLog("📝 Step 1: Checking current user authentication...");
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);

      if (!currentUser) {
        addLog("❌ No user logged in - this is the problem!");
        addLog("🎯 Solution: User needs to log in first");
        setIsLoading(false);
        return;
      }

      addLog(`✅ User authenticated: ${currentUser.email} (ID: ${currentUser.id})`);

      // Step 2: Get user profile
      addLog("📝 Step 2: Fetching user profile from database...");
      let profile;
      try {
        profile = await authService.getUserProfile(currentUser.id);
        setUserProfile(profile);

        if (!profile) {
          addLog("❌ No user profile found in database!");
          addLog(`🔍 User ID: ${currentUser.id}`);
          addLog(`📧 Email: ${currentUser.email}`);
          addLog("🎯 Solution: Profile needs to be created manually");
          setMissingProfile({ userId: currentUser.id, email: currentUser.email || 'unknown' });
          setIsLoading(false);
          return;
        }

        addLog(`✅ Profile found: ${profile.email}`);
        addLog(`📊 Approval Status: ${profile.approval_status}`);
        addLog(`📊 Account Status: ${profile.status}`);
        addLog(`📊 Created At: ${profile.created_at}`);
        addLog(`📊 Approved At: ${profile.approved_at || 'Not set'}`);
      } catch (profileError) {
        const errorMessage = profileError instanceof Error ? profileError.message : 'Unknown error';
        addLog(`❌ Profile fetch error: ${errorMessage}`);
        addLog(`🔍 Error details: ${JSON.stringify(profileError)}`);
        addLog(`👤 User ID: ${currentUser.id}`);
        addLog(`📧 Email: ${currentUser.email}`);

        // Check if this is the RLS recursion error
        if (errorMessage.includes('infinite recursion') && errorMessage.includes('42P17')) {
          addLog("🚨 CRITICAL: Database RLS policy infinite recursion detected!");
          addLog("🎯 This is a database configuration issue that prevents ALL profile queries");
          addLog("🔧 Emergency fix available - click button below");
          setRlsError({ userId: currentUser.id, email: currentUser.email || 'unknown' });
        } else {
          addLog("🎯 Solution: Database connection issue or profile missing");
          setMissingProfile({ userId: currentUser.id, email: currentUser.email || 'unknown' });
        }

        setIsLoading(false);
        return;
      }

      // Step 3: Check approval status (only if profile exists)
      if (profile) {
        addLog("📝 Step 3: Checking approval status...");
        if (profile.approval_status === 'pending') {
          addLog("⏳ User is still PENDING approval - this is the problem!");
          addLog("🎯 Solution: Admin needs to approve this user in admin panel");
        } else if (profile.approval_status === 'rejected') {
          addLog("❌ User has been REJECTED - this is the problem!");
          addLog("🎯 Solution: Admin needs to re-approve this user");
        } else if (profile.approval_status === 'approved') {
          addLog("✅ User is APPROVED - approval status is correct");
        } else {
          addLog(`❌ Unknown approval status: ${profile.approval_status} - this is the problem!`);
          addLog("🎯 Solution: Admin needs to set approval status to 'approved'");
        }

        // Step 4: Check account status
        addLog("📝 Step 4: Checking account status...");
        if (profile.status === 'suspended') {
          addLog("⚠️ User account is SUSPENDED - this is the problem!");
          addLog("🎯 Solution: Admin needs to reactivate the account");
        } else if (profile.status === 'terminated') {
          addLog("❌ User account is TERMINATED - this is the problem!");
          addLog("🎯 Solution: Admin needs to reactivate the account");
        } else if (profile.status === 'active') {
          addLog("✅ User account is ACTIVE - account status is correct");
        } else {
          addLog(`❌ Unknown account status: ${profile.status} - this is the problem!`);
          addLog("🎯 Solution: Admin needs to set account status to 'active'");
        }
      }

      // Step 5: Test analyzer access
      addLog("📝 Step 5: Testing analyzer access with force refresh...");
      const access = await authService.canUserAccessAnalyzer(true); // Force refresh from database
      setAccessResult(access);

      if (access.canAccess) {
        addLog("🎉 SUCCESS! User CAN access analyzer");
        addLog("✅ All access requirements are met");
      } else {
        addLog(`❌ BLOCKED! User CANNOT access analyzer`);
        addLog(`🚫 Reason: ${access.reason}`);
        addLog("🔧 This is the exact error the user sees");
      }

      // Summary
      addLog("\n📋 SUMMARY:");
      if (profile && profile.approval_status === 'approved' && profile.status === 'active' && access.canAccess) {
        addLog("🎉 Everything is working correctly! User should have analyzer access.");
        addLog("💡 If user still can't access, they may need to:");
        addLog("   • Refresh the page (F5)");
        addLog("   • Clear browser cache");
        addLog("   • Logout and login again");
      } else {
        addLog("🔧 ISSUES FOUND - Admin action required:");
        if (profile && profile.approval_status !== 'approved') {
          addLog(`   • Fix approval_status: '${profile.approval_status}' → 'approved'`);
        }
        if (profile && profile.status !== 'active') {
          addLog(`   • Fix status: '${profile.status}' → 'active'`);
        }
        if (!profile) {
          addLog("   • Create missing user profile");
        }
      }

    } catch (error) {
      addLog(`💥 Error during debug: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshSession = async () => {
    addLog("🔄 Refreshing user session...");
    try {
      // Force refresh by getting fresh user data
      await checkUserAccess();
      addLog("✅ Session refreshed successfully");
    } catch (error) {
      addLog(`❌ Session refresh failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const clearLog = () => {
    setDebugLog([]);
  };

  const createMissingProfile = async () => {
    if (!missingProfile) return;

    addLog("🔧 Creating missing user profile...");
    try {
      const response = await fetch('/api/admin/create-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: missingProfile.userId,
          email: missingProfile.email
        })
      });

      const result = await response.json();

      if (response.ok) {
        addLog("✅ User profile created successfully!");
        addLog(`📊 Profile ID: ${result.profile.id}`);
        addLog(`📧 Email: ${result.profile.email}`);
        addLog(`📊 Status: ${result.profile.approval_status}`);
        setMissingProfile(null);

        // Re-run the access check
        addLog("🔄 Re-running access check...");
        setTimeout(() => {
          checkUserAccess();
        }, 1000);
      } else {
        addLog(`❌ Failed to create profile: ${result.error}`);
      }
    } catch (error) {
      addLog(`❌ Profile creation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const fixRlsError = async () => {
    if (!rlsError) return;

    addLog("🚨 Attempting emergency RLS fix...");
    try {
      const response = await fetch('/api/admin/fix-database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: rlsError.userId,
          email: rlsError.email
        })
      });

      const result = await response.json();

      if (response.ok) {
        addLog("✅ Emergency fix applied successfully!");
        addLog(`📊 Result: ${result.message}`);
        if (result.profile) {
          addLog(`📧 Email: ${result.profile.email}`);
          addLog(`📊 Status: ${result.profile.approval_status}`);
        }
        if (result.note) {
          addLog(`⚠️ Note: ${result.note}`);
        }
        setRlsError(null);

        // Re-run the access check
        addLog("🔄 Re-running access check...");
        setTimeout(() => {
          checkUserAccess();
        }, 1000);
      } else {
        addLog(`❌ Emergency fix failed: ${result.error}`);
        if (result.solution) {
          addLog(`🎯 Solution: ${result.solution}`);
        }
      }
    } catch (error) {
      addLog(`❌ Emergency fix error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const runAdminDiagnostics = async () => {
    setIsRunningAdminDiag(true);
    try {
      console.log('🔍 Running admin panel diagnostics...');

      // Test admin API directly
      const adminResponse = await fetch('/api/admin/users');
      const adminData = await adminResponse.json();

      // Get current user info
      const user = await authService.getCurrentUser();

      // Test database queries directly
      let dbTest = null;
      try {
        const dbResponse = await fetch('/api/debug-users');
        dbTest = await dbResponse.json();
      } catch (dbError) {
        dbTest = { error: 'Failed to query database', details: dbError instanceof Error ? dbError.message : 'Unknown error' };
      }

      setAdminDiagnostics({
        timestamp: new Date().toISOString(),
        currentUser: user ? {
          id: user.id,
          email: user.email,
          isAdmin: user.email === 'giomurdamon@gmail.com'
        } : null,
        adminApi: {
          status: adminResponse.status,
          success: adminData.success,
          data: adminData.data || null,
          error: adminData.error || null,
          totalUsers: adminData.data?.totalUsers || 0,
          pendingUsers: adminData.data?.pendingUsers?.length || 0,
          approvedUsers: adminData.data?.approvedUsers?.length || 0
        },
        databaseTest: dbTest,
        detectedIssues: []
      });

    } catch (error) {
      console.error('Admin diagnostics failed:', error);
      setAdminDiagnostics({
        error: 'Failed to run diagnostics',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsRunningAdminDiag(false);
    }
  };

  const createMissingProfiles = async () => {
    if (!adminDiagnostics?.data?.missingProfiles?.length) return;

    setIsCreatingProfiles(true);
    try {
      console.log('🔧 Creating missing profiles for', adminDiagnostics.data.missingProfiles.length, 'users...');

      // Create profiles for each missing user
      const results = [];
      for (const user of adminDiagnostics.data.missingProfiles) {
        try {
          const response = await fetch('/api/admin/create-profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user.id,
              email: user.email
            })
          });

          const result = await response.json();
          results.push({
            email: user.email,
            success: result.success,
            error: result.error
          });
        } catch (error) {
          results.push({
            email: user.email,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      console.log('✅ Profile creation results:', results);

      // Refresh diagnostics to see the results
      await runAdminDiagnostics();

      alert(`Profile creation completed!\n${results.filter(r => r.success).length} successful\n${results.filter(r => !r.success).length} failed`);

    } catch (error) {
      console.error('❌ Failed to create missing profiles:', error);
      alert('Failed to create missing profiles: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsCreatingProfiles(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">🔍 Access Debug Tool</h1>
            <p className="text-gray-400">Diagnose why approved users can't access analyzer</p>
          </div>
          <div className="flex space-x-4">
            <Button
              onClick={() => window.location.href = '/'}
              className="bg-gray-600 hover:bg-gray-700 text-white"
            >
              Back to Home
            </Button>
          </div>
        </div>

        {/* Debug Actions */}
        <Card className="bg-[#1E293B] border border-blue-500/30 rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-bold text-blue-400 mb-4">🔧 Debug Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={checkUserAccess}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold"
            >
              {isLoading ? 'Analyzing...' : '🔍 Run Full Diagnosis'}
            </Button>
            <Button
              onClick={refreshSession}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold"
            >
              🔄 Refresh Session
            </Button>
            <Button
              onClick={clearLog}
              className="bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold"
            >
              🗑️ Clear Log
            </Button>
          </div>

          {/* Create Missing Profile Button */}
          {missingProfile && (
            <div className="mt-4 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
              <h3 className="text-yellow-400 font-medium mb-2">⚠️ Missing User Profile Detected</h3>
              <p className="text-yellow-300 text-sm mb-3">
                User {missingProfile.email} has authentication but no database profile.
                This prevents analyzer access.
              </p>
              <Button
                onClick={createMissingProfile}
                disabled={isLoading}
                className="bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded-lg font-semibold"
              >
                🔧 Create Missing Profile
              </Button>
            </div>
          )}

          {/* RLS Error Emergency Fix */}
          {rlsError && (
            <div className="mt-4 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
              <h3 className="text-red-400 font-medium mb-2">🚨 CRITICAL: Database RLS Policy Error</h3>
              <p className="text-red-300 text-sm mb-3">
                <strong>Infinite recursion detected in database policies (Code: 42P17)</strong><br/>
                This prevents ALL users from accessing profiles. Emergency fix available.
              </p>
              <div className="bg-red-800/20 border border-red-600/30 rounded p-2 mb-3 text-xs text-red-200">
                <strong>Technical Details:</strong> Row Level Security policies on user_profiles table
                have infinite recursion. This affects all users, not just {rlsError.email}.
              </div>
              <div className="flex space-x-3">
                <Button
                  onClick={fixRlsError}
                  disabled={isLoading}
                  className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-semibold"
                >
                  🚨 Emergency Fix Database
                </Button>
                <a
                  href="/fix-database-policies.sql"
                  download="fix-database-policies.sql"
                  className="bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-lg font-semibold text-sm inline-block"
                >
                  📄 Download SQL Fix
                </a>
              </div>
            </div>
          )}
        </Card>

        {/* Current Status */}
        <Card className="bg-[#1E293B] border border-green-500/30 rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-bold text-green-400 mb-4">📊 Current Status</h2>
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

          {accessResult && (
            <div className="mt-6">
              <h3 className="text-white font-medium mb-2">Analyzer Access Result</h3>
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

        {/* Debug Log */}
        <Card className="bg-[#1E293B] border border-yellow-500/30 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-yellow-400 mb-4">🔍 Debug Log</h2>

          {debugLog.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 text-lg mb-2">No debug information yet</div>
              <div className="text-gray-500 text-sm">Click "Run Full Diagnosis" to start debugging</div>
            </div>
          ) : (
            <div className="bg-[#2A3441] rounded-lg p-4">
              <div className="space-y-1 max-h-96 overflow-y-auto">
                {debugLog.map((log, index) => (
                  <div key={index} className="text-gray-300 text-sm font-mono">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Admin Panel Diagnostics Section */}
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-blue-300 mb-4">🔧 Admin Panel Diagnostics</h3>
          <p className="text-blue-200 mb-4">
            Test admin panel functionality and check why pending users might not be appearing.
          </p>

          <Button
            onClick={runAdminDiagnostics}
            disabled={isRunningAdminDiag}
            className="bg-blue-600 hover:bg-blue-700 text-white mb-4"
          >
            {isRunningAdminDiag ? '⏳ Running Admin Diagnostics...' : '🔍 Run Admin Panel Diagnostics'}
          </Button>

          {adminDiagnostics && (
            <div className="mt-4 space-y-4">
              <div className="bg-gray-900/50 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-white mb-2">📊 Admin API Results</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">API Status:</span>
                    <span className={adminDiagnostics.adminApi?.success ? "text-green-400" : "text-red-400"}>
                      {adminDiagnostics.adminApi?.success ? "✅ SUCCESS" : "❌ FAILED"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Total Users:</span>
                    <span className="text-white">{adminDiagnostics.adminApi?.totalUsers || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Pending Users:</span>
                    <span className={adminDiagnostics.adminApi?.pendingUsers > 0 ? "text-yellow-400" : "text-gray-400"}>
                      {adminDiagnostics.adminApi?.pendingUsers || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Approved Users:</span>
                    <span className="text-green-400">{adminDiagnostics.adminApi?.approvedUsers || 0}</span>
                  </div>

                  {adminDiagnostics.adminApi?.error && (
                    <div className="mt-2 p-2 bg-red-900/30 rounded text-red-300">
                      <strong>API Error:</strong> {adminDiagnostics.adminApi.error}
                    </div>
                  )}
                </div>
              </div>

              {adminDiagnostics.currentUser && (
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-white mb-2">👤 Current User</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Email:</span>
                      <span className="text-white">{adminDiagnostics.currentUser.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Is Admin:</span>
                      <span className={adminDiagnostics.currentUser.isAdmin ? "text-green-400" : "text-gray-400"}>
                        {adminDiagnostics.currentUser.isAdmin ? "✅ YES" : "❌ NO"}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {adminDiagnostics.databaseTest && (
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-white mb-2">💾 Database Test</h4>
                  <pre className="text-xs text-gray-300 bg-black/30 p-2 rounded overflow-auto">
                    {JSON.stringify(adminDiagnostics.databaseTest, null, 2)}
                  </pre>
                </div>
              )}

              {/* Troubleshooting Guide */}
              <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-yellow-300 mb-2">🔧 Troubleshooting Guide</h4>
                <div className="text-yellow-200 text-sm space-y-2">
                  <p><strong>If pending users = 0 but you got signup emails:</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>User profile might not be created during signup</li>
                    <li>Database RLS policies might be blocking profile creation</li>
                    <li>Supabase service role might not have proper permissions</li>
                    <li>Signup process might have failed silently</li>
                  </ul>

                  <p className="mt-4"><strong>Quick fixes to try:</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Ask the user to try signing up again</li>
                    <li>Check Supabase dashboard for auth users vs profile records</li>
                    <li>Use the "Create Missing Profile" button if user exists in auth</li>
                    <li>Check database logs for RLS policy errors</li>
                  </ul>
                </div>
              </div>

              {/* Quick Fix Actions */}
              {adminDiagnostics.data?.missingProfiles?.length > 0 && (
                <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-green-300 mb-2">🚀 Quick Fix Available</h4>
                  <p className="text-green-200 mb-4">
                    Found {adminDiagnostics.data.missingProfiles.length} users in auth without profiles.
                    This is likely why pending users aren't showing in admin panel.
                  </p>

                  <div className="mb-3">
                    <h5 className="font-semibold text-green-300 mb-2">Missing Profile Users:</h5>
                    <div className="space-y-1">
                      {adminDiagnostics.data.missingProfiles.slice(0, 5).map((user: any, index: number) => (
                        <div key={index} className="text-sm text-green-200">
                          • {user.email} (created: {new Date(user.createdAt).toLocaleDateString()})
                        </div>
                      ))}
                      {adminDiagnostics.data.missingProfiles.length > 5 && (
                        <div className="text-sm text-green-300">
                          ... and {adminDiagnostics.data.missingProfiles.length - 5} more
                        </div>
                      )}
                    </div>
                  </div>

                  <Button
                    onClick={createMissingProfiles}
                    disabled={isCreatingProfiles}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {isCreatingProfiles ? '⏳ Creating Profiles...' : '🔧 Create Missing Profiles'}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
