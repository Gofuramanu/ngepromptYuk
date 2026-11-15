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
  const [accountError, setAccountError] = useState<string | null>(null);

  useEffect(() => {
    // Tangkap access_token dari URL hash jika kembali dari redirect OAuth (Google / GitHub)
    if (typeof window !== 'undefined' && window.location.hash.includes('access_token=')) {
      const params = new URLSearchParams(window.location.hash.slice(1));
      const hashToken = params.get('access_token');
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
