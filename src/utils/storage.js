// Wrapper localStorage yang aman: tidak crash bila data korup, kuota penuh, atau storage diblokir.
export function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    // Merge dengan fallback agar field baru tetap ada walau data lama tersimpan.
    return parsed && typeof parsed === 'object' ? { ...fallback, ...parsed } : fallback;
  } catch (err) {
    console.warn(`[storage] Gagal membaca "${key}", memakai nilai default.`, err);
    return fallback;
  }
}

export function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`[storage] Gagal menyimpan "${key}".`, err);
  }
}

