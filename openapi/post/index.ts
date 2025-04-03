import { currentApiPrefix } from '../../src/constants';
import { tokenHeader } from '../headers';
import {
  CreatePostRequestBodySchema,
  CreatePostResponseBodySchema,
  GetPostResponseSchema,
} from '../../src/domains/post/schema';
import { ErrorSchema } from '../../src/domains/error/schema';
import { ZodOpenApiPathsObject } from 'zod-openapi';

export const postApiPaths: ZodOpenApiPathsObject = {
  [`${currentApiPrefix}/posts/{post_id}`]: {
    get: {
      summary: '게시글 단일 조회',
      security: [{ bearerAuth: [] }],
      parameters: [tokenHeader],
      responses: {
        200: {
          description: '게시글 조회 성공',
          content: {
            'application/json': {
              schema: GetPostResponseSchema,
            },
          },
        },
        404: {
          description: '게시글 없음',
          content: {
            'application/json': {
              schema: ErrorSchema,
            },
          },
        },
      },
    },
    delete: {
      summary: '게시글 삭제',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: '삭제 성공',
        },
        400: {
          description: '삭제 권한 없음',
          content: {
            'application/json': {
              schema: ErrorSchema,
            },
          },
        },
        404: {
          description: '게시글 없음',
          content: {
            'application/json': {
              schema: ErrorSchema,
            },
          },
        },
      },
    },
  },
  [`${currentApiPrefix}/posts`]: {
    post: {
      summary: '게시글 생성',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: CreatePostRequestBodySchema,
          },
        },
      },
      responses: {
        200: {
          description: '생성 성공',
          content: {
            'application/json': {
              schema: CreatePostResponseBodySchema,
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
