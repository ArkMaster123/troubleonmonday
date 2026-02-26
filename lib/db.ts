import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'submissions.db');

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

export function createSubmission(title: string, content: string, category: string, authorEmail: string): Submission {
  const db = getDb();
  const stmt = db.prepare('INSERT INTO submissions (title, content, category, author_email) VALUES (?, ?, ?, ?)');
  const result = stmt.run(title, content, category, authorEmail);
  return db.prepare('SELECT * FROM submissions WHERE id = ?').get(result.lastInsertRowid) as Submission;
}

export function updateSubmissionStatus(id: number, status: 'approved' | 'rejected'): boolean {
  const db = getDb();
  const result = db.prepare('UPDATE submissions SET status = ? WHERE id = ?').run(status, id);
  return result.changes > 0;
}
