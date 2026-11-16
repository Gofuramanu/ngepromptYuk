import type { AIProviderId, DecryptedUserAIConnection } from '../types/account';
import type { GenerationPayload } from '../types/prompt';

// Router eksekusi multi-provider untuk kredensial AI milik user (BYOK) maupun fallback aplikasi.

const UPSTREAM_TIMEOUT_MS = 45_000;

export interface ProviderMeta {
  label: string;
  defaultModel: string;
  requiresBaseUrl: boolean;
}

export const SUPPORTED_PROVIDERS: Record<AIProviderId, ProviderMeta> = {
  gemini: {
    label: 'Google Gemini API',
    defaultModel: 'gemini-2.5-flash',
    requiresBaseUrl: false,
  },
  anthropic: {
    label: 'Anthropic Claude API',
    defaultModel: 'claude-3-5-sonnet-latest',
    requiresBaseUrl: false,
  },
  openai: {
    label: 'OpenAI API',
    defaultModel: 'gpt-4o-mini',
    requiresBaseUrl: false,
  },
  openrouter: {
    label: 'OpenRouter API',
    defaultModel: 'google/gemini-2.5-flash',
    requiresBaseUrl: false,
  },
  custom: {
    label: 'Custom OpenAI-Compatible Gateway',
    defaultModel: 'gemini-2.5-flash',
    requiresBaseUrl: true,
  },
};

interface UpstreamResponseData {
  choices?: Array<{
    delta?: { content?: string };
    message?: { content?: string | Array<string | { text?: string }> };
    text?: string;
  }>;
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
  content?: Array<{ text?: string }>;
  error?: { message?: string };
}

export function extractOpenAICompatibleContent(rawText: string): {
  content: string;
  data: UpstreamResponseData | null;
} {
  let data: UpstreamResponseData;
  try {
    data = JSON.parse(rawText) as UpstreamResponseData;
  } catch {
    if (rawText.includes('data:')) {
      const assembled = rawText
        .split(/\r?\n/)
        .filter((line) => line.startsWith('data:') && !line.includes('[DONE]'))
        .map((line) => {
          try {
            const chunk = JSON.parse(line.slice(5).trim()) as UpstreamResponseData;
            const msgContent = chunk?.choices?.[0]?.message?.content;
            return (
              chunk?.choices?.[0]?.delta?.content ??
              (typeof msgContent === 'string' ? msgContent : '') ??
              ''
            );
          } catch {
            return '';
          }
        })
        .join('');
      if (assembled.trim()) return { content: assembled, data: null };
    }
    return { content: '', data: null };
  }

  const msgContent = data?.choices?.[0]?.message?.content;
  if (typeof msgContent === 'string' && msgContent.trim()) {
    return { content: msgContent, data };
  }
  if (Array.isArray(msgContent)) {
    const joined = msgContent
      .map((p) => (typeof p === 'string' ? p : p?.text ?? ''))
      .join('');
    if (joined.trim()) return { content: joined, data };
  }

  const textFallback =
    data?.choices?.[0]?.text ??
    data?.candidates?.[0]?.content?.parts?.map((p) => p?.text ?? '').join('') ??
    data?.content?.map?.((p) => p?.text ?? '').join('') ??
    '';

  return { content: typeof textFallback === 'string' ? textFallback : '', data };
}

interface ProviderCallParams {
  apiKey: string;
  model: string;
  payload: GenerationPayload;
}

async function callGeminiProvider({ apiKey, model, payload }: ProviderCallParams): Promise<string> {
  const cleanModel = (model || SUPPORTED_PROVIDERS.gemini.defaultModel)
    .trim()
    .replace(/^models\//, '');
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${cleanModel}:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: payload.systemInstruction }] },
        contents: [{ role: 'user', parts: [{ text: payload.userPrompt }] }],
        generationConfig: {
          temperature: 0.7,
          responseMimeType: 'application/json',
          responseSchema: payload.responseSchema,
        },
      }),
    }
  );

  const rawText = await res.text();
  const { content, data } = extractOpenAICompatibleContent(rawText);
  if (!res.ok) {
    throw new Error(data?.error?.message || `Gemini API mengembalikan status ${res.status}.`);
  }
  return content;
}

async function callAnthropicProvider({
  apiKey,
  model,
  payload,
}: ProviderCallParams): Promise<string> {
  const cleanModel = (model || SUPPORTED_PROVIDERS.anthropic.defaultModel).trim();
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    body: JSON.stringify({
      model: cleanModel,
      max_tokens: 4096,
      temperature: 0.7,
      system: payload.systemInstruction,
      messages: [{ role: 'user', content: payload.userPrompt }],
    }),
  });

  const rawText = await res.text();
  const { content, data } = extractOpenAICompatibleContent(rawText);
  if (!res.ok) {
    throw new Error(data?.error?.message || `Anthropic API mengembalikan status ${res.status}.`);
  }
  return content;
}

interface OpenAICompatibleCallParams extends ProviderCallParams {
  baseUrl: string;
  providerLabel: string;
}

async function callOpenAICompatibleProvider({
  baseUrl,
  apiKey,
  model,
  payload,
  providerLabel,
}: OpenAICompatibleCallParams): Promise<string> {
  const cleanUrl = baseUrl.trim().replace(/\/+$/, '');
  const res = await fetch(`${cleanUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    body: JSON.stringify({
      model: model.trim(),
      stream: false,
      temperature: 0.7,
      messages: [
        { role: 'system', content: payload.systemInstruction },
        { role: 'user', content: payload.userPrompt },
      ],
    }),
  });

  const rawText = await res.text();
  const { content, data } = extractOpenAICompatibleContent(rawText);
  if (!res.ok) {
    throw new Error(data?.error?.message || `${providerLabel} mengembalikan status ${res.status}.`);
  }
  return content;
}

export interface ExecutionResult {
  content: string;
  meta: {
    source: 'user_connection' | 'default_gateway';
    provider: string;
    model: string;
  };
}

/**
 * Mengeksekusi generate/regenerate menggunakan kredensial milik user (BYOK).
 */
export async function executeWithUserConnection(
  connection: DecryptedUserAIConnection,
  payload: GenerationPayload
): Promise<ExecutionResult> {
  const { provider, model, baseUrl, apiKey } = connection;

  let content: string;
  if (provider === 'gemini') {
    content = await callGeminiProvider({ apiKey, model, payload });
  } else if (provider === 'anthropic') {
    content = await callAnthropicProvider({ apiKey, model, payload });
  } else if (provider === 'openai') {
    content = await callOpenAICompatibleProvider({
      baseUrl: 'https://api.openai.com/v1',
      apiKey,
      model: model || SUPPORTED_PROVIDERS.openai.defaultModel,
      payload,
      providerLabel: 'OpenAI API',
    });
  } else if (provider === 'openrouter') {
    content = await callOpenAICompatibleProvider({
      baseUrl: 'https://openrouter.ai/api/v1',
      apiKey,
      model: model || SUPPORTED_PROVIDERS.openrouter.defaultModel,
      payload,
      providerLabel: 'OpenRouter API',
    });
  } else if (provider === 'custom') {
    if (!baseUrl) {
      throw new Error('Base URL wajib diisi untuk provider Custom Gateway.');
    }
    content = await callOpenAICompatibleProvider({
      baseUrl,
      apiKey,
      model: model || SUPPORTED_PROVIDERS.custom.defaultModel,
      payload,
      providerLabel: 'Custom Gateway',
    });
  } else {
    throw new Error(`Provider AI "${String(provider)}" tidak dikenal.`);
  }

  if (!content || !content.trim()) {
    throw new Error(`Provider ${provider} tidak mengembalikan konten.`);
  }

  return {
    content,
    meta: {
      source: 'user_connection',
      provider,
      model,
    },
  };
}

/**
 * Fallback ke gateway/model gratis bawaan aplikasi (hanya dipakai jika user belum login / belum set BYOK).
 */
export async function executeWithDefaultGateway(
  payload: GenerationPayload,
  env: Record<string, string | undefined> = process.env
): Promise<ExecutionResult> {
  const routerUrl = (env.NINEROUTER_BASE_URL || '').trim().replace(/\/+$/, '');
  const routerKey = (env.NINEROUTER_API_KEY || '').trim();
  const routerModel = (env.NINEROUTER_MODEL || 'openrouter/free').trim();

  if (routerUrl && routerKey) {
    const content = await callOpenAICompatibleProvider({
      baseUrl: routerUrl,
      apiKey: routerKey,
      model: routerModel,
      payload,
      providerLabel: 'Default AI Gateway',
    });

    if (!content.trim()) {
      throw new Error('Server gateway tidak mengembalikan konten dari model AI.');
    }

    return {
      content,
      meta: {
        source: 'default_gateway',
        provider: 'default',
        model: routerModel,
      },
    };
  }

  const geminiKey = (env.GEMINI_API_KEY || '').trim();
  const geminiModel = (env.GEMINI_MODEL || 'gemini-2.5-flash').trim();
  if (geminiKey) {
    const content = await callGeminiProvider({
      apiKey: geminiKey,
      model: geminiModel,
      payload,
    });

    if (!content.trim()) {
      throw new Error('Gemini fallback tidak mengembalikan konten.');
    }

    return {
      content,
      meta: {
        source: 'default_gateway',
        provider: 'gemini_fallback',
        model: geminiModel,
      },
    };
  }

  throw new Error(
    'Kredensial AI belum tersedia. Silakan login dan hubungkan API Key AI milik Anda, atau konfigurasi NINEROUTER_BASE_URL / NINEROUTER_API_KEY di server.'
  );
}
