import { z } from 'zod';
import { MarkerSchema, PostSchema } from '@/schemas';

export const GetPostPathSchema = z.object({
  postId: z.preprocess(val => {
    if (typeof val === 'string' && /^\d+$/.test(val)) {
      return Number(val);
    }
    return val;
  }, z.number()),
});

export const DeletePostPathSchema = GetPostPathSchema;

export const GetPostResponseSchema = PostSchema.omit({
  authorId: true,
});

export const CreatePostRequestBodySchema = PostSchema.omit({
  authorId: true,
  id: true,
  createdAt: true,
  expiresAt: true,
}).merge(MarkerSchema.pick({
  latitude: true,
  longitude: true,
}));

export const CreatePostResponseBodySchema = z.object({
  postId: z.number(),
  markerId: z.number(),
});
