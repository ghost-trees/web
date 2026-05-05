/**
 * @file color.ts
 * @description
 * Shared color formatting helpers.
 */

export function rgbaFromTuple(
  [red, green, blue, alpha]: [number, number, number, number],
  alphaOverride?: number,
): string {
  const resolvedAlpha = alphaOverride ?? alpha / 255;
  return `rgba(${red}, ${green}, ${blue}, ${resolvedAlpha})`;
}
