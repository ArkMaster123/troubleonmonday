import type { MetadataRoute } from 'next';
import threads from './data/threads.json';
import { getApprovedSubmissions } from '@/lib/db';
import { createTitleSlug } from '@/lib/slug';

const DEFAULT_BASE_URL = 'https://troubleonmonday.com/troubleonmondays';

function getBaseUrl(): string {
  const candidate = process.env.APP_BASE_URL?.trim() || DEFAULT_BASE_URL;
  return candidate.endsWith('/') ? candidate.slice(0, -1) : candidate;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getBaseUrl();
  const approvedSubmissions = getApprovedSubmissions();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/` },
    { url: `${baseUrl}/privacy/` },
    { url: `${baseUrl}/terms/` },
  ];

  const staticThreadPages: MetadataRoute.Sitemap = threads.map((thread) => ({
    url: `${baseUrl}/thread/${thread.id}/`,
  }));

  const communityPages: MetadataRoute.Sitemap = approvedSubmissions.map((submission) => ({
    url: `${baseUrl}/thread/community/${submission.id}/${createTitleSlug(submission.title)}/`,
    lastModified: new Date(submission.created_at),
  }));

  return [...staticPages, ...staticThreadPages, ...communityPages];
}
