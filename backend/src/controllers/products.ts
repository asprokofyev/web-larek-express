import { NextFunction, Request, Response } from 'express';
import { Error as MongooseError } from 'mongoose';
import { join } from 'path';
import BadRequestError from '../errors/bad-request-error';
import { HttpCodes } from '../errors/codes';
import ConflictError from '../errors/conflict-error';
import Product from '../models/product';
import movingFile from '../utils/movingFile';
import { normalizedErrorMessage } from '../utils/normalizedErrorMessage';

// GET /product
const getProducts = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const products = await Product.find({});
    return res.send ({ items: products, total: products.length });
  } catch (error) {
    return next(error);
  }
};

// POST /product
const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { description, image, category, price, title, } = req.body;

    if(image) {
      movingFile(image.fileName, join(__dirname, `../public/${process.env.UPLOAD_PATH_TEMP}`), join(__dirname, `../public/${process.env.UPLOAD_PATH}`));
    }

    const product = await Product.create({
      description, image, category, price, title,
    });

    return res.status(HttpCodes.CREATED).send(product);
  } catch (error) {
    if (error instanceof MongooseError.ValidationError) {
      return next(new BadRequestError(normalizedErrorMessage(error)));
    }
    if (error instanceof Error && error.message.includes('E11000')) {
      return next(new ConflictError(error.message));
    }
    return next(error);
  }
};

// PATCH /product
const updateProduct = async (req: Request, res: Response, next: NextFunction) => {

}

// DELETE /product
const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {

}


export {
  createProduct, deleteProduct, getProducts, updateProduct
};

