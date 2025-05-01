import fs from 'node:fs/promises';
import path from 'path';
import { marked } from 'marked';

export async function getMarkdownHtml(filename: string) {
  const filePath = path.join(process.cwd(), 'docs', filename);
  const content = await fs.readFile(filePath, 'utf-8');
  const markdown = await marked(content);
  return (
    `<!DOCTYPE html>
      <html>
        <head><meta charset="UTF-8"><title>Privacy Policy</title></head>
        <body>${markdown}</body>
      </html>
    `
  );
}
