export const tokenHeader = {
  name: 'Authorization',
  in: 'header',
  required: true,
  schema: {
    type: 'string',
    example: 'Bearer <your-jwt-token>',
  },
  description: 'Bearer 토큰',
};
