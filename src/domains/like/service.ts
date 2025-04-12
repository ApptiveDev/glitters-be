import { LikePostRequest } from '@/domains/like/types';
import { Response } from 'express';
import { LikePostRequestQuerySchema } from '@/domains/like/schema';
import { sendAndTrace, sendError } from '@/utils/network';
import prisma from '@/utils/database';
import { StatusCodes } from 'http-status-codes';

export async function deleteLike(req: LikePostRequest, res: Response) {
  try {
    const { postId } = LikePostRequestQuerySchema.parse(req.query);

    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
    });

    if (!post) {
      sendError(res, '게시글을 찾을 수 없습니다.', StatusCodes.NOT_FOUND);
      return;
    }


    const like = await prisma.like.findFirst({
      where: {
        postId,
        memberId: req.member!.id,
      }
    });
    if(! like) {
      sendError(res, '좋아요를 누른 게시글이 아닙니다.', StatusCodes.BAD_REQUEST);
      return;
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
  } catch (error) {
    sendAndTrace(res, error);
  }
}

export async function createLike(req: LikePostRequest, res: Response) {
  try {
    const { postId } = LikePostRequestQuerySchema.parse(req.query);
    const post = await prisma.post.findUnique({
      where: {
        id: postId
      }
    });
    if(! post) {
      sendError(res, '게시글을 찾을 수 없습니다.', StatusCodes.NOT_FOUND);
      return;
    }
    const like = await prisma.like.findFirst({
      where: {
        postId,
        memberId: req.member!.id,
      }
    });
    if(like) {
      sendError(res, '이미 좋아요한 게시글입니다.', StatusCodes.BAD_REQUEST);
      return;
    }
    // TODO: Transaction
    await prisma.like.create({
      data: {
        memberId: req.member!.id,
        postId,
      }
    });
    await prisma.post.update({
      where: {
        id: postId
      },
      data: {
        likeCount: {
          increment: 1,
        }
      }
    });
    res.status(StatusCodes.CREATED).send();
  } catch (error) {
    sendAndTrace(res, error);
  }
}