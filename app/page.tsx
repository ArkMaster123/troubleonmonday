import threads from './data/threads.json';
import ThreadList from './components/ThreadList';
import NewThreadButton from './components/NewThreadButton';
import { getApprovedSubmissions, getAnswersByThread } from '@/lib/db';
import { createTitleSlug } from '@/lib/slug';

function formatViews(views: number): string {
  if (views >= 1000) return `${(views / 1000).toFixed(1)}k`;
  return views.toString();
}

export default async function HomePage() {
  const approvedSubmissions = getApprovedSubmissions();

  const communityThreads = approvedSubmissions.map((submission) => {
    const answers = getAnswersByThread(`submission:${submission.id}`);

    return {
      id: `community-${submission.id}`,
      title: submission.title,
      category: submission.category,
      tags: ['community'],
      author: submission.author_name || 'community.member',
      timestamp: submission.created_at,
      votes: 0,
      views: 0,
      excerpt: submission.content.slice(0, 220),
      answers: answers.map((answer) => ({
        author: answer.author_name,
        timestamp: answer.created_at,
        votes: 0,
        isAccepted: false,
        content: answer.content,
      })),
      isCommunity: true,
      href: `/thread/community/${submission.id}/${createTitleSlug(submission.title)}/`,
    };
  });

  const allThreads = [...threads, ...communityThreads];
  const totalThreads = allThreads.length;
  const totalAnswers = allThreads.reduce((sum, thread) => sum + thread.answers.length, 0);
  const totalViews = allThreads.reduce((sum, thread) => sum + thread.views, 0);

  return (
    <div className="max-w-[860px] mx-auto">
      {/* Hero */}
      <section className="pt-14 pb-10 text-center">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-red-500/10 text-red-500 text-xs font-semibold rounded-full mb-5 uppercase tracking-wider border border-red-500/15">
          Community Forum
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter leading-[1.1] mb-4">
          Real answers for{' '}
          <span className="bg-gradient-to-br from-red-500 via-orange-400 to-red-500 bg-[length:200%_200%] bg-clip-text text-transparent animate-gradient-shift">
            monday.com
          </span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-[17px] leading-relaxed max-w-[520px] mx-auto mb-6">
          The community for monday.com power users. Get honest answers, share
          workflows, and level up your productivity.
        </p>
        <NewThreadButton />
      </section>

      {/* Stats */}
      <div className="flex justify-center gap-10 py-6 mb-2">
        <div className="text-center">
          <div className="text-2xl font-bold tracking-tight">{totalThreads}</div>
          <div className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-medium mt-0.5">
            Discussions
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold tracking-tight">{totalAnswers}</div>
          <div className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-medium mt-0.5">
            Answers
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold tracking-tight">{formatViews(totalViews)}</div>
          <div className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-medium mt-0.5">
            Views
          </div>
        </div>
      </div>

      {/* CTA Banner */}
      <div className="relative my-8 p-8 bg-gradient-to-br from-slate-100 to-white dark:from-slate-900 dark:to-slate-950 rounded-2xl border border-slate-200 dark:border-white/[0.06] overflow-hidden flex flex-col md:flex-row items-center gap-8">
        {/* Animated top border */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-500 via-orange-400 to-red-500 bg-[length:200%_100%] animate-gradient-slide" />
        <div className="flex-1">
          <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-red-500 mb-2">
            Need hands-on help?
          </div>
          <div className="text-xl font-bold tracking-tight mb-1.5 leading-snug">
            Stuck in setup hell? We can fix it with you.
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-[420px]">
            If your boards are messy or automations keep breaking, we will walk
            through your setup with you and get it running cleanly.
          </p>
        </div>
        <div className="flex flex-col gap-2 shrink-0 items-center">
          <a
            href="https://bornandbrand.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold text-sm rounded-lg transition-all hover:shadow-[0_0_20px_rgba(239,68,68,0.15)] hover:-translate-y-0.5 whitespace-nowrap"
          >
            Talk to a Human
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </a>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 text-center">
            No fluff. Just practical help.
          </span>
        </div>
      </div>

      <div id="discussions">
        <ThreadList threads={allThreads} />
      </div>
    </div>
  );
}
