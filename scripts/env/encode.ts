import fs from 'fs';

const envFiles = fs
.readdirSync('.')
.filter((file) => file.startsWith('.env') && fs.statSync(file).isFile());

for (const file of envFiles) {
  const content = fs.readFileSync(file, 'utf-8');
  const base64 = Buffer.from(content).toString('base64');

  console.log(`File: ${file}`);
  console.log(base64);
  console.log('\n---\n');
}
