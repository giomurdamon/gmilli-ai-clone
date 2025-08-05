import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;

    console.log('📧 Notification API called:', { type, userEmail: data?.email });

    // Initialize Supabase admin client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    if (type === 'new_user_registration') {
      console.log('📧 Processing notifications for new user:', data.email);

      // Log the notification in the database
      const { error: logError } = await supabase
        .from('user_activity')
        .insert({
          user_id: data.userId,
          action: 'notifications_sent',
          details: {
            type: 'new_user_registration',
            email: data.email,
            registrationDate: data.registrationDate,
            userAgent: data.userAgent,
            wasDeletedUser: data.wasDeletedUser || false,
            adminEmail: process.env.ADMIN_EMAIL
          }
        });

      if (logError) {
        console.warn('Failed to log notifications:', logError);
      }

      // Initialize Resend client
      console.log('📧 Initializing Resend with API key:', process.env.RESEND_API_KEY ? 'Present' : 'Missing');

      const emailResults = {
        userEmailSent: false,
        adminEmailSent: false,
        userError: null as string | null,
        adminError: null as string | null
      };

      // Only proceed if Resend API key is configured
      if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 're_YourResendAPIKey_GetFromResendDashboard') {
        console.error('❌ Resend API key not configured properly');
        return NextResponse.json({
          success: false,
          error: 'Email service not configured',
          emailResults
        }, { status: 500 });
      }

      const resend = new Resend(process.env.RESEND_API_KEY);

      // 📧 SEND WELCOME EMAIL TO USER
      try {
        console.log('📧 Sending welcome email to:', data.email);
        const userEmailResult = await resend.emails.send({
          from: 'Gmilli AI <onboarding@resend.dev>',
          to: [data.email],
          subject: '🎉 Welcome to Gmilli AI Trading Platform!',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc; border-radius: 10px;">
              <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 30px; border-radius: 10px; color: white; text-align: center;">
                <h1 style="color: #38bdf8; margin: 0 0 10px 0;">🎉 Welcome to Gmilli AI!</h1>
                <p style="font-size: 18px; margin: 0;">Your trading journey starts here</p>
              </div>

              <div style="padding: 30px; background: white; border-radius: 10px; margin-top: 20px;">
                <h2 style="color: #0f172a;">Dear Trader,</h2>
                <p>Thank you for registering with Gmilli AI! Your account has been created successfully.</p>

                <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="margin-top: 0; color: #0f172a;">📋 Account Status:</h3>
                  <p style="margin: 5px 0;">✅ Registration: <strong>Complete</strong></p>
                  <p style="margin: 5px 0;">✅ Login Access: <strong>Immediate</strong></p>
                  <p style="margin: 5px 0;">⏳ Trading Access: <strong>Pending admin approval</strong></p>
                </div>

                <h3 style="color: #0f172a;">🚀 Next Steps:</h3>
                <ol>
                  <li>Login at: <a href="https://gmillibot.com/login" style="color: #0ea5e9;">https://gmillibot.com/login</a></li>
                  <li>Explore the platform interface</li>
                  <li>Wait for approval email (usually within 24 hours)</li>
                  <li>Start trading once approved!</li>
                </ol>

                <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0ea5e9;">
                  <h4 style="margin-top: 0; color: #0f172a;">💡 Need Help?</h4>
                  <p style="margin: 5px 0;">📧 Support: <a href="mailto:${process.env.ADMIN_EMAIL}" style="color: #0ea5e9;">${process.env.ADMIN_EMAIL}</a></p>
                  <p style="margin: 5px 0;">🌐 Platform: <a href="https://gmillibot.com" style="color: #0ea5e9;">https://gmillibot.com</a></p>
                </div>

                <p style="margin-top: 30px;">Best regards,<br><strong>The Gmilli AI Team</strong></p>
              </div>
            </div>
          `
        });

        emailResults.userEmailSent = true;
        console.log('✅ Welcome email sent to user:', data.email, 'Result:', userEmailResult);
      } catch (userEmailError) {
        emailResults.userError = userEmailError instanceof Error ? userEmailError.message : String(userEmailError);
        console.error('❌ Failed to send welcome email:', userEmailError);
      }

      // 📧 SEND ADMIN NOTIFICATION EMAIL
      try {
        if (!process.env.ADMIN_EMAIL) {
          console.error('❌ Admin email not configured');
          emailResults.adminError = 'Admin email not configured';
        } else {
          console.log('📧 Sending admin notification to:', process.env.ADMIN_EMAIL);
          const adminEmailResult = await resend.emails.send({
            from: 'Gmilli AI System <onboarding@resend.dev>',
            to: [process.env.ADMIN_EMAIL],
            subject: '🔔 New User Registration - Action Required',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fef3c7;">
                <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; border-radius: 10px; color: white; text-align: center;">
                  <h1 style="margin: 0 0 10px 0;">🔔 New User Registration Alert</h1>
                  <p style="font-size: 16px; margin: 0;">Admin approval required</p>
                </div>

                <div style="padding: 30px; background: white; border-radius: 10px; margin-top: 20px;">
                  <h2 style="color: #0f172a;">New User Needs Approval</h2>
                  <p>A new user has registered on Gmilli AI platform and needs your approval for trading access.</p>

                  <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0;">
                    <h3 style="margin-top: 0; color: #0f172a;">👤 User Details:</h3>
                    <p style="margin: 5px 0;"><strong>Email:</strong> ${data.email}</p>
                    <p style="margin: 5px 0;"><strong>User ID:</strong> ${data.userId}</p>
                    <p style="margin: 5px 0;"><strong>Registration:</strong> ${new Date(data.registrationDate).toLocaleDateString()} at ${new Date(data.registrationDate).toLocaleTimeString()}</p>
                    <p style="margin: 5px 0;"><strong>Status:</strong> <span style="background: #fef3c7; padding: 2px 8px; border-radius: 4px; color: #92400e;">Pending Approval</span></p>
                    ${data.wasDeletedUser ? '<p style="margin: 5px 0; color: #dc2626;"><strong>⚠️ Note:</strong> Previously deleted user re-registering</p>' : ''}
                  </div>

                  <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
                    <h3 style="margin-top: 0; color: #0f172a;">🎯 Admin Actions Required:</h3>
                    <ol style="margin: 10px 0;">
                      <li>Review user in admin panel</li>
                      <li>Approve or reject trading access</li>
                      <li>User will be automatically notified of your decision</li>
                    </ol>
                  </div>

                  <div style="text-align: center; margin: 30px 0;">
                    <a href="https://gmillibot.com/admin" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">🔗 Go to Admin Panel</a>
                  </div>

                  <div style="background: #f1f5f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <h4 style="margin-top: 0; color: #0f172a;">🔗 Quick Links:</h4>
                    <p style="margin: 5px 0;">• <a href="https://gmillibot.com/admin" style="color: #0ea5e9;">Admin Panel</a></p>
                    <p style="margin: 5px 0;">• <a href="https://gmillibot.com" style="color: #0ea5e9;">Platform Home</a></p>
                  </div>

                  <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
                    Time: ${new Date().toLocaleString()}<br>
                    This is an automated notification from Gmilli AI platform.
                  </p>
                </div>
              </div>
            `
          });

          emailResults.adminEmailSent = true;
          console.log('✅ Admin notification email sent to:', process.env.ADMIN_EMAIL, 'Result:', adminEmailResult);
        }
      } catch (adminEmailError) {
        emailResults.adminError = adminEmailError instanceof Error ? adminEmailError.message : String(adminEmailError);
        console.error('❌ Failed to send admin notification:', adminEmailError);
      }

      console.log('📧 Email processing complete:', emailResults);

      return NextResponse.json({
        success: true,
        message: 'Email notifications processed',
        userEmail: data.email,
        emailResults: emailResults,
        resendConfigured: true,
        adminEmail: process.env.ADMIN_EMAIL
      });
    }

    return NextResponse.json({ error: 'Unknown notification type' }, { status: 400 });
  } catch (error) {
    console.error('Notification API error:', error);
    return NextResponse.json({
      error: 'Failed to process notification',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
