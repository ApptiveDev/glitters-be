import {
  ExpoTokenInputRequest,
  LocationInputRequest,
  NearbyNotificationData,
  PostNotificationData,
} from '@/domains/notification/types';
import {
  ExpoTokenInputRequestBodySchema,
  LocationInputRequestBodySchema,
} from '@/domains/notification/schema';
import { Response } from 'express';
import { sendPushToMember } from '@/domains/notification/utils';
import {
  getNearbyMarkerInfo,
} from '@/domains/marker/service';
import { StatusCodes } from 'http-status-codes';
import prisma from '@/utils/database';
import { getStoredLocations, storeLocation } from '@/domains/location/store';
import {
  isNotified,
  storeNotificationStatus,
} from '@/domains/notification/store';
import { Post } from '@/schemas';

export async function handleLocationInput(req: LocationInputRequest, res: Response) {
  const { latitude, longitude } = LocationInputRequestBodySchema.parse(req.body);
  await storeLocation(req.member!.id, latitude, longitude);
  res.status(StatusCodes.OK).send();
}

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
    await sendPushToMember(authorId, `당신이 올린 반짝이가 ${likeCount}번 반짝였어요!`, '반짝이 앱을 통해 확인해봐요', notificationData);
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
    await sendPushToMember(authorId, `당신이 올린 반짝이의 조회수가 ${viewCount}회를 돌파했어요!`,
      '반짝이 앱을 통해 확인해봐요', notificationData);
  }
}

export async function notifyPostCreation() {
  const locations = await getStoredLocations();
  if(! locations) {
    return;
  }
  for (const [memberIdString, location] of Object.entries(locations)) {
    const memberId = Number(memberIdString);
    const [latitude, longitude] = location;
    const nearbyMarkerInfo = await getNearbyMarkerInfo(memberId, latitude, longitude);
    const { markerCount, nearestMarker } = nearbyMarkerInfo;

    if(nearbyMarkerInfo.markerCount < 10 || await isNotified(memberId)) {
      return;
    }
    const nearbyNotificationData: NearbyNotificationData = {
      type: 'nearby',
      markerCount,
      nearestMarker,
    };
    await storeNotificationStatus(memberId);
    await sendPushToMember(memberId, '주변에 반짝이 대량 생성!', '반짝이 앱을 통해 확인해봐요',
      nearbyNotificationData);
  }
}
