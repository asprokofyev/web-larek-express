import { Router } from 'express';
import NotFoundError from '../errors/not-found-error';
import orderRouter from './order';
import productRouter from './product';

const router = Router();

router.use('/product', productRouter);
router.use('/order', orderRouter);

// Обработка несуществующих маршрутов (404)
router.use((_req, _res, next) => {
  next(new NotFoundError('Маршрут не найден'));
});

export default router;
