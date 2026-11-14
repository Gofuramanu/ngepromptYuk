import Icon from './Icon';

const NAV_LINKS = ['Templates', 'Frameworks', 'Community'];

export default function Navbar({ user, connection, onOpenAccount }) {
  const hasActiveByok = Boolean(user && connection?.isActive);

  return (
    <header className="relative z-40">
      <nav className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-6 lg:px-10">
        <a href="/" className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-[0_4px_20px_-2px_rgba(249,115,22,0.55)]">
            <Icon name="sparkles" className="size-[18px]" />
          </span>
          <span className="text-lg font-semibold tracking-tight text-white sm:text-xl">
            Prompt Craftsman
          </span>
        </a>

        <div className="flex items-center gap-3 sm:gap-5">
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
              hasActiveByok
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
              {hasActiveByok
                ? `BYOK: ${connection.provider} (${connection.model})`
                : 'Mode: Free Default AI'}
            </span>
          </span>

          <button
            type="button"
            onClick={onOpenAccount}
            className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-white transition hover:border-orange-500/40 hover:bg-white/[0.08] sm:px-5 sm:text-sm"
          >
            {user ? user.email.split('@')[0] : 'Sign In / BYOK'}
          </button>
        </div>
      </nav>
    </header>
  );
}
