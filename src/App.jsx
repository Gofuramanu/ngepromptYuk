import { useCallback, useMemo, useState } from 'react';
import AnatomyBlock from './components/AnatomyBlock';
import FloatingActionBar from './components/FloatingActionBar';
import MasterPromptModal from './components/MasterPromptModal';
import Navbar from './components/Navbar';
import PromptInput from './components/PromptInput';
import { ANATOMY_LAYERS, EMPTY_PROMPT_DATA, LAYER_KEYS, STORAGE_KEY } from './constants/anatomy';
import { usePersistentState } from './hooks/usePersistentState';
import { usePromptGenerator } from './hooks/usePromptGenerator';
import { buildMasterPrompt } from './utils/buildMasterPrompt';

function App() {
  const [data, setData] = usePersistentState(STORAGE_KEY, EMPTY_PROMPT_DATA);
  const { generate, cancel, isGenerating, error } = usePromptGenerator();
  const [previewOpen, setPreviewOpen] = useState(false);

  // State interaksi kartu:
  // - activeLayer: key kartu yang sedang di-expand secara individual saat diklik di barisan Linear
  // - isTransitioning: animasi keluar/masuk saat beralih antara Linear <-> Expanded
  const [activeLayer, setActiveLayer] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Functional update: selalu memakai state terbaru (menghindari stale closure).
  const updateField = (field, value) => setData((prev) => ({ ...prev, [field]: value }));

  // Mode Expanded 2 Kolom hanya aktif otomatis ketika ke-6 lapisan Master Prompt sudah terisi lengkap
  const allLayersGenerated = useMemo(
    () => LAYER_KEYS.every((key) => Boolean(data[key]?.trim())),
    [data]
  );

  const hasAnyInput = useMemo(
    () => Boolean(data.shortPrompt?.trim()) || LAYER_KEYS.some((key) => Boolean(data[key]?.trim())),
    [data]
  );

  // Selama belum semua 6 lapisan ter-generate, tampilkan barisan 6 kartu Linear (dengan expand per-kartu)
  const isCompactMode = !allLayersGenerated;

  const handleSelectLayer = (layerKey) => {
    setActiveLayer((prev) => (prev === layerKey ? null : layerKey));
  };

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
          setData((prev) => ({ ...prev, ...layers }));
          setIsTransitioning(false);
        }, 220);
      } else {
        setData((prev) => ({ ...prev, ...layers }));
      }
    }
  };

  // Saat tombol Reset diklik: tutup dengan animasi halus lalu kembali ke barisan Linear
  const handleResetAll = () => {
    if (isTransitioning) return;
    setActiveLayer(null);
    if (!isCompactMode) {
      setIsTransitioning(true);
      setTimeout(() => {
        setData(EMPTY_PROMPT_DATA);
        setIsTransitioning(false);
      }, 320);
    } else {
      setData(EMPTY_PROMPT_DATA);
    }
  };

  const closePreview = useCallback(() => setPreviewOpen(false), []);
  const masterPrompt = useMemo(() => buildMasterPrompt(data), [data]);

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Latar ambient glow sesuai desain HiFi Liquid Glassmorphism */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -left-48 -top-24 h-[550px] w-[650px] rounded-full bg-slate-800/20 blur-[150px]" />
        <div className="absolute -right-48 top-1/4 h-[650px] w-[550px] rounded-full bg-orange-600/[0.08] blur-[160px]" />
      </div>

      <Navbar />

      <main className="mx-auto max-w-[1120px] space-y-8 px-4 pb-16 pt-6 sm:px-6">
        <PromptInput
          value={data.shortPrompt}
          onChange={(value) => updateField('shortPrompt', value)}
          onGenerate={handleGenerate}
          onCancel={cancel}
          isGenerating={isGenerating}
          error={error}
        />

        {/* Section Prompt Anatomy */}
        <section className="space-y-5" aria-busy={isGenerating}>
          <div className="flex flex-wrap items-end justify-between gap-4 px-1">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                Prompt Anatomy
              </h2>
              <p className="mt-1 text-xs text-zinc-400 sm:text-sm">
                Configure your prompt structure using the components below.
              </p>
            </div>

            {hasAnyInput && (
              <button
                type="button"
                onClick={handleResetAll}
                className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-300 transition hover:border-orange-500/40 hover:bg-orange-500/10 hover:text-orange-300 active:scale-95"
              >
                Reset
              </button>
            )}
          </div>

          <div
            className={
              isCompactMode
                ? 'grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:flex lg:flex-row lg:items-stretch lg:gap-3.5'
                : 'grid items-start gap-5 md:grid-cols-2'
            }
          >
            {ANATOMY_LAYERS.map((layer, index) => (
              <AnatomyBlock
                key={layer.key}
                index={index}
                layer={layer}
                value={data[layer.key]}
                onChange={updateField}
                isLoading={isGenerating}
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
    </div>
  );
}

export default App;
