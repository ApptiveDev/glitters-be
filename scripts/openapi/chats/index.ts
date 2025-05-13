import { currentApiPrefix } from '../../../src/constants';
import { tokenHeader } from '../headers';
import {
  CreateChatroomRequestBodySchema,
  CreateChatroomResponseSchema, GetChatroomsResponseBodySchema,
} from '../../../src/domains/chat/schema';

export const chatApiPaths = {
  [`${currentApiPrefix}/chatrooms`]: {
    get: {
      summary: '채팅방 정보 반환',
      security: [{ bearerAuth: [] }],
      parameters: [tokenHeader],
      responses: {
        200: {
          description: '채팅방 정보 반환 성공',
          content: {
            'application/json': {
              schema: GetChatroomsResponseBodySchema,
            }
          }
        }
      }
    },
    post: {
      summary: '채팅방 생성',
      security: [{ bearerAuth: [] }],
      parameters: [tokenHeader],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: CreateChatroomRequestBodySchema,
          },
        },
      },
      responses: {
        200: {
          description: '채팅방 생성 완료',
          content: {
            'application/json': {
              schema: CreateChatroomResponseSchema,
            },
          },
        },
      },
    },
  },
};
