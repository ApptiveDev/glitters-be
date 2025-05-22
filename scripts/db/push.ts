import { execSync } from 'child_process';
import * as dotenv from 'dotenv';
import path from 'path';

const envPath = path.resolve('.env.prisma');
dotenv.config({ path: envPath });

const args = process.argv.slice(2);
const isProduction = args.includes('--production');
const isStaging = args.includes('--staging');

let databaseUrl = '';

if (isProduction) {
  databaseUrl = process.env.DATABASE_URL_PRODUCTION ?? '';
} else if (isStaging) {
  databaseUrl = process.env.DATABASE_URL_STAGING ?? '';
} else {
  console.error('실행 인자가 필요합니다: --staging 또는 --production');
  process.exit(1);
}

if (!databaseUrl) {
  console.error('해당 환경의 DATABASE_URL이 .env.prisma에 설정되어 있지 않습니다.');
  process.exit(1);
}

try {
  console.log(`Pushing Prisma schema to ${isProduction ? 'production' : 'staging'}...`);
  execSync(`cross-env DATABASE_URL=${databaseUrl} prisma db push`, {
    stdio: 'inherit',
  });
} catch (err) {
  console.error('prisma db push 실패:', err);
  process.exit(1);
}
