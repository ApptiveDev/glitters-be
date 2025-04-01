import { currentApiPrefix } from '../../src/constants';
import {
  GetMarkersResponseBodySchema,
} from '../../src/domains/marker/schema';
import { ErrorSchema } from '../../src/domains/error/schema';
import { tokenHeader } from '../headers';

export const markerApiPaths = {
  [`${currentApiPrefix}/markers`]: {
    get: {
      summary: '마커 목록 조회',
      security: [{ bearerAuth: [] }],
      parameters: [tokenHeader],
      responses: {
        200: {
          description: '마커 목록 반환',
          content: {
            'application/json': {
              schema: GetMarkersResponseBodySchema,
            },
          },
        },
        400: {
          description: '요청 오류',
          content: {
            'application/json': {
              schema: ErrorSchema,
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
