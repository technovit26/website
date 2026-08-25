'use client';

import { useEffect, useState } from 'react';
import { emit, on } from './useEventBus';
import { resetRegistrationCache } from './useRegistrationData';

export interface AuthState {
  loggedIn: boolean;
  kind?: 'vitian' | 'non-vitian';
  username?: string;
}

export function useAuthState() {
  const [state, setState] = useState<AuthState>({ loggedIn: false });

  useEffect(() => {
    let active = true;
    fetch('/api/technovit/session')
      .then((res) => res.json())
      .then((data: AuthState) => {
        if (active) setState(data);
      })
      .catch(() => {});
    const off = on<AuthState>('auth:changed', (payload) => {
      if (payload) setState(payload);
    });
    return () => {
      active = false;
      off();
    };
  }, []);

  return state;
}

export async function logout() {
  await fetch('/api/technovit/logout', { method: 'POST' }).catch(() => {});
  resetRegistrationCache();
  emit<AuthState>('auth:changed', { loggedIn: false });
}

export function openLogin() {
  emit('login:open');
}
