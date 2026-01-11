#!/usr/bin/env node

import { Command } from 'commander';
import { backupCollectionsCommand } from './commands/backupCollections.js';
import { backupPlaylistsCommand } from './commands/backupPlaylists.js';
import { collectionsToPlaylistsCommand } from './commands/collectionsToPlaylists.js';
import { playlistsToCollectionsCommand } from './commands/playlistsToCollections.js';
import { restoreCollectionsCommand } from './commands/restoreCollections.js';
import { restorePlaylistsCommand } from './commands/restorePlaylists.js';

const program = new Command();

program
  .name('audiobs-toolkit')
  .description('CLI utilities for Audiobookshelf collections and playlists')
  .version('0.1.0');

program
  .command('backup-collections')
  .description('Backup library collections to a JSON file')
  .option('-b, --base-url <url>', 'Audiobookshelf base URL (e.g. https://abs.example.com)')
  .option('-l, --library-id <id>', 'Library ID')
  .option('-o, --out <file>', 'Output JSON file', 'collections-backup.json')
  .option('--include <csv>', 'Include expansion params (comma-separated)', '')
  .action(async (opts) => {
    await backupCollectionsCommand(opts);
  });

program
  .command('backup-playlists')
  .description('Backup library playlists (owned by current user) to a JSON file')
  .option('-b, --base-url <url>', 'Audiobookshelf base URL (e.g. https://abs.example.com)')
  .option('-l, --library-id <id>', 'Library ID')
  .option('-o, --out <file>', 'Output JSON file', 'playlists-backup.json')
  .option('--include <csv>', 'Include expansion params (comma-separated)', '')
  .action(async (opts) => {
    await backupPlaylistsCommand(opts);
  });

program
  .command('collections-to-playlists')
  .description('Create playlists from collections (1 playlist per collection)')
  .option('-b, --base-url <url>', 'Audiobookshelf base URL (e.g. https://abs.example.com)')
  .option('-l, --library-id <id>', 'Library ID')
  .option('-c, --collection <id>', 'Only process a single collection ID')
  .option('--dry-run', 'Show what would be done without creating playlists', false)
  .option('--name-suffix <suffix>', 'Optional suffix appended to created playlist names', '')
  .action(async (opts) => {
    await collectionsToPlaylistsCommand(opts);
  });

program
  .command('playlists-to-collections')
  .description('Create collections from playlists (books only; skips podcast items)')
  .option('-b, --base-url <url>', 'Audiobookshelf base URL (e.g. https://abs.example.com)')
  .option('-l, --library-id <id>', 'Library ID')
  .option('-p, --playlist <id>', 'Only process a single playlist ID')
  .option('--dry-run', 'Show what would be done without creating collections', false)
  .option('--name-suffix <suffix>', 'Optional suffix appended to created collection names', '')
  .action(async (opts) => {
    await playlistsToCollectionsCommand(opts);
  });

program
  .command('restore-collections')
  .description('Restore collections from a JSON backup file')
  .option('-b, --base-url <url>', 'Audiobookshelf base URL (e.g. https://abs.example.com)')
  .option('-l, --library-id <id>', 'Library ID')
  .option('-i, --in <file>', 'Input JSON file', 'collections-backup.json')
  .option('--dry-run', 'Show what would be done without creating collections', false)
  .option('--only <idOrName>', 'Only restore a single collection by id or name')
  .action(async (opts) => {
    await restoreCollectionsCommand(opts);
  });

program
  .command('restore-playlists')
  .description('Restore playlists from a JSON backup file')
  .option('-b, --base-url <url>', 'Audiobookshelf base URL (e.g. https://abs.example.com)')
  .option('-l, --library-id <id>', 'Library ID')
  .option('-i, --in <file>', 'Input JSON file', 'playlists-backup.json')
  .option('--dry-run', 'Show what would be done without creating playlists', false)
  .option('--only <idOrName>', 'Only restore a single playlist by id or name')
  .action(async (opts) => {
    await restorePlaylistsCommand(opts);
  });

program.parseAsync(process.argv);
