import express from 'express';
import { createPost, deletePost, getPost } from '@/domains/post/service';
import { authMiddleware } from '@/domains/auth/middleware';

const postRouter = express.Router();

const apiPrefix = '/posts';

postRouter.get(`${apiPrefix}/:postId`, authMiddleware, getPost);
postRouter.delete(`${apiPrefix}/:postId`, authMiddleware, deletePost);
postRouter.post(`${apiPrefix}`, authMiddleware, createPost);

export default postRouter;
