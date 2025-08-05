import { supabase, supabaseAdmin, isAuthEnabled, getSiteUrl, UserProfile } from './supabase'
import { sendCustomConfirmationEmail } from './emailService'
import { createHash } from 'crypto'

class AuthService {
  private supabase = supabase
  private supabaseAdmin = supabaseAdmin

  private getSiteUrl(): string {
    return getSiteUrl()
  }

  private checkAuthEnabled() {
    if (!isAuthEnabled || !this.supabase) {
      console.warn('Demo mode: Supabase not configured, using demo authentication')
      return false
    }
    return true
  }

  // User Authentication
  async signUp(email: string, password: string) {
    if (!this.checkAuthEnabled() || !this.supabase) {
      throw new Error('Email service is currently unavailable. Please try again later or contact support.');
    }

    console.log('🔧 Starting user registration for:', email);

    // Check if this email was previously deleted (for tracking purposes)
    let wasDeletedUser = false;
    if (supabaseAdmin) {
      try {
        const { data: activityCheck } = await supabaseAdmin
          .from('user_activity')
          .select('action, details')
          .eq('action', 'user_deleted')
          .like('details->>email', `%${email}%`)
          .limit(1);

        if (activityCheck && activityCheck.length > 0) {
          wasDeletedUser = true;
          console.log('🔄 Detected re-registration by previously deleted user:', email);
        }
      } catch (checkError) {
        console.warn('Unable to check for previous deletion:', checkError);
      }
    }

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

    // DO NOT auto-confirm email - user must verify via email link
    // Remove auto-confirmation logic to require proper email verification
    console.log('📧 Email confirmation required for:', data.user?.email);

    // CRITICAL: Create user profile in database for admin panel
    if (data.user && supabaseAdmin) {
      try {
        console.log('🔧 Creating user profile for:', data.user.email, 'ID:', data.user.id);

        // Check if profile already exists
        const { data: existingProfile } = await supabaseAdmin
          .from('user_profiles')
          .select('id')
          .eq('id', data.user.id)
          .single();

        if (existingProfile) {
          console.log('ℹ️ User profile already exists for:', data.user.email);
        } else {
          // Create new profile
          const { error: profileError } = await supabaseAdmin
            .from('user_profiles')
            .insert({
              id: data.user.id,
              email: data.user.email,
              status: 'active',
              subscription_status: 'trial',
              approval_status: 'pending', // IMPORTANT: New users start as pending
              created_at: data.user.created_at,
              total_trades: 0,
              is_admin: false
            });

          if (profileError) {
            console.error('❌ CRITICAL: Failed to create user profile:', {
              error: profileError,
              code: profileError.code,
              message: profileError.message,
              userId: data.user.id,
              email: data.user.email
            });

            // This is critical - if we can't create the profile, the admin panel won't show the user
            console.error('🚨 USER WILL NOT APPEAR IN ADMIN PANEL!');

            // Don't fail signup, but log this as a critical issue
          } else {
            console.log('✅ User profile created successfully for:', data.user.email);

            // Verify the profile was created
            const { data: verifyProfile, error: verifyError } = await supabaseAdmin
              .from('user_profiles')
              .select('id, email, approval_status')
              .eq('id', data.user.id)
              .single();

            if (verifyError) {
              console.error('⚠️ Could not verify profile creation:', verifyError);
            } else {
              console.log('✅ Profile creation verified:', verifyProfile);
            }
          }
        }

        // Log re-registration if this is a returning deleted user
        if (wasDeletedUser) {
          await supabaseAdmin
            .from('user_activity')
            .insert({
              user_id: data.user.id,
              action: 'user_re_registered',
              details: {
                email: data.user.email,
                previous_deletion_detected: true,
                registration_timestamp: new Date().toISOString()
              }
            });
          console.log('🔄 Logged re-registration for previously deleted user:', email);
        }
      } catch (profileError) {
        console.error('💥 CRITICAL ERROR creating user profile:', profileError);
        // Don't fail signup, but this is a serious issue
      }
    }

    // Send admin notification email for new user registration
    if (data.user) {
      try {
        console.log('📧 Sending admin notification for new user:', email);

        // Send notification via API route (client-safe) - don't await to avoid blocking signup
        if (typeof window !== 'undefined') {
          fetch('/api/notifications', {
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
                wasDeletedUser: wasDeletedUser // Flag for admin notification
              }
            })
          }).then(() => {
            console.log('📧 Admin notification sent for new user:', email);
          }).catch(emailError => {
            console.warn('📧 Failed to send admin notification:', emailError);
          });
        }
      } catch (emailError) {
        console.warn('📧 Email notification error (non-blocking):', emailError);
        // Don't fail signup if email fails
      }
    }

    console.log('🎉 User registration completed successfully for:', email);
    return data
  }

  async signUpWithCustomEmail(email: string, password: string) {
    console.log('🔧 Custom signup with Resend email for:', email);

    if (!this.checkAuthEnabled()) {
      // Demo mode - use regular signup
      return this.signUp(email, password);
    }

    if (!this.supabase || !this.supabaseAdmin) {
      throw new Error('Authentication service not available');
    }

    // Check if user already exists
    try {
      if (this.supabaseAdmin) {
        const { data: existingUser } = await this.supabaseAdmin
          .from('user_profiles')
          .select('id, email')
          .eq('email', email)
          .single();

        if (existingUser) {
          throw new Error('User already exists with this email address');
        }
      }
    } catch (checkError: any) {
      if (!checkError.message?.includes('No rows')) {
        console.warn('Unable to check for existing user:', checkError);
      }
    }

    // Create user with email confirmation disabled initially
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        // Disable automatic email confirmation
        emailRedirectTo: undefined,
        captchaToken: undefined,
        data: {
          email_confirmed: false
        }
      }
    });

    if (error) {
      console.error('❌ Signup error:', error);
      throw error;
    }

    if (!data.user) {
      throw new Error('Failed to create user account');
    }

    console.log('✅ User created, sending custom confirmation email');

    // Generate custom confirmation token
    const confirmationToken = createHash('sha256').update(`${data.user.id}-${Date.now()}`).digest('hex');

    // Store token in user metadata or database for verification
    if (this.supabaseAdmin) {
      try {
        await this.supabaseAdmin
          .from('user_profiles')
          .upsert({
            id: data.user.id,
            email: data.user.email,
            status: 'active',
            subscription_status: 'trial',
            approval_status: 'pending',
            created_at: data.user.created_at,
            total_trades: 0,
            is_admin: false,
            confirmation_token: confirmationToken,
            email_confirmed: false
          });
      } catch (dbError) {
        console.error('❌ Database error creating profile:', dbError);
      }
    }

    // Send custom confirmation email via Resend
    const confirmationUrl = `${this.getSiteUrl()}/auth/callback?type=signup&token=${confirmationToken}&user_id=${data.user.id}`;

    try {
      const emailResult = await sendCustomConfirmationEmail(email, confirmationUrl);
      if (!emailResult.success) {
        console.error('❌ Failed to send custom confirmation email:', emailResult.error);
        // Don't fail signup if email fails, but log it
      } else {
        console.log('✅ Custom confirmation email sent successfully');
      }
    } catch (emailError) {
      console.error('❌ Email sending error:', emailError);
    }

    console.log('🎉 Custom signup completed successfully for:', email);
    return data;
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

  async getUserProfile(userId?: string): Promise<UserProfile | null> {
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
        } as UserProfile
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

  async canUserTrade(user?: any): Promise<boolean> {
    if (!this.checkAuthEnabled()) {
      return true // Demo mode - always allow trading
    }

    const currentUser = user || await this.getCurrentUser()
    if (!currentUser) return false

    if (!this.supabase) {
      throw new Error('Authentication service not available')
    }

    const { data, error } = await this.supabase
      .rpc('can_user_trade', { user_uuid: user.id })

    if (error) throw error
    return data
  }

  async canUserAccessAnalyzer(forceRefresh = false): Promise<{ canAccess: boolean; reason?: string }> {
    if (!isAuthEnabled || !this.supabase) {
      return { canAccess: true } // Allow access when auth is disabled
    }

    const user = await this.getCurrentUser()
    if (!user) {
      return { canAccess: false, reason: 'Access requires authentication' }
    }

    try {
      let profile;
      if (forceRefresh && supabaseAdmin) {
        // Force fresh data from database using admin client to bypass any caching
        console.log('🔄 Force refresh: Getting fresh profile data from database for user:', user.id);
        const { data, error } = await supabaseAdmin
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (error) {
          console.error('🔄 Force refresh error:', error);
          throw error;
        }
        profile = data;
        console.log('🔄 Force refresh result:', {
          userId: user.id,
          email: user.email,
          approvalStatus: profile?.approval_status,
          accountStatus: profile?.status,
          approvedAt: profile?.approved_at
        });
      } else {
        profile = await this.getUserProfile(user.id)
      }

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

    try {
      const { data, error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${this.getSiteUrl()}/auth/callback?type=recovery`
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
export const authService = new AuthService()
