import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Custom email confirmation using Resend to bypass Supabase Site URL issues
export async function sendCustomConfirmationEmail(email: string, confirmationUrl: string) {
  try {
    console.log('📧 Sending custom confirmation email via Resend to:', email);
    console.log('🔗 Confirmation URL:', confirmationUrl);

    const { data, error } = await resend.emails.send({
      from: 'Gmilli AI <noreply@gmillibot.com>',
      to: [email],
      subject: '📧 Confirm Your Gmilli AI Account',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Confirm Your Account - Gmilli AI</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%); padding: 30px; border-radius: 10px; margin-bottom: 30px;">
            <h1 style="color: #38BDF8; margin: 0; text-align: center; font-size: 28px;">
              🚀 Welcome to Gmilli AI!
            </h1>
          </div>

          <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
            <h2 style="color: #0F172A; margin-top: 0;">📧 Confirm Your Email Address</h2>
            <p style="font-size: 16px; color: #374151;">
              Thank you for signing up for Gmilli AI! To complete your registration and start trading, please confirm your email address by clicking the button below:
            </p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${confirmationUrl}"
                 style="background: #38BDF8; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
                ✅ Confirm Email Address
              </a>
            </div>

            <p style="font-size: 14px; color: #6B7280; margin-top: 30px;">
              <strong>Important:</strong> This link will expire in 24 hours for security reasons.
            </p>

            <p style="font-size: 14px; color: #6B7280;">
              If the button doesn't work, you can copy and paste this link into your browser:<br>
              <a href="${confirmationUrl}" style="color: #38BDF8; word-break: break-all;">${confirmationUrl}</a>
            </p>
          </div>

          <div style="background: #EBF8FF; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
            <h3 style="color: #1E40AF; margin-top: 0; font-size: 18px;">🎯 What's Next?</h3>
            <ul style="color: #374151; margin: 10px 0;">
              <li>Click the confirmation link above</li>
              <li>Return to <a href="https://gmillibot.com/login" style="color: #38BDF8;">gmillibot.com/login</a></li>
              <li>Sign in with your email and password</li>
              <li>Start trading with our AI-powered platform!</li>
            </ul>
          </div>

          <div style="text-align: center; padding: 20px; background: #F3F4F6; border-radius: 8px;">
            <p style="margin: 0; color: #6B7280; font-size: 14px;">
              Need help? Contact us at <a href="mailto:support@gmillibot.com" style="color: #38BDF8;">support@gmillibot.com</a>
            </p>
            <p style="margin: 10px 0 0 0; color: #9CA3AF; font-size: 12px;">
              © 2025 Gmilli AI. All rights reserved.
            </p>
          </div>
        </body>
        </html>
      `,
      text: `
Welcome to Gmilli AI!

Please confirm your email address by visiting this link:
${confirmationUrl}

This link will expire in 24 hours for security reasons.

After confirming your email:
1. Visit https://gmillibot.com/login
2. Sign in with your email and password
3. Start trading with our AI-powered platform!

Need help? Contact us at support@gmillibot.com

© 2025 Gmilli AI. All rights reserved.
      `
    });

    if (error) {
      console.error('❌ Resend email error:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Custom confirmation email sent successfully via Resend');
    return { success: true, data };

  } catch (error: any) {
    console.error('💥 Custom email sending error:', error);
    return { success: false, error: error.message };
  }
}
