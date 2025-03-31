import dotenv from 'dotenv';

dotenv.config();
export const currentApiPrefix = process.env.API_PREFIX || '/api';
