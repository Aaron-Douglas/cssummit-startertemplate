import {
  config,
  defaultTuning,
  type ItemKind,
  type Tuning,
} from "@/lib/game/config";

/**
 * The rules of the game. `createWorld()` makes a fresh game and `stepWorld()` moves it forward
 * by a small slice of time. No drawing and no browser APIs here, which makes the rules easy to
 * read and change. Numbers come from lib/game/config.ts.
 */

export type Item = {
  id: number;
  kind: ItemKind;
  x: number;
  y: number;
  radius: number;
  speed: number;
};

export type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** Seconds left before it disappears. */
  life: number;
  kind: ItemKind;
};

/** Things that happened during a step, for sounds, messages or effects. */
export type GameEvent =
  | { type: "catch"; kind: ItemKind; points: number }
  | { type: "hit"; livesLeft: number }
  | { type: "barrel-full"; bonus: number; lifeGained: boolean }
  | { type: "game-over"; score: number };

export type World = {
  /** Seconds since the game started. */
  time: number;
  score: number;
  lives: number;
  /** Drops caught in a row. */
  streak: number;
  /** Drops in the barrel, from 0 to config.barrel.capacity. */
  barrel: number;
  /** Seconds the barrel is still safe after a hit. */
  safe: number;
  /** Seconds left of the screen shake after a hit. */
  shake: number;
  playerX: number;
  items: Item[];
  particles: Particle[];
  spawnTimer: number;
  nextId: number;
  over: boolean;
  events: GameEvent[];
  /** Spawn rates, falling speeds and item mix for this game (today's weather). */
  tuning: Tuning;
};

export type StepInput = {
  /** -1 left, 0 stay, 1 right. */
  direction: -1 | 0 | 1;
  /** A finger/mouse position from 0 to 1 across the game, or null. */
  pointer: number | null;
};

export type StepOptions = {
  /** Skip particles and shaking (for people who prefer reduced motion). */
  reducedMotion: boolean;
  random?: () => number;
};

const { world: size, player } = config;

/** A fresh game. Pass a `tuning` to change the weather (see lib/game/storm.ts). */
export function createWorld(tuning: Tuning = defaultTuning): World {
  return {
    time: 0,
    score: 0,
    lives: config.lives.start,
    streak: 0,
    barrel: 0,
    safe: 0,
    shake: 0,
    playerX: size.width / 2,
    items: [],
    particles: [],
    spawnTimer: 0.6,
    nextId: 1,
    over: false,
    events: [],
    tuning,
  };
}

/** The current score multiplier, from 1 up to config.combo.maxMultiplier. */
export function multiplier(world: World): number {
  return Math.min(
    config.combo.maxMultiplier,
    1 + Math.floor(world.streak / config.combo.catchesPerStep),
  );
}

/** The barrel's top edge (its y position). */
export function playerTop(): number {
  return size.height - player.bottomMargin - player.height;
}

function pickKind(weights: Tuning["weights"], random: () => number): ItemKind {
  const kinds = Object.keys(config.items) as ItemKind[];
  const total = kinds.reduce((sum, kind) => sum + weights[kind], 0);
  let roll = random() * total;
  for (const kind of kinds) {
    roll -= weights[kind];
    if (roll < 0) return kind;
  }
  return kinds[0];
}

function spawn(world: World, random: () => number) {
  const { fall, weights } = world.tuning;
  const kind = pickKind(weights, random);
  const radius = config.items[kind].radius;
  const base = Math.min(
    fall.maxSpeed,
    fall.startSpeed + world.time * fall.growPerSecond,
  );
  const variation = 1 + (random() * 2 - 1) * fall.variation;
  world.items.push({
    id: world.nextId++,
    kind,
    x: radius + random() * (size.width - radius * 2),
    y: -radius,
    radius,
    speed: base * variation,
  });
}

function burst(
  world: World,
  x: number,
  y: number,
  kind: ItemKind,
  random: () => number,
) {
  for (let i = 0; i < 8; i++) {
    const angle = random() * Math.PI * 2;
    const speed = 60 + random() * 120;
    world.particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 80,
      life: 0.5 + random() * 0.3,
      kind,
    });
  }
}

/** Does a falling circle touch the barrel (a rectangle)? */
function touchesPlayer(world: World, item: Item): boolean {
  const left = world.playerX - player.width / 2;
  const top = playerTop();
  const nearestX = Math.max(left, Math.min(item.x, left + player.width));
  const nearestY = Math.max(top, Math.min(item.y, top + player.height));
  const dx = item.x - nearestX;
  const dy = item.y - nearestY;
  return dx * dx + dy * dy <= item.radius * item.radius;
}

/** Move the game forward by `dt` seconds. Changes `world` in place. */
export function stepWorld(
  world: World,
  input: StepInput,
  dt: number,
  { reducedMotion, random = Math.random }: StepOptions,
) {
  if (world.over) return;
  world.time += dt;
  world.safe = Math.max(0, world.safe - dt);
  world.shake = Math.max(0, world.shake - dt);

  // 1. Move the barrel: toward the finger if one is down, otherwise by the keys.
  const half = player.width / 2;
  if (input.pointer !== null) {
    const target = input.pointer * size.width;
    const maxMove = player.speed * dt;
    const delta = Math.max(-maxMove, Math.min(maxMove, target - world.playerX));
    world.playerX += delta;
  } else {
    world.playerX += input.direction * player.speed * dt;
  }
  world.playerX = Math.max(half, Math.min(size.width - half, world.playerX));

  // 2. Spawn new items, faster as time goes on.
  world.spawnTimer -= dt;
  if (world.spawnTimer <= 0) {
    spawn(world, random);
    const { spawn: rate } = world.tuning;
    world.spawnTimer = Math.max(
      rate.minInterval,
      rate.startInterval - world.time * rate.shrinkPerSecond,
    );
  }

  // 3. Move items and check what they hit.
  const kept: Item[] = [];
  for (const item of world.items) {
    item.y += item.speed * dt;

    if (touchesPlayer(world, item)) {
      if (item.kind === "hail") {
        if (world.safe > 0) continue; // Still safe after the last hit: it shatters harmlessly.
        world.lives -= 1;
        world.streak = 0;
        world.safe = config.lives.safeSeconds;
        if (!reducedMotion) world.shake = 0.3;
        world.events.push({ type: "hit", livesLeft: world.lives });
        if (world.lives <= 0) {
          world.over = true;
          world.events.push({ type: "game-over", score: world.score });
        }
      } else {
        world.streak += 1;
        const points = config.items[item.kind].points * multiplier(world);
        world.score += points;
        world.barrel += 1;
        world.events.push({ type: "catch", kind: item.kind, points });
        if (world.barrel >= config.barrel.capacity) {
          world.barrel = 0;
          world.score += config.barrel.bonusPoints;
          const lifeGained = world.lives < config.lives.max;
          if (lifeGained) world.lives += 1;
          world.events.push({
            type: "barrel-full",
            bonus: config.barrel.bonusPoints,
            lifeGained,
          });
        }
      }
      if (!reducedMotion) burst(world, item.x, item.y, item.kind, random);
      continue;
    }

    if (item.y - item.radius > size.height) {
      // A missed drop breaks the streak. Missed hail is fine: you dodged it!
      if (item.kind !== "hail") world.streak = 0;
      continue;
    }
    kept.push(item);
  }
  world.items = kept;

  // 4. Particles drift, fall and fade.
  world.particles = world.particles.filter((particle) => {
    particle.life -= dt;
    particle.vy += 400 * dt;
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    return particle.life > 0;
  });
}
