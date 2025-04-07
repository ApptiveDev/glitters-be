import express from 'express';
import logger from '@/utils/logger';
import memberRouter from '@/domains/member/controller';
import authRouter from '@/domains/auth/controller';
import institutionRouter from '@/domains/institution/controller';
import markerRouter from '@/domains/marker/controller';
import postRouter from '@/domains/post/controller';
import reportRouter from '@/domains/report/controller';
import { currentApiPrefix } from '@/constants';
import swaggerUi from 'swagger-ui-express';
import '@/utils/config';
import path from 'path';
import fs from 'fs';

const app = express();
const PORT = process.env.SERVER_PORT || 3000;
const API_PREFIX = currentApiPrefix;

app.use(logger);
app.use(express.json());

app.use(API_PREFIX, authRouter);
app.use(API_PREFIX, memberRouter);
app.use(API_PREFIX, institutionRouter);
app.use(API_PREFIX, markerRouter);
app.use(API_PREFIX, postRouter);
app.use(API_PREFIX, reportRouter);

app.set('trust proxy', 1);

app.get('/', (_, res) => {
  res.send('Hello, Express!');
});

app.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});

const swaggerPath = path.join(__dirname, '../docs/openapi.json');
const swaggerDocument = JSON.parse(fs.readFileSync(swaggerPath, 'utf8'));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
