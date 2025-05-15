import { MemberSchema} from '@/schemas';
import { z } from 'zod';

export const PublicMemberSchema = MemberSchema.omit({ password: true, expoToken: true });
export const InternalMemberSchema = MemberSchema.omit({ password: true });
export const GetMyInfoSchema = z.object({
  member: PublicMemberSchema.extend({
    hasUnreadChat: z.boolean(),
  }),
});

export const GetActivePostCountResponseBodySchema = z.object({
  count: z.number()
});
