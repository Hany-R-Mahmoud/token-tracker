export type ReferenceAppId = 'codexbar' | 'ai-token-monitor' | 'tokscale';

export type ComparisonStatus = 'match' | 'near_match' | 'mismatch' | 'inconclusive';

export interface ProviderReading {
  sessionCount: number | null;
  totalTokens: number | null;
  totalCostUsd: number | null;
  averageEfficiency: number | null;
  resetWindow: string | null;
  additionalFields: Record<string, string | number | boolean | null>;
}

export interface DiscrepancyEntry {
  field: string;
  ourValue: string | number | null;
  referenceValue: string | number | null;
  notes: string;
}

export interface DiscrepancySummary {
  totalDiscrepancies: number;
  largestField: string | null;
  largestPercent: string | null;
  statusLabel: string;
}

export interface ComparisonSnapshot {
  id: string;
  createdAt: string;
  referenceApp: ReferenceAppId | null;
  provider: string;
  ourReading: ProviderReading;
  referenceReading: ProviderReading;
  discrepancies: DiscrepancyEntry[];
  discrepancySummary: DiscrepancySummary;
  status: ComparisonStatus;
  confidence: number | null;
  notes: string[];
}

// Thresholds for status determination — conservative and explicit.
// A "match" means values are within 5% of each other.
// A "near_match" means values are within 20% of each other.
// Beyond 20% is a "mismatch".
// If fewer than 2 comparable numeric fields exist, status is "inconclusive".
const MATCH_THRESHOLD = 0.05;
const NEAR_MATCH_THRESHOLD = 0.20;
const MIN_COMPARABLE_FIELDS = 2;

export interface ReferenceInput {
  sessions: number | null;
  tokens: number | null;
  costUsd: number | null;
  efficiency: number | null;
  resetWindow: string | null;
}

interface NumericFieldDef {
  key: 'sessionCount' | 'totalTokens' | 'totalCostUsd' | 'averageEfficiency';
  label: string;
}

const NUMERIC_FIELDS: NumericFieldDef[] = [
  { key: 'sessionCount', label: 'session count' },
  { key: 'totalTokens', label: 'total tokens' },
  { key: 'totalCostUsd', label: 'total cost (USD)' },
  { key: 'averageEfficiency', label: 'average efficiency' },
];

const STATUS_LABELS: Record<ComparisonStatus, string> = {
  match: 'Values agree within 5%',
  near_match: 'Values differ by 5–20%',
  mismatch: 'Values differ by more than 20%',
  inconclusive: 'Too little comparable data to determine',
};

export function computeDiscrepancies(
  our: ProviderReading,
  reference: ProviderReading,
): DiscrepancyEntry[] {
  const discrepancies: DiscrepancyEntry[] = [];

  for (const field of NUMERIC_FIELDS) {
    const ourVal = our[field.key];
    const refVal = reference[field.key];
    if (ourVal === null || refVal === null) {
      continue;
    }

    const maxVal = Math.max(Math.abs(ourVal), Math.abs(refVal));
    if (maxVal === 0) {
      continue;
    }

    const diff = Math.abs(ourVal - refVal) / maxVal;
    if (diff > MATCH_THRESHOLD) {
      const pct = (diff * 100).toFixed(1);
      discrepancies.push({
        field: field.label,
        ourValue: ourVal,
        referenceValue: refVal,
        notes: `${pct}% difference`,
      });
    }
  }

  if (our.resetWindow !== null && reference.resetWindow !== null && our.resetWindow !== reference.resetWindow) {
    discrepancies.push({
      field: 'reset window',
      ourValue: our.resetWindow,
      referenceValue: reference.resetWindow,
      notes: 'reset window values differ',
    });
  }

  return discrepancies;
}

export function determineComparisonStatus(
  our: ProviderReading,
  reference: ProviderReading,
  discrepancies: DiscrepancyEntry[],
): ComparisonStatus {
  let comparableCount = 0;
  for (const field of NUMERIC_FIELDS) {
    if (our[field.key] !== null && reference[field.key] !== null) {
      comparableCount += 1;
    }
  }

  if (comparableCount < MIN_COMPARABLE_FIELDS) {
    return 'inconclusive';
  }

  if (discrepancies.length === 0) {
    return 'match';
  }

  const hasLargeDiscrepancy = discrepancies.some((d) => {
    const ourVal = typeof d.ourValue === 'number' ? d.ourValue : 0;
    const refVal = typeof d.referenceValue === 'number' ? d.referenceValue : 0;
    const maxVal = Math.max(Math.abs(ourVal), Math.abs(refVal));
    if (maxVal === 0) {
      return false;
    }
    return Math.abs(ourVal - refVal) / maxVal > NEAR_MATCH_THRESHOLD;
  });

  return hasLargeDiscrepancy ? 'mismatch' : 'near_match';
}

export function buildDiscrepancySummary(
  status: ComparisonStatus,
  discrepancies: DiscrepancyEntry[],
): DiscrepancySummary {
  if (discrepancies.length === 0) {
    return {
      totalDiscrepancies: 0,
      largestField: null,
      largestPercent: null,
      statusLabel: STATUS_LABELS[status],
    };
  }

  let largestField: string | null = null;
  let largestPercent: string | null = null;
  let maxDiff = 0;

  for (const d of discrepancies) {
    const ourVal = typeof d.ourValue === 'number' ? d.ourValue : 0;
    const refVal = typeof d.referenceValue === 'number' ? d.referenceValue : 0;
    const maxVal = Math.max(Math.abs(ourVal), Math.abs(refVal));
    if (maxVal === 0) {
      continue;
    }
    const diff = Math.abs(ourVal - refVal) / maxVal;
    if (diff > maxDiff) {
      maxDiff = diff;
      largestField = d.field;
      largestPercent = (diff * 100).toFixed(1);
    }
  }

  return {
    totalDiscrepancies: discrepancies.length,
    largestField,
    largestPercent,
    statusLabel: STATUS_LABELS[status],
  };
}
