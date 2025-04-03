import express from 'express';
import { deletePost, getPost } from '@/domains/post/service';

const postRouter = express.Router();

const apiPrefix = '/posts';

postRouter.get(`${apiPrefix}/:postId`, getPost); // TODO: 토큰 필터 추가
postRouter.delete(`${apiPrefix}/:postId`, deletePost);
postRouter.post(`${apiPrefix}`, getPost);

export default postRouter;
