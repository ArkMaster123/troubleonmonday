import { NextRequest, NextResponse } from 'next/server';
import { getAllSubmissions, updateSubmissionStatus } from '../../../../lib/db';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'troubleadmin2024';

function checkAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return false;
  const password = authHeader.replace('Bearer ', '');
  return password === ADMIN_PASSWORD;
}

export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const submissions = getAllSubmissions();
  return NextResponse.json({ submissions });
}

export async function PATCH(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, status } = body as { id?: unknown; status?: unknown };
    const submissionId = Number(id);
    const allowedStatuses = new Set(['approved', 'rejected']);

    if (!Number.isFinite(submissionId) || !Number.isInteger(submissionId) || submissionId <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid submission id. Expected a positive integer.' },
        { status: 400 }
      );
    }

    if (typeof status !== 'string' || !allowedStatuses.has(status)) {
      return NextResponse.json(
        { success: false, error: "Invalid status. Expected 'approved' or 'rejected'." },
        { status: 400 }
      );
    }

    const updated = updateSubmissionStatus(submissionId, status as 'approved' | 'rejected');
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Submission not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, id: submissionId, status });
  } catch {
    return NextResponse.json({ success: false, error: 'Something went wrong' }, { status: 500 });
  }
}
