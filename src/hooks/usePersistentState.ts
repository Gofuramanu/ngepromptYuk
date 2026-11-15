import { type Dispatch, type SetStateAction, useEffect, useState } from 'react';
import { loadFromStorage, saveToStorage } from '../utils/storage';

// useState yang otomatis tersinkron ke localStorage.
export function usePersistentState<T extends Record<string, unknown>>(
  key: string,
  fallback: T
): [T, Dispatch<SetStateAction<T>>] {
  // Lazy initializer: localStorage hanya dibaca sekali saat mount, bukan setiap render.
  const [state, setState] = useState<T>(() => loadFromStorage(key, fallback));

  useEffect(() => {
    saveToStorage(key, state);
  }, [key, state]);

  return [state, setState];
}
