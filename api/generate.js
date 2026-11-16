// Vercel Serverless Function: POST /api/generate
// Menentukan jalur eksekusi AI secara otomatis:
// 1. Jika user login & memiliki koneksi AI aktif (BYOK) -> dekripsi API Key milik user di server & panggil provider pilihan user.
// 2. Jika belum login / belum menautkan BYOK -> fallback ke gateway/model gratis bawaan aplikasi.

import { buildGenerationPayload } from '../src/constants/systemInstruction.js';
import {
  executeWithDefaultGateway,
  executeWithUserConnection,
} from '../src/server/providerRouter.js';
import { extractBearerToken, getDecryptedUserConnection } from '../src/server/supabaseStore.js';

export async function processGenerateRequest(body, token, env = process.env) {
  const payload = buildGenerationPayload(body);
  if (payload.error) {
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

async function parseRequestBody(req) {
  if (req.body && typeof req.body === 'object') {
    return req.body;
  }
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return new Promise((resolve) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => {
      try {
        const text = Buffer.concat(chunks).toString('utf8');
        resolve(text ? JSON.parse(text) : {});
      } catch {
        resolve({});
      }
    });
    req.on('error', () => resolve({}));
  });
}

function sendJson(res, statusCode, data) {
  if (typeof res.status === 'function' && typeof res.json === 'function') {
    res.status(statusCode).json(data);
  } else {
    res.statusCode = statusCode;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
  }
}

export default async function handler(req, res) {
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
    if (err?.name === 'TimeoutError') {
      sendJson(res, 504, {
        error: { message: 'Permintaan ke provider AI melebihi batas waktu.' },
      });
      return;
    }
    sendJson(res, 502, {
      error: { message: err?.message || 'Gagal menghubungi provider AI.' },
    });
  }
}
