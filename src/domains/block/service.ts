import { BlockRequest } from '@/domains/block/types';
import { Response } from 'express';
import { BlockRequestQuerySchema } from '@/domains/block/schema';
import { BadRequestError, NotFoundError } from '@/domains/error/HttpError';
import prisma from '@/utils/database';
import { InternalMember } from '@/domains/member/types';
import { z } from 'zod';
import { StatusCodes } from 'http-status-codes';

export async function blockByPostOrChatroom(req: BlockRequest, res: Response) {
  const member = req.member!;
  const { postId, chatroomId, blockType } = BlockRequestQuerySchema.parse(req.query);

  if(blockType === 'post' && ! postId || blockType === 'chatroom' && ! chatroomId) {
    throw new BadRequestError('blockType에 맞춰 채팅방 또는 게시글 id를 입력해주세요');
  }

  let isBlocked = false;
  if(blockType === 'post') {
    isBlocked = await blockByPostId(member, { postId, blockType });
  } else {
    isBlocked = await blockByChatroomId(member, { chatroomId, blockType });
  }

  if(! isBlocked) {
    throw new NotFoundError('존재하지 않는 게시글입니다.');
  }
  res.status(StatusCodes.CREATED).send();
}

export async function blockByChatroomId(member: InternalMember, blockInput: z.infer<typeof BlockRequestQuerySchema> ) {
  const chatroomId = blockInput.chatroomId!;
  const chatroom = await prisma.chatRoom.findUnique(
    { where: { id: chatroomId }, select: { authorId: true, requesterId: true } });
  if(!chatroom) {
    return false;
  }
  const { authorId, requesterId } = chatroom;
  const targetId = authorId === member.id ? requesterId : authorId;
  const isAlreadyBlocked = await isBlocked(member.id, targetId);
  if(isAlreadyBlocked) {
    return true;
  }
  await createBlock(member.id, targetId, blockInput);
  await prisma.chatRoom.update({
    where: {
      id: chatroomId,
    },
    data: {
      isDeactivated: true,
    }
  });
  return true;
}

export async function blockByPostId(member: InternalMember, blockInput: z.infer<typeof BlockRequestQuerySchema> ) {
  const postId = blockInput.postId!;
  const post = await prisma.post.findUnique({ where: { id: postId }, select: { authorId: true } });
  if(!post) {
    return false;
  }
  const { authorId } = post;
  const isAlreadyBlocked = await isBlocked(member.id, authorId);
  if(isAlreadyBlocked) {
    return true;
  }
  await createBlock(member.id, authorId, blockInput);
  return true;
}

export async function createBlock(issuerId: number, targetId: number, blockInput: z.infer<typeof BlockRequestQuerySchema> ) {
  if(blockInput.blockType === 'post') {
    await prisma.block.create({
      data: {
        postId: blockInput.postId!,
        issuerId,
        targetId,
      }
    });
    return;
  }
  await prisma.block.create({
    data: {
      chatroomId: blockInput.chatroomId!,
      issuerId,
      targetId,
    }
  });
}

export async function isBlocked(issuerId: number, targetId: number) {
  const block = await prisma.block.findFirst({
    where: {
      issuerId,
      targetId,
    },
  });
  return block !== null;
}

export async function getBlockedMembers(issuer: InternalMember | number) {
  if(typeof issuer === 'object')
    issuer = issuer.id;
  const blocks = await prisma.block.findMany({
    where: {
      issuerId: issuer,
    },
    select: {
      targetId: true,
    }
  });
  return blocks.map(block => block.targetId);
}
