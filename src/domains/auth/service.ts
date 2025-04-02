import prisma from '@/utils/database';
import {
  comparePassword,
  generateToken,
  hashPassword,
  isValidEmail,
  sendVerificationCodeEmail,
} from '@/domains/auth/utils';
import {
  EmailCodeInputRequest,
  EmailVerifyRequest,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from '@/domains/auth/types';
import { Response } from 'express';
import { sendAndTrace, sendError } from '@/utils/network';
import { StatusCodes } from 'http-status-codes';
import { getPasswordExcludedMember } from '@/domains/member/utils';
import {
  EmailCodeInputRequestBodySchema,
  EmailVerifyRequestBodySchema,
} from '@/domains/auth/schema';

export async function handleEmailCodeInput(req: EmailCodeInputRequest, res: Response) {
  try {
    const { email, code } = EmailCodeInputRequestBodySchema.parse(req.body);
    const targetEmail = await prisma.emailVerification.findFirst({
      where: {
        email,
        verification_number: code,
        is_verified: false,
        expires_at: {
          gt: new Date(),
        }
      },
      orderBy: {
        created_at: 'desc',
      }
    });
    if(! targetEmail) {
      sendError(res, '인증이 만료되었거나 유효한 이메일이 아닙니다.', StatusCodes.BAD_REQUEST);
      return;
    }
    await prisma.emailVerification.update({
      where: {
        id: targetEmail.id
      },
      data: {
        is_verified: true,
      }
    });
    res.status(StatusCodes.ACCEPTED).send();
  } catch (error) {
    sendAndTrace(res, error);
  }
}

export async function handleEmailVerifyRequest(req: EmailVerifyRequest, res: Response) {
  try {
    const { email } = EmailVerifyRequestBodySchema.parse(req.body);
    if(! await isValidEmail(email)) {
      sendError(res, '등록되지 않은 이메일 도메인입니다.', StatusCodes.BAD_REQUEST);
      return;
    }
    const code = await sendVerificationCodeEmail(email);
    await prisma.emailVerification.updateMany({
      where: {
        email,
      },
      data: {
        expires_at: new Date(),
      }
    });
    await prisma.emailVerification.create({
      data: {
        email,
        verification_number: code,
        is_verified: false,
        expires_at: new Date(Date.now() + 5 * 60 * 1000),
      }
    });
    res.status(StatusCodes.ACCEPTED).send();
  } catch (error) {
    sendAndTrace(res, error);
  }
}

export async function handleRegister(req: RegisterRequest, res: RegisterResponse) {
  const { email, name, password } = req.body;

  try {
    const verifiedEmail = await prisma.emailVerification.findFirst({
      where: {
        email,
        is_verified: true,
        expires_at: {
          gt: new Date(),
        },
      },
      orderBy: {
        created_at: 'desc',
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
    const token = generateToken(member);
    res.json({ token, member: getPasswordExcludedMember(member)} );
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
      sendError(res, '잘못된 이메일이나 비밀번호입니다.', StatusCodes.BAD_REQUEST);
      return;
    }

    const valid = await comparePassword(password, member.password);
    if (!valid) {
      sendError(res, '잘못된 이메일이나 비밀번호입니다.', StatusCodes.BAD_REQUEST);
      return;
    }

    const token = generateToken(member);
    res.json({ token, member: getPasswordExcludedMember(member) });
  } catch (error) {
    sendAndTrace(res, error);
  }
}
