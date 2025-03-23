import rfs from 'rotating-file-stream';
import path from 'node:path';
import morgan from 'morgan';

const logDirectory = path.join(__dirname, '../logs');

const defaultLogStream = rfs.createStream((time) => {
  if (!time) return 'access.log'; // 최초 요청 시

  time = time instanceof Date ? time : new Date(time);
  const year = time.getFullYear();
  const month = String(time.getMonth() + 1).padStart(2, '0');
  const day = String(time.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}-access.log`;
}, {
  interval: '1d',
  path: logDirectory,
  compress: 'gzip',
});

const logger = morgan('combined', { stream: defaultLogStream });
export default logger;
