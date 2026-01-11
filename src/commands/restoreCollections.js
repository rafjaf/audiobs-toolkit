import fs from 'node:fs/promises';
import { ensureConfig } from '../config.js';
import { AbsClient } from '../absClient.js';

function normalizeCollectionsFromBackup(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.collections)) return payload.collections;
  if (Array.isArray(payload?.results)) return payload.results;
  return [];
}

function getCollectionId(c) {
  return c?.id || c?._id || c?.collectionId;
}

function getCollectionName(c) {
  return c?.name || c?.title || getCollectionId(c) || 'Unnamed collection';
}

function extractCollectionBookIds(c) {
  const books = c?.books || c?.items || c?.libraryItems || [];
  const ids = [];

  for (const b of books) {
    const id = b?.id || b?.bookId || b?.libraryItemId || b?.libraryItem?.id || null;
    if (!id) continue;
    ids.push(String(id));
  }

  return ids;
}

export async function restoreCollectionsCommand(opts) {
  const config = await ensureConfig({ baseUrl: opts.baseUrl, libraryId: opts.libraryId });
  const client = new AbsClient({ baseUrl: config.baseUrl, apiKey: config.apiKey });

  const raw = await fs.readFile(opts.in, 'utf8');
  const payload = JSON.parse(raw);

  const all = normalizeCollectionsFromBackup(payload);
  const selected = opts.only
    ? all.filter((c) => String(getCollectionId(c)) === String(opts.only) || getCollectionName(c) === String(opts.only))
    : all;

  if (opts.only && selected.length === 0) {
    throw new Error(`No collection matched --only ${opts.only}`);
  }

  process.stdout.write(
    `Restoring ${selected.length} collection(s) from ${opts.in}${opts.dryRun ? ' (dry-run)' : ''}.\n`
  );

  for (const c of selected) {
    const name = getCollectionName(c);
    const description = c?.description || '';
    const bookIds = extractCollectionBookIds(c);

    if (opts.dryRun) {
      process.stdout.write(
        `[dry-run] Would create collection "${name}" with ${bookIds.length} book(s)\n`
      );
      continue;
    }

    process.stdout.write(`Creating collection "${name}" with ${bookIds.length} book(s)... `);
    await client.createCollection({
      name,
      description,
      libraryId: config.libraryId,
      books: bookIds
    });
    process.stdout.write('done\n');
  }
}
