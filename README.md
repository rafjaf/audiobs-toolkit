# audiobs-toolkit

Small Node.js CLI for Audiobookshelf collections and playlists.

## Install

```bash
npm install
```

## First run config

On first run, the CLI will prompt for your API key and store it in `.audiobs-toolkit.config.json` (gitignored).

You can also provide settings via flags (they will be persisted when possible):

- `--base-url` e.g. `https://audiobooks.example.com`
- `--library-id` e.g. `9c5...`

## Commands

### Backup collections

```bash
node src/cli.js backup-collections --base-url https://abs.example.com --library-id <LIB_ID> --out collections-backup.json
```

### Backup playlists

```bash
node src/cli.js backup-playlists --base-url https://abs.example.com --library-id <LIB_ID> --out playlists-backup.json
```

### Copy collections to playlists

Dry run:

```bash
node src/cli.js collections-to-playlists --base-url https://abs.example.com --library-id <LIB_ID> --dry-run
```

Single collection:

```bash
node src/cli.js collections-to-playlists --collection <COLLECTION_ID>
```

### Copy playlists to collections

Dry run:

```bash
node src/cli.js playlists-to-collections --base-url https://abs.example.com --library-id <LIB_ID> --dry-run
```

Single playlist:

```bash
node src/cli.js playlists-to-collections --playlist <PLAYLIST_ID>
```

### Restore collections

```bash
node src/cli.js restore-collections --in collections-backup.json
```

### Restore playlists

```bash
node src/cli.js restore-playlists --in playlists-backup.json
```
