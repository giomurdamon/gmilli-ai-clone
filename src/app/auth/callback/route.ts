import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'
  const type = searchParams.get('type') // 'signup' or 'recovery'
  const token = searchParams.get('token') // Custom confirmation token
  const userId = searchParams.get('user_id') // User ID for custom confirmation

  console.log('🔄 Auth callback triggered:', { code: !!code, type, token: !!token, userId });

  // Handle custom email confirmation via our Resend emails
  if (type === 'signup' && token && userId) {
    console.log('🔧 Processing custom email confirmation for user:', userId);

    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // Ignore cookie errors
            }
          },
        },
      }
    )

    try {
      // Verify the token and confirm the user
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('id, email, confirmation_token, email_confirmed')
        .eq('id', userId)
        .eq('confirmation_token', token)
        .single();

      if (profileError || !userProfile) {
        console.error('❌ Invalid confirmation token or user not found');
        return NextResponse.redirect(`${origin}/login?error=invalid-confirmation-token`);
      }

      if (userProfile.email_confirmed) {
        console.log('✅ Email already confirmed for user:', userProfile.email);
        return NextResponse.redirect(`${origin}/login?message=email-already-confirmed&email=${encodeURIComponent(userProfile.email)}`);
      }

      // Mark email as confirmed
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          email_confirmed: true,
          confirmation_token: null // Clear the token
        })
        .eq('id', userId);

      if (updateError) {
        console.error('❌ Failed to confirm email:', updateError);
        return NextResponse.redirect(`${origin}/login?error=confirmation-failed`);
      }

      // Also update the Supabase auth user
      const { error: authUpdateError } = await supabase.auth.admin.updateUserById(userId, {
        email_confirm: true
      });

      if (authUpdateError) {
        console.warn('⚠️ Failed to update auth confirmation status:', authUpdateError);
      }

      console.log('🎉 Email confirmed successfully for user:', userProfile.email);
      return NextResponse.redirect(`${origin}/login?message=email-confirmed&email=${encodeURIComponent(userProfile.email)}`);

    } catch (error) {
      console.error('💥 Custom confirmation error:', error);
      return NextResponse.redirect(`${origin}/login?error=confirmation-error`);
    }
  }

  // Handle standard Supabase auth callback (password reset, etc.)
  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      console.log('✅ Auth callback successful for:', data.user.email);

      // Handle different confirmation types
      if (type === 'signup') {
        console.log('🎉 Email confirmation successful for new user:', data.user.email);
        // Redirect to login with success message
        return NextResponse.redirect(`${origin}/login?message=email-confirmed&email=${encodeURIComponent(data.user.email || '')}`)
      } else if (type === 'recovery') {
        console.log('🔑 Password reset confirmation for:', data.user.email);
        // Redirect to password reset page
        return NextResponse.redirect(`${origin}/reset-password?message=password-reset-success`)
      } else {
        // Default redirect
        return NextResponse.redirect(`${origin}${next}`)
      }
    } else {
      console.error('❌ Auth callback error:', error);
    }
  } else {
    console.warn('⚠️ Auth callback called without code or token parameter');
  }

  // return the user to an error page with instructions
  console.log('🚨 Redirecting to auth error page');
  return NextResponse.redirect(`${origin}/login?error=auth-callback-failed`)
}
