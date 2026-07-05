import { describe, expect, it } from 'vitest';
import { normalizeAddressForDisplay } from './address-normalization';

describe('normalizeAddressForDisplay', () => {
  it('abbreviates directional and street-suffix tokens', () => {
    expect(normalizeAddressForDisplay('1248 Oakcrest Drive Southwest')).toBe('1248 Oakcrest Dr SW');
    expect(normalizeAddressForDisplay('140 Chastain Park Avenue Northwest')).toBe(
      '140 Chastain Park Ave NW',
    );
  });

  it('normalizes tokens regardless of input casing', () => {
    expect(normalizeAddressForDisplay('55 PEACHTREE STREET northEAST')).toBe('55 PEACHTREE St NE');
  });

  it('leaves already-abbreviated addresses stable', () => {
    expect(normalizeAddressForDisplay('1111 Main St SE')).toBe('1111 Main St SE');
  });

  it('returns empty string for empty or whitespace-only input', () => {
    expect(normalizeAddressForDisplay('')).toBe('');
    expect(normalizeAddressForDisplay('   ')).toBe('');
  });

  it('keeps POI prefixes intact while normalizing only street tokens', () => {
    expect(
      normalizeAddressForDisplay(
        'Chastain Park Gymnasium, 140, Chastain Park Avenue Northwest, Atlanta',
      ),
    ).toBe('Chastain Park Gymnasium, 140, Chastain Park Ave NW, Atlanta');
  });

  it('tidies comma spacing and collapses repeated whitespace', () => {
    expect(normalizeAddressForDisplay('1248 ,  Oakcrest  Drive Southwest')).toBe(
      '1248, Oakcrest Dr SW',
    );
  });
});
