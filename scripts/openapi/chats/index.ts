import { currentApiPrefix } from '../../../src/constants';
import { tokenHeader } from '../headers';
import {
  CreateChatroomRequestBodySchema,
  CreateChatroomResponseSchema, GetChatroomsResponseBodySchema,
} from '../../../src/domains/chat/schema';
import { ErrorSchema } from '../../../src/domains/error/schema';

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
        403: {
          description: '차단되어 채팅방을 생성할 수 없음',
          content: {
            'application/json': {
              schema: ErrorSchema,
            },
          }
        }
      },
    },
  },
};
