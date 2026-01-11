import fs from 'node:fs/promises';
import { ensureConfig } from '../config.js';
import { AbsClient } from '../absClient.js';

export async function backupCollectionsCommand(opts) {
  const config = await ensureConfig({ baseUrl: opts.baseUrl, libraryId: opts.libraryId });
  const client = new AbsClient({ baseUrl: config.baseUrl, apiKey: config.apiKey });

  const include = String(opts.include ?? '').trim();
  const collections = await client.listCollectionsForLibrary({
    libraryId: config.libraryId,
    include
  });

  const backup = {
    generatedAt: new Date().toISOString(),
    baseUrl: config.baseUrl,
    libraryId: config.libraryId,
    count: collections.length,
    collections
  };

  await fs.writeFile(opts.out, JSON.stringify(backup, null, 2) + '\n', 'utf8');
  process.stdout.write(`Wrote ${collections.length} collections to ${opts.out}\n`);
}
