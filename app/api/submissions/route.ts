import { NextRequest, NextResponse } from 'next/server';
import { createSubmission } from '../../../lib/db';

const VALID_CATEGORIES = [
  'Comparison', 'Pricing', 'Tutorial', 'CRM', 'Templates',
  'Features', 'Integrations', 'API', 'Security', 'Industry', 'General',
];

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

    const submission = createSubmission(
      title.trim(),
      content.trim(),
      safeCategory,
      safeEmail,
    );

    return NextResponse.json({ success: true, message: 'Submission received! It will appear after review.', id: submission.id });
  } catch {
    return NextResponse.json({ success: false, error: 'Something went wrong' }, { status: 500 });
  }
}
