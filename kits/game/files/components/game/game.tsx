"use client";

import {
  ArrowLeftIcon,
  ArrowRightIcon,
  HeartIcon,
  PauseIcon,
  PlayIcon,
  RotateCcwIcon,
} from "lucide-react";
import type * as React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { HighScoreTable } from "@/components/game/high-score-table";
import { Button } from "@/components/ui/button";
import { config } from "@/lib/game/config";
import {
  createInput,
  createLoop,
  type Input,
  type Loop,
} from "@/lib/game/engine";
import { addHighScore } from "@/lib/game/high-scores";
import { drawWorld, type Palette, readPalette } from "@/lib/game/render";
import {
  createWorld,
  multiplier,
  stepWorld,
  type World,
} from "@/lib/game/world";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "./use-prefers-reduced-motion";

type Status = "ready" | "playing" | "paused" | "over";
type Hud = { score: number; lives: number; multiplier: number; barrel: number };

const START_HUD: Hud = {
  score: 0,
  lives: config.lives.start,
  multiplier: 1,
  barrel: 0,
};

/**
 * The game screen: canvas, score bar, overlays (start, paused, game over) and touch buttons.
 * The engine (lib/game/engine.ts) runs the loop, lib/game/world.ts holds the rules and
 * lib/game/render.ts draws. This component wires them together and handles the screens.
 */
export function Game() {
  const stageRef = useRef<HTMLElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<Status>("ready");
  const [hud, setHud] = useState<Hud>(START_HUD);
  const [result, setResult] = useState<{ score: number; place: number }>();
  const [announcement, setAnnouncement] = useState("");
  const reducedMotion = usePrefersReducedMotion();

  // Things the loop reads every frame live in refs, so changing them doesn't restart it.
  const statusRef = useRef<Status>("ready");
  const reducedMotionRef = useRef(reducedMotion);
  const game = useRef<{
    loop: Loop;
    input: Input;
    world: World;
    draw: () => void;
  } | null>(null);

  const changeStatus = useCallback((next: Status) => {
    statusRef.current = next;
    game.current?.input.setEnabled(next === "playing");
    setStatus(next);
  }, []);

  // Set up the canvas, loop and input once.
  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !stage || !ctx) return;

    let palette: Palette = readPalette();
    let scale = 1;
    let lastHud = START_HUD;
    const input = createInput(canvas);
    const state = { world: createWorld() };

    const draw = () => {
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      drawWorld(ctx, state.world, palette, {
        reducedMotion: reducedMotionRef.current,
      });
    };

    const update = (dt: number) => {
      const world = state.world;
      stepWorld(
        world,
        { direction: input.direction(), pointer: input.pointer() },
        dt,
        { reducedMotion: reducedMotionRef.current },
      );
      for (const event of world.events) {
        if (event.type === "hit" && event.livesLeft > 0) {
          setAnnouncement(
            `Hit by hail. ${event.livesLeft} ${event.livesLeft === 1 ? "life" : "lives"} left.`,
          );
        } else if (event.type === "barrel-full") {
          setAnnouncement(
            `Barrel full! Plus ${event.bonus} points${event.lifeGained ? " and an extra life" : ""}.`,
          );
        } else if (event.type === "game-over") {
          loop.stop();
          const place = addHighScore(event.score);
          setResult({ score: event.score, place });
          setAnnouncement(
            `Game over. You scored ${event.score}.${place === 0 ? " New high score!" : ""}`,
          );
          changeStatus("over");
        }
      }
      world.events.length = 0;

      const next: Hud = {
        score: world.score,
        lives: world.lives,
        multiplier: multiplier(world),
        barrel: world.barrel,
      };
      if (
        next.score !== lastHud.score ||
        next.lives !== lastHud.lives ||
        next.multiplier !== lastHud.multiplier ||
        next.barrel !== lastHud.barrel
      ) {
        lastHud = next;
        setHud(next);
      }
    };

    const loop = createLoop({ update, render: draw });

    // Keep the canvas sharp: match its pixel size to the screen's (devicePixelRatio).
    const resize = () => {
      const rect = stage.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.round(rect.width * ratio));
      canvas.height = Math.max(1, Math.round(rect.height * ratio));
      scale = canvas.width / config.world.width;
      draw();
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(stage);
    resize();

    // Re-read the colours when the design (accent, preset) changes.
    const designObserver = new MutationObserver(() => {
      palette = readPalette();
      draw();
    });
    designObserver.observe(document.documentElement, { attributes: true });

    game.current = {
      loop,
      input,
      draw,
      get world() {
        return state.world;
      },
      set world(value: World) {
        state.world = value;
      },
    };

    return () => {
      loop.stop();
      input.dispose();
      resizeObserver.disconnect();
      designObserver.disconnect();
      game.current = null;
    };
  }, [changeStatus]);

  const start = useCallback(() => {
    const current = game.current;
    if (!current) return;
    current.world = createWorld();
    setHud(START_HUD);
    setResult(undefined);
    setAnnouncement("Game started.");
    changeStatus("playing");
    current.loop.start();
    stageRef.current?.focus({ preventScroll: true });
    rootRef.current?.scrollIntoView({ block: "nearest" });
  }, [changeStatus]);

  const pause = useCallback(() => {
    if (statusRef.current !== "playing") return;
    game.current?.loop.pause();
    setAnnouncement("Paused.");
    changeStatus("paused");
  }, [changeStatus]);

  const resume = useCallback(() => {
    if (statusRef.current !== "paused") return;
    setAnnouncement("Resumed.");
    changeStatus("playing");
    game.current?.loop.resume();
    stageRef.current?.focus({ preventScroll: true });
  }, [changeStatus]);

  // Pause when the tab is hidden or the window loses focus; P or Escape toggles pause.
  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === "hidden") pause();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "p" && event.key !== "P" && event.key !== "Escape")
        return;
      if (statusRef.current === "playing") {
        event.preventDefault();
        pause();
      } else if (statusRef.current === "paused") {
        event.preventDefault();
        resume();
      }
    };
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("blur", pause);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("blur", pause);
      window.removeEventListener("keydown", onKey);
    };
  }, [pause, resume]);

  // Keep the loop's copy of the motion setting current, and redraw (it may be paused).
  useEffect(() => {
    reducedMotionRef.current = reducedMotion;
    game.current?.draw();
  }, [reducedMotion]);

  // Move focus to the main button of the paused / game-over screen.
  useEffect(() => {
    if (status === "paused" || status === "over") {
      stageRef.current
        ?.querySelector<HTMLElement>("[data-overlay-action]")
        ?.focus();
    }
  }, [status]);

  const hold = (side: "left" | "right", down: boolean) =>
    game.current?.input.hold(side, down);

  return (
    <div
      ref={rootRef}
      className="mx-auto flex w-full max-w-[min(100%,calc((100dvh-18rem)*0.8))] min-w-0 scroll-mt-24 flex-col gap-3 sm:min-w-80"
    >
      {/* Score bar */}
      <div className="surface flex items-center gap-3 rounded-card px-4 py-2 text-sm">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <p>
            <span className="text-muted-foreground">Score </span>
            <span className="font-mono font-semibold tabular-nums">
              {hud.score.toLocaleString("en-US")}
            </span>
          </p>
          <p className="font-mono text-primary-text" title="Score multiplier">
            ×{hud.multiplier}
          </p>
          <p className="flex items-center gap-0.5" title="Lives">
            <span className="sr-only">{hud.lives} lives</span>
            {Array.from({ length: config.lives.max }, (_, index) => (
              <HeartIcon
                // biome-ignore lint/suspicious/noArrayIndexKey: fixed list of heart slots
                key={index}
                aria-hidden
                className={cn(
                  "size-4",
                  index < hud.lives
                    ? "fill-current text-destructive"
                    : index < config.lives.start
                      ? "text-muted-foreground"
                      : "hidden",
                )}
              />
            ))}
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={status === "paused" ? resume : pause}
          disabled={status !== "playing" && status !== "paused"}
          aria-label={status === "paused" ? "Resume" : "Pause"}
        >
          {status === "paused" ? <PlayIcon /> : <PauseIcon />}
        </Button>
      </div>

      {/* Barrel meter (screen readers hear "Barrel full!" announcements instead) */}
      <div aria-hidden className="h-1.5 overflow-hidden rounded-badge bg-muted">
        <div
          className="h-full rounded-badge bg-chart-2 transition-[width] duration-150 motion-reduce:transition-none"
          style={{ width: `${(hud.barrel / config.barrel.capacity) * 100}%` }}
        />
      </div>

      {/* The stage: canvas plus whichever screen is showing */}
      <section
        ref={stageRef}
        tabIndex={-1}
        aria-label="Rain Barrel game"
        className="relative aspect-[4/5] w-full overflow-hidden rounded-card border bg-card outline-none focus-visible:ring-3 focus-visible:ring-ring/60"
      >
        <canvas
          ref={canvasRef}
          aria-hidden
          className="absolute inset-0 size-full touch-none select-none"
        />

        {status === "ready" ? (
          <Overlay>
            <p className="eyebrow">Summer storm</p>
            <h2 className="text-3xl sm:text-4xl">Rain Barrel</h2>
            <p className="text-pretty text-muted-foreground">
              Catch raindrops for the community garden. Golden drops are worth
              more. Dodge the hail. Fill the barrel for a bonus.
            </p>
            <Button type="button" size="lg" onClick={start}>
              <PlayIcon />
              Start
            </Button>
            <HighScoreTable className="max-w-64" />
          </Overlay>
        ) : null}

        {status === "paused" ? (
          <Overlay>
            <h2 className="text-3xl">Paused</h2>
            <p className="text-muted-foreground">
              Press P or Escape, or the button, to carry on.
            </p>
            <Button
              type="button"
              size="lg"
              onClick={resume}
              data-overlay-action
            >
              <PlayIcon />
              Resume
            </Button>
          </Overlay>
        ) : null}

        {status === "over" && result ? (
          <Overlay>
            <p className="eyebrow">Game over</p>
            <h2 className="text-3xl sm:text-4xl">
              {result.score.toLocaleString("en-US")} points
            </h2>
            <p className="text-muted-foreground">
              {result.place === 0
                ? "New high score!"
                : result.place > 0
                  ? `That's #${result.place + 1} on your list.`
                  : "Have another go: the storm gets faster the longer you last."}
            </p>
            <Button type="button" size="lg" onClick={start} data-overlay-action>
              <RotateCcwIcon />
              Play again
            </Button>
            <HighScoreTable highlight={result.place} className="max-w-64" />
          </Overlay>
        ) : null}
      </section>

      {/* Touch buttons. Keyboard players use the arrow keys instead. */}
      <div className="grid grid-cols-2 gap-3" aria-hidden>
        {(["left", "right"] as const).map((side) => (
          <button
            key={side}
            type="button"
            tabIndex={-1}
            disabled={status !== "playing"}
            onPointerDown={() => hold(side, true)}
            onPointerUp={() => hold(side, false)}
            onPointerLeave={() => hold(side, false)}
            onPointerCancel={() => hold(side, false)}
            onContextMenu={(event) => event.preventDefault()}
            className="surface flex h-control-lg touch-none items-center justify-center rounded-control text-muted-foreground select-none active:bg-primary-tint active:text-primary-text disabled:opacity-50"
          >
            {side === "left" ? <ArrowLeftIcon /> : <ArrowRightIcon />}
          </button>
        ))}
      </div>

      <p className="text-center text-sm text-muted-foreground">
        <kbd className="font-mono">←</kbd> <kbd className="font-mono">→</kbd> or{" "}
        <kbd className="font-mono">A</kbd> <kbd className="font-mono">D</kbd> to
        move · <kbd className="font-mono">P</kbd> or{" "}
        <kbd className="font-mono">Esc</kbd> to pause · or drag on the game
      </p>

      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </p>
    </div>
  );
}

function Overlay({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 overflow-y-auto bg-background/85 p-6 text-center backdrop-blur-sm">
      {children}
    </div>
  );
}
