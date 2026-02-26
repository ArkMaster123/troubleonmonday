import './globals.css';
import Link from 'next/link';
import type { Metadata } from 'next';
import ThemeToggle from './components/ThemeToggle';

const DEFAULT_BASE_URL = 'https://troubleonmonday.com';

function getMetadataBase(): URL {
  const candidate = process.env.APP_BASE_URL?.trim() || DEFAULT_BASE_URL;
  const normalized = candidate.endsWith('/') ? candidate : `${candidate}/`;
  return new URL(normalized);
}

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: 'Trouble on Mondays | monday.com Community Forum',
  description:
    'The community forum for monday.com power users. Get answers, share workflows, and connect with productivity enthusiasts.',
  alternates: {
    canonical: './',
  },
  openGraph: {
    type: 'website',
    title: 'Trouble on Mondays | monday.com Community Forum',
    description:
      'The community forum for monday.com power users. Get answers, share workflows, and connect with productivity enthusiasts.',
    url: './',
    siteName: 'Trouble on Mondays',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Trouble on Mondays | monday.com Community Forum',
    description:
      'The community forum for monday.com power users. Get answers, share workflows, and connect with productivity enthusiasts.',
  },
};

function NewThreadScript() {
  const script = `
    (function() {
      var newThreadBtn = document.getElementById('new-thread-btn');
      if (newThreadBtn) {
        newThreadBtn.addEventListener('click', function() {
          var el = document.getElementById('discussions');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          } else {
            window.location.href = '/#discussions';
          }
        });
      }
    })();
  `;
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}

function InitThemeScript() {
  const script = `
    (function() {
      var theme = localStorage.getItem('theme');
      if (theme === 'light') {
        document.documentElement.classList.remove('dark');
        document.documentElement.style.colorScheme = 'light';
      } else {
        document.documentElement.classList.add('dark');
        document.documentElement.style.colorScheme = 'dark';
      }
    })();
  `;
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <InitThemeScript />
      </head>
      <body className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors duration-300">
        {/* Header */}
        <header className="sticky top-0 z-50 h-[60px] bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl backdrop-saturate-150 border-b border-slate-200 dark:border-white/[0.06]">
          <div className="max-w-[1140px] mx-auto px-6 h-full flex items-center gap-8">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 font-bold text-base tracking-tight whitespace-nowrap">
              <span className="w-7 h-7 bg-red-500 rounded-md flex items-center justify-center text-white font-extrabold text-sm shadow-[0_0_12px_rgba(239,68,68,0.3)]">
                T
              </span>
              <span>
                trouble<span className="text-red-500">on</span>mondays
              </span>
            </Link>

            {/* Nav */}
            <nav className="hidden md:flex gap-1 flex-1">
              <Link
                href="/"
                className="px-3 py-1.5 text-sm font-medium rounded-md bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-50 transition-colors"
              >
                Discussions
              </Link>
              <Link
                href="/"
                className="px-3 py-1.5 text-sm font-medium rounded-md text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Categories
              </Link>
              <Link
                href="/"
                className="px-3 py-1.5 text-sm font-medium rounded-md text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Popular
              </Link>
              <Link
                href="/"
                className="px-3 py-1.5 text-sm font-medium rounded-md text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Unanswered
              </Link>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button id="new-thread-btn" className="inline-flex items-center gap-1.5 px-3.5 py-[7px] bg-red-500 hover:bg-red-600 text-white font-semibold text-[13px] rounded-lg transition-all hover:shadow-[0_0_20px_rgba(239,68,68,0.15)] cursor-pointer">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                New Thread
              </button>
            </div>
          </div>
        </header>

        {/* Main */}
        <main className="flex-1 px-6">{children}</main>

        {/* Footer */}
        <footer className="mt-auto border-t border-slate-200 dark:border-white/[0.06] py-10 px-6 bg-white dark:bg-slate-950">
          <div className="max-w-[1140px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-col items-center md:items-start gap-1">
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                troubleonmondays
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500">
                Unofficial monday.com community forum
              </span>
            </div>
            <div className="flex gap-5">
              <a
                href="https://bornandbrand.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[13px] text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-50 transition-colors"
              >
                Born &amp; Brand
              </a>
              <Link
                href="/privacy"
                className="text-[13px] text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-50 transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="text-[13px] text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-50 transition-colors"
              >
                Terms
              </Link>
            </div>
          </div>
        </footer>

        <NewThreadScript />
      </body>
    </html>
  );
}
