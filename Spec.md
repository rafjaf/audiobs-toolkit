---
title: "Collections and Playlists | advplyr/audiobookshelf"
source: "https://deepwiki.com/advplyr/audiobookshelf/10.2-collections-and-playlists"
author:
  - "[[DeepWiki]]"
published: 2025-10-20
created: 2026-01-11
description: "Collections and Playlists are organizational features that allow users to group and curate media content. While both serve to organize library items, they have distinct purposes and behaviors:- Coll"
tags:
  - "clippings"
---
## REST API Architecture

### Collection Endpoints

The `CollectionController` handles all collection operations through the following routes:

```
POST /collectionsGET /collectionsGET /collections/:idPATCH /collections/:idDELETE /collections/:idPOST /collections/:id/bookDELETE /collections/:id/book/:bookIdPOST /collections/:id/batch/addPOST /collections/:id/batch/removeClient ApplicationApiRouter
/api/collectionsCollectionControllerDatabase
collectionModel
```

**Sources:**[server/routers/ApiRouter.js 144-154](https://github.com/advplyr/audiobookshelf/blob/a87ea327/server/routers/ApiRouter.js#L144-L154) [server/controllers/CollectionController.js](https://github.com/advplyr/audiobookshelf/blob/a87ea327/server/controllers/CollectionController.js)

#### Collection CRUD Operations

**Create Collection** - `POST /api/collections`

- Requires admin permissions via `CollectionController.middleware`
- Request body: `{ name, description, books, libraryId }`
- Creates collection and associates books in specified order

**Get All Collections** - `GET /api/collections`

- Returns all collections user has access to
- Includes expanded book data

**Get Single Collection** - `GET /api/collections/:id`

- Returns collection with full book details
- Respects user library access permissions

**Update Collection** - `PATCH /api/collections/:id`

- Updates name, description, or book order
- Requires admin permissions

**Delete Collection** - `DELETE /api/collections/:id`

- Removes collection and all book associations
- Requires admin permissions

**Sources:**[server/routers/ApiRouter.js 146-150](https://github.com/advplyr/audiobookshelf/blob/a87ea327/server/routers/ApiRouter.js#L146-L150) [server/controllers/CollectionController.js](https://github.com/advplyr/audiobookshelf/blob/a87ea327/server/controllers/CollectionController.js)

#### Collection Item Management

**Add Single Book** - `POST /api/collections/:id/book`

- Request body: `{ id: bookId }`
- Adds book to end of collection

**Remove Single Book** - `DELETE /api/collections/:id/book/:bookId`

- Removes book from collection
- Reorders remaining books

**Batch Add Books** - `POST /api/collections/:id/batch/add`

- Request body: `{ books: [{ id }] }`
- Adds multiple books to collection

**Batch Remove Books** - `POST /api/collections/:id/batch/remove`

- Request body: `{ books: [{ id }] }`
- Removes multiple books from collection

**Sources:**[server/routers/ApiRouter.js 151-154](https://github.com/advplyr/audiobookshelf/blob/a87ea327/server/routers/ApiRouter.js#L151-L154) [server/controllers/CollectionController.js](https://github.com/advplyr/audiobookshelf/blob/a87ea327/server/controllers/CollectionController.js)

### Playlist Endpoints

The `PlaylistController` handles playlist operations:

```
POST /playlistsGET /playlistsGET /playlists/:idPATCH /playlists/:idDELETE /playlists/:idPOST /playlists/:id/itemDELETE /playlists/:id/item/:itemId/:episodeId?POST /playlists/:id/batch/addPOST /playlists/:id/batch/removePOST /playlists/collection/:collectionIdClient ApplicationApiRouter
/api/playlistsPlaylistControllerDatabase
playlistModel
```

**Sources:**[server/routers/ApiRouter.js 159-168](https://github.com/advplyr/audiobookshelf/blob/a87ea327/server/routers/ApiRouter.js#L159-L168) [server/controllers/PlaylistController.js](https://github.com/advplyr/audiobookshelf/blob/a87ea327/server/controllers/PlaylistController.js)

#### Playlist CRUD Operations

**Create Playlist** - `POST /api/playlists`

- Any authenticated user can create
- Request body: `{ name, description, items, libraryId }`
- Automatically assigned to requesting user

**Get All User Playlists** - `GET /api/playlists`

- Returns only playlists owned by requesting user
- Includes expanded media item data

**Get Single Playlist** - `GET /api/playlists/:id`

- Returns playlist with full item details
- User must own playlist or have admin access

**Update Playlist** - `PATCH /api/playlists/:id`

- Updates name, description, or item order
- User must own playlist

**Delete Playlist** - `DELETE /api/playlists/:id`

- Removes playlist and all item associations
- User must own playlist

**Sources:**[server/routers/ApiRouter.js 159-163](https://github.com/advplyr/audiobookshelf/blob/a87ea327/server/routers/ApiRouter.js#L159-L163) [server/controllers/PlaylistController.js](https://github.com/advplyr/audiobookshelf/blob/a87ea327/server/controllers/PlaylistController.js)

#### Playlist Item Management

**Add Single Item** - `POST /api/playlists/:id/item`

- Request body: `{ libraryItemId, episodeId? }`
- Adds book or podcast episode to playlist
- `episodeId` required for podcast episodes

**Remove Single Item** - `DELETE /api/playlists/:id/item/:libraryItemId/:episodeId?`

- Removes item from playlist
- Include `episodeId` in URL for podcast episodes

**Batch Add Items** - `POST /api/playlists/:id/batch/add`

- Request body: `{ items: [{ libraryItemId, episodeId? }] }`
- Adds multiple items to playlist

**Batch Remove Items** - `POST /api/playlists/:id/batch/remove`

- Request body: `{ items: [{ libraryItemId, episodeId? }] }`
- Removes multiple items from playlist

**Sources:**[server/routers/ApiRouter.js 164-167](https://github.com/advplyr/audiobookshelf/blob/a87ea327/server/routers/ApiRouter.js#L164-L167) [server/controllers/PlaylistController.js](https://github.com/advplyr/audiobookshelf/blob/a87ea327/server/controllers/PlaylistController.js)

#### Create Playlist from Collection

**Create from Collection** - `POST /api/playlists/collection/:collectionId`

- Creates new playlist with all books from specified collection
- Maintains book order from collection
- Request body: `{ name?, description? }` (optional overrides)

**Sources:**[server/routers/ApiRouter.js 168](https://github.com/advplyr/audiobookshelf/blob/a87ea327/server/routers/ApiRouter.js#L168-L168) [server/controllers/PlaylistController.js](https://github.com/advplyr/audiobookshelf/blob/a87ea327/server/controllers/PlaylistController.js)

---

## Library Integration

### Library-Level Queries

Both collections and playlists can be queried at the library level:

```
getCollectionsForLibrary()getUserPlaylistsForLibrary()Returns collections
for libraryReturns playlists
for user + libraryGET /api/libraries/:idGET /api/libraries/:id/playlistsLibraryControllerDatabase.collectionModelDatabase.playlistModelPaginated results
with expanded dataPaginated results
with expanded data
```

**Get Collections for Library** - `GET /api/libraries/:id/collections`

- Query params: `limit`, `page`, `sort`, `desc`, `filter`
- Returns paginated collections belonging to library
- Includes expanded book data with `include` parameter

**Get Playlists for Library** - `GET /api/libraries/:id/playlists`

- Query params: `limit`, `page`, `sort`, `desc`
- Returns paginated playlists for current user in specified library
- Includes expanded item data with `include` parameter

**Sources:**[server/routers/ApiRouter.js 80-81](https://github.com/advplyr/audiobookshelf/blob/a87ea327/server/routers/ApiRouter.js#L80-L81) [server/controllers/LibraryController.js 816-887](https://github.com/advplyr/audiobookshelf/blob/a87ea327/server/controllers/LibraryController.js#L816-L887)

### Filtering and Sorting

Both endpoints support query parameters for customization:

| Parameter | Type | Description |
| --- | --- | --- |
| `limit` | number | Items per page (default: no limit) |
| `page` | number | Page number (zero-indexed) |
| `sort` | string | Sort field |
| `desc` | string | "1" for descending sort |
| `filter` | string | Filter expression |
| `include` | string | Comma-separated includes (e.g., "rssfeed") |

**Sources:**[server/controllers/LibraryController.js 817-866](https://github.com/advplyr/audiobookshelf/blob/a87ea327/server/controllers/LibraryController.js#L817-L866)

---

## Database Implementation

### Collection Storage

Collections are stored with a many-to-many relationship to library items:

```
hasMany through
CollectionBookbelongsToFields:
• id
• name
• description
• libraryId
• createdAt
• updatedAtFields:
• collectionId
• bookId
• orderCollection ModelCollectionBook
Junction TableLibraryItem ModelCollection DataJunction Data
```

**Sources:**[server/models/Collection.js](https://github.com/advplyr/audiobookshelf/blob/a87ea327/server/models/Collection.js) [server/models/CollectionBook.js](https://github.com/advplyr/audiobookshelf/blob/a87ea327/server/models/CollectionBook.js)

### Playlist Storage

Playlists support both books and podcast episodes through polymorphic associations:

```
hasMany through
PlaylistMediaItemPolymorphic:
mediaItemType='book'Polymorphic:
mediaItemType='podcastEpisode'Fields:
• id
• name
• description
• userId
• libraryId
• createdAt
• updatedAtFields:
• playlistId
• mediaItemId
• mediaItemType
• orderPlaylist ModelPlaylistMediaItem
Junction TableBook ModelPodcastEpisode ModelPlaylist DataJunction Data
```

**Sources:**[server/models/Playlist.js](https://github.com/advplyr/audiobookshelf/blob/a87ea327/server/models/Playlist.js) [server/models/PlaylistMediaItem.js](https://github.com/advplyr/audiobookshelf/blob/a87ea327/server/models/PlaylistMediaItem.js)

### Key Operations

**Remove Library Items from Playlists**

When a library item is deleted, it must be removed from all playlists:

```
// ApiRouter.handleDeleteLibraryItem removes item from playlists
await Database.playlistModel.removeMediaItemsFromPlaylists(mediaItemIds)
```

**Sources:**[server/routers/ApiRouter.js 377](https://github.com/advplyr/audiobookshelf/blob/a87ea327/server/routers/ApiRouter.js#L377-L377)

**Remove All Collections for Library**

When a library is deleted, all its collections are removed:

```
const numCollectionsRemoved = await Database.collectionModel.removeAllForLibrary(libraryId)
```

**Sources:**[server/controllers/LibraryController.js 537](https://github.com/advplyr/audiobookshelf/blob/a87ea327/server/controllers/LibraryController.js#L537-L537)

---

## Client-Side Interface

### Bookshelf Display

Collections and playlists can be displayed as bookshelf entities:

```
'collections''playlists''items'LazyBookshelf ComponententityNameDisplay Playlists
Lazy loaded cardsDisplay Library ItemsEmpty: MessageBookshelfNoCollectionsEmpty: MessageNoUserPlaylistsLink to collections guide
audiobookshelf.org/guides/collections
```

**Empty State Messages:**

- Collections: "You have no collections" with help link
- Playlists: "You have no playlists" with help text

**Sources:**[client/components/app/LazyBookshelf.vue 22-123](https://github.com/advplyr/audiobookshelf/blob/a87ea327/client/components/app/LazyBookshelf.vue#L22-L123)

### Item Detail Page Access

Users access collection and playlist management from the item detail page context menu:

```
showCollectionsButton
isBook && userCanUpdate!isPodcast && hasTracksItem Detail Page
/item/:idPlaylists ActionOpen Playlists Modal
```

**Conditions for Display:**

**Collections Button:**

- Item must be a book (`isBook === true`)
- User must have update permissions (`userCanUpdate === true`)

**Playlists Button:**

- Item must not be a podcast (`!isPodcast`)
- Item must have audio tracks (`tracks.length > 0`)

**Sources:**[client/pages/item/\_id/index.vue 365-383](https://github.com/advplyr/audiobookshelf/blob/a87ea327/client/pages/item/_id/index.vue#L365-L383)

The context menu on the item detail page includes both options:

```
const contextMenuItems = []

// Collections option (books only, update permission required)
if (showCollectionsButton) {
  items.push({
    text: this.$strings.LabelCollections,
    action: 'collections'
  })
}

// Playlists option (audiobooks only)
if (!isPodcast && tracks.length) {
  items.push({
    text: this.$strings.LabelYourPlaylists,
    action: 'playlists'
  })
}
```

**Sources:**[client/pages/item/\_id/index.vue 368-383](https://github.com/advplyr/audiobookshelf/blob/a87ea327/client/pages/item/_id/index.vue#L368-L383)

### BookCard Integration

Individual book cards display visual indicators and provide quick access:

```
ClickisBook && userCanUpdatehasAudioTracksLazyBookCard Component'Add to Playlist' option
```

**Sources:**[client/components/cards/LazyBookCard.vue](https://github.com/advplyr/audiobookshelf/blob/a87ea327/client/components/cards/LazyBookCard.vue)

---

## Advanced Features

The system provides a convenient feature to convert collections into personal playlists:

**Implementation Details:**

1. Fetches collection with all books in order
2. Creates new playlist for requesting user
3. Adds all books to playlist maintaining collection order
4. Playlist name defaults to collection name
5. User can override name and description in request body

**Sources:**[server/routers/ApiRouter.js 168](https://github.com/advplyr/audiobookshelf/blob/a87ea327/server/routers/ApiRouter.js#L168-L168) [server/controllers/PlaylistController.js](https://github.com/advplyr/audiobookshelf/blob/a87ea327/server/controllers/PlaylistController.js)

Collections and playlists implement different permission models:

| Operation | Collections | Playlists |
| --- | --- | --- |
| **Create** | Admin/Root only | All authenticated users |
| **Read** | All users (library access) | Owner or Admin |
| **Update** | Admin/Root only | Owner only |
| **Delete** | Admin/Root only | Owner only |
| **Add Items** | Admin/Root only | Owner only |

**Middleware Implementation:**

Both controllers use middleware to verify permissions:

```
// CollectionController.middleware - checks admin permissions
// PlaylistController.middleware - checks ownership or admin
```

**Sources:**[server/controllers/CollectionController.js](https://github.com/advplyr/audiobookshelf/blob/a87ea327/server/controllers/CollectionController.js) [server/controllers/PlaylistController.js](https://github.com/advplyr/audiobookshelf/blob/a87ea327/server/controllers/PlaylistController.js)

### Real-Time Updates

Changes to collections and playlists trigger Socket.IO events for real-time synchronization:

```
Emit eventcollection_added
collection_updated
collection_removedplaylist_added
playlist_updated
playlist_removedCollection/Playlist ControllerSocketAuthorityConnected Clients
```

**Event Types:**

- `collection_added` - New collection created
- `collection_updated` - Collection modified
- `collection_removed` - Collection deleted
- `playlist_added` - New playlist created
- `playlist_updated` - Playlist modified
- `playlist_removed` - Playlist deleted

**Sources:**[server/SocketAuthority.js](https://github.com/advplyr/audiobookshelf/blob/a87ea327/server/SocketAuthority.js) [server/controllers/CollectionController.js](https://github.com/advplyr/audiobookshelf/blob/a87ea327/server/controllers/CollectionController.js) [server/controllers/PlaylistController.js](https://github.com/advplyr/audiobookshelf/blob/a87ea327/server/controllers/PlaylistController.js)

---

## Data Flow Examples

### Adding Book to Collection

**Sources:**[server/controllers/CollectionController.js](https://github.com/advplyr/audiobookshelf/blob/a87ea327/server/controllers/CollectionController.js)

### Creating User Playlist

**Sources:**[server/controllers/PlaylistController.js](https://github.com/advplyr/audiobookshelf/blob/a87ea327/server/controllers/PlaylistController.js)

---

## Database Queries and Performance

Both collections and playlists support loading with expanded related data:

```
// Collections query with expanded books
Database.collectionModel.getOldCollectionsJsonExpanded(user, libraryId, include)

// Playlists query with expanded items
Database.playlistModel.getOldPlaylistsJsonExpanded(user, libraryId, include)
```

**Includes Support:**

- `rssfeed` - Include RSS feed data if available
- `numEpisodesIncomplete` - Include incomplete episode count (podcasts)
- `share` - Include media item share data (admin only)

**Sources:**[server/controllers/LibraryController.js 835-865](https://github.com/advplyr/audiobookshelf/blob/a87ea327/server/controllers/LibraryController.js#L835-L865)

### Batch Operations Optimization

Batch add/remove operations are optimized to reduce database calls:

1. **Batch Add** - Single transaction for multiple inserts
2. **Batch Remove** - Bulk delete with WHERE IN clause
3. **Order Recalculation** - Automated on modifications
4. **Event Broadcasting** - Single event after batch completion

**Sources:**[server/controllers/CollectionController.js](https://github.com/advplyr/audiobookshelf/blob/a87ea327/server/controllers/CollectionController.js) [server/controllers/PlaylistController.js](https://github.com/advplyr/audiobookshelf/blob/a87ea327/server/controllers/PlaylistController.js)

---

## Client State Management

### Vuex Store Integration

Collections and playlists use Vuex for client-side state:

```
Commit mutationCommit mutationAPI callAPI callVue ComponentVuex Store
globals modulesetEditCollectionsetEditPlaylistSave changesSave changesBackend API
```

**Mutations:**

- `globals/setEditCollection` - Opens collection edit modal
- `globals/setEditPlaylist` - Opens playlist edit modal

**Sources:**[client/components/app/LazyBookshelf.vue 240-243](https://github.com/advplyr/audiobookshelf/blob/a87ea327/client/components/app/LazyBookshelf.vue#L240-L243)

---

## Migration and Compatibility

### Database Migration Support

The migration system handles importing old collection and playlist data:

```
// Old collection IDs mapped to new UUIDs
oldDbIdMap.collections = {}

// Migration preserves:
// - Collection membership
// - Book order
// - Playlist ownership
// - Media item associations
```

**Sources:**[server/utils/migrations/dbMigration.js 16](https://github.com/advplyr/audiobookshelf/blob/a87ea327/server/utils/migrations/dbMigration.js#L16-L16)

---

## Summary

Collections and Playlists provide complementary organizational features:

**Collections** serve as library-wide curated groupings of books, managed by administrators and visible to all users with library access. They support batch operations, ordering, and can be converted into personal playlists.

**Playlists** are personal playback queues that support both audiobooks and podcast episodes. Each user maintains their own playlists, which can include mixed content types and support complex ordering for sequential listening.

Both features integrate deeply with the library system, support real-time synchronization, and provide robust REST APIs for client applications.

**Key Implementation Files:**

- [server/controllers/CollectionController.js](https://github.com/advplyr/audiobookshelf/blob/a87ea327/server/controllers/CollectionController.js)
- [server/controllers/PlaylistController.js](https://github.com/advplyr/audiobookshelf/blob/a87ea327/server/controllers/PlaylistController.js)
- [server/routers/ApiRouter.js 144-168](https://github.com/advplyr/audiobookshelf/blob/a87ea327/server/routers/ApiRouter.js#L144-L168)
- [server/controllers/LibraryController.js 816-887](https://github.com/advplyr/audiobookshelf/blob/a87ea327/server/controllers/LibraryController.js#L816-L887)
- [client/components/app/LazyBookshelf.vue 22-123](https://github.com/advplyr/audiobookshelf/blob/a87ea327/client/components/app/LazyBookshelf.vue#L22-L123)
- [client/pages/item/\_id/index.vue 365-383](https://github.com/advplyr/audiobookshelf/blob/a87ea327/client/pages/item/_id/index.vue#L365-L383)