'use client';


type Handler<T> = (payload: T) => void;

const listeners = new Map<string, Set<Handler<unknown>>>();

export function emit<T = void>(event: string, payload?: T) {
  listeners.get(event)?.forEach((handler) => handler(payload));
}

export function on<T = void>(event: string, handler: Handler<T>) {
  if (!listeners.has(event)) listeners.set(event, new Set());
  const wide = handler as Handler<unknown>;
  listeners.get(event)!.add(wide);
  return () => {
    listeners.get(event)?.delete(wide);
  };
}
