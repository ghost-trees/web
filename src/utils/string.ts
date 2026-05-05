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
