// import { z } from 'zod';
import { MemberSchema } from '@/schemas';
import { z } from 'zod';

export const PasswordExcludedMemberSchema = MemberSchema.omit({ password: true });
export const GetMyInfoSchema = z.object({
  member: PasswordExcludedMemberSchema,
});
