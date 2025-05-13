import Expo, { ExpoPushMessage } from 'expo-server-sdk';
import { InternalMember } from '@/domains/member/types';
import prisma from '@/utils/database';

const expo = new Expo({
  accessToken: process.env.EXPO_ACCESS_TOKEN,
});

export async function sendPushMessage(token: string, title: string, body: string) {
  const message: ExpoPushMessage = {
    to: token,
    sound: 'default',
    title,
    body,
  };
  const [result] = await expo.sendPushNotificationsAsync([message]);
  return result;
}

export async function sendPushToMember(member: InternalMember, title: string, body: string) {
  const { expoToken: token } = member;
  if(! Expo.isExpoPushToken(token)) {
    console.error(`Invalid push token for member id ${member.id}`);
    // revoke
    await prisma.member.update({
      where: {
        id: member.id,
      },
      data: {
        expoToken: null
      }
    });
    return {
      status: 'error',
    };
  }
  return sendPushMessage(token, title, body);
}
