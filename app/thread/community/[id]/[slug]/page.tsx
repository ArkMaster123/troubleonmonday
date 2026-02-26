import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import AnswerForm from '@/app/components/AnswerForm';
import { getApprovedSubmissionById, getAnswersByThread } from '@/lib/db';
import { createTitleSlug } from '@/lib/slug';

interface CommunityThreadPageProps {
  params: Promise<{ id: string; slug: string }>;
}

function normalizeSubmissionId(rawId: string): number | null {
  const parsed = Number.parseInt(rawId, 10);
  if (!Number.isInteger(parsed) || parsed < 1) {
    return null;
  }
  return parsed;
}

export async function generateMetadata({ params }: CommunityThreadPageProps): Promise<Metadata> {
  const { id, slug } = await params;
  const submissionId = normalizeSubmissionId(id);
  if (!submissionId) return {};

  const submission = getApprovedSubmissionById(submissionId);
  if (!submission) return {};

  const canonicalSlug = createTitleSlug(submission.title);
  const canonicalPath = `/thread/community/${submission.id}/${canonicalSlug}/`;

  if (slug !== canonicalSlug) {
    return {
      title: `${submission.title} | Trouble on Mondays`,
      description: submission.content.slice(0, 160),
      alternates: {
        canonical: canonicalPath,
      },
    };
  }

  return {
    title: `${submission.title} | Trouble on Mondays`,
    description: submission.content.slice(0, 160),
    alternates: {
      canonical: canonicalPath,
    },
  };
}

export default async function CommunityThreadPage({ params }: CommunityThreadPageProps) {
  const { id, slug } = await params;
  const submissionId = normalizeSubmissionId(id);

  if (!submissionId) {
    notFound();
  }

  const submission = getApprovedSubmissionById(submissionId);
  if (!submission) {
    notFound();
  }

  const canonicalSlug = createTitleSlug(submission.title);
  const canonicalPath = `/thread/community/${submission.id}/${canonicalSlug}/`;
  if (slug !== canonicalSlug) {
    permanentRedirect(canonicalPath);
  }

  const answers = getAnswersByThread(`submission:${submission.id}`);

  return (
    <div className="max-w-[860px] mx-auto">
      <nav className="py-5">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-slate-400 dark:text-slate-500 text-[13px] font-medium hover:text-slate-900 dark:hover:text-slate-50 transition-colors"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          All discussions
        </Link>
      </nav>

      <article className="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-white/[0.06] overflow-hidden mb-8">
        <div className="px-7 pt-7 pb-5 border-b border-slate-200 dark:border-white/[0.06]">
          <div className="flex gap-2 items-center mb-3 text-[13px] flex-wrap">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full font-semibold text-[11px] uppercase tracking-wider bg-violet-500/10 text-violet-500 border border-violet-500/20">
              Community
            </span>
            <span className="text-slate-300 dark:text-slate-600 text-[3px]">&#x2022;</span>
            <span className="text-slate-500 dark:text-slate-400 font-medium">{submission.author_name || 'community.member'}</span>
            <span className="text-slate-300 dark:text-slate-600 text-[3px]">&#x2022;</span>
            <span className="text-slate-400 dark:text-slate-500">{submission.created_at}</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight leading-snug mb-3">{submission.title}</h1>

          <div className="flex gap-1.5 flex-wrap">
            <span className="inline-flex items-center px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 text-[11px] font-medium rounded-full border border-slate-200 dark:border-white/[0.06]">
              {submission.category}
            </span>
          </div>
        </div>

        <div className="flex gap-5 p-6 md:px-7 border-b border-slate-200 dark:border-white/[0.06]">
          <div className="flex-1 min-w-0">
            <p className="text-[15px] leading-[1.75] whitespace-pre-line text-slate-700 dark:text-slate-200">
              {submission.content}
            </p>
          </div>
        </div>

        <div className="p-7">
          <h2 className="text-[13px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-5 pb-4 border-b border-slate-200 dark:border-white/[0.06]">
            {answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}
          </h2>

          {answers.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">No approved answers yet.</p>
          ) : (
            answers.map((answer) => (
              <div
                key={answer.id}
                className="flex flex-col md:flex-row gap-5 p-5 mb-3 rounded-xl border border-slate-200 dark:border-white/[0.06] bg-slate-50 dark:bg-slate-800/30 hover:border-slate-300 dark:hover:border-white/10 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex gap-2 items-center mb-2.5 text-[13px] flex-wrap">
                    <span className="font-semibold">{answer.author_name || 'community.member'}</span>
                    <span className="text-slate-300 dark:text-slate-600 text-[3px]">&#x2022;</span>
                    <span className="text-slate-400 dark:text-slate-500">{answer.created_at}</span>
                  </div>
                  <div className="text-[15px] leading-[1.75] text-slate-700 dark:text-slate-200 whitespace-pre-line">
                    {answer.content}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <AnswerForm threadId={`submission:${submission.id}`} />
      </article>
    </div>
  );
}
