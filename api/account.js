// Vercel Serverless Function: POST /api/account
// Mengelola Auth per-user, penyimpanan Master Prompt terisolasi, dan enkripsi kredensial AI (BYOK).

import {
  authenticateUser,
  deleteUserConnection,
  deleteUserPrompt,
  extractBearerToken,
  getUserConnectionPublic,
  listUserPrompts,
  resolveAuthenticatedUser,
  saveUserConnection,
  saveUserPrompt,
} from '../src/server/supabaseStore.js';

export async function handleAccountAction(body, token, env = process.env) {
  const action = typeof body?.action === 'string' ? body.action.trim() : '';

  if (action === 'oauth_url') {
    const provider = body?.provider === 'github' ? 'github' : 'google';
    const supaUrl = (env.SUPABASE_URL || env.VITE_SUPABASE_URL || '').trim().replace(/\/+$/, '');
    const redirectTo = typeof body?.redirectTo === 'string' ? body.redirectTo.trim() : '';
    if (!supaUrl) {
      return {
        status: 400,
        data: {
          error: {
            message: `Untuk memakai Continue with ${provider === 'google' ? 'Google' : 'GitHub'}, silakan isi SUPABASE_URL di Environment Variables atau masuk menggunakan Email & Password di bawah.`,
          },
        },
      };
    }
    const url = `${supaUrl}/auth/v1/authorize?provider=${provider}${
      redirectTo ? `&redirect_to=${encodeURIComponent(redirectTo)}` : ''
    }`;
    return { status: 200, data: { url } };
  }

  if (action === 'signup' || action === 'login') {
    const authResult = await authenticateUser(
      { mode: action, email: body?.email, password: body?.password },
      env
    );
    const connection = await getUserConnectionPublic(authResult.user, authResult.accessToken, env);
    const prompts = await listUserPrompts(authResult.user, authResult.accessToken, env);
    return {
      status: 200,
      data: {
        user: authResult.user,
        accessToken: authResult.accessToken,
        storageMode: authResult.storageMode,
        connection,
        prompts,
      },
    };
  }

  const user = await resolveAuthenticatedUser(token, env);
  if (!user) {
    return {
      status: 401,
      data: { error: { message: 'Sesi login tidak valid atau telah berakhir. Silakan Sign In kembali.' } },
    };
  }

  if (action === 'session') {
    const connection = await getUserConnectionPublic(user, token, env);
    const prompts = await listUserPrompts(user, token, env);
    return { status: 200, data: { user, connection, prompts } };
  }

  if (action === 'save_connection') {
    const connection = await saveUserConnection(user, token, body?.connection, env);
    return { status: 200, data: { connection } };
  }

  if (action === 'delete_connection') {
    await deleteUserConnection(user, token, env);
    return { status: 200, data: { connection: null } };
  }

  if (action === 'save_prompt') {
    const prompts = await saveUserPrompt(user, token, body?.prompt, env);
    return { status: 200, data: { prompts } };
  }

  if (action === 'delete_prompt') {
    const prompts = await deleteUserPrompt(user, token, body?.promptId, env);
    return { status: 200, data: { prompts } };
  }

  return {
    status: 400,
    data: { error: { message: `Aksi "${action}" tidak dikenali.` } },
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: { message: 'Method not allowed. Gunakan POST.' } });
  }

  try {
    const token = extractBearerToken(req);
    const result = await handleAccountAction(req.body || {}, token, process.env);
    return res.status(result.status).json(result.data);
  } catch (err) {
    return res.status(400).json({
      error: { message: err.message || 'Gagal memproses permintaan akun.' },
    });
  }
}
