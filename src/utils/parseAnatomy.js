import { LAYER_KEYS } from '../constants/anatomy';

// Mem-parsing & memvalidasi respons teks LLM menjadi objek 6 lapisan.
export function parseAnatomy(text) {
  // Buang code fence ```json ... ``` bila model tetap menambahkannya.
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error('Respons AI bukan JSON yang valid. Silakan coba lagi.');
  }

  const missing = LAYER_KEYS.filter((key) => typeof parsed?.[key] !== 'string');
  if (missing.length) {
    throw new Error(`Respons AI tidak lengkap (field hilang: ${missing.join(', ')}).`);
  }

  return Object.fromEntries(LAYER_KEYS.map((key) => [key, parsed[key].trim()]));
}

