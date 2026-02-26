import { NextRequest, NextResponse } from 'next/server';
import { createSubmission } from '../../../lib/db';
import { sendNotificationEmail } from '../../../lib/mailer';
import { generatePseudonym } from '../../../lib/pseudonyms';
import { buildModerationUrl, getAppBaseUrl } from '../../../lib/admin-moderation';

const VALID_CATEGORIES = [
  'Comparison', 'Pricing', 'Tutorial', 'CRM', 'Templates',
  'Features', 'Integrations', 'API', 'Security', 'Industry', 'General',
];

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, category, author_email, honeypot } = body;

    // Honeypot check — bots fill hidden fields
    if (honeypot) {
      // Silently accept to not tip off bots
      return NextResponse.json({ success: true, message: 'Submission received!' });
    }

    // Validate required fields
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json({ success: false, error: 'Title is required' }, { status: 400 });
    }
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json({ success: false, error: 'Content is required' }, { status: 400 });
    }
    if (title.trim().length > 200) {
      return NextResponse.json({ success: false, error: 'Title must be under 200 characters' }, { status: 400 });
    }
    if (content.trim().length > 10000) {
      return NextResponse.json({ success: false, error: 'Content must be under 10,000 characters' }, { status: 400 });
    }

    const safeCategory = VALID_CATEGORIES.includes(category) ? category : 'General';
    const safeEmail = typeof author_email === 'string' ? author_email.trim().slice(0, 254) : '';
    const authorName = generatePseudonym();

    const submission = createSubmission(
      title.trim(),
      content.trim(),
      safeCategory,
      safeEmail,
      authorName,
    );

    const baseUrl = getAppBaseUrl(request.nextUrl.origin);
    const approveUrl = buildModerationUrl({
      baseUrl,
      type: 'submission',
      id: submission.id,
      action: 'approved',
    });
    const rejectUrl = buildModerationUrl({
      baseUrl,
      type: 'submission',
      id: submission.id,
      action: 'rejected',
    });

    const messageLines = [
      'A new submission was created and is awaiting review.',
      `ID: ${submission.id}`,
      `Category: ${submission.category}`,
      `Title: ${submission.title}`,
      `Author email: ${submission.author_email || '(not provided)'}`,
      `Author name: ${submission.author_name}`,
      '',
      'Content:',
      submission.content,
      '',
      `Approve: ${approveUrl}`,
      `Reject: ${rejectUrl}`,
    ];

    const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.5;color:#111">
        <h2 style="margin:0 0 12px">New Trouble on Mondays submission</h2>
        <p style="margin:0 0 8px"><strong>ID:</strong> ${submission.id}</p>
        <p style="margin:0 0 8px"><strong>Category:</strong> ${escapeHtml(submission.category)}</p>
        <p style="margin:0 0 8px"><strong>Title:</strong> ${escapeHtml(submission.title)}</p>
        <p style="margin:0 0 8px"><strong>Author email:</strong> ${escapeHtml(submission.author_email || '(not provided)')}</p>
        <p style="margin:0 0 8px"><strong>Author name:</strong> ${escapeHtml(submission.author_name)}</p>
        <p style="margin:12px 0 6px"><strong>Content:</strong></p>
        <pre style="white-space:pre-wrap;background:#f7f7f7;padding:12px;border-radius:6px">${escapeHtml(submission.content)}</pre>
        <p style="margin:16px 0 10px"><strong>Moderation actions:</strong></p>
        <p style="margin:0 0 16px">
          <a href="${approveUrl}" style="display:inline-block;padding:10px 14px;border-radius:6px;background:#147a2f;color:#fff;text-decoration:none;margin-right:8px">Approve</a>
          <a href="${rejectUrl}" style="display:inline-block;padding:10px 14px;border-radius:6px;background:#a41515;color:#fff;text-decoration:none">Reject</a>
        </p>
        <p style="margin:0 0 4px">Fallback links:</p>
        <p style="margin:0"><a href="${approveUrl}">${approveUrl}</a></p>
        <p style="margin:0"><a href="${rejectUrl}">${rejectUrl}</a></p>
      </div>
    `;

    sendNotificationEmail(
      `New Trouble on Mondays submission (#${submission.id})`,
      messageLines.join('\n'),
      html,
    ).catch((error) => {
      console.error('Submission notification failed', error);
    });

    return NextResponse.json({
      success: true,
      message: 'Submission received! It will appear after review.',
      id: submission.id,
      author_name: submission.author_name,
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Something went wrong' }, { status: 500 });
  }
}
