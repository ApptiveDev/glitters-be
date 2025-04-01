import { currentApiPrefix } from '../../src/constants';
import {
  GetInstitutionsResponseBodySchema,
  GetInstitutionBoundsResponseBodySchema,
} from '../../src/domains/institution/schema';
import { ErrorSchema } from '../../src/domains/error/schema';
import { tokenHeader } from '../headers';

export const institutionApiPaths = {
  [`${currentApiPrefix}/institutions`]: {
    get: {
      summary: '기관 목록 조회',
      security: [{ bearerAuth: [] }],
      parameters: [tokenHeader],
      responses: {
        200: {
          description: '기관 목록 반환',
          content: {
            'application/json': {
              schema: GetInstitutionsResponseBodySchema,
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
      },
    },
  },

  [`${currentApiPrefix}/institutions/bounds`]: {
    get: {
      summary: '기관 경계 정보 조회',
      security: [{ bearerAuth: [] }],
      parameters: [tokenHeader],
      responses: {
        200: {
          description: '기관 경계 정보 반환',
          content: {
            'application/json': {
              schema: GetInstitutionBoundsResponseBodySchema,
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
      },
    },
  },
};
