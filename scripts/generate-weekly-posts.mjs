#!/usr/bin/env node

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const DEFAULT_ZONE = 'serp_api1';
const DEFAULT_MODEL = 'minimax/minimax-m2.5';
const DEFAULT_POST_COUNT = 3;
const THREADS_PATH = path.resolve(process.cwd(), 'app/data/threads.json');
const ADMIN_SETTINGS_PATH = path.resolve(process.cwd(), 'data/admin-settings.json');
const BRIGHTDATA_ENDPOINT = 'https://api.brightdata.com/request';
const OPENROUTER_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';
const MONDAY_SEED_QUERIES = [
  'monday.com best practices for project management teams',
  'monday.com automations examples for marketing workflows',
  'monday.com templates for operations and agency teams',
  'monday.com integrations with Slack and Google Workspace',
  'monday.com pricing and ROI for small business',
  'monday crm setup tips and common mistakes'
];

function parseArgs(argv) {
  const flags = new Set(argv.slice(2));
  return {
    dryRun: flags.has('--dry-run')
  };
}

function asInt(value, fallback) {
  const parsed = Number.parseInt(value ?? '', 10);
  if (Number.isNaN(parsed) || parsed <= 0) return fallback;
  return parsed;
}

async function readAdminWeeklyPostCount() {
  try {
    const raw = await readFile(ADMIN_SETTINGS_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    const value = parsed?.weekly_post_count;
    if (!Number.isInteger(value) || value < 1 || value > 20) {
      return null;
    }
    return value;
  } catch (error) {
    if (error?.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

function normalizeWhitespace(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim();
}

function clip(value, maxLength) {
  const text = normalizeWhitespace(value);
  if (text.length <= maxLength) return text;
  return `${text.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}

function toSlug(value) {
  return normalizeWhitespace(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64) || 'monday-thread';
}

function uniqueSlug(base, usedIds) {
  if (!usedIds.has(base)) {
    usedIds.add(base);
    return base;
  }

  let i = 2;
  while (usedIds.has(`${base}-${i}`)) i += 1;
  const candidate = `${base}-${i}`;
  usedIds.add(candidate);
  return candidate;
}

function extractJson(raw) {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/```json\s*([\s\S]*?)```/i);
  const payload = fenced?.[1] ?? trimmed;
  return JSON.parse(payload);
}

function pickOrganicCandidates(result) {
  const pools = [
    result?.organic,
    result?.organic_results,
    result?.results?.organic,
    result?.body?.organic,
    result?.body?.results?.organic,
    result?.search_results?.organic,
    result?.response?.organic
  ];

  for (const pool of pools) {
    if (Array.isArray(pool) && pool.length > 0) return pool;
  }

  if (Array.isArray(result)) return result;
  return [];
}

function normalizeSerpItem(item) {
  if (!item || typeof item !== 'object') return null;
  const title = normalizeWhitespace(item.title ?? item.name ?? item.headline);
  const url = normalizeWhitespace(item.link ?? item.url ?? item.href ?? item.display_link);
  const snippet = normalizeWhitespace(item.snippet ?? item.description ?? item.body ?? item.text);

  if (!title || !url) return null;
  return {
    title: clip(title, 180),
    url,
    snippet: clip(snippet, 260)
  };
}

async function fetchBrightDataSerp({ apiKey, zone, query }) {
  const targetUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&hl=en&gl=us`;
  const res = await fetch(BRIGHTDATA_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      zone,
      url: targetUrl,
      format: 'raw',
      data_format: 'parsed_light',
      method: 'GET'
    })
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Bright Data request failed (${res.status}): ${body.slice(0, 300)}`);
  }

  const contentType = res.headers.get('content-type') ?? '';
  let payload;

  if (contentType.includes('application/json')) {
    payload = await res.json();
  } else {
    const text = await res.text();
    try {
      payload = JSON.parse(text);
    } catch {
      payload = { raw: text };
    }
  }

  const parsedItems = pickOrganicCandidates(payload)
    .map(normalizeSerpItem)
    .filter(Boolean)
    .slice(0, 8);

  return {
    query,
    items: parsedItems,
    rawShape: payload && typeof payload === 'object' ? Object.keys(payload).slice(0, 12) : ['unknown']
  };
}

function sanitizeAnswer(answer, index) {
  const content = normalizeWhitespace(answer?.content);
  if (!content) return null;
  return {
    author: normalizeWhitespace(answer?.author) || `community_member_${index + 1}`,
    timestamp: normalizeWhitespace(answer?.timestamp) || 'just now',
    votes: Number.isFinite(answer?.votes) ? Number(answer.votes) : 0,
    isAccepted: Boolean(answer?.isAccepted),
    content: clip(content, 3000)
  };
}

function ensureAcceptedAnswer(answers) {
  if (answers.length === 0) return answers;
  if (answers.some((answer) => answer.isAccepted)) return answers;
  answers[0].isAccepted = true;
  return answers;
}

function sanitizeThread(rawThread, { allowedCategories, usedIds, existingTitles }) {
  if (!rawThread || typeof rawThread !== 'object') return null;

  const title = clip(rawThread.title, 120);
  if (!title) return null;

  const normalizedTitle = title.toLowerCase();
  if (existingTitles.has(normalizedTitle)) return null;

  const requestedId = toSlug(rawThread.id || title);
  const id = uniqueSlug(requestedId, usedIds);

  const category = allowedCategories.has(rawThread.category)
    ? rawThread.category
    : 'Features';

  const tagCandidates = Array.isArray(rawThread.tags) ? rawThread.tags : [];
  const tags = [...new Set(tagCandidates.map((tag) => toSlug(String(tag))).filter(Boolean))].slice(0, 8);

  const question = clip(rawThread.question || rawThread.excerpt || title, 3500);
  const excerpt = clip(rawThread.excerpt || question, 220);

  if (!question || !excerpt) return null;

  const rawAnswers = Array.isArray(rawThread.answers) ? rawThread.answers : [];
  const answers = ensureAcceptedAnswer(
    rawAnswers
      .map((answer, index) => sanitizeAnswer(answer, index))
      .filter(Boolean)
      .slice(0, 3)
  );

  if (answers.length === 0) return null;

  existingTitles.add(normalizedTitle);

  return {
    id,
    title,
    category,
    tags: tags.length > 0 ? tags : ['monday-com', 'workflow'],
    author: normalizeWhitespace(rawThread.author) || 'forum_editor_bot',
    timestamp: normalizeWhitespace(rawThread.timestamp) || 'just now',
    votes: Number.isFinite(rawThread.votes) ? Number(rawThread.votes) : 0,
    views: Number.isFinite(rawThread.views) ? Number(rawThread.views) : 0,
    excerpt,
    question,
    answers
  };
}

function buildPrompt({ serpFindings, allowedCategories, targetCount, existingThreads }) {
  const titleAndId = existingThreads.map((thread) => `${thread.id} :: ${thread.title}`);
  const sources = serpFindings.map(({ query, items, rawShape }) => ({
    query,
    rawShape,
    topResults: items
  }));

  return [
    'Generate SEO-focused community thread objects about monday.com based on SERP source data.',
    `Return ONLY JSON: an array with ${targetCount} to ${targetCount + 2} thread objects.`,
    'Schema must exactly match this shape:',
    JSON.stringify(
      {
        id: 'slug-id',
        title: 'string',
        category: 'string',
        tags: ['string'],
        author: 'string',
        timestamp: 'string',
        votes: 0,
        views: 0,
        excerpt: 'string',
        question: 'string',
        answers: [
          {
            author: 'string',
            timestamp: 'string',
            votes: 0,
            isAccepted: true,
            content: 'string'
          }
        ]
      },
      null,
      2
    ),
    `Allowed categories only: ${JSON.stringify([...allowedCategories])}`,
    'Output requirements:',
    '- Focus on high-intent monday.com topics that could rank.',
    '- Keep titles unique and not duplicates of existing titles or IDs.',
    '- Each thread needs 1-3 realistic answers with one accepted answer.',
    '- Keep tone practical and specific (not generic fluff).',
    '- Use keyword-aware tags.',
    'Existing threads (do not duplicate title/id):',
    JSON.stringify(titleAndId, null, 2),
    'SERP findings:',
    JSON.stringify(sources, null, 2)
  ].join('\n');
}

async function generateThreadsWithOpenRouter({ apiKey, model, prompt }) {
  const res = await fetch(OPENROUTER_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      messages: [
        {
          role: 'system',
          content: 'You generate strictly valid JSON arrays only. Never output markdown or commentary.'
        },
        {
          role: 'user',
          content: prompt
        }
      ]
    })
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`OpenRouter request failed (${res.status}): ${body.slice(0, 400)}`);
  }

  const payload = await res.json();
  const content = payload?.choices?.[0]?.message?.content;
  if (!content || typeof content !== 'string') {
    throw new Error('OpenRouter returned no message content.');
  }

  const parsed = extractJson(content);
  if (!Array.isArray(parsed)) {
    throw new Error('OpenRouter response is not a JSON array.');
  }

  return parsed;
}

async function main() {
  const { dryRun } = parseArgs(process.argv);

  const BRIGHTDATA_API_KEY = process.env.BRIGHTDATA_API_KEY;
  const BRIGHTDATA_ZONE = process.env.BRIGHTDATA_ZONE || DEFAULT_ZONE;
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
  const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || DEFAULT_MODEL;
  const envWeeklyPostCount = asInt(process.env.WEEKLY_POST_COUNT, DEFAULT_POST_COUNT);
  const adminWeeklyPostCount = await readAdminWeeklyPostCount();
  const weeklyPostCount = adminWeeklyPostCount ?? envWeeklyPostCount;

  if (!BRIGHTDATA_API_KEY) {
    throw new Error('Missing BRIGHTDATA_API_KEY environment variable.');
  }
  if (!OPENROUTER_API_KEY) {
    throw new Error('Missing OPENROUTER_API_KEY environment variable.');
  }

  const fileRaw = await readFile(THREADS_PATH, 'utf8');
  const existingThreads = JSON.parse(fileRaw);
  if (!Array.isArray(existingThreads)) {
    throw new Error(`Expected array in ${THREADS_PATH}`);
  }

  const allowedCategories = new Set(existingThreads.map((thread) => thread.category).filter(Boolean));
  const existingIds = new Set(existingThreads.map((thread) => thread.id).filter(Boolean));
  const existingTitles = new Set(
    existingThreads
      .map((thread) => normalizeWhitespace(thread.title).toLowerCase())
      .filter(Boolean)
  );

  const serpQueries = MONDAY_SEED_QUERIES.slice(0, Math.max(4, weeklyPostCount + 1));
  const serpFindings = [];

  for (const query of serpQueries) {
    try {
      const finding = await fetchBrightDataSerp({
        apiKey: BRIGHTDATA_API_KEY,
        zone: BRIGHTDATA_ZONE,
        query
      });
      serpFindings.push(finding);
      console.log(`SERP: "${query}" -> ${finding.items.length} parsed results`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`SERP warning for "${query}": ${message}`);
      serpFindings.push({ query, items: [], rawShape: ['unavailable'] });
    }
  }

  const prompt = buildPrompt({
    serpFindings,
    allowedCategories,
    targetCount: weeklyPostCount,
    existingThreads
  });

  const generated = await generateThreadsWithOpenRouter({
    apiKey: OPENROUTER_API_KEY,
    model: OPENROUTER_MODEL,
    prompt
  });

  const usedIds = new Set(existingIds);
  const sanitized = generated
    .map((thread) => sanitizeThread(thread, { allowedCategories, usedIds, existingTitles }))
    .filter(Boolean)
    .slice(0, weeklyPostCount);

  if (sanitized.length === 0) {
    console.log('No new threads were added (all candidates were invalid or duplicates).');
    return;
  }

  if (dryRun) {
    console.log(`Dry run complete. ${sanitized.length} candidate threads:`);
    console.log(JSON.stringify(sanitized, null, 2));
    return;
  }

  const updated = [...existingThreads, ...sanitized];
  await writeFile(THREADS_PATH, `${JSON.stringify(updated, null, 2)}\n`, 'utf8');

  console.log(`Added ${sanitized.length} thread(s) to app/data/threads.json`);
  sanitized.forEach((thread, idx) => {
    console.log(`${idx + 1}. ${thread.title}`);
  });
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Failed to generate weekly posts: ${message}`);
  process.exitCode = 1;
});
