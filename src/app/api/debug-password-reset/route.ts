import { NextRequest, NextResponse } from 'next/server'
import { supabase, isAuthEnabled } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    console.log('🧪 DEBUG: Password reset test for:', email);

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gmillibot.com';

    const result = {
      timestamp: new Date().toISOString(),
      email,
      authEnabled: isAuthEnabled,
      supabaseConfigured: !!supabase,
      siteUrl,
      steps: [] as string[],
      error: null as string | null,
      success: false
    };

    result.steps.push('✅ API endpoint reached');

    if (!email) {
      result.error = 'Email is required';
      result.steps.push('❌ No email provided');
      return NextResponse.json(result, { status: 400 });
    }

    result.steps.push(`✅ Email provided: ${email}`);

    if (!isAuthEnabled) {
      result.error = 'Authentication not enabled (demo mode)';
      result.steps.push('❌ Auth not enabled');
      return NextResponse.json(result, { status: 503 });
    }

    result.steps.push('✅ Auth is enabled');

    if (!supabase) {
      result.error = 'Supabase client not available';
      result.steps.push('❌ Supabase client not configured');
      return NextResponse.json(result, { status: 503 });
    }

    result.steps.push('✅ Supabase client available');

    // Test Supabase connection
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        result.steps.push(`⚠️ Session check error: ${sessionError.message}`);
      } else {
        result.steps.push('✅ Supabase connection test passed');
      }
    } catch (connError: any) {
      result.steps.push(`❌ Supabase connection failed: ${connError.message}`);
    }

    // Check if user exists
    try {
      const { data: users, error: userError } = await supabase
        .from('user_profiles')
        .select('id, email, approval_status')
        .eq('email', email)
        .limit(1);

      if (userError) {
        result.steps.push(`❌ User lookup error: ${userError.message}`);
        result.error = `Database error: ${userError.message}`;
        return NextResponse.json(result, { status: 500 });
      }

      if (!users || users.length === 0) {
        result.steps.push('❌ User not found in database');
        result.error = 'No account found with this email address';
        return NextResponse.json(result, { status: 404 });
      }

      const user = users[0];
      result.steps.push(`✅ User found: ${user.email} (Status: ${user.approval_status})`);

    } catch (dbError: any) {
      result.steps.push(`❌ Database query failed: ${dbError.message}`);
      result.error = `Database connection error: ${dbError.message}`;
      return NextResponse.json(result, { status: 500 });
    }

    // Try to send password reset email
    try {
      result.steps.push('🔄 Attempting to send password reset email...');

      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${siteUrl}/auth/callback?type=recovery`
      });

      if (error) {
        result.steps.push(`❌ Supabase reset email error: ${error.message}`);
        result.error = `Reset email failed: ${error.message}`;
        return NextResponse.json(result, { status: 400 });
      }

      result.steps.push('✅ Password reset email sent successfully');
      result.success = true;

      return NextResponse.json(result, { status: 200 });

    } catch (resetError: any) {
      result.steps.push(`❌ Reset email exception: ${resetError.message}`);
      result.error = `Unexpected error: ${resetError.message}`;
      return NextResponse.json(result, { status: 500 });
    }

  } catch (error: any) {
    console.error('💥 Debug password reset error:', error);
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      error: error.message,
      success: false,
      steps: ['❌ API endpoint failed']
    }, { status: 500 });
  }
}
