import { AuthenticatedRequest } from '@/domains/auth/types';
import { NextFunction, Response } from 'express';
import { verifyToken } from '@/domains/auth/utils';
import prismaClient from '@/utils/database';

export async function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: '인증 토큰이 필요합니다.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token) as { id: number; email: string };

    const member = await prismaClient.member.findUnique({
      where: { id: decoded.id },
    });

    if (!member) {
      return res.status(401).json({ message: '유효하지 않은 사용자입니다.' });
    }

    req.member = member;
    next();
  } catch (error: any) {
    return res.status(401).json({
      message: '토큰 검증 실패',
      detail: error.message,
    });
  }
}
