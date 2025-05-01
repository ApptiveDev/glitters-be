import express from 'express';
import { getMarkers } from '@/domains/marker/service';
import { authMiddleware } from '@/domains/auth/middleware';

const routerPrefix = '/markers';

const markerRouter = express.Router();

markerRouter.get(`${routerPrefix}`, authMiddleware, getMarkers);

export default markerRouter;
