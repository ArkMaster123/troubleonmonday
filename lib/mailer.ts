const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM = process.env.RESEND_FROM || 'noreply@bornandbrand.com';
const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL;

function hasMailConfig(): boolean {
  return Boolean(RESEND_API_KEY && NOTIFY_EMAIL);
}

function truncateText(value: string, maxLength = 500): string {
  return value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;
}

export async function sendNotificationEmail(subject: string, body: string): Promise<boolean> {
  if (!hasMailConfig()) {
    console.warn('Email notifications skipped: missing RESEND_API_KEY or NOTIFY_EMAIL env vars');
    return false;
  }

  console.log(`[mailer] Resend attempt: subject="${subject}" to="${NOTIFY_EMAIL}" from="${RESEND_FROM}"`);

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: RESEND_FROM,
        to: [NOTIFY_EMAIL],
        subject,
        text: body,
      }),
    });
    const responseBody = await response.text();

    if (!response.ok) {
      console.warn(
        `[mailer] Resend failed: status=${response.status} body="${truncateText(responseBody)}"`,
      );
      return false;
    }

    console.log(`[mailer] Resend sent: status=${response.status} subject="${subject}"`);
    return true;
  } catch (error) {
    console.warn('[mailer] Resend request failed', error);
    return false;
  }
}
