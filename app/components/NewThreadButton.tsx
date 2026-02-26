'use client';

import { useState } from 'react';
import SubmissionForm from './SubmissionForm';

export default function NewThreadButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white font-semibold text-sm rounded-lg transition-all hover:shadow-[0_0_20px_rgba(239,68,68,0.15)] hover:-translate-y-0.5 cursor-pointer"
      >
        <svg
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        New Thread
      </button>
      <SubmissionForm open={open} onClose={() => setOpen(false)} />
    </>
  );
}
