import { describe, expect, it } from 'vitest';
import {
  LEGACY_SIZE_EXPONENT_PARAM,
  SIZE_MULTIPLIER_PARAM,
  feeModeRadiusMax,
  maximumValidFee,
  pointRadius,
  sizeMultiplierFromSearchParams,
  stepSizeMultiplier,
} from './point-radius';

const MAX_FEE = 100;

function feeRadius(feePercent: number, sizeMultiplier: number): number {
  return pointRadius({
    scaleByFee: true,
    fee: (feePercent / 100) * MAX_FEE,
    maxFee: MAX_FEE,
    sizeMultiplier,
  });
}

describe('pointRadius', () => {
  it.each([
    [1, 0, 3],
    [1, 50, 10.5],
    [1, 100, 18],
    [2, 0, 3],
    [2, 50, 18],
    [2, 100, 33],
    [3, 0, 3],
    [3, 50, 25.5],
    [3, 100, 48],
  ])('uses %sx at %s%% of the max fee', (sizeMultiplier, feePercent, radius) => {
    expect(feeRadius(feePercent, sizeMultiplier)).toBe(radius);
  });

  it('keeps the minimum radius at 3 px for every multiplier', () => {
    for (const sizeMultiplier of [1, 1.1, 2, 3]) {
      expect(feeRadius(0, sizeMultiplier)).toBe(3);
    }
  });

  it('gives invalid fees the minimum radius', () => {
    for (const fee of [0, -20, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(pointRadius({ scaleByFee: true, fee, maxFee: MAX_FEE, sizeMultiplier: 3 })).toBe(3);
    }
  });

  it('gives every point the minimum radius when no positive max fee exists', () => {
    expect(maximumValidFee([])).toBe(0);
    expect(maximumValidFee([0, -4, Number.NaN])).toBe(0);
    expect(pointRadius({ scaleByFee: true, fee: 40, maxFee: 0, sizeMultiplier: 2 })).toBe(3);
    expect(pointRadius({ scaleByFee: true, fee: 40, maxFee: Number.NaN, sizeMultiplier: 2 })).toBe(
      3,
    );
  });

  it('uses the highest positive fee as the maximum', () => {
    expect(maximumValidFee([0, 12, -3, Number.NaN, 9])).toBe(12);
  });

  it('ignores the multiplier in uniform mode', () => {
    expect(
      pointRadius({ scaleByFee: false, fee: MAX_FEE, maxFee: MAX_FEE, sizeMultiplier: 3 }),
    ).toBe(3);
  });

  it('lets fee mode render up to the calculated maximum', () => {
    expect(feeModeRadiusMax(1)).toBe(18);
    expect(feeModeRadiusMax(2)).toBe(33);
    expect(feeModeRadiusMax(3)).toBe(48);
    expect(feeRadius(100, 2)).toBe(feeModeRadiusMax(2));
  });
});

describe('size multiplier controls', () => {
  it('steps by 1 and clamps to 1–10', () => {
    expect(stepSizeMultiplier(1, 1)).toBe(2);
    expect(stepSizeMultiplier(1.1, 1)).toBeCloseTo(2.1);
    expect(stepSizeMultiplier(1, -1)).toBe(1);
    expect(stepSizeMultiplier(3, 1)).toBe(4);
    expect(stepSizeMultiplier(10, 1)).toBe(10);
    expect(stepSizeMultiplier(0.2, 1)).toBe(2);
    expect(stepSizeMultiplier(12, -1)).toBe(9);
  });

  it('reads the size param and ignores a legacy exponent', () => {
    expect(sizeMultiplierFromSearchParams(new URLSearchParams('size=2'))).toBe(2);
    expect(sizeMultiplierFromSearchParams(new URLSearchParams('size=1.1'))).toBeCloseTo(1.1);
    expect(sizeMultiplierFromSearchParams(new URLSearchParams('size=0.4'))).toBe(1);
    expect(sizeMultiplierFromSearchParams(new URLSearchParams('size=9'))).toBe(9);
    expect(sizeMultiplierFromSearchParams(new URLSearchParams('size=15'))).toBe(10);
    expect(sizeMultiplierFromSearchParams(new URLSearchParams('size=abc'))).toBeUndefined();
    expect(
      sizeMultiplierFromSearchParams(new URLSearchParams(`${LEGACY_SIZE_EXPONENT_PARAM}=3`)),
    ).toBeUndefined();
    expect(
      sizeMultiplierFromSearchParams(
        new URLSearchParams(`${LEGACY_SIZE_EXPONENT_PARAM}=3&${SIZE_MULTIPLIER_PARAM}=1.1`),
      ),
    ).toBeCloseTo(1.1);
  });
});
