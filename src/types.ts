export interface Credential {
  id: string;
  name: string;
  accountId: string;
  gatewayId: string;
  apiToken: string;
  createdAt: string;
  updatedAt: string;
}

export interface RequestLog {
  id: string;
  timestamp: string;
  credentialName: string;
  credentialId: string;
  method: string;
  path: string;
  targetURL: string;
  model: string;
  statusCode: number;
  durationMs: number;
  requestBody: unknown;
  responsePreview: string;
  stream: boolean;
  clientIP: string;
}

export interface Env {
  CREDENTIALS_KV: KVNamespace;
  ADMIN_PASSWORD: string;
  API_KEY: string;
}
