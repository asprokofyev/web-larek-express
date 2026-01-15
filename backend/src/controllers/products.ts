import { NextFunction, Request, Response } from 'express';
import { Error as MongooseError } from 'mongoose';
import BadRequestError from '../errors/bad-request-error';
import ConflictError from '../errors/conflict-error';
import Product from '../models/products';

export const getProducts = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const products = await Product.find({});

    return res.status(200).json({
      items: products,
      total: products.length,
    });
  } catch (error) {
    return next(error);
  }
};

export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      title, image, category, description = '', price = null,
    } = req.body;

    const product = await Product.create({
      title,
      image,
      category,
      description,
      price,
    });

    return res.status(200).json(product);
  } catch (error: any) {
    if (error instanceof MongooseError.ValidationError) {
      return next(
        new BadRequestError('Ошибка валидации данных при создании товара'),
      );
    }
    if (
      error instanceof Error
      && ((error as any).code === 11000 || error.message.includes('E11000'))
    ) {
      return next(new ConflictError('Товар с таким заголовком уже существует'));
    }
    return next(error);
  }
};
