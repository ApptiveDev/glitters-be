import { StatusCodes } from 'http-status-codes';
import { Response } from 'express';

export function sendError(res: Response, message: string, errorCode: number = StatusCodes.INTERNAL_SERVER_ERROR) {
  res.status(errorCode).json({
    message,
  });
}

export function sendAndTrace(res: Response, error: any) {
  sendError(res, '서버 에러가 발생했습니다.');
  console.error(error);
}
