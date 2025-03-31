import express from 'express';
import {
  handleEmailCodeInput,
  handleEmailVerifyRequest,
  handleLogin,
  handleRegister,
} from '@/domains/auth/service';
import {
  verifyEmailCodeLimiter,
  verifyEmailRequestLimiter,
} from '@/domains/auth/middleware';

const authRouter = express.Router();

authRouter.post('/register', handleRegister);
authRouter.post('/login', handleLogin);
authRouter.post('/verify-email', verifyEmailRequestLimiter(), handleEmailVerifyRequest);
authRouter.put('/verify-email', verifyEmailCodeLimiter(), handleEmailCodeInput);

export default authRouter;
