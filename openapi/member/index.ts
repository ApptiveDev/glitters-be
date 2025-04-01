import { currentApiPrefix } from '../../src/constants';
import {
  GetMyInfoSchema,
} from '../../src/domains/member/schema';
import { ErrorSchema } from '../../src/domains/error/schema';
import { tokenHeader } from '../headers';

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
              schema: GetMyInfoSchema
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
