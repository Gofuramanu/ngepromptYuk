import { type KeyboardEvent, useLayoutEffect, useRef } from 'react';
import Icon from './Icon';

export interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  onGenerate: () => void;
  onCancel: () => void;
  isGenerating: boolean;
  error: string | null;
}

export default function PromptInput({
  value,
  onChange,
  onGenerate,
  onCancel,
  isGenerating,
  error,
}: PromptInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Auto-grow tinggi input utama agar tidak pernah memunculkan scrollbar kuno
  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.max(el.scrollHeight, 116)}px`;
  }, [value]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl/Cmd + Enter untuk generate cepat.
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && !isGenerating && value.trim()) {
      onGenerate();
    }
  };

  return (
    <section className="glass-card relative overflow-hidden p-6 sm:p-8">
      {/* Glow oranye halus di sisi kanan atas sesuai desain HiFi */}
      <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-orange-500/[0.08] blur-3xl" />

      <label htmlFor="short-prompt" className="relative mb-5 flex items-center gap-3">
        <span className="grid size-8 place-items-center rounded-lg bg-orange-500/15 text-orange-400 ring-1 ring-orange-400/25">
          <Icon name="bulb" className="size-4" />
        </span>
        <span className="text-base font-semibold text-white sm:text-lg">Ide / Prompt Singkat</span>
      </label>

      <textarea
        ref={textareaRef}
        id="short-prompt"
        spellCheck={false}
        className="no-scrollbar relative min-h-[116px] w-full resize-none overflow-hidden rounded-2xl border border-white/[0.05] bg-[#09090b]/80 px-5 py-4 text-sm leading-relaxed text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:border-orange-500/40 focus:ring-4 focus:ring-orange-500/10 sm:text-base"
        placeholder="Ketik permintaan sederhana Anda di sini... (Contoh: Buat rencana bisnis untuk jualan alat olahraga di Yogyakarta)"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        maxLength={4000}
      />

      {error && (
        <p
          role="alert"
          className="relative mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
        >
          {error}
        </p>
      )}

      <div className="relative mt-6 flex flex-wrap items-center justify-end gap-3">
        {isGenerating && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-white/10 px-5 py-3 text-sm font-medium text-zinc-300 transition hover:bg-white/[0.06]"
          >
            Batal
          </button>
        )}

        <button
          type="button"
          onClick={onGenerate}
          disabled={isGenerating}
          className="inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-orange-500 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_8px_30px_-6px_rgba(249,115,22,0.65)] transition hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isGenerating ? (
            <>
              <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              AI Sedang Meracik...
            </>
          ) : (
            <>
              Generate Master Prompt
              <Icon name="wand" className="size-4" />
            </>
          )}
        </button>
      </div>
    </section>
  );
}
