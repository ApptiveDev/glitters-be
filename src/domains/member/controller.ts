import express from 'express';
import { authMiddleware } from '@/domains/auth/middleware';
import {
  deactivateSelf,
  getActivePostCount,
  getMyInfo,
} from '@/domains/member/service';

const memberRouter = express.Router();

const ROUTE_PREFIX = '/members';

memberRouter.get(`${ROUTE_PREFIX}/me`, authMiddleware, getMyInfo);
memberRouter.delete(`${ROUTE_PREFIX}/me`, authMiddleware, deactivateSelf);
memberRouter.get(`${ROUTE_PREFIX}/active_posts`, authMiddleware, getActivePostCount);

export default memberRouter;
