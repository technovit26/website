'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import { TerminalWindow } from '@phosphor-icons/react';
import { useLenis } from './SmoothScrolling';
import { emit, on } from '../hooks/useEventBus';
import { playSound, requestSoundMute, soundEngine } from './SoundManager';

export const TERMINAL_SEEN_KEY = 'technovit_terminal_seen';

type Line =
  | { type: 'output' | 'input' | 'accent'; text: string }
  | { type: 'custom'; node: ReactNode; key: string };

const PROMPT = 'guest@technovit:~$';

const BOOT_LINES: Line[] = [
  { type: 'output', text: 'TechnoVIT Terminal v1.0.0' },
  { type: 'output', text: "Type 'help' to see available commands." },
];

const CREDITS_ROWS = [
  'SYSTEM DESIGN ..... The Website Team',
  'ENGINEERING ....... The Website Team',
  'VISUAL DIRECTION .. The Website Team',
  'CHAOS TESTING ..... You, right now',
];
const CREDITS_ROW_DELAY = 120;
const CREDITS_ROW_DURATION = 300;

const NAV_COMMANDS: Record<string, string> = {
  home: '/',
  events: '/events',
  team: '/team',
  gallery: '/gallery',
  sponsors: '/sponsors',
  about: '/about',
};

const NO_ARG_COMMANDS = new Set([
  'help',
  'clear',
  'whoami',
  'date',
  'hype',
  'theme',
  'konami',
  'signal',
  'credits',
  'ping',
  'exit',
  'mute',
  'unmute',
  ...Object.keys(NAV_COMMANDS),
]);

const HYPE_LINES = [
  'Two days. Every discipline. Compile your excitement.',
  '50+ events queued in the runtime.',
  '5000+ minds, zero merge conflicts.',
  'Booting confidence.exe ...',
  "TechnoVIT'26 — no segfaults, just hype.",
];

const HINT_MESSAGES = [
  'psst. try ctrl + `',
  "there's a terminal hiding here",
  'ctrl + ` unlocks something',
  'power users only: ctrl + `',
];
const HINT_MIN_DELAY = 12000;
const HINT_MAX_DELAY = 20000;
const HINT_VISIBLE_MS = 4000;
const HINT_MAX_POKES = 5;

const SUDO_LINES = [
  'Permission denied. Nice try though.',
  "Don't try to be sneaky.",
  "guest@technovit is not in the sudoers file. This incident will be reported.",
  "This isn't that kind of terminal.",
  'Access denied. Root does not live here.',
  'Nice attempt. Still just a guest.',
];

const UNAVAILABLE_LINES = [
  'works only on your computer',
  "this shell doesn't leave the browser",
  'nice try — that one only runs on real hardware',
  'not available here. try your actual terminal',
  'this is a website, not a Unix box',
  'that command exists. this terminal does not have it',
];

const UNAVAILABLE_COMMANDS = new Set([
  'ls', 'cat', 'cd', 'pwd', 'mkdir', 'touch', 'cp', 'mv', 'grep',
  'vim', 'vi', 'nano', 'emacs', 'top', 'htop', 'ps', 'kill',
  'chmod', 'chown', 'ssh', 'curl', 'wget', 'man', 'python', 'python3',
  'node', 'npm', 'git', 'history', 'find', 'less', 'more', 'su',
  'apt', 'docker',
]);

const pickRandom = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

function PingDemo({ onDone, abortRef }: { onDone: () => void; abortRef: React.RefObject<boolean> }) {
  const [replies, setReplies] = useState<string[]>([]);
  useEffect(() => {
    let count = 0;
    const id = setInterval(() => {
      if (abortRef.current) {
        clearInterval(id);
        return;
      }
      count++;
      const ms = (8 + Math.random() * 30).toFixed(1);
      setReplies((r) => [...r, `Reply from 172.26.4.${10 + count}: bytes=32 time=${ms}ms TTL=57`]);
      if (count >= 4) {
        clearInterval(id);
        if (!abortRef.current) setTimeout(onDone, 150);
      }
    }, 380);
    return () => clearInterval(id);
  }, [onDone, abortRef]);
  return (
    <div className="space-y-0.5">
      {replies.map((r, i) => (
        <div key={i}>{r}</div>
      ))}
    </div>
  );
}

function CreditsDemo({ onDone, abortRef }: { onDone: () => void; abortRef: React.RefObject<boolean> }) {
  useEffect(() => {
    const total = (CREDITS_ROWS.length - 1) * CREDITS_ROW_DELAY + CREDITS_ROW_DURATION;
    const id = setTimeout(() => {
      if (!abortRef.current) onDone();
    }, total);
    return () => clearTimeout(id);
  }, [onDone, abortRef]);
  return (
    <div className="space-y-0.5">
      {CREDITS_ROWS.map((r, i) => (
        <motion.div
          key={r}
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: (i * CREDITS_ROW_DELAY) / 1000, duration: CREDITS_ROW_DURATION / 1000 }}
        >
          {r}
        </motion.div>
      ))}
    </div>
  );
}

export default function Terminal() {
  const router = useRouter();
  const lenis = useLenis();
  const [isTouchDevice] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches
  );
  const [open, setOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lines, setLines] = useState<Line[]>([]);
  const [input, setInput] = useState('');
  const [caretIndex, setCaretIndex] = useState(0);
  const [charWidth, setCharWidth] = useState(7.8);
  const [history, setHistory] = useState<string[]>([]);
  const [, setHistoryIndex] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [hintMessage, setHintMessage] = useState(HINT_MESSAGES[0]);
  const [busy, setBusy] = useState(false);

  const hasBooted = useRef(false);
  const abortRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const appendLine = useCallback((line: Line) => setLines((prev) => [...prev, line]), []);
  const appendOutput = useCallback(
    (text: string, accent = false) => appendLine({ type: accent ? 'accent' : 'output', text }),
    [appendLine]
  );

  const minimize = useCallback(() => {
    playSound('toggle');
    setOpen(false);
  }, []);

  const openTerminal = useCallback(() => {
    playSound('toggle');
    setShowHint(false);
    try {
      localStorage.setItem(TERMINAL_SEEN_KEY, '1');
    } catch {}
    if (!hasBooted.current) {
      hasBooted.current = true;
      setLines(BOOT_LINES);
    }
    setOpen(true);
  }, []);

  const toggleTerminal = useCallback(() => {
    if (open) minimize();
    else openTerminal();
  }, [open, minimize, openTerminal]);

  const cutTerminal = useCallback(() => {
    playSound('toggle');
    hasBooted.current = false;
    setLines([]);
    setInput('');
    setHistory([]);
    setHistoryIndex(null);
    setOpen(false);
  }, []);

  const toggleFullscreen = useCallback(() => setIsFullscreen((prev) => !prev), []);

  const runCommand = useCallback(
    (raw: string) => {
      const trimmed = raw.trim();
      if (!trimmed) return;

      setHistory((h) => [...h, trimmed]);
      setHistoryIndex(null);
      appendLine({ type: 'input', text: `${PROMPT} ${trimmed}` });
      playSound('click');

      const [cmd, ...rest] = trimmed.split(/\s+/);
      const arg = rest.join(' ');
      const lower = cmd.toLowerCase();

      if (rest.length > 0 && NO_ARG_COMMANDS.has(lower)) {
        playSound('denied');
        appendOutput(`${lower}: doesn't take arguments`, true);
        return;
      }

      if (UNAVAILABLE_COMMANDS.has(lower)) {
        playSound('denied');
        appendOutput(`${lower}: ${pickRandom(UNAVAILABLE_LINES)}`, true);
        return;
      }

      if (lower in NAV_COMMANDS) {
        appendOutput(`Navigating to ${NAV_COMMANDS[lower]} ...`, true);
        router.push(NAV_COMMANDS[lower]);
        return;
      }

      switch (lower) {
        case 'help':
          appendOutput('Navigation: home, events, team, gallery, sponsors, about');
          appendOutput('Utility: clear, whoami, date, echo <text>, mute, unmute');
          appendOutput('Fun: hype, ping, credits, konami, theme');
          break;
        case 'clear':
          setLines([]);
          return;
        case 'whoami':
          appendOutput('guest@technovit — read access only, full curiosity granted');
          break;
        case 'date':
          appendOutput(new Date().toString());
          break;
        case 'echo':
          appendOutput(arg);
          break;
        case 'hype':
          appendOutput(HYPE_LINES[Math.floor(Math.random() * HYPE_LINES.length)], true);
          break;
        case 'theme':
          appendOutput("It's green. It's always been green.", true);
          break;
        case 'konami':
          appendOutput('↑ ↑ ↓ ↓ ← → ← → B A — somewhere on this site, that means something.', true);
          break;
        case 'signal':
          appendOutput('Signal not found on this channel. Keep listening.', true);
          break;
        case 'credits':
          abortRef.current = false;
          setBusy(true);
          appendLine({
            type: 'custom',
            key: `credits-${Date.now()}`,
            node: <CreditsDemo abortRef={abortRef} onDone={() => setBusy(false)} />,
          });
          break;
        case 'ping':
          appendOutput('Pinging technovit.ac.in [172.26.4.10] with 32 bytes of data:');
          abortRef.current = false;
          setBusy(true);
          appendLine({
            type: 'custom',
            key: `ping-${Date.now()}`,
            node: (
              <PingDemo
                abortRef={abortRef}
                onDone={() => {
                  appendOutput('Ping statistics: 4 sent, 4 received, 0% loss');
                  setBusy(false);
                }}
              />
            ),
          });
          break;
        case 'mute':
          if (soundEngine?.muted) {
            appendOutput('Sound is already muted.', true);
          } else {
            requestSoundMute(true);
            appendOutput('Sound muted.', true);
          }
          break;
        case 'unmute':
          if (!soundEngine?.muted) {
            appendOutput('Sound is already unmuted.', true);
          } else {
            requestSoundMute(false);
            appendOutput('Sound unmuted.', true);
          }
          break;
        case 'sudo':
          playSound('denied');
          appendOutput(`sudo${arg ? `: ${arg}` : ''}: ${pickRandom(SUDO_LINES)}`, true);
          break;
        case 'rm':
          if (arg.includes('-rf') && arg.includes('/')) {
            playSound('denied');
            appendOutput('Nice try. The website survives.', true);
          } else {
            appendOutput(`rm: cannot remove '${arg}': Operation not permitted`);
          }
          break;
        case 'exit':
          cutTerminal();
          break;
        default:
          playSound('denied');
          appendOutput(`command not found: ${cmd} — type 'help'`, true);
      }
    },
    [appendLine, appendOutput, cutTerminal, router]
  );

  const syncCaret = () => setCaretIndex(inputRef.current?.selectionStart ?? input.length);

  const setInputWithCaretAtEnd = (next: string) => {
    setInput(next);
    setCaretIndex(next.length);
    requestAnimationFrame(() => inputRef.current?.setSelectionRange(next.length, next.length));
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key.length === 1 || e.key === 'Backspace' || e.key === 'Enter') emit('terminal:keystroke');

    if (e.key === 'Enter') {
      runCommand(input);
      setInputWithCaretAtEnd('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!history.length) return;
      setHistoryIndex((idx) => {
        const next = idx === null ? history.length - 1 : Math.max(0, idx - 1);
        setInputWithCaretAtEnd(history[next]);
        return next;
      });
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHistoryIndex((idx) => {
        if (idx === null) return null;
        const next = idx + 1;
        if (next >= history.length) {
          setInputWithCaretAtEnd('');
          return null;
        }
        setInputWithCaretAtEnd(history[next]);
        return next;
      });
    } else if (e.key === 'Escape') {
      minimize();
    } else {
      requestAnimationFrame(syncCaret);
    }
  };

  useEffect(() => {
    if (isTouchDevice) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.code === 'Backquote') {
        e.preventDefault();
        toggleTerminal();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isTouchDevice, toggleTerminal]);

  useEffect(() => {
    if (isTouchDevice) return;
    return on('terminal:request-open', openTerminal);
  }, [isTouchDevice, openTerminal]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (!e.ctrlKey || e.key.toLowerCase() !== 'c') return;
      e.preventDefault();
      playSound('denied');
      if (busy) {
        abortRef.current = true;
        setBusy(false);
        appendOutput('^C', true);
      } else {
        const currentInput = inputRef.current?.value ?? '';
        appendLine({ type: 'input', text: `${PROMPT} ${currentInput}^C` });
        setInput('');
        setCaretIndex(0);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, busy, appendOutput, appendLine]);

  useEffect(() => {
    emit('terminal:open', open);
  }, [open]);

  useEffect(() => {
    if (!open || busy) return;
    const raf = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(raf);
  }, [open, busy]);

  useEffect(() => {
    const measure = () => {
      const probe = document.createElement('span');
      probe.style.cssText = 'position:absolute;visibility:hidden;white-space:pre;font-size:13px;';
      probe.style.fontFamily = 'var(--font-terminal)';
      probe.textContent = '0'.repeat(20);
      document.body.appendChild(probe);
      const width = probe.getBoundingClientRect().width / 20;
      document.body.removeChild(probe);
      if (width > 0) setCharWidth(width);
    };
    measure();
    document.fonts?.ready.then(measure).catch(() => {});
  }, []);

  useEffect(() => {
    if (!open) return;
    lenis?.stop();
    const html = document.documentElement;
    const body = document.body;
    const originalHtmlOverflow = html.style.overflow;
    const originalBodyOverflow = body.style.overflow;
    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    return () => {
      lenis?.start();
      html.style.overflow = originalHtmlOverflow;
      body.style.overflow = originalBodyOverflow;
    };
  }, [open, lenis]);

  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;
    const observer = new ResizeObserver(() => {
      bottomRef.current?.scrollIntoView({ block: 'end' });
    });
    observer.observe(content);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isTouchDevice) return;
    try {
      if (localStorage.getItem(TERMINAL_SEEN_KEY)) return;
    } catch {}

    let pokes = 0;
    let lastIndex = -1;
    let timer: number;

    const poke = () => {
      if (open || pokes >= HINT_MAX_POKES) return;
      try {
        if (localStorage.getItem(TERMINAL_SEEN_KEY)) return;
      } catch {}
      pokes++;
      let index = Math.floor(Math.random() * HINT_MESSAGES.length);
      if (index === lastIndex) index = (index + 1) % HINT_MESSAGES.length;
      lastIndex = index;
      setHintMessage(HINT_MESSAGES[index]);
      setShowHint(true);
      timer = window.setTimeout(() => {
        setShowHint(false);
        timer = window.setTimeout(poke, HINT_MIN_DELAY + Math.random() * (HINT_MAX_DELAY - HINT_MIN_DELAY));
      }, HINT_VISIBLE_MS);
    };

    timer = window.setTimeout(poke, 5000 + Math.random() * 4000);
    return () => window.clearTimeout(timer);
  }, [isTouchDevice, open]);

  if (isTouchDevice) return null;

  return (
    <>
      <div
        aria-hidden={!open}
        onClick={minimize}
        className={`fixed inset-0 z-[500] bg-black/70 backdrop-blur-sm transition-opacity duration-200 ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />
      <div
        role="dialog"
        aria-hidden={!open}
        aria-label="Terminal"
        data-no-context-menu
        onClick={(e) => e.stopPropagation()}
        onContextMenu={(e) => e.preventDefault()}
        className={`fixed z-[501] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden border border-[#84C87F]/25
          bg-[#03080a] shadow-[0_0_0_1px_rgba(132,200,127,0.15),0_40px_100px_rgba(0,0,0,0.85)]
          font-terminal transition-[opacity,transform,width,height,border-radius] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]
          ${
            isFullscreen
              ? 'w-[calc(100vw-24px)] h-[calc(100vh-24px)] sm:w-[calc(100vw-48px)] sm:h-[calc(100vh-48px)] rounded-lg'
              : 'w-[92vw] sm:w-[640px] max-w-[92vw] h-[60vh] max-h-[520px] rounded-xl'
          }
          ${open ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}`}
      >
        <div className="relative h-full">
        <div
          onDoubleClick={toggleFullscreen}
          className="flex items-center justify-between px-4 py-2.5 bg-[#080f09] border-b border-[#84C87F]/10 relative z-10 select-none"
        >
          <div className="flex items-center gap-2">
            <button
              onClick={cutTerminal}
              aria-label="Close terminal and clear history"
              title="Close and clear history"
              className="w-[12px] h-[12px] rounded-full bg-[#FF5F56] hover:bg-[#FF5F56]/80 transition-colors"
            />
            <button
              onClick={minimize}
              aria-label="Minimize terminal"
              title="Minimize (keeps history)"
              className="w-[12px] h-[12px] rounded-full bg-[#FFBD2E] hover:bg-[#FFBD2E]/80 transition-colors"
            />
            <button
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? 'Restore terminal size' : 'Maximize terminal'}
              title={isFullscreen ? 'Restore' : 'Maximize'}
              className="w-[12px] h-[12px] rounded-full bg-[#27C93F] hover:bg-[#27C93F]/80 transition-colors"
            />
          </div>
          <span className="absolute left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.2em] text-[#84C87F]/60">
            guest@technovit
          </span>
        </div>

        <div className="terminal-scanlines" aria-hidden />

        <div
          ref={outputRef}
          onClick={() => inputRef.current?.focus()}
          data-lenis-prevent
          className="terminal-scroll relative h-[calc(100%-42px)] overflow-y-auto px-4 py-3 text-[13px] leading-relaxed text-[#84C87F]"
          style={{ textShadow: '0 0 6px rgba(132,200,127,0.35)' }}
        >
          <div ref={contentRef}>
            {lines.map((line, i) => {
              if (line.type === 'custom') return <div key={line.key} className="my-1">{line.node}</div>;
              return (
                <div
                  key={i}
                  className={
                    line.type === 'input'
                      ? 'text-[#c2e0a5]'
                      : line.type === 'accent'
                        ? 'text-[#84C87F] font-semibold'
                        : 'text-[#84C87F]/80'
                  }
                >
                  {line.text}
                </div>
              );
            })}
            {!busy && (
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[#c2e0a5] shrink-0">{PROMPT}</span>
                <div className="relative flex-1 min-w-0">
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value);
                      setCaretIndex(e.target.selectionStart ?? e.target.value.length);
                    }}
                    onKeyDown={onKeyDown}
                    onKeyUp={syncCaret}
                    onClick={syncCaret}
                    onSelect={syncCaret}
                    spellCheck={false}
                    autoComplete="off"
                    autoCapitalize="off"
                    className="w-full bg-transparent outline-none border-0 p-0 text-[#c2e0a5] caret-transparent"
                  />
                  <span
                    className="terminal-cursor absolute top-1/2 bg-[#84C87F] pointer-events-none"
                    style={{
                      left: caretIndex * charWidth,
                      width: charWidth,
                      height: '1.05em',
                      transform: 'translateY(-50%)',
                    }}
                    aria-hidden
                  />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>
        </div>
      </div>

      <AnimatePresence>
        {showHint && !open && (
          <motion.button
            onClick={toggleTerminal}
            initial={{ opacity: 0, x: -10, scale: 0.92 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -8, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-6 left-6 z-[9995] bg-[#064928] text-[#84C87F] text-xs font-semibold
              px-3.5 py-2 rounded-full shadow-2xl border border-[#84C87F]/30 whitespace-nowrap
              flex items-center gap-1.5 font-terminal"
          >
            <TerminalWindow size={14} weight="bold" />
            {hintMessage}
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
