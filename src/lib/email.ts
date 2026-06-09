import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = "LifeOS <noreply@lifeos.app>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://lifeos.vercel.app";

// ── Welcome email ──────────────────────────────────────────────────────────
export async function sendWelcomeEmail(to: string, name: string) {
  if (!process.env.RESEND_API_KEY) return; // graceful no-op if not configured

  await resend.emails.send({
    from: FROM,
    to,
    subject: "Welcome to LifeOS 🚀",
    html: `
<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0f0f1a; color: #e2e8f0; margin: 0; padding: 0;">
  <div style="max-width: 560px; margin: 40px auto; padding: 40px; background: #1a1a2e; border-radius: 16px; border: 1px solid #2d2d4e;">
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="display: inline-flex; align-items: center; justify-content: center; width: 52px; height: 52px; background: #6366f1; border-radius: 12px; font-size: 24px; font-weight: bold; color: white; margin-bottom: 16px;">L</div>
      <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #f1f5f9;">Welcome to LifeOS</h1>
    </div>
    <p style="font-size: 16px; color: #94a3b8; line-height: 1.6;">Hi ${name || "there"},</p>
    <p style="font-size: 16px; color: #94a3b8; line-height: 1.6;">
      Your account is ready. LifeOS is your all-in-one personal operating system — one place to manage your habits, goals, journal, workouts, mood, and more.
    </p>
    <div style="margin: 32px 0;">
      <p style="font-size: 14px; font-weight: 600; color: #cbd5e1; margin-bottom: 12px;">Get started:</p>
      <ul style="font-size: 14px; color: #94a3b8; line-height: 2; padding-left: 20px; margin: 0;">
        <li>Add your first <strong style="color: #e2e8f0;">habit</strong></li>
        <li>Write your first <strong style="color: #e2e8f0;">journal entry</strong></li>
        <li>Set a <strong style="color: #e2e8f0;">goal</strong> for this month</li>
        <li>Log your <strong style="color: #e2e8f0;">mood</strong> today</li>
      </ul>
    </div>
    <div style="text-align: center; margin: 32px 0;">
      <a href="${APP_URL}/dashboard" style="display: inline-block; background: #6366f1; color: white; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 600; font-size: 15px;">Open LifeOS →</a>
    </div>
    <p style="font-size: 13px; color: #475569; text-align: center; margin-top: 32px; border-top: 1px solid #2d2d4e; padding-top: 24px;">
      You received this email because you created a LifeOS account.<br/>
      <a href="${APP_URL}/settings" style="color: #6366f1;">Manage email preferences</a>
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
    subject: "Reset your LifeOS password",
    html: `
<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0f0f1a; color: #e2e8f0; margin: 0; padding: 0;">
  <div style="max-width: 560px; margin: 40px auto; padding: 40px; background: #1a1a2e; border-radius: 16px; border: 1px solid #2d2d4e;">
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="display: inline-flex; align-items: center; justify-content: center; width: 52px; height: 52px; background: #6366f1; border-radius: 12px; font-size: 24px; font-weight: bold; color: white; margin-bottom: 16px;">L</div>
      <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #f1f5f9;">Reset your password</h1>
    </div>
    <p style="font-size: 16px; color: #94a3b8; line-height: 1.6;">
      We received a request to reset the password for your LifeOS account. Click the button below to choose a new password.
    </p>
    <div style="text-align: center; margin: 32px 0;">
      <a href="${resetUrl}" style="display: inline-block; background: #6366f1; color: white; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 600; font-size: 15px;">Reset Password →</a>
    </div>
    <p style="font-size: 14px; color: #64748b; line-height: 1.6;">
      This link expires in <strong>1 hour</strong>. If you didn't request a password reset, you can safely ignore this email — your password won't change.
    </p>
    <p style="font-size: 12px; color: #475569; word-break: break-all; margin-top: 16px;">
      Or copy this URL: ${resetUrl}
    </p>
    <p style="font-size: 13px; color: #475569; text-align: center; margin-top: 32px; border-top: 1px solid #2d2d4e; padding-top: 24px;">
      LifeOS · <a href="${APP_URL}" style="color: #6366f1;">lifeos.app</a>
    </p>
  </div>
</body>
</html>`,
  });
}
