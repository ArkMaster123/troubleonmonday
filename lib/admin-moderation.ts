import crypto from 'crypto';

export type ModerationEntityType = 'submission' | 'answer';
export type ModerationAction = 'approved' | 'rejected';

export interface ModerationTokenPayload {
  type: ModerationEntityType;
  id: number;
  action: ModerationAction;
  exp: number;
}

const MODERATION_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;

function getSecret(): string {
  const secret = process.env.ADMIN_ACTION_SECRET;
  if (!secret) {
    throw new Error('ADMIN_ACTION_SECRET is not configured');
  }
  return secret;
}

function base64UrlEncode(input: string): string {
  return Buffer.from(input, 'utf8').toString('base64url');
}

function base64UrlDecode(input: string): string {
  return Buffer.from(input, 'base64url').toString('utf8');
}

function sign(payloadEncoded: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(payloadEncoded).digest('base64url');
}

export function createModerationToken(input: {
  type: ModerationEntityType;
  id: number;
  action: ModerationAction;
  nowMs?: number;
}): string {
  const secret = getSecret();
  const nowMs = input.nowMs ?? Date.now();
  const payload: ModerationTokenPayload = {
    type: input.type,
    id: input.id,
    action: input.action,
    exp: Math.floor(nowMs / 1000) + MODERATION_TOKEN_TTL_SECONDS,
  };

  const payloadEncoded = base64UrlEncode(JSON.stringify(payload));
  const signature = sign(payloadEncoded, secret);
  return `${payloadEncoded}.${signature}`;
}

function secureEquals(a: string, b: string): boolean {
  const left = Buffer.from(a, 'utf8');
  const right = Buffer.from(b, 'utf8');
  if (left.length !== right.length) {
    return false;
  }
  return crypto.timingSafeEqual(left, right);
}

export function verifyModerationToken(token: string):
  | { valid: true; payload: ModerationTokenPayload }
  | { valid: false; reason: string } {
  try {
    const secret = getSecret();
    const [payloadEncoded, signature] = token.split('.');
    if (!payloadEncoded || !signature) {
      return { valid: false, reason: 'Invalid token format' };
    }

    const expectedSig = sign(payloadEncoded, secret);
    if (!secureEquals(signature, expectedSig)) {
      return { valid: false, reason: 'Invalid token signature' };
    }

    const parsed = JSON.parse(base64UrlDecode(payloadEncoded)) as Partial<ModerationTokenPayload>;
    if (
      (parsed.type !== 'submission' && parsed.type !== 'answer') ||
      typeof parsed.id !== 'number' ||
      !Number.isInteger(parsed.id) ||
      parsed.id < 1 ||
      (parsed.action !== 'approved' && parsed.action !== 'rejected') ||
      typeof parsed.exp !== 'number' ||
      !Number.isFinite(parsed.exp)
    ) {
      return { valid: false, reason: 'Invalid token payload' };
    }

    const nowSeconds = Math.floor(Date.now() / 1000);
    if (parsed.exp < nowSeconds) {
      return { valid: false, reason: 'This moderation link has expired' };
    }

    return {
      valid: true,
      payload: {
        type: parsed.type,
        id: parsed.id,
        action: parsed.action,
        exp: parsed.exp,
      },
    };
  } catch {
    return { valid: false, reason: 'Invalid moderation token' };
  }
}

export function getAppBaseUrl(fallbackOrigin?: string): string {
  const raw = process.env.APP_BASE_URL?.trim() || fallbackOrigin || '';
  return raw.endsWith('/') ? raw.slice(0, -1) : raw;
}

export function buildModerationUrl(input: {
  baseUrl: string;
  type: ModerationEntityType;
  id: number;
  action: ModerationAction;
}): string {
  const token = createModerationToken({
    type: input.type,
    id: input.id,
    action: input.action,
  });
  const params = new URLSearchParams({ token });
  return `${input.baseUrl}/api/admin/moderate?${params.toString()}`;
}
