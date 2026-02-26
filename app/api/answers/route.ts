import { NextRequest, NextResponse } from 'next/server';
import { createAnswer } from '../../../lib/db';
import { sendNotificationEmail } from '../../../lib/mailer';
import { generatePseudonym } from '../../../lib/pseudonyms';
import threads from '../../data/threads.json';

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

    sendNotificationEmail(
      `New Trouble on Mondays answer (#${answer.id})`,
      [
        'A new answer was created and is awaiting review.',
        `Answer ID: ${answer.id}`,
        `Thread ID: ${answer.thread_id}`,
        `Thread title: ${thread.title}`,
        `Author email: ${answer.author_email || '(not provided)'}`,
        `Author name: ${answer.author_name}`,
        '',
        'Content:',
        answer.content,
      ].join('\n'),
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
