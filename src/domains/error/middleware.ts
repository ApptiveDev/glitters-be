import { NextFunction, Response } from 'express';
import { ZodError } from 'zod';
import { StatusCodes } from 'http-status-codes';
import { HttpError } from '@/domains/error/HttpError';

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

  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    message: '서버 에러가 발생했습니다.'
  });
}
