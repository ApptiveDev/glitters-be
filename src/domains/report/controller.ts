import express from 'express';
import { createReport } from '@/domains/report/service';
import { authMiddleware } from '@/domains/auth/middleware';

const reportRouter = express.Router();

const apiPrefix = '/reports';

reportRouter.post(apiPrefix, authMiddleware, createReport);

export default reportRouter;
