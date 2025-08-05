"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GmilliLogo } from "@/components/GmilliLogo";
import { authService } from "@/lib/auth";
import Link from "next/link";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isValidSession, setIsValidSession] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user has a valid password reset session
    const checkResetSession = async () => {
      try {
        const user = await authService.getCurrentUser();
        if (user) {
          setIsValidSession(true);
        } else {
          setError("Invalid or expired password reset link. Please request a new password reset.");
        }
      } catch (err) {
        setError("Invalid or expired password reset link. Please request a new password reset.");
      }
    };

    checkResetSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Validation
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      setIsLoading(false);
      return;
    }

    try {
      // Update password using auth service
      await authService.updatePassword(password);

      setSuccess("✅ Password updated successfully! Redirecting to login...");

      // Redirect to login after success
      setTimeout(() => {
        router.push('/login?message=password-updated');
      }, 2000);

    } catch (err: any) {
      console.error('Password update error:', err);

      if (err.message?.includes('Invalid session')) {
        setError("Session expired. Please request a new password reset link.");
      } else {
        setError(err.message || "Failed to update password. Please try again.");
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
              <h1 className="text-2xl font-bold gradient-text mb-2">Reset Your Password</h1>
              <p className="text-gray-400">Enter your new password below</p>
            </div>

            {!isValidSession ? (
              <div className="text-center">
                <div className="bg-red-900/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm mb-6">
                  {error || "Invalid or expired password reset link"}
                </div>
                <Link href="/login">
                  <Button className="bg-sky-600 hover:bg-sky-700 text-white px-6 py-3 rounded-lg">
                    Go to Login
                  </Button>
                </Link>
                <p className="text-gray-400 text-sm mt-4">
                  Need to reset your password?{" "}
                  <Link href="/login" className="text-sky-400 hover:text-sky-300">
                    Request a new reset link
                  </Link>
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-900/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="bg-green-900/20 border border-green-500/30 text-green-400 px-4 py-3 rounded-lg text-sm">
                    {success}
                  </div>
                )}

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    minLength={6}
                    className="w-full px-4 py-3 rounded-lg bg-[#2A3441] border border-blue-800/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent disabled:opacity-50 min-h-[48px]"
                    placeholder="Enter new password (min 6 characters)"
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    minLength={6}
                    className="w-full px-4 py-3 rounded-lg bg-[#2A3441] border border-blue-800/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent disabled:opacity-50 min-h-[48px]"
                    placeholder="Confirm your new password"
                  />
                </div>

                <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
                  <div className="text-blue-300 text-sm">
                    <div className="font-medium mb-1">Password Requirements:</div>
                    <ul className="text-xs space-y-1">
                      <li>• At least 6 characters long</li>
                      <li>• Passwords must match</li>
                      <li>• Choose something secure and memorable</li>
                    </ul>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-sky-600 hover:bg-sky-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 rounded-lg transition-colors font-semibold flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                      Updating Password...
                    </>
                  ) : (
                    "Update Password"
                  )}
                </Button>
              </form>
            )}

            <div className="mt-8 text-center">
              <p className="text-gray-400 text-sm">
                Remember your password?{" "}
                <Link href="/login" className="text-sky-400 hover:text-sky-300 font-medium">
                  Sign in here
                </Link>
              </p>
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
}
