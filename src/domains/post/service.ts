import {
  CreatePostResponse,
  CreatePostRequest,
  GetPostRequest,
  GetPostResponse, DeletePostRequest,
} from '@/domains/post/types';
import { Response } from 'express';
import prisma from '@/utils/database';
import { StatusCodes } from 'http-status-codes';
import {
  CreatePostRequestBodySchema,
  DeletePostPathSchema,
  GetPostPathSchema,
  GetPostResponseSchema,
} from '@/domains/post/schema';
import { z } from 'zod';
import { Post } from '@/schemas';
import { InternalMember, PublicMember } from '@/domains/member/types';
import redis from '@/utils/redis';
import { BadRequestError, NotFoundError } from '@/domains/error/HttpError';

export async function getPost(req: GetPostRequest, res: GetPostResponse) {
  const { postId } = GetPostPathSchema.parse(req.params);
  let post = await prisma.post.findUnique({
    where: {
      id: postId,
      isDeactivated: false,
    },
  });
  if (!post) {
    throw new NotFoundError('존재하지 않는 post입니다.');
  }
  post = await applyPostView(req.member!, post);
  const liked = await prisma.like.findFirst({
    where: {
      postId,
      memberId: req.member!.id,
    }
  });
  const isWrittenBySelf = post.authorId === req.member?.id;
  delete (post as Partial<Post>).authorId;
  const ret: z.infer<typeof GetPostResponseSchema> = {
    ...post,
    isWrittenBySelf,
    isLikedBySelf: !!liked,
  };
  res.status(StatusCodes.OK).json(ret);
}

export async function applyPostView(member: PublicMember, post: Post) {
  const ttl = 60 * 60 * 24;
  const viewCountKey = `viewed:${member.id}:${post.id}`;

  if(await redis.exists(viewCountKey))
    return post;
  await redis.set(viewCountKey, '1', 'EX', ttl);
  return prisma.post.update({
    data: {
      viewCount: {
        increment: 1,
      }
    },
    where: {
      id: post.id
    }
  })!;
}

export async function deletePost(req: DeletePostRequest, res: Response) {
  const { postId } = DeletePostPathSchema.parse(req.params);
  const post = await prisma.post.findUnique({
    where: {
      id: postId,
    }
  });
  if(! post) {
    throw new NotFoundError('해당하는 게시글을 찾을 수 없습니다.');
  }
  if(post.authorId !== req.member?.id) {
    throw new BadRequestError('삭제 권한이 없습니다.');
  }
  await prisma.post.update({
    where: {
      id: post.id,
    },
    data: {
      isDeactivated: true,
      markerId: null,
    }
  });
  res.status(StatusCodes.OK).json({ message: '삭제가 완료되었습니다.' });
}

export async function createPost(req: CreatePostRequest, res: CreatePostResponse) {
  const { latitude, longitude, title, content, address, iconIdx } = CreatePostRequestBodySchema.parse(req.body);
  const expiresAt = new Date((new Date()).getTime() + 24 * 60 * 60 * 1000);
  const marker = await prisma.marker.create({
    data: {
      longitude,
      latitude,
    }
  });
  const post = await prisma.post.create({
    data: {
      title,
      content,
      address,
      iconIdx,
      expiresAt,
      authorId: req.member?.id as number,
      markerId: marker.id,
    }
  });
  res.status(StatusCodes.OK).json({
    markerId: marker.id,
    postId: post.id,
  });
}

export function unlinkPostsByMember(member: InternalMember) {
  const { id } = member;
  return prisma.post.updateMany({
    where: {
      authorId: id,
      markerId: { not: null }
    },
    data: {
      markerId: null
    }
  });
}

export async function unlinkExpiredMarkers() {
  const now = new Date();

  const result = await prisma.post.updateMany({
    where: {
      expiresAt: { lt: now },
      markerId: { not: null }
    },
    data: {
      markerId: null
    }
  });

  if (result.count > 0) {
    console.log(`[${now.toISOString()}] Unlinked ${result.count} expired markers.`);
  }
}
