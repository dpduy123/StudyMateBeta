import nodemailer from 'nodemailer';

/**
 * Gmail SMTP Email Client
 *
 * This module is OPTIONAL - only needed if you want to send emails directly from your code
 * instead of using Supabase's built-in email service.
 *
 * For most cases, configuring Gmail SMTP in Supabase Dashboard is enough.
 * See: docs/QUICK-GMAIL-SMTP-SETUP.md
 */

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

/**
 * Send email using Gmail SMTP
 * @param options Email configuration
 * @returns Promise with email sending result
 */
export async function sendEmail(options: EmailOptions) {
  try {
    const { to, subject, html, from } = options;

    const transporter = createTransporter();

    const info = await transporter.sendMail({
      from: from || process.env.EMAIL_FROM || `StudyMate <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });

    console.log('✅ Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    return { success: false, error };
  }
}

/**
 * Send verification email to new users
 * @param email User's email address
 * @param verificationUrl Full verification URL with token
 */
export async function sendVerificationEmail(email: string, verificationUrl: string) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Xác Nhận Email - StudyMate</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">StudyMate</h1>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 40px;">
                    <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 600;">Xác Nhận Địa Chỉ Email</h2>

                    <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                      Cảm ơn bạn đã đăng ký StudyMate! Để hoàn tất đăng ký và bắt đầu tìm bạn học cùng, vui lòng xác nhận địa chỉ email của bạn.
                    </p>

                    <!-- CTA Button -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                      <tr>
                        <td align="center">
                          <a href="${verificationUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);">
                            Xác Nhận Email
                          </a>
                        </td>
                      </tr>
                    </table>

                    <p style="margin: 30px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                      Hoặc copy và paste link này vào trình duyệt:
                    </p>
                    <p style="margin: 10px 0 0; color: #667eea; font-size: 14px; word-break: break-all;">
                      ${verificationUrl}
                    </p>

                    <p style="margin: 30px 0 0; color: #9ca3af; font-size: 13px; line-height: 1.6;">
                      Link này sẽ hết hạn sau 24 giờ. Nếu bạn không tạo tài khoản StudyMate, bạn có thể bỏ qua email này.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; text-align: center;">
                    <p style="margin: 0; color: #9ca3af; font-size: 13px;">
                      © ${new Date().getFullYear()} StudyMate. Bản quyền đã được bảo hộ.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: 'Xác nhận tài khoản StudyMate của bạn',
    html,
  });
}

/**
 * Send password reset email
 * @param email User's email address
 * @param resetUrl Full password reset URL with token
 */
export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Đặt Lại Mật Khẩu - StudyMate</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">StudyMate</h1>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 40px;">
                    <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 600;">Đặt Lại Mật Khẩu</h2>

                    <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                      Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản StudyMate của bạn. Nhấn vào nút bên dưới để tạo mật khẩu mới.
                    </p>

                    <!-- CTA Button -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                      <tr>
                        <td align="center">
                          <a href="${resetUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);">
                            Đặt Lại Mật Khẩu
                          </a>
                        </td>
                      </tr>
                    </table>

                    <p style="margin: 30px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                      Hoặc copy và paste link này vào trình duyệt:
                    </p>
                    <p style="margin: 10px 0 0; color: #667eea; font-size: 14px; word-break: break-all;">
                      ${resetUrl}
                    </p>

                    <div style="margin: 30px 0; padding: 16px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
                      <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
                        <strong>Lưu ý bảo mật:</strong> Link này sẽ hết hạn sau 15 phút. Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này hoặc liên hệ hỗ trợ nếu có lo ngại.
                      </p>
                    </div>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; text-align: center;">
                    <p style="margin: 0; color: #9ca3af; font-size: 13px;">
                      © ${new Date().getFullYear()} StudyMate. Bản quyền đã được bảo hộ.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: 'Đặt lại mật khẩu StudyMate',
    html,
  });
}

/**
 * Test SMTP connection
 * @returns Promise with connection test result
 */
export async function testConnection() {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ Gmail SMTP connection successful');
    return { success: true };
  } catch (error) {
    console.error('❌ Gmail SMTP connection failed:', error);
    return { success: false, error };
  }
}
