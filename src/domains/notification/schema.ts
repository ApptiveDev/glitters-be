import { z } from 'zod';

export const LocationInputRequestBodySchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
});

export const ExpoTokenInputRequestBodySchema = z.object({
  token: z.string(),
});
