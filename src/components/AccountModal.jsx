import { useState } from 'react';
import { PROVIDER_CATALOG } from '../services/accountService';
import Icon from './Icon';

function GoogleLogo() {
  return (
    <svg className="size-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.24 1.26-.96 2.33-2.04 3.05l3.3 2.56c1.92-1.77 3.04-4.38 3.04-7.46 0-.71-.06-1.4-.19-2.05H12z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.75 0 5.06-.91 6.75-2.47l-3.3-2.56c-.91.61-2.08.98-3.45.98-2.65 0-4.9-1.79-5.71-4.2H2.88v2.64A10 10 0 0 0 12 22z"
      />
      <path
        fill="#4A90E2"
        d="M6.29 13.75A6.02 6.02 0 0 1 5.97 12c0-.61.11-1.2.32-1.75V7.61H2.88A10 10 0 0 0 2 12c0 1.61.39 3.14 1.08 4.39l3.21-2.64z"
      />
      <path
        fill="#FBBC05"
        d="M12 5.98c1.5 0 2.84.52 3.9 1.53l2.92-2.92C17.05 2.94 14.75 2 12 2A10 10 0 0 0 2.88 7.61l3.41 2.64c.81-2.41 3.06-4.27 5.71-4.27z"
      />
    </svg>
  );
}

function GitHubLogo() {
  return (
    <svg className="size-4 shrink-0 fill-white" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.58 2 12.23c0 4.52 2.87 8.35 6.84 9.7.5.1.68-.22.68-.49 0-.24-.01-1.04-.01-1.89-2.78.62-3.37-1.21-3.37-1.21-.45-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.63.07-.63 1 .07 1.53 1.05 1.53 1.05.9 1.57 2.35 1.12 2.92.85.09-.67.35-1.12.63-1.38-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05a9.36 9.36 0 0 1 5 0c1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.06.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.59.69.49A10.25 10.25 0 0 0 22 12.23C22 6.58 17.52 2 12 2z" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg className="mt-0.5 size-4 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 2 4 5.5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5.5L12 2z"
        fill="#df7c55"
        fillOpacity="0.25"
        stroke="#df7c55"
        strokeWidth="1.75"
      />
      <path d="M12 2v20.5c4.59-1.15 8-5.86 8-10.91V5.5L12 2z" fill="#df7c55" fillOpacity="0.7" />
    </svg>
  );
}

function WarmLuminousAuthScreen({
  isBusy,
  error,
  onSubmit,
  onStartOAuth,
  onClearError,
  onClose,
}) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [forgotNotice, setForgotNotice] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setForgotNotice(false);
    await onSubmit(mode, email, password);
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center px-4 py-12">
      {/* Ambient Warm Luminous Glow di belakang kartu */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 flex items-center justify-center"
      >
        <div className="h-[520px] w-[520px] rounded-full bg-[#dd7a53]/[0.16] blur-[140px]" />
      </div>

      {/* Tombol kembali ke workspace di kanan atas */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Kembali ke editor"
        className="fixed right-6 top-6 z-20 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs font-medium text-[#b5aea8] transition hover:bg-white/10 hover:text-white"
      >
        <Icon name="x" className="size-3.5" />
        <span>Close</span>
      </button>

      {/* Logo "P" & Heading sesuai Login Page - Warm Luminous Dark.png */}
      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="grid size-11 place-items-center rounded-[14px] bg-[#dd7a53] text-lg font-bold text-white shadow-[0_6px_24px_rgba(221,122,83,0.4)]">
          P
        </div>

        <h2
          style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          className="mt-6 text-3xl font-normal tracking-tight text-[#f5f2ef] sm:text-[34px]"
        >
          {mode === 'login' ? 'Welcome back' : 'Create your account'}
        </h2>
        <p className="mt-2.5 text-sm text-[#8e8781]">
          Refine your ideas into structured perfection.
        </p>
      </div>

      {/* Kartu Login Warm Luminous Dark */}
      <div className="relative z-10 mt-8 w-full max-w-[404px] rounded-[24px] border border-white/[0.08] bg-[#161413]/95 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.75)] backdrop-blur-xl sm:p-7">
        {/* Tombol OAuth Google & GitHub */}
        <div className="space-y-2.5">
          <button
            type="button"
            disabled={isBusy}
            onClick={() => onStartOAuth?.('google')}
            className="flex h-11 w-full items-center justify-center gap-3 rounded-xl border border-white/[0.07] bg-[#221f1d] text-xs font-medium text-[#f3efec] transition hover:border-white/15 hover:bg-[#2a2624] disabled:opacity-50 sm:text-[13px]"
          >
            <GoogleLogo />
            <span>Continue with Google</span>
          </button>

          <button
            type="button"
            disabled={isBusy}
            onClick={() => onStartOAuth?.('github')}
            className="flex h-11 w-full items-center justify-center gap-3 rounded-xl border border-white/[0.07] bg-[#221f1d] text-xs font-medium text-[#f3efec] transition hover:border-white/15 hover:bg-[#2a2624] disabled:opacity-50 sm:text-[13px]"
          >
            <GitHubLogo />
            <span>Continue with GitHub</span>
          </button>
        </div>

        {/* Divider OR CONTINUE WITH EMAIL */}
        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/[0.06]" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6d6661]">
            OR CONTINUE WITH EMAIL
          </span>
          <div className="h-px flex-1 bg-white/[0.06]" />
        </div>

        {/* Form Email & Password */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="auth-email" className="block text-xs font-medium text-[#b5aea8]">
              Email
            </label>
            <div className="mt-1.5 flex h-11 items-center gap-2.5 rounded-xl border border-white/[0.08] bg-[#1b1917] px-3.5 transition focus-within:border-[#df7c55]/60 focus-within:ring-2 focus-within:ring-[#df7c55]/15">
              <svg
                className="size-4 shrink-0 text-[#6d6661]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
              <input
                id="auth-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full bg-transparent text-xs text-[#f3efec] outline-none placeholder:text-[#5c5651] sm:text-[13px]"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="auth-password" className="block text-xs font-medium text-[#b5aea8]">
                Password
              </label>
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={() => setForgotNotice(true)}
                  className="text-[11px] font-medium text-[#c87251] transition hover:text-[#df7c55]"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="mt-1.5 flex h-11 items-center gap-2.5 rounded-xl border border-white/[0.08] bg-[#1b1917] px-3.5 transition focus-within:border-[#df7c55]/60 focus-within:ring-2 focus-within:ring-[#df7c55]/15">
              <svg
                className="size-4 shrink-0 text-[#6d6661]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-transparent text-xs text-[#f3efec] outline-none placeholder:text-[#5c5651] sm:text-[13px]"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="text-[#6d6661] transition hover:text-[#b5aea8]"
              >
                <Icon name="eye" className="size-4" />
              </button>
            </div>
          </div>

          {forgotNotice && !error && (
            <p className="rounded-xl border border-[#df7c55]/30 bg-[#201b18] px-3.5 py-2.5 text-[11px] leading-relaxed text-[#d6cec8]">
              Silakan gunakan menu Sign up untuk membuat akun baru atau reset password melalui dashboard Supabase Auth Anda.
            </p>
          )}

          {error && (
            <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-xs text-rose-200">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isBusy}
            className="h-11 w-full rounded-xl bg-[#de7c56] text-xs font-semibold text-white shadow-[0_8px_28px_-4px_rgba(222,124,86,0.45)] transition hover:bg-[#e58863] active:scale-[0.99] disabled:opacity-50 sm:text-sm"
          >
            {isBusy ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        {/* Kotak Informasi BYOK sesuai desain */}
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-[#de7c56]/15 bg-[#201b18]/90 p-4">
          <ShieldIcon />
          <div>
            <p className="text-xs font-semibold text-[#f3efec]">
              Personal AI Connection (BYOK):
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-[#8e8781]">
              Your API keys are encrypted with AES-256-GCM and stored securely. We never expose keys to the browser environment.
            </p>
          </div>
        </div>
      </div>

      {/* Footer bawah di luar kartu */}
      <p className="relative z-10 mt-7 text-xs text-[#8e8781]">
        {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
        <button
          type="button"
          onClick={() => {
            setMode((prev) => (prev === 'login' ? 'signup' : 'login'));
            setForgotNotice(false);
            onClearError?.();
          }}
          className="font-semibold text-[#de7c56] transition hover:underline"
        >
          {mode === 'login' ? 'Sign up' : 'Sign in'}
        </button>
      </p>
    </div>
  );
}

function ConnectionSettingsTab({ connection, isBusy, error, onSave, onRemove }) {
  const initialProvider = connection?.provider || 'gemini';
  const defaultCatalog =
    PROVIDER_CATALOG.find((p) => p.id === initialProvider) || PROVIDER_CATALOG[0];

  const [provider, setProvider] = useState(initialProvider);
  const [model, setModel] = useState(connection?.model || defaultCatalog.defaultModel);
  const [baseUrl, setBaseUrl] = useState(connection?.baseUrl || '');
  const [apiKey, setApiKey] = useState('');
  const [isActive, setIsActive] = useState(connection?.isActive ?? true);
  const [savedNotice, setSavedNotice] = useState(false);

  const selectedMeta = PROVIDER_CATALOG.find((p) => p.id === provider) || PROVIDER_CATALOG[0];

  const handleProviderChange = (nextProvider) => {
    setProvider(nextProvider);
    const meta = PROVIDER_CATALOG.find((p) => p.id === nextProvider);
    if (meta) setModel(meta.defaultModel);
    setSavedNotice(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSavedNotice(false);
    const ok = await onSave({
      provider,
      model,
      baseUrl,
      apiKey,
      isActive,
    });
    if (ok) {
      setApiKey('');
      setSavedNotice(true);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/[0.08] bg-[#1b1917] px-3.5 py-2.5">
        <div className="text-xs">
          <span className="text-[#8e8781]">Status Koneksi AI: </span>
          {connection?.isActive ? (
            <span className="font-semibold text-emerald-400">
              Aktif ({connection.provider} · {connection.model} · Key {connection.keyHint})
            </span>
          ) : (
            <span className="font-medium text-[#de7c56]">
              Memakai Fallback Gratis Aplikasi (Belum ada BYOK aktif)
            </span>
          )}
        </div>
        {connection && (
          <button
            type="button"
            disabled={isBusy}
            onClick={onRemove}
            className="text-[11px] font-semibold text-rose-300 transition hover:text-rose-200"
          >
            Hapus Key
          </button>
        )}
      </div>

      <div className="grid gap-3.5 sm:grid-cols-2">
        <div>
          <label htmlFor="byok-provider" className="block text-xs font-medium text-[#b5aea8]">
            Provider AI
          </label>
          <select
            id="byok-provider"
            value={provider}
            onChange={(e) => handleProviderChange(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/[0.08] bg-[#1b1917] px-3 py-2.5 text-xs text-[#f3efec] outline-none focus:border-[#de7c56]/60"
          >
            {PROVIDER_CATALOG.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="byok-model" className="block text-xs font-medium text-[#b5aea8]">
            ID Model
          </label>
          <input
            id="byok-model"
            type="text"
            required
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder={selectedMeta.defaultModel}
            className="mt-1 w-full rounded-xl border border-white/[0.08] bg-[#1b1917] px-3 py-2 text-xs text-[#f3efec] outline-none focus:border-[#de7c56]/60"
          />
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {selectedMeta.suggestedModels.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setModel(preset)}
                className={`rounded-md border px-2 py-0.5 font-mono text-[10px] transition ${
                  model === preset
                    ? 'border-[#de7c56]/60 bg-[#de7c56]/15 text-[#f3efec]'
                    : 'border-white/[0.08] bg-white/[0.03] text-[#8e8781] hover:text-zinc-200'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>
      </div>

      {selectedMeta.requiresBaseUrl && (
        <div>
          <label htmlFor="byok-baseurl" className="block text-xs font-medium text-[#b5aea8]">
            Base URL Endpoint (OpenAI-Compatible `/v1`)
          </label>
          <input
            id="byok-baseurl"
            type="url"
            required
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="https://gateway-anda.com/v1"
            className="mt-1 w-full rounded-xl border border-white/[0.08] bg-[#1b1917] px-3.5 py-2 text-xs text-[#f3efec] outline-none focus:border-[#de7c56]/60"
          />
        </div>
      )}

      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="byok-key" className="block text-xs font-medium text-[#b5aea8]">
            API Key {connection ? `(Tersimpan: ${connection.keyHint})` : ''}
          </label>
          {selectedMeta.consoleUrl && (
            <a
              href={selectedMeta.consoleUrl}
              target="_blank"
              rel="noreferrer"
              className="text-[11px] font-medium text-[#de7c56] hover:underline"
            >
              Ambil API Key ↗
            </a>
          )}
        </div>
        <input
          id="byok-key"
          type="password"
          required={!connection}
          autoComplete="off"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder={
            connection
              ? 'Kosongkan jika hanya ingin mengganti model, atau isi untuk ganti API Key baru'
              : selectedMeta.keyPlaceholder
          }
          className="mt-1 w-full rounded-xl border border-white/[0.08] bg-[#1b1917] px-3.5 py-2 text-xs text-[#f3efec] outline-none placeholder:text-[#5c5651] focus:border-[#de7c56]/60"
        />
      </div>

      <label className="flex cursor-pointer items-center gap-2 text-xs text-[#b5aea8]">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="rounded border-white/20 bg-zinc-900 text-[#de7c56] focus:ring-[#de7c56]"
        />
        <span>Gunakan kredensial ini untuk semua Generate & Partial Regenerate saya</span>
      </label>

      {error && (
        <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
          {error}
        </p>
      )}

      {savedNotice && !error && (
        <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
          Koneksi AI berhasil dienkripsi dengan AES-256-GCM dan disimpan ke akun Anda.
        </p>
      )}

      <button
        type="submit"
        disabled={isBusy}
        className="h-11 w-full rounded-xl bg-[#de7c56] text-xs font-semibold text-white shadow-[0_8px_28px_-4px_rgba(222,124,86,0.45)] transition hover:bg-[#e58863] disabled:opacity-50"
      >
        {isBusy ? 'Menyimpan Enkripsi...' : 'Simpan Koneksi AI Pribadi'}
      </button>
    </form>
  );
}

function SavedPromptsTab({
  prompts,
  currentData,
  isBusy,
  error,
  onSavePrompt,
  onDeletePrompt,
  onLoadPrompt,
}) {
  const [title, setTitle] = useState('');

  const handleSaveCurrent = async (e) => {
    e.preventDefault();
    const fallbackTitle =
      title.trim() ||
      currentData?.shortPrompt?.trim()?.slice(0, 60) ||
      'Master Prompt Baru';
    const layers = {
      role: currentData.role || '',
      task: currentData.task || '',
      context: currentData.context || '',
      reasoning: currentData.reasoning || '',
      stop: currentData.stop || '',
      output: currentData.output || '',
    };
    const ok = await onSavePrompt({
      title: fallbackTitle,
      shortPrompt: currentData.shortPrompt || '',
      layers,
      variables: currentData.variables || {},
    });
    if (ok) setTitle('');
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSaveCurrent} className="flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Beri judul Master Prompt saat ini..."
          className="flex-1 rounded-xl border border-white/[0.08] bg-[#1b1917] px-3.5 py-2 text-xs text-[#f3efec] outline-none placeholder:text-[#5c5651] focus:border-[#de7c56]/60"
        />
        <button
          type="submit"
          disabled={isBusy}
          className="shrink-0 rounded-xl bg-[#de7c56] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#e58863] disabled:opacity-50"
        >
          + Simpan ke Akun
        </button>
      </form>

      {error && (
        <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
          {error}
        </p>
      )}

      <div className="max-h-[280px] space-y-2 overflow-y-auto pr-1">
        {prompts.length === 0 ? (
          <p className="rounded-xl border border-white/[0.06] bg-[#1b1917]/60 p-5 text-center text-xs text-[#8e8781]">
            Belum ada Master Prompt tersimpan di akun Anda.
          </p>
        ) : (
          prompts.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-[#1b1917] px-3.5 py-2.5"
            >
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-[#f3efec]">{item.title}</p>
                <p className="truncate text-[11px] text-[#8e8781]">
                  {item.shortPrompt || 'Tanpa deskripsi singkat'}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => onLoadPrompt(item)}
                  className="rounded-lg border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[11px] font-medium text-[#f3efec] transition hover:bg-white/10"
                >
                  Muat
                </button>
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => onDeletePrompt(item.id)}
                  className="rounded-lg border border-rose-500/20 bg-rose-500/10 px-2 py-1 text-[11px] font-medium text-rose-300 transition hover:bg-rose-500/20"
                >
                  Hapus
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function AccountModal({
  open,
  onClose,
  user,
  connection,
  prompts,
  currentData,
  isBusy,
  error,
  onAuthenticate,
  onStartOAuth,
  onSignOut,
  onSaveConnection,
  onRemoveConnection,
  onSavePrompt,
  onDeletePrompt,
  onLoadPrompt,
  onClearError,
}) {
  const [activeTab, setActiveTab] = useState('connection');

  if (!open) return null;

  // Saat belum login: tampilkan halaman penuh "Login Page - Warm Luminous Dark"
  if (!user) {
    return (
      <div
        role="dialog"
        aria-modal="true"
        className="fixed inset-0 z-50 overflow-y-auto bg-[#070606]"
      >
        <WarmLuminousAuthScreen
          isBusy={isBusy}
          error={error}
          onSubmit={onAuthenticate}
          onStartOAuth={onStartOAuth}
          onClearError={onClearError}
          onClose={onClose}
        />
      </div>
    );
  }

  // Saat sudah login: tampilkan Workspace & BYOK AI Manager dengan palet Warm Luminous Dark
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#070606]/85 p-4 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl rounded-[24px] border border-white/[0.08] bg-[#161413]/95 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.75)] sm:p-7"
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-xl bg-[#dd7a53] text-sm font-bold text-white shadow-[0_4px_18px_rgba(221,122,83,0.35)]">
              P
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#de7c56]">
                Workspace & BYOK AI Manager
              </p>
              <h3 className="mt-0.5 text-base font-semibold text-[#f5f2ef]">{user.email}</h3>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onSignOut}
              className="rounded-lg border border-white/10 bg-[#221f1d] px-3 py-1.5 text-xs font-medium text-[#b5aea8] transition hover:bg-[#2a2624] hover:text-white"
            >
              Sign Out
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup modal"
              className="rounded-lg p-1.5 text-[#8e8781] transition hover:bg-white/10 hover:text-white"
            >
              <Icon name="x" className="size-4" />
            </button>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <div className="flex gap-2 rounded-xl border border-white/[0.08] bg-[#1b1917] p-1">
            <button
              type="button"
              onClick={() => {
                setActiveTab('connection');
                onClearError?.();
              }}
              className={`flex-1 rounded-lg py-2 text-xs font-semibold transition ${
                activeTab === 'connection'
                  ? 'bg-[#de7c56] text-white'
                  : 'text-[#8e8781] hover:text-white'
              }`}
            >
              Koneksi AI Pribadi (BYOK)
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('prompts');
                onClearError?.();
              }}
              className={`flex-1 rounded-lg py-2 text-xs font-semibold transition ${
                activeTab === 'prompts'
                  ? 'bg-[#de7c56] text-white'
                  : 'text-[#8e8781] hover:text-white'
              }`}
            >
              Prompt Tersimpan ({prompts.length})
            </button>
          </div>

          {activeTab === 'connection' ? (
            <ConnectionSettingsTab
              key={`${connection?.provider || 'none'}-${connection?.model || ''}-${connection?.keyHint || ''}`}
              connection={connection}
              isBusy={isBusy}
              error={error}
              onSave={onSaveConnection}
              onRemove={onRemoveConnection}
            />
          ) : (
            <SavedPromptsTab
              prompts={prompts}
              currentData={currentData}
              isBusy={isBusy}
              error={error}
              onSavePrompt={onSavePrompt}
              onDeletePrompt={onDeletePrompt}
              onLoadPrompt={onLoadPrompt}
            />
          )}
        </div>
      </div>
    </div>
  );
}
