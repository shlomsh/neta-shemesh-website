/**
 * SCAN_RULES: the regex scan table, assembled from the per-CLAUDE.md-section files (scan-typography, scan-colour,
 * scan-layout, scan-code). Add a rule to the file that matches its section; give it bad/good samples.
 */
import { CODE_RULES } from './scan-code';
import { COLOUR_RULES } from './scan-colour';
import { LAYOUT_RULES } from './scan-layout';
import { TYPOGRAPHY_RULES } from './scan-typography';
import type { ScanRule } from './scan-types';

export type { ScanRule } from './scan-types';
export { SNAP_RULE } from './scan-layout';
export const SCAN_RULES: ScanRule[] = [...TYPOGRAPHY_RULES, ...LAYOUT_RULES, ...CODE_RULES, ...COLOUR_RULES];
