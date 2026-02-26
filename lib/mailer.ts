import nodemailer from 'nodemailer';

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = Number(process.env.SMTP_PORT || '465');
const SMTP_SECURE = (process.env.SMTP_SECURE || 'true').toLowerCase() === 'true';
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL;

function hasMailConfig(): boolean {
  return Boolean(SMTP_USER && SMTP_PASS && NOTIFY_EMAIL);
}

export async function sendNotificationEmail(subject: string, body: string): Promise<void> {
  if (!hasMailConfig()) {
    console.warn('Email notifications skipped: missing SMTP or NOTIFY_EMAIL env vars');
    return;
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  console.log(`Attempting email notification: ${subject}`);

  await transporter.sendMail({
    from: `Trouble on Mondays <${SMTP_USER}>`,
    to: NOTIFY_EMAIL,
    subject,
    text: body,
  });

  console.log(`Email notification sent: ${subject}`);
}
