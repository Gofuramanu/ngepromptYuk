import dns from 'node:dns'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import { handleAccountAction } from './api/account.js'
import { processGenerateRequest } from './api/generate.js'
import { extractBearerToken } from './src/server/supabaseStore.js'

// Hindari delay/gagal koneksi IPv6 di Node.js pada Windows saat menghubungi API
dns.setDefaultResultOrder('ipv4first')

// Middleware local dev (npm run dev / npm run preview):
// Menjalankan jalur logika yang sama persis dengan Vercel Serverless (/api/generate & /api/account).
function localApiPlugin() {
  const handleRequest = (req, res, next) => {
    if ((req.url !== '/api/generate' && req.url !== '/api/account') || req.method !== 'POST') {
      return next()
    }

    const env = { ...process.env, ...loadEnv('', process.cwd(), '') }
    const chunks = []
    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end', async () => {
      res.setHeader('Content-Type', 'application/json')
      try {
        const body = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')
        const token = extractBearerToken(req)

        const result =
          req.url === '/api/account'
            ? await handleAccountAction(body, token, env)
            : await processGenerateRequest(body, token, env)

        res.statusCode = result.status
        res.end(JSON.stringify(result.data))
      } catch (err) {
        res.statusCode = req.url === '/api/account' ? 400 : 502
        res.end(
          JSON.stringify({
            error: { message: err.message || 'Gagal memproses permintaan di local server.' },
          })
        )
      }
    })
  }

  return {
    name: 'local-api-proxy',
    configureServer(server) {
      server.middlewares.use(handleRequest)
    },
    configurePreviewServer(server) {
      server.middlewares.use(handleRequest)
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), localApiPlugin()],
  server: { host: true },
  preview: { host: true },
})
