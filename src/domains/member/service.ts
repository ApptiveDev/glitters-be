import { sendError } from '@/utils/network';
import { StatusCodes } from 'http-status-codes';
import { Response } from 'express';
import { AuthenticatedRequest } from '@/domains/auth/types';

export async function getMyInfo(req: AuthenticatedRequest, res: Response) {
  if (!req.member) {
    sendError(res, '토큰이 필요합니다.', StatusCodes.UNAUTHORIZED);
    return;
  }
  res.json({ member: req.member });
}
