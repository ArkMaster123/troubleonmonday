import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = process.env.SUBMISSIONS_DB_PATH || path.join(process.cwd(), 'data', 'submissions.db');

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.exec(`
      CREATE TABLE IF NOT EXISTS submissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        category TEXT NOT NULL DEFAULT 'General',
        author_email TEXT DEFAULT '',
        author_name TEXT DEFAULT '',
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected'))
      )
    `);
    db.exec(`
      CREATE TABLE IF NOT EXISTS answers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        thread_id TEXT NOT NULL,
        content TEXT NOT NULL,
        author_email TEXT DEFAULT '',
        author_name TEXT DEFAULT '',
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected'))
      )
    `);
  }
  return db;
}

export interface Submission {
  id: number;
  title: string;
  content: string;
  category: string;
  author_email: string;
  author_name: string;
  created_at: string;
  status: 'pending' | 'approved' | 'rejected';
}

export function getApprovedSubmissions(): Submission[] {
  const db = getDb();
  return db.prepare('SELECT * FROM submissions WHERE status = ? ORDER BY created_at DESC').all('approved') as Submission[];
}

export function getAllSubmissions(): Submission[] {
  const db = getDb();
  return db.prepare('SELECT * FROM submissions ORDER BY created_at DESC').all() as Submission[];
}

export function createSubmission(title: string, content: string, category: string, authorEmail: string, authorName: string): Submission {
  const db = getDb();
  const stmt = db.prepare('INSERT INTO submissions (title, content, category, author_email, author_name) VALUES (?, ?, ?, ?, ?)');
  const result = stmt.run(title, content, category, authorEmail, authorName);
  return db.prepare('SELECT * FROM submissions WHERE id = ?').get(result.lastInsertRowid) as Submission;
}

export function updateSubmissionStatus(id: number, status: 'approved' | 'rejected'): boolean {
  const db = getDb();
  const result = db.prepare('UPDATE submissions SET status = ? WHERE id = ?').run(status, id);
  return result.changes > 0;
}

// Answers
export interface Answer {
  id: number;
  thread_id: string;
  content: string;
  author_email: string;
  author_name: string;
  created_at: string;
  status: 'pending' | 'approved' | 'rejected';
}

export function createAnswer(threadId: string, content: string, authorEmail: string, authorName: string): Answer {
  const db = getDb();
  const stmt = db.prepare('INSERT INTO answers (thread_id, content, author_email, author_name) VALUES (?, ?, ?, ?)');
  const result = stmt.run(threadId, content, authorEmail, authorName);
  return db.prepare('SELECT * FROM answers WHERE id = ?').get(result.lastInsertRowid) as Answer;
}

export function getAnswersByThread(threadId: string): Answer[] {
  const db = getDb();
  return db.prepare('SELECT * FROM answers WHERE thread_id = ? AND status = ? ORDER BY created_at DESC').all(threadId, 'approved') as Answer[];
}

export function getAllAnswers(): Answer[] {
  const db = getDb();
  return db.prepare('SELECT * FROM answers ORDER BY created_at DESC').all() as Answer[];
}

export function updateAnswerStatus(id: number, status: 'approved' | 'rejected'): boolean {
  const db = getDb();
  const result = db.prepare('UPDATE answers SET status = ? WHERE id = ?').run(status, id);
  return result.changes > 0;
}
