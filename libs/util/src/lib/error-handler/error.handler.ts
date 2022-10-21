import { Request, Response, NextFunction } from 'express';

import { logger } from '../logger';
import { ErrorCode } from './error.code';
import { ErrorException } from './error.exception';
import { ErrorModel } from './error.model';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(err);
  if (err instanceof ErrorException) {
    console.log('Error is known.');
    res.status(err.status).json(err);
  } else {
    // For unhandled errors.
    res.status(500).json({ code: ErrorCode.InternalServerError, status: 500 } as ErrorModel);
  }
};
