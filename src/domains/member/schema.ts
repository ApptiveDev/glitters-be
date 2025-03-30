// import { z } from 'zod';
import { MemberSchema } from '.zod'

export const PasswordExcludedMemberSchema = MemberSchema.omit({ password: true });
