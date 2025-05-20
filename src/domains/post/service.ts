import {
  CreatePostResponse,
  CreatePostRequest,
  GetPostRequest,
  GetPostResponse,
  DeletePostRequest,
  GetCreationAvailabilityResponse,
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
import { AuthenticatedRequest } from '@/domains/auth/types';
import {
  notifyPostCreation,
  notifyPostView,
} from '@/domains/notification/service';

export async function getPost(req: GetPostRequest, res: GetPostResponse) {
  const { postId } = GetPostPathSchema.parse(req.params);
  let post = await prisma.post.findUnique({
    where: {
      id: postId,
      isDeactivated: false,
    },
  });
  if (!post) {
    throw new NotFoundError('존재하지 않는 게시글입니다.');
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

export async function getCreationAvailability(req: AuthenticatedRequest, res: GetCreationAvailabilityResponse) {
  const member = req.member!;
  const { isAvailable, nextAvailableAt } = await canCreatePost(member);
  res.status(StatusCodes.OK).json({
    isAvailable,
    nextAvailableAt,
  });
}

export async function canCreatePost(member: number | InternalMember): Promise<{
  isAvailable: boolean;
  nextAvailableAt: Date | null
}> {
  if (typeof member === 'object') {
    member = member.id;
  }
  const postCount = await countPostsInLast24Hours(member);
  const lastCreationTime = await getLatestPostCreationTime(member);

  if (postCount >= 10) {
    return {
      isAvailable: false,
      nextAvailableAt: new Date(
        lastCreationTime!.getTime() + 24 * 60 * 60 * 1000),
    };
  }

  if (!lastCreationTime) {
    return {
      isAvailable: true,
      nextAvailableAt: null,
    };
  }

  const timeDiff = (new Date()).getTime() - lastCreationTime.getTime();
  if (timeDiff < 1000 * 60 * 10) {
    return {
      isAvailable: false,
      nextAvailableAt: new Date(lastCreationTime.getTime() + 1000 * 60 * 10),
    };
  }

  return {
    isAvailable: true,
    nextAvailableAt: null,
  };
}

export async function applyPostView(member: PublicMember, post: Post) {
  const ttl = 60 * 60 * 24;
  const viewCountKey = `viewed:${member.id}:${post.id}`;

  if(await redis.exists(viewCountKey))
    return post;
  await redis.set(viewCountKey, '1', 'EX', ttl);
  await notifyPostView(post);
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
  const { latitude, longitude, title, content, address, iconIdx, markerIdx } = CreatePostRequestBodySchema.parse(req.body);
  await notifyPostCreation();
  const { isAvailable, nextAvailableAt } = await canCreatePost(req.member!);
  if(! isAvailable) {
    throw new BadRequestError(`아직 게시글을 생성할 수 없습니다. 다음 생성 가능 시간: ${nextAvailableAt}`);
  }
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
      markerIdx,
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

export async function getLatestPostCreationTime(member: number | InternalMember) {
  if(typeof member !== 'number') {
    member = member.id;
  }
  const latestPost = await prisma.post.findFirst({
    where: {
      authorId: member,
      isDeactivated: false,
    },
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      createdAt: true,
    },
  });

  return latestPost?.createdAt ?? null;
}

export function countPostsInLast24Hours(member: number | InternalMember){
  if(typeof member !== 'number') {
    member = member.id;
  }
  const gte = new Date(Date.now() - 24 * 60 * 60 * 1000);

  return prisma.post.count({
    where: {
      authorId: member,
      createdAt: {
        gte,
      },
      isDeactivated: false,
    },
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
