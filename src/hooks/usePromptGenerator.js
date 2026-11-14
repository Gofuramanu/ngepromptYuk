import { useCallback, useEffect, useRef, useState } from 'react';
import { generateAnatomy, regenerateLayer } from '../services/geminiService';

// Mengelola status loading, error, dan pembatalan request penuh maupun parsial per blok.
export function usePromptGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [regeneratingLayer, setRegeneratingLayer] = useState(null);
  const [layerError, setLayerError] = useState(null);

  const controllerRef = useRef(null);
  const layerControllerRef = useRef(null);

  // Batalkan request yang masih berjalan saat komponen unmount.
  useEffect(() => () => {
    controllerRef.current?.abort();
    layerControllerRef.current?.abort();
  }, []);

  const generate = useCallback(async (shortPrompt) => {
    controllerRef.current?.abort(); // cegah race condition bila tombol ditekan berulang
    layerControllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setIsGenerating(true);
    setError(null);
    setLayerError(null);
    try {
      return await generateAnatomy(shortPrompt, { signal: controller.signal });
    } catch (err) {
      if (err.name !== 'AbortError') setError(err.message);
      return null;
    } finally {
      if (controllerRef.current === controller) setIsGenerating(false);
    }
  }, []);

  const regenerateSingleLayer = useCallback(async (targetLayer, shortPrompt, currentLayers) => {
    layerControllerRef.current?.abort();
    const controller = new AbortController();
    layerControllerRef.current = controller;

    setRegeneratingLayer(targetLayer);
    setLayerError(null);
    try {
      return await regenerateLayer(targetLayer, shortPrompt, currentLayers, {
        signal: controller.signal,
      });
    } catch (err) {
      if (err.name !== 'AbortError') {
        setLayerError({ layer: targetLayer, message: err.message });
      }
      return null;
    } finally {
      if (layerControllerRef.current === controller) setRegeneratingLayer(null);
    }
  }, []);

  const cancel = useCallback(() => {
    controllerRef.current?.abort();
    layerControllerRef.current?.abort();
    setIsGenerating(false);
    setRegeneratingLayer(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);
  const clearLayerError = useCallback(() => setLayerError(null), []);

  return {
    generate,
    regenerateSingleLayer,
    cancel,
    isGenerating,
    regeneratingLayer,
    error,
    layerError,
    clearError,
    clearLayerError,
  };
}
