import { z } from 'zod';
import { MarkerSchema, PostSchema } from '@/schemas';

export const GetPostPathSchema = z.object({
  post_id: z.number(),
});

export const DeletePostPathSchema = GetPostPathSchema;

export const GetPostResponseSchema = PostSchema.omit({
  author_id: true,
});

export const CreatePostRequestBodySchema = PostSchema.omit({
  author_id: true,
  id: true,
  created_at: true,
  expires_at: true,
}).merge(MarkerSchema.pick({
  latitude: true,
  longitude: true,
}));

export const CreatePostResponseBodySchema = z.object({
  post_id: z.number(),
  marker_id: z.number(),
});
