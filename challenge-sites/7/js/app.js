// DevDash API Configuration
// WARNING: Hardcoded credentials — move to environment variables before production!

const DEV_CONFIG = {
  apiBase: 'https://api.devdash.internal/v2',
  apiKey: 'REPLACE_WITH_REAL_KEY',
  secretKey: 'CGS{js_credentials_exposed}',
  database: {
    host: 'db.internal',
    user: 'app_service',
    password: 'temp_dev_password_2025',
  },
  endpoints: {
    users: '/users',
    deploy: '/deploy',
    logs: '/logs',
  },
};

async function initDashboard() {
  console.log('[DevDash] Initializing with API key:', DEV_CONFIG.apiKey.substring(0, 12) + '...');
  try {
    const resp = await fetch(DEV_CONFIG.apiBase + '/status', {
      headers: { 'Authorization': 'Bearer ' + DEV_CONFIG.apiKey },
    });
    const statusEl = document.getElementById('statusDisplay');
    if (resp.ok) {
      statusEl.innerHTML = '<span style="color:var(--accent-green);font-weight:600;">✓ All systems operational</span>';
    } else {
      statusEl.innerHTML = '<span style="color:var(--accent-red);font-weight:600;">✗ API unreachable</span>';
    }
  } catch {
    // Simulate connected for demo
    document.getElementById('statusDisplay').innerHTML = '<span style="color:var(--accent-green);font-weight:600;">✓ All systems operational</span>';
  }
}

document.addEventListener('DOMContentLoaded', initDashboard);
