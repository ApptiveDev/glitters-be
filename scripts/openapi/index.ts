import { createDocument } from 'zod-openapi';
import { authApiPaths } from './auth';
import fs from 'fs';
import path from 'path';
import yaml from 'yaml';
import { institutionApiPaths } from './institution';
import { markerApiPaths } from './marker';
import { memberApiPaths } from './member';
import { postApiPaths } from './post';
import { reportApiPaths } from './report';
import { likeApiPaths } from './like';
import { notificationApiPaths } from './notification';
import { chatApiPaths } from './chats';
import { blockApiPaths } from './block';

export const openApiDocument = createDocument({
  openapi: '3.1.0',
  info: {
    title: '반짝이 API',
    version: '1.0.0',
    description: '반짝이 앱 API 명세',
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
  servers: [
    {
      url: 'https://banjjak.me:8444',
      description: '개발 서버',
    },
  ],
  paths: {
    ...authApiPaths,
    ...institutionApiPaths,
    ...markerApiPaths,
    ...memberApiPaths,
    ...postApiPaths,
    ...reportApiPaths,
    ...likeApiPaths,
    ...notificationApiPaths,
    ...chatApiPaths,
    ...blockApiPaths
  },
});

const outputDir = path.resolve(__dirname, '../../docs');
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

