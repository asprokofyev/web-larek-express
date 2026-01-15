import { errors } from 'celebrate';
import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import path from 'path';

import { DB_ADDRESS, PORT } from './config';
import NotFoundError from './errors/not-found-error';
import errorHandler from './middlewares/error-handler';
import { errorLogger, requestLogger } from './middlewares/logger';
import router from './routes';

const app = express();
app.use(cors());

// Подключение к MongoDB
mongoose.connect(DB_ADDRESS);

// Логгер запросов
app.use(requestLogger);

// Парсинг JSON и URL-encoded данных
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Раздача статических файлов
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

// Маршруты
app.use('/', router);

// Обработка несуществующих маршрутов (404)
app.use((_req, _res, next) => {
  next(new NotFoundError('Маршрут не найден'));
});

// Логгер ошибок
app.use(errorLogger);

// Обработчик ошибок celebrate
app.use(errors());

// Централизованный обработчик ошибок
app.use(errorHandler);

// Запуск сервера
app.listen(PORT);
