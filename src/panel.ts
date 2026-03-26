export function getPanelHTML(): string {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>CF AI Gateway Proxy - 管理面板</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: #0f172a;
    color: #e2e8f0;
    min-height: 100vh;
  }
  .container { max-width: 1100px; margin: 0 auto; padding: 24px 16px; }
  header {
    display: flex; justify-content: space-between; align-items: center;
    padding: 16px 0; border-bottom: 1px solid #1e293b; margin-bottom: 24px;
  }
  header h1 { font-size: 20px; color: #f8fafc; }
  header .badge {
    background: #22c55e; color: #000; font-size: 12px; font-weight: 600;
    padding: 4px 10px; border-radius: 12px;
  }
  .info-bar {
    background: #1e293b; border-radius: 8px; padding: 16px; margin-bottom: 24px;
    border: 1px solid #334155;
  }
  .info-bar h3 { font-size: 14px; color: #94a3b8; margin-bottom: 8px; }
  .info-bar code {
    display: block; background: #0f172a; padding: 10px 14px; border-radius: 6px;
    font-size: 13px; color: #38bdf8; word-break: break-all; cursor: pointer;
    border: 1px solid #334155; transition: border-color 0.2s;
  }
  .info-bar code:hover { border-color: #38bdf8; }
  .info-bar .hint { font-size: 12px; color: #64748b; margin-top: 6px; }

  .login-box {
    max-width: 400px; margin: 80px auto; background: #1e293b;
    border-radius: 12px; padding: 32px; border: 1px solid #334155;
  }
  .login-box h2 { text-align: center; margin-bottom: 24px; font-size: 18px; }
  .login-box input {
    width: 100%; padding: 10px 14px; background: #0f172a; border: 1px solid #334155;
    border-radius: 6px; color: #e2e8f0; font-size: 14px; margin-bottom: 16px;
  }

  .tabs {
    display: flex; gap: 0; margin-bottom: 20px; border-bottom: 1px solid #1e293b;
  }
  .tab {
    padding: 10px 20px; cursor: pointer; font-size: 14px; color: #64748b;
    border-bottom: 2px solid transparent; transition: all 0.15s;
  }
  .tab:hover { color: #e2e8f0; }
  .tab.active { color: #3b82f6; border-bottom-color: #3b82f6; }
  .tab-content { display: none; }
  .tab-content.active { display: block; }

  .toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
  .toolbar .count { font-size: 14px; color: #94a3b8; }

  .btn {
    padding: 8px 16px; border-radius: 6px; border: none; cursor: pointer;
    font-size: 13px; font-weight: 500; transition: all 0.15s;
  }
  .btn-primary { background: #3b82f6; color: #fff; }
  .btn-primary:hover { background: #2563eb; }
  .btn-danger { background: #ef4444; color: #fff; }
  .btn-danger:hover { background: #dc2626; }
  .btn-ghost { background: transparent; color: #94a3b8; border: 1px solid #334155; }
  .btn-ghost:hover { border-color: #94a3b8; color: #e2e8f0; }
  .btn-sm { padding: 5px 10px; font-size: 12px; }
  .btn-success { background: #16a34a; color: #fff; }
  .btn-success:hover { background: #15803d; }
  .btn[disabled] { opacity: 0.5; cursor: not-allowed; }

  table { width: 100%; border-collapse: collapse; }
  thead th {
    text-align: left; padding: 10px 12px; font-size: 12px; color: #64748b;
    text-transform: uppercase; letter-spacing: 0.05em;
    border-bottom: 1px solid #1e293b; font-weight: 600;
  }
  tbody td {
    padding: 12px; border-bottom: 1px solid #1e293b; font-size: 13px;
    vertical-align: middle;
  }
  tbody tr:hover { background: #1e293b; }
  .token-cell {
    max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    font-family: monospace; font-size: 12px; color: #94a3b8;
  }
  .actions { display: flex; gap: 6px; }

  .modal-overlay {
    display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.6);
    z-index: 100; justify-content: center; align-items: center;
  }
  .modal-overlay.active { display: flex; }
  .modal {
    background: #1e293b; border-radius: 12px; padding: 28px; width: 90%;
    max-width: 480px; border: 1px solid #334155; max-height: 85vh; overflow-y: auto;
  }
  .modal.wide { max-width: 700px; }
  .modal h2 { margin-bottom: 20px; font-size: 16px; }
  .form-group { margin-bottom: 14px; }
  .form-group label { display: block; font-size: 12px; color: #94a3b8; margin-bottom: 4px; font-weight: 500; }
  .form-group input, .form-group select {
    width: 100%; padding: 9px 12px; background: #0f172a; border: 1px solid #334155;
    border-radius: 6px; color: #e2e8f0; font-size: 13px;
  }
  .form-group input:focus, .form-group select:focus { outline: none; border-color: #3b82f6; }
  .form-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 20px; }

  .empty-state {
    text-align: center; padding: 48px 0; color: #475569;
  }
  .empty-state .icon { font-size: 40px; margin-bottom: 12px; }
  .empty-state p { font-size: 14px; }

  .toast {
    position: fixed; bottom: 24px; right: 24px; padding: 12px 20px;
    border-radius: 8px; font-size: 13px; z-index: 200;
    transform: translateY(80px); opacity: 0; transition: all 0.3s;
  }
  .toast.show { transform: translateY(0); opacity: 1; }
  .toast.success { background: #166534; color: #bbf7d0; }
  .toast.error { background: #991b1b; color: #fecaca; }

  .status-ok { color: #22c55e; }
  .status-err { color: #ef4444; }
  .status-warn { color: #f59e0b; }

  .log-row { cursor: pointer; }
  .log-detail { padding: 16px; }
  .log-detail pre {
    background: #0f172a; padding: 12px; border-radius: 6px; font-size: 12px;
    overflow-x: auto; white-space: pre-wrap; word-break: break-all;
    color: #94a3b8; border: 1px solid #334155; max-height: 300px; overflow-y: auto;
  }
  .log-detail h4 { font-size: 13px; color: #94a3b8; margin: 12px 0 6px; }
  .log-detail h4:first-child { margin-top: 0; }

  .log-filters {
    display: flex; gap: 10px; align-items: center; flex-wrap: wrap;
  }
  .log-filters select, .log-filters input {
    padding: 6px 10px; background: #0f172a; border: 1px solid #334155;
    border-radius: 6px; color: #e2e8f0; font-size: 13px;
  }

  .pagination {
    display: flex; justify-content: center; align-items: center; gap: 12px;
    margin-top: 16px;
  }
  .pagination .page-info { font-size: 13px; color: #64748b; }
</style>
</head>
<body>

<div id="app-login" class="login-box" style="display:none;">
  <h2>管理面板登录</h2>
  <input type="password" id="password-input" placeholder="请输入管理密码" onkeydown="if(event.key==='Enter')doLogin()">
  <button class="btn btn-primary" style="width:100%" onclick="doLogin()">登 录</button>
</div>

<div id="app-main" class="container" style="display:none;">
  <header>
    <h1>CF AI Gateway Proxy</h1>
    <span class="badge" id="cred-badge">0 个凭证</span>
  </header>

  <div class="info-bar">
    <h3>统一 API 地址 (OpenAI Compatible)</h3>
    <code id="api-url" onclick="copyURL(this)">加载中...</code>
    <div class="hint">点击复制。客户端 baseURL 使用此地址，API Key 填写你设置的密钥。</div>
  </div>

  <div class="info-bar" style="display:flex;align-items:center;gap:16px;">
    <h3 style="margin:0;white-space:nowrap;">负载策略</h3>
    <select id="lb-strategy" onchange="updateStrategy()" style="padding:8px 12px;background:#0f172a;border:1px solid #334155;border-radius:6px;color:#e2e8f0;font-size:13px;">
      <option value="random">随机 (Random)</option>
      <option value="round-robin">轮询 (Round-Robin)</option>
    </select>
    <span id="lb-status" style="font-size:12px;color:#64748b;"></span>
  </div>

  <div class="tabs">
    <div class="tab active" onclick="switchTab('creds')">凭证管理</div>
    <div class="tab" onclick="switchTab('logs')">调用日志</div>
  </div>

  <!-- Credentials Tab -->
  <div class="tab-content active" id="tab-creds">
    <div class="toolbar">
      <span class="count" id="count-text">共 0 个凭证</span>
      <button class="btn btn-primary" onclick="openModal()">+ 添加凭证</button>
    </div>
    <table>
      <thead>
        <tr>
          <th>名称</th>
          <th>Account ID</th>
          <th>Gateway ID</th>
          <th>API Token</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody id="cred-table"></tbody>
    </table>
    <div id="empty-state" class="empty-state" style="display:none;">
      <div class="icon">📭</div>
      <p>还没有凭证，点击上方按钮添加</p>
    </div>
  </div>

  <!-- Logs Tab -->
  <div class="tab-content" id="tab-logs">
    <div class="toolbar">
      <div class="log-filters">
        <select id="log-filter-cred" onchange="loadLogs()">
          <option value="">所有凭证</option>
        </select>
        <button class="btn btn-ghost btn-sm" onclick="loadLogs()">刷新</button>
      </div>
      <button class="btn btn-danger btn-sm" onclick="clearAllLogs()">清空日志</button>
    </div>
    <table>
      <thead>
        <tr>
          <th>时间</th>
          <th>凭证</th>
          <th>模型</th>
          <th>路径</th>
          <th>状态</th>
          <th>耗时</th>
          <th>流式</th>
        </tr>
      </thead>
      <tbody id="log-table"></tbody>
    </table>
    <div id="log-empty" class="empty-state" style="display:none;">
      <div class="icon">📋</div>
      <p>暂无调用日志</p>
    </div>
    <div class="pagination" id="log-pagination" style="display:none;">
      <button class="btn btn-ghost btn-sm" id="log-prev" onclick="logPage(-1)">上一页</button>
      <span class="page-info" id="log-page-info">第 1 页</span>
      <button class="btn btn-ghost btn-sm" id="log-next" onclick="logPage(1)">下一页</button>
    </div>
  </div>
</div>

<!-- Credential Modal -->
<div class="modal-overlay" id="modal-overlay">
  <div class="modal">
    <h2 id="modal-title">添加凭证</h2>
    <input type="hidden" id="edit-id">
    <div class="form-group">
      <label>名称（备注）</label>
      <input id="f-name" placeholder="例如：账号A">
    </div>
    <div class="form-group">
      <label>Account ID</label>
      <input id="f-accountId" placeholder="Cloudflare Account ID">
    </div>
    <div class="form-group">
      <label>Gateway ID</label>
      <input id="f-gatewayId" placeholder="AI Gateway 名称，如 default" value="default">
    </div>
    <div class="form-group">
      <label>API Token</label>
      <input id="f-apiToken" placeholder="Cloudflare API Token">
    </div>
    <div class="form-actions">
      <button class="btn btn-ghost" onclick="closeModal()">取消</button>
      <button class="btn btn-primary" onclick="saveCredential()">保存</button>
    </div>
  </div>
</div>

<!-- Test Result Modal -->
<div class="modal-overlay" id="test-overlay">
  <div class="modal wide">
    <h2 id="test-title">测试结果</h2>
    <div class="log-detail" id="test-result-content"></div>
    <div class="form-actions">
      <button class="btn btn-ghost" onclick="closeTest()">关闭</button>
    </div>
  </div>
</div>

<!-- Log Detail Modal -->
<div class="modal-overlay" id="log-detail-overlay">
  <div class="modal wide">
    <h2>请求详情</h2>
    <div class="log-detail" id="log-detail-content"></div>
    <div class="form-actions">
      <button class="btn btn-ghost" onclick="closeLogDetail()">关闭</button>
    </div>
  </div>
</div>

<div class="toast" id="toast"></div>

<script>
let TOKEN = '';
const API = '/api/credentials';
let logOffset = 0;
const LOG_LIMIT = 30;
let logTotal = 0;

function init() {
  TOKEN = localStorage.getItem('admin_token') || '';
  if (!TOKEN) {
    showLogin();
  } else {
    showMain();
    loadCredentials();
    loadSettings();
  }
  document.getElementById('api-url').textContent = location.origin + '/v1';
}

async function loadSettings() {
  const res = await fetch('/api/settings', { headers: { 'Authorization': 'Bearer ' + TOKEN } });
  if (!res.ok) return;
  const s = await res.json();
  document.getElementById('lb-strategy').value = s.loadBalanceStrategy || 'random';
  document.getElementById('lb-status').textContent = '';
}

async function updateStrategy() {
  const val = document.getElementById('lb-strategy').value;
  const res = await fetch('/api/settings', {
    method: 'PUT',
    headers: { 'Authorization': 'Bearer ' + TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify({ loadBalanceStrategy: val })
  });
  if (res.ok) {
    document.getElementById('lb-status').textContent = '已保存';
    toast('负载策略已更新', 'success');
    setTimeout(function() { document.getElementById('lb-status').textContent = ''; }, 2000);
  } else {
    toast('保存失败', 'error');
  }
}

function showLogin() {
  document.getElementById('app-login').style.display = 'block';
  document.getElementById('app-main').style.display = 'none';
}

function showMain() {
  document.getElementById('app-login').style.display = 'none';
  document.getElementById('app-main').style.display = 'block';
}

async function doLogin() {
  const pw = document.getElementById('password-input').value;
  if (!pw) return;
  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: pw })
  });
  if (res.ok) {
    const data = await res.json();
    TOKEN = data.token;
    localStorage.setItem('admin_token', TOKEN);
    showMain();
    loadCredentials();
    loadSettings();
    toast('登录成功', 'success');
  } else {
    toast('密码错误', 'error');
  }
}

function switchTab(tab) {
  document.querySelectorAll('.tab').forEach((t, i) => {
    t.classList.toggle('active', (tab === 'creds' && i === 0) || (tab === 'logs' && i === 1));
  });
  document.getElementById('tab-creds').classList.toggle('active', tab === 'creds');
  document.getElementById('tab-logs').classList.toggle('active', tab === 'logs');
  if (tab === 'logs') { logOffset = 0; loadLogs(); }
}

// === Credentials ===
async function loadCredentials() {
  const res = await fetch(API, { headers: { 'Authorization': 'Bearer ' + TOKEN } });
  if (res.status === 401) { localStorage.removeItem('admin_token'); showLogin(); return; }
  const list = await res.json();
  renderCreds(list);
  updateLogFilterOptions(list);
}

function renderCreds(list) {
  const tbody = document.getElementById('cred-table');
  const empty = document.getElementById('empty-state');
  document.getElementById('cred-badge').textContent = list.length + ' 个凭证';
  document.getElementById('count-text').textContent = '共 ' + list.length + ' 个凭证';
  if (list.length === 0) { tbody.innerHTML = ''; empty.style.display = 'block'; return; }
  empty.style.display = 'none';
  tbody.innerHTML = list.map(c => '<tr>' +
    '<td>' + esc(c.name) + '</td>' +
    '<td class="token-cell">' + esc(c.accountId) + '</td>' +
    '<td>' + esc(c.gatewayId) + '</td>' +
    '<td class="token-cell">' + esc(c.apiToken) + '</td>' +
    '<td class="actions">' +
      '<button class="btn btn-success btn-sm" id="test-btn-' + c.id + '" onclick="testCred(\\'' + c.id + '\\',\\'' + esc(c.name) + '\\')">测试</button>' +
      '<button class="btn btn-ghost btn-sm" onclick="editCred(\\'' + c.id + '\\')">编辑</button>' +
      '<button class="btn btn-danger btn-sm" onclick="delCred(\\'' + c.id + '\\')">删除</button>' +
    '</td></tr>').join('');
}

function updateLogFilterOptions(list) {
  const sel = document.getElementById('log-filter-cred');
  const current = sel.value;
  sel.innerHTML = '<option value="">所有凭证</option>' +
    list.map(c => '<option value="' + esc(c.name) + '">' + esc(c.name) + '</option>').join('');
  sel.value = current;
}

function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

function openModal(data) {
  document.getElementById('modal-title').textContent = data ? '编辑凭证' : '添加凭证';
  document.getElementById('edit-id').value = data ? data.id : '';
  document.getElementById('f-name').value = data ? data.name : '';
  document.getElementById('f-accountId').value = data ? data.accountId : '';
  document.getElementById('f-gatewayId').value = data ? data.gatewayId : 'default';
  document.getElementById('f-apiToken').value = data ? data.apiToken : '';
  document.getElementById('modal-overlay').classList.add('active');
}
function closeModal() { document.getElementById('modal-overlay').classList.remove('active'); }

async function saveCredential() {
  const id = document.getElementById('edit-id').value;
  const body = {
    name: document.getElementById('f-name').value,
    accountId: document.getElementById('f-accountId').value,
    gatewayId: document.getElementById('f-gatewayId').value,
    apiToken: document.getElementById('f-apiToken').value,
  };
  if (!body.name || !body.accountId || !body.gatewayId || !body.apiToken) {
    toast('所有字段都必须填写', 'error'); return;
  }
  const url = id ? API + '/' + id : API;
  const method = id ? 'PUT' : 'POST';
  const res = await fetch(url, {
    method, headers: { 'Authorization': 'Bearer ' + TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (res.ok) { closeModal(); loadCredentials(); toast(id ? '更新成功' : '添加成功', 'success'); }
  else { toast('操作失败', 'error'); }
}

async function editCred(id) {
  const res = await fetch(API, { headers: { 'Authorization': 'Bearer ' + TOKEN } });
  const list = await res.json();
  const c = list.find(x => x.id === id);
  if (c) openModal(c);
}

async function delCred(id) {
  if (!confirm('确定要删除这个凭证吗？')) return;
  await fetch(API + '/' + id, { method: 'DELETE', headers: { 'Authorization': 'Bearer ' + TOKEN } });
  loadCredentials(); toast('已删除', 'success');
}

// === Logs ===
let _logCache = [];

async function loadLogs() {
  const cred = document.getElementById('log-filter-cred').value;
  let url = '/api/logs?limit=' + LOG_LIMIT + '&offset=' + logOffset;
  if (cred) url += '&credential=' + encodeURIComponent(cred);
  const res = await fetch(url, { headers: { 'Authorization': 'Bearer ' + TOKEN } });
  if (!res.ok) { toast('加载日志失败', 'error'); return; }
  const data = await res.json();
  logTotal = data.total;
  _logCache = data.logs;
  renderLogs(data.logs);
}

function renderLogs(logs) {
  const tbody = document.getElementById('log-table');
  const empty = document.getElementById('log-empty');
  const pag = document.getElementById('log-pagination');

  if (logs.length === 0 && logOffset === 0) {
    tbody.innerHTML = ''; empty.style.display = 'block'; pag.style.display = 'none'; return;
  }
  empty.style.display = 'none';

  tbody.innerHTML = logs.map(function(l, idx) {
    const t = new Date(l.timestamp);
    const timeStr = t.toLocaleString('zh-CN', { hour12: false });
    const statusClass = l.statusCode < 300 ? 'status-ok' : l.statusCode < 500 ? 'status-warn' : 'status-err';
    return '<tr class="log-row" onclick="showLogDetail(' + idx + ')">' +
      '<td style="white-space:nowrap;font-size:12px;">' + timeStr + '</td>' +
      '<td>' + esc(l.credentialName) + '</td>' +
      '<td style="font-family:monospace;font-size:12px;">' + esc(l.model || '-') + '</td>' +
      '<td class="token-cell">' + esc(l.path) + '</td>' +
      '<td class="' + statusClass + '">' + l.statusCode + '</td>' +
      '<td>' + l.durationMs + 'ms</td>' +
      '<td>' + (l.stream ? '是' : '否') + '</td>' +
    '</tr>';
  }).join('');

  const totalPages = Math.ceil(logTotal / LOG_LIMIT);
  const currentPage = Math.floor(logOffset / LOG_LIMIT) + 1;
  if (totalPages > 1) {
    pag.style.display = 'flex';
    document.getElementById('log-page-info').textContent = '第 ' + currentPage + ' / ' + totalPages + ' 页';
    document.getElementById('log-prev').disabled = currentPage <= 1;
    document.getElementById('log-next').disabled = currentPage >= totalPages;
  } else {
    pag.style.display = 'none';
  }
}

function logPage(dir) {
  logOffset += dir * LOG_LIMIT;
  if (logOffset < 0) logOffset = 0;
  loadLogs();
}

function showLogDetail(idx) {
  const l = _logCache[idx];
  if (!l) return;
  const t = new Date(l.timestamp).toLocaleString('zh-CN', { hour12: false });
  let html = '<h4>基本信息</h4><pre>' +
    '时间: ' + t + '\\n' +
    '凭证: ' + esc(l.credentialName) + '\\n' +
    '模型: ' + esc(l.model || '-') + '\\n' +
    '方法: ' + l.method + '\\n' +
    '路径: ' + esc(l.path) + '\\n' +
    '目标: ' + esc(l.targetURL) + '\\n' +
    '状态: ' + l.statusCode + '\\n' +
    '耗时: ' + l.durationMs + 'ms\\n' +
    '流式: ' + (l.stream ? '是' : '否') + '\\n' +
    'IP: ' + esc(l.clientIP) + '</pre>';

  if (l.requestBody) {
    html += '<h4>请求体</h4><pre>' + esc(JSON.stringify(l.requestBody, null, 2)) + '</pre>';
  }

  html += '<h4>响应预览</h4><pre>' + esc(l.responsePreview || '-') + '</pre>';

  document.getElementById('log-detail-content').innerHTML = html;
  document.getElementById('log-detail-overlay').classList.add('active');
}

function closeLogDetail() { document.getElementById('log-detail-overlay').classList.remove('active'); }

async function testCred(id, name) {
  var btn = document.getElementById('test-btn-' + id);
  if (btn) { btn.disabled = true; btn.textContent = '测试中...'; }
  try {
    var res = await fetch('/api/test/' + id, {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + TOKEN }
    });
    var data = await res.json();
    var statusClass = data.success ? 'status-ok' : 'status-err';
    var parsed = '';
    try { parsed = JSON.stringify(JSON.parse(data.body), null, 2); } catch(e) { parsed = data.body || ''; }
    var html = '<h4>凭证: ' + esc(name) + '</h4>' +
      '<h4>模型: workers-ai/@cf/openai/gpt-oss-20b</h4>' +
      '<pre>' +
      '状态: <span class="' + statusClass + '">' + (data.success ? '成功' : '失败') + ' (' + data.status + ')</span>\\n' +
      '耗时: ' + data.durationMs + 'ms</pre>' +
      '<h4>响应内容</h4><pre>' + esc(parsed) + '</pre>';
    document.getElementById('test-title').textContent = '测试结果 - ' + name;
    document.getElementById('test-result-content').innerHTML = html;
    document.getElementById('test-overlay').classList.add('active');
    toast(data.success ? '测试通过' : '测试失败', data.success ? 'success' : 'error');
  } catch(e) {
    toast('测试请求失败: ' + e, 'error');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = '测试'; }
  }
}

function closeTest() { document.getElementById('test-overlay').classList.remove('active'); }

async function clearAllLogs() {
  if (!confirm('确定要清空所有日志吗？')) return;
  await fetch('/api/logs', { method: 'DELETE', headers: { 'Authorization': 'Bearer ' + TOKEN } });
  logOffset = 0; loadLogs(); toast('日志已清空', 'success');
}

function copyURL(el) {
  navigator.clipboard.writeText(el.textContent);
  toast('已复制到剪贴板', 'success');
}

function toast(msg, type) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast ' + type + ' show';
  setTimeout(() => t.classList.remove('show'), 2500);
}

init();
</script>
</body>
</html>`;
}
