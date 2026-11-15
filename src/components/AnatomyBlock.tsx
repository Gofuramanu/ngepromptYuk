import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { AnatomyLayerKey, AnatomyLayerMeta, PromptVariablesMap } from '../types/prompt';
import { applyVariables, extractVariables } from '../utils/promptVariables';
import Icon from './Icon';

// Batas tinggi nyaman sebelum muncul efek gradient fade + tombol "Lihat penuh"
const COLLAPSED_MAX_HEIGHT = 148;

interface RegenerateButtonProps {
  isRegenerating: boolean;
  disabled: boolean;
  canRegenerate: boolean;
  onClick?: () => void;
  compact?: boolean;
  title: string;
}

function RegenerateButton({
  isRegenerating,
  disabled,
  canRegenerate,
  onClick,
  compact = false,
  title,
}: RegenerateButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled || !canRegenerate}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      title={
        !canRegenerate
          ? 'Isi ide prompt atau blok lain terlebih dahulu untuk regenerasi parsial'
          : `Regenerate blok ${title} secara spesifik`
      }
      className={`inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] font-semibold text-zinc-300 transition hover:border-orange-500/40 hover:bg-orange-500/10 hover:text-orange-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 ${
        compact ? 'px-2.5 py-1 text-[10px]' : 'px-3 py-1.5 text-[11px]'
      }`}
    >
      <Icon
        name="refresh"
        className={`${compact ? 'size-3' : 'size-3.5'} ${isRegenerating ? 'animate-spin text-orange-400' : ''}`}
      />
      <span>{isRegenerating ? 'Menyusun...' : 'Regenerate'}</span>
    </button>
  );
}

interface LayerErrorBannerProps {
  message: string | null;
  onDismiss?: () => void;
}

function LayerErrorBanner({ message, onDismiss }: LayerErrorBannerProps) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="mt-2.5 flex items-center justify-between gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200"
    >
      <span>{message}</span>
      {onDismiss && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
          aria-label="Tutup pesan error blok"
          className="shrink-0 rounded-md p-0.5 text-rose-300 transition hover:bg-rose-500/20 hover:text-white"
        >
          <Icon name="x" className="size-3.5" />
        </button>
      )}
    </div>
  );
}

interface VariableSectionProps {
  blockKey: AnatomyLayerKey;
  detectedVariables: string[];
  variables: PromptVariablesMap;
  resolvedPreview: string;
  hasFilledVars: boolean;
  onVariableChange?: (name: string, value: string) => void;
  onApplyVariables?: (layerKey: AnatomyLayerKey) => void;
  compact?: boolean;
}

function VariableSection({
  blockKey,
  detectedVariables,
  variables,
  resolvedPreview,
  hasFilledVars,
  onVariableChange,
  onApplyVariables,
  compact = false,
}: VariableSectionProps) {
  if (!detectedVariables.length) return null;

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={`rounded-xl border border-white/[0.08] bg-white/[0.02] ${
        compact ? 'mt-2.5 p-2.5' : 'mt-3.5 p-3.5'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400">
          Smart Variables ({detectedVariables.length})
        </span>
        {hasFilledVars && (
          <button
            type="button"
            onClick={() => onApplyVariables?.(blockKey)}
            title="Salin nilai variabel secara permanen ke teks blok"
            className="rounded-full border border-orange-500/30 bg-orange-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-orange-300 transition hover:border-orange-400/60 hover:bg-orange-500/20 hover:text-orange-200"
          >
            Terapkan ke teks
          </button>
        )}
      </div>

      <div
        className={`mt-2.5 grid gap-2 ${
          compact ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2'
        }`}
      >
        {detectedVariables.map((varName) => {
          const inputId = `${blockKey}-var-${varName}`;
          return (
            <div key={varName} className="space-y-1">
              <label
                htmlFor={inputId}
                className="block truncate font-mono text-[11px] font-medium text-zinc-300"
                title={varName}
              >
                {varName}
              </label>
              <input
                id={inputId}
                type="text"
                spellCheck={false}
                autoComplete="off"
                value={variables[varName] ?? ''}
                onChange={(e) => onVariableChange?.(varName, e.target.value)}
                placeholder={`Isi ${varName}...`}
                className="w-full rounded-lg border border-white/[0.08] bg-[#09090b]/85 px-2.5 py-1.5 text-xs text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20"
              />
            </div>
          );
        })}
      </div>

      {hasFilledVars && (
        <div className="mt-3 rounded-lg border border-white/[0.06] bg-[#09090b]/70 px-3 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-400/90">
            Pratinjau Real-Time
          </p>
          <p className="mt-1 whitespace-pre-wrap text-xs leading-relaxed text-zinc-300">
            {resolvedPreview}
          </p>
        </div>
      )}
    </div>
  );
}

export interface AnatomyBlockProps {
  layer: AnatomyLayerMeta;
  index?: number;
  value: string;
  onChange: (key: AnatomyLayerKey, value: string) => void;
  variables?: PromptVariablesMap;
  onVariableChange?: (name: string, value: string) => void;
  onApplyVariables?: (layerKey: AnatomyLayerKey) => void;
  onRegenerate?: (layerKey: AnatomyLayerKey) => void;
  isLoading: boolean;
  isRegenerating?: boolean;
  isAnyGenerating?: boolean;
  canRegenerate?: boolean;
  layerError?: string | null;
  onDismissError?: () => void;
  isCompact: boolean;
  isExiting: boolean;
  isActive: boolean;
  onSelect?: (layerKey: AnatomyLayerKey) => void;
  onCollapse?: () => void;
}

export default function AnatomyBlock({
  layer,
  index = 0,
  value,
  onChange,
  variables = {},
  onVariableChange,
  onApplyVariables,
  onRegenerate,
  isLoading,
  isRegenerating = false,
  isAnyGenerating = false,
  canRegenerate = false,
  layerError = null,
  onDismissError,
  isCompact,
  isExiting,
  isActive,
  onSelect,
  onCollapse,
}: AnatomyBlockProps) {
  const {
    key,
    title,
    eyebrow,
    icon,
    question,
    placeholder,
    eyebrowColor,
    dotColor,
    iconStyle,
    activeBorder,
    cornerGlow,
    focus,
  } = layer;
  const inputId = `anatomy-${key}`;
  const hasContent = Boolean(value?.trim());
  const isBlockBusy = isLoading || isRegenerating;
  const cardRef = useRef<HTMLElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const expandedTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Deteksi placeholder variabel [Nama] atau {{nama}} secara murni via useMemo (aman dari infinite loop)
  const detectedVariables = useMemo(() => extractVariables(value), [value]);
  const resolvedPreview = useMemo(() => applyVariables(value, variables), [value, variables]);
  const hasFilledVars = useMemo(
    () =>
      detectedVariables.some(
        (name) => typeof variables?.[name] === 'string' && variables[name].length > 0
      ),
    [detectedVariables, variables]
  );

  // State untuk fitur Auto-Grow + "Lihat penuh / Ringkas" tanpa scrollbar
  const [contentHeight, setContentHeight] = useState<number>(124);
  const [isFullText, setIsFullText] = useState<boolean>(false);
  const [isFocused, setIsFocused] = useState<boolean>(false);

  const isOverflowing = contentHeight > COLLAPSED_MAX_HEIGHT;
  const showFull = isFullText || isFocused || !isOverflowing;

  const lastWidthRef = useRef<number>(0);

  // Hitung tinggi asli teks secara otomatis agar textarea selalu pas tanpa memotong baris akhir
  const syncTextareaHeight = useCallback(() => {
    const el = isCompact ? textareaRef.current : expandedTextareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const nextHeight = Math.max(el.scrollHeight, isCompact ? 104 : 124);
    el.style.height = `${nextHeight}px`;
    setContentHeight(nextHeight);
  }, [isCompact]);

  useLayoutEffect(() => {
    syncTextareaHeight();
  }, [value, isCompact, isActive, syncTextareaHeight]);

  // Recalculate saat lebar kartu berubah (responsif/transisi grid) atau webfont selesai dimuat
  useEffect(() => {
    const el = isCompact ? textareaRef.current : expandedTextareaRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect?.width ?? 0;
      if (Math.abs(width - lastWidthRef.current) > 0.5) {
        lastWidthRef.current = width;
        syncTextareaHeight();
      }
    });
    observer.observe(el);

    let cancelled = false;
    document.fonts?.ready?.then(() => {
      if (!cancelled) syncTextareaHeight();
    });

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [isCompact, isActive, syncTextareaHeight]);

  // Fokus ke textarea secara halus setelah animasi buka per-kartu berjalan
  useEffect(() => {
    if (isCompact && isActive) {
      const timer = setTimeout(() => {
        textareaRef.current?.focus({ preventScroll: true });
      }, 240);
      return () => clearTimeout(timer);
    }
  }, [isCompact, isActive]);

  // Tutup kartu dengan animasi mulus saat klik di luar kartu atau tekan Escape
  useEffect(() => {
    if (!isCompact || !isActive) return;

    const handlePointerDown = (e: PointerEvent) => {
      if (cardRef.current && e.target instanceof Node && !cardRef.current.contains(e.target)) {
        onCollapse?.();
      }
    };

    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCollapse?.();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isCompact, isActive, onCollapse]);

  // 1. Mode Linear (6 kolom horizontal dengan fitur Hover + Klik Expand per-kartu)
  if (isCompact) {
    return (
      <article
        ref={cardRef}
        role="button"
        tabIndex={0}
        aria-expanded={isActive}
        onClick={(e) => {
          const target = e.target as HTMLElement | null;
          if (target?.closest('textarea, input, button, label')) return;
          if (isActive) {
            onCollapse?.();
          } else {
            onSelect?.(key);
          }
        }}
        onKeyDown={(e) => {
          const target = e.target as HTMLElement | null;
          if (target?.closest('textarea, input, button, label')) return;
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (isActive) onCollapse?.();
            else onSelect?.(key);
          }
        }}
        style={{
          backgroundImage: cornerGlow,
          animationDelay: `${index * 45}ms`,
        }}
        className={`glass-card animate-return-linear anatomy-card-transition group relative flex w-full cursor-pointer select-none flex-col justify-between overflow-hidden p-4 text-left outline-none lg:basis-0 ${
          isActive
            ? `min-h-[248px] lg:flex-[3.2] ${activeBorder}`
            : `min-h-[196px] lg:flex-[1] lg:hover:flex-[1.55] hover:-translate-y-0.5 hover:border-white/20 ${
                hasContent ? activeBorder : ''
              }`
        } ${isExiting ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}
      >
        {/* Bagian Atas: Ikon & Judul */}
        <div className="flex min-w-0 items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2.5">
            <span
              className={`grid size-8 shrink-0 place-items-center rounded-lg ring-1 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${iconStyle} ${
                isActive ? 'scale-105' : 'group-hover:scale-105'
              }`}
            >
              <Icon name={icon} className="size-4" />
            </span>

            <div className="min-w-0">
              <div
                className={`flex items-center gap-1.5 overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  isActive
                    ? 'mb-0.5 max-h-5 opacity-100'
                    : 'max-h-0 opacity-0 group-hover:mb-0.5 group-hover:max-h-5 group-hover:opacity-100'
                }`}
              >
                <span className={`size-1.5 shrink-0 rounded-full ${dotColor}`} />
                <span
                  className={`whitespace-nowrap text-[9px] font-bold uppercase tracking-[0.16em] ${eyebrowColor}`}
                >
                  {eyebrow}
                </span>
              </div>

              <span className="block whitespace-nowrap text-sm font-semibold leading-tight text-zinc-100">
                {title}
              </span>
            </div>
          </div>

          {isActive && (
            <RegenerateButton
              compact
              title={title}
              isRegenerating={isRegenerating}
              disabled={isAnyGenerating}
              canRegenerate={canRegenerate}
              onClick={() => onRegenerate?.(key)}
            />
          )}
        </div>

        {/* Bagian Tengah: Lebar teks penjelasan dikunci (w-[164px]) agar baris tidak pernah berubah-ubah */}
        <div className="relative my-3 flex flex-1 flex-col justify-center">
          {/* Layer A: Teks "Waiting for input..." (tampil saat diam & belum ada isi) */}
          <div
            className={`transition-all duration-300 ease-out ${
              isActive || hasContent
                ? 'pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 opacity-0'
                : 'opacity-100 group-hover:pointer-events-none group-hover:opacity-0'
            }`}
          >
            <p
              className={`w-[115px] font-mono text-xs italic leading-relaxed text-zinc-500 ${
                isBlockBusy ? 'animate-pulse text-orange-300/80' : ''
              }`}
            >
              {isBlockBusy ? 'Crafting\nlayer...' : 'Waiting for\ninput...'}
            </p>
          </div>

          {/* Layer B: Teks Penjelasan pendek & ukuran jelas (text-sm sm:text-[15px]) */}
          <div
            className={`transition-opacity duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              isActive || hasContent
                ? ' opacity-100 delay-75'
                : 'pointer-events-none opacity-0 group-hover:opacity-100 group-hover:delay-75'
            }`}
          >
            <p className="line-clamp-2 w-[164px] shrink-0 text-sm font-medium leading-snug text-zinc-100 sm:text-[15px]">
              {!isActive && hasContent ? resolvedPreview : question}
            </p>
          </div>

          {/* Layer C: Laci Textarea & Variabel per-kartu */}
          <div
            onClick={(e) => e.stopPropagation()}
            className={`expand-drawer ${
              isActive
                ? 'mt-3 grid-rows-[1fr] opacity-100'
                : 'pointer-events-none mt-0 grid-rows-[0fr] opacity-0'
            }`}
          >
            <div className="overflow-hidden">
              <textarea
                ref={textareaRef}
                id={inputId}
                spellCheck={false}
                tabIndex={isActive ? 0 : -1}
                className={`no-scrollbar min-h-[104px] w-full cursor-text resize-none overflow-hidden rounded-xl border border-white/[0.08] bg-[#09090b]/85 px-3.5 py-2.5 text-sm leading-relaxed text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:ring-4 ${focus} ${
                  isBlockBusy ? 'animate-pulse' : ''
                }`}
                value={value}
                onChange={(e) => onChange(key, e.target.value)}
                placeholder={placeholder}
              />

              <LayerErrorBanner message={layerError} onDismiss={onDismissError} />

              <VariableSection
                compact
                blockKey={key}
                detectedVariables={detectedVariables}
                variables={variables}
                resolvedPreview={resolvedPreview}
                hasFilledVars={hasFilledVars}
                onVariableChange={onVariableChange}
                onApplyVariables={onApplyVariables}
              />
            </div>
          </div>
        </div>

        {/* Bagian Bawah: Footer Bar */}
        <div
          className={`space-y-2 overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isActive ? 'mt-0 max-h-0 opacity-0' : 'mt-1 max-h-12 opacity-100'
          }`}
        >
          <div className="flex w-[164px] items-center justify-between whitespace-nowrap text-xs font-medium text-zinc-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <span>
              {detectedVariables.length > 0
                ? `${detectedVariables.length} variabel`
                : 'Klik untuk mengisi'}
            </span>
            <span>→</span>
          </div>
          <div className="h-px w-full bg-white/[0.06]" />
          <div className="h-1 w-full overflow-hidden rounded-full bg-white/[0.05]">
            <div
              className={`h-full transition-all duration-500 ease-out ${
                isBlockBusy
                  ? 'w-2/3 animate-pulse bg-orange-400/60'
                  : hasContent
                    ? `w-full ${dotColor}`
                    : 'w-1/5 bg-white/15 group-hover:w-3/5 group-hover:bg-white/35'
              }`}
            />
          </div>
        </div>
      </article>
    );
  }

  // 2. Mode Expanded Grid (Bebas Scrollbar: Auto-Grow + Gradient Mask + Partial Regenerate & Smart Variables)
  return (
    <article
      style={{
        backgroundImage: cornerGlow,
        animationDelay: isExiting ? `${index * 20}ms` : `${index * 65}ms`,
      }}
      className={`glass-card animate-generated-expand anatomy-card-transition relative flex flex-col p-6 hover:border-white/15 sm:p-7 ${
        hasContent ? activeBorder : ''
      } ${
        isExiting
          ? '-translate-y-3 scale-[0.96] !opacity-0 blur-[2px] duration-300'
          : 'translate-y-0 scale-100 opacity-100'
      }`}
    >
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className={`size-1.5 rounded-full ${dotColor}`} />
            <p className={`text-[10px] font-bold uppercase tracking-[0.18em] ${eyebrowColor}`}>
              {eyebrow}
            </p>
          </div>
          <label htmlFor={inputId} className="mt-1.5 block text-lg font-bold text-white sm:text-xl">
            {title}
          </label>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <RegenerateButton
            title={title}
            isRegenerating={isRegenerating}
            disabled={isAnyGenerating}
            canRegenerate={canRegenerate}
            onClick={() => onRegenerate?.(key)}
          />
          <span
            className={`grid size-10 shrink-0 place-items-center rounded-full ring-1 ${iconStyle}`}
          >
            <Icon name={icon} className="size-4" />
          </span>
        </div>
      </div>

      <p className="relative mt-4 text-sm font-medium text-zinc-300 sm:text-[15px]">{question}</p>

      {/* Kontainer Elastik Bebas Scrollbar dengan Gradient Fade Mask */}
      <div
        className={`relative mt-3.5 overflow-hidden rounded-xl border border-white/[0.06] bg-[#09090b]/80 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] focus-within:border-white/20 ${
          isBlockBusy ? 'animate-pulse' : ''
        }`}
        style={{
          minHeight: `${COLLAPSED_MAX_HEIGHT}px`,
          maxHeight: showFull
            ? isOverflowing
              ? `${contentHeight + 28}px`
              : 'none'
            : `${COLLAPSED_MAX_HEIGHT}px`,
        }}
      >
        <textarea
          ref={expandedTextareaRef}
          id={inputId}
          spellCheck={false}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="no-scrollbar block min-h-[124px] w-full resize-none overflow-hidden bg-transparent px-4 py-3.5 text-sm leading-relaxed text-zinc-200 outline-none placeholder:text-zinc-500"
          value={value}
          onChange={(e) => onChange(key, e.target.value)}
          placeholder={placeholder}
        />

        {/* Gradient Fade Overlay di bagian bawah jika teks panjang & sedang diringkas */}
        {!showFull && (
          <div
            onClick={() => setIsFullText(true)}
            className="absolute inset-x-0 bottom-0 flex h-16 cursor-pointer items-end justify-center bg-gradient-to-t from-[#09090b] via-[#09090b]/90 to-transparent pb-2.5 transition-opacity duration-300"
          >
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-[11px] font-medium text-zinc-300 backdrop-blur-md transition hover:border-white/20 hover:bg-white/10 hover:text-white">
              Lihat penuh ▾
            </span>
          </div>
        )}
      </div>

      {/* Tombol "Ringkas tampilan ▴" di bawah kotak jika teks panjang sedang dibuka penuh */}
      {isOverflowing && showFull && !isFocused && (
        <div className="mt-2 flex justify-end">
          <button
            type="button"
            onClick={() => setIsFullText(false)}
            className="text-[11px] font-medium text-zinc-400 transition hover:text-zinc-200"
          >
            Ringkas tampilan ▴
          </button>
        </div>
      )}

      <LayerErrorBanner message={layerError} onDismiss={onDismissError} />

      <VariableSection
        blockKey={key}
        detectedVariables={detectedVariables}
        variables={variables}
        resolvedPreview={resolvedPreview}
        hasFilledVars={hasFilledVars}
        onVariableChange={onVariableChange}
        onApplyVariables={onApplyVariables}
      />
    </article>
  );
}
