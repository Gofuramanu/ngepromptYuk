import { useState } from 'react';
import { PROVIDER_CATALOG } from '../services/accountService';
import Icon from './Icon';

function AuthForm({ isBusy, error, onSubmit, onClearError }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit(mode, email, password);
  };

  return (
    <div className="space-y-5">
      <div className="flex gap-2 rounded-xl border border-white/[0.08] bg-[#09090b]/80 p-1">
        <button
          type="button"
          onClick={() => {
            setMode('login');
            onClearError?.();
          }}
          className={`flex-1 rounded-lg py-2 text-xs font-semibold transition ${
            mode === 'login' ? 'bg-orange-500 text-white' : 'text-zinc-400 hover:text-white'
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => {
            setMode('signup');
            onClearError?.();
          }}
          className={`flex-1 rounded-lg py-2 text-xs font-semibold transition ${
            mode === 'signup' ? 'bg-orange-500 text-white' : 'text-zinc-400 hover:text-white'
          }`}
        >
          Sign Up (Buat Akun)
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label htmlFor="auth-email" className="block text-xs font-medium text-zinc-300">
            Email
          </label>
          <input
            id="auth-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nama@email.com"
            className="mt-1 w-full rounded-xl border border-white/[0.08] bg-[#09090b]/90 px-3.5 py-2.5 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20"
          />
        </div>

        <div>
          <label htmlFor="auth-password" className="block text-xs font-medium text-zinc-300">
            Password
          </label>
          <input
            id="auth-password"
            type="password"
            required
            minLength={6}
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimal 6 karakter"
            className="mt-1 w-full rounded-xl border border-white/[0.08] bg-[#09090b]/90 px-3.5 py-2.5 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20"
          />
        </div>

        {error && (
          <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-xs text-rose-200">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isBusy}
          className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 py-2.5 text-xs font-semibold text-white shadow-lg shadow-orange-500/25 transition hover:from-orange-400 hover:to-orange-500 disabled:opacity-50"
        >
          {isBusy
            ? 'Memproses...'
            : mode === 'login'
            ? 'Masuk ke Workspace'
            : 'Buat Akun & Workspace'}
        </button>
      </form>

      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5 text-xs leading-relaxed text-zinc-400">
        <p className="font-semibold text-zinc-200">Catatan Koneksi AI Pribadi (BYOK):</p>
        <p className="mt-1">
          Setelah login, Anda dapat menautkan API Key milik Anda sendiri (Gemini AI Studio, Claude Console, OpenAI Platform, atau OpenRouter). API Key dienkripsi dengan <strong>AES-256-GCM</strong> di server dan tidak pernah terekspos ke browser.
        </p>
      </div>
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
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/[0.08] bg-white/[0.02] px-3.5 py-2.5">
        <div className="text-xs">
          <span className="text-zinc-400">Status Koneksi AI: </span>
          {connection?.isActive ? (
            <span className="font-semibold text-emerald-400">
              Aktif ({connection.provider} · {connection.model} · Key {connection.keyHint})
            </span>
          ) : (
            <span className="font-medium text-amber-300">
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
          <label htmlFor="byok-provider" className="block text-xs font-medium text-zinc-300">
            Provider AI
          </label>
          <select
            id="byok-provider"
            value={provider}
            onChange={(e) => handleProviderChange(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/[0.08] bg-[#09090b] px-3 py-2.5 text-xs text-zinc-100 outline-none focus:border-orange-500/50"
          >
            {PROVIDER_CATALOG.map((item) => (
              <option key={item.id} value={item.id}>
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
            className="mt-1 w-full rounded-xl border border-white/[0.08] bg-[#09090b] px-3 py-2 text-xs text-zinc-100 outline-none focus:border-orange-500/50"
          />
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {selectedMeta.suggestedModels.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setModel(preset)}
                className={`rounded-md border px-2 py-0.5 font-mono text-[10px] transition ${
                  model === preset
                    ? 'border-orange-500/50 bg-orange-500/15 text-orange-200'
                    : 'border-white/[0.08] bg-white/[0.03] text-zinc-400 hover:text-zinc-200'
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
            className="mt-1 w-full rounded-xl border border-white/[0.08] bg-[#09090b] px-3.5 py-2 text-xs text-zinc-100 outline-none focus:border-orange-500/50"
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
              className="text-[11px] font-medium text-orange-300 hover:text-orange-200"
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
          className="mt-1 w-full rounded-xl border border-white/[0.08] bg-[#09090b] px-3.5 py-2 text-xs text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-orange-500/50"
        />
      </div>

      <label className="flex cursor-pointer items-center gap-2 text-xs text-zinc-300">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="rounded border-white/20 bg-zinc-900 text-orange-500 focus:ring-orange-500"
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
          Koneksi AI berhasil dienkripsi dan disimpan ke akun Anda.
        </p>
      )}

      <button
        type="submit"
        disabled={isBusy}
        className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 py-2.5 text-xs font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:from-orange-400 hover:to-orange-500 disabled:opacity-50"
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
          className="flex-1 rounded-xl border border-white/[0.08] bg-[#09090b] px-3.5 py-2 text-xs text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-orange-500/50"
        />
        <button
          type="submit"
          disabled={isBusy}
          className="shrink-0 rounded-xl bg-orange-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-orange-400 disabled:opacity-50"
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
          <p className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 text-center text-xs text-zinc-400">
            Belum ada Master Prompt tersimpan di akun Anda.
          </p>
        ) : (
          prompts.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-[#09090b]/80 px-3.5 py-2.5"
            >
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-zinc-100">{item.title}</p>
                <p className="truncate text-[11px] text-zinc-400">
                  {item.shortPrompt || 'Tanpa deskripsi singkat'}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => onLoadPrompt(item)}
                  className="rounded-lg border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[11px] font-medium text-zinc-200 transition hover:bg-white/10"
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

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass-card w-full max-w-xl rounded-2xl border border-white/10 bg-[#0d0e12]/95 p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/[0.08] pb-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-orange-400">
              {user ? 'Workspace & BYOK AI Manager' : 'Autentikasi Multi-User'}
            </p>
            <h3 className="mt-1 text-lg font-bold text-white">
              {user ? user.email : 'Masuk ke Prompt Craftsman'}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {user && (
              <button
                type="button"
                onClick={onSignOut}
                className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:bg-white/10 hover:text-white"
              >
                Sign Out
              </button>
            )}
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

        <div className="mt-5">
          {!user ? (
            <AuthForm
              isBusy={isBusy}
              error={error}
              onSubmit={onAuthenticate}
              onClearError={onClearError}
            />
          ) : (
            <div className="space-y-4">
              <div className="flex gap-2 rounded-xl border border-white/[0.08] bg-[#09090b]/80 p-1">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('connection');
                    onClearError?.();
                  }}
                  className={`flex-1 rounded-lg py-2 text-xs font-semibold transition ${
                    activeTab === 'connection'
                      ? 'bg-orange-500 text-white'
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
                      ? 'bg-orange-500 text-white'
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
          )}
        </div>
      </div>
    </div>
  );
}
