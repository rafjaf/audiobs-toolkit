import { ensureConfig } from '../config.js';
import { AbsClient } from '../absClient.js';

function getCollectionId(c) {
  return c?.id || c?._id || c?.collectionId;
}

function getCollectionName(c) {
  return c?.name || c?.title || getCollectionId(c) || 'Unnamed collection';
}

export async function collectionsToPlaylistsCommand(opts) {
  const config = await ensureConfig({ baseUrl: opts.baseUrl, libraryId: opts.libraryId });
  const client = new AbsClient({ baseUrl: config.baseUrl, apiKey: config.apiKey });

  const collections = await client.listCollectionsForLibrary({
    libraryId: config.libraryId
  });

  const selected = opts.collection
    ? collections.filter((c) => String(getCollectionId(c)) === String(opts.collection))
    : collections;

  if (opts.collection && selected.length === 0) {
    throw new Error(`Collection not found in library listing: ${opts.collection}`);
  }

  process.stdout.write(
    `Found ${selected.length} collection(s) to process${opts.dryRun ? ' (dry-run)' : ''}.\n`
  );

  for (const c of selected) {
    const collectionId = getCollectionId(c);
    const collectionName = getCollectionName(c);
    const playlistName = `${collectionName}${opts.nameSuffix ? String(opts.nameSuffix) : ''}`;

    if (opts.dryRun) {
      process.stdout.write(
        `[dry-run] Would create playlist from collection ${collectionId} (${collectionName}) as "${playlistName}"\n`
      );
      continue;
    }

    process.stdout.write(`Creating playlist from collection ${collectionId} (${collectionName})... `);
    await client.createPlaylistFromCollection({
      collectionId,
      name: playlistName
    });
    process.stdout.write('done\n');
  }
}
