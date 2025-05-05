import express from 'express';
import path from 'path';
import fs from 'fs';
import { currentApiPrefix } from '@/constants';
import { errorHandler } from '@/domains/error/middleware';
import logger from '@/utils/logger';
import swaggerUi from 'swagger-ui-express';
import { getMarkdownHtml } from '@/utils/docs';
import { pathToFileURL } from 'node:url';

export async function start() {
  const app = express();
  const PORT = process.env.SERVER_PORT || 3000;

  app.use(logger);
  app.use(express.json());
  app.set('trust proxy', 1);

  // domain 내부 컨트롤러들 등록
  await registerRoutes(app);
  // privacy policy, tos, api docs
  await registerDocumentRoutes(app);

  app.listen(PORT, () => {
    console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
  });
}

export async function registerDocumentRoutes(app: express.Application) {
  const swaggerPath = path.join(__dirname, '../docs/openapi.json');
  const swaggerDocument = JSON.parse(fs.readFileSync(swaggerPath, 'utf8'));

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  app.get('/privacy-policy', async(_, res) => {
    res.send(await getMarkdownHtml('privacy_policy.md'));
  });
  app.get('/terms-of-service', async(_, res) => {
    res.send(await getMarkdownHtml('terms_of_service.md'));
  });
}

export async function registerRoutes(app: express.Application) {
  app.use(await loadRouters());
}

export async function loadRouters() {
  const apiRouter = express.Router();
  const domainsPath = path.join(__dirname, 'domains');
  const isDev = process.env.NODE_ENV === 'development';
  const ext = isDev ? '.ts' : '.js';

  for (const domain of fs.readdirSync(domainsPath)) {
    const controllerFile = path.join(domainsPath, domain, `controller${ext}`);

    try {
      let router: any;

      if (isDev) {
        const module = await import(pathToFileURL(controllerFile).href);
        router = module.default;
      } else {
        const module = require(controllerFile);
        router = module.default || module;
      }

      if (router) {
        apiRouter.use(currentApiPrefix, router);
      }
    } catch (err) {
      console.warn(`controller${ext} not found in ${domain}, skipping`);
    }
  }

  apiRouter.use(currentApiPrefix, errorHandler);
  return apiRouter;
}

start();
