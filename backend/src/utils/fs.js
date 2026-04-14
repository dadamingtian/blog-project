import fs from 'node:fs/promises';

export async function ensureDirectory(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}
