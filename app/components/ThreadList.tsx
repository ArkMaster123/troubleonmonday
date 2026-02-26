'use client';

import { useState } from 'react';
import Link from 'next/link';

type Filter = 'latest' | 'top' | 'unanswered';

interface Thread {
  id: string;
  title: string;
  category: string;
  tags: string[];
  author: string;
  timestamp: string;
  votes: number;
  views: number;
  excerpt: string;
  answers: { author: string; timestamp: string; votes: number; isAccepted: boolean; content: string }[];
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
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full font-semibold text-[11px] uppercase tracking-wider ${colors.bg} ${colors.text}`}
    >
      {category}
    </span>
  );
}

function formatViews(views: number): string {
  if (views >= 1000) return `${(views / 1000).toFixed(1)}k`;
  return views.toString();
}

const filterLabels: Record<Filter, string> = {
  latest: 'Latest Discussions',
  top: 'Top Discussions',
  unanswered: 'Unanswered Discussions',
};

function getFilteredThreads(threads: Thread[], filter: Filter): Thread[] {
  switch (filter) {
    case 'top':
      return [...threads].sort((a, b) => b.votes - a.votes);
    case 'unanswered':
      return threads.filter((t) => t.answers.length === 0);
    case 'latest':
    default:
      return threads;
  }
}

export default function ThreadList({ threads }: { threads: Thread[] }) {
  const [activeFilter, setActiveFilter] = useState<Filter>('latest');

  const filteredThreads = getFilteredThreads(threads, activeFilter);

  const filters: { key: Filter; label: string }[] = [
    { key: 'latest', label: 'Latest' },
    { key: 'top', label: 'Top' },
    { key: 'unanswered', label: 'Unanswered' },
  ];

  return (
    <>
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200 dark:border-white/[0.06]">
        <h2 className="text-[13px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          {filterLabels[activeFilter]}
        </h2>
        <div className="flex gap-0.5 bg-slate-100 dark:bg-slate-900 p-[3px] rounded-lg">
          {filters.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveFilter(key)}
              className={`px-3 py-1.5 text-[13px] font-medium rounded-md cursor-pointer transition-colors ${
                activeFilter === key
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 shadow-sm'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Thread List */}
      <div className="flex flex-col gap-0.5 mb-12">
        {filteredThreads.length === 0 ? (
          <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-sm">
            No threads found.
          </div>
        ) : (
          filteredThreads.map((thread) => (
            <article
              key={thread.id}
              className="flex gap-4 p-4 md:px-5 bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-white/[0.06] transition-all duration-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-slate-300 dark:hover:border-white/10 hover:shadow-md group"
            >
              {/* Votes */}
              <div className="flex flex-col items-center gap-0.5 min-w-[44px] pt-0.5">
                <button
                  className="w-8 h-[26px] flex items-center justify-center text-slate-300 dark:text-slate-600 rounded-md hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                  aria-label="Upvote"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="18 15 12 9 6 15" />
                  </svg>
                </button>
                <span className="font-bold text-[15px] tabular-nums py-1">{thread.votes}</span>
                <button
                  className="w-8 h-[26px] flex items-center justify-center text-slate-300 dark:text-slate-600 rounded-md hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                  aria-label="Downvote"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex gap-2 items-center mb-1.5 text-[13px] flex-wrap">
                  <CategoryBadge category={thread.category} />
                  <span className="text-slate-300 dark:text-slate-600 text-[3px]">&#x2022;</span>
                  <span className="text-slate-500 dark:text-slate-400 font-medium">{thread.author}</span>
                  <span className="text-slate-300 dark:text-slate-600 text-[3px]">&#x2022;</span>
                  <span className="text-slate-400 dark:text-slate-500">{thread.timestamp}</span>
                </div>

                <Link
                  href={`/thread/${thread.id}/`}
                  className="block text-base font-semibold mb-1.5 leading-snug tracking-tight transition-colors hover:text-red-500 group-hover:text-red-500"
                >
                  {thread.title}
                </Link>

                <p className="text-slate-500 dark:text-slate-400 text-sm mb-2.5 leading-relaxed line-clamp-2">
                  {thread.excerpt}
                </p>

                <div className="flex items-center justify-between gap-3">
                  <div className="flex gap-1 flex-wrap">
                    {thread.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 text-[11px] font-medium rounded-full border border-slate-200 dark:border-white/[0.06] hover:text-slate-600 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-white/10 transition-colors"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-3.5 text-xs text-slate-400 dark:text-slate-500 shrink-0">
                    <span className="inline-flex items-center gap-1">
                      <svg className="w-3.5 h-3.5 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                      {thread.answers.length}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <svg className="w-3.5 h-3.5 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                      {formatViews(thread.views)}
                    </span>
                  </div>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </>
  );
}
