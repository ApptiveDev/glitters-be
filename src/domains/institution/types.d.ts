import { Request, Response } from 'express';
import {
  GetInstitutionBoundsRequestBodySchema,
  GetInstitutionBoundsResponseBodySchema,
  GetInstitutionsRequestBodySchema,
  GetInstitutionsResponseBodySchema,
} from '@/domains/institution/schema';
import { z } from 'zod';

export type GetInstitutionsRequest = Request<{}, {}, z.infer<typeof GetInstitutionsRequestBodySchema>>;
export type GetInstitutionsResponse = Response<z.infer<typeof GetInstitutionsResponseBodySchema>>;

export type GetInstitutionBoundsRequest = Request<{}, {}, z.infer<typeof GetInstitutionBoundsRequestBodySchema>>;
export type GetInstitutionBoundsResponse = Response<z.infer<typeof GetInstitutionBoundsResponseBodySchema>>;
