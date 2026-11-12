import { RESPONSE_SCHEMA, SYSTEM_INSTRUCTION } from '../constants/systemInstruction';
import { parseAnatomy } from '../utils/parseAnatomy';

// Endpoint lokal. Middleware Vite (lihat vite.config.js) meneruskannya ke Gemini dan
// menyisipkan API key di sisi server — key TIDAK PERNAH masuk ke bundle browser.
const ENDPOINT = '/api/generate';
const REQUEST_TIMEOUT_MS = 45_000;

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

function messageForStatus(status, detail) {
  const suffix = detail ? ` (${detail})` : '';
  if (status === 400) return `Permintaan ditolak oleh Gemini (400)${suffix}.`;
  if (status === 401 || status === 403) return `API key Gemini tidak valid atau belum diset di file .env${suffix}.`;
  if (status === 404) return `Model Gemini tidak ditemukan. Periksa GEMINI_MODEL di file .env${suffix}.`;
  if (status === 429) return 'Kuota / rate limit Gemini terlampaui. Tunggu sebentar lalu coba lagi.';
  if (status >= 500) return `Server Gemini sedang bermasalah${suffix}. Coba lagi beberapa saat.`;
  return `Terjadi kesalahan tak terduga (HTTP ${status})${suffix}.`;
}

export async function generateAnatomy(shortPrompt, { signal } = {}) {
  const timeoutSignal = AbortSignal.timeout(REQUEST_TIMEOUT_MS);
  const combinedSignal = signal ? AbortSignal.any([signal, timeoutSignal]) : timeoutSignal;

  let res;
  try {
    res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: combinedSignal,
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
        contents: [{ role: 'user', parts: [{ text: shortPrompt }] }],
        generationConfig: {
          temperature: 0.7,
          responseMimeType: 'application/json',
          responseSchema: RESPONSE_SCHEMA,
        },
      }),
    });
  } catch (err) {
    if (err.name === 'AbortError') throw err; // dibatalkan oleh user/unmount
    if (err.name === 'TimeoutError') throw new ApiError('Permintaan ke AI melebihi batas waktu.', 408);
    throw new ApiError('Tidak dapat terhubung ke server. Pastikan dev server berjalan & koneksi internet aktif.', 0);
  }

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    const detail = json?.error?.message;
    throw new ApiError(messageForStatus(res.status, detail), res.status);
  }

  const blockReason = json?.promptFeedback?.blockReason;
  if (blockReason) throw new ApiError(`Prompt diblokir oleh filter keamanan (${blockReason}).`, 422);

  const text = json?.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('');
  if (!text) throw new ApiError('AI tidak mengembalikan konten. Coba ubah ide prompt Anda.', 422);

  return parseAnatomy(text);
}
