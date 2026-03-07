import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { useInternetIdentity } from "./useInternetIdentity";

export interface StoredAccount {
  principal: string;
  displayName?: string;
  channelName?: string;
  addedAt: number;
}

const STORAGE_KEY = "mediaShare_accounts";

function loadAccounts(): StoredAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as StoredAccount[];
  } catch {
    return [];
  }
}

function saveAccounts(accounts: StoredAccount[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
  } catch {
    // ignore storage errors
  }
}

export function useMultiAccount() {
  const { identity, login, clear, isLoggingIn } = useInternetIdentity();
  const queryClient = useQueryClient();
  const [accounts, setAccounts] = useState<StoredAccount[]>(loadAccounts);

  const currentPrincipal =
    identity && !identity.getPrincipal().isAnonymous()
      ? identity.getPrincipal().toString()
      : null;

  // When identity changes (login/logout), sync the accounts list
  useEffect(() => {
    if (!currentPrincipal) return;

    setAccounts((prev) => {
      const exists = prev.some((a) => a.principal === currentPrincipal);
      if (exists) return prev;
      const updated = [
        ...prev,
        { principal: currentPrincipal, addedAt: Date.now() },
      ];
      saveAccounts(updated);
      return updated;
    });
  }, [currentPrincipal]);

  // Update display name for the active account
  const updateActiveAccountName = useCallback(
    (displayName: string, channelName?: string) => {
      if (!currentPrincipal) return;
      setAccounts((prev) => {
        const updated = prev.map((a) =>
          a.principal === currentPrincipal
            ? { ...a, displayName, channelName }
            : a,
        );
        saveAccounts(updated);
        return updated;
      });
    },
    [currentPrincipal],
  );

  // Add a new account — logs out current session then triggers II login popup
  const addAccount = useCallback(() => {
    clear();
    queryClient.clear();
    setTimeout(() => {
      login();
    }, 350);
  }, [clear, login, queryClient]);

  // Remove an account from the stored list; if active, also log out
  const removeAccount = useCallback(
    (principal: string) => {
      const isActive = principal === currentPrincipal;

      setAccounts((prev) => {
        const updated = prev.filter((a) => a.principal !== principal);
        saveAccounts(updated);
        return updated;
      });

      if (isActive) {
        clear();
        queryClient.clear();
      }
    },
    [currentPrincipal, clear, queryClient],
  );

  // Sign out current account (keep it in the list for quick re-login)
  const signOutCurrent = useCallback(() => {
    clear();
    queryClient.clear();
  }, [clear, queryClient]);

  return {
    accounts,
    currentPrincipal,
    isLoggingIn,
    addAccount,
    removeAccount,
    signOutCurrent,
    updateActiveAccountName,
  };
}
