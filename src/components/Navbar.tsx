import type { UserAIConnectionPublic, UserProfile } from '../types/account';
import BrandLogo from './BrandLogo';

const NAV_LINKS = ['Templates', 'Frameworks', 'Community'] as const;

export interface NavbarProps {
  user: UserProfile | null;
  connection: UserAIConnectionPublic | null;
  onOpenAccount: () => void;
}

export default function Navbar({ user, connection, onOpenAccount }: NavbarProps) {
  const hasActiveByok = Boolean(user && connection?.isActive);

  return (
    <header className="relative z-40">
      <nav className="mx-auto flex h-16 sm:h-20 max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-10">
        <a href="/" aria-label="ngepromptYuk Home" className="flex items-center">
          <BrandLogo size={34} showWordmark wordmarkClassName="text-base sm:text-xl" />
        </a>

        <div className="flex items-center gap-2 sm:gap-5">
          <ul className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((label) => (
              <li key={label}>
                <a
                  href={`#${label.toLowerCase()}`}
                  className="text-sm text-zinc-400 transition hover:text-white"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>

          <span
            onClick={onOpenAccount}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') onOpenAccount?.();
            }}
            className={`hidden cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-medium transition sm:inline-flex ${
              hasActiveByok
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
                : 'border-white/10 bg-white/[0.03] text-zinc-400 hover:text-zinc-200'
            }`}
            title={
              hasActiveByok && connection
                ? `Terhubung ke AI milik Anda: ${connection.provider} (${connection.model})`
                : 'Memakai kuota/model gratis bawaan aplikasi. Klik untuk menautkan AI milik Anda.'
            }
          >
            <span
              className={`size-1.5 rounded-full ${
                hasActiveByok ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
            />
            <span>
              {hasActiveByok && connection
                ? `BYOK: ${connection.provider} (${connection.model})`
                : 'Mode: Free Default AI'}
            </span>
          </span>

          <button
            type="button"
            onClick={onOpenAccount}
            className="rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs font-semibold text-white transition hover:border-orange-500/40 hover:bg-white/[0.08] sm:px-5 sm:py-2 sm:text-sm"
          >
            {user ? user.email.split('@')[0] : 'Sign In'}
          </button>
        </div>
      </nav>
    </header>
  );
}
