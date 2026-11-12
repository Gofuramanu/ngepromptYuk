import { useEffect } from 'react';
import Icon from './Icon';

// Modal pratinjau Master Prompt gabungan (dibuka dari Floating Action Bar).
export default function MasterPromptModal({ open, masterPrompt, onClose }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="preview-title">
      <button type="button" className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} aria-label="Tutup" />
      <div className="glass-card relative flex max-h-[85vh] w-full max-w-3xl flex-col bg-[#141416]/95 p-6 sm:p-8">
        <div className="mb-5 flex items-center justify-between">
          <h2 id="preview-title" className="text-xl font-semibold text-white">Pratinjau Master Prompt</h2>
          <button type="button" onClick={onClose} className="grid size-9 place-items-center rounded-lg text-zinc-400 transition hover:bg-white/[0.06] hover:text-white" aria-label="Tutup">
            <Icon name="x" className="size-5" />
          </button>
        </div>
        <pre className="flex-1 overflow-auto whitespace-pre-wrap break-words rounded-xl border border-white/[0.06] bg-black/40 p-5 font-mono text-sm leading-relaxed text-zinc-300">
          {masterPrompt}
        </pre>
      </div>
    </div>
  );
}

