'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ChatCircleDots, PaperPlaneRight, X } from '@phosphor-icons/react';
import { on } from '../hooks/useEventBus';
import { useStackOffset, useElementHeight, useBroadcastHeight, STACK_GAP } from '../hooks/useBottomStack';
import { playSound } from './SoundManager';

type Turn = { role: 'user' | 'model'; text: string };

const HISTORY_LIMIT = 10;

const OPENERS = [
  'Find me two cybersec events',
  "What's on today?",
  'Any free events?',
];

// The route answers with a code when it cannot reach Gemini. Say what the
// student should do instead of surfacing the code.
const FAILURES: Record<string, string> = {
  rate_limited: "You're asking faster than I can keep up. Give it a minute.",
  ai_unavailable: "I'm resting — too many questions at once. The events page has everything I'd tell you.",
  not_configured: "I'm not switched on yet. The events page has the full list.",
  events_unavailable: "I can't reach the event list right now. Try the events page.",
};
const GENERIC_FAILURE = "That didn't go through. Try again, or check the events page.";

// Bold is the only markup the model is allowed, so this is the whole renderer.
// Splitting on the delimiter means a half-arrived "**Capture the Fl" simply
// renders bold as it streams, instead of flashing raw asterisks.
function renderBold(text: string) {
  return text.split('**').map((part, i) =>
    i % 2 ? (
      <strong key={i} className="font-semibold text-white">
        {part}
      </strong>
    ) : (
      part
    )
  );
}

export default function AskTechnova() {
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [draft, setDraft] = useState('');
  const [thinking, setThinking] = useState(false);

  const soundIconOffset = useStackOffset('sound-icon');
  const soundIconHeight = useElementHeight('sound-icon-self');
  const buttonRef = useBroadcastHeight<HTMLButtonElement>('chat-icon-self');

  const inputRef = useRef<HTMLInputElement>(null);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => on<boolean>('terminal:open', setTerminalOpen), []);

  // Follow the answer as it streams in.
  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [turns, thinking]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  async function ask(question: string) {
    const message = question.trim();
    if (!message || thinking) return;

    playSound('ask');
    const history = turns.slice(-HISTORY_LIMIT);
    setTurns((prev) => [...prev, { role: 'user', text: message }]);
    setDraft('');
    setThinking(true);

    const fail = (text: string) => setTurns((prev) => [...prev, { role: 'model', text }]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, history }),
      });

      if (!res.ok || !res.body) {
        const code = await res
          .json()
          .then((body: { code?: string }) => body.code)
          .catch(() => undefined);
        fail((code && FAILURES[code]) || GENERIC_FAILURE);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let started = false;

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        if (!chunk) continue;

        if (!started) {
          started = true;
          setThinking(false);
          setTurns((prev) => [...prev, { role: 'model', text: chunk }]);
          continue;
        }
        setTurns((prev) => {
          const next = [...prev];
          next[next.length - 1] = { role: 'model', text: next[next.length - 1].text + chunk };
          return next;
        });
      }

      if (!started) fail(GENERIC_FAILURE);
    } catch {
      fail(GENERIC_FAILURE);
    } finally {
      setThinking(false);
    }
  }

  const streaming = !thinking && turns.length > 0 && turns[turns.length - 1].role === 'model';
  const buttonVisible = !terminalOpen && !open;

  return (
    <>
      <AnimatePresence>
        {buttonVisible && (
          <motion.button
            key="ask-technova-button"
            ref={buttonRef}
            onClick={() => {
              playSound('ask');
              setOpen(true);
            }}
            aria-label="Ask Technova about the fest"
            data-cursor="Ask"
            initial={reduceMotion ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: -(soundIconHeight + STACK_GAP + soundIconOffset) }}
            exit={reduceMotion ? undefined : { opacity: 0, y: 24 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
            className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-[200] w-9 h-9 sm:w-10 sm:h-10 rounded-full
              border border-[#84C87F]/30 bg-[#064928] text-[#84C87F] flex items-center justify-center shadow-lg
              hover:bg-[#84C87F] hover:text-[#064928] hover:border-[#84C87F] transition-colors
              focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#84C87F]"
          >
            <ChatCircleDots size={17} weight="bold" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Backdrop only where the panel covers the page. */}
      <div
        aria-hidden
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-[100000] bg-black/70 backdrop-blur-sm sm:hidden transition-opacity duration-200
          ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      />

      <AnimatePresence>
        {open && (
          <motion.div
            key="ask-technova-panel"
            role="dialog"
            aria-label="Ask Technova"
            data-no-context-menu
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            className="fixed z-[100001] bottom-4 right-4 left-4 sm:left-auto sm:bottom-8 sm:right-8
              sm:w-[400px] max-h-[76dvh] flex flex-col
              rounded-xl overflow-hidden border border-[#84C87F]/25 bg-[#03080a]
              shadow-[0_0_0_1px_rgba(132,200,127,0.15),0_40px_100px_rgba(0,0,0,0.85)]"
          >
            <header className="flex items-center justify-between px-4 py-2.5 bg-[#080f09] border-b border-[#84C87F]/10 shrink-0">
              <div className="flex items-center gap-2 font-terminal">
                <span className="w-1.5 h-1.5 rounded-full bg-[#84C87F]" />
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#84C87F]/70">Technova</span>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="text-[#84C87F]/50 hover:text-[#84C87F] transition-colors
                  focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#84C87F]"
              >
                <X size={14} weight="bold" />
              </button>
            </header>

            <div ref={logRef} className="terminal-scroll min-h-0 flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {turns.length === 0 && (
                <div className="space-y-4 py-2">
                  <p className="font-clash font-bold leading-[1.1] text-2xl text-white">
                    Ask me about
                    <br />
                    <span className="text-[#84C87F]">the fest.</span>
                  </p>
                  <p className="text-white/60 text-sm leading-relaxed">
                    Every event, every venue, every price. I only know TechnoVIT.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {OPENERS.map((opener) => (
                      <button
                        key={opener}
                        onClick={() => ask(opener)}
                        className="font-terminal text-[11px] px-2.5 py-1.5 rounded-full border border-[#84C87F]/25
                          text-[#84C87F]/80 hover:bg-[#84C87F] hover:text-[#064928] hover:border-[#84C87F] transition-colors
                          focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#84C87F]"
                      >
                        {opener}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {turns.map((turn, i) =>
                turn.role === 'user' ? (
                  <motion.p
                    key={i}
                    initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 420, damping: 30 }}
                    className="ml-auto w-fit max-w-[85%] rounded-lg rounded-br-sm bg-[#064928] px-3 py-2
                      text-sm text-[#c2e0a5] leading-relaxed"
                  >
                    {turn.text}
                  </motion.p>
                ) : (
                  <p key={i} className="max-w-[92%] text-sm text-white/85 leading-relaxed whitespace-pre-wrap">
                    {renderBold(turn.text)}
                    {streaming && i === turns.length - 1 && (
                      <span className="terminal-cursor ml-0.5 text-[#84C87F]">▊</span>
                    )}
                  </p>
                )
              )}

              {thinking && (
                <p className="font-terminal text-[11px] text-[#84C87F]/70">
                  <span className="text-[#84C87F]/40">&gt;</span> reading the event list
                  <span className="terminal-cursor ml-1 text-[#84C87F]">▊</span>
                </p>
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                ask(draft);
              }}
              className="flex items-center gap-2 px-3 py-2.5 border-t border-[#84C87F]/10 bg-[#080f09] shrink-0"
            >
              <input
                ref={inputRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                maxLength={500}
                placeholder="Ask about any event"
                aria-label="Your question"
                className="flex-1 min-w-0 bg-transparent font-terminal text-[13px] text-white
                  placeholder:text-[#84C87F]/35 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!draft.trim() || thinking}
                aria-label="Send"
                className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-colors
                  bg-[#064928] text-[#84C87F] border border-[#84C87F]/30
                  enabled:hover:bg-[#84C87F] enabled:hover:text-[#064928] disabled:opacity-30
                  focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#84C87F]"
              >
                <PaperPlaneRight size={13} weight="bold" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
