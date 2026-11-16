// Vercel Serverless Function: POST /api/generate
// Menentukan jalur eksekusi AI secara otomatis:
// 1. Jika user login & memiliki koneksi AI aktif (BYOK) -> dekripsi API Key milik user di server & panggil provider pilihan user.
// 2. Jika belum login / belum menautkan BYOK -> fallback ke gateway/model gratis bawaan aplikasi.

import { buildGenerationPayload } from '../src/constants/systemInstruction';
import {
  executeWithDefaultGateway,
  executeWithUserConnection,
} from '../src/server/providerRouter';
import { extractBearerToken, getDecryptedUserConnection } from '../src/server/supabaseStore';
import type { ServerlessRequest, ServerlessResponse } from './account';

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

async function parseRequestBody(req: ServerlessRequest): Promise<Record<string, unknown>> {
  if (req.body && typeof req.body === 'object') {
    return req.body as Record<string, unknown>;
  }
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body) as Record<string, unknown>;
    } catch {
      return {};
    }
  }
  return new Promise((resolve) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => {
      try {
        const text = Buffer.concat(chunks).toString('utf8');
        resolve(text ? (JSON.parse(text) as Record<string, unknown>) : {});
      } catch {
        resolve({});
      }
    });
    req.on('error', () => resolve({}));
  });
}

function sendJson(res: ServerlessResponse, statusCode: number, data: unknown): void {
  if (typeof res.status === 'function' && typeof res.json === 'function') {
    res.status(statusCode).json(data);
  } else {
    res.statusCode = statusCode;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
  }
}

export default async function handler(
  req: ServerlessRequest,
  res: ServerlessResponse
): Promise<void> {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    sendJson(res, 405, { error: { message: 'Method not allowed. Gunakan POST.' } });
    return;
  }

  try {
    const token = extractBearerToken(req);
    const body = await parseRequestBody(req);
    const result = await processGenerateRequest(body, token, process.env);
    sendJson(res, result.status, result.data);
  } catch (err) {
    const error = err as Error;
    if (error.name === 'TimeoutError') {
      sendJson(res, 504, {
        error: { message: 'Permintaan ke provider AI melebihi batas waktu.' },
      });
      return;
    }
    sendJson(res, 502, {
      error: { message: error.message || 'Gagal menghubungi provider AI.' },
    });
  }
}
