import { useEffect, useState } from 'react';
import Icon from './Icon';

export interface MasterPromptModalProps {
  open: boolean;
  masterPrompt: string;
  onClose: () => void;
}

// Modal pratinjau Master Prompt gabungan (dibuka dari Floating Action Bar).
export default function MasterPromptModal({
  open,
  masterPrompt,
  onClose,
}: MasterPromptModalProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  if (!open) return null;

  const handleCopy = async () => {
    if (!masterPrompt) return;
    try {
      await navigator.clipboard.writeText(masterPrompt);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="preview-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Tutup"
      />
      <div className="glass-card relative flex max-h-[90vh] sm:max-h-[85vh] w-full max-w-3xl flex-col bg-[#141416]/95 p-4 sm:p-6 md:p-8">
        <div className="mb-4 sm:mb-5 flex items-center justify-between gap-3">
          <h2 id="preview-title" className="text-lg sm:text-xl font-semibold text-white">
            Pratinjau Master Prompt
          </h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-semibold text-zinc-200 transition hover:bg-white/10 hover:text-white"
            >
              <Icon name={copied ? 'check' : 'copy'} className="size-3.5" />
              <span>{copied ? 'Tersalin!' : 'Salin'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="grid size-8 sm:size-9 place-items-center rounded-lg text-zinc-400 transition hover:bg-white/[0.06] hover:text-white"
              aria-label="Tutup"
            >
              <Icon name="x" className="size-4 sm:size-5" />
            </button>
          </div>
        </div>
        <pre className="flex-1 overflow-auto whitespace-pre-wrap break-words rounded-xl border border-white/[0.06] bg-black/40 p-3.5 sm:p-5 font-mono text-xs sm:text-sm leading-relaxed text-zinc-300">
          {masterPrompt}
        </pre>
      </div>
    </div>
  );
}
