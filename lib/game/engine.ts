/**
 * The engine: a game loop and an input reader. Nothing here knows about raindrops, so you can
 * reuse it for a completely different game.
 *
 * ── The loop ──
 * Screens refresh at different rates (60, 120, 144 times a second...). If we moved things "a
 * bit every frame" the game would run faster on faster screens. Instead the loop runs the rules
 * in fixed steps of `stepSeconds` (1/60 s), as many as real time requires, then draws once.
 * This is called a fixed-timestep loop.
 */

export type Loop = {
  start(): void;
  /** Stop calling `update` and `render` until `resume()`. */
  pause(): void;
  resume(): void;
  /** Stop for good (call when the component unmounts). */
  stop(): void;
  readonly paused: boolean;
};

export function createLoop({
  update,
  render,
  stepSeconds = 1 / 60,
  maxFrameSeconds = 0.25,
}: {
  /** Advance the game by exactly `dt` seconds. */
  update: (dt: number) => void;
  /** Draw the current state. */
  render: () => void;
  stepSeconds?: number;
  /** If the tab stalls (slow device, debugger), never simulate more than this at once. */
  maxFrameSeconds?: number;
}): Loop {
  let frame = 0;
  let last = 0;
  let accumulator = 0;
  let running = false;
  let paused = false;

  function tick(now: number) {
    if (!running || paused) return;
    const elapsed = Math.min((now - last) / 1000, maxFrameSeconds);
    last = now;
    accumulator += elapsed;
    while (accumulator >= stepSeconds) {
      update(stepSeconds);
      accumulator -= stepSeconds;
    }
    render();
    frame = requestAnimationFrame(tick);
  }

  function begin() {
    last = performance.now();
    accumulator = 0;
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(tick);
  }

  return {
    start() {
      running = true;
      paused = false;
      begin();
    },
    pause() {
      if (!running || paused) return;
      paused = true;
      cancelAnimationFrame(frame);
      render();
    },
    resume() {
      if (!running || !paused) return;
      paused = false;
      // Restart the clock so the time spent paused isn't simulated all at once.
      begin();
    },
    stop() {
      running = false;
      paused = false;
      cancelAnimationFrame(frame);
    },
    get paused() {
      return paused;
    },
  };
}

/**
 * ── Input ──
 * Reads the keyboard (arrow keys or A/D), held on-screen buttons and pointer drags (finger or
 * mouse) and turns them into one answer: which way to move, or where to move to.
 */
export type Input = {
  /** -1 = left, 0 = stay, 1 = right (keyboard and held buttons). */
  direction(): -1 | 0 | 1;
  /** Where a finger or mouse is pressing, from 0 (left edge) to 1 (right edge), or null. */
  pointer(): number | null;
  /** Hold an on-screen button ("left"/"right") down or let it go. */
  hold(side: "left" | "right", down: boolean): void;
  /** Ignore input (and let the page scroll normally) while the game isn't being played. */
  setEnabled(enabled: boolean): void;
  dispose(): void;
};

const LEFT_KEYS = new Set(["ArrowLeft", "a", "A"]);
const RIGHT_KEYS = new Set(["ArrowRight", "d", "D"]);
/** How many steps a single key tap keeps moving (6 steps = 0.1 s at 60 steps a second). */
const TAP_STEPS = 6;

export function createInput(surface: HTMLElement): Input {
  const keys = { left: false, right: false };
  const held = { left: false, right: false };
  const taps = { left: 0, right: 0 };
  let pointerX: number | null = null;
  let pointerId: number | null = null;
  let enabled = false;

  function isTyping(target: EventTarget | null) {
    return (
      target instanceof HTMLElement &&
      (target.isContentEditable ||
        ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
    );
  }

  function onKey(event: KeyboardEvent, down: boolean) {
    if (!enabled || isTyping(event.target)) return;
    const left = LEFT_KEYS.has(event.key);
    const right = RIGHT_KEYS.has(event.key);
    if (!left && !right) return;
    if (left) keys.left = down;
    if (right) keys.right = down;
    // A quick tap (down and up between two steps) still nudges the player a little.
    if (down && left) taps.left = TAP_STEPS;
    if (down && right) taps.right = TAP_STEPS;
    // Stop the arrow keys from scrolling the page while playing.
    event.preventDefault();
  }
  const onKeyDown = (event: KeyboardEvent) => onKey(event, true);
  const onKeyUp = (event: KeyboardEvent) => onKey(event, false);

  function toFraction(event: PointerEvent) {
    const rect = surface.getBoundingClientRect();
    if (rect.width === 0) return null;
    return Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
  }
  function onPointerDown(event: PointerEvent) {
    if (!enabled) return;
    pointerId = event.pointerId;
    try {
      // Keep receiving moves even if the finger slides off the game.
      surface.setPointerCapture(event.pointerId);
    } catch {
      // Not supported for this pointer: moves over the game still work.
    }
    pointerX = toFraction(event);
  }
  function onPointerMove(event: PointerEvent) {
    if (event.pointerId !== pointerId) return;
    pointerX = toFraction(event);
  }
  function onPointerUp(event: PointerEvent) {
    if (event.pointerId !== pointerId) return;
    pointerId = null;
    pointerX = null;
  }
  function releaseAll() {
    keys.left = false;
    keys.right = false;
    held.left = false;
    held.right = false;
    taps.left = 0;
    taps.right = 0;
    pointerX = null;
    pointerId = null;
  }

  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  window.addEventListener("blur", releaseAll);
  surface.addEventListener("pointerdown", onPointerDown);
  surface.addEventListener("pointermove", onPointerMove);
  surface.addEventListener("pointerup", onPointerUp);
  surface.addEventListener("pointercancel", onPointerUp);

  return {
    direction() {
      const left = keys.left || held.left || taps.left > 0;
      const right = keys.right || held.right || taps.right > 0;
      taps.left = Math.max(0, taps.left - 1);
      taps.right = Math.max(0, taps.right - 1);
      return left === right ? 0 : left ? -1 : 1;
    },
    pointer() {
      return pointerX;
    },
    hold(side, down) {
      held[side] = down;
    },
    setEnabled(value) {
      enabled = value;
      if (!value) releaseAll();
    },
    dispose() {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", releaseAll);
      surface.removeEventListener("pointerdown", onPointerDown);
      surface.removeEventListener("pointermove", onPointerMove);
      surface.removeEventListener("pointerup", onPointerUp);
      surface.removeEventListener("pointercancel", onPointerUp);
    },
  };
}
