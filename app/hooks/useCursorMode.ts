'use client';


export type CursorMode = string;

type Listener = (mode: CursorMode) => void;
const listeners = new Set<Listener>();
let currentMode: CursorMode = '';

export function setCursorMode(mode: CursorMode) {
  if (mode === currentMode) return;
  currentMode = mode;
  listeners.forEach((fn) => fn(mode));
}

export function subscribeCursorMode(fn: Listener) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function getCurrentCursorMode() {
  return currentMode;
}
