import {
  AuthenticatedRequest,
} from '@/domains/auth/types';
import { NextFunction, Response } from 'express';
import { verifyToken } from '@/domains/auth/utils';
import prisma from '@/utils/database';
import { sendAndTrace, sendError } from '@/utils/network';
import { StatusCodes } from 'http-status-codes';
import rateLimit from 'express-rate-limit';

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
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    sendError(res, '토큰이 필요합니다.', StatusCodes.UNAUTHORIZED);
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token);

    const member = await prisma.member.findUnique({
      where: { id: decoded.id },
      omit: {
        password: true,
      },
    });

    if (!member) {
      sendError(res, '토큰 검증 실패', StatusCodes.UNAUTHORIZED);
      return;
    }

    req.member = member;
    next();
  } catch (error: any) {
    sendAndTrace(res, error);
  }
}
