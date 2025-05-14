import { extendZodWithOpenApi } from 'zod-openapi';
import { z } from 'zod';

extendZodWithOpenApi(z);

export const tokenHeader = z
.string()
.openapi({
  param: {
    name: 'Authorization',
    in: 'header',
    required: true,
    description: 'Bearer 토큰',
  },
  example: 'Bearer <your-jwt>',
});
