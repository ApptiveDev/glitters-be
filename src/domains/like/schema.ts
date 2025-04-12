import { LikeSchema } from '@/schemas';
import { z } from 'zod';
import { extendZodWithOpenApi } from 'zod-openapi';

extendZodWithOpenApi(z);

export const LikePostRequestQuerySchema = LikeSchema.pick({
  postId: true
}).extend({
  postId: z.preprocess(val => {
    if (typeof val === 'string' && /^\d+$/.test(val)) {
      return Number(val);
    }
    return val;
  }, z.number()),
}).openapi({
  param: {
    name: 'postId',
    in: 'query',
    required: true,
    schema: {
      type: 'integer',
    },
  }
});
