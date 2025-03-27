# Node.js 20 버전 사용
FROM node:20

# pnpm 설치 (corepack 사용)
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# 의존성 설치
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# 전체 복사 및 빌드
COPY . .
RUN pnpm build

# 실행
CMD ["pnpm", "dev"]
