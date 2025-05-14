import { currentApiPrefix } from '../../../src/constants';
import { tokenHeader } from '../headers';
import { ZodOpenApiPathsObject } from 'zod-openapi';
import { BlockRequestQuerySchema } from '../../../src/domains/block/schema';

export const blockApiPaths: ZodOpenApiPathsObject = {
  [`${currentApiPrefix}/blocks`]: {
    post: {
      summary: '사용자 차단',
      security: [{ bearerAuth: [] }],
      parameters: [tokenHeader, BlockRequestQuerySchema],
      responses: {
        201: {
          description: '사용자 차단 성공',
        }
      },
    },
  },
};
