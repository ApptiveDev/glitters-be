import { Member } from '@/schemas';
import { Request, Response } from 'express';
import { z } from 'zod';
import {
  EmailVerifyRequestBodySchema,
  LoginRequestBodySchema,
  LoginResponseBodySchema,
  RegisterRequestBodySchema,
  EmailVerifyResponseBodySchema,
  RegisterResponseBodySchema,
} from '@/domains/auth/schema';
import { PasswordExcludedMemberSchema } from '@/domains/member/schema';

export interface AuthenticatedJWTPayload extends JWTPayload {
  name: Member['name'];
  id: Member['id'];
  email: Member['email'];
}

export interface AuthenticatedRequest<Params = {}, ReqBody = {}, ReqQuery = {}> extends Request<
  Params, {}, ReqBody, ReqQuery> {
  member?: z.infer<typeof PasswordExcludedMemberSchema>;
}

export type EmailCodeInputRequest = Request<{}, {}, z.infer<typeof EmailVerifyRequestBodySchema>>;
export type EmailVerifyRequest = Request<{}, {}, z.infer<typeof EmailVerifyRequestBodySchema>>;
export type EmailVerifyResponse = Response<z.infer<typeof EmailVerifyResponseBodySchema>>;

export type RegisterRequest = Request<{}, {}, z.infer<typeof RegisterRequestBodySchema>>;
export type LoginRequest = Request<{}, {}, z.infer<typeof LoginRequestBodySchema>>;
export type RegisterResponse = Response<z.infer<typeof RegisterResponseBodySchema>>;
export type LoginResponse = Response<z.infer<typeof LoginResponseBodySchema>>;
