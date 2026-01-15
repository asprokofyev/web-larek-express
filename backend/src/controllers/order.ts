import { faker } from '@faker-js/faker';
import { NextFunction, Request, Response } from 'express';
import BadRequestError from '../errors/bad-request-error';
import NotFoundError from '../errors/not-found-error';
import Product from '../models/products';

const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { total, items } = req.body;
    // Делаем две проверки, которые нельзя сделать с помощью celebrate
    // Проверяем существование товаров и их доступность для продажи
    const products = await Promise.all(
      items.map((itemId: string) => Product.findById(itemId)),
    );

    let calculatedTotal = 0;
    for (let i = 0; i < products.length; i += 1) {
      const product = products[i];
      if (!product) {
        return next(new NotFoundError(`Товар с id ${items[i]} не найден`));
      }
      if (product.price === null) {
        return next(new BadRequestError(`Товар с id ${items[i]} не продается`));
      }
      calculatedTotal += product.price;
    }

    // Проверяем соответствие суммы
    if (calculatedTotal !== total) {
      return next(new BadRequestError('Неверная сумма заказа'));
    }

    // Генерируем ID заказа
    const orderId = faker.string.uuid();

    return res.status(200).json({
      id: orderId,
      total,
    });
  } catch (error) {
    return next(error);
  }
};

export default createOrder;
