import cors from 'cors';
import 'dotenv/config';
import express, { json } from 'express';
import mongoose from 'mongoose';
import path from 'path';
import { DB_ADDRESS, PORT } from './config';
import errorHandler from './middlewares/error-handler';
import routes from './routes';

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use(json());
app.use(routes);
app.use(errorHandler);

const bootstrap = async () => {
  try {
    await mongoose.connect(DB_ADDRESS);
    // eslint-disable-next-line no-console
    await app.listen(PORT, () => console.log('ok'));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
  }
}

bootstrap();
