// Utilitas deteksi dan substitusi variabel placeholder ([...] & {{...}})

const PLACEHOLDER_REGEX = /\{\{\s*([^{}\n]+?)\s*\}\}|\[([^[\]\n]+?)\](?!\s*\()/g;
const MAX_VARIABLE_LENGTH = 60;

function normalizePlaceholderName(mustacheGroup, bracketGroup) {
  const raw = (mustacheGroup ?? bracketGroup ?? '').trim();
  if (!raw || raw.length > MAX_VARIABLE_LENGTH) return null;

  // Abaikan checkbox Markdown ([ ], [x], [-]) dan sitasi angka murni ([1], [1, 2])
  if (/^[xX\-*✓✔]$/.test(raw) || /^\d+(?:[\s,-]+\d+)*$/.test(raw)) {
    return null;
  }

  return raw;
}

/**
 * Mengekstrak daftar nama variabel unik dari teks blok secara deterministik.
 * Urutan mengikuti kemunculan pertama agar form stabil saat pengguna mengetik.
 */
export function extractVariables(text) {
  if (typeof text !== 'string' || !text) return [];

  const seen = new Set();
  const result = [];
  const regex = new RegExp(PLACEHOLDER_REGEX.source, 'g');

  let match;
  while ((match = regex.exec(text)) !== null) {
    const name = normalizePlaceholderName(match[1], match[2]);
    if (name && !seen.has(name)) {
      seen.add(name);
      result.push(name);
    }
  }

  return result;
}

/**
 * Mengganti placeholder pada teks dengan nilai variabel yang sudah diisi.
 * Placeholder yang nilainya kosong tetap dipertahankan agar tidak hilang.
 */
export function applyVariables(text, variables = {}) {
  if (typeof text !== 'string' || !text || !variables) return text || '';

  return text.replace(PLACEHOLDER_REGEX, (fullMatch, mustacheGroup, bracketGroup) => {
    const name = normalizePlaceholderName(mustacheGroup, bracketGroup);
    if (!name) return fullMatch;

    const value = variables[name];
    return typeof value === 'string' && value.length > 0 ? value : fullMatch;
  });
}
