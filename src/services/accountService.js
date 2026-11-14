// Layanan frontend untuk komunikasi dengan /api/account (Auth, Workspace Prompt per-User, & Koneksi AI BYOK).

const ACCOUNT_ENDPOINT = '/api/account';
const SESSION_TOKEN_KEY = 'promptCraftsmanAuthToken';

export const PROVIDER_CATALOG = [
  {
    id: 'gemini',
    label: 'Google Gemini API',
    defaultModel: 'gemini-2.5-flash',
    suggestedModels: ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.5-flash-lite'],
    keyPlaceholder: 'AIzaSy...',
    consoleUrl: 'https://aistudio.google.com/apikey',
    requiresBaseUrl: false,
  },
  {
    id: 'anthropic',
    label: 'Anthropic Claude API',
    defaultModel: 'claude-3-5-sonnet-latest',
    suggestedModels: ['claude-3-5-sonnet-latest', 'claude-3-5-haiku-latest'],
    keyPlaceholder: 'sk-ant-api03-...',
    consoleUrl: 'https://console.anthropic.com/settings/keys',
    requiresBaseUrl: false,
  },
  {
    id: 'openai',
    label: 'OpenAI API',
    defaultModel: 'gpt-4o-mini',
    suggestedModels: ['gpt-4o-mini', 'gpt-4o', 'gpt-4.1-mini'],
    keyPlaceholder: 'sk-proj-...',
    consoleUrl: 'https://platform.openai.com/api-keys',
    requiresBaseUrl: false,
  },
  {
    id: 'openrouter',
    label: 'OpenRouter API',
    defaultModel: 'google/gemini-2.5-flash',
    suggestedModels: [
      'google/gemini-2.5-flash',
      'anthropic/claude-3.5-sonnet',
      'meta-llama/llama-3.3-70b-instruct:free',
      'openrouter/free',
    ],
    keyPlaceholder: 'sk-or-v1-...',
    consoleUrl: 'https://openrouter.ai/keys',
    requiresBaseUrl: false,
  },
  {
    id: 'custom',
    label: 'Custom Gateway (9Router / LiteLLM / v1)',
    defaultModel: 'gemini-2.5-flash',
    suggestedModels: ['gemini-2.5-flash', 'gemini-combo'],
    keyPlaceholder: 'sk-...',
    consoleUrl: '',
    requiresBaseUrl: true,
  },
];

export function getSessionToken() {
  try {
    return localStorage.getItem(SESSION_TOKEN_KEY) || '';
  } catch {
    return '';
  }
}

export function setSessionToken(token) {
  try {
    if (token) localStorage.setItem(SESSION_TOKEN_KEY, token);
    else localStorage.removeItem(SESSION_TOKEN_KEY);
  } catch {
    // Abaikan jika storage penuh / mode privat
  }
}

async function callAccountApi(payload) {
  const token = getSessionToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(ACCOUNT_ENDPOINT, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  const json = await res.json().catch(() => null);
  if (!res.ok) {
    if (res.status === 401) setSessionToken('');
    throw new Error(json?.error?.message || `Permintaan gagal (${res.status}).`);
  }

  return json;
}

export async function authenticateAccount(mode, email, password) {
  const data = await callAccountApi({ action: mode, email, password });
  if (data?.accessToken) {
    setSessionToken(data.accessToken);
  }
  return data;
}

export async function fetchCurrentSession() {
  const token = getSessionToken();
  if (!token) return null;
  return callAccountApi({ action: 'session' });
}

export async function saveUserAiConnection(connection) {
  const data = await callAccountApi({ action: 'save_connection', connection });
  return data.connection;
}

export async function deleteUserAiConnection() {
  await callAccountApi({ action: 'delete_connection' });
  return null;
}

export async function savePromptToWorkspace(prompt) {
  const data = await callAccountApi({ action: 'save_prompt', prompt });
  return data.prompts || [];
}

export async function deletePromptFromWorkspace(promptId) {
  const data = await callAccountApi({ action: 'delete_prompt', promptId });
  return data.prompts || [];
}
