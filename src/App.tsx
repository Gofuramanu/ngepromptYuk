import { useCallback, useMemo, useState } from 'react';
import AccountModal from './components/AccountModal';
import AnatomyBlock from './components/AnatomyBlock';
import FloatingActionBar from './components/FloatingActionBar';
import MasterPromptModal from './components/MasterPromptModal';
import Navbar from './components/Navbar';
import PromptInput from './components/PromptInput';
import {
  ANATOMY_LAYERS,
  EMPTY_PROMPT_DATA,
  LAYER_KEYS,
  STORAGE_KEY,
} from './constants/anatomy';
import { usePersistentState } from './hooks/usePersistentState';
import { usePromptGenerator } from './hooks/usePromptGenerator';
import { useUserAccount } from './hooks/useUserAccount';
import type { SavedPromptItem } from './types/account';
import type { AnatomyLayerKey, AnatomyLayersMap, PromptData } from './types/prompt';
import { buildMasterPrompt } from './utils/buildMasterPrompt';
import { applyVariables } from './utils/promptVariables';

function App() {
  const [data, setData] = usePersistentState<PromptData & Record<string, unknown>>(
    STORAGE_KEY,
    EMPTY_PROMPT_DATA as PromptData & Record<string, unknown>
  );
  const {
    generate,
    regenerateSingleLayer,
    cancel,
    isGenerating,
    regeneratingLayer,
    error,
    layerError,
    clearLayerError,
  } = usePromptGenerator();
  const {
    user,
    connection,
    prompts,
    isAccountBusy,
    accountError,
    authenticate,
    startOAuth,
    signOut,
    saveConnection,
    removeConnection,
    savePrompt,
    removePrompt,
    clearAccountError,
  } = useUserAccount();

  const [previewOpen, setPreviewOpen] = useState<boolean>(false);
  const [accountModalOpen, setAccountModalOpen] = useState<boolean>(false);

  // State interaksi kartu:
  // - activeLayer: key kartu yang sedang di-expand secara individual saat diklik di barisan Linear
  // - isTransitioning: animasi keluar/masuk saat beralih antara Linear <-> Expanded
  const [activeLayer, setActiveLayer] = useState<AnatomyLayerKey | null>(null);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

  // Functional update: selalu memakai state terbaru (menghindari stale closure).
  const updateField = useCallback(
    (field: AnatomyLayerKey | 'shortPrompt', value: string) =>
      setData((prev) => ({ ...prev, [field]: value })),
    [setData]
  );

  const variables = useMemo(() => data.variables || {}, [data.variables]);

  // Memperbarui nilai variabel dinamis tanpa menimpa placeholder di teks mentah blok
  const updateVariable = useCallback(
    (name: string, value: string) => {
      setData((prev) => ({
        ...prev,
        variables: {
          ...(prev.variables || {}),
          [name]: value,
        },
      }));
    },
    [setData]
  );

  // Opsional: membekukan nilai variabel yang sudah diisi ke dalam teks mentah blok
  const handleApplyVariablesToLayer = useCallback(
    (layerKey: AnatomyLayerKey) => {
      setData((prev) => ({
        ...prev,
        [layerKey]: applyVariables(prev[layerKey], prev.variables || {}),
      }));
    },
    [setData]
  );

  // Mode Expanded 2 Kolom hanya aktif otomatis ketika ke-6 lapisan Master Prompt sudah terisi lengkap
  const allLayersGenerated = useMemo(
    () => LAYER_KEYS.every((key) => Boolean(data[key]?.trim())),
    [data]
  );

  const hasAnyInput = useMemo(
    () =>
      Boolean(data.shortPrompt?.trim()) ||
      LAYER_KEYS.some((key) => Boolean(data[key]?.trim())),
    [data]
  );

  // Selama belum semua 6 lapisan ter-generate, tampilkan barisan 6 kartu Linear (dengan expand per-kartu)
  const isCompactMode = !allLayersGenerated;

  const handleSelectLayer = useCallback((layerKey: AnatomyLayerKey) => {
    setActiveLayer((prev) => (prev === layerKey ? null : layerKey));
  }, []);

  const handleGenerate = async () => {
    const idea = data.shortPrompt.trim();
    if (!idea) {
      document.getElementById('short-prompt')?.focus();
      return;
    }
    setActiveLayer(null);
    const layers = await generate(idea);
    if (layers) {
      if (isCompactMode) {
        setIsTransitioning(true);
        setTimeout(() => {
          setData((prev) => ({ ...prev, ...layers, variables: {} }));
          setIsTransitioning(false);
        }, 220);
      } else {
        setData((prev) => ({ ...prev, ...layers, variables: {} }));
      }
    }
  };

  // Regenerasi 1 blok anatomi sambil mengirim shortPrompt & 5 blok lainnya sebagai konteks
  const handleRegenerateLayer = useCallback(
    async (layerKey: AnatomyLayerKey) => {
      const currentLayers = Object.fromEntries(
        LAYER_KEYS.map((key) => [key, data[key] || ''])
      ) as AnatomyLayersMap;
      const nextContent = await regenerateSingleLayer(layerKey, data.shortPrompt, currentLayers);
      if (nextContent !== null) {
        setData((prev) => ({ ...prev, [layerKey]: nextContent }));
      }
    },
    [data, regenerateSingleLayer, setData]
  );

  // Saat tombol Reset diklik: tutup dengan animasi halus lalu kembali ke barisan Linear
  const handleResetAll = () => {
    if (isTransitioning) return;
    setActiveLayer(null);
    if (!isCompactMode) {
      setIsTransitioning(true);
      setTimeout(() => {
        setData(EMPTY_PROMPT_DATA as PromptData & Record<string, unknown>);
        setIsTransitioning(false);
      }, 320);
    } else {
      setData(EMPTY_PROMPT_DATA as PromptData & Record<string, unknown>);
    }
  };

  // Memuat prompt dari Workspace akun user ke editor
  const handleLoadSavedPrompt = useCallback(
    (item: SavedPromptItem) => {
      setActiveLayer(null);
      const nextLayers = Object.fromEntries(
        LAYER_KEYS.map((k) => [k, item.layers?.[k] || ''])
      ) as AnatomyLayersMap;
      setData({
        shortPrompt: item.shortPrompt || '',
        ...nextLayers,
        variables: item.variables || {},
      });
      setAccountModalOpen(false);
    },
    [setData]
  );

  const closePreview = useCallback(() => setPreviewOpen(false), []);
  const masterPrompt = useMemo(() => buildMasterPrompt(data), [data]);
  const isAnyGenerating = isGenerating || Boolean(regeneratingLayer);

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Latar ambient glow sesuai desain HiFi Liquid Glassmorphism */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -left-48 -top-24 h-[550px] w-[650px] rounded-full bg-slate-800/20 blur-[150px]" />
        <div className="absolute -right-48 top-1/4 h-[650px] w-[550px] rounded-full bg-orange-600/[0.08] blur-[160px]" />
      </div>

      <Navbar
        user={user}
        connection={connection}
        onOpenAccount={() => {
          clearAccountError();
          setAccountModalOpen(true);
        }}
      />

      <main className="mx-auto max-w-[1120px] space-y-6 sm:space-y-8 px-3.5 pb-24 pt-4 sm:px-6 sm:pb-16 sm:pt-6">
        <PromptInput
          value={data.shortPrompt}
          onChange={(value) => updateField('shortPrompt', value)}
          onGenerate={handleGenerate}
          onCancel={cancel}
          isGenerating={isGenerating}
          error={error}
        />

        {/* Section Prompt Anatomy */}
        <section className="space-y-4 sm:space-y-5" aria-busy={isAnyGenerating}>
          <div className="flex flex-wrap items-end justify-between gap-3 sm:gap-4 px-1">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-white sm:text-2xl">
                Prompt Anatomy
              </h2>
              <p className="mt-0.5 sm:mt-1 text-xs text-zinc-400 sm:text-sm">
                Configure your prompt structure using the components below.
              </p>
            </div>

            {hasAnyInput && (
              <button
                type="button"
                onClick={handleResetAll}
                className="rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1 sm:px-4 sm:py-1.5 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-300 transition hover:border-orange-500/40 hover:bg-orange-500/10 hover:text-orange-300 active:scale-95"
              >
                Reset
              </button>
            )}
          </div>

          <div
            className={
              isCompactMode
                ? 'grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3.5 lg:flex lg:flex-row lg:items-stretch lg:gap-3.5'
                : 'grid items-start gap-4 sm:gap-5 md:grid-cols-2'
            }
          >
            {ANATOMY_LAYERS.map((layer, index) => (
              <AnatomyBlock
                key={layer.key}
                index={index}
                layer={layer}
                value={data[layer.key]}
                onChange={updateField}
                variables={variables}
                onVariableChange={updateVariable}
                onApplyVariables={handleApplyVariablesToLayer}
                onRegenerate={handleRegenerateLayer}
                isLoading={isGenerating}
                isRegenerating={regeneratingLayer === layer.key}
                isAnyGenerating={isAnyGenerating}
                canRegenerate={hasAnyInput}
                layerError={layerError?.layer === layer.key ? layerError.message : null}
                onDismissError={clearLayerError}
                isCompact={isCompactMode}
                isExiting={isTransitioning}
                isActive={activeLayer === layer.key}
                onSelect={handleSelectLayer}
                onCollapse={() => setActiveLayer(null)}
              />
            ))}
          </div>
        </section>

        <FloatingActionBar masterPrompt={masterPrompt} onPreview={() => setPreviewOpen(true)} />
      </main>

      <MasterPromptModal open={previewOpen} masterPrompt={masterPrompt} onClose={closePreview} />

      <AccountModal
        open={accountModalOpen}
        onClose={() => setAccountModalOpen(false)}
        user={user}
        connection={connection}
        prompts={prompts}
        currentData={data}
        isBusy={isAccountBusy}
        error={accountError}
        onAuthenticate={authenticate}
        onStartOAuth={startOAuth}
        onSignOut={signOut}
        onSaveConnection={saveConnection}
        onRemoveConnection={removeConnection}
        onSavePrompt={savePrompt}
        onDeletePrompt={removePrompt}
        onLoadPrompt={handleLoadSavedPrompt}
        onClearError={clearAccountError}
      />
    </div>
  );
}

export default App;
