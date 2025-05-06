import { currentApiPrefix } from '../../../src/constants';
import { tokenHeader } from '../headers';
import { ErrorSchema } from '../../../src/domains/error/schema';
import { ZodOpenApiPathsObject } from 'zod-openapi';
import {
  ExpoTokenInputRequestBodySchema,
  LocationInputRequestBodySchema,
} from '../../../src/domains/notification/schema';

export const notificationApiPaths: ZodOpenApiPathsObject = {
  [`${currentApiPrefix}/locations`]: {
    post: {
      summary: '위치정보 제공',
      security: [{bearerAuth: []}],
      parameters: [tokenHeader],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: LocationInputRequestBodySchema,
          }
        }
      },
      responses: {
        200: {
          description: '위치정보 제공 성공'
        },
        400: {
          description: '권한 없음',
          content: {
            'application/json': {
              schema: ErrorSchema,
            }
          }
        }
      }
    },
  },
  [`${currentApiPrefix}/notifications`]: {
    put: {
      summary: '푸쉬토큰 업데이트',
      security: [{bearerAuth: []}],
      parameters: [tokenHeader],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: ExpoTokenInputRequestBodySchema,
          }
        }
      },
      responses: {
        200: {
          description: '푸쉬토큰 업데이트 성공'
        },
        400: {
          description: '권한 없음',
          content: {
            'application/json': {
              schema: ErrorSchema,
            }
          }
        }
      }
    },
  }
};
