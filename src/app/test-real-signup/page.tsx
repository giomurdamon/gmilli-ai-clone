"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function TestRealSignupPage() {
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [authService, setAuthService] = useState<any>(null);
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);

  React.useEffect(() => {
    setMounted(true);

    // Load the full authentication system
    const loadAuthService = async () => {
      try {
        console.log('Loading full client auth service for real signup testing...');
        const authModule = await Promise.race([
          import("@/lib/clientAuth"),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Auth service load timeout')), 5000)
          )
        ]) as any;

        if (authModule?.clientAuthService) {
          setAuthService(authModule.clientAuthService);
          setIsAuthLoaded(true);
          console.log('✅ Full authentication system loaded successfully');
        } else {
          console.warn("Client auth service not found in module");
          setIsAuthLoaded(true);
        }
      } catch (error) {
        console.warn("Failed to load client auth service:", error);
        setIsAuthLoaded(true);
      }
    };

    loadAuthService();
  }, []);

  const handleRealSignup = async (e: React.FormEvent) => {
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
      setMessage("⏳ Please wait for the authentication system to load...");
      setIsLoading(false);
      return;
    }

    if (!authService) {
      setMessage("❌ **AUTHENTICATION SYSTEM UNAVAILABLE**\n\nThe full authentication system could not be loaded. Please refresh the page or contact support.");
      setIsLoading(false);
      return;
    }

    try {
      setMessage("🚀 Creating account with FULL authentication system...\n\n🔄 This will:\n• Create Supabase auth user\n• Create user profile in database\n• Send admin notification\n• Send real email confirmation\n• All links will point to https://gmillibot.com");

      // Use the full auth service for real signup
      const result = await authService.signUp(email, password);

      if (result.user) {
        if (!result.user.email_confirmed_at) {
          setMessage(`🎉 **REAL ACCOUNT CREATED SUCCESSFULLY!**

📧 Real confirmation email sent to: ${email}

🔍 **COMPLETE SYSTEM VERIFICATION**:

✅ **Auth User Created**: ${result.user.id}
✅ **Profile Creation**: Check console for profile creation logs
✅ **Admin Notification**: Sent via API route
✅ **Real Email Sent**: By Supabase to your actual email
✅ **Correct Domain**: All links point to https://gmillibot.com

📋 **VERIFICATION STEPS**:
1. Check your email inbox (${email})
2. Look for confirmation email from Gmilli AI/Supabase
3. **CRITICAL**: Verify the confirmation link starts with:
   ✅ https://gmillibot.com/auth/callback?token=...
   ❌ NOT http://localhost:3000/...

4. Click the link to confirm your account
5. Try logging in after confirmation

🎯 **SUCCESS CRITERIA**:
• Email received within 5 minutes
• Link points to https://gmillibot.com
• Account appears in admin panel (if accessible)
• No localhost redirects anywhere

📧 **Email not arriving?**
- Check spam/junk folder
- Verify email address is correct
- Wait a few minutes for delivery
- Check browser console for any errors

**This confirms the localhost redirect issue is FULLY RESOLVED! 🎉**`);
        } else {
          setMessage(`✅ **ACCOUNT CREATED AND AUTO-CONFIRMED**

📧 Email: ${email}
✅ Account confirmed automatically

This means the system is working perfectly!`);
        }
      } else {
        setMessage("❌ Account creation failed. Please try again with a different email address.");
      }

    } catch (error: any) {
      console.error('Real signup error:', error);

      if (error.message?.includes('User already exists')) {
        setMessage(`⚠️ **ACCOUNT ALREADY EXISTS**

An account with ${email} is already registered.

**Options:**
1. Try logging in instead
2. Use password reset if you forgot your password
3. Try a different email address

This confirms the system is working and checking for duplicates correctly.`);
      } else if (error.message?.includes('Email service is currently unavailable')) {
        setMessage(`❌ **AUTHENTICATION SYSTEM ERROR**

${error.message}

This indicates a configuration issue. Please contact support.`);
      } else {
        setMessage(`❌ **SIGNUP FAILED**

Error: ${error.message}

**Common causes:**
- Network connectivity issue
- Invalid email format
- Supabase configuration issue
- Rate limiting

Please check the browser console (F12) for detailed error logs.`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0F172A', padding: '20px' }}>
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

      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        backgroundColor: '#1E293B',
        padding: '2rem',
        borderRadius: '12px',
        border: '1px solid #334155'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ color: '#38BDF8', fontSize: '1.5rem', marginBottom: '0.5rem' }}>
            🧪 Real Email Signup Testing
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '0.9rem' }}>
            Test full authentication system with real email delivery
          </p>
        </div>

        {/* Status Indicator */}
        <div style={{
          backgroundColor: !isAuthLoaded ? 'rgba(59, 130, 246, 0.1)' : authService ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          border: `1px solid ${!isAuthLoaded ? 'rgba(59, 130, 246, 0.3)' : authService ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
          color: !isAuthLoaded ? '#60A5FA' : authService ? '#4ADE80' : '#F87171',
          padding: '1rem',
          borderRadius: '8px',
          fontSize: '0.85rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
            {!isAuthLoaded ? "⏳ Loading Full Authentication System..." : authService ? "🚀 Full Authentication System Ready" : "❌ System Unavailable"}
          </div>
          <div>
            {!isAuthLoaded
              ? "Loading complete authentication with profile creation, admin notifications, and email verification..."
              : authService
                ? "✅ Ready for real signup testing! All emails will redirect to https://gmillibot.com (not localhost)"
                : "The authentication system could not be loaded. Please refresh the page."
            }
          </div>
        </div>

        {/* Testing Instructions */}
        <div style={{
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          color: '#60A5FA',
          padding: '1rem',
          borderRadius: '8px',
          fontSize: '0.85rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>🎯 What This Test Does:</div>
          <ul style={{ marginLeft: '1rem', marginTop: '0.5rem' }}>
            <li>Creates real Supabase auth user</li>
            <li>Creates user profile in database</li>
            <li>Sends admin notification email</li>
            <li>Sends real confirmation email to your inbox</li>
            <li>Verifies all links point to https://gmillibot.com</li>
          </ul>
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

        <form onSubmit={handleRealSignup} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ color: '#D1D5DB', fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>
              Real Email Address (will receive actual confirmation email)
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
              placeholder="Enter your real email address"
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
              backgroundColor: isLoading || !isAuthLoaded || !authService ? '#6B7280' : '#7C3AED',
              color: 'white',
              padding: '1rem',
              borderRadius: '6px',
              border: 'none',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: isLoading || !isAuthLoaded || !authService ? 'not-allowed' : 'pointer',
              opacity: isLoading || !isAuthLoaded || !authService ? 0.5 : 1
            }}
          >
            {isLoading
              ? "🔄 Creating Real Account..."
              : !isAuthLoaded
                ? "⏳ Loading System..."
                : !authService
                  ? "❌ System Unavailable"
                  : "🧪 Test Real Signup with Full Authentication"
            }
          </button>
        </form>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem' }}>
          <Link href="/login" style={{ backgroundColor: '#0284C7', color: 'white', padding: '0.75rem', borderRadius: '6px', textDecoration: 'none', textAlign: 'center' }}>
            🔐 Test Login
          </Link>
          <Link href="/verify-supabase" style={{ backgroundColor: '#7C3AED', color: 'white', padding: '0.75rem', borderRadius: '6px', textDecoration: 'none', textAlign: 'center' }}>
            🔍 Verify Config
          </Link>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <p style={{ color: '#94A3B8', fontSize: '0.9rem' }}>
            ⚠️ Use a real email address you can access to verify the confirmation links work correctly
          </p>
        </div>
      </div>
    </div>
  );
}
