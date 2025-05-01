import { Response } from 'express';
import {
  GetInstitutionBoundsResponseBodySchema,
  GetInstitutionsResponseBodySchema,
} from '@/domains/institution/schema';
import { z } from 'zod';

export type GetInstitutionsResponse = Response<z.infer<typeof GetInstitutionsResponseBodySchema>>;

export type GetInstitutionBoundsResponse = Response<z.infer<typeof GetInstitutionBoundsResponseBodySchema>>;
