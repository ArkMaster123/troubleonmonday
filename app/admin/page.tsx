'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Submission } from '../../lib/db';

const statusColors: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  approved: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  rejected: 'bg-red-500/10 text-red-500 border-red-500/20',
};

type AdminSettingsResponse = {
  settings: {
    weekly_post_count: number | null;
  };
  effective_weekly_post_count: number;
  source: 'admin' | 'env_or_default';
};

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [authed, setAuthed] = useState(false);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pendingActions, setPendingActions] = useState<Record<number, 'approved' | 'rejected'>>({});
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<number | null>(null);
  const [actionMessage, setActionMessage] = useState<{
    type: 'success' | 'error';
    text: string;
    submissionId?: number;
  } | null>(null);
  const [settings, setSettings] = useState<AdminSettingsResponse | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [weeklyCountInput, setWeeklyCountInput] = useState('');

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

  const fetchSettings = useCallback(async () => {
    setSettingsLoading(true);
    try {
      const res = await fetch('/api/admin/settings', {
        headers: { Authorization: `Bearer ${password}` },
      });
      if (!res.ok) {
        setSettingsMessage({ type: 'error', text: 'Failed to load SEO automation settings.' });
        return;
      }
      const data = (await res.json()) as AdminSettingsResponse;
      setSettings(data);
      setWeeklyCountInput(String(data.settings.weekly_post_count ?? data.effective_weekly_post_count));
      setSettingsMessage(null);
    } catch {
      setSettingsMessage({ type: 'error', text: 'Failed to load SEO automation settings.' });
    } finally {
      setSettingsLoading(false);
    }
  }, [password]);

  useEffect(() => {
    if (authed) fetchSubmissions();
  }, [authed, fetchSubmissions]);

  useEffect(() => {
    if (authed) fetchSettings();
  }, [authed, fetchSettings]);

  useEffect(() => {
    if (selectedSubmissionId === null) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedSubmissionId(null);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedSubmissionId]);

  async function saveSettings() {
    setSettingsSaving(true);
    setSettingsMessage(null);

    const parsed = Number.parseInt(weeklyCountInput, 10);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 20) {
      setSettingsSaving(false);
      setSettingsMessage({ type: 'error', text: 'Weekly post count must be an integer between 1 and 20.' });
      return;
    }

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${password}`,
        },
        body: JSON.stringify({ weekly_post_count: parsed }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        const reason = typeof data.error === 'string' ? data.error : 'Failed to save SEO automation settings.';
        setSettingsMessage({ type: 'error', text: reason });
        return;
      }

      setSettings(data as AdminSettingsResponse);
      setWeeklyCountInput(String((data as AdminSettingsResponse).settings.weekly_post_count ?? parsed));
      setSettingsMessage({ type: 'success', text: 'SEO automation settings updated.' });
    } catch {
      setSettingsMessage({ type: 'error', text: 'Failed to save SEO automation settings.' });
    } finally {
      setSettingsSaving(false);
    }
  }

  async function handleStatusChange(id: number, status: 'approved' | 'rejected') {
    setPendingActions((prev) => ({ ...prev, [id]: status }));
    setActionMessage(null);

    try {
      const res = await fetch('/api/admin/submissions', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${password}`,
        },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        const reason = typeof data.error === 'string' ? data.error : 'Failed to update submission status';
        setActionMessage({ type: 'error', text: reason, submissionId: id });
        return;
      }

      setSubmissions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status } : s))
      );
      setActionMessage({ type: 'success', text: `Submission #${id} marked ${status}.`, submissionId: id });
    } catch {
      setActionMessage({ type: 'error', text: 'Failed to update submission status', submissionId: id });
    } finally {
      setPendingActions((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  }

  const selectedSubmission = selectedSubmissionId === null
    ? null
    : submissions.find((sub) => sub.id === selectedSubmissionId) ?? null;
  const selectedSubmissionPending = selectedSubmission ? Boolean(pendingActions[selectedSubmission.id]) : false;
  const modalActionMessage =
    selectedSubmission && actionMessage?.submissionId === selectedSubmission.id
      ? actionMessage
      : null;

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
      <div className="mb-6 bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-white/[0.06] p-5">
        <div className="flex items-center justify-between gap-4 mb-2">
          <h2 className="text-lg font-bold tracking-tight">SEO Automation</h2>
          <span className="text-xs uppercase tracking-wider text-slate-400">Weekly generator</span>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Generates and appends SEO-focused monday.com threads from SERP research and AI synthesis.
        </p>

        <div className="grid md:grid-cols-2 gap-4 mb-4 text-sm">
          <div className="rounded-xl border border-slate-200 dark:border-white/[0.06] px-3.5 py-3">
            <div className="text-xs uppercase tracking-wider text-slate-400 mb-1">Current weekly post count (effective)</div>
            <div className="text-2xl font-bold tracking-tight">
              {settingsLoading ? '…' : settings?.effective_weekly_post_count ?? '-'}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Source: {settings?.source === 'admin' ? 'Admin override' : 'Environment/default fallback'}
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-white/[0.06] px-3.5 py-3">
            <div className="text-xs uppercase tracking-wider text-slate-400 mb-1">Next scheduled run</div>
            <div className="text-sm font-medium">Configured by server scheduler</div>
            <div className="text-xs text-slate-400 mt-1">This panel controls generation count, not cron timing.</div>
          </div>
        </div>

        <form
          className="flex flex-col sm:flex-row gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            saveSettings();
          }}
        >
          <input
            type="number"
            min={1}
            max={20}
            step={1}
            inputMode="numeric"
            value={weeklyCountInput}
            onChange={(e) => setWeeklyCountInput(e.target.value)}
            className="w-full sm:w-44 px-3.5 py-2.5 border border-slate-200 dark:border-white/[0.06] rounded-xl bg-white dark:bg-slate-950 text-[15px] transition-all focus:outline-none focus:border-red-500 focus:ring-[3px] focus:ring-red-500/10"
            aria-label="Weekly SEO post count"
          />
          <button
            type="submit"
            disabled={settingsSaving}
            className="px-4 py-2.5 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white font-semibold text-sm rounded-lg transition-colors cursor-pointer"
          >
            {settingsSaving ? 'Saving...' : 'Save'}
          </button>
        </form>

        {settingsMessage && (
          <div
            className={`mt-3 rounded-xl border px-4 py-2 text-sm ${
              settingsMessage.type === 'success'
                ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : 'border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400'
            }`}
          >
            {settingsMessage.text}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Submissions</h1>
        <span className="text-sm text-slate-400">{submissions.length} total</span>
      </div>

      {actionMessage && (
        <div
          className={`mb-4 rounded-xl border px-4 py-2 text-sm ${
            actionMessage.type === 'success'
              ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              : 'border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400'
          }`}
        >
          {actionMessage.text}
        </div>
      )}

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
              {submissions.map((sub) => {
                const isPending = Boolean(pendingActions[sub.id]);
                const shouldTruncate = sub.content.length > 180;
                const contentPreview = shouldTruncate ? `${sub.content.slice(0, 180)}...` : sub.content;

                return (
                  <tr
                    key={sub.id}
                    className="border-b border-slate-100 dark:border-white/[0.03] last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => setSelectedSubmissionId(sub.id)}
                        className="font-medium mb-0.5 max-w-[300px] truncate text-left hover:text-red-500 transition-colors cursor-pointer"
                      >
                        {sub.title}
                      </button>
                      <div className="text-slate-400 dark:text-slate-500 text-xs max-w-[300px] whitespace-pre-wrap break-words">
                        {contentPreview}
                      </div>
                      {sub.content.length > 180 && <div className="mt-1 text-[11px] text-slate-400">Open View for full content</div>}
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
                        <button
                          type="button"
                          onClick={() => setSelectedSubmissionId(sub.id)}
                          className="px-2.5 py-1 bg-slate-500/10 text-slate-600 dark:text-slate-300 hover:bg-slate-500/20 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                        >
                          View
                        </button>
                        {sub.status !== 'approved' && (
                          <button
                            onClick={() => handleStatusChange(sub.id, 'approved')}
                            disabled={isPending}
                            className="px-2.5 py-1 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 disabled:opacity-60 disabled:cursor-not-allowed text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                          >
                            {pendingActions[sub.id] === 'approved' ? 'Approving...' : 'Approve'}
                          </button>
                        )}
                        {sub.status !== 'rejected' && (
                          <button
                            onClick={() => handleStatusChange(sub.id, 'rejected')}
                            disabled={isPending}
                            className="px-2.5 py-1 bg-red-500/10 text-red-500 hover:bg-red-500/20 disabled:opacity-60 disabled:cursor-not-allowed text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                          >
                            {pendingActions[sub.id] === 'rejected' ? 'Rejecting...' : 'Reject'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {selectedSubmission && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 p-4 md:p-8"
          onClick={() => setSelectedSubmissionId(null)}
          aria-hidden="true"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="submission-detail-title"
            className="max-w-3xl mx-auto mt-6 md:mt-14 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-slate-200 dark:border-white/[0.08] flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 id="submission-detail-title" className="text-lg font-bold tracking-tight">
                    {selectedSubmission.title}
                  </h2>
                  {selectedSubmission.status === 'pending' && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400">
                      Pending review
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400">Submission #{selectedSubmission.id}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSubmissionId(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors text-xl leading-none cursor-pointer"
                aria-label="Close details modal"
              >
                ×
              </button>
            </div>

            <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-400 mb-1">Category</p>
                  <p className="font-medium text-slate-700 dark:text-slate-200">{selectedSubmission.category}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-400 mb-1">Created</p>
                  <p className="font-medium text-slate-700 dark:text-slate-200">{new Date(selectedSubmission.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-400 mb-1">Status</p>
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider border ${statusColors[selectedSubmission.status]}`}>
                    {selectedSubmission.status}
                  </span>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-400 mb-1">Author name</p>
                  <p className="font-medium text-slate-700 dark:text-slate-200">{selectedSubmission.author_name || '—'}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-400 mb-1">Author email</p>
                  <p className="font-medium text-slate-700 dark:text-slate-200 break-all">{selectedSubmission.author_email || '—'}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-400 mb-1">Submission ID</p>
                  <p className="font-medium text-slate-700 dark:text-slate-200">{selectedSubmission.id}</p>
                </div>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider text-slate-400 mb-2">Full content</p>
                <div className="rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-slate-950/60 p-4 whitespace-pre-wrap break-words text-sm text-slate-700 dark:text-slate-200">
                  {selectedSubmission.content}
                </div>
              </div>

              {modalActionMessage && (
                <div
                  className={`rounded-xl border px-4 py-2 text-sm ${
                    modalActionMessage.type === 'success'
                      ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400'
                  }`}
                >
                  {modalActionMessage.text}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-slate-200 dark:border-white/[0.08] flex flex-wrap gap-2 justify-end">
              {selectedSubmission.status !== 'approved' && (
                <button
                  type="button"
                  onClick={() => handleStatusChange(selectedSubmission.id, 'approved')}
                  disabled={selectedSubmissionPending}
                  className="px-3 py-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-60 disabled:cursor-not-allowed text-sm font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  {pendingActions[selectedSubmission.id] === 'approved' ? 'Approving...' : 'Approve'}
                </button>
              )}
              {selectedSubmission.status !== 'rejected' && (
                <button
                  type="button"
                  onClick={() => handleStatusChange(selectedSubmission.id, 'rejected')}
                  disabled={selectedSubmissionPending}
                  className="px-3 py-1.5 bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 disabled:opacity-60 disabled:cursor-not-allowed text-sm font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  {pendingActions[selectedSubmission.id] === 'rejected' ? 'Rejecting...' : 'Reject'}
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedSubmissionId(null)}
                className="px-3 py-1.5 bg-slate-500/10 text-slate-700 dark:text-slate-300 hover:bg-slate-500/20 text-sm font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
