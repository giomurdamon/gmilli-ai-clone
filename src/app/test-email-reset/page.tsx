"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GmilliLogo } from "@/components/GmilliLogo";
import { authService } from "@/lib/auth";
import { supabase, isAuthEnabled } from "@/lib/supabase";
import Link from "next/link";

export default function TestEmailResetPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState("");
  const [diagnostics, setDiagnostics] = useState<any>(null);

  const runDiagnostics = async () => {
    const diag: any = {
      timestamp: new Date().toISOString(),
      authEnabled: isAuthEnabled,
      supabaseConfigured: !!supabase,
      windowOrigin: typeof window !== 'undefined' ? window.location.origin : 'server-side',
      siteUrl: 'https://gmillibot.com'
    };

    // Test Supabase connection
    if (supabase) {
      try {
        const { data, error } = await supabase.auth.getSession();
        diag.supabaseConnection = error ? `Error: ${error.message}` : 'Connected';
      } catch (err: any) {
        diag.supabaseConnection = `Connection Error: ${err.message}`;
      }
    } else {
      diag.supabaseConnection = 'Not configured';
    }

    setDiagnostics(diag);
  };

  const testPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult("");

    try {
      // Run diagnostics first
      await runDiagnostics();

      console.log('🧪 Testing password reset for:', email);

      const result = await authService.resetPassword(email);

      setResult(`✅ SUCCESS: Password reset email request sent!

📧 Check the following:
1. Your email inbox for a message from Supabase
2. Your spam/junk folder
3. Make sure ${email} is the correct email address
4. The email might take a few minutes to arrive

📝 Email should contain:
- A link to reset your password
- The link will redirect to: https://gmillibot.com/reset-password
- Click the link to set a new password

🔧 If you still don't receive the email:
- Try a different email address
- Check Supabase email settings
- Contact support at support@same.new`);

    } catch (err: any) {
      console.error('❌ Password reset test failed:', err);

      setResult(`❌ ERROR: ${err.message}

🔍 Possible causes:
1. Email address not found in the system
2. Email address not confirmed (check signup email first)
3. Supabase email service not configured
4. Invalid email format

🛠️ Troubleshooting:
1. Make sure you have an account with this email
2. Check if you confirmed your email when you signed up
3. Try with a different email address
4. Contact support if the issue persists`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0F172A]">
      {/* Background pattern overlay */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-sky-900/20"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(56,189,248,0.1)_0%,_transparent_50%)]"></div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Navigation */}
        <nav className="bg-[#1E293B] border-blue-900/20 border-b transition-colors duration-200">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="flex items-center space-x-2">
                <div className="relative">
                  <div className="relative bg-sky-600/20 rounded-xl p-2 backdrop-blur-xl border border-sky-400/30">
                    <GmilliLogo size={32} />
                  </div>
                </div>
                <span className="text-xl font-bold gradient-text">Gmilli AI</span>
              </Link>
              <div className="flex items-center space-x-6">
                <Link href="/" className="hover:text-sky-400 transition-colors text-gray-300">
                  Home
                </Link>
                <Link href="/login">
                  <Button className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg transition-colors">
                    Back to Login
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 w-full flex items-center justify-center p-4">
          <div className="w-full max-w-2xl space-y-6">
            <Card className="glass rounded-2xl p-8">
              <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                  <div className="relative float">
                    <div className="relative bg-sky-600/20 rounded-2xl p-3 backdrop-blur-xl border border-sky-400/30">
                      <GmilliLogo size={40} />
                    </div>
                  </div>
                </div>
                <h1 className="text-2xl font-bold gradient-text mb-2">🧪 Password Reset Email Test</h1>
                <p className="text-gray-400">Test and diagnose password reset email delivery</p>
              </div>

              <form onSubmit={testPasswordReset} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address to Test
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="w-full px-4 py-3 rounded-lg bg-[#2A3441] border border-blue-800/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent disabled:opacity-50 min-h-[48px]"
                    placeholder="Enter email address to test password reset"
                  />
                </div>

                <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                  <div className="text-blue-300 text-sm">
                    <div className="font-medium mb-2">📋 This test will:</div>
                    <ul className="text-xs space-y-1">
                      <li>• Check if your email exists in the system</li>
                      <li>• Send a password reset email if configured</li>
                      <li>• Show detailed diagnostics and troubleshooting</li>
                      <li>• Help identify email delivery issues</li>
                    </ul>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || !email}
                  className="w-full bg-sky-600 hover:bg-sky-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 rounded-lg transition-colors font-semibold flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                      Testing Password Reset...
                    </>
                  ) : (
                    "🧪 Test Password Reset Email"
                  )}
                </Button>

                <Button
                  type="button"
                  onClick={runDiagnostics}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg transition-colors text-sm"
                >
                  🔍 Run System Diagnostics
                </Button>
              </form>
            </Card>

            {/* Results */}
            {result && (
              <Card className="glass rounded-2xl p-6">
                <h3 className="text-lg font-semibold mb-4 text-white">Test Results</h3>
                <pre className="text-sm text-gray-300 whitespace-pre-wrap bg-[#1E293B] p-4 rounded-lg overflow-auto">
                  {result}
                </pre>
              </Card>
            )}

            {/* Diagnostics */}
            {diagnostics && (
              <Card className="glass rounded-2xl p-6">
                <h3 className="text-lg font-semibold mb-4 text-white">System Diagnostics</h3>
                <pre className="text-sm text-gray-300 whitespace-pre-wrap bg-[#1E293B] p-4 rounded-lg overflow-auto">
                  {JSON.stringify(diagnostics, null, 2)}
                </pre>
              </Card>
            )}

            {/* Help Section */}
            <Card className="glass rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4 text-white">🆘 Common Issues & Solutions</h3>
              <div className="text-sm text-gray-300 space-y-3">
                <div>
                  <strong className="text-sky-400">❌ "User not found"</strong>
                  <p>The email address doesn't have an account. Sign up first at <Link href="/signup" className="text-sky-400 hover:underline">/signup</Link></p>
                </div>
                <div>
                  <strong className="text-sky-400">📧 Email not arriving</strong>
                  <p>Check spam folder, verify email address, or contact support</p>
                </div>
                <div>
                  <strong className="text-sky-400">🔧 Supabase not configured</strong>
                  <p>System is in demo mode - email features not available</p>
                </div>
                <div>
                  <strong className="text-sky-400">⏰ Email delayed</strong>
                  <p>Emails can take 1-5 minutes to arrive. Be patient and check periodically.</p>
                </div>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
