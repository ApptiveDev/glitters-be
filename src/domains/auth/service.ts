import prisma from '@/utils/database';
import {
  comparePassword,
  generateToken,
  hashPassword,
  isBirthInValidRange,
  isValidEmail,
  sendVerificationCodeEmail,
  verifyToken,
} from '@/domains/auth/utils';
import {
  AuthenticatedJWTPayload,
  AuthenticatedRequest,
  EmailCodeInputRequest,
  EmailVerifyRequest,
  LoginRequest,
  LoginResponse, PasswordChangeRequest,
  RegisterRequest,
  RegisterResponse,
} from '@/domains/auth/types';
import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { omitPrivateFields } from '@/domains/member/utils';
import {
  EmailCodeInputRequestBodySchema,
  EmailVerifyRequestBodySchema, LoginRequestBodySchema,
  PasswordChangeRequestBodySchema,
  RegisterRequestBodySchema,
} from '@/domains/auth/schema';
import jwt from 'jsonwebtoken';
import redis from '@/utils/redis';
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from '@/domains/error/HttpError';

export async function handlePasswordReset(req: PasswordChangeRequest, res: Response) {
  const { password, email } = PasswordChangeRequestBodySchema.parse(req.body);
  const verifiedEmail = await findEmailInBypass(email) || await findVerifiedEmail(email, 'RESET_PASSWORD');
  if (! verifiedEmail) {
    throw new BadRequestError('인증이 만료되었거나 유효한 이메일이 아닙니다.');
  }
  const hashedPassword = await hashPassword(password);
  await prisma.member.update({
    where: {
      email,
    },
    data: {
      password: hashedPassword,
    },
  });
  await setVerificationExpired(email, 'RESET_PASSWORD');
  res.status(StatusCodes.OK).send();
}

export async function handleEmailCodeInput(req: EmailCodeInputRequest, res: Response) {
  const { email, code, type } = EmailCodeInputRequestBodySchema.parse(req.body);
  const targetEmail =
    await findEmailInBypass(email, code) || await findEmailVerificationWithCode(email, code, type);
  if(! targetEmail) {
    throw new BadRequestError('인증이 만료되었거나 유효한 이메일이 아닙니다.');
  }
  await setEmailVerifiedByCode(email, code, type);
  res.status(StatusCodes.CREATED).send();
}

export async function handleEmailVerifyRequest(req: EmailVerifyRequest, res: Response) {
  const { email, type } = EmailVerifyRequestBodySchema.parse(req.body);
  if(! (await isValidEmail(email))) {
    throw new BadRequestError('등록되지 않은 이메일 도메인입니다.');
  }
  const blacklisted = await getBlacklistInfo(email);
  if(blacklisted) {
    const date = blacklisted.createdAt;
    throw new ForbiddenError(`이용약관을 위반하여 재가입이 제한된 이메일입니다(${date.toDateString()}). 관리자에게 문의해주세요`);
  }
  const isInBypass = await findEmailInBypass(email);
  if(isInBypass) {
    res.status(StatusCodes.CREATED).send();
    return;
  }
  const code = await sendVerificationCodeEmail(email);
  await prisma.$transaction([
    setVerificationExpired(email, type),
    createEmailVerification(email, code, type)
  ]);
  res.status(StatusCodes.CREATED).send();
}

export async function handleRegister(req: RegisterRequest, res: RegisterResponse) {
  const { email, name, password, birth, termsAccepted, gender } = RegisterRequestBodySchema.parse(req.body);

  if(! isBirthInValidRange(birth)) {
    throw new BadRequestError('만 18세 이상만 가입이 가능한 앱입니다.');
  }
  const blacklisted = await prisma.blacklist.findFirst({
    where: {
      email
    }
  });
  const verifiedEmail = await findEmailInBypass(email) || await findVerifiedEmail(email, 'REGISTER');
  if (! verifiedEmail) {
    throw new BadRequestError('인증되지 않은 이메일입니다. 다른 이메일로 시도해주세요.');
  }
  if(blacklisted) {
    const date = blacklisted.createdAt;
    await setVerificationExpired(email, 'REGISTER');
    throw new ForbiddenError(`이용약관을 위반하여 재가입이 제한된 이메일입니다(${date.toDateString()}). 관리자에게 문의해주세요`);
  }
  const existing = await prisma.member.findUnique({ where: { email } });
  if (existing) {
    await setVerificationExpired(email, 'REGISTER');
    throw new BadRequestError('이미 가입된 이메일입니다.');
  }

  const hashedPassword = await hashPassword(password);
  const domain = email.split('@')[1];
  const institution = (await prisma.institution.findFirstOrThrow({
    where: {
      emailDomain: `@${domain}`
    }
  }));
  if(! institution) {
    throw new NotFoundError('해당 이메일을 도메인으로 하는 기관이 존재하지 않습니다.');
  }
  const member = await prisma.member.create({
    data: {
      email,
      name,
      birth,
      gender,
      termsAccepted,
      password: hashedPassword,
      institutionId: institution.id,
    },
  });
  const token = generateToken(member);
  await setVerificationExpired(email, 'REGISTER');
  res.status(StatusCodes.OK).json({ token, member: omitPrivateFields(member)});
}

export async function handleLogin(req: LoginRequest, res: LoginResponse) {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = verifyToken(token);
      const member = await prisma.member.findUnique({
        where: { id: decoded.id },
      });
      if (member) {
        return res.status(StatusCodes.OK).json({
          token,
          member: omitPrivateFields(member),
        });
      }
    } catch (_) {
      // 만료된 경우 로그인 절차 계속 진행
    }
  }

  const { email, password } = LoginRequestBodySchema.parse(req.body);
  const member = await prisma.member.findUnique({
    where: { email },
  });
  if (!member) {
    throw new BadRequestError('잘못된 이메일이나 비밀번호입니다.');
  }

  const valid = await comparePassword(password, member.password);
  if (!valid) {
    throw new BadRequestError('잘못된 이메일이나 비밀번호입니다.');
  }

  const token = generateToken(member);
  res.status(StatusCodes.OK).json({ token, member: omitPrivateFields(member) });
}

export async function handleLogout(req: AuthenticatedRequest, res: Response) {
  const token = req.headers.authorization!.split(' ')[1];
  await saveInvalidatedToken(token);
  res.status(StatusCodes.OK).send();
}

function findEmailInBypass(email: string, code?: string) {
  return prisma.verificationBypass.findFirst({
    where: {
      email,
      code,
    }
  });
}

function setEmailVerifiedByCode(email: string, code: string, type: 'REGISTER' | 'RESET_PASSWORD' = 'REGISTER') {
  return prisma.emailVerification.updateMany({
    where: {
      email,
      type,
      verificationNumber: code,
    },
    data: {
      isVerified: true,
    }
  });
}

function setVerificationExpired(email: string, type: 'REGISTER' | 'RESET_PASSWORD' = 'REGISTER') {
  return prisma.emailVerification.deleteMany({
    where: {
      email,
      type,
    },
  });
}

function findVerifiedEmail(email: string, type: 'REGISTER' | 'RESET_PASSWORD' = 'REGISTER') {
  return prisma.emailVerification.findFirst({
    where: {
      email,
      type,
      isVerified: true,
    },
    orderBy:{
      createdAt: 'desc'
    }
  });
}

function findEmailVerificationWithCode(email: string, code: string, type: 'REGISTER' | 'RESET_PASSWORD' = 'REGISTER') {
  return prisma.emailVerification.findFirst({
    where: {
      email,
      verificationNumber: code,
      isVerified: false,
      type,
      expiresAt: {
        gt: new Date(),
      },
    },
    orderBy: {
      createdAt: 'desc',
    }
  });
}

function createEmailVerification(email: string, code: string, type: 'REGISTER' | 'RESET_PASSWORD' = 'REGISTER',
                                 expiresAt = new Date(Date.now() + 5 * 60 * 1000)) {
  return prisma.emailVerification.create({
    data: {
      email,
      verificationNumber: code,
      isVerified: false,
      expiresAt,
      type,
    }
  });
}

function getBlacklistInfo(email: string) {
  return prisma.blacklist.findFirst({
    where: {
      email
    }
  });
}

export async function saveInvalidatedToken(accessToken: string) {
  const decoded = jwt.decode(accessToken) as AuthenticatedJWTPayload;

  if (!decoded || !decoded.exp) {
    return;
  }

  const exp = decoded.exp;
  const now = Math.floor(Date.now() / 1000);
  const ttl = exp - now;

  if (ttl <= 0) {
    return;
  }

  await redis.set(`access_token:${accessToken}`, 'valid', 'EX', ttl);
}
