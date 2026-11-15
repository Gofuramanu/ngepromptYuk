import { useEffect, useState } from 'react';
import Icon from './Icon';

type ActionStatus = 'copied' | 'shared' | 'empty' | 'error' | null;

export interface FloatingActionBarProps {
  masterPrompt: string;
  onPreview: () => void;
}

// Floating action bar di bagian bawah sesuai desain HiFi:
// Ikon dokumen/pratinjau, ikon bagikan, divider vertikal, dan tombol putih "Copy Master Prompt".
export default function FloatingActionBar({ masterPrompt, onPreview }: FloatingActionBarProps) {
  const [status, setStatus] = useState<ActionStatus>(null);

  useEffect(() => {
    if (!status) return;
    const t = setTimeout(() => setStatus(null), 2000);
    return () => clearTimeout(t);
  }, [status]);

  const handleCopy = async () => {
    if (!masterPrompt) {
      setStatus('empty');
      return;
    }
    try {
      await navigator.clipboard.writeText(masterPrompt);
      setStatus('copied');
    } catch {
      setStatus('error');
    }
  };

  const handleShare = async () => {
    if (!masterPrompt) {
      setStatus('empty');
      return;
    }
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Master Prompt — ngepromptYuk', text: masterPrompt });
        setStatus('shared');
      } catch (err) {
        if ((err as Error).name !== 'AbortError') setStatus('error');
      }
    } else {
      await handleCopy();
    }
  };

  const handlePreview = () => {
    if (!masterPrompt) {
      setStatus('empty');
      return;
    }
    onPreview();
  };

  const iconBtn =
    'grid size-9 sm:size-10 place-items-center rounded-xl text-zinc-400 transition hover:bg-white/[0.08] hover:text-white';

  return (
    <div className="sticky bottom-4 sm:bottom-6 z-30 -mt-3 flex justify-center px-3 sm:px-4">
      <div className="flex max-w-full items-center gap-1 rounded-2xl border border-white/10 bg-[#151518]/90 p-1.5 sm:p-2 shadow-[0_20px_50px_rgba(0,0,0,0.85)] backdrop-blur-xl">
        <button
          type="button"
          onClick={handlePreview}
          className={iconBtn}
          title="Pratinjau Master Prompt"
          aria-label="Pratinjau Master Prompt"
        >
          <Icon name="copy" className="size-3.5 sm:size-4" />
        </button>
        <button
          type="button"
          onClick={handleShare}
          className={iconBtn}
          title="Bagikan Master Prompt"
          aria-label="Bagikan Master Prompt"
        >
          <Icon name="share" className="size-3.5 sm:size-4" />
        </button>

        <span className="mx-1 sm:mx-2 h-6 sm:h-7 w-px bg-white/10" />

        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex min-w-[140px] sm:min-w-[175px] items-center justify-center gap-1.5 sm:gap-2 rounded-xl bg-white px-3.5 py-2 text-xs font-bold text-zinc-950 shadow-sm transition hover:bg-zinc-200 active:scale-[0.98] sm:px-5 sm:py-2.5 sm:text-sm"
        >
          {status === 'copied' && (
            <>
              <Icon name="check" className="size-3.5 sm:size-4" /> Tersalin!
            </>
          )}
          {status === 'shared' && (
            <>
              <Icon name="check" className="size-3.5 sm:size-4" /> Dibagikan!
            </>
          )}
          {status === 'empty' && 'Isi Prompt Dulu'}
          {status === 'error' && 'Gagal Menyalin'}
          {!status && 'Copy Master Prompt'}
        </button>
      </div>
    </div>
  );
}
