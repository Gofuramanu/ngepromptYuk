import { useMemo } from 'react';
import AnatomyBlock from './components/AnatomyBlock';
import MasterPromptPreview from './components/MasterPromptPreview';
import PromptInput from './components/PromptInput';
import { ANATOMY_LAYERS, EMPTY_PROMPT_DATA, STORAGE_KEY } from './constants/anatomy';
import { usePersistentState } from './hooks/usePersistentState';
import { usePromptGenerator } from './hooks/usePromptGenerator';
import { buildMasterPrompt } from './utils/buildMasterPrompt';

function App() {
  const [data, setData] = usePersistentState(STORAGE_KEY, EMPTY_PROMPT_DATA);
  const { generate, cancel, isGenerating, error } = usePromptGenerator();

  // Functional update: selalu memakai state terbaru (menghindari stale closure).
  const updateField = (field, value) => setData((prev) => ({ ...prev, [field]: value }));

  const handleGenerate = async () => {
    const idea = data.shortPrompt.trim();
    if (!idea) return;
    const layers = await generate(idea);
    if (layers) setData((prev) => ({ ...prev, ...layers }));
  };

  const masterPrompt = useMemo(() => buildMasterPrompt(data), [data]);

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-10">
      <header className="text-center">
        <h1 className="text-4xl font-serif mb-2 flex justify-center items-center gap-3">
          <span className="text-orange-500 text-5xl" aria-hidden="true">✴</span> The Anatomy of a Master Prompt
        </h1>
        <p className="text-gray-400">Ubah ide singkat menjadi instruksi terstruktur untuk AI</p>
      </header>

      <PromptInput
        value={data.shortPrompt}
        onChange={(value) => updateField('shortPrompt', value)}
        onGenerate={handleGenerate}
        onCancel={cancel}
        isGenerating={isGenerating}
        error={error}
      />

      <div className="space-y-4" aria-busy={isGenerating}>
        {ANATOMY_LAYERS.map((layer) => (
          <AnatomyBlock key={layer.key} layer={layer} value={data[layer.key]} onChange={updateField} />
        ))}
      </div>

      <MasterPromptPreview masterPrompt={masterPrompt} onReset={() => setData(EMPTY_PROMPT_DATA)} />
    </div>
  );
}

export default App;
