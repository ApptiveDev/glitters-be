// import { z } from 'zod';
import { MemberSchema } from '@/schemas';

export const PasswordExcludedMemberSchema = MemberSchema.omit({ password: true });
