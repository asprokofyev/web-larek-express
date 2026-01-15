import { ErrorRequestHandler } from 'express';

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
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
