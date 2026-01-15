import { CelebrateError } from 'celebrate';
import { ErrorRequestHandler } from 'express';
import { Error as MongooseError } from 'mongoose';
import BadRequestError from '../errors/bad-request-error';
import ConflictError from '../errors/conflict-error';
import NotFoundError from '../errors/not-found-error';

const errorHandler: ErrorRequestHandler = (err, _req, res, next) => {
  // Обработка ошибок Celebrate (валидация)
  if (err instanceof CelebrateError) {
    const errorBody = err.details.get('body');
    const errorParams = err.details.get('params');
    const errorQuery = err.details.get('query');

    const validationError = errorBody || errorParams || errorQuery;
    const message = validationError?.message || 'Ошибка валидации данных';

    return res.status(400).json({
      statusCode: 400,
      error: 'Bad Request',
      message: 'Validation failed',
      validation: {
        source: validationError?.details[0]?.path[0] || 'body',
        keys:
          validationError?.details.map((detail) => detail.path.join('.')) || [],
        message,
      },
    });
  }

  // Обработка ошибок Mongoose
  if (err instanceof MongooseError.ValidationError) {
    return next(
      new BadRequestError('Ошибка валидации данных при создании товара'),
    );
  }

  if (err instanceof MongooseError.CastError) {
    return next(new BadRequestError(`Передан не валидный ID: ${err.value}`));
  }

  // Обработка ошибок дубликата ключа MongoDB
  if (
    err instanceof Error
    && ((err as any).code === 11000 || err.message.includes('E11000'))
  ) {
    return next(new ConflictError('Товар с таким заголовком уже существует'));
  }

  // Обработка кастомных ошибок
  if (err instanceof BadRequestError) {
    return res.status(err.statusCode).json({
      message: err.message,
    });
  }

  if (err instanceof ConflictError) {
    return res.status(err.statusCode).json({
      message: err.message,
    });
  }

  if (err instanceof NotFoundError) {
    return res.status(err.statusCode).json({
      message: err.message,
    });
  }

  // Обработка стандартных HTTP ошибок
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      message: err.message,
    });
  }

  // Дефолтная обработка ошибок (500)
  return res.status(500).json({
    message: 'На сервере произошла ошибка',
  });
};

export default errorHandler;
