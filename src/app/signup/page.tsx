"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function SignupPage() {
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [authService, setAuthService] = useState<any>(null);
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);

  // Prevent hydration mismatch and load auth service
  React.useEffect(() => {
    setMounted(true);

    // Robust dynamic import with better error handling
    const loadAuthService = async () => {
      try {
        // Use a timeout to prevent hanging
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    if (password !== confirmPassword) {
      setMessage("❌ Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setMessage("❌ Password must be at least 6 characters long");
      setIsLoading(false);
      return;
    }

    if (!isAuthLoaded) {
      setMessage("⏳ Please wait for the email service to load...");
      setIsLoading(false);
      return;
    }

    if (!authService) {
      setMessage("❌ **EMAIL SERVICE UNAVAILABLE**\n\nThe email service could not be loaded. This might be due to:\n• Network connectivity issues\n• Service configuration problems\n\nPlease try refreshing the page or contact support.");
      setIsLoading(false);
      return;
    }

    try {
      setMessage("🔄 Creating account and sending confirmation email...");

      // Use real auth service for signup
      const result = await authService.signUp(email, password);

      if (result.user) {
        if (!result.user.email_confirmed_at) {
          setMessage(`✅ **ACCOUNT CREATED! CONFIRMATION EMAIL SENT**

📧 A confirmation email has been sent to: ${email}

🎯 **CHECK YOUR EMAIL NOW**:

**The confirmation email contains a secure link to verify your account.**

🔍 **VERIFICATION STEPS**:
1. Check your email inbox (and spam/junk folder)
2. Look for the confirmation email from Gmilli AI
3. Click the confirmation link to verify your account
4. Return to the login page to sign in

**📧 Email not arriving?**
- Check your spam/junk folder
- Verify the email address is correct
- Wait a few minutes for delivery
- Contact support if the issue persists

**🔐 Security Note:**
You must confirm your email before you can log in to your account.

**Next Steps:**
1. Check your email and click the confirmation link
2. Once confirmed, visit the login page
3. Sign in with your email and password`);
        } else {
          setMessage(`✅ **ACCOUNT CREATED AND CONFIRMED**

📧 Email: ${email}
✅ Account confirmed automatically

You can now log in to your account!`);
        }
      } else {
        setMessage("❌ Account creation failed. Please try again with a different email address.");
      }

    } catch (error: any) {
      console.error('Signup error:', error);

      if (error.message?.includes('Email address not confirmed')) {
        setMessage(`⚠️ **ACCOUNT EXISTS - EMAIL CONFIRMATION NEEDED**

The account for ${email} already exists but needs email confirmation.

**Check your email for the confirmation link.**

If you don't see the email, try checking your spam folder.`);
      } else if (error.message?.includes('User already registered')) {
        setMessage(`⚠️ **ACCOUNT ALREADY EXISTS**

An account with ${email} is already registered.

Try logging in instead, or use the password reset function if you forgot your password.`);
      } else if (error.message?.includes('Email service is currently unavailable')) {
        setMessage(`❌ **EMAIL SERVICE UNAVAILABLE**

${error.message}

Please try again later or contact support.`);
      } else {
        setMessage(`❌ **SIGNUP FAILED**

Error: ${error.message}

**Common reasons:**
- Network connectivity issue
- Email service configuration issue
- Invalid email address format

Please try again or contact support if the issue persists.`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0F172A', padding: '20px' }}>
      {/* Navigation */}
      <nav style={{
        backgroundColor: '#1E293B',
        padding: '1rem',
        marginBottom: '2rem',
        borderRadius: '8px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{ color: '#38BDF8', textDecoration: 'none', fontSize: '1.5rem', fontWeight: 'bold' }}>
            Gmilli AI
          </Link>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link href="/" style={{ color: '#94A3B8', textDecoration: 'none' }}>Home</Link>
            <Link href="/login" style={{
              backgroundColor: '#0284C7',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              textDecoration: 'none'
            }}>
              Login
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div style={{
        maxWidth: '500px',
        margin: '0 auto',
        backgroundColor: '#1E293B',
        padding: '2rem',
        borderRadius: '12px',
        border: '1px solid #334155'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ color: '#38BDF8', fontSize: '1.5rem', marginBottom: '0.5rem' }}>
            🚀 Create Account
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '0.9rem' }}>
            Join Gmilli AI and start trading with AI-powered assistance
          </p>
        </div>

        {/* Email Confirmation Notice */}
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
            {!isAuthLoaded ? "⏳ Loading Full Auth System..." : authService ? "🚀 Full Authentication & Profile Creation" : "❌ Email Service Unavailable"}
          </div>
          <div>
            {!isAuthLoaded
              ? "Loading complete authentication system with user profile creation..."
              : authService
                ? "Full authentication restored! Real signup with profile creation, admin notifications, and email confirmation pointing to https://gmillibot.com"
                : "The email service could not be loaded. Please try refreshing the page."
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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ color: '#D1D5DB', fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '6px',
                backgroundColor: '#2A3441',
                border: '1px solid #475569',
                color: 'white',
                fontSize: '1rem'
              }}
              placeholder="Enter your email address"
            />
          </div>

          <div>
            <label style={{ color: '#D1D5DB', fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              minLength={6}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '6px',
                backgroundColor: '#2A3441',
                border: '1px solid #475569',
                color: 'white',
                fontSize: '1rem'
              }}
              placeholder="Create a password (min 6 characters)"
            />
          </div>

          <div>
            <label style={{ color: '#D1D5DB', fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={isLoading}
              minLength={6}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '6px',
                backgroundColor: '#2A3441',
                border: '1px solid #475569',
                color: 'white',
                fontSize: '1rem'
              }}
              placeholder="Confirm your password"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !isAuthLoaded || !authService}
            style={{
              width: '100%',
              backgroundColor: isLoading || !isAuthLoaded || !authService ? '#6B7280' : '#059669',
              color: 'white',
              padding: '0.75rem',
              borderRadius: '6px',
              border: 'none',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: isLoading || !isAuthLoaded || !authService ? 'not-allowed' : 'pointer',
              opacity: isLoading || !isAuthLoaded || !authService ? 0.5 : 1
            }}
          >
            {isLoading
              ? "Creating Account..."
              : !isAuthLoaded
                ? "⏳ Loading..."
                : !authService
                  ? "❌ Service Unavailable"
                  : "📧 Create Account & Send Confirmation"
            }
          </button>
        </form>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '1.5rem', marginBottom: '1rem' }}>
          <Link href="/test-site-url" style={{ backgroundColor: '#7C3AED', color: 'white', padding: '0.5rem', borderRadius: '6px', textDecoration: 'none', textAlign: 'center', fontSize: '0.9rem' }}>
            ✅ Config Test
          </Link>
          <Link href="/login" style={{ backgroundColor: '#0284C7', color: 'white', padding: '0.5rem', borderRadius: '6px', textDecoration: 'none', textAlign: 'center', fontSize: '0.9rem' }}>
            🔐 Login
          </Link>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <p style={{ color: '#94A3B8', fontSize: '0.9rem' }}>
            Already have an account?{" "}
            <Link href="/login" style={{ color: '#38BDF8', textDecoration: 'none' }}>
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
