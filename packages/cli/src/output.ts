import type { ProviderHealthRecord, SessionSummary, StoredSessionDetail, StoredSessionListItem } from '@ttm/core';

function formatDecimal(value: number, digits: number): string {
  return value.toFixed(digits);
}

function formatOptionalNumber(value: number | null, digits = 1): string {
  return value === null ? 'n/a' : formatDecimal(value, digits);
}

function formatOptionalText(value: string | null, fallback = 'unknown'): string {
  return value ?? fallback;
}

function formatSessionCost(session: {
  costTotalUsd: number;
  pricingSnapshotId: string | null;
}): string {
  return session.pricingSnapshotId === null
    ? 'unknown'
    : formatDecimal(session.costTotalUsd, 4);
}

export function formatKeyValueLine(label: string, value: string | number): string {
  return `${label}: ${String(value)}`;
}

export function formatSummaryRow(summary: SessionSummary): string {
  const pricingCoverage = `${summary.pricedSessions}/${summary.sessions} priced`;
  return `${summary.provider}: sessions=${summary.sessions} tokens=${summary.totalTokens} cost_usd=${formatDecimal(summary.totalCostUsd, 4)} pricing=${pricingCoverage} avg_efficiency=${formatOptionalNumber(summary.averageEfficiency)}`;
}

export function formatSessionRow(session: StoredSessionListItem): string {
  return `${session.providerSessionId} | ${session.provider} | ${session.startedAt} | ${formatOptionalText(session.model)} | tokens=${session.tokenTotal} | cost_usd=${formatSessionCost(session)} | efficiency=${formatOptionalNumber(session.efficiencyScore, 0)} | ${session.outcome} | ${session.title ?? '<untitled>'}`;
}

export function formatSessionDetailLines(session: StoredSessionDetail): string[] {
  const costStatus = session.pricingSnapshotId === null ? 'unknown pricing' : 'known pricing';

  return [
    formatKeyValueLine('session', session.providerSessionId),
    formatKeyValueLine('provider', session.provider),
    formatKeyValueLine('model', formatOptionalText(session.model)),
    formatKeyValueLine('started_at', session.startedAt),
    formatKeyValueLine('project_path', formatOptionalText(session.projectPath)),
    formatKeyValueLine(
      'tokens',
      `input=${session.tokenInput} output=${session.tokenOutput} cached=${session.tokenCachedInput} reasoning=${session.tokenReasoning} total=${session.tokenTotal}`,
    ),
    formatKeyValueLine(
      'cost_usd',
      session.pricingSnapshotId === null ? 'unknown' : formatDecimal(session.costTotalUsd, 4),
    ),
    formatKeyValueLine('pricing_status', costStatus),
    formatKeyValueLine(
      'cost_breakdown_usd',
      `input=${formatDecimal(session.costInputUsd, 4)} output=${formatDecimal(session.costOutputUsd, 4)} cache_read=${formatDecimal(session.costCacheReadUsd, 4)} cache_write=${formatDecimal(session.costCacheWriteUsd, 4)}`,
    ),
    formatKeyValueLine('efficiency_score', formatOptionalNumber(session.efficiencyScore, 0)),
    formatKeyValueLine('waste_score', formatOptionalNumber(session.wasteScore, 0)),
    formatKeyValueLine('outcome', `${session.outcome} (confidence=${formatOptionalNumber(session.outcomeConfidence)})`),
    formatKeyValueLine(
      'task_category',
      `${session.taskCategory} (confidence=${formatOptionalNumber(session.taskCategoryConfidence)})`,
    ),
    formatKeyValueLine('loop_count', session.loopCount),
    formatKeyValueLine('title', session.title ?? '<untitled>'),
  ];
}
