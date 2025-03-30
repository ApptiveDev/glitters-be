import express from 'express';
import {
  handleEmailVerifyRequest,
  handleLogin,
  handleRegister,
} from '@/domains/auth/service';

const authRouter = express.Router();

authRouter.post('/register', handleRegister);
authRouter.post('/login', handleLogin);
authRouter.post('/verify-email', handleEmailVerifyRequest);

export default authRouter;
