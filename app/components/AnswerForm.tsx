'use client';

import { useState } from 'react';

interface AnswerFormProps {
  threadId: string;
}

export default function AnswerForm({ threadId }: AnswerFormProps) {
  const [content, setContent] = useState('');
  const [email, setEmail] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!content.trim()) {
      setStatus('error');
      setErrorMsg('Please enter your answer');
      return;
    }

    setStatus('submitting');
    setErrorMsg('');

    try {
      const res = await fetch('/troubleonmondays/api/answers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          thread_id: threadId, 
          content: content.trim(), 
          author_email: email,
          honeypot 
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus('success');
        setContent('');
        setEmail('');
      } else {
        setStatus('error');
        setErrorMsg(data.error || 'Something went wrong');
      }
    } catch {
      setStatus('error');
      setErrorMsg('Failed to submit. Please try again.');
    }
  }

  if (status === 'success') {
    return (
      <div className="p-7 border-t border-slate-200 dark:border-white/[0.06] bg-slate-50 dark:bg-slate-900/50">
        <div className="text-center py-6">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h3 className="text-lg font-bold mb-2">Answer Submitted!</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Your answer will appear after review by a moderator.
          </p>
          <button
            onClick={() => setStatus('idle')}
            className="text-sm font-medium text-red-500 hover:text-red-600 transition-colors cursor-pointer"
          >
            Submit another answer
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-7 border-t border-slate-200 dark:border-white/[0.06] bg-slate-50 dark:bg-slate-900/50">
      <h3 className="text-sm font-semibold mb-3">Your Answer</h3>
      
      {/* Honeypot — hidden from real users */}
      <input
        type="text"
        name="website"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0 }}
      />

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full p-3.5 min-h-[140px] border border-slate-200 dark:border-white/[0.06] rounded-xl bg-white dark:bg-slate-900 text-[15px] leading-relaxed resize-y mb-3 transition-all focus:outline-none focus:border-red-500 focus:ring-[3px] focus:ring-red-500/10 placeholder:text-slate-300 dark:placeholder:text-slate-600"
        placeholder="Share your experience or knowledge..."
        rows={6}
        maxLength={10000}
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email (optional, for notifications)"
          className="flex-1 px-3.5 py-2.5 border border-slate-200 dark:border-white/[0.06] rounded-xl bg-white dark:bg-slate-900 text-[15px] transition-all focus:outline-none focus:border-red-500 focus:ring-[3px] focus:ring-red-500/10 placeholder:text-slate-300 dark:placeholder:text-slate-600"
        />
      </div>

      {status === 'error' && (
        <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-500 font-medium mb-3">
          {errorMsg}
        </div>
      )}

      <div className="flex justify-between items-center">
        <span className="text-xs text-slate-400 dark:text-slate-500">
          Markdown supported
        </span>
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-red-500 hover:bg-red-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-lg transition-all hover:shadow-[0_0_20px_rgba(239,68,68,0.15)] cursor-pointer"
        >
          {status === 'submitting' ? (
            <>
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Posting...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
              Post Answer
            </>
          )}
        </button>
      </div>
    </form>
  );
}
