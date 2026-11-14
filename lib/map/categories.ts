import { CATEGORIES, type CategoryId } from "./places";

/**
 * Each weather condition gets one of the design system's chart colours (`--chart-1` …
 * `--chart-5`), so markers and filter dots follow the design the team picked.
 *
 * There are six conditions but only five chart colours. Fog shares cloudy's colour: both mean
 * "grey sky, no rain", so they are the closest pair. The label and popup still say "Fog".
 */
const CHART_SLOT: Record<CategoryId, number> = {
  clear: 1,
  cloudy: 2,
  fog: 2, // same colour as cloudy, see above
  rain: 3,
  snow: 4,
  storm: 5,
};

export function categoryColor(category: CategoryId) {
  return `var(--chart-${CHART_SLOT[category] ?? 2})`;
}

export function categoryLabel(category: CategoryId) {
  return CATEGORIES.find((item) => item.id === category)?.label ?? category;
}

/** Straight-line distance in miles between two [lng, lat] points. */
export function milesBetween(a: [number, number], b: [number, number]) {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const earthMiles = 3958.8;
  const dLat = toRad(b[1] - a[1]);
  const dLng = toRad(b[0] - a[0]);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a[1])) * Math.cos(toRad(b[1])) * Math.sin(dLng / 2) ** 2;
  return 2 * earthMiles * Math.asin(Math.sqrt(h));
}
