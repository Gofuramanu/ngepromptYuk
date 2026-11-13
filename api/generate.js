// Vercel Serverless Function: POST /api/generate
// Menjembatani frontend ke 9Router AI API Gateway secara aman (Zero Client Leak).
// Manajemen kuota, antrean, rate limit (429), dan fallback model ditangani terpusat oleh 9Router.

const MAX_PROMPT_LENGTH = 4000;
const UPSTREAM_TIMEOUT_MS = 45_000;

const SYSTEM_INSTRUCTION = `You are "Prompt Craftsman", an expert prompt engineer.
Transform the user's short idea into a structured Master Prompt following the 6-layer Claude prompt anatomy:

1. role      - Who the AI should act as: seniority, domain expertise, and a guiding priority.
2. task      - The concrete deliverable, scope, and how it should end.
3. context   - Everything known: product/subject, audience, team, resources, constraints, key risks. Use "-" bullet lines.
4. reasoning - Why the task matters and what makes the output high quality / actionable.
5. stop      - "Only stop when:" followed by measurable completion criteria as "-" bullet lines.
6. output    - Exact presentation format, including per-item fields as "-" bullet lines.

Rules:
- Write every field in the SAME language as the user's idea.
- Infer reasonable, specific details when the idea is vague; never leave a field empty.
- Each field is plain text (newlines allowed), no markdown headings.
- Respond ONLY with a valid JSON object containing exact keys: "role", "task", "context", "reasoning", "stop", "output".`;

function extractContent(rawText) {
  let data;
  try {
    data = JSON.parse(rawText);
  } catch {
    // Jika 9Router mengembalikan format SSE (data: {...}), gabungkan seluruh delta.content
    if (rawText.includes('data:')) {
      const assembled = rawText
        .split(/\r?\n/)
        .filter((line) => line.startsWith('data:') && !line.includes('[DONE]'))
        .map((line) => {
          try {
            const chunk = JSON.parse(line.slice(5).trim());
            return chunk?.choices?.[0]?.delta?.content ?? chunk?.choices?.[0]?.message?.content ?? '';
          } catch {
            return '';
          }
        })
        .join('');
      if (assembled.trim()) return { content: assembled, data: null };
    }
    return { content: '', data: null };
  }

  const msgContent = data?.choices?.[0]?.message?.content;
  if (typeof msgContent === 'string' && msgContent.trim()) {
    return { content: msgContent, data };
  }
  if (Array.isArray(msgContent)) {
    const joined = msgContent.map((p) => (typeof p === 'string' ? p : p?.text ?? '')).join('');
    if (joined.trim()) return { content: joined, data };
  }

  const textFallback =
    data?.choices?.[0]?.text ??
    data?.candidates?.[0]?.content?.parts?.map((p) => p?.text ?? '').join('') ??
    '';

  return { content: typeof textFallback === 'string' ? textFallback : '', data };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: { message: 'Method not allowed. Gunakan POST.' } });
  }

  const baseUrl = (process.env.NINEROUTER_BASE_URL || '').trim().replace(/\/+$/, '');
  const apiKey = (process.env.NINEROUTER_API_KEY || '').trim();
  const model = (process.env.NINEROUTER_MODEL || 'gemini-3.5-flash-lite').trim();

  if (!baseUrl || !apiKey) {
    return res.status(500).json({
      error: { message: 'Konfigurasi server 9Router (NINEROUTER_BASE_URL / NINEROUTER_API_KEY) belum diset.' },
    });
  }

  const shortPrompt = typeof req.body?.shortPrompt === 'string' ? req.body.shortPrompt.trim() : '';
  if (!shortPrompt) {
    return res.status(400).json({ error: { message: 'Ide prompt tidak boleh kosong.' } });
  }
  if (shortPrompt.length > MAX_PROMPT_LENGTH) {
    return res.status(400).json({
      error: { message: `Ide prompt melebihi batas maksimal ${MAX_PROMPT_LENGTH} karakter.` },
    });
  }

  try {
    const upstream = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
      body: JSON.stringify({
        model,
        stream: false,
        temperature: 0.7,
        messages: [
          { role: 'system', content: SYSTEM_INSTRUCTION },
          { role: 'user', content: shortPrompt },
        ],
      }),
    });

    const rawText = await upstream.text();
    const { content, data } = extractContent(rawText);

    if (!upstream.ok) {
      const message = data?.error?.message || `9Router mengembalikan status ${upstream.status}.`;
      return res.status(upstream.status).json({ error: { message } });
    }

    if (!content) {
      const preview = rawText.replace(/\s+/g, ' ').slice(0, 140);
      return res.status(502).json({
        error: {
          message: `9Router tidak mengembalikan konten (HTTP ${upstream.status}: ${preview || 'kosong'}).`,
        },
      });
    }

    return res.status(200).json({ content });
  } catch (err) {
    if (err.name === 'TimeoutError') {
      return res.status(504).json({ error: { message: 'Permintaan ke 9Router melebihi batas waktu.' } });
    }
    return res.status(502).json({
      error: { message: err.message || 'Gagal menghubungi 9Router AI API Gateway.' },
    });
  }
}
