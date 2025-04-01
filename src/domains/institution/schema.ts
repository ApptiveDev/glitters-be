import { z } from 'zod';
import { InstitutionBoundSchema, InstitutionSchema } from '@/schemas';

export const GetInstitutionsRequestBodySchema = z.object({});
export const GetInstitutionsResponseBodySchema = z.object({
  institutions: z.array(InstitutionSchema.omit({
    is_active: true,
    created_at: true,
    updated_at: true,
  })),
});
export const GetInstitutionBoundsRequestBodySchema = z.object({});
export const GetInstitutionBoundsResponseBodySchema = z.object({
  bounds: z.array(InstitutionBoundSchema),
});
