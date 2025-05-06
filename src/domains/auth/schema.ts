import { z } from 'zod';
import { PublicMemberSchema } from '@/domains/member/schema';
import { MemberSchema } from '@/schemas';

export const EmailCodeInputRequestBodySchema = z.object({
  email: z.string().email(),
  code: z.string().max(6),
});

export const EmailVerifyRequestBodySchema = z.object({
  email: z.string().email(),
});

export const RegisterRequestBodySchema = MemberSchema.pick({
  email: true,
  password: true,
  name: true,
}).extend({
  birth: z.coerce.date()
    .min(new Date('1990-01-01'))
    .max(new Date(new Date().getFullYear() - 21, 0, 1)),
  termsAccepted: z.literal(true),
  password: z.string()
  .min(10)
  .max(25)
  .regex(
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=[{\]};:'",.<>/?\\|`~]).{10,25}$/,
  ),
  email: z.string().email(),
});

export const LoginRequestBodySchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const LoginResponseBodySchema = z.object({
  member: PublicMemberSchema,
  token: z.string(),
});

export const RegisterResponseBodySchema = LoginResponseBodySchema;
