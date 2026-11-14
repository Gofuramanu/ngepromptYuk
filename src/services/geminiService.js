import { parseAnatomy, parseLayerContent } from '../utils/parseAnatomy';
import { getSessionToken } from './accountService';

// Endpoint internal serverless (/api/generate).
// Jika user login & memiliki koneksi AI (BYOK) aktif, backend otomatis memakai kredensial milik user.
// Jika belum login / belum menautkan BYOK, backend memakai fallback gratis bawaan aplikasi.
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
  if (status === 400) return `Permintaan tidak valid (400)${suffix}.`;
  if (status === 401 || status === 403) return `Autentikasi provider AI ditolak${suffix}.`;
  if (status === 404) return `Endpoint atau model tidak ditemukan${suffix}.`;
  if (status === 429) return 'Batas kuota / rate limit tercapai. Silakan coba beberapa saat lagi.';
  if (status >= 500) return `Server / provider AI sedang bermasalah${suffix}. Coba lagi beberapa saat.`;
  return `Terjadi kesalahan tak terduga (HTTP ${status})${suffix}.`;
}

async function requestGeneration(payload, { signal } = {}) {
  const timeoutSignal = AbortSignal.timeout(REQUEST_TIMEOUT_MS);
  const combinedSignal = signal ? AbortSignal.any([signal, timeoutSignal]) : timeoutSignal;

  const headers = { 'Content-Type': 'application/json' };
  const token = getSessionToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let res;
  try {
    res = await fetch(ENDPOINT, {
      method: 'POST',
      headers,
      signal: combinedSignal,
      body: JSON.stringify(payload),
    });
  } catch (err) {
    if (err.name === 'AbortError') throw err; // dibatalkan oleh user/unmount
    if (err.name === 'TimeoutError') throw new ApiError('Permintaan ke AI melebihi batas waktu.', 408);
    throw new ApiError('Tidak dapat terhubung ke server. Pastikan koneksi internet aktif.', 0);
  }

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    const detail = json?.error?.message;
    throw new ApiError(messageForStatus(res.status, detail), res.status);
  }

  const content = json?.content;
  if (!content) {
    throw new ApiError('AI tidak mengembalikan konten. Coba ubah ide prompt Anda.', 422);
  }

  return content;
}

export async function generateAnatomy(shortPrompt, { signal } = {}) {
  const content = await requestGeneration({ shortPrompt }, { signal });
  return parseAnatomy(content);
}

export async function regenerateLayer(targetLayer, shortPrompt, currentLayers, { signal } = {}) {
  const content = await requestGeneration(
    { targetLayer, shortPrompt, currentLayers },
    { signal }
  );
  return parseLayerContent(content, targetLayer);
}
