import Icon from './Icon';

const NAV_LINKS = ['Templates', 'Frameworks', 'Community'];

export default function Navbar() {
  return (
    <header className="relative z-40">
      <nav className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-6 lg:px-10">
        <a href="/" className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-[0_4px_20px_-2px_rgba(249,115,22,0.55)]">
            <Icon name="sparkles" className="size-[18px]" />
          </span>
          <span className="text-lg font-semibold tracking-tight text-white sm:text-xl">Prompt Craftsman</span>
        </a>

        <div className="flex items-center gap-4 sm:gap-8">
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
          <button
            type="button"
            className="rounded-full border border-white/10 bg-white/[0.04] px-5 py-2 text-xs font-semibold text-white transition hover:bg-white/[0.08] sm:text-sm"
          >
            Sign In
          </button>
        </div>
      </nav>
    </header>
  );
}
