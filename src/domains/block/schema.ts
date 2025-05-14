import { z } from 'zod';

export const BlockType = z.enum(['post', 'chatroom']);

export const BlockRequestQuerySchema = z.object({
  blockType: BlockType,
  postId: z.preprocess(val => {
    if (typeof val === 'string' && /^\d+$/.test(val)) {
      return Number(val);
    }
    return val;
  }, z.number().min(1).optional()),
  chatroomId: z.preprocess(val => {
    if (typeof val === 'string' && /^\d+$/.test(val)) {
      return Number(val);
    }
    return val;
  }, z.number().min(1).optional()),
});
