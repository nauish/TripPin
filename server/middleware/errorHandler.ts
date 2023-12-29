import { NextFunction, Request, Response } from 'express';
import { handleError } from '../utils/errorHandler.js';

function errorHandlerMiddleware(err: Error, req: Request, res: Response, next: NextFunction) {
  handleError(err, res);
  next();
}

export default errorHandlerMiddleware;
