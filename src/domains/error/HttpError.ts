import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export class HttpError extends Error {
  constructor(public message: string, public statusCode: number) {
    super(message);
  }

  send(res: Response) {
    res.status(this.statusCode).json({ message: this.message });
  }
}

export class NotFoundError extends HttpError {
  constructor(message: string) {
    super(message, StatusCodes.NOT_FOUND);
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message: string) {
    super(message, StatusCodes.UNAUTHORIZED);
  }
}

export class ForbiddenError extends HttpError {
  constructor(message: string) {
    super(message, StatusCodes.FORBIDDEN);
  }
}

export class BadRequestError extends HttpError {
  constructor(message: string) {
    super(message, StatusCodes.BAD_REQUEST);
  }
}
