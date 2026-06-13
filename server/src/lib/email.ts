// ============================================================
// Email Service — Nodemailer + Templates
// ============================================================

import nodemailer from 'nodemailer';
import { logger } from './logger.js';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    if (!process.env.SMTP_USER) {
      logger.warn(`Email not sent (SMTP not configured): ${options.subject} -> ${options.to}`);
      return false;
    }
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"InfluenceAI" <noreply@influenceai.com>',
      ...options,
    });
    logger.info(`Email sent: ${options.subject} -> ${options.to}`);
    return true;
  } catch (err) {
    logger.error('Failed to send email:', err);
    return false;
  }
}

// ── Email Templates ──────────────────────────────────────────

function baseTemplate(content: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    body{font-family:Arial,sans-serif;background:#09090b;color:#e4e4e7;margin:0;padding:40px 20px}
    .container{max-width:600px;margin:0 auto;background:#18181b;border-radius:16px;padding:40px;border:1px solid rgba(255,255,255,0.1)}
    .logo{text-align:center;margin-bottom:30px;font-size:24px;font-weight:bold;background:linear-gradient(to right,#a855f7,#ec4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
    .btn{display:inline-block;padding:12px 32px;background:linear-gradient(to right,#9333ea,#db2777);color:#fff;text-decoration:none;border-radius:12px;font-weight:bold;margin:20px 0}
    .footer{text-align:center;margin-top:30px;color:#71717a;font-size:12px}
    h2{color:#fff;margin-top:0} p{line-height:1.6;color:#a1a1aa}
  </style></head><body><div class="container"><div class="logo">InfluenceAI</div>${content}<div class="footer">© ${new Date().getFullYear()} InfluenceAI. All rights reserved.</div></div></body></html>`;
}

export function welcomeEmail(name: string): { subject: string; html: string } {
  return {
    subject: 'Welcome to InfluenceAI! 🚀',
    html: baseTemplate(`<h2>Welcome, ${name}!</h2><p>Your account has been created successfully. Start exploring the platform to discover the perfect influencer partnerships.</p><a href="${process.env.FRONTEND_URL}/dashboard" class="btn">Go to Dashboard</a>`),
  };
}

export function resetPasswordEmail(name: string, resetUrl: string): { subject: string; html: string } {
  return {
    subject: 'Reset Your Password — InfluenceAI',
    html: baseTemplate(`<h2>Password Reset</h2><p>Hi ${name}, we received a request to reset your password. Click the button below to set a new one. This link expires in 1 hour.</p><a href="${resetUrl}" class="btn">Reset Password</a><p>If you didn't request this, please ignore this email.</p>`),
  };
}

export function campaignInviteEmail(influencerName: string, brandName: string, campaignTitle: string): { subject: string; html: string } {
  return {
    subject: `${brandName} wants to collaborate! — ${campaignTitle}`,
    html: baseTemplate(`<h2>You've Been Invited!</h2><p>Hi ${influencerName}, <strong>${brandName}</strong> has invited you to collaborate on their campaign "<strong>${campaignTitle}</strong>".</p><a href="${process.env.FRONTEND_URL}/dashboard/invitations" class="btn">View Invitation</a>`),
  };
}

export function applicationUpdateEmail(name: string, campaignTitle: string, status: string): { subject: string; html: string } {
  return {
    subject: `Application ${status} — ${campaignTitle}`,
    html: baseTemplate(`<h2>Application Update</h2><p>Hi ${name}, your application for "<strong>${campaignTitle}</strong>" has been <strong>${status}</strong>.</p><a href="${process.env.FRONTEND_URL}/dashboard/applications" class="btn">View Details</a>`),
  };
}

export function paymentNotificationEmail(name: string, amount: number, description: string): { subject: string; html: string } {
  return {
    subject: `Payment Received: $${amount}`,
    html: baseTemplate(`<h2>Payment Received!</h2><p>Hi ${name}, you've received a payment of <strong>$${amount.toFixed(2)}</strong> for "${description}".</p><a href="${process.env.FRONTEND_URL}/dashboard" class="btn">View Dashboard</a>`),
  };
}
