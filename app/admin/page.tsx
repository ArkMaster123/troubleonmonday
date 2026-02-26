'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Submission } from '../../lib/db';

const statusColors: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  approved: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  rejected: 'bg-red-500/10 text-red-500 border-red-500/20',
};

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [authed, setAuthed] = useState(false);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/submissions', {
        headers: { Authorization: `Bearer ${password}` },
      });
      if (!res.ok) {
        setAuthed(false);
        setError('Invalid password');
        return;
      }
      const data = await res.json();
      setSubmissions(data.submissions);
      setAuthed(true);
      setError('');
    } catch {
      setError('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  }, [password]);

  useEffect(() => {
    if (authed) fetchSubmissions();
  }, [authed, fetchSubmissions]);

  async function handleStatusChange(id: number, status: 'approved' | 'rejected') {
    try {
      const res = await fetch('/api/admin/submissions', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${password}`,
        },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        setSubmissions((prev) =>
          prev.map((s) => (s.id === id ? { ...s, status } : s))
        );
      }
    } catch {
      // silently fail
    }
  }

  if (!authed) {
    return (
      <div className="max-w-sm mx-auto pt-24">
        <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-white/[0.06] p-8">
          <h1 className="text-xl font-bold tracking-tight mb-1">Admin Login</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Enter the admin password to manage submissions.</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchSubmissions();
            }}
          >
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-white/[0.06] rounded-xl bg-white dark:bg-slate-950 text-[15px] mb-4 transition-all focus:outline-none focus:border-red-500 focus:ring-[3px] focus:ring-red-500/10 placeholder:text-slate-300 dark:placeholder:text-slate-600"
            />
            {error && (
              <p className="text-sm text-red-500 mb-3">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white font-semibold text-sm rounded-lg transition-colors cursor-pointer"
            >
              {loading ? 'Checking...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1000px] mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Submissions</h1>
        <span className="text-sm text-slate-400">{submissions.length} total</span>
      </div>

      {submissions.length === 0 ? (
        <div className="text-center py-16 text-slate-400 dark:text-slate-500">
          No submissions yet.
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-white/[0.06] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/[0.06] text-left">
                <th className="px-5 py-3 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Title</th>
                <th className="px-5 py-3 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Category</th>
                <th className="px-5 py-3 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Date</th>
                <th className="px-5 py-3 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((sub) => (
                <tr
                  key={sub.id}
                  className="border-b border-slate-100 dark:border-white/[0.03] last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <td className="px-5 py-4">
                    <div className="font-medium mb-0.5 max-w-[300px] truncate">{sub.title}</div>
                    <div className="text-slate-400 dark:text-slate-500 text-xs max-w-[300px] truncate">{sub.content}</div>
                  </td>
                  <td className="px-5 py-4 text-slate-500">{sub.category}</td>
                  <td className="px-5 py-4 text-slate-400 whitespace-nowrap text-xs">{new Date(sub.created_at).toLocaleDateString()}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider border ${statusColors[sub.status]}`}>
                      {sub.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      {sub.status !== 'approved' && (
                        <button
                          onClick={() => handleStatusChange(sub.id, 'approved')}
                          className="px-2.5 py-1 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                        >
                          Approve
                        </button>
                      )}
                      {sub.status !== 'rejected' && (
                        <button
                          onClick={() => handleStatusChange(sub.id, 'rejected')}
                          className="px-2.5 py-1 bg-red-500/10 text-red-500 hover:bg-red-500/20 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                        >
                          Reject
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
