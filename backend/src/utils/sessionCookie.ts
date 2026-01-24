import { Response } from 'express';
import { env } from '../config/env';

const COOKIE_NAME = 'session_token';

export function setSessionCookie(res: Response, sessionToken: string) {
  res.cookie(COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: env.SESSION_EXPIRY_HOURS * 60 * 60 * 1000,
    path: '/',
  });
}

export function clearSessionCookie(res: Response) {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
}
