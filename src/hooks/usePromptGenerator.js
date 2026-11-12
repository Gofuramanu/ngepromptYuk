import { useCallback, useEffect, useRef, useState } from 'react';
import { generateAnatomy } from '../services/geminiService';

// Mengelola status loading, error, dan pembatalan request ke AI.
export function usePromptGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const controllerRef = useRef(null);

  // Batalkan request yang masih berjalan saat komponen unmount.
  useEffect(() => () => controllerRef.current?.abort(), []);

  const generate = useCallback(async (shortPrompt) => {
    controllerRef.current?.abort(); // cegah race condition bila tombol ditekan berulang
    const controller = new AbortController();
    controllerRef.current = controller;

    setIsGenerating(true);
    setError(null);
    try {
      return await generateAnatomy(shortPrompt, { signal: controller.signal });
    } catch (err) {
      if (err.name !== 'AbortError') setError(err.message);
      return null;
    } finally {
      if (controllerRef.current === controller) setIsGenerating(false);
    }
  }, []);

  const cancel = useCallback(() => {
    controllerRef.current?.abort();
    setIsGenerating(false);
  }, []);

  return { generate, cancel, isGenerating, error, clearError: () => setError(null) };
}

