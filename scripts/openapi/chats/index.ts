import { currentApiPrefix } from '../../../src/constants';
import { tokenHeader } from '../headers';
import {
  CreateChatroomRequestBodySchema,
  CreateChatroomResponseSchema,
  GetChatroomsResponseBodySchema,
  GetChatsRequestQuerySchema,
  GetChatsResponseBodySchema,
} from '../../../src/domains/chat/schema';
import { ErrorSchema } from '../../../src/domains/error/schema';

export const chatApiPaths = {
  [`${currentApiPrefix}/chatrooms/:id`]: {
    delete: {
      summary: '채팅방 비활성화 (나가기)',
      security: [{ bearerAuth: [] }],
      parameters: [tokenHeader],
      responses: {
        200: {
          description: '채팅방 나가기 완료',
        },
        403: {
          description: '본인이 참여하지 않은 채팅방 나가기 시도',
          content: {
            'application/json': {
              schema: ErrorSchema,
            }
          }
        }
      }
    },
    get: {
      summary: '채팅방의 채팅 내역 반환. 채팅 id값이 cursor-(limit+1)~cursor-1 인 채팅을 반환.',
      security: [{ bearerAuth: [] }],
      parameters: [tokenHeader],
      requestParams: {
        query: GetChatsRequestQuerySchema,
      },
      responses: {
        200: {
          description: 'id값이 cursor-(limit+1)~cursor-1 인 채팅을 반환.',
          content: {
            'application/json': {
              schema: GetChatsResponseBodySchema,
            }
          }
        },
        403: {
          description: '본인이 참여하지 않은 채팅방 정보 조회 시도',
          content: {
            'application/json': {
              schema: ErrorSchema,
            }
          }
        }
      }
    }
  },
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
