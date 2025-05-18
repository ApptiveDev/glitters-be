import { AuthenticatedRequest } from '@/domains/auth/types';
import {
  GetActivePostCountResponse,
  GetMyInfoResponse,
} from '@/domains/member/types';
import { Response } from 'express';
import prisma from '@/utils/database';
import { Member } from '.prisma/client';
import { StatusCodes } from 'http-status-codes';
import { omitPrivateFields } from '@/domains/member/utils';
import { deleteAllChatsByMember } from '@/domains/chat/service';
import { unlinkPostsByMember } from '@/domains/post/service';
import { saveInvalidatedToken } from '@/domains/auth/service';

export async function getMyInfo(req: AuthenticatedRequest, res: GetMyInfoResponse) {
  const memberId = req.member!.id;
  const internalMember = await prisma.member.findUniqueOrThrow({
    where: {
      id: memberId,
    },
    include: {
      institution: true,
    }
  });
  const member = omitPrivateFields(internalMember);
  const hasUnreadChat = (await prisma.chat.count({
    where: {
      receiverId: memberId,
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
  const authHeader = req.headers.authorization;
  const token = authHeader!.split(' ')[1];
  await saveInvalidatedToken(token);
  await maskMember(member!.id);
  await deleteAllChatsByMember(member!);
  await unlinkPostsByMember(member!);
  res.status(StatusCodes.OK).send();
}

export async function maskMember(member: Member | number) {
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
      gender: 3,
      expoToken: null,
    }
  });
}
