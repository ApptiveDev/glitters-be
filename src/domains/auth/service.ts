import prisma from '@/utils/database';
import {
  comparePassword,
  generateToken,
  hashPassword,
} from '@/domains/auth/utils';
import {
  // EmailVerifyRequest,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
} from '@/domains/auth/types';
import { Response } from 'express';
import { sendAndTrace, sendError } from '@/utils/network';
import { StatusCodes } from 'http-status-codes';
import { getPasswordExcludedMember } from '@/domains/member/utils';

//
// export async function handleEmailVerifyRequest(req: EmailVerifyRequest, res: Response) {
//   const { email } = req.body;
// }

export async function handleRegister(req: RegisterRequest, res: Response) {
  const { email, name, password } = req.body;

  try {
    const verifiedEmail = await prisma.emailVerification.findFirst({
      where: {
        email,
        is_verified: true,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    if (! verifiedEmail) {
      sendError(res, '인증되지 않은 이메일입니다.', StatusCodes.BAD_REQUEST);
      return;
    }
    const existing = await prisma.member.findUnique({ where: { email } });
    if (existing) {
      sendError(res, '이미 가입된 이메일입니다.', StatusCodes.BAD_REQUEST);
      return;
    }

    const hashedPassword = await hashPassword(password);
    const member = await prisma.member.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
    });
    res.json(getPasswordExcludedMember(member));
  } catch (error) {
    sendAndTrace(res, error);
  }
}

export async function handleLogin(req: LoginRequest, res: LoginResponse) {
  const { email, password } = req.body;

  try {
    const member = await prisma.member.findUnique({
      where: { email },
    });
    if (!member) {
      sendError(res, '잘못된 계정이나 비밀번호입니다.', StatusCodes.BAD_REQUEST);
      return;
    }

    const valid = await comparePassword(password, member.password);
    if (!valid) {
      sendError(res, '잘못된 계정이나 비밀번호입니다.', StatusCodes.BAD_REQUEST);
      return;
    }

    const token = generateToken(member);
    res.json({ token, member: getPasswordExcludedMember(member) });
  } catch (error) {
    sendAndTrace(res, error);
  }
}
