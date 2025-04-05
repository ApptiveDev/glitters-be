import express from 'express';
import { authMiddleware } from '@/domains/auth/middleware';
import { getActivePostCount, getMyInfo } from '@/domains/member/service';

const memberRouter = express.Router();

const ROUTE_PREFIX = '/members';

memberRouter.get(`${ROUTE_PREFIX}/me`, authMiddleware, getMyInfo);
memberRouter.get(`${ROUTE_PREFIX}/active_posts`, authMiddleware, getActivePostCount);

export default memberRouter;
