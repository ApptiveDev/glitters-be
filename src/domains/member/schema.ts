import { InstitutionSchema, MemberSchema } from '@/schemas';
import { z } from 'zod';

export const PublicMemberSchema = MemberSchema.omit({ password: true, expoToken: true }).extend({
  institution: InstitutionSchema.optional(),
});
export const GetMyInfoSchema = z.object({
  member: PublicMemberSchema.extend({
    hasUnreadChat: z.boolean(),
    institution: InstitutionSchema.optional(),
  }),
});

export const GetActivePostCountResponseBodySchema = z.object({
  count: z.number()
});
