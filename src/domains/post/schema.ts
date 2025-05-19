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
}).extend({ isWrittenBySelf: z.boolean(), isLikedBySelf: z.boolean() });

export const GetCreationAvailabilityResponseBodySchema = z.object({
  isAvailable: z.boolean(),
  nextAvailableAt: z.coerce.date().nullable(),
});

export const CreatePostRequestBodySchema = z.object({
  title: z.string().max(63),
  content: z.string().max(255),
  address: z.string().max(63),
  iconIdx: z.number().int(),
  markerIdx: z.number().int(),
}).merge(MarkerSchema.pick({
  latitude: true,
  longitude: true,
})).strict();

export const CreatePostResponseBodySchema = z.object({
  postId: z.number(),
  markerId: z.number(),
});
