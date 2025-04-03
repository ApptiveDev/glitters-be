import { AuthenticatedRequest } from '@/domains/auth/types';
import { GetActivePostCountResponse, GetMyInfoResponse } from '@/domains/member/types';
import prisma from '@/utils/database';

export async function getMyInfo(req: AuthenticatedRequest, res: GetMyInfoResponse) {
  res.json({ member: req.member });
}

export async function getActivePostCount(req: AuthenticatedRequest, res: GetActivePostCountResponse) {
  const memberId = req.member?.id as number;
  const count = await prisma.post.count({
    where: {
      authorId: memberId,
      expiresAt: {
        gt: new Date(),
      }
    }
  });
  res.json({ count });
}
