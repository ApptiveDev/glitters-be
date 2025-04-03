import { MemberSchema} from '@/schemas';
import { z } from 'zod';

export const PasswordExcludedMemberSchema = MemberSchema.omit({ password: true });
export const GetMyInfoSchema = z.object({
  member: PasswordExcludedMemberSchema,
});

export const GetActivePostCountResponseBodySchema = z.object({
  count: z.number()
});
