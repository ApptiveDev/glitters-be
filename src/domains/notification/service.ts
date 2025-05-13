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
import { getNearbyMarkerCount } from '@/domains/marker/service';
import { StatusCodes } from 'http-status-codes';
import prisma from '@/utils/database';

export async function handleLocationInput(req: LocationInputRequest, res: Response) {
  const { latitude, longitude } = LocationInputRequestBodySchema.parse(req.body);
  const postCount = await getNearbyMarkerCount(latitude, longitude);
  if(postCount === 0) {
    return;
  }
  await sendPushToMember(req.member!, `주변에 ${postCount}개 반짝이가 올라왔어요!`, '반짝이 앱을 통해 확인해봐요');
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
