import { Env } from './types';
import { getPanelHTML } from './panel';
import { listCredentials, addCredential, updateCredential, deleteCredential, getSettings, saveSettings } from './storage';
import { handleProxy } from './proxy';
import { getLogs, clearLogs } from './logger';

async function generateToken(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + ':admin-session');
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function verifyAuth(request: Request, env: Env): Promise<boolean> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return false;
  const token = authHeader.slice(7);
  const expected = await generateToken(env.ADMIN_PASSWORD);
  return token === expected;
}

function corsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, cf-aig-authorization',
  };
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() },
  });
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    if (path === '/' || path === '/panel') {
      return new Response(getPanelHTML(), {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    if (path === '/api/login' && request.method === 'POST') {
      const body = await request.json() as { password?: string };
      if (body.password === env.ADMIN_PASSWORD) {
        const token = await generateToken(env.ADMIN_PASSWORD);
        return jsonResponse({ token });
      }
      return jsonResponse({ error: 'Invalid password' }, 401);
    }

    if (path.startsWith('/api/credentials')) {
      if (!(await verifyAuth(request, env))) {
        return jsonResponse({ error: 'Unauthorized' }, 401);
      }

      if (path === '/api/credentials' && request.method === 'GET') {
        const list = await listCredentials(env);
        return jsonResponse(list);
      }

      if (path === '/api/credentials' && request.method === 'POST') {
        const body = await request.json() as { name: string; accountId: string; gatewayId: string; apiToken: string };
        const cred = await addCredential(env, body);
        return jsonResponse(cred, 201);
      }

      const idMatch = path.match(/^\/api\/credentials\/(.+)$/);
      if (idMatch) {
        const id = idMatch[1];
        if (request.method === 'PUT') {
          const body = await request.json() as { name?: string; accountId?: string; gatewayId?: string; apiToken?: string };
          const updated = await updateCredential(env, id, body);
          if (!updated) return jsonResponse({ error: 'Not found' }, 404);
          return jsonResponse(updated);
        }
        if (request.method === 'DELETE') {
          const deleted = await deleteCredential(env, id);
          if (!deleted) return jsonResponse({ error: 'Not found' }, 404);
          return jsonResponse({ success: true });
        }
      }
    }

    if (path === '/api/settings' && request.method === 'GET') {
      if (!(await verifyAuth(request, env))) return jsonResponse({ error: 'Unauthorized' }, 401);
      const settings = await getSettings(env);
      return jsonResponse(settings);
    }

    if (path === '/api/settings' && request.method === 'PUT') {
      if (!(await verifyAuth(request, env))) return jsonResponse({ error: 'Unauthorized' }, 401);
      const body = await request.json() as Record<string, unknown>;
      const updated = await saveSettings(env, body);
      return jsonResponse(updated);
    }

    const testMatch = path.match(/^\/api\/test\/(.+)$/);
    if (testMatch && request.method === 'POST') {
      if (!(await verifyAuth(request, env))) return jsonResponse({ error: 'Unauthorized' }, 401);
      const credId = testMatch[1];
      const creds = await listCredentials(env);
      const cred = creds.find(c => c.id === credId);
      if (!cred) return jsonResponse({ error: 'Credential not found' }, 404);

      const targetURL = `https://gateway.ai.cloudflare.com/v1/${cred.accountId}/${cred.gatewayId}/compat/chat/completions`;
      const startTime = Date.now();
      try {
        const resp = await fetch(targetURL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${cred.apiToken}`,
            'cf-aig-authorization': `Bearer ${cred.apiToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'workers-ai/@cf/openai/gpt-oss-20b',
            messages: [{ role: 'user', content: 'Say "OK" if you can hear me.' }],
            max_tokens: 20,
          }),
        });
        const durationMs = Date.now() - startTime;
        const body = await resp.text();
        return jsonResponse({ success: resp.ok, status: resp.status, durationMs, body: body.slice(0, 1000) });
      } catch (e) {
        const durationMs = Date.now() - startTime;
        return jsonResponse({ success: false, status: 0, durationMs, body: String(e) }, 500);
      }
    }

    if (path.startsWith('/api/logs')) {
      if (!(await verifyAuth(request, env))) {
        return jsonResponse({ error: 'Unauthorized' }, 401);
      }

      if (path === '/api/logs' && request.method === 'GET') {
        const limit = parseInt(url.searchParams.get('limit') || '50');
        const offset = parseInt(url.searchParams.get('offset') || '0');
        const credentialName = url.searchParams.get('credential') || undefined;
        const result = await getLogs(env, { limit, offset, credentialName });
        return jsonResponse(result);
      }

      if (path === '/api/logs' && request.method === 'DELETE') {
        await clearLogs(env);
        return jsonResponse({ success: true });
      }
    }

    if (path === '/health' && request.method === 'GET') {
      return jsonResponse({ status: 'ok', timestamp: new Date().toISOString() });
    }

    if (path.startsWith('/v1') || path.startsWith('/compat') || path.startsWith('/workers-ai') || path.startsWith('/openai')) {
      const authHeader = request.headers.get('Authorization');
      const apiKey = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
      if (!apiKey || apiKey !== env.API_KEY) {
        return jsonResponse({
          error: { message: 'Invalid API key. Please provide a valid API key in the Authorization header.', type: 'invalid_request_error', code: 'invalid_api_key' }
        }, 401);
      }

      let subPath = path;
      if (path.startsWith('/v1')) {
        subPath = '/compat' + path.slice(3);
      }
      return handleProxy(request, env, subPath, ctx);
    }

    return jsonResponse({ error: 'Not found' }, 404);
  },
};
