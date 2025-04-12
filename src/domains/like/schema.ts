import { LikeSchema } from '@/schemas';
import { z } from 'zod';

export const LikePostRequestQuerySchema = LikeSchema.pick({
  postId: true
}).extend({
  postId: z.preprocess(val => {
    if (typeof val === 'string' && /^\d+$/.test(val)) {
      return Number(val);
    }
    return val;
  }, z.number()),
});
