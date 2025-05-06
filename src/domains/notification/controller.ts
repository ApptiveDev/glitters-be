import express from 'express';
import {
  handleExpoTokenInput,
  handleLocationInput,
} from '@/domains/notification/service';
import { authMiddleware } from '@/domains/auth/middleware';

const notificationRouter = express.Router();

notificationRouter.put('/notifications', authMiddleware, handleExpoTokenInput);
notificationRouter.post('/locations', authMiddleware, handleLocationInput);
