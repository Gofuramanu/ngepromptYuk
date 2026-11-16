import { useCallback, useEffect, useState } from 'react';
import {
  authenticateAccount,
  deletePromptFromWorkspace,
  deleteUserAiConnection,
  fetchCurrentSession,
  getOAuthAuthorizeUrl,
  getSessionToken,
  savePromptToWorkspace,
  saveUserAiConnection,
  setSessionToken,
} from '../services/accountService';
import type {
  AuthMode,
  OAuthProviderId,
  SaveConnectionInput,
  SavePromptInput,
  SavedPromptItem,
  UserAIConnectionPublic,
  UserProfile,
} from '../types/account';

// Mengelola sesi login user, ruang penyimpanan Master Prompt per-user, dan konfigurasi BYOK AI.
export function useUserAccount() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [connection, setConnection] = useState<UserAIConnectionPublic | null>(null);
  const [prompts, setPrompts] = useState<SavedPromptItem[]>([]);
  const [isAccountBusy, setIsAccountBusy] = useState<boolean>(false);
  const [accountError, setAccountError] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const searchParams = new URLSearchParams(window.location.search);
    return (
      hashParams.get('error_description') ||
      searchParams.get('error_description') ||
      hashParams.get('error') ||
      searchParams.get('error') ||
      null
    );
  });

  useEffect(() => {
    // Tangkap access_token atau error dari URL jika kembali dari redirect OAuth (Google / GitHub)
    if (typeof window !== 'undefined') {
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
      const searchParams = new URLSearchParams(window.location.search);

      if (
        hashParams.has('error') ||
        hashParams.has('error_description') ||
        searchParams.has('error') ||
        searchParams.has('error_description')
      ) {
        window.history.replaceState(null, '', window.location.pathname);
        return;
      }

      const hashToken = hashParams.get('access_token');
      if (hashToken) {
        setSessionToken(hashToken);
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    }

    const token = getSessionToken();
    if (!token) return;

    let cancelled = false;
    fetchCurrentSession()
      .then((data) => {
        if (cancelled || !data?.user) return;
        setUser(data.user);
        setConnection(data.connection || null);
        setPrompts(data.prompts || []);
      })
      .catch(() => {
        if (!cancelled) {
          setSessionToken('');
          setUser(null);
          setConnection(null);
          setPrompts([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const authenticate = useCallback(
    async (mode: AuthMode, email: string, password: string): Promise<boolean> => {
      setIsAccountBusy(true);
      setAccountError(null);
      try {
        const data = await authenticateAccount(mode, email, password);
        setUser(data.user);
        setConnection(data.connection || null);
        setPrompts(data.prompts || []);
        return true;
      } catch (err) {
        setAccountError((err as Error).message);
        return false;
      } finally {
        setIsAccountBusy(false);
      }
    },
    []
  );

  const signOut = useCallback(() => {
    setSessionToken('');
    setUser(null);
    setConnection(null);
    setPrompts([]);
    setAccountError(null);
  }, []);

  const saveConnection = useCallback(async (input: SaveConnectionInput): Promise<boolean> => {
    setIsAccountBusy(true);
    setAccountError(null);
    try {
      const updated = await saveUserAiConnection(input);
      setConnection(updated);
      return true;
    } catch (err) {
      setAccountError((err as Error).message);
      return false;
    } finally {
      setIsAccountBusy(false);
    }
  }, []);

  const removeConnection = useCallback(async (): Promise<boolean> => {
    setIsAccountBusy(true);
    setAccountError(null);
    try {
      await deleteUserAiConnection();
      setConnection(null);
      return true;
    } catch (err) {
      setAccountError((err as Error).message);
      return false;
    } finally {
      setIsAccountBusy(false);
    }
  }, []);

  const savePrompt = useCallback(async (promptPayload: SavePromptInput): Promise<boolean> => {
    setIsAccountBusy(true);
    setAccountError(null);
    try {
      const nextList = await savePromptToWorkspace(promptPayload);
      setPrompts(nextList);
      return true;
    } catch (err) {
      setAccountError((err as Error).message);
      return false;
    } finally {
      setIsAccountBusy(false);
    }
  }, []);

  const removePrompt = useCallback(async (promptId: string): Promise<boolean> => {
    setIsAccountBusy(true);
    setAccountError(null);
    try {
      const nextList = await deletePromptFromWorkspace(promptId);
      setPrompts(nextList);
      return true;
    } catch (err) {
      setAccountError((err as Error).message);
      return false;
    } finally {
      setIsAccountBusy(false);
    }
  }, []);

  const startOAuth = useCallback(async (provider: OAuthProviderId): Promise<void> => {
    setIsAccountBusy(true);
    setAccountError(null);
    try {
      const url = await getOAuthAuthorizeUrl(provider);
      if (url && typeof window !== 'undefined') {
        window.location.assign(url);
      }
    } catch (err) {
      setAccountError((err as Error).message);
    } finally {
      setIsAccountBusy(false);
    }
  }, []);

  const clearAccountError = useCallback(() => setAccountError(null), []);

  return {
    user,
    connection,
    prompts,
    isAccountBusy,
    accountError,
    authenticate,
    startOAuth,
    signOut,
    saveConnection,
    removeConnection,
    savePrompt,
    removePrompt,
    clearAccountError,
  };
}
