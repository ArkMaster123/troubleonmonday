import { NextRequest, NextResponse } from 'next/server';
import { updateAnswerStatus, updateSubmissionStatus } from '../../../../lib/db';
import { verifyModerationToken } from '../../../../lib/admin-moderation';

function htmlPage(title: string, message: string): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
  </head>
  <body style="font-family:Arial,sans-serif;padding:24px;color:#111;line-height:1.5">
    <h1 style="margin:0 0 12px">${title}</h1>
    <p style="margin:0">${message}</p>
  </body>
</html>`;
}

function htmlResponse(status: number, title: string, message: string): NextResponse {
  return new NextResponse(htmlPage(title, message), {
    status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  if (!token) {
    return htmlResponse(400, 'Moderation failed', 'Missing moderation token.');
  }

  const result = verifyModerationToken(token);
  if (!result.valid) {
    return htmlResponse(400, 'Moderation failed', result.reason);
  }

  const {
    payload: { type, id, action },
  } = result;

  const updated =
    type === 'submission'
      ? updateSubmissionStatus(id, action)
      : updateAnswerStatus(id, action);

  if (!updated) {
    return htmlResponse(
      404,
      'Moderation failed',
      `${type} #${id} was not found or could not be updated.`,
    );
  }

  return htmlResponse(200, 'Moderation updated', `${type} #${id} has been marked as ${action}.`);
}
