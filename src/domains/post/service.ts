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
} from '@/domains/post/schema';

export async function getPost(req: GetPostRequest, res: GetPostResponse) {
  try {
    const { post_id: postId } = GetPostPathSchema.parse(req.params);
    const post = await prisma.post.findUnique({
      where: {
        id: postId
      },
      omit: {
        author_id: true,
      }
    });
    if (!post) {
      sendError(res, '존재하지 않는 post입니다.', StatusCodes.NOT_FOUND);
      return;
    }
    res.json(post);
  } catch(error) {
    sendAndTrace(res, error);
  }
}

export async function deletePost(req: DeletePostRequest, res: Response) {
  try {
    const { post_id: postId } = DeletePostPathSchema.parse(req.params);
    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      }
    });
    if(! post) {
      sendError(res, '해당하는 게시글을 찾을 수 없습니다.', StatusCodes.NOT_FOUND);
      return;
    }
    if(post.author_id !== req.member?.id) {
      sendError(res, '삭제 권한이 없습니다.', StatusCodes.BAD_REQUEST);
      return;
    }
    res.json({ message: '삭제가 완료되었습니다.' });
  } catch(error) {
    sendAndTrace(res, error);
  }
}

export async function createPost(req: CreatePostRequest, res: CreatePostResponse) {
  try {
    const { latitude, longitude, title, content, address_detail, address } = CreatePostRequestBodySchema.parse(req.body);
    const expiresAt = new Date((new Date()).getTime() + 24 * 60 * 60 * 1000);
    const post = await prisma.post.create({
      data: {
        title,
        content,
        address_detail,
        address,
        expires_at: expiresAt,
        author_id: req.member?.id as number,
      }
    });
    const marker = await prisma.marker.create({
      data: {
        post_id: post.id,
        longitude,
        latitude,
      }
    });
    res.json({
      marker_id: marker.id,
      post_id: post.id,
    });
  } catch(error) {
    sendAndTrace(res, error);
  }
}
