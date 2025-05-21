import {
  PostCreationNotificationData
} from '../src/domains/notification/types';
import { sendPushToMember } from '../src/domains/notification/utils';

import 'dotenv/config';

const mockMemberId = 11;

async function main() {
  const notificationData: PostCreationNotificationData = {
    type: 'posts',
  };
  console.log(process.env.EXPO_ACCESS_TOKEN);
  const result = await sendPushToMember(mockMemberId, '반짝이 대량 생성!', '반짝이맵 앱에서 확인해보세요.', notificationData);
  console.log('알림 전달 완료', result);
}
main();
