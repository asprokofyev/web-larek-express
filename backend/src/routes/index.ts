import { Router } from 'express';
import orderRouter from './order';
import productRouter from './product';

const router = Router();

router.use('/product', productRouter);
router.use('/order', orderRouter);

export default router;
