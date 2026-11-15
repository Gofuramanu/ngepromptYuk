import { useState } from 'react';
import { PROVIDER_CATALOG } from '../services/accountService';
import Icon from './Icon';

function GoogleLogo() {
  return (
    <svg className="size-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27a7.22 7.22 0 0 1 0-4.54V6.58H1.25a12.003 12.003 0 0 0 0 10.84l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
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
        fill="#DE7C56"
        fillOpacity="0.22"
        stroke="#DE7C56"
        strokeWidth="1.75"
      />
      <path d="M12 2v20.5c4.59-1.15 8-5.86 8-10.91V5.5L12 2z" fill="#DE7C56" fillOpacity="0.8" />
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
  const [validationErrors, setValidationErrors] = useState({});

  const validate = () => {
    const errors = {};
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      errors.email = 'Email tidak boleh kosong.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      errors.email = 'Format email belum valid.';
    }

    if (!password) {
      errors.password = 'Password tidak boleh kosong.';
    } else if (password.length < 6) {
      errors.password = 'Password minimal 6 karakter.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setForgotNotice(false);
    onClearError?.();

    if (!validate()) return;
    await onSubmit(mode, email, password);
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-[#000000] px-4 py-12 selection:bg-[#DE7C56]/30 selection:text-white">
      {/* Tombol kembali ke workspace di kanan atas */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Kembali ke editor"
        className="fixed right-6 top-6 z-20 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-[#0c0c0f]/80 px-3.5 py-1.5 text-xs font-medium text-zinc-400 backdrop-blur-md transition hover:border-[#DE7C56]/40 hover:bg-[#15151a] hover:text-white"
      >
        <Icon name="x" className="size-3.5" />
        <span>Close</span>
      </button>

      {/* Header: Logo Claude Terracotta "P" & Typography Luminous Dark */}
      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="grid size-12 place-items-center rounded-2xl bg-[#DE7C56] text-lg font-bold text-white shadow-[0_4px_20px_rgba(222,124,86,0.35)] ring-1 ring-[#DE7C56]/30">
          P
        </div>

        <h2
          style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          className="mt-6 text-3xl font-normal tracking-tight text-[#EDEDEF] sm:text-[35px]"
        >
          {mode === 'login' ? 'Welcome back' : 'Create your account'}
        </h2>
        <p className="mt-2.5 text-sm font-normal text-zinc-400">
          Refine your ideas into structured perfection.
        </p>
      </div>

      {/* Wrapper Ambient AI Design & Kartu Login Obsidian */}
      <div className="relative isolate mt-8 w-full max-w-[404px]">
        {/* Lapisan 1: Pendaran Luar Ambient AI (Breathing Pulse di latar True Black) */}
        <div
          aria-hidden="true"
          style={{
            background:
              'radial-gradient(ellipse 68% 54% at 50% 50%, rgba(255, 107, 0, 0.34) 0%, rgba(249, 115, 22, 0.22) 28%, rgba(234, 88, 12, 0.12) 50%, rgba(180, 50, 10, 0.04) 72%, rgba(0, 0, 0, 0) 100%)',
          }}
          className="animate-ai-ambient pointer-events-none absolute -inset-x-60 -inset-y-28 -z-10 blur-[110px]"
        />
        {/* Lapisan 2: Inti Neon AI (memberikan kesan teknologi aktif & responsif di belakang kartu) */}
        <div
          aria-hidden="true"
          style={{
            background:
              'radial-gradient(ellipse 48% 38% at 50% 46%, rgba(255, 140, 50, 0.38) 0%, rgba(249, 115, 22, 0.20) 45%, rgba(0, 0, 0, 0) 75%)',
          }}
          className="animate-ai-ambient pointer-events-none absolute -inset-x-28 -top-8 bottom-4 -z-10 blur-[68px]"
        />

        {/* Kartu Login Solid Abu / Charcoal Warm (#141312) sesuai desain sebelumnya */}
        <div className="relative z-10 w-full rounded-[24px] border border-white/[0.08] bg-[#141312] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.85)] sm:p-7">
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
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label htmlFor="auth-email" className="block text-xs font-medium text-[#b5aea8]">
                Email
              </label>
              <div
                className={`mt-1.5 flex h-11 items-center gap-2.5 rounded-xl border bg-[#1b1917] px-3.5 transition ${
                  validationErrors.email
                    ? 'border-rose-500/70 focus-within:border-rose-500 focus-within:ring-2 focus-within:ring-rose-500/20'
                    : 'border-white/[0.08] focus-within:border-[#DE7C56]/70 focus-within:ring-2 focus-within:ring-[#DE7C56]/15'
                }`}
              >
                <svg
                  className={`size-4 shrink-0 transition ${validationErrors.email ? 'text-rose-400' : 'text-[#6d6661]'}`}
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
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (validationErrors.email) {
                      setValidationErrors((prev) => ({ ...prev, email: undefined }));
                    }
                  }}
                  placeholder="nama@email.com"
                  className="w-full bg-transparent text-xs text-[#f3efec] outline-none placeholder:text-[#5c5651] sm:text-[13px]"
                />
              </div>
              {validationErrors.email && (
                <p className="mt-1.5 flex items-center gap-1.5 text-[11px] font-medium text-rose-400">
                  <span className="size-1 rounded-full bg-rose-400" />
                  {validationErrors.email}
                </p>
              )}
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
                    className="text-[11px] font-medium text-[#DE7C56] transition hover:text-[#E88661]"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div
                className={`mt-1.5 flex h-11 items-center gap-2.5 rounded-xl border bg-[#1b1917] px-3.5 transition ${
                  validationErrors.password
                    ? 'border-rose-500/70 focus-within:border-rose-500 focus-within:ring-2 focus-within:ring-rose-500/20'
                    : 'border-white/[0.08] focus-within:border-[#DE7C56]/70 focus-within:ring-2 focus-within:ring-[#DE7C56]/15'
                }`}
              >
                <svg
                  className={`size-4 shrink-0 transition ${validationErrors.password ? 'text-rose-400' : 'text-[#6d6661]'}`}
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
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (validationErrors.password) {
                      setValidationErrors((prev) => ({ ...prev, password: undefined }));
                    }
                  }}
                  placeholder="••••••••"
                  className="w-full bg-transparent text-xs text-[#f3efec] outline-none placeholder:text-[#5c5651] sm:text-[13px]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className={`transition ${showPassword ? 'text-[#DE7C56] hover:text-[#E88661]' : 'text-[#6d6661] hover:text-[#b5aea8]'}`}
                >
                  <Icon name={showPassword ? 'eyeOff' : 'eye'} className="size-4" />
                </button>
              </div>
              {validationErrors.password && (
                <p className="mt-1.5 flex items-center gap-1.5 text-[11px] font-medium text-rose-400">
                  <span className="size-1 rounded-full bg-rose-400" />
                  {validationErrors.password}
                </p>
              )}
            </div>

            {forgotNotice && !error && (
              <p className="rounded-xl border border-[#DE7C56]/30 bg-[#201b18] px-3.5 py-2.5 text-[11px] leading-relaxed text-[#d6cec8]">
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
              className="h-11 w-full rounded-xl bg-[#DE7C56] text-xs font-semibold text-white shadow-[0_8px_28px_-4px_rgba(222,124,86,0.45)] transition hover:bg-[#E58863] active:scale-[0.99] active:bg-[#CE6E49] disabled:opacity-50 sm:text-sm"
            >
              {isBusy ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Sign Up'}
            </button>
          </form>

          {/* Kotak Informasi BYOK sesuai desain sebelumnya */}
          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-[#DE7C56]/15 bg-[#201b18] p-4">
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
          className="font-semibold text-[#DE7C56] transition hover:text-[#E88661] hover:underline"
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
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/[0.08] bg-[#0c0c10] px-3.5 py-2.5">
        <div className="text-xs">
          <span className="text-zinc-400">Status Koneksi AI: </span>
          {connection?.isActive ? (
            <span className="font-semibold text-emerald-400">
              Aktif ({connection.provider} · {connection.model} · Key {connection.keyHint})
            </span>
          ) : (
            <span className="font-medium text-[#DE7C56]">
              Memakai Fallback Gratis Aplikasi (Belum ada BYOK aktif)
            </span>
          )}
        </div>
        {connection && (
          <button
            type="button"
            disabled={isBusy}
            onClick={onRemove}
            className="text-[11px] font-semibold text-rose-400 transition hover:text-rose-300"
          >
            Hapus Key
          </button>
        )}
      </div>

      <div className="grid gap-3.5 sm:grid-cols-2">
        <div>
          <label htmlFor="byok-provider" className="block text-xs font-medium text-zinc-300">
            Provider AI
          </label>
          <select
            id="byok-provider"
            value={provider}
            onChange={(e) => handleProviderChange(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/[0.08] bg-[#030305] px-3 py-2.5 text-xs text-zinc-100 outline-none focus:border-[#DE7C56]/70 focus:ring-2 focus:ring-[#DE7C56]/20"
          >
            {PROVIDER_CATALOG.map((item) => (
              <option key={item.id} value={item.id} className="bg-[#0c0c10] text-zinc-200">
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="byok-model" className="block text-xs font-medium text-zinc-300">
            ID Model
          </label>
          <input
            id="byok-model"
            type="text"
            required
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder={selectedMeta.defaultModel}
            className="mt-1 w-full rounded-xl border border-white/[0.08] bg-[#030305] px-3 py-2 text-xs text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-[#DE7C56]/70 focus:ring-2 focus:ring-[#DE7C56]/20"
          />
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {selectedMeta.suggestedModels.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setModel(preset)}
                className={`rounded-md border px-2 py-0.5 font-mono text-[10px] transition ${
                  model === preset
                    ? 'border-[#DE7C56]/70 bg-[#DE7C56]/15 text-[#DE7C56] shadow-[0_0_10px_rgba(222,124,86,0.2)]'
                    : 'border-white/[0.08] bg-[#0e0e12] text-zinc-400 hover:border-[#DE7C56]/30 hover:text-zinc-200'
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
          <label htmlFor="byok-baseurl" className="block text-xs font-medium text-zinc-300">
            Base URL Endpoint (OpenAI-Compatible `/v1`)
          </label>
          <input
            id="byok-baseurl"
            type="url"
            required
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="https://gateway-anda.com/v1"
            className="mt-1 w-full rounded-xl border border-white/[0.08] bg-[#030305] px-3.5 py-2 text-xs text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-[#DE7C56]/70 focus:ring-2 focus:ring-[#DE7C56]/20"
          />
        </div>
      )}

      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="byok-key" className="block text-xs font-medium text-zinc-300">
            API Key {connection ? `(Tersimpan: ${connection.keyHint})` : ''}
          </label>
          {selectedMeta.consoleUrl && (
            <a
              href={selectedMeta.consoleUrl}
              target="_blank"
              rel="noreferrer"
              className="text-[11px] font-medium text-[#DE7C56] hover:text-[#E88661] hover:underline"
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
          className="mt-1 w-full rounded-xl border border-white/[0.08] bg-[#030305] px-3.5 py-2 text-xs text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-[#DE7C56]/70 focus:ring-2 focus:ring-[#DE7C56]/20"
        />
      </div>

      <label className="flex cursor-pointer items-center gap-2 text-xs text-zinc-300">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="rounded border-white/20 bg-zinc-950 text-[#DE7C56] focus:ring-[#DE7C56]"
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
        className="h-11 w-full rounded-xl bg-[#DE7C56] text-xs font-semibold text-white shadow-[0_4px_18px_rgba(222,124,86,0.32)] transition hover:bg-[#E58863] hover:shadow-[0_6px_22px_rgba(222,124,86,0.42)] active:scale-[0.99] active:bg-[#CE6E49] disabled:opacity-50"
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
          className="flex-1 rounded-xl border border-white/[0.08] bg-[#030305] px-3.5 py-2 text-xs text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-[#DE7C56]/70 focus:ring-2 focus:ring-[#DE7C56]/20"
        />
        <button
          type="submit"
          disabled={isBusy}
          className="shrink-0 rounded-xl bg-[#DE7C56] px-4 py-2 text-xs font-semibold text-white shadow-[0_4px_14px_rgba(222,124,86,0.28)] transition hover:bg-[#E58863] active:scale-95 disabled:opacity-50"
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
          <p className="rounded-xl border border-white/[0.06] bg-[#0c0c10] p-5 text-center text-xs text-zinc-500">
            Belum ada Master Prompt tersimpan di akun Anda.
          </p>
        ) : (
          prompts.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-[#0c0c10] px-3.5 py-2.5 transition hover:border-white/15"
            >
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-zinc-100">{item.title}</p>
                <p className="truncate text-[11px] text-zinc-500">
                  {item.shortPrompt || 'Tanpa deskripsi singkat'}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => onLoadPrompt(item)}
                  className="rounded-lg border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[11px] font-medium text-zinc-200 transition hover:bg-white/10 hover:text-white"
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

  // Saat belum login: tampilkan halaman penuh "Login Page V2 - Luminous Dark Mode (#000000) & Ambient AI Design"
  if (!user) {
    return (
      <div
        role="dialog"
        aria-modal="true"
        className="fixed inset-0 z-50 overflow-y-auto bg-[#000000]"
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

  // Saat sudah login: tampilkan Workspace & BYOK AI Manager dengan palet Luminous Obsidian
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl rounded-[26px] border border-white/[0.08] bg-[#09090b] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.95)] sm:p-7"
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-xl bg-[#DE7C56] text-sm font-bold text-white shadow-[0_4px_16px_rgba(222,124,86,0.35)] ring-1 ring-[#DE7C56]/30">
              P
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#DE7C56]">
                Workspace & BYOK AI Manager
              </p>
              <h3 className="mt-0.5 text-base font-semibold text-zinc-100">{user.email}</h3>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onSignOut}
              className="rounded-lg border border-white/10 bg-[#121217] px-3 py-1.5 text-xs font-medium text-zinc-400 transition hover:border-white/20 hover:bg-[#1a1a20] hover:text-white"
            >
              Sign Out
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup modal"
              className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-white/10 hover:text-white"
            >
              <Icon name="x" className="size-4" />
            </button>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <div className="flex gap-2 rounded-xl border border-white/[0.08] bg-[#0c0c10] p-1">
            <button
              type="button"
              onClick={() => {
                setActiveTab('connection');
                onClearError?.();
              }}
              className={`flex-1 rounded-lg py-2 text-xs font-semibold transition ${
                activeTab === 'connection'
                  ? 'bg-[#DE7C56] text-white shadow-[0_4px_14px_rgba(222,124,86,0.3)]'
                  : 'text-zinc-400 hover:text-white'
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
                  ? 'bg-[#DE7C56] text-white shadow-[0_4px_14px_rgba(222,124,86,0.3)]'
                  : 'text-zinc-400 hover:text-white'
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
