import { useCallback, useEffect, useRef, useState } from 'react';
import { generateAnatomy, regenerateLayer } from '../services/geminiService';
import type { AnatomyLayerKey, AnatomyLayersMap, LayerErrorState } from '../types/prompt';

// Mengelola status loading, error, dan pembatalan request penuh maupun parsial per blok.
export function usePromptGenerator() {
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [regeneratingLayer, setRegeneratingLayer] = useState<AnatomyLayerKey | null>(null);
  const [layerError, setLayerError] = useState<LayerErrorState | null>(null);

  const controllerRef = useRef<AbortController | null>(null);
  const layerControllerRef = useRef<AbortController | null>(null);

  // Batalkan request yang masih berjalan saat komponen unmount.
  useEffect(
    () => () => {
      controllerRef.current?.abort();
      layerControllerRef.current?.abort();
    },
    []
  );

  const generate = useCallback(async (shortPrompt: string): Promise<AnatomyLayersMap | null> => {
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
      const e = err as Error;
      if (e.name !== 'AbortError') setError(e.message);
      return null;
    } finally {
      if (controllerRef.current === controller) setIsGenerating(false);
    }
  }, []);

  const regenerateSingleLayer = useCallback(
    async (
      targetLayer: AnatomyLayerKey,
      shortPrompt: string,
      currentLayers: Partial<AnatomyLayersMap>
    ): Promise<string | null> => {
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
        const e = err as Error;
        if (e.name !== 'AbortError') {
          setLayerError({ layer: targetLayer, message: e.message });
        }
        return null;
      } finally {
        if (layerControllerRef.current === controller) setRegeneratingLayer(null);
      }
    },
    []
  );

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
