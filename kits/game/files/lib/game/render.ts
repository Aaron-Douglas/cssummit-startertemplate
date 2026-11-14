import { config, type ItemKind } from "@/lib/game/config";
import { type Item, playerTop, type World } from "@/lib/game/world";

/**
 * Drawing. Everything the player sees on the canvas is drawn here, in world units
 * (config.world), using colours read from the site's design tokens.
 */

export type Palette = {
  background: string;
  foreground: string;
  muted: string;
  border: string;
  player: string;
  playerDetail: string;
  water: string;
  items: Record<ItemKind, string>;
  /** Corner radius for the barrel, from the design's shape option (sharp → 0). */
  corner: number;
};

/**
 * Reads colours from the CSS variables in app/globals.css (the same tokens Tailwind uses), so
 * the game follows the chosen design and accent. Call it again when the design changes.
 */
export function readPalette(
  element: Element = document.documentElement,
): Palette {
  const styles = getComputedStyle(element);
  // If a token is missing, fall back to the text colour so nothing becomes invisible.
  const fallback = getComputedStyle(document.body).color;
  const token = (name: string) =>
    styles.getPropertyValue(`--${name}`).trim() || fallback;
  return {
    background: token("card"),
    foreground: token("foreground"),
    muted: token("muted-foreground"),
    border: token("border"),
    player: token("primary"),
    playerDetail: token("primary-foreground"),
    water: token("chart-2"),
    items: {
      drop: token("chart-2"),
      golden: token("chart-4"),
      hail: token("destructive"),
    },
    corner: toUnits(styles.getPropertyValue("--shape-control")),
  };
}

/** "0.75rem" / "12px" → a corner radius in world units, capped so pills stay barrel-shaped. */
function toUnits(value: string): number {
  const number = Number.parseFloat(value);
  if (Number.isNaN(number)) return 8;
  const px = value.trim().endsWith("rem") ? number * 16 : number;
  return Math.max(0, Math.min(14, px * 0.75));
}

/** Draw one frame. `ctx` is already scaled so 1 unit = 1 world unit. */
export function drawWorld(
  ctx: CanvasRenderingContext2D,
  world: World,
  palette: Palette,
  { reducedMotion }: { reducedMotion: boolean },
) {
  const { width, height } = config.world;

  ctx.save();
  ctx.fillStyle = palette.background;
  ctx.fillRect(0, 0, width, height);

  if (world.shake > 0 && !reducedMotion) {
    const amount = world.shake * 12;
    ctx.translate(
      (Math.random() * 2 - 1) * amount,
      (Math.random() * 2 - 1) * amount,
    );
  }

  drawGarden(ctx, world, palette);
  for (const item of world.items) drawItem(ctx, item, palette);
  drawParticles(ctx, world, palette);
  drawPlayer(ctx, world, palette, reducedMotion);
  ctx.restore();
}

/** The garden bed along the bottom. Sprouts grow as the barrel fills. */
function drawGarden(
  ctx: CanvasRenderingContext2D,
  world: World,
  palette: Palette,
) {
  const { width, height } = config.world;
  const groundY = height - 8;
  ctx.fillStyle = palette.border;
  ctx.fillRect(0, groundY, width, 8);

  const growth = world.barrel / config.barrel.capacity;
  ctx.strokeStyle = palette.muted;
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  for (let x = 20; x < width; x += 40) {
    const stem = 6 + growth * 14;
    ctx.beginPath();
    ctx.moveTo(x, groundY);
    ctx.lineTo(x, groundY - stem);
    ctx.moveTo(x, groundY - stem * 0.6);
    ctx.lineTo(x - 5, groundY - stem * 0.6 - 4);
    ctx.moveTo(x, groundY - stem * 0.75);
    ctx.lineTo(x + 5, groundY - stem * 0.75 - 4);
    ctx.stroke();
  }
}

function drawItem(ctx: CanvasRenderingContext2D, item: Item, palette: Palette) {
  const color = palette.items[item.kind];
  const { x, y, radius: r } = item;
  ctx.fillStyle = color;
  ctx.strokeStyle = color;

  if (item.kind === "hail") {
    // A jagged stone: a different *shape* from the drops, not just a different colour.
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 + item.id;
      const reach = i % 2 === 0 ? r : r * 0.62;
      const px = x + Math.cos(angle) * reach;
      const py = y + Math.sin(angle) * reach;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    return;
  }

  // A teardrop: round at the bottom, pointed at the top.
  ctx.beginPath();
  ctx.moveTo(x, y - r * 1.7);
  ctx.bezierCurveTo(x + r * 0.4, y - r, x + r, y - r * 0.2, x + r, y + r * 0.1);
  ctx.arc(x, y + r * 0.1, r, 0, Math.PI);
  ctx.bezierCurveTo(x - r, y - r * 0.2, x - r * 0.4, y - r, x, y - r * 1.7);
  ctx.fill();

  if (item.kind === "golden") {
    // A ring of short rays so it stands out by shape too.
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(angle) * (r + 4), y + Math.sin(angle) * (r + 4));
      ctx.lineTo(x + Math.cos(angle) * (r + 9), y + Math.sin(angle) * (r + 9));
      ctx.stroke();
    }
  }
}

function drawParticles(
  ctx: CanvasRenderingContext2D,
  world: World,
  palette: Palette,
) {
  for (const particle of world.particles) {
    ctx.globalAlpha = Math.max(0, Math.min(1, particle.life / 0.5));
    ctx.fillStyle = palette.items[particle.kind];
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** The rain barrel, with its water level showing how full it is. */
function drawPlayer(
  ctx: CanvasRenderingContext2D,
  world: World,
  palette: Palette,
  reducedMotion: boolean,
) {
  const { width: w, height: h } = config.player;
  const x = world.playerX - w / 2;
  const y = playerTop();

  // Just hit: blink, or (reduced motion) a steady dashed outline instead of blinking.
  const safe = world.safe > 0;
  if (safe && !reducedMotion && Math.floor(world.safe * 10) % 2 === 0) {
    ctx.globalAlpha = 0.35;
  }

  roundedRect(ctx, x, y, w, h, palette.corner);
  ctx.fillStyle = palette.player;
  ctx.fill();

  // Water inside, rising as the barrel fills.
  const fill = world.barrel / config.barrel.capacity;
  if (fill > 0) {
    const inner = h - 10;
    const level = inner * fill;
    ctx.save();
    roundedRect(ctx, x + 6, y + 5, w - 12, inner, palette.corner / 2);
    ctx.clip();
    ctx.fillStyle = palette.water;
    ctx.fillRect(x + 6, y + 5 + inner - level, w - 12, level);
    ctx.restore();
  }

  // Two hoops around the barrel.
  ctx.strokeStyle = palette.playerDetail;
  ctx.lineWidth = 3;
  for (const band of [0.3, 0.72]) {
    ctx.beginPath();
    ctx.moveTo(x + 2, y + h * band);
    ctx.lineTo(x + w - 2, y + h * band);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  if (safe && reducedMotion) {
    ctx.setLineDash([5, 4]);
    ctx.strokeStyle = palette.foreground;
    ctx.lineWidth = 2;
    roundedRect(ctx, x - 4, y - 4, w + 8, h + 8, palette.corner + 4);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}
