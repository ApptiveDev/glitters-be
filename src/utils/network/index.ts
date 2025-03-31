import { StatusCodes } from 'http-status-codes';
import { Response } from 'express';
import { z } from 'zod';

export function sendError(res: Response, message: string, errorCode: number = StatusCodes.INTERNAL_SERVER_ERROR) {
  res.status(errorCode).json({
    message,
  });
}

export function sendAndTrace(res: Response, error: any) {
  if(error instanceof z.ZodError) {
    sendError(res, '잘못된 요청입니다.', StatusCodes.BAD_REQUEST);
    return;
  }
  sendError(res, '서버 에러가 발생했습니다.');
  console.error(error);
}
