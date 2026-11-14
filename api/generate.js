// Vercel Serverless Function: POST /api/generate
// Menjembatani frontend ke 9Router AI API Gateway secara aman (Zero Client Leak).
// Mendukung generasi penuh (6 lapisan) maupun regenerasi parsial per blok.

import { buildGenerationPayload } from '../src/constants/systemInstruction.js';

const UPSTREAM_TIMEOUT_MS = 45_000;

function extractContent(rawText) {
  let data;
  try {
    data = JSON.parse(rawText);
  } catch {
    // Jika 9Router mengembalikan format SSE (data: {...}), gabungkan seluruh delta.content
    if (rawText.includes('data:')) {
      const assembled = rawText
        .split(/\r?\n/)
        .filter((line) => line.startsWith('data:') && !line.includes('[DONE]'))
        .map((line) => {
          try {
            const chunk = JSON.parse(line.slice(5).trim());
            return chunk?.choices?.[0]?.delta?.content ?? chunk?.choices?.[0]?.message?.content ?? '';
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
    const joined = msgContent.map((p) => (typeof p === 'string' ? p : p?.text ?? '')).join('');
    if (joined.trim()) return { content: joined, data };
  }

  const textFallback =
    data?.choices?.[0]?.text ??
    data?.candidates?.[0]?.content?.parts?.map((p) => p?.text ?? '').join('') ??
    '';

  return { content: typeof textFallback === 'string' ? textFallback : '', data };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: { message: 'Method not allowed. Gunakan POST.' } });
  }

  const baseUrl = (process.env.NINEROUTER_BASE_URL || '').trim().replace(/\/+$/, '');
  const apiKey = (process.env.NINEROUTER_API_KEY || '').trim();
  const model = (process.env.NINEROUTER_MODEL || 'gemini-3.5-flash-lite').trim();

  if (!baseUrl || !apiKey) {
    return res.status(500).json({
      error: { message: 'Konfigurasi server 9Router (NINEROUTER_BASE_URL / NINEROUTER_API_KEY) belum diset.' },
    });
  }

  const payload = buildGenerationPayload(req.body);
  if (payload.error) {
    return res.status(payload.error.status).json({ error: { message: payload.error.message } });
  }

  try {
    const upstream = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
      body: JSON.stringify({
        model,
        stream: false,
        temperature: 0.7,
        messages: [
          { role: 'system', content: payload.systemInstruction },
          { role: 'user', content: payload.userPrompt },
        ],
      }),
    });

    const rawText = await upstream.text();
    const { content, data } = extractContent(rawText);

    if (!upstream.ok) {
      const message = data?.error?.message || `9Router mengembalikan status ${upstream.status}.`;
      return res.status(upstream.status).json({ error: { message } });
    }

    if (!content) {
      const preview = rawText.replace(/\s+/g, ' ').slice(0, 140);
      return res.status(502).json({
        error: {
          message: `9Router tidak mengembalikan konten (HTTP ${upstream.status}: ${preview || 'kosong'}).`,
        },
      });
    }

    return res.status(200).json({ content });
  } catch (err) {
    if (err.name === 'TimeoutError') {
      return res.status(504).json({ error: { message: 'Permintaan ke 9Router melebihi batas waktu.' } });
    }
    return res.status(502).json({
      error: { message: err.message || 'Gagal menghubungi 9Router AI API Gateway.' },
    });
  }
}
