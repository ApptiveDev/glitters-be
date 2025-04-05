import { currentApiPrefix } from '../../src/constants';
import { tokenHeader } from '../headers';
import {
  GetMyInfoSchema,
  GetActivePostCountResponseBodySchema,
} from '../../src/domains/member/schema';
import { ErrorSchema } from '../../src/domains/error/schema';

export const memberApiPaths = {
  [`${currentApiPrefix}/members/me`]: {
    get: {
      summary: '내 정보 조회',
      security: [{ bearerAuth: [] }],
      parameters: [tokenHeader],
      responses: {
        200: {
          description: '회원 정보 반환',
          content: {
            'application/json': {
              schema: GetMyInfoSchema,
            },
          },
        },
        401: {
          description: '인증 실패 또는 토큰 누락',
          content: {
            'application/json': {
              schema: ErrorSchema,
            },
          },
        },
      },
    },
  },

  [`${currentApiPrefix}/members/active_posts`]: {
    get: {
      summary: '하루동안 생성한 게시글 개수 조회',
      security: [{ bearerAuth: [] }],
      parameters: [tokenHeader],
      responses: {
        200: {
          description: '24시간 이내 작성한 게시글 개수 반환',
          content: {
            'application/json': {
              schema: GetActivePostCountResponseBodySchema,
            },
          },
        },
        401: {
          description: '인증 실패 (토큰 누락 또는 유효하지 않음)',
          content: {
            'application/json': {
              schema: ErrorSchema,
            },
          },
        },
      },
    },
  },
};
