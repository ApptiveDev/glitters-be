import express from 'express';
import { authMiddleware } from '@/domains/auth/middleware';
import { createLike, deleteLike } from '@/domains/like/service';

const likeRouter = express.Router();

likeRouter.post('/likes', authMiddleware, createLike);
likeRouter.delete('/likes', authMiddleware, deleteLike);

export default likeRouter;
