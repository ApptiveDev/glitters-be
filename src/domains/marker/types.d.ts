import { Response } from 'express';
import { z } from 'zod';
import {
  GetMarkersResponseBodySchema,
} from '@/domains/marker/schema';

export type GetMarkersResponse = Response<z.infer<typeof GetMarkersResponseBodySchema>>;
