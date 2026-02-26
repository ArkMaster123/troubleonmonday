import { NextRequest, NextResponse } from 'next/server';
import { createAnswer } from '../../../lib/db';
import { sendNotificationEmail } from '../../../lib/mailer';
import { generatePseudonym } from '../../../lib/pseudonyms';
import { buildModerationUrl, getAppBaseUrl } from '../../../lib/admin-moderation';
import threads from '../../data/threads.json';

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
    const { thread_id, content, author_email, honeypot } = body;

    // Honeypot check — bots fill hidden fields
    if (honeypot) {
      // Silently accept to not tip off bots
      return NextResponse.json({ success: true, message: 'Answer received!' });
    }

    // Validate thread exists
    const thread = threads.find((t) => t.id === thread_id);
    if (!thread) {
      return NextResponse.json({ success: false, error: 'Thread not found' }, { status: 404 });
    }

    // Validate required fields
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json({ success: false, error: 'Answer content is required' }, { status: 400 });
    }
    if (content.trim().length > 10000) {
      return NextResponse.json({ success: false, error: 'Answer must be under 10,000 characters' }, { status: 400 });
    }

    const safeEmail = typeof author_email === 'string' ? author_email.trim().slice(0, 254) : '';
    const authorName = generatePseudonym();

    const answer = createAnswer(
      thread_id,
      content.trim(),
      safeEmail,
      authorName,
    );

    const baseUrl = getAppBaseUrl(request.nextUrl.origin);
    const approveUrl = buildModerationUrl({
      baseUrl,
      type: 'answer',
      id: answer.id,
      action: 'approved',
    });
    const rejectUrl = buildModerationUrl({
      baseUrl,
      type: 'answer',
      id: answer.id,
      action: 'rejected',
    });

    const messageLines = [
      'A new answer was created and is awaiting review.',
      `Answer ID: ${answer.id}`,
      `Thread ID: ${answer.thread_id}`,
      `Thread title: ${thread.title}`,
      `Author email: ${answer.author_email || '(not provided)'}`,
      `Author name: ${answer.author_name}`,
      '',
      'Content:',
      answer.content,
      '',
      `Approve: ${approveUrl}`,
      `Reject: ${rejectUrl}`,
    ];

    const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.5;color:#111">
        <h2 style="margin:0 0 12px">New Trouble on Mondays answer</h2>
        <p style="margin:0 0 8px"><strong>Answer ID:</strong> ${answer.id}</p>
        <p style="margin:0 0 8px"><strong>Thread ID:</strong> ${escapeHtml(answer.thread_id)}</p>
        <p style="margin:0 0 8px"><strong>Thread title:</strong> ${escapeHtml(thread.title)}</p>
        <p style="margin:0 0 8px"><strong>Author email:</strong> ${escapeHtml(answer.author_email || '(not provided)')}</p>
        <p style="margin:0 0 8px"><strong>Author name:</strong> ${escapeHtml(answer.author_name)}</p>
        <p style="margin:12px 0 6px"><strong>Content:</strong></p>
        <pre style="white-space:pre-wrap;background:#f7f7f7;padding:12px;border-radius:6px">${escapeHtml(answer.content)}</pre>
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
      `New Trouble on Mondays answer (#${answer.id})`,
      messageLines.join('\n'),
      html,
    ).catch((error) => {
      console.error('Answer notification failed', error);
    });

    return NextResponse.json({
      success: true,
      message: 'Answer received! It will appear after review.',
      id: answer.id,
      author_name: answer.author_name,
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Something went wrong' }, { status: 500 });
  }
}
