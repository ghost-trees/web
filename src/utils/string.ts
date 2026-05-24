/**
 * @file string.ts
 * @description
 * Shared string formatting helpers.
 */

export function toTitleCase(value: string): string {
  return value
    .split(' ')
    .filter((part) => part.length > 0)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function normalizeAddressParts(value: string): string[] {
  return value
    .split(',')
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
    .filter((part) => part.toLowerCase() !== 'united states');
}

function isNumericToken(value: string): boolean {
  return /^\d+$/.test(value);
}

function startsWithHouseNumber(value: string): boolean {
  return /^\d+[a-zA-Z0-9-]*\b/.test(value);
}

export function extractStreetLine(value: string): string | null {
  const normalizedAddress = value.trim();
  if (!normalizedAddress || normalizedAddress.toLowerCase() === 'unknown') {
    return null;
  }

  const parts = normalizeAddressParts(normalizedAddress);
  if (parts.length === 0) {
    return null;
  }

  const [firstPart, secondPart, thirdPart] = parts;
  if (!firstPart) {
    return null;
  }

  if (isNumericToken(firstPart) && secondPart) {
    return `${firstPart} ${secondPart}`.trim();
  }

  if (!startsWithHouseNumber(firstPart) && isNumericToken(secondPart ?? '') && thirdPart) {
    return `${secondPart} ${thirdPart}`.trim();
  }

  return firstPart;
}

export function extractZipCode(value: string): string | null {
  const zipMatches = value.trim().match(/\b\d{5}(?:-\d{4})?\b/g);
  return zipMatches?.at(-1) ?? null;
}
