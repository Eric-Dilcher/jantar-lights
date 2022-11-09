export type LightsConfig<T> = [
  [T, T, T],
  [T, T, T, T, T, T, T],
  [T, T, T, T, T, T, T, T, T],
  [T, T, T, T, T, T, T, T, T],
  [T, T, T, T, T, T, T, T, T, T, T],
  [T, T, T, T, T, T, T, T, T, T, T],
  [T, T, T, T, T, T, T, T, T, T, T],
  [T, T, T, T, T, T, T, T, T],
  [T, T, T, T, T, T, T, T, T],
  [T, T, T, T, T, T, T],
  [T, T, T]
];
const u = undefined;
export const lightsTemplate: LightsConfig<undefined> = [
  [u, u, u],
  [u, u, u, u, u, u, u],
  [u, u, u, u, u, u, u, u, u],
  [u, u, u, u, u, u, u, u, u],
  [u, u, u, u, u, u, u, u, u, u, u],
  [u, u, u, u, u, u, u, u, u, u, u],
  [u, u, u, u, u, u, u, u, u, u, u],
  [u, u, u, u, u, u, u, u, u],
  [u, u, u, u, u, u, u, u, u],
  [u, u, u, u, u, u, u],
  [u, u, u],
];
export function buildLightsConfig<T>(
  gen: (row: number, col: number) => T
): LightsConfig<T> {
  return lightsTemplate.map((row, i) =>
    row.map((_, j) => gen(i, j))
  ) as LightsConfig<T>;
}

/** return false from callback to break early */
export function iterateLightsConfig<T>(
  config: LightsConfig<T>,
  clb: (val: T, row: number, col: number) => void | boolean
): void {
  for (const [i, row] of config.entries()) {
    for (const [j, val] of row.entries()) {
      if (clb(val, i, j) === false) {
        return;
      }
    }
  }
}

export function mapLightsConfig<T, U>(
  config: LightsConfig<T>,
  mapFn: (val: T, row: number, col: number) => U
): LightsConfig<U> {
  return buildLightsConfig((i, j) => mapFn(config[i][j], i, j));
}
