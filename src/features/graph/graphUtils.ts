export function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

/** Sort history oldest -> newest */
export function sortHistory<T extends { date: string }>(h: T[]) {
  return h.slice().sort((a, b) => (a.date < b.date ? -1 : 1));
}

/** Build X ticks:
 *  - 7d: all dates
 *  - 15d: every 2nd date
 *  - 30d: evenly spaced 'tickCount' (default 7)
 */
export function buildXTicks(dates: string[], days: number, tickCount = 7) {
  if (!dates.length) return [];
  if (days === 7) return dates;
  if (days === 15) return dates.filter((_, idx) => idx % 2 === 0);

  const n = dates.length;
  if (n <= tickCount) return dates;

  const step = (n - 1) / (tickCount - 1);
  const idxs = Array.from({ length: tickCount }, (_, i) =>
    Math.round(i * step)
  );

  return idxs.map((i) => dates[i]);
}

/** Compute min/max from chartData for a currency key */
export function computeMinMax(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  chartData: any[],
  key: string
): [number | null, number | null] {
  if (!chartData.length) return [null, null];

  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;

  for (const r of chartData) {
    const v = r[key];
    if (typeof v !== "number") continue; // ← critical fix

    if (v < min) min = v;
    if (v > max) max = v;
  }

  if (!isFinite(min) || !isFinite(max)) {
    return [null, null];
  }

  return [min, max];
}

/** Build Y domain with padding (5% or min pad) */
export function buildYDomain(
  minVal: number | null,
  maxVal: number | null,
  padPct = 0.05,
  minPad = 0.01
) {
  if (minVal === null || maxVal === null) return undefined;

  if (minVal === maxVal) {
    const pad = Math.max(Math.abs(maxVal) * padPct, minPad);
    return [Math.max(0, minVal - pad), maxVal + pad] as const;
  }

  const range = Math.abs(maxVal - minVal);
  const pad = Math.max(range * padPct, minPad);

  return [Math.max(0, minVal - pad), maxVal + pad] as const;
}

/** Build evenly spaced Y ticks */
export function buildYTicks(domain?: readonly [number, number], count = 7) {
  if (!domain) return undefined;

  const [min, max] = domain;
  const step = (max - min) / (count - 1);

  return Array.from({ length: count }, (_, i) =>
    Number((min + step * i).toFixed(Math.abs(min) >= 1 ? 4 : 6))
  );
}

/** Format YYYY-MM-DD as DD/MM */
export function formatDDMM(date: string) {
  const [, m, d] = date.split("-");
  return `${d}/${m}`;
}
