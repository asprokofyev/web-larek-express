import { CelebrateError, isCelebrateError } from 'celebrate';
import { ErrorRequestHandler } from 'express';
import { HttpCodes } from '../errors/codes';
import ConflictError from '../errors/conflict-error';

const extractCelebrateErrorMessage = (err: CelebrateError) => {
  const errorDetails = err.details;
  for (const key of errorDetails.keys()) {
    const errorDetail = errorDetails.get(key);
    if(errorDetail && errorDetail.details && errorDetail.details.length > 0) {
      return errorDetail.details[0].message;
    }
  }
  return 'Ошибка валидации данных';
}

const parseDuplicateKeyError = (errorMessage: string): { field: string, value: string } | null => {
  const match = errorMessage.match(/index: (.+?) dup key: \{ (.+?): "(.+?)" \}/);
  if(match) {
    return { field: match[2], value: match[3] };
  }
  return null;
}

const errorHandler: ErrorRequestHandler = (err, _req, res, next) => {
  if(isCelebrateError(err)) {
    const message = extractCelebrateErrorMessage(err);
    const statusCode = HttpCodes.BAD_REQUEST;
    return res.status(statusCode).send({ message });
  }

  if(err instanceof ConflictError) {
    const parsedError = parseDuplicateKeyError(err.message);
    if(parsedError) {
      return res.status(HttpCodes.CONFLICT).send({ message: `Возник конфликт в поле ${parsedError.field} со значением "${parsedError.value}"` });
    } else {
      return res.status(HttpCodes.CONFLICT).send({ message: 'Возник конфликт дублирования ключа' })
    }
  }

  const statusCode = err.statusCode || HttpCodes.INTERNAL_SERVER_ERROR;
  const message = statusCode === HttpCodes.INTERNAL_SERVER_ERROR ? 'На сервере произошла ошибка' : err.message;
  res.status(statusCode).send( { message });
  next();
};

export default errorHandler;