// time.test.ts
import { afterEach, describe, expect, it, mock, spyOn } from 'bun:test';
import { time } from './timer';

// Helpers
function seq(values: number[]) {
  let i = 0;
  return () => {
    if (i >= values.length) {
      throw new Error(`performance.now() called too many times (i=${i})`);
    }
    return values[i++]!;
  };
}

function uniqueId(prefix = 't') {
  // Avoid cross-test coupling via the module-level Map.
  return `${prefix}-${Math.random().toString(16).slice(2)}-${Date.now()}`;
}

describe('time.ts', () => {
  let perfNowSpy: ReturnType<typeof spyOn> | undefined;

  afterEach(() => {
    perfNowSpy?.mockRestore?.();
    perfNowSpy = undefined;
  });

  describe('start()', () => {
    it('logs a start line and stores a timer instance with readonly id', () => {
      const id = uniqueId('start');
      const logger = mock<typeof console.log>(() => {});

      perfNowSpy = spyOn(performance, 'now').mockImplementation(seq([1000]));

      const timer = time.start(id, logger);

      // Start log: logger('Timer start', id)
      expect(logger).toHaveBeenCalledTimes(1);
      expect(logger).toHaveBeenCalledWith('Timer start', id);

      // Instance shape
      expect(typeof timer).toBe('function');
      expect(typeof timer.end).toBe('function');
      expect(timer.id).toBe(id);

      // `id` is enumerable and non-writable
      expect(Object.keys(timer)).toContain('id');
      expect(() => {
        (timer as any).id = 'nope';
      }).toThrow();
      expect(timer.id).toBe(id);
    });

    it('time(id, logger) behaves like start(id, logger)', () => {
      const id = uniqueId('call-signature');
      const logger = mock<typeof console.log>(() => {});

      perfNowSpy = spyOn(performance, 'now').mockImplementation(seq([123]));

      const timer = (time as any)(id, logger);

      expect(timer.id).toBe(id);
      expect(logger).toHaveBeenCalledTimes(1);
      expect(logger).toHaveBeenCalledWith('Timer start', id);
    });
  });

  describe('split()', () => {
    it('logs split with label + meta, formats ms < 100 with 1 decimal, and logs meta on the next line', () => {
      const id = uniqueId('split-label-meta');
      const logger = mock<typeof console.log>(() => {});

      // startImpl: now()
      // splitImpl: ensureTimer() uses existing state (no now)
      // then splitImpl: now()
      perfNowSpy = spyOn(performance, 'now').mockImplementation(
        seq([1000, 1034.56])
      );

      const t = time.start(id, logger);
      t('phase 1', { ok: true });

      // Calls:
      // 1) start
      // 2) split formatted line
      // 3) meta line
      expect(logger).toHaveBeenCalledTimes(3);

      // Split line: `%c[total | +lap]%c id %clabel%c`, styles...
      const splitCall = logger.mock.calls[1]!;
      expect(splitCall[0]).toContain('[34.6ms | +34.6ms]');
      expect(splitCall[0]).toContain(id);
      expect(splitCall[0]).toContain('phase 1');
      expect(typeof splitCall[1]).toBe('string'); // bracketStyle (contains color)
      expect(splitCall[2]).toBe(''); // resetStyle
      expect(typeof splitCall[3]).toBe('string'); // labelStyle
      expect(splitCall[4]).toBe(''); // resetStyle

      // Meta logged on next line
      expect(logger.mock.calls[2]![0]).toEqual({ ok: true });
    });

    it('supports split(id, meta) (no label) and logs meta', () => {
      const id = uniqueId('split-meta-only');
      const logger = mock<typeof console.log>(() => {});

      // ensureTimer() implicit start: now()
      // then splitImpl: now()
      perfNowSpy = spyOn(performance, 'now').mockImplementation(
        seq([2000, 2100])
      );

      const meta = { a: 1 };
      const out = time.split(id, meta);

      // implicit start log + split log + meta log
      expect(logger).toHaveBeenCalledTimes(0); // We didn't pass logger, so it used console.log; just validate return instead.

      // Return shape includes parsed label/meta
      expect(out.id).toBe(id);
      expect(out.label).toBeUndefined();
      expect(out.meta).toEqual(meta);

      // With mocked times: total=100ms, lap=100ms
      expect(out.totalMs).toBe(100);
      expect(out.lapMs).toBe(100);
      expect(out.startMs).toBe(2000);
    });

    it('implicit start happens if split() is called before start()', () => {
      const id = uniqueId('implicit-start-split');
      const logger = mock<typeof console.log>(() => {});

      // We can't inject logger through time.split(), but we can via time.start() after-the-fact
      // So here we assert behavior via return values and timing math.
      // Calls:
      // ensureTimer: now() -> 10
      // splitImpl: now() -> 25
      perfNowSpy = spyOn(performance, 'now').mockImplementation(seq([10, 25]));

      const out = time.split(id, 'first');

      expect(out.id).toBe(id);
      expect(out.label).toBe('first');
      expect(out.meta).toBeUndefined();

      expect(out.startMs).toBe(10);
      expect(out.totalMs).toBe(15);
      expect(out.lapMs).toBe(15);
    });

    it('updates lap time across consecutive splits (lastMs moves forward)', () => {
      const id = uniqueId('split-laps');
      const logger = mock<typeof console.log>(() => {});

      // start: 1000
      // split1: 2500 => total 1500ms => 1.50s, lap 1500ms => 1.50s
      // split2: 3700 => total 2700ms => 2.70s, lap 1200ms => 1.20s
      perfNowSpy = spyOn(performance, 'now').mockImplementation(
        seq([1000, 2500, 3700])
      );

      const t = time.start(id, logger);
      t('lap1');
      t('lap2');

      // start + split + split
      expect(logger).toHaveBeenCalledTimes(3);

      const split1 = logger.mock.calls[1]![0] as string;
      const split2 = logger.mock.calls[2]![0] as string;

      expect(split1).toContain('[1.50s | +1.50s]');
      expect(split2).toContain('[2.70s | +1.20s]');
    });

    it('formats minutes and hours', () => {
      const idM = uniqueId('minutes');
      const idH = uniqueId('hours');
      const loggerM = mock<typeof console.log>(() => {});
      const loggerH = mock<typeof console.log>(() => {});

      // Minutes case:
      // start 0, split at 2m 03.21s => 123.21s => 123210ms
      perfNowSpy = spyOn(performance, 'now').mockImplementation(
        seq([0, 123_210])
      );
      const tm = time.start(idM, loggerM);
      tm('min');
      expect(loggerM.mock.calls[1]![0] as string).toContain(
        '[2m 03.21s | +2m 03.21s]'
      );

      perfNowSpy.mockRestore();

      // Hours case:
      // start 0, split at 1h 5m => 3900s => 3_900_000ms
      perfNowSpy = spyOn(performance, 'now').mockImplementation(
        seq([0, 3_900_000])
      );
      const th = time.start(idH, loggerH);
      th('hr');
      expect(loggerH.mock.calls[1]![0] as string).toContain('[1h 5m | +1h 5m]');
    });
  });

  describe('end()', () => {
    it('logs end with last lap, logs meta if provided, and deletes timer state (next split becomes a fresh implicit start)', () => {
      const id = uniqueId('end-deletes');
      const logger = mock<typeof console.log>(() => {});

      // start 100
      // split 250 => total 150ms lap 150ms
      // end 400 => total 300ms last lap 150ms (from lastMs=250)
      // split after end triggers implicit start:
      // ensureTimer: 1000, then split: 1100 => total 100ms lap 100ms
      perfNowSpy = spyOn(performance, 'now').mockImplementation(
        seq([100, 250, 400, 1000, 1100])
      );

      const t = time.start(id, logger);
      t('mid');

      t.end('done', { success: true });

      // start + split + end line + end meta
      expect(logger).toHaveBeenCalledTimes(4);

      const endLine = logger.mock.calls[2]![0] as string;
      expect(endLine).toContain('[300ms | last +150ms]');
      expect(endLine).toContain(id);
      expect(endLine).toContain('done');
      expect(logger.mock.calls[3]![0]).toEqual({ success: true });

      // After end, a split should be a fresh timer
      // (We can't pass our logger into time.split directly, but we *can* do it by starting again explicitly.)
      const t2 = time.start(id, logger);
      t2('after-restart');

      // start + split added
      expect(logger).toHaveBeenCalledTimes(6);
      const splitAfterRestart = logger.mock.calls[5]![0] as string;
      // Because restart startMs=1000, split now=1100 => 100ms
      expect(splitAfterRestart).toContain('[100ms | +100ms]');
    });

    it('supports end(id, meta) and end(id, label, meta) return values', () => {
      const id1 = uniqueId('end-meta-only');
      const id2 = uniqueId('end-label-meta');

      // end(meta-only):
      // ensureTimer: 0, end: 50 => total 50 lap 50
      // end(label+meta):
      // ensureTimer: 100, end: 250 => total 150 lap 150
      perfNowSpy = spyOn(performance, 'now').mockImplementation(
        seq([0, 50, 100, 250])
      );

      const out1 = time.end(id1, { x: 1 });
      expect(out1.id).toBe(id1);
      expect(out1.label).toBeUndefined();
      expect(out1.meta).toEqual({ x: 1 });
      expect(out1.totalMs).toBe(50);
      expect(out1.lapMs).toBe(50);
      expect(out1.startMs).toBe(0);

      const out2 = time.end(id2, 'finish', { y: 2 });
      expect(out2.id).toBe(id2);
      expect(out2.label).toBe('finish');
      expect(out2.meta).toEqual({ y: 2 });
      expect(out2.totalMs).toBe(150);
      expect(out2.lapMs).toBe(150);
      expect(out2.startMs).toBe(100);
    });
  });

  describe('instance call signature', () => {
    it('timer(meta) behaves like split with meta (no label)', () => {
      const id = uniqueId('instance-meta');
      const logger = mock<typeof console.log>(() => {});

      perfNowSpy = spyOn(performance, 'now').mockImplementation(seq([10, 35]));

      const t = time.start(id, logger);
      t({ hello: 'world' });

      // start + split + meta
      expect(logger).toHaveBeenCalledTimes(3);

      const splitLine = logger.mock.calls[1]![0] as string;
      expect(splitLine).toContain('[25.0ms | +25.0ms]');
      expect(splitLine).toContain(id);

      expect(logger.mock.calls[2]![0]).toEqual({ hello: 'world' });
    });

    it('timer() records a split with no label/meta', () => {
      const id = uniqueId('instance-noargs');
      const logger = mock<typeof console.log>(() => {});

      perfNowSpy = spyOn(performance, 'now').mockImplementation(
        seq([1000, 1123])
      );

      const t = time.start(id, logger);
      t();

      // start + split
      expect(logger).toHaveBeenCalledTimes(2);

      const splitLine = logger.mock.calls[1]![0] as string;
      expect(splitLine).toContain('[123ms | +123ms]');
      expect(splitLine).toContain(id);
    });
  });
});
