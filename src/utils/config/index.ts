import dotenv from 'dotenv';

const path = process.env.NODE_ENV === 'development' ? '.env' : `.env.${process.env.NODE_ENV}`;

dotenv.config({
  path
});
