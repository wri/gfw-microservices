import * as fs from 'fs';
import * as path from 'path';
import { createHash } from 'crypto';

export const saveSwaggerJsonDocument = async (swaggerJsonDocument: object) => {
  const jsonDocumentPath = path
    .join(__dirname, 'swagger-doc', 'document.json')
    .replace('/dist', '');
  try {
    const oldSwaggerDoc = JSON.parse(fs.readFileSync(jsonDocumentPath, 'utf8'));

    const hashOlsSwaggerDoc = createHash('md5').update(JSON.stringify(oldSwaggerDoc)).digest('hex');

    const hash = createHash('md5').update(JSON.stringify(swaggerJsonDocument)).digest('hex');

    if (hashOlsSwaggerDoc !== hash) {
      await fs.writeFileSync(jsonDocumentPath, JSON.stringify(swaggerJsonDocument, null, 2));
    }
  } catch (error) {
    await fs.writeFileSync(jsonDocumentPath, JSON.stringify(swaggerJsonDocument, null, 2));
  }
};
