import { createDocument } from 'zod-openapi';
import { authApiPaths } from './auth';
import fs from 'fs';
import path from 'path';
import yaml from 'yaml';

export const openApiDocument = createDocument({
  openapi: '3.1.0',
  info: {
    title: 'Auth API',
    version: '1.0.0',
    description: '회원가입, 로그인, 이메일 인증 API 명세',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: '로컬 개발 서버',
    },
  ],
  paths: {
    ...authApiPaths,
  },
});

const outputDir = path.resolve(__dirname, '../docs');
const jsonPath = path.join(outputDir, 'openapi.json');
const yamlPath = path.join(outputDir, 'openapi.yml');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(jsonPath, JSON.stringify(openApiDocument, null, 2), 'utf-8');

const yamlString = yaml.stringify(openApiDocument);
fs.writeFileSync(yamlPath, yamlString, 'utf-8');

console.log('✅ OpenAPI 문서가 저장되었습니다:');
console.log(`📄 JSON: ${jsonPath}`);
console.log(`📄 YAML: ${yamlPath}`);

