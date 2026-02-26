import threads from '../../data/threads.json';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface ThreadPageProps {
  params: Promise<{ id: string }>;
}

const categoryColors: Record<string, { bg: string; text: string }> = {
  Comparison: { bg: 'bg-[--color-cat-comparison-bg]', text: 'text-[--color-cat-comparison]' },
  Pricing: { bg: 'bg-[--color-cat-pricing-bg]', text: 'text-[--color-cat-pricing]' },
  Tutorial: { bg: 'bg-[--color-cat-tutorial-bg]', text: 'text-[--color-cat-tutorial]' },
  CRM: { bg: 'bg-[--color-cat-crm-bg]', text: 'text-[--color-cat-crm]' },
  Templates: { bg: 'bg-[--color-cat-templates-bg]', text: 'text-[--color-cat-templates]' },
  Features: { bg: 'bg-[--color-cat-features-bg]', text: 'text-[--color-cat-features]' },
  Integrations: { bg: 'bg-[--color-cat-integrations-bg]', text: 'text-[--color-cat-integrations]' },
  API: { bg: 'bg-[--color-cat-api-bg]', text: 'text-[--color-cat-api]' },
  Security: { bg: 'bg-[--color-cat-security-bg]', text: 'text-[--color-cat-security]' },
  Industry: { bg: 'bg-[--color-cat-industry-bg]', text: 'text-[--color-cat-industry]' },
};

function CategoryBadge({ category }: { category: string }) {
  const colors = categoryColors[category] || { bg: 'bg-slate-500/10', text: 'text-slate-500' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-semibold text-[11px] uppercase tracking-wider ${colors.bg} ${colors.text}`}>
      {category}
    </span>
  );
}

function FormatMarkdown({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*)/g;
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    if (match[2]) {
      parts.push(<strong key={key++}>{match[2]}</strong>);
    } else if (match[3]) {
      parts.push(<em key={key++}>{match[3]}</em>);
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return <>{parts}</>;
}

export async function generateStaticParams() {
  return threads.map((thread) => ({
    id: thread.id,
  }));
}

export async function generateMetadata({ params }: ThreadPageProps) {
  const { id } = await params;
  const thread = threads.find((t) => t.id === id);
  if (!thread) return {};
  return {
    title: `${thread.title} | Trouble on Mondays`,
    description: thread.excerpt,
  };
}

export default async function ThreadPage({ params }: ThreadPageProps) {
  const { id } = await params;
  const thread = threads.find((t) => t.id === id);

  if (!thread) {
    notFound();
  }

  return (
    <div className="max-w-[860px] mx-auto">
      {/* Breadcrumb */}
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
        {/* Thread Header */}
        <div className="px-7 pt-7 pb-5 border-b border-slate-200 dark:border-white/[0.06]">
          <div className="flex gap-2 items-center mb-3 text-[13px] flex-wrap">
            <CategoryBadge category={thread.category} />
            <span className="text-slate-300 dark:text-slate-600 text-[3px]">&#x2022;</span>
            <span className="text-slate-500 dark:text-slate-400 font-medium">{thread.author}</span>
            <span className="text-slate-300 dark:text-slate-600 text-[3px]">&#x2022;</span>
            <span className="text-slate-400 dark:text-slate-500">{thread.timestamp}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight leading-snug mb-3">
            {thread.title}
          </h1>
          <div className="flex gap-1.5 flex-wrap">
            {thread.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 text-[11px] font-medium rounded-full border border-slate-200 dark:border-white/[0.06]"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Question */}
        <div className="flex gap-5 p-6 md:px-7 border-b border-slate-200 dark:border-white/[0.06]">
          <div className="flex flex-col items-center gap-0.5 min-w-[44px] pt-1">
            <button className="w-8 h-[26px] flex items-center justify-center text-slate-300 dark:text-slate-600 rounded-md hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer" aria-label="Upvote">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="18 15 12 9 6 15" />
              </svg>
            </button>
            <span className="font-bold text-[15px] tabular-nums py-1">{thread.votes}</span>
            <button className="w-8 h-[26px] flex items-center justify-center text-slate-300 dark:text-slate-600 rounded-md hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer" aria-label="Downvote">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[15px] leading-[1.75] whitespace-pre-line text-slate-700 dark:text-slate-200">
              <FormatMarkdown text={thread.question} />
            </p>
          </div>
        </div>

        {/* Answers */}
        <div className="p-7">
          <h2 className="text-[13px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-5 pb-4 border-b border-slate-200 dark:border-white/[0.06]">
            {thread.answers.length} {thread.answers.length === 1 ? 'Answer' : 'Answers'}
          </h2>

          {thread.answers.map((answer, index) => (
            <div
              key={index}
              className={`flex flex-col md:flex-row gap-5 p-5 mb-3 rounded-xl border transition-colors ${
                answer.isAccepted
                  ? 'border-emerald-500/50 bg-emerald-500/[0.03] shadow-[0_0_0_1px_rgba(16,185,129,0.1)]'
                  : 'border-slate-200 dark:border-white/[0.06] bg-slate-50 dark:bg-slate-800/30 hover:border-slate-300 dark:hover:border-white/10'
              }`}
            >
              <div className="flex md:flex-col items-center gap-2 md:gap-0.5 md:min-w-[44px]">
                <button className="w-8 h-[26px] flex items-center justify-center text-slate-300 dark:text-slate-600 rounded-md hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer" aria-label="Upvote">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="18 15 12 9 6 15" />
                  </svg>
                </button>
                <span className="font-bold text-[15px] tabular-nums py-1">{answer.votes}</span>
                <button className="w-8 h-[26px] flex items-center justify-center text-slate-300 dark:text-slate-600 rounded-md hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer" aria-label="Downvote">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                {answer.isAccepted && (
                  <span className="w-7 h-7 bg-emerald-500 text-white rounded-full flex items-center justify-center mt-2 shadow-[0_0_10px_rgba(16,185,129,0.3)]" title="Accepted answer">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex gap-2 items-center mb-2.5 text-[13px] flex-wrap">
                  <span className="font-semibold">{answer.author}</span>
                  <span className="text-slate-300 dark:text-slate-600 text-[3px]">&#x2022;</span>
                  <span className="text-slate-400 dark:text-slate-500">{answer.timestamp}</span>
                  {answer.isAccepted && (
                    <>
                      <span className="text-slate-300 dark:text-slate-600 text-[3px]">&#x2022;</span>
                      <span className="text-emerald-500 font-semibold text-xs">Accepted</span>
                    </>
                  )}
                </div>
                <div className="text-[15px] leading-[1.75] text-slate-700 dark:text-slate-200">
                  {answer.content.split('\n\n').map((paragraph, i) => (
                    <p key={i} className="mb-3 last:mb-0">
                      <FormatMarkdown text={paragraph} />
                    </p>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Reply */}
        <div className="p-7 border-t border-slate-200 dark:border-white/[0.06] bg-slate-50 dark:bg-slate-900/50">
          <h3 className="text-sm font-semibold mb-3">Your Answer</h3>
          <textarea
            className="w-full p-3.5 min-h-[140px] border border-slate-200 dark:border-white/[0.06] rounded-xl bg-white dark:bg-slate-900 text-[15px] leading-relaxed resize-y mb-3 transition-all focus:outline-none focus:border-red-500 focus:ring-[3px] focus:ring-red-500/10 placeholder:text-slate-300 dark:placeholder:text-slate-600"
            placeholder="Share your experience or knowledge..."
            rows={6}
          />
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-400 dark:text-slate-500">
              Markdown supported
            </span>
            <button className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white font-semibold text-sm rounded-lg transition-all hover:shadow-[0_0_20px_rgba(239,68,68,0.15)] cursor-pointer">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
              Post Answer
            </button>
          </div>
        </div>
      </article>

      {/* CTA */}
      <div className="relative my-8 p-8 bg-gradient-to-br from-slate-100 to-white dark:from-slate-900 dark:to-slate-950 rounded-2xl border border-slate-200 dark:border-white/[0.06] overflow-hidden flex flex-col md:flex-row items-center gap-8 mb-12">
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-500 via-orange-400 to-red-500 bg-[length:200%_100%] animate-gradient-slide" />
        <div className="flex-1">
          <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-red-500 mb-2">
            Need expert help?
          </div>
          <div className="text-xl font-bold tracking-tight mb-1.5 leading-snug">
            Get your monday.com setup optimized by pros
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-[420px]">
            Born &amp; Brand builds custom monday.com workflows, automations,
            and integrations so your team can focus on what matters.
          </p>
        </div>
        <div className="flex flex-col gap-2 shrink-0 items-center">
          <a
            href="https://bornandbrand.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold text-sm rounded-lg transition-all hover:shadow-[0_0_20px_rgba(239,68,68,0.15)] hover:-translate-y-0.5 whitespace-nowrap"
          >
            Book a Free Consultation
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </a>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 text-center">
            No commitment required
          </span>
        </div>
      </div>
    </div>
  );
}
