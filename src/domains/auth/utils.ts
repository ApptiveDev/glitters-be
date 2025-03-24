import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Member } from '@prisma/client';
import { AuthenticatedJWTPayload } from '@/domains/auth/types';

const SECRET = process.env.JWT_SECRET as string;

export function generateToken(member: Member) {
  return jwt.sign({ id: member.id, email: member.email }, SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string) {
  return jwt.verify(token, SECRET) as AuthenticatedJWTPayload;
}

export function hashPassword(password: string) {
  return bcrypt.hash(password, SECRET);
}

export function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}
