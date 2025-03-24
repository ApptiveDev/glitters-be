import { Member } from '@prisma/client';
import { Request } from 'express';

export interface AuthenticatedJWTPayload extends JWTPayload {
  name: Member['name'];
  id: Member['id'];
  email: Member['email'];
}

interface AuthenticatedRequest<Params = {}, ReqBody = {}, ReqQuery = {}> extends Request<
  Params, {}, ReqBody, ReqQuery> {
  member?: Member;
}
