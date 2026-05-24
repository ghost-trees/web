import { describe, expect, it } from 'vitest';
import { extractStreetLine, extractZipCode } from './string';

describe('extractStreetLine', () => {
  it('combines numeric and street tokens for geocoder addresses', () => {
    expect(
      extractStreetLine(
        '1248, Oakcrest Drive Southwest, Atlanta, Fulton County, Georgia, 30311, United States',
      ),
    ).toBe('1248 Oakcrest Drive Southwest');
  });

  it('keeps the first token for compact address forms', () => {
    expect(extractStreetLine('1111 Boulevard DR SE, Atlanta GA 30312')).toBe(
      '1111 Boulevard DR SE',
    );
  });

  it('uses numbered street segment when address starts with a POI', () => {
    expect(
      extractStreetLine(
        'Chastain Park Gymnasium, 140, Chastain Park Avenue Northwest, Atlanta, Fulton County, Georgia, 30342, United States',
      ),
    ).toBe('140 Chastain Park Avenue Northwest');
  });

  it('keeps non-numbered roads that have no house number', () => {
    expect(
      extractStreetLine(
        'West Paces Ferry Road Northwest, Atlanta, Fulton County, Georgia, 30327, United States',
      ),
    ).toBe('West Paces Ferry Road Northwest');
  });

  it('returns null for unknown or empty values', () => {
    expect(extractStreetLine('Unknown')).toBeNull();
    expect(extractStreetLine('   ')).toBeNull();
  });
});

describe('extractZipCode', () => {
  it('extracts ZIP codes from mixed address formats', () => {
    expect(extractZipCode('1111 Boulevard DR SE, Atlanta GA 30312')).toBe('30312');
    expect(
      extractZipCode(
        '1248, Oakcrest Drive Southwest, Atlanta, Fulton County, Georgia, 30311, United States',
      ),
    ).toBe('30311');
  });

  it('supports ZIP+4 and returns the last ZIP token', () => {
    expect(extractZipCode('Somewhere 30309 then final 30310-1234')).toBe('30310-1234');
  });

  it('returns null when no ZIP is present', () => {
    expect(extractZipCode('No postal code in this string')).toBeNull();
  });
});
