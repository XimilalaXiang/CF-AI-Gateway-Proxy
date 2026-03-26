import { RequestLog, Env } from './types';

const LOG_INDEX_KEY = 'logs:index';
const MAX_LOGS = 500;
const LOG_TTL = 7 * 24 * 60 * 60; // 7 days

export async function saveLog(env: Env, log: RequestLog): Promise<void> {
  await env.CREDENTIALS_KV.put(`log:${log.id}`, JSON.stringify(log), { expirationTtl: LOG_TTL });

  const raw = await env.CREDENTIALS_KV.get(LOG_INDEX_KEY);
  let index: string[] = raw ? JSON.parse(raw) : [];

  index.unshift(log.id);
  if (index.length > MAX_LOGS) {
    const removed = index.splice(MAX_LOGS);
    for (const id of removed) {
      await env.CREDENTIALS_KV.delete(`log:${id}`);
    }
  }

  await env.CREDENTIALS_KV.put(LOG_INDEX_KEY, JSON.stringify(index));
}

export async function getLogs(env: Env, options: { limit?: number; offset?: number; credentialName?: string }): Promise<{ logs: RequestLog[]; total: number }> {
  const raw = await env.CREDENTIALS_KV.get(LOG_INDEX_KEY);
  if (!raw) return { logs: [], total: 0 };

  const allIds: string[] = JSON.parse(raw);
  const limit = options.limit || 50;
  const offset = options.offset || 0;

  const logs: RequestLog[] = [];
  let scanned = 0;
  let matched = 0;

  for (const id of allIds) {
    const logRaw = await env.CREDENTIALS_KV.get(`log:${id}`);
    if (!logRaw) continue;

    const log: RequestLog = JSON.parse(logRaw);

    if (options.credentialName && log.credentialName !== options.credentialName) {
      continue;
    }

    scanned++;
    if (scanned <= offset) { matched++; continue; }
    if (logs.length < limit) {
      logs.push(log);
    }
    matched++;
  }

  return { logs, total: matched };
}

export async function clearLogs(env: Env): Promise<void> {
  const raw = await env.CREDENTIALS_KV.get(LOG_INDEX_KEY);
  if (!raw) return;

  const ids: string[] = JSON.parse(raw);
  for (const id of ids) {
    await env.CREDENTIALS_KV.delete(`log:${id}`);
  }
  await env.CREDENTIALS_KV.delete(LOG_INDEX_KEY);
}
