import {
  AuthenticatedRequest,
} from '@/domains/auth/types';
import { NextFunction, Response } from 'express';
import { verifyToken } from '@/domains/auth/utils';
import prisma from '@/utils/database';
import { sendAndTrace, sendError } from '@/utils/network';
import { StatusCodes } from 'http-status-codes';

export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    sendError(res, '토큰이 필요합니다.', StatusCodes.BAD_REQUEST);
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
      sendError(res, '토큰 검증 실패', StatusCodes.BAD_REQUEST);
      return;
    }

    req.member = member;
    next();
  } catch (error: any) {
    sendAndTrace(res, error);
  }
}
