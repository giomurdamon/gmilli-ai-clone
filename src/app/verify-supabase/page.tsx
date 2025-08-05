"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function VerifySupabasePage() {
  const [mounted, setMounted] = useState(false);
  const [supabaseConfig, setSupabaseConfig] = useState<any>(null);
  const [testResult, setTestResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Load Supabase configuration info
    const config = {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
      currentOrigin: typeof window !== 'undefined' ? window.location.origin : 'server-side',
      environment: process.env.NODE_ENV
    };

    setSupabaseConfig(config);
  }, []);

  const testSupabaseRedirect = async () => {
    setIsLoading(true);
    setTestResult("🔄 Testing Supabase redirect configuration...");

    try {
      // Load client auth service and test what URLs it's using
      const { clientAuthService } = await import("@/lib/clientAuth");
      const testEmail = "test@example.com";

      setTestResult(prev => prev + "\n\n🔍 Checking what our code sends to Supabase...");

      // This will trigger the console logs showing what redirect URL we're sending
      try {
        await clientAuthService.resetPassword(testEmail);
      } catch (error: any) {
        // Expected to fail with test email, but we'll see the logs
        setTestResult(prev => prev + `\n\n📊 Test completed. Check browser console (F12) for detailed logs showing:\n• What redirect URL our code sends to Supabase\n• Environment variables being used\n• Whether Supabase is overriding our settings\n\nError (expected): ${error.message}`);
      }

    } catch (error: any) {
      setTestResult(prev => prev + `\n\n❌ Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0F172A', padding: '20px' }}>
      <nav style={{ backgroundColor: '#1E293B', padding: '1rem', marginBottom: '2rem', borderRadius: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{ color: '#38BDF8', textDecoration: 'none', fontSize: '1.5rem', fontWeight: 'bold' }}>
            Gmilli AI
          </Link>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link href="/" style={{ color: '#94A3B8', textDecoration: 'none' }}>Home</Link>
            <Link href="/login" style={{ backgroundColor: '#0284C7', color: 'white', padding: '0.5rem 1rem', borderRadius: '6px', textDecoration: 'none' }}>
              Login
            </Link>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ backgroundColor: '#1E293B', padding: '2rem', borderRadius: '12px', border: '1px solid #334155', marginBottom: '2rem' }}>
          <h1 style={{ color: '#38BDF8', fontSize: '1.5rem', marginBottom: '1rem', textAlign: 'center' }}>
            🔍 Supabase Configuration Verification
          </h1>

          <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', color: '#60A5FA', padding: '1rem', borderRadius: '8px', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>🎯 What This Page Does:</div>
            <div>This page helps verify if Supabase is correctly configured to use https://gmillibot.com instead of localhost:3000 for email redirects.</div>
          </div>

          {supabaseConfig && (
            <div style={{ backgroundColor: '#2A3441', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
              <h3 style={{ color: '#38BDF8', marginBottom: '1rem' }}>📊 Current Configuration:</h3>
              <div style={{ color: '#D1D5DB', fontSize: '0.9rem', fontFamily: 'monospace' }}>
                <div><strong>Supabase URL:</strong> {supabaseConfig.supabaseUrl}</div>
                <div><strong>Site URL (env):</strong> {supabaseConfig.siteUrl}</div>
                <div><strong>Current Origin:</strong> {supabaseConfig.currentOrigin}</div>
                <div><strong>Environment:</strong> {supabaseConfig.environment}</div>
              </div>
            </div>
          )}

          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#F87171', padding: '1rem', borderRadius: '8px', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>⚠️ Supabase Dashboard Settings to Check:</div>
            <div style={{ marginBottom: '0.5rem' }}>Go to your Supabase dashboard and verify these settings:</div>
            <ul style={{ marginLeft: '1rem', marginTop: '0.5rem' }}>
              <li><strong>Site URL:</strong> Should be <code>https://gmillibot.com</code></li>
              <li><strong>Additional Redirect URLs:</strong> Should include <code>https://gmillibot.com/**</code></li>
              <li><strong>Remove:</strong> Any <code>http://localhost:3000</code> entries</li>
            </ul>
          </div>

          <button
            onClick={testSupabaseRedirect}
            disabled={isLoading}
            style={{
              width: '100%',
              backgroundColor: isLoading ? '#6B7280' : '#2563EB',
              color: 'white',
              padding: '0.75rem',
              borderRadius: '6px',
              border: 'none',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              marginBottom: '1.5rem'
            }}
          >
            {isLoading ? "🔄 Testing..." : "🧪 Test Supabase Redirect Configuration"}
          </button>

          {testResult && (
            <div style={{
              backgroundColor: '#2A3441',
              border: '1px solid #475569',
              color: '#D1D5DB',
              padding: '1rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontFamily: 'monospace',
              whiteSpace: 'pre-line',
              marginBottom: '1.5rem'
            }}>
              {testResult}
            </div>
          )}

          <div style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', color: '#4ADE80', padding: '1rem', borderRadius: '8px', fontSize: '0.9rem' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>📋 Manual Verification Steps:</div>
            <ol style={{ marginLeft: '1rem', marginTop: '0.5rem' }}>
              <li>Go to <a href="https://app.supabase.com" target="_blank" style={{ color: '#4ADE80' }}>app.supabase.com</a></li>
              <li>Select your project: <code>isgtdflvnxrwbbmketpy</code></li>
              <li>Navigate: Settings → Authentication → URL Configuration</li>
              <li>Verify Site URL is <code>https://gmillibot.com</code></li>
              <li>Add redirect URL: <code>https://gmillibot.com/**</code></li>
              <li>Remove any localhost entries</li>
              <li>Save changes</li>
            </ol>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Link href="/login" style={{ backgroundColor: '#0284C7', color: 'white', padding: '1rem', borderRadius: '6px', textDecoration: 'none', textAlign: 'center' }}>
            🔐 Test Login
          </Link>
          <Link href="/signup" style={{ backgroundColor: '#059669', color: 'white', padding: '1rem', borderRadius: '6px', textDecoration: 'none', textAlign: 'center' }}>
            📝 Test Signup
          </Link>
        </div>
      </div>
    </div>
  );
}
