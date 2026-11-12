import dns from 'node:dns'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// Hindari delay/gagal koneksi IPv6 di Node.js pada Windows saat menghubungi Google API
dns.setDefaultResultOrder('ipv4first')

const DEFAULT_MODEL = 'gemini-3.5-flash-lite'
const FALLBACK_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
  'gemini-3.8-flash',
]

// Plugin dev/preview server untuk meneruskan POST /api/generate ke Gemini API.
// Membaca .env secara dinamis di setiap request (tanpa perlu restart server)
// dan memiliki automatic fallback jika model utama sedang high-demand (503/429) atau 404.
function geminiApiPlugin() {
  const handleRequest = (req, res, next) => {
    if (req.url !== '/api/generate' || req.method !== 'POST') return next()

    const env = loadEnv('', process.cwd(), '')
    const apiKey = (env.GEMINI_API_KEY || '').trim()
    const rawPrimary = (env.GEMINI_MODEL || DEFAULT_MODEL).trim().replace(/^models\//, '')

    if (!apiKey) {
      res.statusCode = 401
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ error: { message: 'GEMINI_API_KEY belum diisi di file .env.' } }))
      return
    }

    const modelsToTry = [rawPrimary, ...FALLBACK_MODELS.filter((m) => m !== rawPrimary)]

    const chunks = []
    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end', async () => {
      try {
        const body = Buffer.concat(chunks).toString('utf8')
        let lastStatus = 502
        let lastText = JSON.stringify({ error: { message: 'Gagal menghubungi server Gemini.' } })

        for (const model of modelsToTry) {
          try {
            const upstreamUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`
            const upstream = await fetch(upstreamUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': apiKey,
              },
              body,
              signal: AbortSignal.timeout(20_000),
            })

            lastStatus = upstream.status
            lastText = await upstream.text()

            // Jika sukses (2xx) atau error client (400/401/403), hentikan loop
            if (upstream.ok || ![404, 429, 503].includes(upstream.status)) {
              break
            }
          } catch (attemptErr) {
            lastStatus = 503
            lastText = JSON.stringify({ error: { message: attemptErr.message || 'Timeout menghubungi model.' } })
          }
        }

        res.statusCode = lastStatus
        res.setHeader('Content-Type', 'application/json')
        res.end(lastText)
      } catch (err) {
        res.statusCode = 502
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ error: { message: err.message || 'Gagal menghubungi server Gemini.' } }))
      }
    })
  }

  return {
    name: 'gemini-api-proxy',
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
  plugins: [react(), geminiApiPlugin()],
  server: { host: true },
  preview: { host: true },
})
