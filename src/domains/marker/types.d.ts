import { Request, Response } from 'express';
import { z } from 'zod';
import {
  GetMarkersRequestBodySchema,
  GetMarkersResponseBodySchema,
} from '@/domains/marker/schema';

export type GetMarkersRequest = Request<{}, {}, z.infer<typeof GetMarkersRequestBodySchema>>;
export type GetMarkersResponse = Response<z.infer<typeof GetMarkersResponseBodySchema>>;
