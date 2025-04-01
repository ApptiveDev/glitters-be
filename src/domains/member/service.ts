import { sendError } from '@/utils/network';
import { StatusCodes } from 'http-status-codes';
import { AuthenticatedRequest } from '@/domains/auth/types';
import { GetMyInfoResponse } from '@/domains/member/types';

export async function getMyInfo(req: AuthenticatedRequest, res: GetMyInfoResponse) {
  if (!req.member) {
    sendError(res, '토큰이 필요합니다.', StatusCodes.UNAUTHORIZED);
    return;
  }
  res.json({ member: req.member });
}
