/**
 * @file point-radius.ts
 * @description
 * Linear fee radius for map points. The multiplier scales only the radius above
 * the 3 px minimum. Uniform mode ignores it and always uses that minimum.
 */

import { POINT_RADIUS_DEFAULT } from './constants';

export const POINT_RADIUS_MIN = POINT_RADIUS_DEFAULT;
export const POINT_RADIUS_FEE_SPAN = 15;
export const SIZE_MULTIPLIER_MIN = 1;
export const SIZE_MULTIPLIER_MAX = 10;
export const SIZE_MULTIPLIER_STEP = 1;
export const SIZE_MULTIPLIER_DEFAULT = 1;
export const SIZE_MULTIPLIER_PARAM = 'size';

// Retired fee-scale exponent. A different setting from the size multiplier, so a
// URL that only has this param keeps the default multiplier.
export const LEGACY_SIZE_EXPONENT_PARAM = 'strength';

const COMMITTED_MULTIPLIER_PATTERN = /^[+-]?\d+(?:\.\d+)?$/;
const LIVE_MULTIPLIER_PATTERN = /^(?:[1-9](?:\.\d)?|10(?:\.0)?)$/;

export function clampSizeMultiplier(value: number): number {
  if (!Number.isFinite(value)) {
    return SIZE_MULTIPLIER_DEFAULT;
  }

  const tenths = Math.round(value * 10) / 10;
  return Math.min(SIZE_MULTIPLIER_MAX, Math.max(SIZE_MULTIPLIER_MIN, tenths));
}

export function stepSizeMultiplier(current: number, direction: -1 | 1): number {
  return clampSizeMultiplier(clampSizeMultiplier(current) + direction * SIZE_MULTIPLIER_STEP);
}

export function formatSizeMultiplier(value: number): string {
  return Number(clampSizeMultiplier(value).toFixed(1)).toString();
}

// A finished tenth inside 1–10 updates the map while typing. Partial or out-of-range
// text waits for commit.
export function parseLiveSizeMultiplier(raw: string): number | null {
  const trimmed = raw.trim();
  if (!LIVE_MULTIPLIER_PATTERN.test(trimmed)) {
    return null;
  }

  return clampSizeMultiplier(Number(trimmed));
}

// Empty or non-numeric text is rejected so the field can restore the last valid
// value. Numeric text is rounded to a tenth and clamped to 1–10.
export function parseCommittedSizeMultiplier(raw: string): number | null {
  const trimmed = raw.trim();
  if (!COMMITTED_MULTIPLIER_PATTERN.test(trimmed)) {
    return null;
  }

  const value = Number(trimmed);
  if (!Number.isFinite(value)) {
    return null;
  }

  return clampSizeMultiplier(value);
}

export function sizeMultiplierFromSearchParams(params: URLSearchParams): number | undefined {
  if (!params.has(SIZE_MULTIPLIER_PARAM)) {
    return undefined;
  }

  const parsed = parseCommittedSizeMultiplier(params.get(SIZE_MULTIPLIER_PARAM) ?? '');
  return parsed ?? undefined;
}

export function maximumValidFee(fees: readonly number[]): number {
  let maxFee = 0;
  for (const fee of fees) {
    if (Number.isFinite(fee) && fee > maxFee) {
      maxFee = fee;
    }
  }
  return maxFee;
}

export function feeModeRadiusMax(sizeMultiplier: number): number {
  return POINT_RADIUS_MIN + POINT_RADIUS_FEE_SPAN * clampSizeMultiplier(sizeMultiplier);
}

type PointRadiusArgs = {
  scaleByFee: boolean;
  fee: number;
  maxFee: number;
  sizeMultiplier: number;
};

export function pointRadius({ scaleByFee, fee, maxFee, sizeMultiplier }: PointRadiusArgs): number {
  if (!scaleByFee) {
    return POINT_RADIUS_MIN;
  }

  const safeFee = Number.isFinite(fee) && fee > 0 ? fee : 0;
  const feeRatio = Number.isFinite(maxFee) && maxFee > 0 ? Math.min(safeFee / maxFee, 1) : 0;

  return POINT_RADIUS_MIN + feeRatio * POINT_RADIUS_FEE_SPAN * clampSizeMultiplier(sizeMultiplier);
}
