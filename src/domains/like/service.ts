import { LikePostRequest } from '@/domains/like/types';
import { Response } from 'express';
import { LikePostRequestQuerySchema } from '@/domains/like/schema';
import prisma from '@/utils/database';
import { StatusCodes } from 'http-status-codes';
import { BadRequestError, NotFoundError } from '@/domains/error/HttpError';

export async function deleteLike(req: LikePostRequest, res: Response) {

  const { postId } = LikePostRequestQuerySchema.parse(req.query);

  const post = await prisma.post.findUnique({
    where: {
      id: postId,
    },
  });

  if (!post) {
    throw new NotFoundError('게시글을 찾을 수 없습니다.');
  }


  const like = await prisma.like.findFirst({
    where: {
      postId,
      memberId: req.member!.id,
    }
  });
  if(! like) {
    throw new BadRequestError('좋아요를 누른 게시글이 아닙니다.');
  }

  await prisma.like.deleteMany({
    where: {
      postId,
      memberId: req.member!.id,
    },
  });

  await prisma.post.update({
    where: {
      id: postId,
    },
    data: {
      likeCount: {
        decrement: 1,
      },
    },
  });

  res.status(StatusCodes.OK).send();
}

export async function createLike(req: LikePostRequest, res: Response) { const { postId } = LikePostRequestQuerySchema.parse(req.query);
  const post = await prisma.post.findUnique({
    where: {
      id: postId
    }
  });
  if(! post) {
    throw new NotFoundError('게시글을 찾을 수 없습니다.');
  }
  const like = await prisma.like.findFirst({
    where: {
      postId,
      memberId: req.member!.id,
    }
  });
  if(like) {
    throw new BadRequestError('이미 좋아요한 게시글입니다.');
  }
  await prisma.$transaction([
    prisma.like.create({
      data: {
        memberId: req.member!.id,
        postId,
      }
    }),
    prisma.post.update({
      where: { id: postId },
      data: {
        likeCount: { increment: 1 }
      }
    })
  ]);

  res.status(StatusCodes.CREATED).send();
}
