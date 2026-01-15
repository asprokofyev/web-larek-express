import { celebrate, Joi } from 'celebrate';

export const validateProductBody = celebrate({
  body: Joi.object().keys({
    title: Joi.string()
      .min(2)
      .max(30)
      .required()
      .messages({
        'string.min': 'Минимальная длина поля "title" - 2',
        'string.max': 'Максимальная длина поля "title" - 30',
        'any.required': 'Поле "title" должно быть заполнено',
      }),
    image: Joi.object()
      .keys({
        fileName: Joi.string()
          .required()
          .messages({
            'any.required': 'Поле "fileName" должно быть заполнено',
          }),
        originalName: Joi.string()
          .required()
          .messages({
            'any.required': 'Поле "originalName" должно быть заполнено',
          }),
      })
      .required()
      .messages({
        'any.required': 'Поле "image" должно быть заполнено',
      }),
    category: Joi.string()
      .required()
      .messages({
        'any.required': 'Поле "category" должно быть заполнено',
      }),
    description: Joi.string().allow(''),
    price: Joi.number().allow(null),
  }),
});

export const validateOrderBody = celebrate({
  body: Joi.object().keys({
    payment: Joi.string()
      .valid('card', 'online')
      .required()
      .messages({
        'any.only': 'Поле "payment" должно быть "card" или "online"',
        'any.required': 'Поле "payment" должно быть заполнено',
      }),
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Неверный формат email',
        'any.required': 'Поле "email" должно быть заполнено',
      }),
    phone: Joi.string()
      .required()
      .messages({
        'any.required': 'Поле "phone" должно быть заполнено',
      }),
    address: Joi.string()
      .required()
      .messages({
        'any.required': 'Поле "address" должно быть заполнено',
      }),
    total: Joi.number()
      .required()
      .messages({
        'any.required': 'Поле "total" должно быть заполнено',
      }),
    items: Joi.array()
      .items(Joi.string())
      .min(1)
      .required()
      .messages({
        'array.min': 'Массив items не может быть пустым',
        'any.required': 'Поле "items" должно быть заполнено',
      }),
  }),
});
