import { AuthenticatedRequest } from '@/domains/auth/types';
import { GetActivePostCountResponse, GetMyInfoResponse } from '@/domains/member/types';
import prisma from '@/utils/database';
import { Member } from '.prisma/client';

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

export async function deactivateMember(member: Member | number) {
  if(typeof member !== 'number') {
    member = member.id;
  }
  await prisma.member.update({
    where: {
      id: member,
    },
    data: {
      email: '',
      name: '탈퇴한 사용자',
      password: '',
      isDeactivated: true,
    }
  });
}
