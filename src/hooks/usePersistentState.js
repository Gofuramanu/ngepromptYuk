import { useEffect, useState } from 'react';
import { loadFromStorage, saveToStorage } from '../utils/storage';

// useState yang otomatis tersinkron ke localStorage.
export function usePersistentState(key, fallback) {
  // Lazy initializer: localStorage hanya dibaca sekali saat mount, bukan setiap render.
  const [state, setState] = useState(() => loadFromStorage(key, fallback));

  useEffect(() => {
    saveToStorage(key, state);
  }, [key, state]);

  return [state, setState];
}

