import express from 'express';
import { authMiddleware } from '@/domains/auth/middleware';
import { createChatroom, getChatrooms } from '@/domains/chat/service';

const chatController = express.Router();

chatController.post('/chatrooms', authMiddleware, createChatroom);
chatController.get('/chatrooms', authMiddleware, getChatrooms);

export default chatController;
