import dns from 'node:dns'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import { RESPONSE_SCHEMA, SYSTEM_INSTRUCTION } from './src/constants/systemInstruction.js'

// Hindari delay/gagal koneksi IPv6 di Node.js pada Windows saat menghubungi API
dns.setDefaultResultOrder('ipv4first')

const DEFAULT_MODEL = 'gemini-3.5-flash-lite'

// Middleware khusus local dev (npm run dev / npm run preview).
// Jika NINEROUTER_BASE_URL & NINEROUTER_API_KEY diset di .env, request diteruskan ke 9Router.
// Jika belum diset, fallback ke GEMINI_API_KEY langsung agar local dev tetap berjalan mulus.
function localApiPlugin() {
  const handleRequest = (req, res, next) => {
    if (req.url !== '/api/generate' || req.method !== 'POST') return next()

    const env = loadEnv('', process.cwd(), '')
    const chunks = []
    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end', async () => {
      try {
        const parsed = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')
        const shortPrompt = typeof parsed.shortPrompt === 'string' ? parsed.shortPrompt.trim() : ''
        if (!shortPrompt) {
          res.statusCode = 400
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: { message: 'Ide prompt tidak boleh kosong.' } }))
          return
        }

        const routerUrl = (env.NINEROUTER_BASE_URL || '').trim().replace(/\/+$/, '')
        const routerKey = (env.NINEROUTER_API_KEY || '').trim()

        if (routerUrl && routerKey) {
          const model = (env.NINEROUTER_MODEL || DEFAULT_MODEL).trim()
          const upstream = await fetch(`${routerUrl}/chat/completions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${routerKey}`,
            },
            signal: AbortSignal.timeout(45_000),
            body: JSON.stringify({
              model,
              temperature: 0.7,
              response_format: { type: 'json_object' },
              messages: [
                { role: 'system', content: SYSTEM_INSTRUCTION },
                { role: 'user', content: shortPrompt },
              ],
            }),
          })
          const json = await upstream.json().catch(() => null)
          res.statusCode = upstream.status
          res.setHeader('Content-Type', 'application/json')
          res.end(
            upstream.ok
              ? JSON.stringify({ content: json?.choices?.[0]?.message?.content || '' })
              : JSON.stringify({ error: { message: json?.error?.message || `9Router error (${upstream.status})` } })
          )
          return
        }

        // Fallback local dev langsung ke Gemini jika 9Router belum dijalankan secara lokal
        const geminiKey = (env.GEMINI_API_KEY || '').trim()
        const geminiModel = (env.GEMINI_MODEL || DEFAULT_MODEL).trim().replace(/^models\//, '')
        if (!geminiKey) {
          res.statusCode = 401
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: { message: 'NINEROUTER_API_KEY atau GEMINI_API_KEY belum diisi di .env.' } }))
          return
        }

        const upstream = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-goog-api-key': geminiKey },
            signal: AbortSignal.timeout(30_000),
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
              contents: [{ role: 'user', parts: [{ text: shortPrompt }] }],
              generationConfig: {
                temperature: 0.7,
                responseMimeType: 'application/json',
                responseSchema: RESPONSE_SCHEMA,
              },
            }),
          }
        )
        const json = await upstream.json().catch(() => null)
        res.statusCode = upstream.status
        res.setHeader('Content-Type', 'application/json')
        res.end(
          upstream.ok
            ? JSON.stringify({ content: json?.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('') || '' })
            : JSON.stringify({ error: { message: json?.error?.message || `Gemini error (${upstream.status})` } })
        )
      } catch (err) {
        res.statusCode = 502
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ error: { message: err.message || 'Gagal menghubungi AI gateway.' } }))
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
