import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { ACCESS_TOKEN } from '../config';
import UnauthorizedError from '../errors/unauthorized-error';

const auth = (req: Request, res: Response, next: NextFunction) => {
  let payload: JwtPayload | null = null;
  try {
    const authHeader = req.header('Authorization');
    if(!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedError('Невалидный токен');
    }
    const accessTokenParts = authHeader.split(' ');
    const aTkn = accessTokenParts[1];
    payload = jwt.verify(aTkn, ACCESS_TOKEN.secret) as JwtPayload;
    res.locals.user = payload;
    return next();
  } catch (error) {
    if(error instanceof Error && error.name === 'TokenExpiredError') {
      return next(new UnauthorizedError('Истек срок действия токена'));
    }
    return next(new UnauthorizedError('Необходима авторизация'));
  }
};

export default auth;
