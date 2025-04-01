import express from 'express';
import {
  getInstitutionBounds,
  getInstitutions,
} from '@/domains/institution/service';

const institutionRouter = express.Router();
const routerPrefix = '/institutions';

institutionRouter.get(`${routerPrefix}`, getInstitutions);
institutionRouter.get(`${routerPrefix}/bounds`, getInstitutionBounds);

export default institutionRouter;
