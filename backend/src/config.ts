import { CookieOptions } from 'express';
import ms from 'ms';

export const { PORT = '3000' } = process.env;
export const { DB_ADDRESS = 'mongodb://127.0.0.1:27017/weblarek' } = process.env;
export const { JWT_SECRET = 'JWT_SECRET' } = process.env;
export const ACCESS_TOKEN = {
  secret: process.env.AUTH_ACCESS_TOKEN_SECRET || 'secret-dev',
  expiry: (process.env.AUTH_ACCESS_TOKEN_EXPIRY || '10m') as ms.StringValue,
};
export const REFRESH_TOKEN = {
  secret: process.env.AUTH_REFRESH_TOKEN_SECRET || 'secret-dev',
  expiry: (process.env.AUTH_REFRESH_TOKEN_EXPIRY || '7d') as ms.StringValue,
  cookie: {
    name: 'refreshToken',
    options: {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: ms((process.env.AUTH_REFRESH_TOKEN_EXPIRY || '7d') as ms.StringValue),
      path: '/',
    } as CookieOptions,
  },
};

export const {
  UPLOAD_PATH = 'images',
  UPLOAD_PATH_TEMP = 'temp',
  ORIGIN_ALLOW = 'http://localhost:5173',
} = process.env;
