import { Router } from 'express';
import {
  getCurrentUser, login, logout, refreshAccessToken, register,
} from '../controllers/auth';
import auth from '../middlewares/auth';
import { validateAuth, validateUser } from '../middlewares/validators';

const authRouter = Router();

authRouter.get('/user', auth, getCurrentUser);
authRouter.post('/login', validateAuth, login);
authRouter.post('/register', validateUser, register);
authRouter.get('/token', refreshAccessToken);
authRouter.get('/logout', logout);

export default authRouter;
