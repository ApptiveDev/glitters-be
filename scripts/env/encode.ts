import fs from 'fs';

const path = process.env.NODE_ENV === 'development' ? '.env' : `.env.${process.env.NODE_ENV}`;
const content = Buffer.from(fs.readFileSync(path).toString()).toString('base64');

console.log('base64 encode completed\n');
console.log(content);

