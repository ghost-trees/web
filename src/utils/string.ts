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

export function extractZipCode(value: string): string | null {
  const zipMatch = value.match(/\b(\d{5}(?:-\d{4})?)\b(?!.*\b\d{5}(?:-\d{4})?\b)/);
  return zipMatch?.[1] ?? null;
}
