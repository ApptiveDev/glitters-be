import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Member } from '.prisma/client';
import { AuthenticatedJWTPayload } from '@/domains/auth/types';
import { sendEmail } from '@/utils/email';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET as string;
const PASSWORD_SECRET = process.env.PASSWORD_SECRET as string;

function generateVerificationCode(length: number = 6): string {
  const digits = '0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += digits[Math.floor(Math.random() * digits.length)];
  }
  return code;
}

export async function sendVerificationCodeEmail(
  destination: string,
  codeLength: number = 6
) {
  const code = generateVerificationCode(codeLength);
  const title = '이메일 인증 코드';
  const content = `요청하신 인증 코드는 다음과 같습니다:\n\n${code}\n\n인증 코드는 5분간 유효합니다.`;
  const source = process.env.SERVICE_EMAIL!;

  await sendEmail(destination, title, content, source);
  return code;
}


export function generateToken(member: Member) {
  return jwt.sign({ id: member.id, email: member.email }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET) as AuthenticatedJWTPayload;
}

export function hashPassword(password: string) {
  return bcrypt.hash(password, PASSWORD_SECRET);
}

export function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}
