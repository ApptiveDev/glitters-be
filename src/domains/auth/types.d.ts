import { Member } from '@/schemas';
import { Request, Response } from 'express';
import { z } from 'zod';
import {
  EmailVerifyRequestBodySchema,
  LoginRequestBodySchema,
  LoginResponseBodySchema,
  RegisterRequestBodySchema,
  RegisterResponseBodySchema,
} from '@/domains/auth/schema';
import { PasswordExcludedMemberSchema } from '@/domains/member/schema';
import { JwtPayload } from 'jsonwebtoken';

export interface AuthenticatedJWTPayload extends JwtPayload {
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

export type RegisterRequest = Request<{}, {}, z.infer<typeof RegisterRequestBodySchema>>;
export type LoginRequest = Request<{}, {}, z.infer<typeof LoginRequestBodySchema>>;
export type RegisterResponse = Response<z.infer<typeof RegisterResponseBodySchema>>;
export type LoginResponse = Response<z.infer<typeof LoginResponseBodySchema>>;
