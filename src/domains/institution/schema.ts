import { z } from 'zod';
import { InstitutionBoundSchema, InstitutionSchema } from '@/schemas';

export const GetInstitutionsResponseBodySchema = z.object({
  institutions: z.array(InstitutionSchema.omit({
    isActive: true,
    createdAt: true,
    updatedAt: true,
  })),
});

export const GetInstitutionBoundsResponseBodySchema = z.object({
  bounds: z.array(InstitutionBoundSchema),
});
