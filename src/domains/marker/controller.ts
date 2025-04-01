import express from 'express';
import { getMarkers } from '@/domains/marker/service';

const routerPrefix = '/markers';

const markerRouter = express.Router();

markerRouter.get(`${routerPrefix}`, getMarkers); // TODO: Token Filter 추가

export default markerRouter;
