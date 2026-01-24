import crypto from 'crypto';
import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { Error as MongooseError } from 'mongoose';
import { REFRESH_TOKEN } from '../config';
import BadRequestError from '../errors/bad-request-error';
import { HttpCodes } from '../errors/codes';
import ConflictError from '../errors/conflict-error';
import NotFoundError from '../errors/not-found-error';
import UnauthorizedError from '../errors/unauthorized-error';
import User from '../models/user';

// POST /auth/login
const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const user = await User.findUserByCredentials(email, password);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    res.cookie(
      REFRESH_TOKEN.cookie.name,
      refreshToken,
      REFRESH_TOKEN.cookie.options,
    );
    return res.json({ success: true, user, accessToken });
  } catch(error) {
    return next(error);
  }
};

// POST /auth/register
const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, name } = req.body;
    const newUser = new User({ email, password, name });
    await newUser.save();
    const accessToken = await newUser.generateAccessToken();
    const refreshToken = await newUser.generateRefreshToken();

    res.cookie(
      REFRESH_TOKEN.cookie.name,
      refreshToken,
      REFRESH_TOKEN.cookie.options,
    );
    return res.status(HttpCodes.CREATED).json({
      success: true,
      user: newUser,
      accessToken,
    });
  } catch (error) {
    if(error instanceof MongooseError.ValidationError) {
      return next(new BadRequestError(error.message));
    }
    if(error instanceof Error && error.message.includes('E11000')) {
      return next(new ConflictError('Пользователь с таким email уже существует'));
    }
    return next(error);
  }
};

// GET auth/user
const getCurrentUser = async (_req:Request, res:Response, next: NextFunction) => {
  try {
    const userId = res.locals.user._id;
    const user = await User.findById(userId)
      .orFail(() => new NotFoundError('Пользователь по заданноум id отсутствует в базе'));
    res.json({ user, success: true });
  } catch (error) {
    next(error);
  }
};

const deleteRefreshTokenInUser = async (req: Request, _res: Response, _next: NextFunction) => {
  const { cookies } = req;
  const rfTkn = cookies[REFRESH_TOKEN.cookie.name];

  if(!rfTkn) {
    throw new UnauthorizedError('Невалидный токен');
  }

  const decodeRefreshTkn = jwt.verify(rfTkn, REFRESH_TOKEN.secret) as JwtPayload;
  const user = await User.findOne({
    _id: decodeRefreshTkn._id,
  }).orFail(() => new UnauthorizedError('Пользователь не найден в базе'));

  const rTknHash = crypto
    .createHmac('sha256', REFRESH_TOKEN.secret)
    .update(rfTkn)
    .digest('hex');

  const filterTokens = user.tokens.filter(
    (tokenObj) => tokenObj.token !== rTknHash,
  );

  user.tokens = filterTokens;

  await user.save();

  return user;
};

// GET /auth/logout
const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    deleteRefreshTokenInUser(req, res, next);
    const expireCookieOptions = {
      ...REFRESH_TOKEN.cookie.options,
      maxAge: -1,
    };
    res.cookie(
      REFRESH_TOKEN.cookie.name,
      '',
      expireCookieOptions,
    );
    res.status(HttpCodes.OK).json({
      seccess: true,
    });
  } catch (error) {
    next(error);
  }
};

// GET /auth/token
const refreshAccessToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userWithRefreshTkn = await deleteRefreshTokenInUser(req, res, next);
    const accessToken = await userWithRefreshTkn.generateAccessToken();
    const refreshToken = await userWithRefreshTkn.generateRefreshToken();
    res.cookie(
      REFRESH_TOKEN.cookie.name,
      refreshToken,
      REFRESH_TOKEN.cookie.options,
    );
    return res.json({
      success: true, user: userWithRefreshTkn, accessToken,
    });
  } catch (error) {
    return next(error);
  }
};

export {
  getCurrentUser, login, logout, refreshAccessToken, register
};
