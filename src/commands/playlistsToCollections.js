import { ensureConfig } from '../config.js';
import { AbsClient } from '../absClient.js';

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

function extractBookIdsFromPlaylist(playlist) {
  const items = extractPlaylistItems(playlist);
  const bookIds = [];

  for (const item of items) {
    const mediaType = String(item?.mediaItemType ?? item?.type ?? '').toLowerCase();
    const hasEpisodeId = item?.episodeId !== undefined && item?.episodeId !== null && item?.episodeId !== '';

    // Skip podcasts/episodes.
    if (hasEpisodeId || mediaType.includes('podcast')) continue;

    const id =
      item?.libraryItemId ||
      item?.mediaItemId ||
      item?.bookId ||
      item?.libraryItem?.id ||
      item?.book?.id ||
      null;

    if (!id) continue;
    bookIds.push(String(id));
  }

  return bookIds;
}

export async function playlistsToCollectionsCommand(opts) {
  const config = await ensureConfig({ baseUrl: opts.baseUrl, libraryId: opts.libraryId });
  const client = new AbsClient({ baseUrl: config.baseUrl, apiKey: config.apiKey });

  const playlists = await client.listPlaylistsForLibrary({
    libraryId: config.libraryId
  });

  const selected = opts.playlist
    ? playlists.filter((p) => String(getPlaylistId(p)) === String(opts.playlist))
    : playlists;

  if (opts.playlist && selected.length === 0) {
    throw new Error(`Playlist not found in library listing: ${opts.playlist}`);
  }

  process.stdout.write(
    `Found ${selected.length} playlist(s) to process${opts.dryRun ? ' (dry-run)' : ''}.\n`
  );

  for (const p of selected) {
    const playlistId = getPlaylistId(p);
    const playlistName = getPlaylistName(p);
    const collectionName = `${playlistName}${opts.nameSuffix ? String(opts.nameSuffix) : ''}`;

    const bookIds = extractBookIdsFromPlaylist(p);

    if (opts.dryRun) {
      process.stdout.write(
        `[dry-run] Would create collection from playlist ${playlistId} (${playlistName}) as "${collectionName}" with ${bookIds.length} book(s)\n`
      );
      continue;
    }

    process.stdout.write(
      `Creating collection from playlist ${playlistId} (${playlistName}) with ${bookIds.length} book(s)... `
    );

    await client.createCollection({
      name: collectionName,
      description: p?.description || '',
      libraryId: config.libraryId,
      books: bookIds
    });

    process.stdout.write('done\n');
  }
}
