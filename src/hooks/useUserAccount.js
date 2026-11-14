import { useCallback, useEffect, useState } from 'react';
import {
  authenticateAccount,
  deletePromptFromWorkspace,
  deleteUserAiConnection,
  fetchCurrentSession,
  getSessionToken,
  savePromptToWorkspace,
  saveUserAiConnection,
  setSessionToken,
} from '../services/accountService';

// Mengelola sesi login user, ruang penyimpanan Master Prompt per-user, dan konfigurasi BYOK AI.
export function useUserAccount() {
  const [user, setUser] = useState(null);
  const [connection, setConnection] = useState(null);
  const [prompts, setPrompts] = useState([]);
  const [isAccountBusy, setIsAccountBusy] = useState(false);
  const [accountError, setAccountError] = useState(null);

  useEffect(() => {
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

  const authenticate = useCallback(async (mode, email, password) => {
    setIsAccountBusy(true);
    setAccountError(null);
    try {
      const data = await authenticateAccount(mode, email, password);
      setUser(data.user);
      setConnection(data.connection || null);
      setPrompts(data.prompts || []);
      return true;
    } catch (err) {
      setAccountError(err.message);
      return false;
    } finally {
      setIsAccountBusy(false);
    }
  }, []);

  const signOut = useCallback(() => {
    setSessionToken('');
    setUser(null);
    setConnection(null);
    setPrompts([]);
    setAccountError(null);
  }, []);

  const saveConnection = useCallback(async (input) => {
    setIsAccountBusy(true);
    setAccountError(null);
    try {
      const updated = await saveUserAiConnection(input);
      setConnection(updated);
      return true;
    } catch (err) {
      setAccountError(err.message);
      return false;
    } finally {
      setIsAccountBusy(false);
    }
  }, []);

  const removeConnection = useCallback(async () => {
    setIsAccountBusy(true);
    setAccountError(null);
    try {
      await deleteUserAiConnection();
      setConnection(null);
      return true;
    } catch (err) {
      setAccountError(err.message);
      return false;
    } finally {
      setIsAccountBusy(false);
    }
  }, []);

  const savePrompt = useCallback(async (promptPayload) => {
    setIsAccountBusy(true);
    setAccountError(null);
    try {
      const nextList = await savePromptToWorkspace(promptPayload);
      setPrompts(nextList);
      return true;
    } catch (err) {
      setAccountError(err.message);
      return false;
    } finally {
      setIsAccountBusy(false);
    }
  }, []);

  const removePrompt = useCallback(async (promptId) => {
    setIsAccountBusy(true);
    setAccountError(null);
    try {
      const nextList = await deletePromptFromWorkspace(promptId);
      setPrompts(nextList);
      return true;
    } catch (err) {
      setAccountError(err.message);
      return false;
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
    signOut,
    saveConnection,
    removeConnection,
    savePrompt,
    removePrompt,
    clearAccountError,
  };
}
