import { supabase, isAuthEnabled, getSiteUrl } from './supabase'

// Browser-safe auth service for client-side operations
class ClientAuthService {
  private supabase = supabase

  private getSiteUrl(): string {
    return getSiteUrl()
  }

  private checkAuthEnabled() {
    if (!isAuthEnabled || !this.supabase) {
      console.warn('Auth not configured, email functionality unavailable')
      return false
    }
    return true
  }

  async resetPassword(email: string) {
    if (!email) {
      return { success: false, error: 'Email is required' }
    }

    if (!email.includes('@') || !email.includes('.')) {
      return { success: false, error: 'Please enter a valid email address' }
    }

    if (!this.checkAuthEnabled() || !this.supabase) {
      return {
        success: false,
        error: 'Email service is currently unavailable. Please try again later or contact support.'
      }
    }

    console.log('🔄 Sending real password reset email for:', email);
    console.log('🔗 Reset will redirect to:', `${this.getSiteUrl()}/auth/callback?type=recovery`);
    console.log('🔍 DEBUG - Site URL from env:', this.getSiteUrl());
    console.log('🔍 DEBUG - Environment check:', {
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
      getSiteUrl: this.getSiteUrl(),
      windowLocation: typeof window !== 'undefined' ? window.location.origin : 'server-side'
    });

    try {
      const redirectUrl = `${this.getSiteUrl()}/auth/callback?type=recovery`;
      console.log('🚀 Calling Supabase resetPasswordForEmail with redirectTo:', redirectUrl);

      const { data, error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl
      });

      if (error) {
        console.error('❌ Supabase reset password error:', error);

        // Handle specific Supabase errors
        let errorMessage = 'Password reset failed';
        if (error.message?.includes('User not found')) {
          errorMessage = 'No account found with this email address. Please check your email or sign up for a new account.';
        } else if (error.message?.includes('Email not confirmed')) {
          errorMessage = 'Please confirm your email address first by clicking the link in your signup email.';
        } else if (error.message?.includes('signups not allowed')) {
          errorMessage = 'Password reset is temporarily unavailable. Please contact support.';
        } else if (error.message?.includes('invalid_request')) {
          errorMessage = 'Invalid email address format. Please check and try again.';
        } else {
          errorMessage = `Password reset failed: ${error.message}`;
        }

        return { success: false, error: errorMessage };
      }

      console.log('✅ REAL password reset email sent successfully to:', email);
      console.log('📧 User should receive email with reset link pointing to:', this.getSiteUrl());
      return {
        success: true,
        message: `Password reset email sent to ${email}. Please check your inbox and spam folder.`,
        data
      };

    } catch (err: any) {
      console.error('💥 Password reset error:', err);
      return { success: false, error: err.message || 'Unexpected error occurred' };
    }
  }

  async signUp(email: string, password: string) {
    if (!this.checkAuthEnabled() || !this.supabase) {
      throw new Error('Email service is currently unavailable. Please try again later or contact support.');
    }

    console.log('🔧 Starting user registration for:', email);

    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        // Require email confirmation before login - use configured site URL
        emailRedirectTo: `${this.getSiteUrl()}/auth/callback?type=signup`,
        // Additional options to force live domain
        captchaToken: undefined,
        data: {
          redirect_to: `${this.getSiteUrl()}/auth/callback?type=signup`,
          site_url: this.getSiteUrl()
        }
      }
    })

    if (error) {
      console.error('❌ Signup error:', error);
      throw error;
    }

    console.log('✅ Auth user created (email confirmation required):', data.user?.email, 'ID:', data.user?.id);
    console.log('📧 Email confirmation required for:', data.user?.email);

    // ENHANCED: Multiple methods to ensure user profile creation for admin panel visibility
    if (data.user && this.supabase) {
      try {
        console.log('🔧 Ensuring user profile exists for admin panel visibility...', data.user.email, 'ID:', data.user.id);

        // Method 1: Check if profile was created by database trigger
        let profileCreated = false;
        let retryCount = 0;
        const maxRetries = 3;

        while (!profileCreated && retryCount < maxRetries) {
          console.log(`📊 Checking for user profile (attempt ${retryCount + 1}/${maxRetries})...`);

          const { data: existingProfile, error: checkError } = await this.supabase
            .from('user_profiles')
            .select('id, email, approval_status, created_at')
            .eq('id', data.user.id)
            .single();

          if (existingProfile) {
            console.log('✅ User profile found via database trigger:', {
              email: existingProfile.email,
              approvalStatus: existingProfile.approval_status,
              createdAt: existingProfile.created_at
            });
            profileCreated = true;
            break;
          }

          // Method 2: Manual profile creation if trigger didn't work
          if (!profileCreated) {
            console.log(`🔧 Database trigger didn't create profile, creating manually (attempt ${retryCount + 1})...`);

            const { error: profileError } = await this.supabase
              .from('user_profiles')
              .insert({
                id: data.user.id,
                email: data.user.email,
                status: 'active',
                subscription_status: 'trial',
                approval_status: 'pending', // CRITICAL: New users start as pending for admin approval
                created_at: data.user.created_at || new Date().toISOString(),
                total_trades: 0,
                is_admin: false
              });

            if (profileError) {
              console.warn(`⚠️ Manual profile creation failed (attempt ${retryCount + 1}):`, {
                error: profileError,
                code: profileError.code,
                message: profileError.message,
                details: profileError.details
              });

              // If it's a conflict error, the profile might already exist
              if (profileError.code === '23505' || profileError.message?.includes('duplicate')) {
                console.log('ℹ️ Profile creation failed due to duplicate - profile may already exist');
                profileCreated = true;
              }
            } else {
              console.log('✅ User profile created manually for:', data.user.email);
              profileCreated = true;
            }
          }

          retryCount++;

          // Wait before retry
          if (!profileCreated && retryCount < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }

        // Final verification that profile exists for admin panel
        if (profileCreated) {
          const { data: verifyProfile, error: verifyError } = await this.supabase
            .from('user_profiles')
            .select('id, email, approval_status, status, created_at')
            .eq('id', data.user.id)
            .single();

          if (verifyError) {
            console.error('🚨 CRITICAL: Could not verify profile creation for admin panel:', verifyError);
            console.error('🚨 USER MIGHT NOT APPEAR IN ADMIN PANEL!');
          } else {
            console.log('✅ Profile creation verified for admin panel:', {
              userId: verifyProfile.id,
              email: verifyProfile.email,
              approvalStatus: verifyProfile.approval_status,
              status: verifyProfile.status,
              createdAt: verifyProfile.created_at
            });
          }
        } else {
          console.error('🚨 CRITICAL: Failed to create user profile after all attempts!');
          console.error('🚨 USER WILL NOT APPEAR IN ADMIN PANEL!');
          console.error('🚨 Please check database permissions and triggers.');
        }

      } catch (profileError) {
        console.error('💥 CRITICAL ERROR in profile creation process:', profileError);
        console.error('🚨 USER MIGHT NOT APPEAR IN ADMIN PANEL!');
        // Don't fail signup, but this is a serious issue for admin visibility
      }
    }

    // Send admin notification via API route (enhanced with profile verification)
    if (data.user && typeof window !== 'undefined') {
      try {
        console.log('📧 Sending admin notification for new user:', email);

        const notificationPromise = fetch('/api/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'new_user_registration',
            data: {
              email: data.user.email || email,
              userId: data.user.id,
              registrationDate: data.user.created_at || new Date().toISOString(),
              userAgent: navigator.userAgent,
              ipAddress: 'unknown',
              profileCreationMethod: 'enhanced_with_verification'
            }
          })
        });

        // Don't wait for notification to complete signup process
        notificationPromise
          .then(() => {
            console.log('📧 Admin notification sent successfully for new user:', email);
          })
          .catch(emailError => {
            console.warn('📧 Failed to send admin notification (non-blocking):', emailError);
          });

      } catch (emailError) {
        console.warn('📧 Email notification error (non-blocking):', emailError);
      }
    }

    console.log('🎉 Enhanced user registration completed for admin panel visibility:', email);
    return data
  }

  async signIn(email: string, password: string) {
    if (!this.checkAuthEnabled()) {
      // Demo mode - simulate successful login for any valid email/password
      console.warn('Demo mode: Simulating login for', email);

      // Basic validation
      if (!email || !password || password.length < 6) {
        throw new Error('Please enter a valid email and password (minimum 6 characters)')
      }

      const userId = 'demo-user-' + email.replace(/[^a-zA-Z0-9]/g, '-');

      return {
        user: {
          id: userId,
          email: email,
          email_confirmed_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        },
        session: {
          user: {
            id: userId,
            email: email,
            email_confirmed_at: new Date().toISOString()
          }
        }
      }
    }

    if (!this.supabase) {
      throw new Error('Authentication service not available')
    }

    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      console.error('❌ Login error:', error);

      // Handle specific error cases
      if (error.message?.includes('Email not confirmed')) {
        throw new Error('Please check your email and click the confirmation link before logging in. Check your spam folder if you don\'t see the email.');
      } else if (error.message?.includes('email_not_confirmed')) {
        throw new Error('Your email address needs to be verified. Please check your email for a confirmation link.');
      } else if (error.message?.includes('signup_disabled')) {
        throw new Error('User registration is currently disabled. Please contact support.');
      } else if (error.message?.includes('Invalid login credentials')) {
        throw new Error('Invalid email or password. Please check your credentials and try again.');
      }

      throw error;
    }

    // Additional check: ensure user has confirmed email
    if (data.user && !data.user.email_confirmed_at) {
      console.warn('⚠️ User attempted login without email confirmation:', data.user.email);
      throw new Error('Please confirm your email address before logging in. Check your email for a confirmation link.');
    }

    console.log('✅ Login successful for confirmed user:', data.user?.email);
    return data
  }

  async getCurrentUser() {
    if (!this.checkAuthEnabled()) {
      // In demo mode, try to get demo user from localStorage or return null
      if (typeof window !== 'undefined') {
        const demoEmail = localStorage.getItem('demo-user-email')
        if (demoEmail) {
          return {
            id: 'demo-user-' + demoEmail.replace(/[^a-zA-Z0-9]/g, '-'),
            email: demoEmail,
            email_confirmed_at: new Date().toISOString(),
            created_at: new Date().toISOString()
          }
        }
      }
      return null
    }

    if (!this.supabase) {
      throw new Error('Authentication service not available')
    }

    const { data: { user } } = await this.supabase.auth.getUser()
    return user
  }

  async getCurrentSession() {
    if (!this.checkAuthEnabled()) {
      // Demo mode - return demo session if user exists
      const user = await this.getCurrentUser()
      if (user) {
        return {
          session: {
            user,
            access_token: 'demo-token',
            refresh_token: 'demo-refresh'
          }
        }
      }
      return { session: null }
    }

    if (!this.supabase) {
      throw new Error('Authentication service not available')
    }

    const { data, error } = await this.supabase.auth.getSession()
    if (error) throw error
    return data
  }

  async signOut() {
    if (!this.checkAuthEnabled()) {
      console.warn('Demo mode: Simulating logout')
      return { error: null }
    }

    if (!this.supabase) {
      throw new Error('Authentication service not available')
    }

    const { error } = await this.supabase.auth.signOut()
    if (error) throw error
  }

  async getUserProfile(userId?: string) {
    if (!this.checkAuthEnabled()) {
      // Demo mode - return a demo profile
      const currentUser = await this.getCurrentUser()
      if (currentUser) {
        return {
          id: currentUser.id,
          email: currentUser.email,
          status: 'active',
          subscription_status: 'trial',
          approval_status: 'approved', // Demo users are always approved
          created_at: currentUser.created_at,
          total_trades: 42,
          is_admin: currentUser.email === 'admin@demo.com'
        }
      }
      return null
    }

    const user = userId ? { id: userId } : await this.getCurrentUser()
    if (!user) return null

    if (!this.supabase) {
      throw new Error('Authentication service not available')
    }

    const { data, error } = await this.supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('Error fetching user profile:', error)
      return null
    }

    return data
  }

  async canUserAccessAnalyzer(forceRefresh = false) {
    if (!this.checkAuthEnabled() || !this.supabase) {
      return { canAccess: true } // Allow access when auth is disabled
    }

    const user = await this.getCurrentUser()
    if (!user) {
      return { canAccess: false, reason: 'Access requires authentication' }
    }

    try {
      const profile = await this.getUserProfile(user.id)

      if (!profile) {
        return { canAccess: false, reason: 'User profile not found. Please contact support.' }
      }

      console.log('🔍 Access check for user:', {
        userId: user.id,
        email: user.email,
        approvalStatus: profile.approval_status,
        accountStatus: profile.status,
        forceRefresh
      });

      if (profile.approval_status === 'pending') {
        return {
          canAccess: false,
          reason: 'Your account is pending admin approval. You will receive an email notification once approved.'
        }
      }

      if (profile.approval_status === 'rejected') {
        return {
          canAccess: false,
          reason: 'Your account access has been denied. Please contact support for more information.'
        }
      }

      if (profile.approval_status !== 'approved') {
        return {
          canAccess: false,
          reason: 'Your account status is unclear. Please contact support.'
        }
      }

      // Additional checks for approved users
      if (profile.status === 'suspended') {
        return {
          canAccess: false,
          reason: 'Your account is temporarily suspended. Please contact support.'
        }
      }

      if (profile.status === 'terminated') {
        return {
          canAccess: false,
          reason: 'Your account has been terminated. Please contact support.'
        }
      }

      console.log('✅ Access granted for user:', user.email);
      return { canAccess: true }
    } catch (error) {
      console.error('Error checking analyzer access:', error)
      return {
        canAccess: false,
        reason: 'Unable to verify account status. Please try again later.'
      }
    }
  }

  async updatePassword(newPassword: string) {
    if (!this.checkAuthEnabled()) {
      // Demo mode - simulate password update
      console.warn('Demo mode: Simulating password update')
      return { error: null }
    }

    if (!newPassword || newPassword.length < 6) {
      throw new Error('Password must be at least 6 characters long')
    }

    if (!this.supabase) {
      throw new Error('Authentication service not available')
    }

    const { data, error } = await this.supabase.auth.updateUser({
      password: newPassword
    })

    if (error) throw error
    return data
  }

  async refreshUserSession() {
    if (!this.checkAuthEnabled()) {
      // Demo mode - return demo session refresh
      console.warn('Demo mode: Simulating session refresh')
      const user = await this.getCurrentUser()
      if (user) {
        return {
          user,
          profile: {
            id: user.id,
            email: user.email,
            approval_status: 'approved',
            status: 'active'
          }
        }
      }
      return null
    }

    if (!this.supabase) {
      throw new Error('Authentication service not available')
    }

    try {
      const { data: { session }, error } = await this.supabase.auth.refreshSession()

      if (error) throw error

      if (session?.user) {
        const profile = await this.getUserProfile(session.user.id)
        return {
          user: session.user,
          profile
        }
      }

      return null
    } catch (error) {
      console.error('Session refresh error:', error)
      throw error
    }
  }
}

// Create and export singleton instance
export const clientAuthService = new ClientAuthService()
