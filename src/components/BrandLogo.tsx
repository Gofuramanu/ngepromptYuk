export interface BrandLogoProps {
  size?: number;
  showWordmark?: boolean;
  wordmarkClassName?: string;
  className?: string;
}

/**
 * Logo resmi ngepromptYuk — Konsep 1: Tumpukan 6 Lapisan + Percikan AI
 * Menampilkan 6 lapisan warna anatomi prompt + percikan bintang AI dan wordmark "ngepromptYuk".
 */
export default function BrandLogo({
  size = 38,
  showWordmark = false,
  wordmarkClassName = 'text-lg sm:text-xl',
  className = '',
}: BrandLogoProps) {
  return (
    <span className={`inline-flex items-center gap-3 select-none ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0 rounded-[22%] shadow-[0_4px_20px_rgba(0,0,0,0.6)] ring-1 ring-white/10"
      >
        <rect width="64" height="64" rx="14" fill="#141311" />
        <rect x="12" y="13" width="26" height="5" rx="2.5" fill="#3B82F6" />
        <rect x="12" y="20.6" width="26" height="5" rx="2.5" fill="#F97316" />
        <rect x="12" y="28.2" width="40" height="5" rx="2.5" fill="#14B8A6" />
        <rect x="12" y="35.8" width="32" height="5" rx="2.5" fill="#EF4444" />
        <rect x="12" y="43.4" width="36" height="5" rx="2.5" fill="#EC4899" />
        <rect x="12" y="51" width="24" height="5" rx="2.5" fill="#A855F7" />
        <path
          d="M49 9 Q49 17 57 17 Q49 17 49 25 Q49 17 41 17 Q49 17 49 9Z"
          fill="#FFF7ED"
        />
      </svg>

      {showWordmark && (
        <span className={`font-bold tracking-tight ${wordmarkClassName}`}>
          <span className="text-white">ngeprompt</span>
          <span className="text-[#EA580C]">Yuk</span>
        </span>
      )}
    </span>
  );
}
