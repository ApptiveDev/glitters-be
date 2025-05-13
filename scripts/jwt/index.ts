import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// CLI 인자 파싱
const args = process.argv.slice(2);
const getArg = (key: string): string | undefined => {
  const index = args.indexOf(key);
  return index !== -1 && args[index + 1] ? args[index + 1] : undefined;
};

const id = getArg('--id');
const email = getArg('--email');
const name = getArg('--name');
const t = getArg('-t') ?? '3600';

if (!id || !email || !name) {
  console.error('Usage: tsx generateExpiredJwt.ts --id <id> --email <email> --name <name> [-t <secondsAgo>]');
  process.exit(1);
}

const offsetSeconds = parseInt(t, 10);
if (isNaN(offsetSeconds)) {
  console.error('-t 값은 숫자여야 합니다.');
  process.exit(1);
}

const expiredAt = Math.floor(Date.now() / 1000) + offsetSeconds;

const payload = {
  id: parseInt(id, 10),
  email,
  name,
  exp: expiredAt,
};

const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
  algorithm: 'HS256',
});

console.log('JWT Generated\n\n', token);
