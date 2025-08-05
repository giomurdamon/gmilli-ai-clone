"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";

// Safe dynamic imports with error handling
const SafeComponent = ({ children, fallback = null }: { children: React.ReactNode, fallback?: React.ReactNode }) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, []);

  if (hasError) {
    return fallback;
  }

  try {
    return <>{children}</>;
  } catch (error) {
    console.error('Component error:', error);
    setHasError(true);
    return fallback;
  }
};

// Import the enhanced AnalyzerPopup component
import { AnalyzerPopup } from "@/components/AnalyzerPopup";

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const [showAnalyzer, setShowAnalyzer] = useState(false);
  const [showDigitAI, setShowDigitAI] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userApprovalStatus, setUserApprovalStatus] = useState<string | null>(null);
  const [isCheckingAccess, setIsCheckingAccess] = useState(false);
  const [componentsLoaded, setComponentsLoaded] = useState({
    analyzer: true, // Now fully loaded
    notifications: false,
    activity: false,
    apiMonitor: false,
    gmilliLogo: false
  });

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
    // Check authentication status and approval
    const checkAuth = async () => {
      try {
        // Check if user is logged in
        const user = localStorage.getItem('user');
        const isLoggedIn = !!user;
        setIsAuthenticated(isLoggedIn);

        // If logged in, check approval status
        if (isLoggedIn) {
          try {
            const authModule = await import('@/lib/clientAuth');
            if (authModule?.clientAuthService) {
              const profile = await authModule.clientAuthService.getUserProfile();
              if (profile) {
                setUserApprovalStatus(profile.approval_status);
                console.log('👤 User approval status:', profile.approval_status);
              }
            }
          } catch (error) {
            console.warn('Could not check user approval status:', error);
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      }
    };
    checkAuth();

    // Load components gradually
    setTimeout(() => {
      setComponentsLoaded(prev => ({ ...prev, gmilliLogo: true, analyzer: true }));
    }, 100);
  }, []);

  // Trading interface access handler with approval check
  const handleTradingInterfaceAccess = async () => {
    if (!isAuthenticated) {
      alert('Please login first to access the trading interface.');
      return;
    }

    setIsCheckingAccess(true);

    try {
      const authModule = await import('@/lib/clientAuth');
      if (authModule?.clientAuthService) {
        const accessCheck = await authModule.clientAuthService.canUserAccessAnalyzer(true);

        if (accessCheck.canAccess) {
          setShowAnalyzer(true);
        } else {
          // Show detailed access denied message
          const reason = accessCheck.reason || 'Admin approval required';

          let alertMessage = '';
          if (userApprovalStatus === 'pending') {
            alertMessage = `🔒 TRADING ACCESS PENDING

Your account is awaiting admin approval.

📧 You will receive an email notification once your account is approved.

⏰ This typically takes 24-48 hours.

❓ Questions? Contact support.`;
          } else if (userApprovalStatus === 'rejected') {
            alertMessage = `❌ TRADING ACCESS DENIED

Your account access has been denied.

📞 Please contact support for more information about your account status.`;
          } else {
            alertMessage = `🔒 TRADING ACCESS RESTRICTED

${reason}

📝 Please ensure your account meets all requirements and try again.`;
          }

          alert(alertMessage);
        }
      } else {
        // Fallback - allow access if auth service not available
        setShowAnalyzer(true);
      }
    } catch (error) {
      console.error('Access check failed:', error);
      alert('Unable to verify trading access. Please try again or contact support.');
    }

    setIsCheckingAccess(false);
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      // Try to load clientAuth service and sign out
      try {
        const authModule = await import("@/lib/clientAuth");
        if (authModule?.clientAuthService) {
          await authModule.clientAuthService.signOut();
        }
      } catch (error) {
        console.warn("Could not load auth service for logout:", error);
      }

      // Clear local storage regardless
      localStorage.removeItem('user');

      // Update authentication state
      setIsAuthenticated(false);
      setUserApprovalStatus(null);

      // Refresh the page to reset all state
      window.location.reload();
    } catch (error) {
      console.error("Logout error:", error);
      // Even if logout fails, clear local state
      localStorage.removeItem('user');
      setIsAuthenticated(false);
      setUserApprovalStatus(null);
      window.location.reload();
    }
  };

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  // Simple logo fallback
  const SimpleLogo = () => (
    <div className="relative bg-sky-600/20 rounded-xl p-2 backdrop-blur-xl border border-sky-400/30">
      <div className="w-8 h-8 bg-sky-400 rounded"></div>
    </div>
  );

  return (
    <div className="relative min-h-screen bg-[#0F172A]">
      {/* Background pattern overlay */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-sky-900/20"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(56,189,248,0.1)_0%,_transparent_50%)]"></div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Navigation */}
        <nav className="glass border-blue-900/20 border-b transition-colors duration-200">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="flex items-center space-x-2">
                <SafeComponent fallback={<SimpleLogo />}>
                  {componentsLoaded.gmilliLogo && (
                    <div className="relative bg-sky-600/20 rounded-xl p-2 backdrop-blur-xl border border-sky-400/30">
                      <div className="w-8 h-8 bg-sky-400 rounded"></div>
                    </div>
                  )}
                </SafeComponent>
                <span className="text-xl font-bold gradient-text">Gmilli AI</span>
              </Link>
              <div className="flex items-center space-x-6">
                <Link href="/" className="hover:text-sky-400 transition-colors text-gray-300">
                  Home
                </Link>
                {isAuthenticated ? (
                  <div className="flex items-center space-x-4">
                    <Button
                      onClick={handleTradingInterfaceAccess}
                      disabled={isCheckingAccess}
                      className="bg-teal-600 hover:bg-teal-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors relative"
                    >
                      {isCheckingAccess ? 'Checking Access...' : 'Trading Interface'}
                      {userApprovalStatus === 'pending' && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></span>
                      )}
                      {userApprovalStatus === 'approved' && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"></span>
                      )}
                    </Button>
                    <Button
                      onClick={() => setShowDigitAI(!showDigitAI)}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      DigitAI Stats
                    </Button>
                    <Link href="/admin">
                      <Button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors">
                        Admin Panel
                      </Button>
                    </Link>
                    <Button
                      onClick={handleLogout}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Logout
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-4">
                    <Link href="/login">
                      <Button className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg transition-colors">
                        Login
                      </Button>
                    </Link>
                    <Link href="/signup">
                      <Button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
                        Sign Up
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 w-full">
          {isAuthenticated ? (
            // Trading Dashboard for authenticated users
            <div className="min-h-screen">
              {/* DigitAI Stats Panel */}
              <div className={`digit-stats-panel fixed left-0 top-16 h-full w-80 bg-[#1E293B] border-r border-purple-500/30 z-60 ${showDigitAI ? 'active' : ''}`}>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-purple-400">📊 DigitAI Stats</h2>
                    <Button
                      onClick={() => setShowDigitAI(false)}
                      variant="ghost"
                      className="text-gray-400 hover:text-white"
                    >
                      ✕
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <Card className="glass rounded-lg p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-400">87.3%</div>
                        <div className="text-gray-400 text-sm">Success Rate</div>
                      </div>
                    </Card>

                    <Card className="glass rounded-lg p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-400">1,247</div>
                        <div className="text-gray-400 text-sm">Trades Today</div>
                      </div>
                    </Card>

                    <Card className="glass rounded-lg p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-400">+$2,341</div>
                        <div className="text-gray-400 text-sm">Today's P&L</div>
                      </div>
                    </Card>
                  </div>
                </div>
              </div>

              {/* Main Dashboard Content */}
              <div className={`transition-all duration-300 ${showDigitAI ? 'ml-80' : ''}`}>
                <div className="container mx-auto px-4 py-8">
                  {/* Dashboard Header */}
                  <section className="text-center mb-12">
                    <h1 className="text-4xl sm:text-5xl font-bold mb-6 gradient-text float">
                      Gmilli AI Trading Dashboard
                    </h1>
                    <p className="text-xl text-gray-300 mb-8">
                      Advanced AI-powered trading analysis and real-time monitoring
                    </p>

                    {/* User Approval Status Indicator */}
                    {userApprovalStatus && (
                      <div className={`inline-block px-6 py-3 rounded-lg border mb-6 ${
                        userApprovalStatus === 'approved'
                          ? 'bg-green-900/30 border-green-500/50 text-green-300'
                          : userApprovalStatus === 'pending'
                          ? 'bg-yellow-900/30 border-yellow-500/50 text-yellow-300'
                          : 'bg-red-900/30 border-red-500/50 text-red-300'
                      }`}>
                        <div className="flex items-center space-x-3">
                          <span className="text-xl">
                            {userApprovalStatus === 'approved' ? '✅' : userApprovalStatus === 'pending' ? '⏳' : '❌'}
                          </span>
                          <div>
                            <div className="font-bold">
                              {userApprovalStatus === 'approved'
                                ? 'Account Approved - Full Trading Access'
                                : userApprovalStatus === 'pending'
                                ? 'Account Pending Approval'
                                : 'Account Access Denied'
                              }
                            </div>
                            <div className="text-sm opacity-80">
                              {userApprovalStatus === 'approved'
                                ? 'You have full access to all trading features'
                                : userApprovalStatus === 'pending'
                                ? 'Your account is being reviewed by our admin team'
                                : 'Contact support for assistance with your account'
                              }
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="flex justify-center space-x-4">
                      <Button
                        onClick={handleTradingInterfaceAccess}
                        disabled={isCheckingAccess}
                        size="lg"
                        className="bg-teal-600 hover:bg-teal-700 disabled:bg-gray-600 text-white px-8 py-3 rounded-lg text-lg transition-all duration-300 hover:scale-105"
                      >
                        {isCheckingAccess ? '🔍 Checking Access...' : '🚀 Launch Trading Interface'}
                      </Button>
                    </div>
                  </section>

                  {/* Dashboard Grid - Simplified for now */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Live Notifications Panel Placeholder */}
                    <Card className="bg-[#1E293B] border border-blue-500/30 rounded-2xl p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-purple-400">🔔 Live Admin Alerts</h3>
                        <div className="flex items-center space-x-2">
                          <div className="animate-pulse w-2 h-2 bg-purple-500 rounded-full"></div>
                          <span className="text-purple-400 text-sm">Live</span>
                        </div>
                      </div>
                      <div className="text-center py-8 text-gray-400">
                        <div className="text-4xl mb-2">🔔</div>
                        <div>Monitoring system active</div>
                        <div className="text-sm mt-1">Advanced components loading...</div>
                      </div>
                    </Card>

                    {/* Real-Time Activity Feed Placeholder */}
                    <Card className="bg-[#1E293B] border border-orange-500/30 rounded-2xl p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-orange-400">⚡ Live Activity Feed</h3>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                          <span className="text-orange-400 text-sm">Live</span>
                        </div>
                      </div>
                      <div className="text-center py-8 text-gray-400">
                        <div className="text-4xl mb-2">⚡</div>
                        <div>Activity monitoring active</div>
                        <div className="text-sm mt-1">Real-time feed loading...</div>
                      </div>
                    </Card>
                  </div>

                  {/* API Status Monitor Placeholder */}
                  <div className="mb-8">
                    <Card className="bg-[#1E293B] border border-cyan-500/30 rounded-2xl p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-cyan-400">🔗 API Status Monitor</h3>
                        <div className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                          100% Healthy
                        </div>
                      </div>
                      <div className="text-center py-8 text-gray-400">
                        <div className="text-4xl mb-2">🔗</div>
                        <div>All systems operational</div>
                        <div className="text-sm mt-1">Detailed monitoring loading...</div>
                      </div>
                    </Card>
                  </div>

                  {/* Trading Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card className="glass rounded-2xl p-6 hover:scale-105 transition-transform duration-300">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-green-600/20 rounded-xl mx-auto mb-4 flex items-center justify-center">
                          <span className="text-2xl">📈</span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Active Trades</h3>
                        <p className="text-3xl font-bold text-green-400">24</p>
                      </div>
                    </Card>

                    <Card className="glass rounded-2xl p-6 hover:scale-105 transition-transform duration-300">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-blue-600/20 rounded-xl mx-auto mb-4 flex items-center justify-center">
                          <span className="text-2xl">💰</span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Total Profit</h3>
                        <p className="text-3xl font-bold text-blue-400">$12,847</p>
                      </div>
                    </Card>

                    <Card className="glass rounded-2xl p-6 hover:scale-105 transition-transform duration-300">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-purple-600/20 rounded-xl mx-auto mb-4 flex items-center justify-center">
                          <span className="text-2xl">🎯</span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Accuracy</h3>
                        <p className="text-3xl font-bold text-purple-400">87.3%</p>
                      </div>
                    </Card>

                    <Card className="glass rounded-2xl p-6 hover:scale-105 transition-transform duration-300">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-orange-600/20 rounded-xl mx-auto mb-4 flex items-center justify-center">
                          <span className="text-2xl">⚡</span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">AI Analysis</h3>
                        <p className="text-3xl font-bold text-orange-400">Live</p>
                      </div>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Landing page for non-authenticated users
            <div className="min-h-screen">
              <div className="container mx-auto px-4 py-12">
                {/* Hero Section */}
                <section className="text-center mb-16">
                  <h1 className="text-4xl sm:text-5xl font-bold mb-6 gradient-text float">
                    Gmilli AI Trading Assistant
                  </h1>
                  <p className="text-xl text-gray-300 mb-8">
                    Advanced AI-powered trading analysis and automation platform
                  </p>
                  <Link href="/signup" className="inline-block">
                    <Button size="lg" className="bg-sky-600 hover:bg-sky-700 text-white px-8 py-3 rounded-lg text-lg transition-all duration-300 hover:scale-105">
                      Get Started
                    </Button>
                  </Link>
                </section>

                {/* Features Section */}
                <section className="mb-16">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <Card className="glass rounded-2xl p-6 hover:scale-105 transition-transform duration-300">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-sky-600/20 rounded-xl mx-auto mb-4 flex items-center justify-center">
                          <span className="text-2xl">🤖</span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">AI-Powered Analysis</h3>
                        <p className="text-gray-300">Advanced machine learning algorithms analyze market patterns and provide intelligent trading insights.</p>
                      </div>
                    </Card>
                    <Card className="glass rounded-2xl p-6 hover:scale-105 transition-transform duration-300">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-green-600/20 rounded-xl mx-auto mb-4 flex items-center justify-center">
                          <span className="text-2xl">📈</span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Real-Time Data</h3>
                        <p className="text-gray-300">Access live market data and real-time analytics to make informed trading decisions.</p>
                      </div>
                    </Card>
                    <Card className="glass rounded-2xl p-6 hover:scale-105 transition-transform duration-300">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-purple-600/20 rounded-xl mx-auto mb-4 flex items-center justify-center">
                          <span className="text-2xl">⚡</span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Automated Trading</h3>
                        <p className="text-gray-300">Set up automated trading strategies with customizable risk management and profit targets.</p>
                      </div>
                    </Card>
                  </div>
                </section>

                {/* CTA Section */}
                <section className="text-center">
                  <Card className="glass rounded-2xl p-8 max-w-2xl mx-auto">
                    <h2 className="text-3xl font-bold text-white mb-4">Ready to Start Trading?</h2>
                    <p className="text-gray-300 mb-6">Join thousands of traders using AI-powered insights to maximize their profits.</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Link href="/signup">
                        <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg transition-all duration-300 hover:scale-105">
                          Create Account
                        </Button>
                      </Link>
                      <Link href="/login">
                        <Button size="lg" variant="secondary" className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-lg transition-all duration-300 hover:scale-105">
                          Sign In
                        </Button>
                      </Link>
                    </div>
                  </Card>
                </section>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Trading Interface Popup - Now fully restored! */}
      {showAnalyzer && (
        <div className={showDigitAI ? 'analyzer-popup-adjusted' : ''}>
          <SafeComponent fallback={
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <Card className="bg-[#0F2027] border border-teal-500/30 rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Trading Interface</h2>
                  <Button
                    onClick={() => setShowAnalyzer(false)}
                    variant="ghost"
                    className="text-gray-400 hover:text-white hover:bg-red-500/20"
                  >
                    ✕
                  </Button>
                </div>
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">⚠️</div>
                  <h3 className="text-2xl font-bold text-white mb-4">Component Loading Error</h3>
                  <p className="text-gray-400 mb-8">The trading interface is temporarily unavailable.</p>
                  <Button onClick={() => setShowAnalyzer(false)} className="bg-gray-600 hover:bg-gray-700">
                    Close
                  </Button>
                </div>
              </Card>
            </div>
          }>
            <AnalyzerPopup
              isOpen={showAnalyzer}
              onClose={() => setShowAnalyzer(false)}
            />
          </SafeComponent>
        </div>
      )}
    </div>
  );
}
