"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GmilliLogo } from "@/components/GmilliLogo";
import { authService } from "@/lib/auth";
import Link from "next/link";

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [user, setUser] = useState<any>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        } else {
          router.push('/login?message=auth-required');
        }
      } catch (err) {
        console.error('Auth check error:', err);
        router.push('/login?message=auth-required');
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    // Validation
    if (!currentPassword) {
      setError("Please enter your current password");
      setIsLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long");
      setIsLoading(false);
      return;
    }

    if (newPassword === currentPassword) {
      setError("New password must be different from current password");
      setIsLoading(false);
      return;
    }

    try {
      // First verify current password by trying to sign in
      await authService.signIn(user.email, currentPassword);

      // Update password using auth service
      await authService.updatePassword(newPassword);

      setSuccess("✅ Password updated successfully!");

      // Clear form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // Show success message for a while
      setTimeout(() => {
        setSuccess("");
      }, 5000);

    } catch (err: any) {
      console.error('Password change error:', err);

      if (err.message?.includes('Invalid login credentials')) {
        setError("Current password is incorrect");
      } else if (err.message?.includes('session')) {
        setError("Session expired. Please log in again.");
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setError(err.message || "Failed to update password. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="relative min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="text-white">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p>Checking authentication...</p>
        </div>
      </div>
    );
  }

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
                <Button
                  onClick={() => router.back()}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Back
                </Button>
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
              <h1 className="text-2xl font-bold gradient-text mb-2">Change Password</h1>
              <p className="text-gray-400">Update your account password</p>
              {user && (
                <p className="text-sm text-sky-400 mt-2">Logged in as: {user.email}</p>
              )}
            </div>

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
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-300 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full px-4 py-3 rounded-lg bg-[#2A3441] border border-blue-800/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent disabled:opacity-50 min-h-[48px]"
                  placeholder="Enter your current password"
                />
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
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
                    <li>• Must be different from current password</li>
                    <li>• New passwords must match</li>
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
                    Changing Password...
                  </>
                ) : (
                  "Change Password"
                )}
              </Button>
            </form>

            <div className="mt-8 text-center space-y-2">
              <p className="text-gray-400 text-sm">
                Having trouble?{" "}
                <Link href="/reset-password" className="text-sky-400 hover:text-sky-300 font-medium">
                  Reset password instead
                </Link>
              </p>
              <p className="text-gray-400 text-sm">
                <Link href="/" className="text-sky-400 hover:text-sky-300 font-medium">
                  Back to Dashboard
                </Link>
              </p>
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
}
