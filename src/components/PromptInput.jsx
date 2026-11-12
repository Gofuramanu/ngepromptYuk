export default function PromptInput({ value, onChange, onGenerate, onCancel, isGenerating, error }) {
  const handleKeyDown = (e) => {
    // Ctrl/Cmd + Enter untuk generate cepat.
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && !isGenerating) onGenerate();
  };

  return (
    <div className="bg-panel p-6 rounded-lg border border-gray-700 shadow-md">
      <label htmlFor="short-prompt" className="block text-sm font-semibold text-gray-300 mb-2">
        💡 Ide / Prompt Singkat
      </label>
      <textarea
        id="short-prompt"
        className="w-full bg-input text-white p-4 rounded-md outline-none focus:ring-2 focus:ring-orange-500 min-h-[100px]"
        placeholder="Ketik permintaan sederhana Anda di sini... (Contoh: Buatkan saya rencana bisnis untuk jualan alat olahraga di Yogyakarta)"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        maxLength={4000}
      />

      {error && (
        <p role="alert" className="mt-3 text-sm text-red-400 bg-red-950/40 border border-red-800 rounded-md px-3 py-2">
          {error}
        </p>
      )}

      <div className="mt-4 flex justify-end gap-3">
        {isGenerating && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-md text-gray-300 border border-gray-600 hover:bg-gray-700 transition"
          >
            Batal
          </button>
        )}
        <button
          type="button"
          onClick={onGenerate}
          disabled={isGenerating || !value.trim()}
          className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-md font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? 'AI Sedang Menganalisis...' : 'Generate Master Prompt'}
        </button>
      </div>
    </div>
  );
}

