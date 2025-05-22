import express from 'express';
import {
  handleRegisterEmailCodeInput,
  handleEmailVerifyRequest,
  handleLogin, handleLogout,
  handleRegister, handlePasswordReset,
} from '@/domains/auth/service';
import {
  authMiddleware,
  verifyEmailCodeLimiter,
  verifyEmailRequestLimiter,
} from '@/domains/auth/middleware';

const authRouter = express.Router();

authRouter.post('/register', handleRegister);
authRouter.post('/login', handleLogin);
authRouter.post('/logout', authMiddleware, handleLogout);
authRouter.post('/verify-email', verifyEmailRequestLimiter(), handleEmailVerifyRequest);
authRouter.put('/verify-email', verifyEmailCodeLimiter(), handleRegisterEmailCodeInput);
authRouter.put('/password', handlePasswordReset);

export default authRouter;
