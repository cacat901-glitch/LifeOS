import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = "Novus <noreply@novus.app>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://novus.vercel.app";

// ── Welcome email ──────────────────────────────────────────────────────────
export async function sendWelcomeEmail(to: string, name: string) {
  if (!process.env.RESEND_API_KEY) return; // graceful no-op if not configured

  await resend.emails.send({
    from: FROM,
    to,
    subject: "Welcome to Novus",
    html: `
<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #06060a; color: #e2e8f0; margin: 0; padding: 0;">
  <div style="max-width: 560px; margin: 40px auto; padding: 40px; background: #0d0d16; border-radius: 20px; border: 1px solid #1e1e2e;">
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="display: inline-flex; align-items: center; justify-content: center; width: 54px; height: 54px; background: linear-gradient(135deg, #6366f1, #a855f7); border-radius: 16px; font-size: 26px; font-weight: bold; color: white; margin-bottom: 16px;">N</div>
      <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #f1f5f9; letter-spacing: -0.02em;">Welcome to Novus</h1>
      <p style="margin: 8px 0 0; font-size: 15px; color: #818cf8;">Your personal operating system.</p>
    </div>
    <p style="font-size: 16px; color: #94a3b8; line-height: 1.6;">Hi ${name || "there"},</p>
    <p style="font-size: 16px; color: #94a3b8; line-height: 1.6;">
      Novus is your intelligent companion — a single, calm place to run every part of your life. Your habits, goals, journal, finances, workouts, and an AI that actually understands the bigger picture.
    </p>
    <div style="margin: 32px 0;">
      <p style="font-size: 14px; font-weight: 600; color: #cbd5e1; margin-bottom: 12px;">A few ways to begin:</p>
      <ul style="font-size: 14px; color: #94a3b8; line-height: 2; padding-left: 20px; margin: 0;">
        <li>Ask <strong style="color: #e2e8f0;">Novus AI</strong> what to focus on today</li>
        <li>Set a <strong style="color: #e2e8f0;">goal</strong> that matters to you</li>
        <li>Build your first <strong style="color: #e2e8f0;">habit</strong></li>
        <li>Open the command center with <strong style="color: #e2e8f0;">⌘K</strong></li>
      </ul>
    </div>
    <div style="text-align: center; margin: 32px 0;">
      <a href="${APP_URL}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #6366f1, #a855f7); color: white; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 600; font-size: 15px;">Enter Novus →</a>
    </div>
    <p style="font-size: 13px; color: #475569; text-align: center; margin-top: 32px; border-top: 1px solid #1e1e2e; padding-top: 24px;">
      You received this email because you created a Novus account.<br/>
      <a href="${APP_URL}/settings" style="color: #818cf8;">Manage email preferences</a>
    </p>
  </div>
</body>
</html>`,
  });
}

// ── Password reset email ───────────────────────────────────────────────────
export async function sendPasswordResetEmail(to: string, token: string) {
  if (!process.env.RESEND_API_KEY) return;

  const resetUrl = `${APP_URL}/auth/reset-password?token=${token}`;

  await resend.emails.send({
    from: FROM,
    to,
    subject: "Reset your Novus password",
    html: `
<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #06060a; color: #e2e8f0; margin: 0; padding: 0;">
  <div style="max-width: 560px; margin: 40px auto; padding: 40px; background: #0d0d16; border-radius: 20px; border: 1px solid #1e1e2e;">
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="display: inline-flex; align-items: center; justify-content: center; width: 54px; height: 54px; background: linear-gradient(135deg, #6366f1, #a855f7); border-radius: 16px; font-size: 26px; font-weight: bold; color: white; margin-bottom: 16px;">N</div>
      <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #f1f5f9; letter-spacing: -0.02em;">Reset your password</h1>
    </div>
    <p style="font-size: 16px; color: #94a3b8; line-height: 1.6;">
      We received a request to reset the password for your Novus account. Click the button below to choose a new password.
    </p>
    <div style="text-align: center; margin: 32px 0;">
      <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #6366f1, #a855f7); color: white; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 600; font-size: 15px;">Reset Password →</a>
    </div>
    <p style="font-size: 14px; color: #64748b; line-height: 1.6;">
      This link expires in <strong>1 hour</strong>. If you didn't request a password reset, you can safely ignore this email — your password won't change.
    </p>
    <p style="font-size: 12px; color: #475569; word-break: break-all; margin-top: 16px;">
      Or copy this URL: ${resetUrl}
    </p>
    <p style="font-size: 13px; color: #475569; text-align: center; margin-top: 32px; border-top: 1px solid #1e1e2e; padding-top: 24px;">
      Novus · <a href="${APP_URL}" style="color: #818cf8;">novus.app</a>
    </p>
  </div>
</body>
</html>`,
  });
}
