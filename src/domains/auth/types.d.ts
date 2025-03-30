import { Member } from '.zod';
import { Request, Response } from 'express';
import { z } from 'zod';
import {
  EmailVerifyRequestBodySchema,
  LoginRequestBodySchema,
  LoginResponseBodySchema,
  RegisterRequestBodySchema,
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

export type EmailVerifyRequest = Request<{}, {}, z.infer<typeof EmailVerifyRequestBodySchema>>;
export type RegisterRequest = Request<{}, {}, z.infer<typeof RegisterRequestBodySchema>>;
export type LoginRequest = Request<{}, {}, z.infer<typeof LoginRequestBodySchema>>;
export type RegisterResponse = Response<z.infer<typeof RegisterRequestBodySchema>>;
export type LoginResponse = Response<z.infer<typeof LoginResponseBodySchema>>;
