import fs from 'node:fs/promises';
import { ensureConfig } from '../config.js';
import { AbsClient } from '../absClient.js';

function normalizePlaylistsFromBackup(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.playlists)) return payload.playlists;
  if (Array.isArray(payload?.results)) return payload.results;
  return [];
}

function getPlaylistId(p) {
  return p?.id || p?._id || p?.playlistId;
}

function getPlaylistName(p) {
  return p?.name || p?.title || getPlaylistId(p) || 'Unnamed playlist';
}

function extractPlaylistItems(p) {
  return (
    p?.items ||
    p?.mediaItems ||
    p?.playlistItems ||
    p?.playlistMediaItems ||
    p?.tracks ||
    []
  );
}

function extractCreateItems(playlist) {
  const items = extractPlaylistItems(playlist);
  const createItems = [];

  for (const item of items) {
    const libraryItemId = item?.libraryItemId || item?.mediaItemId || item?.libraryItem?.id || null;
    if (!libraryItemId) continue;

    const episodeId = item?.episodeId ?? null;

    // If it's a podcast episode but we can't find episodeId, skip.
    const mediaType = String(item?.mediaItemType ?? item?.type ?? '').toLowerCase();
    if (mediaType.includes('podcast') && !episodeId) continue;

    createItems.push({
      libraryItemId: String(libraryItemId),
      ...(episodeId ? { episodeId: String(episodeId) } : {})
    });
  }

  return createItems;
}

export async function restorePlaylistsCommand(opts) {
  const config = await ensureConfig({ baseUrl: opts.baseUrl, libraryId: opts.libraryId });
  const client = new AbsClient({ baseUrl: config.baseUrl, apiKey: config.apiKey });

  const raw = await fs.readFile(opts.in, 'utf8');
  const payload = JSON.parse(raw);

  const all = normalizePlaylistsFromBackup(payload);
  const selected = opts.only
    ? all.filter((p) => String(getPlaylistId(p)) === String(opts.only) || getPlaylistName(p) === String(opts.only))
    : all;

  if (opts.only && selected.length === 0) {
    throw new Error(`No playlist matched --only ${opts.only}`);
  }

  process.stdout.write(
    `Restoring ${selected.length} playlist(s) from ${opts.in}${opts.dryRun ? ' (dry-run)' : ''}.\n`
  );

  for (const p of selected) {
    const name = getPlaylistName(p);
    const description = p?.description || '';
    const items = extractCreateItems(p);

    if (opts.dryRun) {
      process.stdout.write(`[dry-run] Would create playlist "${name}" with ${items.length} item(s)\n`);
      continue;
    }

    process.stdout.write(`Creating playlist "${name}" with ${items.length} item(s)... `);
    await client.createPlaylist({
      name,
      description,
      libraryId: config.libraryId,
      items
    });
    process.stdout.write('done\n');
  }
}
