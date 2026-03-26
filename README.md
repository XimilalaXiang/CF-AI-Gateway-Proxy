# CF AI Gateway Proxy

Cloudflare Worker 项目，将多个 Cloudflare AI Gateway 账号的凭证统一成一个 API 入口，随机负载均衡调用。

## 功能

- **统一 API 地址** — 无论有多少个 Cloudflare 账号，只需一个 Worker 地址
- **随机负载均衡** — 每次请求随机选择一个凭证，自动分散调用量
- **OpenAI 兼容** — 直接对接 OpenAI SDK / 任何 OpenAI 兼容客户端
- **透明代理** — 请求体、响应体、Headers、Query String 全量透传，支持流式响应
- **Web 管理面板** — 密码保护的管理界面，在线添加/编辑/删除凭证
- **调用日志** — 记录每次 API 调用的凭证、模型、耗时、状态码等信息，面板内可查看
- **API Key 鉴权** — 防止未授权访问

## 快速开始

### 1. 部署

```bash
# 安装依赖
npm install

# 创建 KV 命名空间
npx wrangler kv namespace create CREDENTIALS_KV

# 将返回的 id 填入 wrangler.toml

# 部署
npm run deploy
```

### 2. 配置

部署后通过 Wrangler 设置安全的密码和 API Key：

```bash
npx wrangler secret put ADMIN_PASSWORD
npx wrangler secret put API_KEY
```

### 3. 添加凭证

访问 Worker 地址 (`https://your-worker.workers.dev/`)，登录管理面板，添加你的 Cloudflare 账号凭证：

- **名称**：备注用途
- **Account ID**：Cloudflare 账户 ID
- **Gateway ID**：AI Gateway 名称（如 `default`、`first`）
- **API Token**：Cloudflare API Token（需有 Workers AI / AI Gateway 权限）

### 4. 使用

```python
from openai import OpenAI

client = OpenAI(
    api_key="your-api-key",
    base_url="https://your-worker.workers.dev/v1"
)

response = client.chat.completions.create(
    model="workers-ai/@cf/meta/llama-3.3-70b-instruct-fp8-fast",
    messages=[{"role": "user", "content": "Hello!"}]
)
```

## API 路由

| 路径 | 说明 |
|---|---|
| `GET /` | 管理面板 |
| `POST /v1/chat/completions` | 聊天补全（映射到 AI Gateway compat） |
| `GET /v1/models` | 模型列表 |
| `POST /v1/embeddings` | 文本嵌入 |
| `/compat/*` | 直接转发到 AI Gateway |
| `/workers-ai/*` | Workers AI 原生路由 |
| `GET /health` | 健康检查 |

## 支持的模型格式

通过 AI Gateway compat 端点，模型名称格式为 `provider/model`：

- `workers-ai/@cf/meta/llama-3.3-70b-instruct-fp8-fast` — Cloudflare Workers AI（免费额度）
- `openai/gpt-4o` — OpenAI（需配置 BYOK）
- `anthropic/claude-4-5-sonnet` — Anthropic（需配置 BYOK）
- `google/gemini-2.5-pro` — Google AI（需配置 BYOK）

## 环境变量

| 变量 | 说明 |
|---|---|
| `ADMIN_PASSWORD` | 管理面板登录密码 |
| `API_KEY` | API 调用鉴权密钥 |

## License

MIT
