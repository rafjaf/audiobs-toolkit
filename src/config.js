import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import readline from 'node:readline/promises';

const CONFIG_FILENAME = '.audiobs-toolkit.config.json';

export function getConfigPath() {
  return path.join(process.cwd(), CONFIG_FILENAME);
}

export async function loadConfig() {
  try {
    const text = await fs.readFile(getConfigPath(), 'utf8');
    return JSON.parse(text);
  } catch {
    return {};
  }
}

export async function saveConfig(config) {
  const next = {
    baseUrl: config.baseUrl ?? '',
    libraryId: config.libraryId ?? '',
    apiKey: config.apiKey ?? ''
  };
  await fs.writeFile(getConfigPath(), JSON.stringify(next, null, 2) + '\n', 'utf8');
}

async function prompt(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  try {
    const answer = await rl.question(question);
    return String(answer ?? '').trim();
  } finally {
    rl.close();
  }
}

export async function ensureConfig({ baseUrl, libraryId } = {}) {
  const config = await loadConfig();

  if (baseUrl) config.baseUrl = baseUrl;
  if (libraryId) config.libraryId = libraryId;

  // Requirement: first run should ask for API key and persist it.
  if (!config.apiKey) {
    const apiKey = await prompt('Audiobookshelf API key (will be stored locally): ');
    if (!apiKey) throw new Error('API key is required.');
    config.apiKey = apiKey;
  }

  // Optional: prompt for base URL / library ID if missing (makes first run smoother).
  if (!config.baseUrl) {
    const url = await prompt('Audiobookshelf base URL (e.g. https://abs.example.com): ');
    if (!url) throw new Error('Base URL is required.');
    config.baseUrl = url.replace(/\/$/, '');
  }

  if (!config.libraryId) {
    const id = await prompt('Library ID: ');
    if (!id) throw new Error('Library ID is required.');
    config.libraryId = id;
  }

  await saveConfig(config);
  return config;
}
