import { LAYER_KEYS } from '../constants/anatomy';
import type { AnatomyLayerKey, AnatomyLayersMap } from '../types/prompt';

function stripCodeFences(text: string): string {
  return text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
}

// Mem-parsing & memvalidasi respons teks LLM menjadi objek 6 lapisan.
export function parseAnatomy(text: string): AnatomyLayersMap {
  const cleaned = stripCodeFences(text);

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(cleaned) as Record<string, unknown>;
  } catch {
    throw new Error('Respons AI bukan JSON yang valid. Silakan coba lagi.');
  }

  const missing = LAYER_KEYS.filter((key) => typeof parsed?.[key] !== 'string');
  if (missing.length) {
    throw new Error(`Respons AI tidak lengkap (field hilang: ${missing.join(', ')}).`);
  }

  return Object.fromEntries(
    LAYER_KEYS.map((key) => [key, (parsed[key] as string).trim()])
  ) as AnatomyLayersMap;
}

// Mem-parsing respons AI untuk regenerasi satu lapisan tertentu.
export function parseLayerContent(text: string, targetLayer: AnatomyLayerKey): string {
  if (!LAYER_KEYS.includes(targetLayer)) {
    throw new Error(`Lapisan anatomi tidak dikenal: ${targetLayer}`);
  }

  const cleaned = stripCodeFences(text);
  if (!cleaned) {
    throw new Error('Respons AI untuk regenerasi blok kosong. Silakan coba lagi.');
  }

  try {
    const parsed: unknown = JSON.parse(cleaned);
    if (typeof parsed === 'string') return parsed.trim();
    if (parsed && typeof parsed === 'object') {
      const record = parsed as Record<string, unknown>;
      if (typeof record[targetLayer] === 'string') return (record[targetLayer] as string).trim();
      if (typeof record.content === 'string') return record.content.trim();
    }
  } catch {
    // Jika model mengembalikan teks langsung (bukan JSON), gunakan apa adanya.
  }

  return cleaned;
}
