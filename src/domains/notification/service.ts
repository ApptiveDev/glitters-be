import {
  ExpoTokenInputRequest,
  LocationInputRequest,
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

export async function notifyPostCreation() {
  const locations = await getStoredLocations();
  if(! locations) {
    return;
  }
  for (const [memberIdString, location] of Object.entries(locations)) {
    const memberId = Number(memberIdString);
    const [latitude, longitude] = location;
    const nearbyMarkerInfo = await getNearbyMarkerInfo(memberId, latitude, longitude);

    if(nearbyMarkerInfo.markerCount < 10 || await isNotified(memberId)) {
      return;
    }
    await storeNotificationStatus(memberId);
    await sendPushToMember(memberId, `주변에 ${nearbyMarkerInfo.markerCount}개 반짝이가 올라왔어요!`, '반짝이 앱을 통해 확인해봐요', {
      ...nearbyMarkerInfo,
      type: 'nearby',
    });
  }
}
