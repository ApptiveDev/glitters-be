import express from 'express';
import { authMiddleware } from '@/domains/auth/middleware';
import { getMyInfo } from '@/domains/member/service';

const memberRouter = express.Router();

const ROUTE_PREFIX = '/members';

memberRouter.get(`${ROUTE_PREFIX}/me`, authMiddleware, getMyInfo);

export default memberRouter;
