import { NextFunction, Response } from 'express';
import { ZodError } from 'zod';
import { StatusCodes } from 'http-status-codes';
import { HttpError } from '@/domains/error/HttpError';
import { JsonWebTokenError } from 'jsonwebtoken';

export function errorHandler(err: Error, _: any, res: Response, __: NextFunction) {
  console.error(err);

  if (err instanceof ZodError) {
    res.status(StatusCodes.BAD_REQUEST).json({
      message: '잘못된 요청입니다.',
      details: err.errors
    });
    return;
  }

  if (err instanceof HttpError) {
    err.send(res);
    return;
  }

  if (err instanceof JsonWebTokenError) {
    res.status(StatusCodes.UNAUTHORIZED).json({
      message: '인증 정보가 만료되었습니다. 다시 로그인해주세요.',
    });
    return;
  }

  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    message: '서버 에러가 발생했습니다.'
  });
}
