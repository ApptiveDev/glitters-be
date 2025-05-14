import express from 'express';
import { authMiddleware } from '@/domains/auth/middleware';
import { createChatroom, getChatrooms, getChats } from '@/domains/chat/service';

const chatController = express.Router();

chatController.post('/chatrooms', authMiddleware, createChatroom);
chatController.get('/chatrooms', authMiddleware, getChatrooms);
chatController.get('/chatrooms/:id', authMiddleware, getChats);

export default chatController;
