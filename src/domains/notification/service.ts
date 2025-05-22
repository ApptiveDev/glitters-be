import {
  ExpoTokenInputRequest, PostCreationNotificationData,
  PostNotificationData,
} from '@/domains/notification/types';
import {
  ExpoTokenInputRequestBodySchema,
} from '@/domains/notification/schema';
import { Response } from 'express';
import {
  sendPushMessage,
  sendPushToMember,
} from '@/domains/notification/utils';
import { StatusCodes } from 'http-status-codes';
import prisma from '@/utils/database';
import { Post } from '@/schemas';

export async function handleExpoTokenInput(req: ExpoTokenInputRequest, res: Response) {
  const { token } = ExpoTokenInputRequestBodySchema.parse(req.body);
  const member = req.member!;
  await prisma.member.update({
    where: {
      id: member.id,
    },
    data: {
      expoToken: token,
    }
  });
  res.status(StatusCodes.OK).send();
}

export async function notifyPostLike(likedPost: Post) {
  const { authorId, likeCount } = likedPost;
  if(likeCount === 50 || likeCount === 100) {
    const notificationData: PostNotificationData = {
      postId: likedPost.id,
      type: 'likes',
      count: likeCount,
    };
    const result = await sendPushToMember(authorId, `당신이 올린 반짝이가 ${likeCount}번 반짝였어요!`, '반짝이 앱을 통해 확인해봐요', notificationData);
    console.log(`알림 전송: ${result?.status}`);
  }
}

export async function notifyPostView(viewedPost: Post) {
  const { authorId, viewCount } = viewedPost;
  if(viewCount === 50 || viewCount === 100) {
    const notificationData: PostNotificationData = {
      postId: viewedPost.id,
      type: 'views',
      count: viewCount,
    };
    const result = await sendPushToMember(authorId, `당신이 올린 반짝이의 조회수가 ${viewCount}회를 돌파했어요!`,
      '반짝이 앱을 통해 확인해봐요', notificationData);
    console.log(`알림 전송: ${result?.status}`);
  }
}

export async function notifyPostCreation(createdPost: Post) {
  const { institutionId } = createdPost;
  const postCount = await prisma.post.count({
    where: {
      institutionId,
      createdAt: {
        gte: new Date(new Date().getTime() - 60 * 60 * 1000),
      }
    }
  });
  if(postCount < 30) {
    return;
  }
  return sendPostsNotification(institutionId);
}

export async function sendPostsNotification(institutionId: number) {
  const notificationData: PostCreationNotificationData = {
    type: 'posts',
  };
  const members = await prisma.member.findMany({
    where: {
      institutionId,
    },
    select: {
      expoToken: true,
    }
  });
  return Promise.all(members.filter(m => m.expoToken).map((member) => {
    if(! member.expoToken){
      return;
    }
    return sendPushMessage(member.expoToken, '학교에 반짝이 다량 생성!', '반짝이맵 앱을 통해 확인해봐요', notificationData);
  }));
}
