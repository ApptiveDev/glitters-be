import Expo, { ExpoPushMessage } from 'expo-server-sdk';
import { InternalMember } from '@/domains/member/types';
import prisma from '@/utils/database';
import { NotificationData } from '@/domains/notification/types';

const expo = new Expo({
  accessToken: process.env.EXPO_ACCESS_TOKEN,
});

export async function sendPushMessage(token: string, title: string, body: string, payload?: NotificationData) {
  const message: ExpoPushMessage = {
    to: token,
    sound: 'default',
    title,
    body,
    ...(payload ? { data: payload } : {}),
  };
  const [result] = await expo.sendPushNotificationsAsync([message]);
  return result;
}

export async function sendPushToMember(member: InternalMember | number, title: string, body: string, payload?: NotificationData) {
  if(typeof member === 'object') {
    member = member.id;
  }
  const prismaMember = await prisma.member.findUnique({
    where: {
      id: member,
      isDeactivated: false,
    },
    select: {
      expoToken: true,
    }
  });
  if(! prismaMember || ! prismaMember.expoToken) {
    console.error(`Trying to send notification to invalid member or nullified token ${member}`);
    return;
  }
  const { expoToken: token } = prismaMember;
  if(! Expo.isExpoPushToken(token)) {
    console.error(`Invalid push token for member id ${member}`);
    // revoke
    await prisma.member.update({
      where: {
        id: member,
      },
      data: {
        expoToken: null
      }
    });
    return {
      status: 'error',
    };
  }
  return sendPushMessage(token, title, body, payload);
}
