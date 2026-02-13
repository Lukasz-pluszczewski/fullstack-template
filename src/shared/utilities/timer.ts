// time.ts v1.0.0
/* eslint-disable no-console */

type AnyLog = unknown;

export type TimerMeta = Record<string, AnyLog> | AnyLog;

type Logger = typeof console.log | false;

type TimerState = {
  id: string;
  color: string;
  startMs: number;
  lastMs: number;
  logger?: Logger;
};

type TimerInstance = {
  /**
   * Same as `split()`: records a lap and logs it.
   * - timer("label", meta)
   * - timer(meta)
   * - timer()
   */
  (label?: string | TimerMeta, meta?: TimerMeta): { id: string; startMs: number; totalMs: number; lapMs: number; label?: string; meta?: TimerMeta };
  /**
   * Ends the timer and logs total + last lap.
   * - timer.end("label", meta)
   * - timer.end(meta)
   * - timer.end()
   */
  end(label?: string | TimerMeta, meta?: TimerMeta): { id: string; startMs: number; totalMs: number; lapMs: number; label?: string; meta?: TimerMeta };
  /** Underlying timer id */
  readonly id: string;
};

type SplitArgs =
  | [id: string]
  | [id: string, meta: TimerMeta]
  | [id: string, label: string]
  | [id: string, label: string, meta: TimerMeta];

type EndArgs =
  | [id: string]
  | [id: string, meta: TimerMeta]
  | [id: string, label: string]
  | [id: string, label: string, meta: TimerMeta];

export type TimeFn = {
  /**
   * time("id") works like start("id") and returns an instance.
   */
  (id: string, logger?: Logger): TimerInstance;

  /**
   * Starts a timer (and returns an instance, so you can optionally store it).
   */
  start(id: string, logger?: Logger): TimerInstance;

  /**
   * Splits a timer (lap + total).
   * - split(id)
   * - split(id, meta)
   * - split(id, label)
   * - split(id, label, meta)
   */
  split(...args: SplitArgs): { id: string; startMs: number; totalMs: number; lapMs: number; label?: string; meta?: TimerMeta };

  /**
   * Ends a timer (total + last lap).
   * - end(id)
   * - end(id, meta)
   * - end(id, label)
   * - end(id, label, meta)
   */
  end(...args: EndArgs): { id: string; startMs: number; totalMs: number; lapMs: number; label?: string; meta?: TimerMeta };
};

/**
 * A palette of nice, DEBUG-style colors (hand-picked).
 * (Feel free to add more.)
 */
const COLORS = [
  '#E57373',
  '#F06292',
  '#BA68C8',
  '#9575CD',
  '#7986CB',
  '#64B5F6',
  '#4FC3F7',
  '#4DD0E1',
  '#4DB6AC',
  '#81C784',
  '#AED581',
  '#DCE775',
  '#FFF176',
  '#FFD54F',
  '#FFB74D',
  '#FF8A65',
  '#A1887F',
  '#90A4AE',
];

const timers = new Map<string, TimerState>();

function nowMs(): number {
  // Prefer high-resolution timers if available
  if (
    typeof performance !== 'undefined'
    && typeof performance.now === 'function'
  ) {
    return performance.now();
  }
  return Date.now();
}

function hash32(str: string): number {
  // Simple, stable 32-bit hash (FNV-1a-ish)
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    // multiply by FNV prime (2^24 + 2^8 + 0x93) using shifts
    h = (h + (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24)) >>> 0;
  }
  return h >>> 0;
}

function colorForId(id: string): string {
  const idx = hash32(id) % COLORS.length;
  return COLORS[idx];
}

function formatMs(ms: number): string {
  if (!Number.isFinite(ms)) return `${ms}ms`;

  const abs = Math.abs(ms);

  if (abs < 1000) {
    // 0–999ms with 1 decimal under 100ms for nicer readability
    if (abs < 100) return `${ms.toFixed(1)}ms`;
    return `${Math.round(ms)}ms`;
  }

  const s = ms / 1000;
  if (Math.abs(s) < 60) {
    return `${s.toFixed(2)}s`;
  }

  const m = Math.trunc(s / 60);
  const remS = s - m * 60;

  if (m < 60) {
    // e.g. 2m 03.21s
    const pad = remS < 10 ? '0' : '';
    return `${m}m ${pad}${remS.toFixed(2)}s`;
  }

  const h = Math.trunc(m / 60);
  const remM = m - h * 60;
  return `${h}h ${remM}m`;
}

function parseLabelAndMeta(
  a?: string | TimerMeta,
  b?: TimerMeta
): { label?: string; meta?: TimerMeta } {
  if (typeof a === 'string') return { label: a, meta: b };
  if (a !== undefined) return { meta: a };
  return {};
}

function logStart(id: string, logger: Logger = console.log): void {
  // Start: ID only (normal console color)
  logger && logger('Timer start', id);
}

function logSplitOrEnd(params: {
  kind: 'split' | 'end';
  id: string;
  color: string;
  totalMs: number;
  lapMs: number;
  label?: string;
  meta?: TimerMeta;
}, logger: Logger = console.log): void {
  if (!logger) return;
  const { id, color, totalMs, lapMs, label, meta } = params;

  const total = formatMs(totalMs);
  const lap = formatMs(lapMs);

  const bracketStyle = `color: ${color}; font-weight: 600;`;
  const labelStyle = `color: #9AA0A6;`; // grey-ish
  const resetStyle = '';

  // Example:
  // [12.34s | +3.21s] timer-id middle of process
  // (meta logged on next line)
  const bracketText =
    params.kind === 'split'
      ? `[${total} | +${lap}]`
      : `[${total} | last +${lap}]`;

  if (label) {
    logger(
      `%c${bracketText}%c ${id} %c${label}%c`,
      bracketStyle,
      resetStyle,
      labelStyle,
      resetStyle
    );
  } else {
    logger(`%c${bracketText}%c ${id}`, bracketStyle, resetStyle);
  }

  if (meta !== undefined) {
    // Log extra data like normal console.log (can be object, string, anything)
    logger(meta);
  }
}

function ensureTimer(id: string, logger: Logger = console.log): TimerState {
  const existing = timers.get(id);
  if (existing) return existing;

  // If user calls split/end without start, treat as implicit start.
  const t = nowMs();
  const state: TimerState = {
    id,
    color: colorForId(id),
    startMs: t,
    lastMs: t,
    logger,
  };
  timers.set(id, state);
  logStart(id, logger);
  return state;
}

function startImpl(id: string, logger: Logger = console.log): TimerInstance {
  const t = nowMs();
  const state: TimerState = {
    id,
    color: colorForId(id),
    startMs: t,
    lastMs: t,
    logger,
  };
  timers.set(id, state);
  logStart(id, logger);

  const instance = ((
    labelOrMeta?: string | TimerMeta,
    maybeMeta?: TimerMeta
  ) => {
    const { label, meta } = parseLabelAndMeta(labelOrMeta, maybeMeta);
    splitImpl(id, label, meta);
  }) as TimerInstance;

  Object.defineProperty(instance, 'id', {
    value: id,
    enumerable: true,
    writable: false,
  });

  instance.end = (labelOrMeta?: string | TimerMeta, maybeMeta?: TimerMeta) => {
    const { label, meta } = parseLabelAndMeta(labelOrMeta, maybeMeta);
    const { startMs, totalMs, lapMs } = endImpl(id, label, meta);
    return { id, startMs, totalMs, lapMs, label, meta };
  };

  return instance;
}

function splitImpl(id: string, label?: string, meta?: TimerMeta): { startMs: number; totalMs: number; lapMs: number } {
  const state = ensureTimer(id);
  const t = nowMs();

  const totalMs = t - state.startMs;
  const lapMs = t - state.lastMs;

  state.lastMs = t;

  logSplitOrEnd({
    kind: 'split',
    id,
    color: state.color,
    totalMs,
    lapMs,
    label,
    meta,
  }, state.logger);
  return { startMs: state.startMs, totalMs, lapMs };
}

function endImpl(id: string, label?: string, meta?: TimerMeta): { startMs: number; totalMs: number; lapMs: number } {
  const state = ensureTimer(id);
  const t = nowMs();

  const totalMs = t - state.startMs;
  const lapMs = t - state.lastMs;

  logSplitOrEnd({
    kind: 'end',
    id,
    color: state.color,
    totalMs,
    lapMs,
    label,
    meta,
  }, state.logger);

  timers.delete(id);

  return { startMs: state.startMs, totalMs, lapMs };
}

export const time: TimeFn = Object.assign((id: string, logger: Logger = console.log) => startImpl(id, logger), {
  start: (id: string, logger: Logger = console.log) => startImpl(id, logger),

  split: (...args: SplitArgs) => {
    const [id, a, b] = args as [string, unknown?, unknown?];
    const { label, meta } = parseLabelAndMeta(a as any, b as any);
    const { startMs, totalMs, lapMs } = splitImpl(id, label, meta);
    return { id, startMs, totalMs, lapMs, label, meta };
  },

  end: (...args: EndArgs) => {
    const [id, a, b] = args as [string, unknown?, unknown?];
    const { label, meta } = parseLabelAndMeta(a as any, b as any);
    const { startMs, totalMs, lapMs } = endImpl(id, label, meta);
    return { id, startMs, totalMs, lapMs, label, meta };
  },
// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
} satisfies Omit<TimeFn, keyof Function>);
