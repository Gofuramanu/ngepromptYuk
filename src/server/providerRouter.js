// Router eksekusi multi-provider untuk kredensial AI milik user (BYOK) maupun fallback aplikasi.

const UPSTREAM_TIMEOUT_MS = 45_000;

export const SUPPORTED_PROVIDERS = {
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

export function extractOpenAICompatibleContent(rawText) {
  let data;
  try {
    data = JSON.parse(rawText);
  } catch {
    if (rawText.includes('data:')) {
      const assembled = rawText
        .split(/\r?\n/)
        .filter((line) => line.startsWith('data:') && !line.includes('[DONE]'))
        .map((line) => {
          try {
            const chunk = JSON.parse(line.slice(5).trim());
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

async function callGeminiProvider({ apiKey, model, payload }) {
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

async function callAnthropicProvider({ apiKey, model, payload }) {
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

async function callOpenAICompatibleProvider({ baseUrl, apiKey, model, payload, providerLabel }) {
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

/**
 * Mengeksekusi generate/regenerate menggunakan kredensial milik user (BYOK).
 */
export async function executeWithUserConnection(connection, payload) {
  const { provider, model, baseUrl, apiKey } = connection;

  let content;
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
export async function executeWithDefaultGateway(payload, env = process.env) {
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
