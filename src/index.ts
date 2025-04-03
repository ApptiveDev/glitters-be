import express from 'express';
import logger from '@/utils/logger';
import memberRouter from '@/domains/member/controller';
import authRouter from '@/domains/auth/controller';
import institutionRouter from '@/domains/institution/controller';
import markerRouter from '@/domains/marker/controller';
import { currentApiPrefix } from '@/constants';
import '@/utils/config';
import postRouter from '@/domains/post/controller';

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

app.get('/', (_, res) => {
  res.send('Hello, Express!');
});

app.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});
