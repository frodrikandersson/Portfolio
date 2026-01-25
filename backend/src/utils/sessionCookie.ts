import { Response } from 'express';
import { env } from '../config/env';

const COOKIE_NAME = 'session_token';
const isProduction = env.NODE_ENV === 'production';

export function setSessionCookie(res: Response, sessionToken: string) {
  res.cookie(COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax', // 'none' required for cross-origin in production
    maxAge: env.SESSION_EXPIRY_HOURS * 60 * 60 * 1000,
    path: '/',
  });
}

export function clearSessionCookie(res: Response) {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
  });
}
