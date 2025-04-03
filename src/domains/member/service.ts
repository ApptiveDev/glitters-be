import { AuthenticatedRequest } from '@/domains/auth/types';
import { GetLastPostResponse, GetMyInfoResponse } from '@/domains/member/types';
import prisma from '@/utils/database';

export async function getMyInfo(req: AuthenticatedRequest, res: GetMyInfoResponse) {
  res.json({ member: req.member });
}

export async function getLastCreatedPost(req: AuthenticatedRequest, res: GetLastPostResponse) {
  const memberId = req.member?.id as number;
  const createdAt = await prisma.post.findFirst({
    where: {
      authorId: memberId,
      isDeleted: false,
    },
    select: {
      createdAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    }
  });
  if(! createdAt) {
    res.json({ createdAt: new Date('1970-01-01') });
    return;
  }
  res.json(createdAt);
}
