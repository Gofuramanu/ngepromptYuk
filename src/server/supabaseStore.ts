// Layanan Auth, Penyimpanan Prompt per-User, dan Kredensial AI Terenkripsi (Supabase + Fallback Terenkripsi).

import crypto from 'node:crypto';
import type {
  AIProviderId,
  AuthMode,
  DecryptedUserAIConnection,
  SavedPromptItem,
  UserAIConnectionPublic,
  UserProfile,
} from '../types/account.ts';
import type { AnatomyLayersMap, PromptVariablesMap } from '../types/prompt.ts';
import { decryptApiKey, encryptApiKey, maskApiKey } from './cryptoVault.ts';
import { SUPPORTED_PROVIDERS } from './providerRouter.ts';

interface LocalUserRecord extends UserProfile {
  passwordHash: string;
}

interface LocalConnectionRecord {
  userId: string;
  provider: AIProviderId;
  model: string;
  baseUrl: string;
  encryptedApiKey: string;
  keyHint: string;
  isActive: boolean;
  updatedAt: string;
}

// Fallback in-memory store (digunakan otomatis bila SUPABASE_URL belum diset saat dev/demo)
const localStore = {
  usersByEmail: new Map<string, LocalUserRecord>(),
  usersById: new Map<string, LocalUserRecord>(),
  promptsByUser: new Map<string, SavedPromptItem[]>(),
  connectionsByUser: new Map<string, LocalConnectionRecord>(),
};

type EnvMap = Record<string, string | undefined>;

function getEncryptionSecret(env: EnvMap = process.env): string {
  return (
    env.CREDENTIAL_ENCRYPTION_KEY ||
    env.SUPABASE_SERVICE_ROLE_KEY ||
    env.NINEROUTER_API_KEY ||
    'prompt-craftsman-dev-vault-key-2026'
  ).trim();
}

function getSupabaseConfig(env: EnvMap = process.env) {
  const url = (env.SUPABASE_URL || env.VITE_SUPABASE_URL || '').trim().replace(/\/+$/, '');
  const anonKey = (env.SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY || '').trim();
  return {
    url,
    anonKey,
    isConfigured: Boolean(url && anonKey),
  };
}

function createSignedToken(user: UserProfile, secret: string): string {
  const payload = Buffer.from(
    JSON.stringify({
      sub: user.id,
      email: user.email,
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
    })
  ).toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  return `local.${payload}.${sig}`;
}

function verifySignedToken(token: string, secret: string): UserProfile | null {
  if (typeof token !== 'string' || !token.startsWith('local.')) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [, payload, sig] = parts;
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  if (sig !== expected) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      sub?: string;
      email?: string;
      exp?: number;
    };
    if (!parsed?.sub || !parsed?.email || (parsed.exp ?? 0) < Date.now()) return null;
    return { id: parsed.sub, email: parsed.email };
  } catch {
    return null;
  }
}

export function extractBearerToken(req?: {
  headers?: Record<string, string | string[] | undefined>;
}): string {
  const rawHeader = req?.headers?.authorization || req?.headers?.Authorization || '';
  const authHeader = Array.isArray(rawHeader) ? rawHeader[0] || '' : rawHeader;
  if (typeof authHeader !== 'string' || !authHeader.toLowerCase().startsWith('bearer ')) {
    return '';
  }
  return authHeader.slice(7).trim();
}

/**
 * Verifikasi token sesi user (Supabase JWT atau Local Signed Token).
 */
export async function resolveAuthenticatedUser(
  token: string,
  env: EnvMap = process.env
): Promise<UserProfile | null> {
  if (!token) return null;
  const supa = getSupabaseConfig(env);

  if (supa.isConfigured && !token.startsWith('local.')) {
    const res = await fetch(`${supa.url}/auth/v1/user`, {
      headers: {
        apikey: supa.anonKey,
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) return null;
    const user = (await res.json().catch(() => null)) as { id?: string; email?: string } | null;
    return user?.id && user?.email ? { id: user.id, email: user.email } : null;
  }

  return verifySignedToken(token, getEncryptionSecret(env));
}

/**
 * Registrasi atau Login user via email & password.
 */
export async function authenticateUser(
  { mode, email, password }: { mode: AuthMode; email?: unknown; password?: unknown },
  env: EnvMap = process.env
): Promise<{
  user: UserProfile;
  accessToken: string;
  storageMode: 'supabase' | 'encrypted_vault';
}> {
  const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  const cleanPassword = typeof password === 'string' ? password : '';

  if (!cleanEmail || !cleanEmail.includes('@')) {
    throw new Error('Masukkan alamat email yang valid.');
  }
  if (cleanPassword.length < 6) {
    throw new Error('Password minimal harus terdiri dari 6 karakter.');
  }

  const supa = getSupabaseConfig(env);

  if (supa.isConfigured) {
    const endpoint =
      mode === 'signup'
        ? `${supa.url}/auth/v1/signup`
        : `${supa.url}/auth/v1/token?grant_type=password`;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: supa.anonKey,
      },
      body: JSON.stringify({ email: cleanEmail, password: cleanPassword }),
    });

    const data = (await res.json().catch(() => null)) as {
      user?: { id: string; email: string };
      id?: string;
      email?: string;
      access_token?: string;
      session?: { access_token?: string };
      msg?: string;
      error_description?: string;
      error?: string;
    } | null;

    if (!res.ok) {
      throw new Error(
        data?.msg ||
          data?.error_description ||
          data?.error ||
          'Gagal melakukan autentikasi ke Supabase.'
      );
    }

    const user =
      data?.user || (data?.id && data?.email ? { id: data.id, email: data.email } : null);
    const accessToken = data?.access_token || data?.session?.access_token || '';

    if ((!accessToken || !user) && mode === 'signup') {
      throw new Error(
        'Registrasi berhasil! Silakan cek email Anda untuk verifikasi, atau nonaktifkan Confirm Email di Supabase Auth Settings agar langsung login.'
      );
    }

    if (!user) {
      throw new Error('Data pengguna tidak ditemukan dari respons Supabase.');
    }

    return {
      user: { id: user.id, email: user.email },
      accessToken,
      storageMode: 'supabase',
    };
  }

  // Fallback lokal terenkripsi jika SUPABASE_URL belum diset
  const secret = getEncryptionSecret(env);
  const existing = localStore.usersByEmail.get(cleanEmail);

  if (mode === 'signup') {
    if (existing) {
      throw new Error('Email sudah terdaftar. Silakan gunakan menu Sign In.');
    }
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync(cleanPassword, salt, 64).toString('hex');
    const newUser: LocalUserRecord = {
      id: crypto.randomUUID(),
      email: cleanEmail,
      passwordHash: `${salt}:${hash}`,
    };
    localStore.usersByEmail.set(cleanEmail, newUser);
    localStore.usersById.set(newUser.id, newUser);
    return {
      user: { id: newUser.id, email: newUser.email },
      accessToken: createSignedToken(newUser, secret),
      storageMode: 'encrypted_vault',
    };
  }

  if (!existing) {
    throw new Error('Akun belum ditemukan. Silakan daftar melalui tab Sign Up terlebih dahulu.');
  }
  const [salt, storedHash] = existing.passwordHash.split(':');
  const computedHash = crypto.scryptSync(cleanPassword, salt, 64).toString('hex');
  if (computedHash !== storedHash) {
    throw new Error('Email atau password tidak sesuai.');
  }

  return {
    user: { id: existing.id, email: existing.email },
    accessToken: createSignedToken(existing, secret),
    storageMode: 'encrypted_vault',
  };
}

interface SupabaseConnectionRow {
  provider: AIProviderId;
  model: string;
  base_url?: string | null;
  key_hint: string;
  encrypted_api_key?: string;
  is_active: boolean;
  updated_at?: string;
}

/**
 * Mengambil metadata koneksi AI milik user (tanpa pernah mengirim raw API key ke browser).
 */
export async function getUserConnectionPublic(
  user: UserProfile,
  token: string,
  env: EnvMap = process.env
): Promise<UserAIConnectionPublic | null> {
  const supa = getSupabaseConfig(env);

  if (supa.isConfigured && !token.startsWith('local.')) {
    const res = await fetch(
      `${supa.url}/rest/v1/user_ai_connections?user_id=eq.${encodeURIComponent(user.id)}&select=provider,model,base_url,key_hint,is_active,updated_at`,
      {
        headers: {
          apikey: supa.anonKey,
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!res.ok) return null;
    const rows = (await res.json().catch(() => [])) as SupabaseConnectionRow[];
    const row = rows?.[0];
    if (!row) return null;
    return {
      provider: row.provider,
      model: row.model,
      baseUrl: row.base_url || '',
      keyHint: row.key_hint,
      isActive: Boolean(row.is_active),
      updatedAt: row.updated_at,
    };
  }

  const record = localStore.connectionsByUser.get(user.id);
  if (!record) return null;
  return {
    provider: record.provider,
    model: record.model,
    baseUrl: record.baseUrl || '',
    keyHint: record.keyHint,
    isActive: Boolean(record.isActive),
    updatedAt: record.updatedAt,
  };
}

/**
 * Mengambil dan mendekripsi kredensial AI milik user di sisi server untuk eksekusi /api/generate.
 */
export async function getDecryptedUserConnection(
  token: string,
  env: EnvMap = process.env
): Promise<DecryptedUserAIConnection | null> {
  const user = await resolveAuthenticatedUser(token, env);
  if (!user) return null;

  const secret = getEncryptionSecret(env);
  const supa = getSupabaseConfig(env);

  if (supa.isConfigured && !token.startsWith('local.')) {
    const res = await fetch(
      `${supa.url}/rest/v1/user_ai_connections?user_id=eq.${encodeURIComponent(user.id)}&select=provider,model,base_url,encrypted_api_key,is_active`,
      {
        headers: {
          apikey: supa.anonKey,
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!res.ok) return null;
    const rows = (await res.json().catch(() => [])) as SupabaseConnectionRow[];
    const row = rows?.[0];
    if (!row || !row.is_active || !row.encrypted_api_key) return null;

    return {
      userId: user.id,
      provider: row.provider,
      model: row.model,
      baseUrl: row.base_url || '',
      apiKey: decryptApiKey(row.encrypted_api_key, secret),
    };
  }

  const record = localStore.connectionsByUser.get(user.id);
  if (!record || !record.isActive || !record.encryptedApiKey) return null;

  return {
    userId: user.id,
    provider: record.provider,
    model: record.model,
    baseUrl: record.baseUrl || '',
    apiKey: decryptApiKey(record.encryptedApiKey, secret),
  };
}

function isSupportedProvider(provider: string): provider is AIProviderId {
  return Object.hasOwn(SUPPORTED_PROVIDERS, provider);
}

/**
 * Menyimpan/memperbarui koneksi AI milik user dengan enkripsi AES-256-GCM.
 */
export async function saveUserConnection(
  user: UserProfile,
  token: string,
  input: Record<string, unknown> | null | undefined,
  env: EnvMap = process.env
): Promise<UserAIConnectionPublic | null> {
  const providerRaw = typeof input?.provider === 'string' ? input.provider.trim() : '';
  if (!isSupportedProvider(providerRaw)) {
    throw new Error(`Provider "${providerRaw}" tidak didukung.`);
  }
  const provider: AIProviderId = providerRaw;

  const model =
    (typeof input?.model === 'string' ? input.model.trim() : '') ||
    SUPPORTED_PROVIDERS[provider].defaultModel;
  const baseUrl = typeof input?.baseUrl === 'string' ? input.baseUrl.trim() : '';
  const rawApiKey = typeof input?.apiKey === 'string' ? input.apiKey.trim() : '';
  const isActive = input?.isActive !== undefined ? Boolean(input.isActive) : true;

  if (provider === 'custom' && !baseUrl) {
    throw new Error('Base URL wajib diisi untuk Custom Gateway.');
  }

  const secret = getEncryptionSecret(env);
  const supa = getSupabaseConfig(env);

  if (supa.isConfigured && !token.startsWith('local.')) {
    let encryptedApiKey: string;
    let keyHint: string;

    if (rawApiKey) {
      encryptedApiKey = encryptApiKey(rawApiKey, secret);
      keyHint = maskApiKey(rawApiKey);
    } else {
      const existingRes = await fetch(
        `${supa.url}/rest/v1/user_ai_connections?user_id=eq.${encodeURIComponent(user.id)}&select=encrypted_api_key,key_hint`,
        {
          headers: {
            apikey: supa.anonKey,
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const existingRows = (await existingRes.json().catch(() => [])) as SupabaseConnectionRow[];
      const existing = existingRows?.[0];
      if (!existing?.encrypted_api_key) {
        throw new Error('API Key wajib diisi untuk koneksi baru.');
      }
      encryptedApiKey = existing.encrypted_api_key;
      keyHint = existing.key_hint;
    }

    const upsertRes = await fetch(
      `${supa.url}/rest/v1/user_ai_connections?on_conflict=user_id`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: supa.anonKey,
          Authorization: `Bearer ${token}`,
          Prefer: 'resolution=merge-duplicates,return=representation',
        },
        body: JSON.stringify({
          user_id: user.id,
          provider,
          model,
          base_url: baseUrl || null,
          encrypted_api_key: encryptedApiKey,
          key_hint: keyHint,
          is_active: isActive,
        }),
      }
    );

    const rows = (await upsertRes.json().catch(() => null)) as { message?: string } | null;
    if (!upsertRes.ok) {
      throw new Error(rows?.message || 'Gagal menyimpan kredensial AI ke Supabase.');
    }

    return getUserConnectionPublic(user, token, env);
  }

  // Fallback lokal terenkripsi
  const existing = localStore.connectionsByUser.get(user.id);
  if (!rawApiKey && !existing?.encryptedApiKey) {
    throw new Error('API Key wajib diisi untuk koneksi baru.');
  }

  const encryptedApiKey = rawApiKey
    ? encryptApiKey(rawApiKey, secret)
    : existing!.encryptedApiKey;
  const keyHint = rawApiKey ? maskApiKey(rawApiKey) : existing!.keyHint;

  const nextRecord: LocalConnectionRecord = {
    userId: user.id,
    provider,
    model,
    baseUrl,
    encryptedApiKey,
    keyHint,
    isActive,
    updatedAt: new Date().toISOString(),
  };
  localStore.connectionsByUser.set(user.id, nextRecord);
  return getUserConnectionPublic(user, token, env);
}

export async function deleteUserConnection(
  user: UserProfile,
  token: string,
  env: EnvMap = process.env
): Promise<boolean> {
  const supa = getSupabaseConfig(env);
  if (supa.isConfigured && !token.startsWith('local.')) {
    await fetch(
      `${supa.url}/rest/v1/user_ai_connections?user_id=eq.${encodeURIComponent(user.id)}`,
      {
        method: 'DELETE',
        headers: {
          apikey: supa.anonKey,
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return true;
  }

  localStore.connectionsByUser.delete(user.id);
  return true;
}

interface SupabasePromptRow {
  id: string;
  title: string;
  short_prompt?: string | null;
  layers?: Partial<AnatomyLayersMap> | null;
  variables?: PromptVariablesMap | null;
  updated_at?: string;
}

/**
 * Daftar, simpan, dan hapus Master Prompt pada ruang kerja per-user.
 */
export async function listUserPrompts(
  user: UserProfile,
  token: string,
  env: EnvMap = process.env
): Promise<SavedPromptItem[]> {
  const supa = getSupabaseConfig(env);
  if (supa.isConfigured && !token.startsWith('local.')) {
    const res = await fetch(
      `${supa.url}/rest/v1/user_prompts?user_id=eq.${encodeURIComponent(user.id)}&select=id,title,short_prompt,layers,variables,updated_at&order=updated_at.desc`,
      {
        headers: {
          apikey: supa.anonKey,
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!res.ok) return [];
    const rows = (await res.json().catch(() => [])) as SupabasePromptRow[];
    return Array.isArray(rows)
      ? rows.map((r) => ({
          id: r.id,
          title: r.title,
          shortPrompt: r.short_prompt || '',
          layers: r.layers || {},
          variables: r.variables || {},
          updatedAt: r.updated_at,
        }))
      : [];
  }

  return localStore.promptsByUser.get(user.id) || [];
}

export async function saveUserPrompt(
  user: UserProfile,
  token: string,
  input: Record<string, unknown> | null | undefined,
  env: EnvMap = process.env
): Promise<SavedPromptItem[]> {
  const title =
    (typeof input?.title === 'string' ? input.title.trim() : '') || 'Untitled Master Prompt';
  const shortPrompt = typeof input?.shortPrompt === 'string' ? input.shortPrompt : '';
  const layers =
    input?.layers && typeof input.layers === 'object'
      ? (input.layers as Partial<AnatomyLayersMap>)
      : {};
  const variables =
    input?.variables && typeof input.variables === 'object'
      ? (input.variables as PromptVariablesMap)
      : {};

  const supa = getSupabaseConfig(env);
  if (supa.isConfigured && !token.startsWith('local.')) {
    const res = await fetch(`${supa.url}/rest/v1/user_prompts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: supa.anonKey,
        Authorization: `Bearer ${token}`,
        Prefer: 'return=representation',
      },
      body: JSON.stringify({
        user_id: user.id,
        title: title.slice(0, 140),
        short_prompt: shortPrompt,
        layers,
        variables,
      }),
    });

    const rows = (await res.json().catch(() => null)) as { message?: string } | null;
    if (!res.ok) {
      throw new Error(rows?.message || 'Gagal menyimpan prompt ke database.');
    }
    return listUserPrompts(user, token, env);
  }

  const current = localStore.promptsByUser.get(user.id) || [];
  const nextItem: SavedPromptItem = {
    id: crypto.randomUUID(),
    title: title.slice(0, 140),
    shortPrompt,
    layers,
    variables,
    updatedAt: new Date().toISOString(),
  };
  const updated = [nextItem, ...current];
  localStore.promptsByUser.set(user.id, updated);
  return updated;
}

export async function deleteUserPrompt(
  user: UserProfile,
  token: string,
  promptId: string,
  env: EnvMap = process.env
): Promise<SavedPromptItem[]> {
  const supa = getSupabaseConfig(env);
  if (supa.isConfigured && !token.startsWith('local.')) {
    await fetch(
      `${supa.url}/rest/v1/user_prompts?id=eq.${encodeURIComponent(promptId)}&user_id=eq.${encodeURIComponent(user.id)}`,
      {
        method: 'DELETE',
        headers: {
          apikey: supa.anonKey,
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return listUserPrompts(user, token, env);
  }

  const current = localStore.promptsByUser.get(user.id) || [];
  const updated = current.filter((item) => item.id !== promptId);
  localStore.promptsByUser.set(user.id, updated);
  return updated;
}
