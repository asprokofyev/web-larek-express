import { faker } from '@faker-js/faker';
import { NextFunction, Request, Response } from 'express';
import { Error as MongooseError, Types } from 'mongoose';
import BadRequestError from '../errors/bad-request-error';
import { HttpCodes } from '../errors/codes';
import Product, { IProduct } from '../models/product';

// POST /order
const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const basket:IProduct[] = [];
    const products = await Product.find<IProduct>({});
    const {
      total, items,
    } = req.body;
    items.forEach((id: Types.ObjectId) => {
      const product = products.find((p) => p._id.equals(id));
      if(!product) {
        return next(new BadRequestError(`Товар с id ${id} не найден`));
      }
      if(product.price === null) {
        return next(new BadRequestError(`Товар с id ${id} не продается`));
      }
      return basket.push(product);
    });

    const totalBasket = basket.reduce((a, c) => a + c.price, 0);
    if(totalBasket !== total) {
      return next(new BadRequestError('Неверная сумма заказа'));
    }
    return res.status(HttpCodes.OK).json({
      id: faker.string.uuid(),
      total,
    });
  } catch (error) {
    if(error instanceof MongooseError.ValidationError) {
      return next(new BadRequestError(error.message));
    }
    return next(error);
  }
}

export default createOrder;
