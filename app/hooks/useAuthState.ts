'use client';

import { useEffect, useState } from 'react';
import { emit, on } from './useEventBus';
import { resetRegistrationCache } from './useRegistrationData';

export interface AuthState {
  loggedIn: boolean;
  kind?: 'vitian' | 'non-vitian';
  username?: string;
}

let cache: AuthState | null = null;
let inflight: Promise<AuthState> | null = null;

async function fetchAuthState(): Promise<AuthState> {
  try {
    const res = await fetch('/api/technovit/session');
    if (!res.ok) return { loggedIn: false };
    return (await res.json()) as AuthState;
  } catch {
    return { loggedIn: false };
  }
}

function load(): Promise<AuthState> {
  if (cache) return Promise.resolve(cache);
  if (!inflight) {
    inflight = fetchAuthState().then((data) => {
      cache = data;
      inflight = null;
      return data;
    });
  }
  return inflight;
}

export function useAuthState(): AuthState & { checked: boolean } {
  const [state, setState] = useState<AuthState | null>(cache);

  useEffect(() => {
    let active = true;
    if (!cache) {
      load().then((data) => {
        if (active) setState(data);
      });
    }
    const off = on<AuthState>('auth:changed', (payload) => {
      if (!payload) return;
      cache = payload;
      if (active) setState(payload);
    });
    return () => {
      active = false;
      off();
    };
  }, []);

  return { loggedIn: false, ...state, checked: state !== null };
}

export async function logout() {
  await fetch('/api/technovit/logout', { method: 'POST' }).catch(() => {});
  resetRegistrationCache();
  cache = { loggedIn: false };
  emit<AuthState>('auth:changed', { loggedIn: false });
}

export function openLogin() {
  emit('login:open');
}
