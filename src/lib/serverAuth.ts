import crypto from 'crypto';
import { NextResponse } from 'next/server';

const PM_SESSION_DURATION_MS = 8 * 60 * 60 * 1000;

function timingSafeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

export function isAdminRequest(request: Request) {
  const adminSecret = process.env.ADMIN_API_SECRET;
  const provided = request.headers.get('x-admin-secret') || '';
  return Boolean(adminSecret && provided && timingSafeEqual(provided, adminSecret));
}

export function unauthorized() {
  return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
}

function pmSecret() {
  return process.env.PM_SESSION_SECRET || process.env.ADMIN_API_SECRET || '';
}

function sign(payload: string) {
  return crypto.createHmac('sha256', pmSecret()).update(payload).digest('hex');
}

export function createPmSessionToken(agencyId: string) {
  const secret = pmSecret();
  if (!secret) return '';
  const exp = Date.now() + PM_SESSION_DURATION_MS;
  const payload = `${agencyId}.${exp}`;
  return `${payload}.${sign(payload)}`;
}

export function verifyPmSessionToken(token: string | null, expectedAgencyId?: string) {
  const secret = pmSecret();
  if (!secret || !token) return false;

  const parts = token.split('.');
  if (parts.length !== 3) return false;

  const [agencyId, expRaw, signature] = parts;
  if (expectedAgencyId && agencyId !== expectedAgencyId) return false;

  const exp = Number(expRaw);
  if (!Number.isFinite(exp) || Date.now() > exp) return false;

  const payload = `${agencyId}.${expRaw}`;
  return timingSafeEqual(signature, sign(payload));
}

export function hasAdminOrPmAccess(request: Request, agencyId?: string) {
  if (isAdminRequest(request)) return true;
  return verifyPmSessionToken(request.headers.get('x-pm-session'), agencyId);
}

