import dns from 'node:dns';
import type { IncomingMessage, ServerResponse } from 'node:http';
import react from '@vitejs/plugin-react';
import { type Plugin, defineConfig, loadEnv } from 'vite';
import { handleAccountAction } from './api/account.ts';
import { processGenerateRequest } from './api/generate.ts';
import { extractBearerToken } from './src/server/supabaseStore.ts';

// Hindari delay/gagal koneksi IPv6 di Node.js pada Windows saat menghubungi API
dns.setDefaultResultOrder('ipv4first');

// Middleware local dev (npm run dev / npm run preview):
// Menjalankan jalur logika yang sama persis dengan Vercel Serverless (/api/generate & /api/account).
function localApiPlugin(): Plugin {
  const handleRequest = (
    req: IncomingMessage,
    res: ServerResponse,
    next: (err?: unknown) => void
  ) => {
    if ((req.url !== '/api/generate' && req.url !== '/api/account') || req.method !== 'POST') {
      next();
      return;
    }

    const env = { ...process.env, ...loadEnv('', process.cwd(), '') };
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', async () => {
      res.setHeader('Content-Type', 'application/json');
      try {
        const body = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}') as Record<
          string,
          unknown
        >;
        const token = extractBearerToken(req);

        const result =
          req.url === '/api/account'
            ? await handleAccountAction(body, token, env)
            : await processGenerateRequest(body, token, env);

        res.statusCode = result.status;
        res.end(JSON.stringify(result.data));
      } catch (err) {
        const error = err as Error;
        res.statusCode = req.url === '/api/account' ? 400 : 502;
        res.end(
          JSON.stringify({
            error: { message: error.message || 'Gagal memproses permintaan di local server.' },
          })
        );
      }
    });
  };

  return {
    name: 'local-api-proxy',
    configureServer(server) {
      server.middlewares.use(handleRequest);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handleRequest);
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), localApiPlugin()],
  server: { host: true },
  preview: { host: true },
});
