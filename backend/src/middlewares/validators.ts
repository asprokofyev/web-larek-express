import { Joi, Segments, celebrate } from 'celebrate';
import { Types } from 'mongoose';

enum PaymentType {
  Card = 'card',
  Online = 'online',
}

// Валидация данных заказа
export const validateOrderBody = celebrate({
  body: Joi.object().keys({
    payment: Joi.string()
      .valid(...Object.values(PaymentType))
      .required()
      .messages({
        'string.valid': 'Указано не валидное значение способа оплаты, должно быть "card" или "online"',
        'any.required': 'Не указан способ оплаты',
      }),
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Неверный формат email',
        'any.required': 'Не указан email',
      }),
    phone: Joi.string()
      .required()
      .messages({
        'any.required': 'Не указан номер телефона',
      }),
    address: Joi.string()
      .required()
      .messages({
        'any.required': 'Не укзан адрес доставки',
      }),
    total: Joi.number()
      .required()
      .messages({
        'any.required': 'Не указана сумма заказа',
      }),
    items: Joi.array()
      .min(1)
      .items(
        Joi.string().custom((value, helpers) => {
          if(Types.ObjectId.isValid(value)) {
            return value;
          }
          return helpers.message({ custom: 'Невалидный id' });
        })
      )
      .messages({
        'array.min': 'Не указаны товары',
      }),
  }),
});

// Валидатор данных нового товара
export const validateProductBody = celebrate({
  body: Joi.object().keys({
    title: Joi.string().required().min(2).max(30).messages({
      'string.min': 'Минимальная длина поля title - 2',
      'string.max': 'Максимальная длина поля title = 30',
      'any.required': 'Поле title должно быть заполнено',
    }),
    image: Joi.object()
      .required()
      .messages({
        'any.required': 'Поле image должно быть заполнено',
      })
      .keys({
        fileName: Joi.string().required().messages({
          'any.required': 'Поле fileName должно быть заполнено',
        }),
        originalName: Joi.string().required().messages({
          'any.required': 'Поле originalName должно быть заполнено',
        }),
      }),
    category: Joi.string().required().messages({
      'any.required': 'Поле category должно быть заполнено',
    }),
    description: Joi.string().required().messages({
      'any.required': 'Поле description должно быть заполнено',
    }),
    price: Joi.number().allow(null),
  }),
});

export const validateObjectId = celebrate({
  [Segments.PARAMS]: Joi.object().keys({
    productId: Joi.string()
      .required()
      .custom((value, helpers) => {
        if (Types.ObjectId.isValid(value)) return value;
        return helpers.message({ any: 'Невалидный id' });
      }),
  }),
});

export const validateProductUpdate = celebrate({
  [Segments.BODY]: Joi.object().keys({
    title: Joi.string().min(2).max(30).messages({
      'string.min': 'Минимальная длина поля name - 2',
      'string.max': 'Максимальная длина поля "name" - 30',
    }),
    image: Joi.object().keys({
      fileName: Joi.string().required(),
      originName: Joi.string().required(),
      size: Joi.number().optional(),
      mimetype: Joi.string().optional(),
    }),
    category: Joi.string(),
    description: Joi.string(),
    price: Joi.number().allow(null),
  }),
});

export const validateUser = celebrate({
  [Segments.BODY]: Joi.object().keys({
    name: Joi.string().min(2).max(30).messages({
      'string.min': 'Минимальная длина поля "name" - 2',
      'string.max': 'Максимальная длина поля "name" - 30',
    }),
    password: Joi.string().min(6).required().messages({
      'string.empty': 'Поле "password" должно быть заполнено',
    }),
    email: Joi.string()
      .required()
      .email()
      .message('Поле "email" должно быть валидным email-адресом')
      .messages({ 'string.empty': 'Поле "email" должно быть заполнено' }),
  }),
});

export const validateAuth = celebrate({
  [Segments.BODY]: Joi.object().keys({
    email: Joi.string()
      .required()
      .email()
      .message('Поле "email" должно быть валидным email-адресом')
      .messages({
        'string.required': 'Поле "email" должно быть заполнено',
      }),
    password: Joi.string().required().messages({
      'string.empty': 'Поле "password" должно быть заполнено',
    }),
  }),
});