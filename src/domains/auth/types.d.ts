import { Member } from '@/schemas';
import { Request, Response } from 'express';
import { z } from 'zod';
import {
  EmailCodeInputRequestBodySchema,
  EmailVerifyRequestBodySchema,
  LoginRequestBodySchema,
  LoginResponseBodySchema,
  PasswordChangeRequestBodySchema,
  RegisterRequestBodySchema,
  RegisterResponseBodySchema,
} from '@/domains/auth/schema';
import {
  InternalMemberSchema,
} from '@/domains/member/schema';
import { JwtPayload } from 'jsonwebtoken';

export interface AuthenticatedJWTPayload extends JwtPayload {
  name: Member['name'];
  id: Member['id'];
  email: Member['email'];
}

export interface AuthenticatedRequest<Params = {}, ReqBody = {}, ReqQuery = {}> extends Request<
  Params, {}, ReqBody, ReqQuery> {
  member?: z.infer<typeof InternalMemberSchema>;
}

export type EmailCodeInputRequest = Request<{}, {}, z.infer<typeof EmailVerifyRequestBodySchema>>;
export type EmailVerifyRequest = Request<{}, {}, z.infer<typeof EmailVerifyRequestBodySchema>>;

export type RegisterRequest = Request<{}, {}, z.infer<typeof RegisterRequestBodySchema>>;
export type LoginRequest = Request<{}, {}, z.infer<typeof LoginRequestBodySchema>>;
export type RegisterResponse = Response<z.infer<typeof RegisterResponseBodySchema>>;
export type LoginResponse = Response<z.infer<typeof LoginResponseBodySchema>>;

export type ResetPasswordEmailInputRequest = Request<{}, {}, z.infer<typeof EmailVerifyRequestBodySchema>>;
export type ResetPasswordCodeInputRequest = Request<{}, {}, z.infer<typeof EmailCodeInputRequestBodySchema>>;
export type PasswordChangeRequest = Request<{}, {}, z.infer<typeof PasswordChangeRequestBodySchema>>;
