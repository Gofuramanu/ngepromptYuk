import { LAYER_KEYS } from '../constants/anatomy';

function stripCodeFences(text) {
  return text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
}

// Mem-parsing & memvalidasi respons teks LLM menjadi objek 6 lapisan.
export function parseAnatomy(text) {
  const cleaned = stripCodeFences(text);

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

// Mem-parsing respons AI untuk regenerasi satu lapisan tertentu.
export function parseLayerContent(text, targetLayer) {
  if (!LAYER_KEYS.includes(targetLayer)) {
    throw new Error(`Lapisan anatomi tidak dikenal: ${targetLayer}`);
  }

  const cleaned = stripCodeFences(text);
  if (!cleaned) {
    throw new Error('Respons AI untuk regenerasi blok kosong. Silakan coba lagi.');
  }

  try {
    const parsed = JSON.parse(cleaned);
    if (typeof parsed === 'string') return parsed.trim();
    if (typeof parsed?.[targetLayer] === 'string') return parsed[targetLayer].trim();
    if (typeof parsed?.content === 'string') return parsed.content.trim();
  } catch {
    // Jika model mengembalikan teks langsung (bukan JSON), gunakan apa adanya.
  }

  return cleaned;
}

