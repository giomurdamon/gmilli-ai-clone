"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [message, setMessage] = useState("");
  const [mounted, setMounted] = useState(false);
  const [authService, setAuthService] = useState<any>(null);
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);

  React.useEffect(() => {
    setMounted(true);

    // Load auth service dynamically
    const loadAuthService = async () => {
      try {
        console.log('Loading client auth service...');
        const authModule = await Promise.race([
          import("@/lib/clientAuth"),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Client auth service load timeout')), 5000)
          )
        ]) as any;

        if (authModule?.clientAuthService) {
          setAuthService(authModule.clientAuthService);
          setIsAuthLoaded(true);
          console.log('✅ Client auth service loaded successfully');
        } else {
          console.warn("Client auth service not found in module");
          setIsAuthLoaded(true);
        }
      } catch (error) {
        console.warn("Failed to load auth service:", error);
        setIsAuthLoaded(true);
      }
    };

    loadAuthService();
  }, []);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setMessage("❌ Please enter both email and password.");
      return;
    }

    if (!isAuthLoaded) {
      setMessage("⏳ Please wait for the authentication service to load...");
      return;
    }

    if (!authService) {
      setMessage("❌ Authentication service unavailable. Please refresh the page.");
      return;
    }

    setIsLoggingIn(true);
    setMessage("");

    try {
      setMessage("🔄 Signing you in...");

      // Use real auth service to sign in
      const data = await authService.signIn(email, password);

      if (data && data.user) {
        setMessage("✅ Login successful! Redirecting...");

        // Store user info and redirect
        localStorage.setItem('user', JSON.stringify(data.user));

        // Redirect to dashboard or home
        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
      } else {
        setMessage(`❌ **LOGIN FAILED**

No user data returned from authentication service.

**What to do:**
- Try again in a moment
- Contact support if the issue persists`);
      }
    } catch (error: any) {
      setMessage(`❌ **LOGIN FAILED**

${error.message}

**Common reasons:**
- Incorrect email or password
- Account not verified (check your email)
- Account requires admin approval

**What to do:**
- Double-check your credentials
- Use "Forgot Password?" if you can't remember
- Contact support if you continue having issues`);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email.trim()) {
      setMessage("❌ Please enter your email address first.");
      return;
    }

    if (!isAuthLoaded || !authService) {
      setMessage("❌ Email service unavailable. Please refresh the page.");
      return;
    }

    setIsResetting(true);
    setMessage("");

    try {
      setMessage("🔄 Sending password reset email...");

      const result = await authService.resetPassword(email);

      if (result.success) {
        setMessage(`✅ **PASSWORD RESET EMAIL SENT!**

📧 A password reset email has been sent to: ${email}

🎯 **CHECK YOUR EMAIL NOW**:
- Check your inbox (and spam folder)
- Click the reset link to set a new password
- Return here to login with your new password

The reset link will expire in 24 hours for security.`);
      } else {
        setMessage(`❌ **PASSWORD RESET FAILED**

${result.error}

Please check your email address and try again.`);
      }
    } catch (error: any) {
      setMessage(`❌ Failed to send reset email: ${error.message}`);
    } finally {
      setIsResetting(false);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0F172A', padding: '20px' }}>
      <nav style={{ backgroundColor: '#1E293B', padding: '1rem', marginBottom: '2rem', borderRadius: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{ color: '#38BDF8', textDecoration: 'none', fontSize: '1.5rem', fontWeight: 'bold' }}>
            Gmilli AI
          </Link>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link href="/" style={{ color: '#94A3B8', textDecoration: 'none' }}>Home</Link>
            <Link href="/signup" style={{ backgroundColor: '#059669', color: 'white', padding: '0.5rem 1rem', borderRadius: '6px', textDecoration: 'none' }}>
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: '500px', margin: '0 auto', backgroundColor: '#1E293B', padding: '2rem', borderRadius: '12px', border: '1px solid #334155' }}>
        <h1 style={{ color: '#38BDF8', fontSize: '1.5rem', marginBottom: '1rem', textAlign: 'center' }}>
          {showResetForm ? "🔐 Reset Password" : "🚀 Login to Gmilli AI"}
        </h1>

        <div style={{
          backgroundColor: !isAuthLoaded ? 'rgba(59, 130, 246, 0.1)' : authService ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          border: `1px solid ${!isAuthLoaded ? 'rgba(59, 130, 246, 0.3)' : authService ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
          color: !isAuthLoaded ? '#60A5FA' : authService ? '#4ADE80' : '#F87171',
          padding: '1rem',
          borderRadius: '8px',
          fontSize: '0.8rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
            {!isAuthLoaded ? "⏳ Loading Authentication..." : authService ? "✅ Authentication System Ready" : "❌ Service Unavailable"}
          </div>
          <div>
            {!isAuthLoaded
              ? "Loading authentication system..."
              : authService
                ? `${showResetForm ? "Reset password" : "Login"} with full authentication system`
                : "Authentication service could not be loaded. Please refresh the page."
            }
          </div>
        </div>

        {message && (
          <div style={{
            backgroundColor: message.includes('❌') ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
            border: `1px solid ${message.includes('❌') ? 'rgba(239, 68, 68, 0.3)' : 'rgba(34, 197, 94, 0.3)'}`,
            color: message.includes('❌') ? '#F87171' : '#4ADE80',
            padding: '1rem',
            borderRadius: '8px',
            fontSize: '0.8rem',
            marginBottom: '1.5rem',
            whiteSpace: 'pre-line'
          }}>
            {message}
          </div>
        )}

        {!showResetForm ? (
          // Login Form
          <>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ color: '#D1D5DB', fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  backgroundColor: '#2A3441',
                  border: '1px solid #475569',
                  color: 'white',
                  fontSize: '1rem'
                }}
                placeholder="Enter your email"
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ color: '#D1D5DB', fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  backgroundColor: '#2A3441',
                  border: '1px solid #475569',
                  color: 'white',
                  fontSize: '1rem'
                }}
                placeholder="Enter your password"
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>

            <button
              onClick={handleLogin}
              disabled={isLoggingIn || !email.trim() || !password.trim() || !isAuthLoaded || !authService}
              style={{
                width: '100%',
                backgroundColor: isLoggingIn || !email.trim() || !password.trim() || !isAuthLoaded || !authService ? '#6B7280' : '#2563EB',
                color: 'white',
                padding: '0.75rem',
                borderRadius: '6px',
                border: 'none',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: isLoggingIn || !email.trim() || !password.trim() || !isAuthLoaded || !authService ? 'not-allowed' : 'pointer',
                marginBottom: '1rem'
              }}
            >
              {isLoggingIn
                ? "Signing In..."
                : !isAuthLoaded
                  ? "⏳ Loading..."
                  : !authService
                    ? "❌ Service Unavailable"
                    : "🚀 Login"
              }
            </button>

            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <button
                onClick={() => setShowResetForm(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#38BDF8',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  fontSize: '0.9rem'
                }}
              >
                Forgot your password?
              </button>
            </div>
          </>
        ) : (
          // Reset Form
          <>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ color: '#D1D5DB', fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  backgroundColor: '#2A3441',
                  border: '1px solid #475569',
                  color: 'white',
                  fontSize: '1rem'
                }}
                placeholder="Enter your email for password reset"
              />
            </div>

            <button
              onClick={handlePasswordReset}
              disabled={isResetting || !email.trim() || !isAuthLoaded || !authService}
              style={{
                width: '100%',
                backgroundColor: isResetting || !email.trim() || !isAuthLoaded || !authService ? '#6B7280' : '#DC2626',
                color: 'white',
                padding: '0.75rem',
                borderRadius: '6px',
                border: 'none',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: isResetting || !email.trim() || !isAuthLoaded || !authService ? 'not-allowed' : 'pointer',
                marginBottom: '1rem'
              }}
            >
              {isResetting
                ? "Sending Reset Email..."
                : "📧 Send Password Reset Email"
              }
            </button>

            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <button
                onClick={() => setShowResetForm(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#38BDF8',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  fontSize: '0.9rem'
                }}
              >
                ← Back to Login
              </button>
            </div>
          </>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
          <Link href="/test-site-url" style={{
            backgroundColor: '#7C3AED',
            color: 'white',
            padding: '0.5rem',
            borderRadius: '6px',
            textDecoration: 'none',
            textAlign: 'center',
            fontSize: '0.9rem'
          }}>
            ✅ Config Test
          </Link>
          <Link href="/signup" style={{
            backgroundColor: '#059669',
            color: 'white',
            padding: '0.5rem',
            borderRadius: '6px',
            textDecoration: 'none',
            textAlign: 'center',
            fontSize: '0.9rem'
          }}>
            📝 Sign Up
          </Link>
        </div>

        <div style={{ textAlign: 'center', fontSize: '0.8rem', color: '#94A3B8' }}>
          {showResetForm
            ? "Reset your password with secure email delivery"
            : "Access your Gmilli AI trading dashboard"
          }
        </div>
      </div>
    </div>
  );
}
