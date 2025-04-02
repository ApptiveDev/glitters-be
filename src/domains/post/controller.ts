import express from 'express';
import { deletePost, getPost } from '@/domains/post/service';

const postRouter = express.Router();

const apiPrefix = '/posts';

postRouter.get(`${apiPrefix}/:post_id`, getPost); // TODO: 토큰 필터 추가
postRouter.delete(`${apiPrefix}/:post_id`, deletePost);
postRouter.post(`${apiPrefix}`, getPost);

export default postRouter;
