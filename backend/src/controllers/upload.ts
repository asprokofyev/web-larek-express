import { NextFunction, Request, Response } from 'express';
import BadRequestError from '../errors/bad-request-error';
import { HttpCodes } from '../errors/codes';

export const uploadFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if(!req.file) {
      throw next(new BadRequestError('Файл не загружен'));
    }
    const fileName = process.env.UPLOAD_PATH ? `/${process.env.UPLOAD_PATH}/${req.file.filename}` : `${req.file.filename}`;
    return res.status(HttpCodes.CREATED)
      .send({
        fileName,
        originalName: req.file.originalname,
      });
  } catch (error) {
    return next(error);
  }
};

export default {};
