import type {
  AccountSessionData,
  AuthMode,
  OAuthProviderId,
  ProviderCatalogItem,
  SaveConnectionInput,
  SavePromptInput,
  SavedPromptItem,
  UserAIConnectionPublic,
} from '../types/account';

// Layanan frontend untuk komunikasi dengan /api/account (Auth, Workspace Prompt per-User, & Koneksi AI BYOK).

const ACCOUNT_ENDPOINT = '/api/account';
const SESSION_TOKEN_KEY = 'promptCraftsmanAuthToken';

export const PROVIDER_CATALOG: ProviderCatalogItem[] = [
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

export function getSessionToken(): string {
  try {
    return localStorage.getItem(SESSION_TOKEN_KEY) || '';
  } catch {
    return '';
  }
}

export function setSessionToken(token: string): void {
  try {
    if (token) localStorage.setItem(SESSION_TOKEN_KEY, token);
    else localStorage.removeItem(SESSION_TOKEN_KEY);
  } catch {
    // Abaikan jika storage penuh / mode privat
  }
}

async function callAccountApi<T = Record<string, unknown>>(
  payload: Record<string, unknown>
): Promise<T> {
  const token = getSessionToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(ACCOUNT_ENDPOINT, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  const json = (await res.json().catch(() => null)) as {
    error?: { message?: string };
    [key: string]: unknown;
  } | null;

  if (!res.ok) {
    if (res.status === 401) setSessionToken('');
    throw new Error(json?.error?.message || `Permintaan gagal (${res.status}).`);
  }

  return (json || {}) as T;
}

export async function authenticateAccount(
  mode: AuthMode,
  email: string,
  password: string
): Promise<AccountSessionData> {
  const data = await callAccountApi<AccountSessionData>({ action: mode, email, password });
  if (data?.accessToken) {
    setSessionToken(data.accessToken);
  }
  return data;
}

export async function getOAuthAuthorizeUrl(provider: OAuthProviderId): Promise<string> {
  const redirectTo = typeof window !== 'undefined' ? window.location.origin : '';
  const data = await callAccountApi<{ url?: string }>({
    action: 'oauth_url',
    provider,
    redirectTo,
  });
  return data?.url || '';
}

export async function fetchCurrentSession(): Promise<AccountSessionData | null> {
  const token = getSessionToken();
  if (!token) return null;
  return callAccountApi<AccountSessionData>({ action: 'session' });
}

export async function saveUserAiConnection(
  connection: SaveConnectionInput
): Promise<UserAIConnectionPublic | null> {
  const data = await callAccountApi<{ connection: UserAIConnectionPublic | null }>({
    action: 'save_connection',
    connection,
  });
  return data.connection;
}

export async function deleteUserAiConnection(): Promise<null> {
  await callAccountApi({ action: 'delete_connection' });
  return null;
}

export async function savePromptToWorkspace(prompt: SavePromptInput): Promise<SavedPromptItem[]> {
  const data = await callAccountApi<{ prompts?: SavedPromptItem[] }>({
    action: 'save_prompt',
    prompt,
  });
  return data.prompts || [];
}

export async function deletePromptFromWorkspace(promptId: string): Promise<SavedPromptItem[]> {
  const data = await callAccountApi<{ prompts?: SavedPromptItem[] }>({
    action: 'delete_prompt',
    promptId,
  });
  return data.prompts || [];
}
