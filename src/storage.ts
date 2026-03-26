import { Credential, Env } from './types';

const CREDENTIALS_LIST_KEY = 'credentials:list';
const SETTINGS_KEY = 'settings:global';
const ROUND_ROBIN_KEY = 'state:round_robin_index';

export type LoadBalanceStrategy = 'random' | 'round-robin';

export interface Settings {
  loadBalanceStrategy: LoadBalanceStrategy;
}

const DEFAULT_SETTINGS: Settings = { loadBalanceStrategy: 'random' };

export async function getSettings(env: Env): Promise<Settings> {
  const raw = await env.CREDENTIALS_KV.get(SETTINGS_KEY);
  if (!raw) return DEFAULT_SETTINGS;
  return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
}

export async function saveSettings(env: Env, settings: Partial<Settings>): Promise<Settings> {
  const current = await getSettings(env);
  const updated = { ...current, ...settings };
  await env.CREDENTIALS_KV.put(SETTINGS_KEY, JSON.stringify(updated));
  return updated;
}

export async function listCredentials(env: Env): Promise<Credential[]> {
  const raw = await env.CREDENTIALS_KV.get(CREDENTIALS_LIST_KEY);
  if (!raw) return [];
  return JSON.parse(raw) as Credential[];
}

export async function saveCredentials(env: Env, credentials: Credential[]): Promise<void> {
  await env.CREDENTIALS_KV.put(CREDENTIALS_LIST_KEY, JSON.stringify(credentials));
}

export async function addCredential(env: Env, input: Omit<Credential, 'id' | 'createdAt' | 'updatedAt'>): Promise<Credential> {
  const credentials = await listCredentials(env);
  const now = new Date().toISOString();
  const cred: Credential = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };
  credentials.push(cred);
  await saveCredentials(env, credentials);
  return cred;
}

export async function updateCredential(env: Env, id: string, input: Partial<Omit<Credential, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Credential | null> {
  const credentials = await listCredentials(env);
  const idx = credentials.findIndex(c => c.id === id);
  if (idx === -1) return null;
  credentials[idx] = {
    ...credentials[idx],
    ...input,
    updatedAt: new Date().toISOString(),
  };
  await saveCredentials(env, credentials);
  return credentials[idx];
}

export async function deleteCredential(env: Env, id: string): Promise<boolean> {
  const credentials = await listCredentials(env);
  const filtered = credentials.filter(c => c.id !== id);
  if (filtered.length === credentials.length) return false;
  await saveCredentials(env, filtered);
  return true;
}

export async function pickCredential(env: Env): Promise<Credential | null> {
  const credentials = await listCredentials(env);
  if (credentials.length === 0) return null;

  const settings = await getSettings(env);

  if (settings.loadBalanceStrategy === 'round-robin') {
    const raw = await env.CREDENTIALS_KV.get(ROUND_ROBIN_KEY);
    let idx = raw ? parseInt(raw, 10) : 0;
    if (isNaN(idx) || idx >= credentials.length) idx = 0;
    const cred = credentials[idx];
    const nextIdx = (idx + 1) % credentials.length;
    await env.CREDENTIALS_KV.put(ROUND_ROBIN_KEY, String(nextIdx));
    return cred;
  }

  const idx = Math.floor(Math.random() * credentials.length);
  return credentials[idx];
}
