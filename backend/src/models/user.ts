import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import mongoose, { Document, HydratedDocument, Model } from 'mongoose';
import validator from 'validator';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../config';
import UnauthorizedError from '../errors/unauthorized-error';

interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  tokens: { token: string; }[];
}

interface IUserMethods {
  generateAccessToken(): string;
  generateRefreshToken(): Promise<string>;
  toJSON(): string;
}

interface IUserModel extends Model<IUser, {}, IUserMethods> {
  findUserByCredentials: (
    email: string,
    password: string
  ) => Promise<HydratedDocument<IUser, IUserMethods>>;
}

const userSchema = new mongoose.Schema<IUser, IUserModel, IUserMethods>({
  name: {
    type: String,
    default: 'Евлампий',
    minlength: [2, 'Минимальная длина поля name - 2'],
    maxlength: [30, 'Максимальная длина поля name - 30'],
  },
  email: {
    type: String,
    required: [true, 'Поле email должно быть заполнено'],
    unique: true,
    validate: {
      validator: (v: string) => validator.isEmail(v),
      message: 'Поле email должно быть валидным email-адресом',
    }
  },
  password: {
    type: String,
    required: [true, 'Поле password должно быть заполнено'],
    unique: true,
    minlength: [6, 'Минимальная длина поля password - 6'],
    select: false,
  },
  tokens: [
    {
      token: {
        type: String,
        required: true,
      }
    }
  ],
}, {
  versionKey: false,
  toJSON: {
    virtuals: true,
    transform: (_doc, ret) => {
      const { tokens, password, _id, ...rest } = ret;
      return rest;
    },
  },
});

userSchema.pre('save', async function hashingPassword(next) {
  try {
    if (this.isModified('password')) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
    next();
  } catch (error) {
    next(error as Error);
  }
});

userSchema.methods.generateAccessToken = function generateAccessToken() {
  const user = this;
  const accessToken = jwt.sign(
    {
      _id: user._id.toString(),
      email: user.email,
    },
    ACCESS_TOKEN.secret,
    {
      expiresIn: ACCESS_TOKEN.expiry,
    },
  );
  return accessToken;
};

userSchema.methods.generateRefreshToken = async function generateRefreshToken() {
  const user = this;
  const refreshToken = jwt.sign(
    {
      _id: user._id.toString(),
    },
    REFRESH_TOKEN.secret,
    {
      expiresIn: REFRESH_TOKEN.expiry,
    },
  );

  const rTknHash = crypto
    .createHmac('sha256', REFRESH_TOKEN.secret)
    .update(refreshToken)
    .digest('hex');

  user.tokens.push({ token: rTknHash });
  await user.save();

  return refreshToken;
};

userSchema.statics.findUserByCredentials = async function findUserByCredentials(email: string, password: string) {
  const user = await this.findOne({ email }).select('+password').orFail(
    () => new UnauthorizedError('Неправильная почта или пароль')
  );
  const passwdMatch = await bcrypt.compare(password, user.password);
  if(!passwdMatch) {
    return Promise.reject(new UnauthorizedError('Неправильная почта или пароль'));
  }
  return user;
}

const UserModel = mongoose.model<IUser, IUserModel>('user', userSchema);

export default UserModel;
