import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Icon from './Icon';

// Batas tinggi nyaman sebelum muncul efek gradient fade + tombol "Lihat selengkapnya"
const COLLAPSED_MAX_HEIGHT = 148;

export default function AnatomyBlock({
  layer,
  index = 0,
  value,
  onChange,
  isLoading,
  isCompact,
  isExiting,
  isActive,
  onSelect,
  onCollapse,
}) {
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
  const cardRef = useRef(null);
  const textareaRef = useRef(null);
  const expandedTextareaRef = useRef(null);

  // State untuk fitur Auto-Grow + "Lihat selengkapnya / Ringkas" tanpa scrollbar
  const [contentHeight, setContentHeight] = useState(124);
  const [isFullText, setIsFullText] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const isOverflowing = contentHeight > COLLAPSED_MAX_HEIGHT + 24;
  const showFull = isFullText || isFocused || !isOverflowing;

  // Hitung tinggi asli teks secara otomatis agar textarea selalu pas tanpa scrollbar
  useLayoutEffect(() => {
    const el = isCompact ? textareaRef.current : expandedTextareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const nextHeight = Math.max(el.scrollHeight, isCompact ? 104 : 124);
    el.style.height = `${nextHeight}px`;
    setContentHeight(nextHeight);
  }, [value, isCompact, isActive]);

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

    const handlePointerDown = (e) => {
      if (cardRef.current && !cardRef.current.contains(e.target)) {
        onCollapse?.();
      }
    };

    const handleKeyDown = (e) => {
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
          if (e.target.tagName === 'TEXTAREA') return;
          if (isActive) {
            onCollapse?.();
          } else {
            onSelect?.(key);
          }
        }}
        onKeyDown={(e) => {
          if (e.target.tagName === 'TEXTAREA') return;
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
        <div className="flex items-center gap-2.5 min-w-0">
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
                  ? 'max-h-5 opacity-100 mb-0.5'
                  : 'max-h-0 opacity-0 group-hover:max-h-5 group-hover:opacity-100 group-hover:mb-0.5'
              }`}
            >
              <span className={`size-1.5 shrink-0 rounded-full ${dotColor}`} />
              <span
                className={`text-[9px] font-bold uppercase tracking-[0.16em] whitespace-nowrap ${eyebrowColor}`}
              >
                {eyebrow}
              </span>
            </div>

            <span className="block text-sm font-semibold leading-tight text-zinc-100 whitespace-nowrap">
              {title}
            </span>
          </div>
        </div>

        {/* Bagian Tengah: Lebar teks penjelasan dikunci (w-[164px]) agar baris tidak pernah berubah-ubah */}
        <div className="relative my-3 flex-1 flex flex-col justify-center">
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
                isLoading ? 'animate-pulse text-orange-300/80' : ''
              }`}
            >
              {isLoading ? 'Crafting\nlayer...' : 'Waiting for\ninput...'}
            </p>
          </div>

          {/* Layer B: Teks Penjelasan pendek & ukuran jelas (text-sm sm:text-[15px]) */}
          <div
            className={`transition-opacity duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              isActive || hasContent
                ? 'opacity-100 delay-75'
                : 'pointer-events-none opacity-0 group-hover:opacity-100 group-hover:delay-75'
            }`}
          >
            <p className="w-[164px] shrink-0 text-sm font-medium leading-snug text-zinc-100 sm:text-[15px] line-clamp-2">
              {!isActive && hasContent ? value : question}
            </p>
          </div>

          {/* Layer C: Laci Textarea per-kartu (Bebas scrollbar, auto-resize mulus) */}
          <div
            onClick={(e) => e.stopPropagation()}
            className={`expand-drawer ${
              isActive
                ? 'grid-rows-[1fr] opacity-100 mt-3'
                : 'pointer-events-none grid-rows-[0fr] opacity-0 mt-0'
            }`}
          >
            <div className="overflow-hidden">
              <textarea
                ref={textareaRef}
                id={inputId}
                spellCheck={false}
                tabIndex={isActive ? 0 : -1}
                className={`no-scrollbar min-h-[104px] w-full cursor-text resize-none overflow-hidden rounded-xl border border-white/[0.08] bg-[#09090b]/85 px-3.5 py-2.5 text-sm leading-relaxed text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:ring-4 ${focus}`}
                value={value}
                onChange={(e) => onChange(key, e.target.value)}
                placeholder={placeholder}
              />
            </div>
          </div>
        </div>

        {/* Bagian Bawah: Footer Bar */}
        <div
          className={`space-y-2 overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isActive ? 'max-h-0 opacity-0 mt-0' : 'max-h-12 opacity-100 mt-1'
          }`}
        >
          <div className="flex w-[164px] items-center justify-between text-xs font-medium text-zinc-400 whitespace-nowrap opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <span>Klik untuk mengisi</span>
            <span>→</span>
          </div>
          <div className="h-px w-full bg-white/[0.06]" />
          <div className="h-1 w-full overflow-hidden rounded-full bg-white/[0.05]">
            <div
              className={`h-full transition-all duration-500 ease-out ${
                isLoading
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

  // 2. Mode Expanded Grid (Bebas Scrollbar: Auto-Grow + Gradient Mask & Pill "Lihat selengkapnya")
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
          ? '!opacity-0 -translate-y-3 scale-[0.96] blur-[2px] duration-300'
          : 'opacity-100 translate-y-0 scale-100'
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
        <span className={`grid size-10 shrink-0 place-items-center rounded-full ring-1 ${iconStyle}`}>
          <Icon name={icon} className="size-4" />
        </span>
      </div>

      <p className="relative mt-4 text-sm font-medium text-zinc-300 sm:text-[15px]">{question}</p>

      {/* Kontainer Elastik Bebas Scrollbar dengan Gradient Fade Mask */}
      <div
        className={`relative mt-3.5 overflow-hidden rounded-xl border border-white/[0.06] bg-[#09090b]/80 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] focus-within:border-white/20 ${
          isLoading ? 'animate-pulse' : ''
        }`}
        style={{
          maxHeight: showFull ? `${contentHeight + 16}px` : `${COLLAPSED_MAX_HEIGHT}px`,
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
            className=" absolute inset-x-0 bottom-0 flex h-16 cursor-pointer items-end justify-center bg-gradient-to-t from-[#09090b] via-[#09090b]/90 to-transparent pb-2.5 transition-opacity duration-300"
          >
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-[11px] font-medium text-zinc-300 backdrop-blur-md transition hover:border-white/20 hover:bg-white/10 hover:text-white">
              Lihat penuh ▾
            </span>
          </div>
        )}
      </div>

      {/* Tombol "Ringkas ▴" di bawah kotak jika teks panjang sedang dibuka penuh */}
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
    </article>
  );
}
