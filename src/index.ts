import express from 'express';
import logger from '@/utils/logger';

const app = express();
const PORT = process.env.SERVER_PORT || 3000;

app.use(logger);
app.use(express.json());

app.get('/', (_, res) => {
  res.send('Hello, Express!');
});

app.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});
