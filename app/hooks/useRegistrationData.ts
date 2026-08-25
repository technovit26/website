'use client';

import { useEffect, useState } from 'react';
import { emit, on } from './useEventBus';

export interface RegisteredInfo {
  paid: boolean;
  amount: number | null;
  payUrl: string | null;
}

export interface RegistrationData {
  matched: Record<string, string>;
  registered: Record<string, RegisteredInfo>;
}

const EMPTY: RegistrationData = { matched: {}, registered: {} };

let cache: RegistrationData | null = null;
let inflight: Promise<RegistrationData> | null = null;

async function fetchRegistrationData(): Promise<RegistrationData> {
  try {
    const res = await fetch('/api/technovit/events');
    if (!res.ok) return EMPTY;
    const data = await res.json();
    return { matched: data.matched ?? {}, registered: data.registered ?? {} };
  } catch {
    return EMPTY;
  }
}

function load(): Promise<RegistrationData> {
  if (cache) return Promise.resolve(cache);
  if (!inflight) {
    inflight = fetchRegistrationData().then((data) => {
      cache = data;
      inflight = null;
      emit<RegistrationData>('registration-data:updated', data);
      return data;
    });
  }
  return inflight;
}

export function useRegistrationData(enabled: boolean): RegistrationData | null {
  const [data, setData] = useState<RegistrationData | null>(cache);

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    load().then((d) => {
      if (active) setData(d);
    });
    const off = on<RegistrationData>('registration-data:updated', (d) => {
      if (active) setData(d);
    });
    return () => {
      active = false;
      off();
    };
  }, [enabled]);

  return data;
}

export function markRegisteredLocally(cmsEventId: string, info: RegisteredInfo) {
  const next: RegistrationData = {
    matched: cache?.matched ?? {},
    registered: { ...(cache?.registered ?? {}), [cmsEventId]: info },
  };
  cache = next;
  emit<RegistrationData>('registration-data:updated', next);
}

export function resetRegistrationCache() {
  cache = null;
  inflight = null;
}
