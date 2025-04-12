import {
  CreatePostResponse,
  CreatePostRequest,
  GetPostRequest,
  GetPostResponse, DeletePostRequest,
} from '@/domains/post/types';
import { Response } from 'express';
import prisma from '@/utils/database';
import { sendAndTrace, sendError } from '@/utils/network';
import { StatusCodes } from 'http-status-codes';
import {
  CreatePostRequestBodySchema,
  DeletePostPathSchema,
  GetPostPathSchema,
  GetPostResponseSchema,
} from '@/domains/post/schema';
import { z } from 'zod';
import { Post } from '@/schemas';
import { PasswordExcludedMember } from '@/domains/member/types';
import redis from '@/utils/redis';

export async function getPost(req: GetPostRequest, res: GetPostResponse) {
  try {
    const { postId } = GetPostPathSchema.parse(req.params);
    const post = await prisma.post.findUnique({
      where: {
        id: postId,
        isDeactivated: false,
      },
    });
    if (!post) {
      sendError(res, '존재하지 않는 post입니다.', StatusCodes.NOT_FOUND);
      return;
    }
    delete (post as Partial<Post>).authorId;
    const ret: z.infer<typeof GetPostResponseSchema> = {
      ...post,
      isWrittenBySelf: postId === req.member?.id
    };
    await applyPostView(req.member!, post);
    res.json(ret);
  } catch(error) {
    sendAndTrace(res, error);
  }
}

export async function applyPostView(member: PasswordExcludedMember, post: Post) {
  const ttl = 60 * 60 * 24;
  const viewCountKey = `viewed:${member.id}:${post.id}`;

  if(await redis.exists(viewCountKey))
    return;
  await redis.set(viewCountKey, '1', 'EX', ttl);
  await prisma.post.update({
    data: {
      viewCount: {
        increment: 1,
      }
    },
    where: {
      id: post.id
    }
  });
}

export async function deletePost(req: DeletePostRequest, res: Response) {
  try {
    const { postId } = DeletePostPathSchema.parse(req.params);
    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      }
    });
    if(! post) {
      sendError(res, '해당하는 게시글을 찾을 수 없습니다.', StatusCodes.NOT_FOUND);
      return;
    }
    if(post.authorId !== req.member?.id) {
      sendError(res, '삭제 권한이 없습니다.', StatusCodes.BAD_REQUEST);
      return;
    }
    await prisma.post.update({
      where: {
        id: post.id,
      },
      data: {
        isDeactivated: true,
      }
    });
    res.json({ message: '삭제가 완료되었습니다.' });
  } catch(error) {
    sendAndTrace(res, error);
  }
}

export async function createPost(req: CreatePostRequest, res: CreatePostResponse) {
  try {
    const { latitude, longitude, title, content, addressDetail, address } = CreatePostRequestBodySchema.parse(req.body);
    const expiresAt = new Date((new Date()).getTime() + 24 * 60 * 60 * 1000);
    const post = await prisma.post.create({
      data: {
        title,
        content,
        addressDetail,
        address,
        expiresAt: expiresAt,
        authorId: req.member?.id as number,
      }
    });
    const marker = await prisma.marker.create({
      data: {
        postId: post.id,
        longitude,
        latitude,
      }
    });
    res.json({
      markerId: marker.id,
      postId: post.id,
    });
  } catch(error) {
    sendAndTrace(res, error);
  }
}
