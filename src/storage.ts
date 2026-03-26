import { Credential, Env } from './types';

const CREDENTIALS_LIST_KEY = 'credentials:list';

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

export async function getRandomCredential(env: Env): Promise<Credential | null> {
  const credentials = await listCredentials(env);
  if (credentials.length === 0) return null;
  const idx = Math.floor(Math.random() * credentials.length);
  return credentials[idx];
}
