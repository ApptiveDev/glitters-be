import { Member } from '.prisma/client';
import { Request, Response } from 'express';
import { PasswordExcludedMember } from '@/domains/member/types';

export interface AuthenticatedJWTPayload extends JWTPayload {
  name: Member['name'];
  id: Member['id'];
  email: Member['email'];
}

export interface AuthenticatedRequest<Params = {}, ReqBody = {}, ReqQuery = {}> extends Request<
  Params, {}, ReqBody, ReqQuery> {
  member?: Omit<Member, 'password'>;
}

export interface EmailVerifyRequestBody {
  email: string;
}
export type EmailVerifyRequest = Request<{}, {}, EmailVerifyRequestBody>;

export type RegisterRequestBody = Pick<Member, 'email' | 'password' | 'name'>;
export type LoginRequestBody = Pick<Member, 'email' | 'password'>;

export type RegisterRequest = Request<{}, {}, RegisterRequestBody>;
export type LoginRequest = Request<{}, {}, LoginRequestBody>;

export type LoginResponseBody = { member: PasswordExcludedMember, token: string };
export type RegisterResponse = Response<Member>;
export type LoginResponse = Response<LoginResponseBody>;
