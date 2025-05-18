import {
  AuthenticatedRequest,
} from '@/domains/auth/types';
import { NextFunction, Response } from 'express';
import { isInvalidatedToken, verifyToken } from '@/domains/auth/utils';
import rateLimit from 'express-rate-limit';
import { UnauthorizedError } from '@/domains/error/HttpError';

const oneDayInMs = 24 * 60 * 60 * 1000;

export function verifyEmailRequestLimiter() {
  return rateLimit({
    windowMs: oneDayInMs,
    limit: 5,
    message: '이메일 인증 요청은 하루에 최대 5번까지만 가능합니다.',
  });
}

export function verifyEmailCodeLimiter() {
  return rateLimit({
    windowMs: oneDayInMs,
    limit: 5,
    message: '인증 코드는 하루에 최대 5번까지만 입력할 수 있습니다.',
  });
}

export async function authMiddleware(
  req: AuthenticatedRequest,
  _: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('토큰이 필요합니다.');
  }

  const token = authHeader.split(' ')[1];

  const decoded = verifyToken(token);

  if(await isInvalidatedToken(token)) {
    throw new UnauthorizedError('토큰이 필요합니다.');
  }

  req.member = {
    id: decoded.id,
    email: decoded.email,
    name: decoded.name,
  };
  next();
}
