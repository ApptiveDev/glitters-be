import path from 'node:path';
import fs from 'node:fs';
import { createStream } from 'rotating-file-stream';
import morgan from 'morgan';

const logDirectory = path.join(__dirname, '../../../logs');
fs.mkdirSync(logDirectory, { recursive: true });

export function overrideStdout() {
  const wrapConsole = (method: (...args: any[]) => void) => {
    return (...args: any[]) => {
      const timestamp = formatDateTime();
      method(timestamp, ...args);
    };
  };
  console.log = wrapConsole(console.log.bind(console));
  console.info = wrapConsole(console.info.bind(console));
  console.warn = wrapConsole(console.warn.bind(console));
  console.error = wrapConsole(console.error.bind(console));
}

export function setupStdoutLogStream() {
  overrideStdout();
  const stdoutStream = createDailyLogStream('stdout');
  const stderrStream = createDailyLogStream('stderr');

  const originalStdoutWrite = process.stdout.write.bind(process.stdout);
  const originalStderrWrite = process.stderr.write.bind(process.stderr);

  process.stdout.write = (chunk: any, encoding?: any, cb?: any) => {
    stdoutStream.write(chunk);
    return originalStdoutWrite(chunk, encoding, cb);
  };

  process.stderr.write = (chunk: any, encoding?: any, cb?: any) => {
    stderrStream.write(chunk);
    return originalStderrWrite(chunk, encoding, cb);
  };
}

export const accessLogStream = morgan('combined', {
  stream: createDailyLogStream('access')
});

function createDailyLogStream(namePrefix: string) {
  return createStream((time) => {
    if (!time) return `${namePrefix}.log`;
    const date = new Date(time instanceof Date ? time : new Date(time));
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}-${namePrefix}.log`;
  }, {
    interval: '1d',
    path: logDirectory,
    compress: 'gzip',
  });
}

function formatDateTime() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  return `[${y}-${m}-${d} ${hh}:${mm}:${ss}]`;
}
