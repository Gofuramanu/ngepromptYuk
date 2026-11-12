import { useEffect, useState } from 'react';

export default function MasterPromptPreview({ masterPrompt, onReset }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(masterPrompt);
      setCopied(true);
    } catch {
      alert('Gagal menyalin ke clipboard. Silakan salin manual.');
    }
  };

  if (!masterPrompt) return null;

  return (
    <section className="bg-panel p-6 rounded-lg border border-gray-700 shadow-md">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-gray-200">📋 Master Prompt</h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onReset}
            className="px-3 py-1.5 text-sm rounded-md text-gray-300 border border-gray-600 hover:bg-gray-700 transition"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="px-3 py-1.5 text-sm rounded-md bg-orange-600 hover:bg-orange-700 text-white transition"
          >
            {copied ? '✓ Tersalin' : 'Salin'}
          </button>
        </div>
      </div>
      <pre className="whitespace-pre-wrap break-words bg-input text-gray-300 p-4 rounded-md text-sm leading-relaxed max-h-96 overflow-auto">
        {masterPrompt}
      </pre>
    </section>
  );
}

