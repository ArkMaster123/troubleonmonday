# Trouble on Mondays

A programmatic SEO forum targeting high-search-volume monday.com keywords. Built to capture organic search traffic and generate leads for [Born & Brand](https://bornandbrand.com) — a monday.com optimization agency.

## What is this?

Trouble on Mondays is a **community-style forum** that mimics Reddit/StackOverflow format, focused entirely on monday.com-related questions and answers. It's designed to rank for long-tail keywords like:

- "monday.com vs asana"
- "monday.com pricing worth it"
- "monday.com automation guide"
- "monday.com CRM features"

## Tech Stack

- **Next.js 15** — React framework with API routes
- **Tailwind CSS v4** — Utility-first styling with dark mode
- **TypeScript** — Type safety
- **Static Hosting** — Deployed via Cloudflare Tunnel + Nginx

## Features

- ✅ 28 high-quality SEO-optimized threads
- ✅ Dark/light mode toggle
- ✅ Filter tabs (Latest / Top / Unanswered)
- ✅ Category-based thread organization
- ✅ Lead capture CTAs for Born & Brand
- ✅ Mobile responsive
- ✅ Fast server-rendered loading
- ✅ SQLite-backed submissions and answers API

## Programmatic SEO Strategy

1. **Target high-volume keywords** — Research what people actually search for about monday.com
2. **Create authentic content** — Threads with realistic questions and detailed answers
3. **Build topical authority** — Cover every aspect: comparisons, pricing, features, use cases
4. **Convert traffic** — CTAs throughout to drive leads to Born & Brand

## Deployment

```bash
npm install
npm run build
npm run start
```

### Production environment variables

```bash
SUBMISSIONS_DB_PATH=/home/noah/data/troubleonmonday.db
RESEND_API_KEY=...
RESEND_FROM=noreply@example.com
NOTIFY_EMAIL=moderation@example.com
REPLY_TO_EMAIL=replyto@example.com
ADMIN_ACTION_SECRET=replace-with-a-long-random-secret
APP_BASE_URL=https://example.com/troubleonmondays
ADMIN_PASSWORD=...
```

## Domain

- **Production:** https://troubleonmonday.com (pending DNS setup)
- **Staging:** https://demos.arkmaster.xyz/troubleonmondays/

## Lead Generation

The site includes CTAs promoting Born & Brand's monday.com optimization services:
- "Get a Free Audit" buttons
- "Book a Free Consultation" links
- Contextual mentions in thread content

## Future Enhancements

- [ ] Auto-generate new threads from trending keywords
- [ ] Scrape official monday.com forum for fresh topics
- [ ] Add user-generated content (moderated)
- [ ] Implement search functionality
- [ ] Add structured data for better SEO

---

Built by [ArkMaster](https://github.com/ArkMaster123) with Claude Code CLI.
