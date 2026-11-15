// Wrapper localStorage yang aman: tidak crash bila data korup, kuota penuh, atau storage diblokir.
export function loadFromStorage<T extends Record<string, unknown>>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed: unknown = JSON.parse(raw);
    // Merge dengan fallback agar field baru tetap ada walau data lama tersimpan.
    return parsed && typeof parsed === 'object' ? { ...fallback, ...(parsed as Partial<T>) } : fallback;
  } catch (err) {
    console.warn(`[storage] Gagal membaca "${key}", memakai nilai default.`, err);
    return fallback;
  }
}

export function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`[storage] Gagal menyimpan "${key}".`, err);
  }
}
