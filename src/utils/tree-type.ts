/**
 * @file tree-type.ts
 * @description
 * Shared tree-type formatting helpers.
 */

import { UNKNOWN_TREE_TYPE } from '../state/data-store';
import { toTitleCase } from './string';

export const UNKNOWN_DISPLAY_VALUE = 'Unknown';

export function formatTreeTypeLabel(treeType: string): string {
  const normalizedTreeType = treeType.trim().toLowerCase();
  if (!normalizedTreeType || normalizedTreeType === UNKNOWN_TREE_TYPE) {
    return UNKNOWN_DISPLAY_VALUE;
  }

  return toTitleCase(normalizedTreeType);
}

export function formatTreeTypeList(treeTypes: string[]): string {
  if (treeTypes.length === 0) {
    return UNKNOWN_DISPLAY_VALUE;
  }

  const labels = [...new Set(treeTypes.map(formatTreeTypeLabel))];
  return labels.length > 0 ? labels.join(', ') : UNKNOWN_DISPLAY_VALUE;
}
