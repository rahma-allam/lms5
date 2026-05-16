import nodemailer from "nodemailer";
import { logger } from "./logger.js";

function createTransport() {
  const host = process.env["SMTP_HOST"];
  const port = Number(process.env["SMTP_PORT"] ?? "587");
  const user = process.env["SMTP_USER"];
  const pass = process.env["SMTP_PASS"];
  if (!host || !user || !pass) return null;
  return nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } });
}

export async function sendPasswordResetEmail({
  to, resetLink, academyName, lang = "ar",
}: {
  to: string;
  resetLink: string;
  academyName: string;
  lang?: "ar" | "en";
}) {
  const subject =
    lang === "ar"
      ? `إعادة تعيين كلمة المرور — ${academyName}`
      : `Password Reset — ${academyName}`;

  const html =
    lang === "ar"
      ? `
<div dir="rtl" style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;background:#fafafa;border-radius:12px">
  <div style="background:linear-gradient(135deg,#6d28d9,#7c3aed);padding:20px 24px;border-radius:10px;margin-bottom:24px;text-align:center">
    <h1 style="color:white;margin:0;font-size:22px">🎓 NextEdu</h1>
    <p style="color:#e9d5ff;margin:4px 0 0;font-size:13px">منصة التعليم الذكي</p>
  </div>
  <h2 style="color:#1e1b4b;font-size:18px">إعادة تعيين كلمة المرور</h2>
  <p style="color:#374151;line-height:1.7">مرحباً،<br>
  تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك في <strong>${academyName}</strong>.<br>
  الرابط صالح لمدة <strong>ساعة واحدة</strong> فقط.</p>
  <div style="text-align:center;margin:28px 0">
    <a href="${resetLink}" style="background:linear-gradient(135deg,#6d28d9,#7c3aed);color:white;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:bold;font-size:15px;display:inline-block">
      🔑 إعادة تعيين كلمة المرور
    </a>
  </div>
  <p style="color:#6b7280;font-size:13px">أو انسخ هذا الرابط في متصفحك:<br>
  <span style="color:#6d28d9;word-break:break-all">${resetLink}</span></p>
  <p style="color:#9ca3af;font-size:12px;margin-top:24px;border-top:1px solid #e5e7eb;padding-top:16px">
  إذا لم تطلب إعادة تعيين كلمة المرور، تجاهل هذا البريد الإلكتروني بأمان.</p>
</div>`
      : `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;background:#fafafa;border-radius:12px">
  <div style="background:linear-gradient(135deg,#6d28d9,#7c3aed);padding:20px 24px;border-radius:10px;margin-bottom:24px;text-align:center">
    <h1 style="color:white;margin:0;font-size:22px">🎓 NextEdu</h1>
    <p style="color:#e9d5ff;margin:4px 0 0;font-size:13px">Smart Learning Platform</p>
  </div>
  <h2 style="color:#1e1b4b;font-size:18px">Password Reset</h2>
  <p style="color:#374151;line-height:1.7">Hello,<br>
  We received a request to reset the password for your account in <strong>${academyName}</strong>.<br>
  This link is valid for <strong>1 hour</strong> only.</p>
  <div style="text-align:center;margin:28px 0">
    <a href="${resetLink}" style="background:linear-gradient(135deg,#6d28d9,#7c3aed);color:white;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:bold;font-size:15px;display:inline-block">
      🔑 Reset Password
    </a>
  </div>
  <p style="color:#6b7280;font-size:13px">Or copy this link into your browser:<br>
  <span style="color:#6d28d9;word-break:break-all">${resetLink}</span></p>
  <p style="color:#9ca3af;font-size:12px;margin-top:24px;border-top:1px solid #e5e7eb;padding-top:16px">
  If you didn't request a password reset, you can safely ignore this email.</p>
</div>`;

  const transport = createTransport();

  if (!transport) {
    logger.info({ to, resetLink }, "📧 [DEV MODE] Password reset — no SMTP configured");
    return { devMode: true, resetLink };
  }

  const from = process.env["SMTP_FROM"] ?? `"${academyName}" <noreply@nextedu.com>`;
  await transport.sendMail({ from, to, subject, html });
  logger.info({ to }, "Password reset email sent");
  return { devMode: false };
}
