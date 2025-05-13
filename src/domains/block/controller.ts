import express from 'express';
import { authMiddleware } from '@/domains/auth/middleware';
import { blockByPostOrChatroom } from '@/domains/block/service';

const blockController = express.Router();

blockController.post('/blocks', authMiddleware, blockByPostOrChatroom);

export default blockController;
