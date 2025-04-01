import { z } from 'zod';
import { MarkerSchema, PostSchema } from '@/schemas';

export const GetMarkersRequestBodySchema = z.object({});
export const GetMarkersResponseBodySchema = z.object({
  markers: z.array(MarkerSchema.merge(
    PostSchema.pick({ expires_at: true })
  )),
});
