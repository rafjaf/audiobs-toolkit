function joinUrl(baseUrl, pathname) {
  const base = baseUrl.replace(/\/$/, '');
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `${base}${path}`;
}

export class AbsClient {
  constructor({ baseUrl, apiKey }) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  #toId(value) {
    if (!value) return null;
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return String(value);
    if (typeof value === 'object') {
      return (
        value.id ??
        value.bookId ??
        value.libraryItemId ??
        value.mediaItemId ??
        value._id ??
        null
      )
        ? String(value.id ?? value.bookId ?? value.libraryItemId ?? value.mediaItemId ?? value._id)
        : null;
    }
    return null;
  }

  #getItemsFromPage(pagePayload, itemKeys) {
    if (Array.isArray(pagePayload)) return pagePayload;
    for (const key of itemKeys) {
      const v = pagePayload?.[key];
      if (Array.isArray(v)) return v;
    }
    return [];
  }

  async #listPaginated(pathname, { limit = 100, include = '', itemKeys } = {}) {
    const first = await this.request('GET', pathname, {
      query: { limit, page: 0, include }
    });

    const items = [...this.#getItemsFromPage(first, itemKeys)];

    let page = 1;
    while (true) {
      // If the first response isn't in pages, stop.
      if (!Array.isArray(first) && items.length > 0 && items.length % limit !== 0) break;

      const next = await this.request('GET', pathname, {
        query: { limit, page, include }
      });

      const nextItems = this.#getItemsFromPage(next, itemKeys);
      if (!nextItems.length) break;
      items.push(...nextItems);
      if (nextItems.length < limit) break;
      page += 1;
    }

    return items;
  }

  async request(method, pathname, { query, body } = {}) {
    const url = new URL(joinUrl(this.baseUrl, pathname));
    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value === undefined || value === null || value === '') continue;
        url.searchParams.set(key, String(value));
      }
    }

    const res = await fetch(url, {
      method,
      headers: {
        // Audiobookshelf typically uses Bearer auth; many setups also accept raw tokens.
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: body ? JSON.stringify(body) : undefined
    });

    const contentType = res.headers.get('content-type') ?? '';
    const isJson = contentType.includes('application/json');
    const payload = isJson ? await res.json().catch(() => null) : await res.text().catch(() => '');

    if (!res.ok) {
      const message =
        (payload && typeof payload === 'object' && (payload.message || payload.error)) ||
        (typeof payload === 'string' && payload) ||
        `${res.status} ${res.statusText}`;
      const err = new Error(`Audiobookshelf API error: ${message}`);
      err.status = res.status;
      err.payload = payload;
      throw err;
    }

    return payload;
  }

  async listCollectionsForLibrary({ libraryId, limit = 100, include = '' } = {}) {
    // Spec.md: GET /api/libraries/:id/collections supports pagination and include
    return this.#listPaginated(`/api/libraries/${libraryId}/collections`, {
      limit,
      include,
      itemKeys: ['results', 'items', 'collections']
    });
  }

  async listPlaylistsForLibrary({ libraryId, limit = 100, include = '' } = {}) {
    // Spec.md: GET /api/libraries/:id/playlists supports pagination and include
    return this.#listPaginated(`/api/libraries/${libraryId}/playlists`, {
      limit,
      include,
      itemKeys: ['results', 'items', 'playlists']
    });
  }

  async createCollection({ name, description, books, libraryId } = {}) {
    // Spec.md: POST /api/collections { name, description, books, libraryId }
    // Some server versions expect `books` as an array of IDs (strings), not `{ id }` objects.
    const normalizedBooks = Array.isArray(books)
      ? books.map((b) => this.#toId(b)).filter(Boolean)
      : [];

    return this.request('POST', '/api/collections', {
      body: {
        name,
        description,
        books: normalizedBooks,
        libraryId
      }
    });
  }

  async createPlaylist({ name, description, items, libraryId } = {}) {
    // Spec.md: POST /api/playlists { name, description, items, libraryId }
    return this.request('POST', '/api/playlists', {
      body: {
        name,
        description,
        items,
        libraryId
      }
    });
  }

  async createPlaylistFromCollection({ collectionId, name, description } = {}) {
    // Spec.md: POST /api/playlists/collection/:collectionId
    return this.request('POST', `/api/playlists/collection/${collectionId}`, {
      body: {
        ...(name ? { name } : {}),
        ...(description ? { description } : {})
      }
    });
  }
}
