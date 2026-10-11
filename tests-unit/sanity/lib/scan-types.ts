/**
 * Shape of a source-scan rule (regex + known-bad/known-good samples that source-scan.test.ts checks, so a blind regex fails).
 */

export interface ScanRule {
  id: string;
  label: string;
  re: RegExp;
  /** strings the rule MUST flag (positive control) */
  bad: string[];
  /** strings the rule must NOT flag */
  good: string[];
}

export const BP = '(?:[a-z0-9]+:)*'; // optional responsive/state prefix chain: md:, lg:hover:
