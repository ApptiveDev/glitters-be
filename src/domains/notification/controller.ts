import express from 'express';
import {
  handleExpoTokenInput,
} from '@/domains/notification/service';
import { authMiddleware } from '@/domains/auth/middleware';

const notificationRouter = express.Router();

notificationRouter.put('/notifications', authMiddleware, handleExpoTokenInput);

export default notificationRouter;
