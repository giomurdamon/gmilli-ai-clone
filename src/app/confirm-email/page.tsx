"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GmilliLogo } from "@/components/GmilliLogo";
import { authService } from "@/lib/auth";
import Link from "next/link";

export default function ConfirmEmailPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleResendConfirmation = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      // Try to sign up again - this will resend confirmation if user exists
      await authService.signUp(email.trim(), "dummy-password-for-resend");
      setMessage(`📧 Confirmation email sent to ${email}! Check your inbox and spam folder.`);
    } catch (err: any) {
      if (err.message?.includes('already registered') || err.message?.includes('already exists')) {
        setMessage(`📧 If an account exists for ${email}, a confirmation email has been sent. Check your inbox and spam folder.`);
      } else {
        setError(err.message || "Failed to resend confirmation email. Please try again.");
      }
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
          <Card className="glass rounded-2xl p-8 w-full max-w-md">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="relative float">
                  <div className="relative bg-sky-600/20 rounded-2xl p-3 backdrop-blur-xl border border-sky-400/30">
                    <GmilliLogo size={40} />
                  </div>
                </div>
              </div>
              <h1 className="text-2xl font-bold gradient-text mb-2">📧 Confirm Your Email</h1>
              <p className="text-gray-400">Resend your email confirmation link</p>
            </div>

            {/* Instructions */}
            <div className="bg-blue-900/20 border border-blue-500/30 text-blue-400 px-4 py-3 rounded-lg text-sm mb-6">
              <div className="font-bold mb-2">📬 Email Confirmation Required</div>
              <div className="text-xs space-y-1">
                <p>• Check your email inbox and spam folder</p>
                <p>• Click the confirmation link in the email</p>
                <p>• Return to login after confirming</p>
                <p>• Contact support if no email received</p>
              </div>
            </div>

            <form onSubmit={handleResendConfirmation} className="space-y-6">
              {error && (
                <div className="bg-red-900/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {message && (
                <div className="bg-green-900/20 border border-green-500/30 text-green-400 px-4 py-3 rounded-lg text-sm">
                  {message}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full px-4 py-3 rounded-lg bg-[#2A3441] border border-blue-800/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent disabled:opacity-50 min-h-[48px]"
                  placeholder="Enter your email address"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-sky-600 hover:bg-sky-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 rounded-lg transition-colors font-semibold flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Sending...
                  </>
                ) : (
                  "📧 Resend Confirmation Email"
                )}
              </Button>
            </form>

            <div className="mt-8 text-center space-y-3">
              <p className="text-gray-400 text-sm">
                Already confirmed your email?{" "}
                <Link href="/login" className="text-sky-400 hover:text-sky-300 font-medium">
                  Sign in here
                </Link>
              </p>
              <p className="text-gray-400 text-sm">
                Need help?{" "}
                <Link href="/test-email-reset" className="text-sky-400 hover:text-sky-300 font-medium">
                  Email diagnostics
                </Link>
              </p>
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
}
