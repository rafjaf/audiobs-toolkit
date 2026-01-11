import fs from 'node:fs/promises';
import { ensureConfig } from '../config.js';
import { AbsClient } from '../absClient.js';

export async function backupPlaylistsCommand(opts) {
  const config = await ensureConfig({ baseUrl: opts.baseUrl, libraryId: opts.libraryId });
  const client = new AbsClient({ baseUrl: config.baseUrl, apiKey: config.apiKey });

  const include = String(opts.include ?? '').trim();
  const playlists = await client.listPlaylistsForLibrary({
    libraryId: config.libraryId,
    include
  });

  const backup = {
    generatedAt: new Date().toISOString(),
    baseUrl: config.baseUrl,
    libraryId: config.libraryId,
    count: playlists.length,
    playlists
  };

  await fs.writeFile(opts.out, JSON.stringify(backup, null, 2) + '\n', 'utf8');
  process.stdout.write(`Wrote ${playlists.length} playlists to ${opts.out}\n`);
}
