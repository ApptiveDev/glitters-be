import { AuthenticatedRequest } from '@/domains/auth/types';
import { GetActivePostCountResponse, GetMyInfoResponse } from '@/domains/member/types';
import { Response } from 'express';
import prisma from '@/utils/database';
import { Member } from '.prisma/client';
import { StatusCodes } from 'http-status-codes';
import { omitPrivateFields } from '@/domains/member/utils';

export async function getMyInfo(req: AuthenticatedRequest, res: GetMyInfoResponse) {
  const member = omitPrivateFields(req.member!);
  const hasUnreadChat = (await prisma.chat.count({
    where: {
      receiverId: member.id,
      isRead: false,
    }
  })) > 0;
  res.status(StatusCodes.OK).json({
    member: {
      ...member,
      hasUnreadChat
    }
  });
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
  res.status(StatusCodes.OK).json({ count });
}

export async function deactivateSelf(req: AuthenticatedRequest, res: Response) {
  const { member } = req;
  await deactivateMember(member!.id);
  res.status(StatusCodes.OK).send();
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
      email: null,
      name: '탈퇴한 사용자',
      password: '',
      birth: new Date('1970-01-01'),
      isDeactivated: true,
    }
  });
}
