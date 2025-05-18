import { z } from 'zod';
import { MarkerSchema, PostSchema } from '@/schemas';

export const GetMarkersResponseBodySchema = z.object({
  markers: z.array(MarkerSchema.merge(PostSchema.pick({ expiresAt: true, createdAt: true, markerIdx: true, }))
  .extend({ isWrittenBySelf: z.boolean() })),
});
