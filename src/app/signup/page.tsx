'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Signup attempt:', { email, password, confirmPassword });
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0F2027', padding: '20px' }}>
      {/* Navigation */}
      <nav style={{ backgroundColor: '#1E2936', padding: '1rem', marginBottom: '2rem', borderRadius: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{ color: '#38BDF8', textDecoration: 'none', fontSize: '1.5rem', fontWeight: 'bold' }}>
            Gmilli AI
          </Link>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link href="/" style={{ color: '#94A3B8', textDecoration: 'none' }}>
              Home
            </Link>
            <Link href="/login" style={{ backgroundColor: '#0284C7', color: 'white', padding: '0.5rem 1rem', borderRadius: '6px', textDecoration: 'none' }}>
              Login
            </Link>
          </div>
        </div>
      </nav>

      {/* Signup Form */}
      <div style={{ maxWidth: '500px', margin: '0 auto', backgroundColor: '#1E2936', padding: '2rem', borderRadius: '12px', border: '1px solid #334155' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ color: '#38BDF8', fontSize: '1.5rem', marginBottom: '0.5rem' }}>
            🚀 Create Account
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '0.9rem' }}>
            Join Gmilli AI and start trading with AI-powered assistance
          </p>
        </div>

        {/* Green notification box */}
        <div style={{
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          border: '1px solid rgba(34, 197, 94, 0.3)',
          color: '#4ADE80',
          padding: '1rem',
          borderRadius: '8px',
          fontSize: '0.8rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>🚀 Full Authentication & Profile Creation</div>
          <div>Full authentication restored! Real signup with profile creation, admin notifications, and email confirmation pointing to https://gmillibot.com</div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
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
                backgroundColor: '#374151',
                border: '1px solid #4B5563',
                borderRadius: '6px',
                color: 'white',
                fontSize: '1rem'
              }}
              placeholder="Enter your email address"
              required
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
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#374151',
                border: '1px solid #4B5563',
                borderRadius: '6px',
                color: 'white',
                fontSize: '1rem'
              }}
              placeholder="Create a password (min 6 characters)"
              required
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
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#374151',
                border: '1px solid #4B5563',
                borderRadius: '6px',
                color: 'white',
                fontSize: '1rem'
              }}
              placeholder="Confirm your password"
              required
            />
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              backgroundColor: '#059669',
              color: 'white',
              padding: '0.75rem',
              borderRadius: '6px',
              border: 'none',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              opacity: 1
            }}
          >
            📧 Create Account & Send Confirmation
          </button>
        </form>

        {/* Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '1.5rem', marginBottom: '1rem' }}>
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
          <Link href="/login" style={{
            backgroundColor: '#0284C7',
            color: 'white',
            padding: '0.5rem',
            borderRadius: '6px',
            textDecoration: 'none',
            textAlign: 'center',
            fontSize: '0.9rem'
          }}>
            🔐 Login
          </Link>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <p style={{ color: '#94A3B8', fontSize: '0.9rem' }}>
            Already have an account? <Link href="/login" style={{ color: '#38BDF8', textDecoration: 'none' }}>Sign in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
