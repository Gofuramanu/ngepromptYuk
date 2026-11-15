// Vercel Serverless Function: POST /api/generate
// Menentukan jalur eksekusi AI secara otomatis:
// 1. Jika user login & memiliki koneksi AI aktif (BYOK) -> dekripsi API Key milik user di server & panggil provider pilihan user.
// 2. Jika belum login / belum menautkan BYOK -> fallback ke gateway/model gratis bawaan aplikasi.

import { buildGenerationPayload } from '../src/constants/systemInstruction.ts';
import {
  executeWithDefaultGateway,
  executeWithUserConnection,
} from '../src/server/providerRouter.ts';
import { extractBearerToken, getDecryptedUserConnection } from '../src/server/supabaseStore.ts';
import type { ServerlessRequest, ServerlessResponse } from './account.ts';

export async function processGenerateRequest(
  body: Record<string, unknown> | null | undefined,
  token: string,
  env: Record<string, string | undefined> = process.env
): Promise<{ status: number; data: Record<string, unknown> }> {
  const payload = buildGenerationPayload(body);
  if ('error' in payload) {
    return {
      status: payload.error.status,
      data: { error: { message: payload.error.message } },
    };
  }

  // 1. Cek apakah request berasal dari user yang login dengan koneksi AI pribadi (BYOK) aktif
  const userConnection = token ? await getDecryptedUserConnection(token, env) : null;

  if (userConnection) {
    const result = await executeWithUserConnection(userConnection, payload);
    return {
      status: 200,
      data: {
        content: result.content,
        meta: result.meta,
      },
    };
  }

  // 2. Fallback ke model gratis bawaan aplikasi (hanya bila user belum login / belum punya BYOK)
  const result = await executeWithDefaultGateway(payload, env);
  return {
    status: 200,
    data: {
      content: result.content,
      meta: result.meta,
    },
  };
}

export default async function handler(
  req: ServerlessRequest,
  res: ServerlessResponse
): Promise<void> {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: { message: 'Method not allowed. Gunakan POST.' } });
    return;
  }

  try {
    const token = extractBearerToken(req);
    const result = await processGenerateRequest(req.body || {}, token, process.env);
    res.status(result.status).json(result.data);
  } catch (err) {
    const error = err as Error;
    if (error.name === 'TimeoutError') {
      res.status(504).json({
        error: { message: 'Permintaan ke provider AI melebihi batas waktu.' },
      });
      return;
    }
    res.status(502).json({
      error: { message: error.message || 'Gagal menghubungi provider AI.' },
    });
  }
}
