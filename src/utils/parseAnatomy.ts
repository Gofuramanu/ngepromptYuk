import { LAYER_KEYS } from '../constants/anatomy';
import type { AnatomyLayerKey, AnatomyLayersMap } from '../types/prompt';

function stripThinkingAndFences(text: string): string {
  return text
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();
}

function extractJsonObjectCandidate(text: string): string {
  const cleaned = stripThinkingAndFences(text);
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    return cleaned.slice(firstBrace, lastBrace + 1);
  }
  return cleaned;
}

function normalizeLayerValue(value: unknown): string | null {
  if (typeof value === 'string') return value.trim();
  if (Array.isArray(value)) {
    const joined = value
      .map((item) => (typeof item === 'string' ? item.trim() : String(item ?? '').trim()))
      .filter(Boolean)
      .join('\n');
    return joined || null;
  }
  return null;
}

// Mem-parsing & memvalidasi respons teks LLM menjadi objek 6 lapisan.
export function parseAnatomy(text: string): AnatomyLayersMap {
  const cleaned = stripThinkingAndFences(text);

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(cleaned) as Record<string, unknown>;
  } catch {
    const candidate = extractJsonObjectCandidate(cleaned);
    try {
      parsed = JSON.parse(candidate) as Record<string, unknown>;
    } catch {
      throw new Error('Respons AI bukan JSON yang valid. Silakan coba lagi.');
    }
  }

  const normalizedEntries: Array<[AnatomyLayerKey, string]> = [];
  const missing: AnatomyLayerKey[] = [];

  for (const key of LAYER_KEYS) {
    const normalized = normalizeLayerValue(parsed?.[key]);
    if (normalized === null) {
      missing.push(key);
    } else {
      normalizedEntries.push([key, normalized]);
    }
  }

  if (missing.length) {
    throw new Error(`Respons AI tidak lengkap (field hilang: ${missing.join(', ')}).`);
  }

  return Object.fromEntries(normalizedEntries) as AnatomyLayersMap;
}

// Mem-parsing respons AI untuk regenerasi satu lapisan tertentu.
export function parseLayerContent(text: string, targetLayer: AnatomyLayerKey): string {
  if (!LAYER_KEYS.includes(targetLayer)) {
    throw new Error(`Lapisan anatomi tidak dikenal: ${targetLayer}`);
  }

  const cleaned = stripThinkingAndFences(text);
  if (!cleaned) {
    throw new Error('Respons AI untuk regenerasi blok kosong. Silakan coba lagi.');
  }

  const candidate = extractJsonObjectCandidate(cleaned);
  for (const raw of [cleaned, candidate]) {
    try {
      const parsed: unknown = JSON.parse(raw);
      if (typeof parsed === 'string') return parsed.trim();
      if (parsed && typeof parsed === 'object') {
        const record = parsed as Record<string, unknown>;
        const targetVal = normalizeLayerValue(record[targetLayer]);
        if (targetVal !== null) return targetVal;
        const contentVal = normalizeLayerValue(record.content);
        if (contentVal !== null) return contentVal;
      }
    } catch {
      // Lanjutkan ke kandidat berikutnya atau gunakan teks langsung
    }
  }

  return cleaned;
}
