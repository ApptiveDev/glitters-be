import express from 'express';
import path from 'path';
import fs from 'fs';
import { currentApiPrefix } from '@/constants';
import { errorHandler } from '@/domains/error/middleware';
import swaggerUi from 'swagger-ui-express';
import { getMarkdownHtml } from '@/utils/docs';
import { pathToFileURL } from 'node:url';
import * as http from 'node:http';
import ChatServer from '@/domains/chat/ChatServer';
import rateLimit from 'express-rate-limit';
import { accessLogStream, setupStdoutLogStream } from '@/utils/logger';

export async function start() {
  const app = express();
  const PORT = process.env.SERVER_PORT || 3000;

  setupStdoutLogStream();
  app.use(accessLogStream);
  app.use(express.json());
  app.set('trust proxy', 1);

  await registerBaseLimiter(app);
  // domain 내부 컨트롤러들 등록
  await registerRoutes(app);
  // privacy policy, tos, api docs
  await registerDocumentRoutes(app);
  await scheduleCronJobs();

  const httpServer = http.createServer(app);
  new ChatServer(httpServer);

  httpServer.listen(PORT, () => {
    console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
  });
}

export async function registerBaseLimiter(app: express.Application) {
  const apiRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 100, // 1분에 100번 요청 가능
    standardHeaders: true,
    legacyHeaders: false,
    message: '요청이 너무 많습니다. 잠시 후 다시 시도하세요.',
  });
  app.use(currentApiPrefix, apiRateLimiter);
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

export async function scheduleCronJobs() {
  const domainsPath = path.join(__dirname, 'domains');
  const isDev = process.env.NODE_ENV === 'development';
  const ext = isDev ? '.ts' : '.js';

  for (const domain of fs.readdirSync(domainsPath)) {
    const schedulerFile = path.join(domainsPath, domain, `scheduler${ext}`);

    try {
      if (isDev) {
        await import(pathToFileURL(schedulerFile).href);
      } else {
        require(schedulerFile);
      }
      console.log('scheduler for', domain, 'registered successfully.');
    } catch (_) {
      continue;
    }
  }

}

export async function registerRoutes(app: express.Application) {
  app.use(await loadRouters());
  app.use(errorHandler);
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
      continue;
    }
  }

  return apiRouter;
}

start();
