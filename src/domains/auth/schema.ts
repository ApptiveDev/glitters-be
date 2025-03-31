import { z } from 'zod';
import { PasswordExcludedMemberSchema } from '@/domains/member/schema';

export const EmailCodeInputRequestBodySchema = z.object({
  email: z.string().email(),
  code: z.string().max(6),
});

export const EmailVerifyRequestBodySchema = z.object({
  email: z.string().email(),
});

export const EmailVerifyResponseBodySchema = z.object({});

export const RegisterRequestBodySchema = z.object({
  email: z.string().email(),
  password: z.string(),
  name: z.string(),
});

export const LoginRequestBodySchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const LoginResponseBodySchema = z.object({
  member: PasswordExcludedMemberSchema,
  token: z.string(),
});

export const RegisterResponseBodySchema = LoginResponseBodySchema;
