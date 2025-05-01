import express from 'express';
import {
  getInstitutionBounds,
  getInstitutions,
} from '@/domains/institution/service';
import { authMiddleware } from '@/domains/auth/middleware';

const institutionRouter = express.Router();
const routerPrefix = '/institutions';

institutionRouter.get(`${routerPrefix}`, getInstitutions);
institutionRouter.get(`${routerPrefix}/bounds`, authMiddleware, getInstitutionBounds);

export default institutionRouter;
