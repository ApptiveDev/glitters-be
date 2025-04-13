import { ErrorSchema } from '../../../src/domains/error/schema';
import { currentApiPrefix } from '../../../src/constants';
import { tokenHeader } from '../headers';
import { LikePostRequestQuerySchema } from '../../../src/domains/like/schema';

export const likeApiPaths = {
  [`${currentApiPrefix}/likes`]: {
    post: {
      summary: '게시글 좋아요 추가',
      security: [{bearerAuth: []}],
      parameters: [
        tokenHeader,
        LikePostRequestQuerySchema
      ],
      responses: {
        201: {
          description: '좋아요 추가 성공',
        },
        400: {
          description: '이미 좋아요한 게시글',
          content: {
            'application/json': {
              schema: ErrorSchema,
            },
          },
        },
      },
    },
    delete: {
      summary: '게시글 좋아요 취소',
      security: [{bearerAuth: []}],
      parameters: [
        tokenHeader,
        LikePostRequestQuerySchema
      ],
      responses: {
        200: {
          description: '좋아요 취소 성공',
        },
        400: {
          description: '좋아요하지 않은 게시글',
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
