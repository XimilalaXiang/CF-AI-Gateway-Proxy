import { Env, RequestLog } from './types';
import { getRandomCredential } from './storage';
import { saveLog } from './logger';

export async function handleProxy(request: Request, env: Env, subPath: string, ctx: ExecutionContext): Promise<Response> {
  const credential = await getRandomCredential(env);
  if (!credential) {
    return new Response(JSON.stringify({ error: 'No credentials configured. Please add at least one credential in the admin panel.' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const startTime = Date.now();
  const targetBase = `https://gateway.ai.cloudflare.com/v1/${credential.accountId}/${credential.gatewayId}`;

  const originalURL = new URL(request.url);
  const targetURL = new URL(targetBase + subPath);
  targetURL.search = originalURL.search;

  let requestBodyForLog: unknown = null;
  let model = '';
  let isStream = false;
  const hasBody = request.method !== 'GET' && request.method !== 'HEAD';

  if (hasBody) {
    try {
      const clonedRequest = request.clone();
      const bodyText = await clonedRequest.text();
      if (bodyText) {
        const parsed = JSON.parse(bodyText);
        requestBodyForLog = parsed;
        model = parsed.model || '';
        isStream = parsed.stream === true;
      }
    } catch {
      // not JSON body
    }
  }

  const headers = new Headers();
  for (const [key, value] of request.headers.entries()) {
    const lower = key.toLowerCase();
    if (lower === 'host' || lower === 'cf-connecting-ip' || lower === 'cf-ray') continue;
    headers.set(key, value);
  }

  headers.set('Authorization', `Bearer ${credential.apiToken}`);
  headers.set('cf-aig-authorization', `Bearer ${credential.apiToken}`);

  const proxyRequest = new Request(targetURL.toString(), {
    method: request.method,
    headers,
    body: hasBody ? request.body : null,
  });

  const response = await fetch(proxyRequest);
  const durationMs = Date.now() - startTime;

  const responseHeaders = new Headers(response.headers);
  responseHeaders.set('X-Proxy-Credential', credential.name);
  responseHeaders.delete('set-cookie');

  const clientIP = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || 'unknown';

  let responsePreview = '';

  if (!isStream && response.body) {
    try {
      const clonedResponse = response.clone();
      const text = await clonedResponse.text();
      responsePreview = text.length > 500 ? text.slice(0, 500) + '...' : text;
    } catch {
      responsePreview = '[unable to read]';
    }
  } else if (isStream) {
    responsePreview = '[streaming response]';
  }

  const log: RequestLog = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    credentialName: credential.name,
    credentialId: credential.id,
    method: request.method,
    path: originalURL.pathname,
    targetURL: targetURL.toString(),
    model,
    statusCode: response.status,
    durationMs,
    requestBody: requestBodyForLog,
    responsePreview,
    stream: isStream,
    clientIP,
  };

  ctx.waitUntil(saveLog(env, log));

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  });
}
