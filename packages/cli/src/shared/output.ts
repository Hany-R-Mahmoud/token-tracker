import type { ProviderHealthRecord, SessionSummary, StoredSessionDetail, StoredSessionListItem } from '@ttm/core';
import type { SuccessSignal } from '@ttm/core';
import { auditSessionContext } from '@ttm/core';

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

function formatScore(value: number | null): string {
  return value === null ? 'n/a' : `${value}`;
}

function confidenceIndicator(value: number | null): string {
  if (value === null) return '';
  if (value >= 0.7) return ' [high]';
  if (value >= 0.4) return ' [moderate]';
  return ' [low]';
}

export function formatKeyValueLine(label: string, value: string | number): string {
  return `${label}: ${String(value)}`;
}

export function formatSummaryRow(summary: SessionSummary): string {
  const pricingCoverage = `${summary.pricedSessions}/${summary.sessions} priced`;
  const avgSuccess = summary.averageSuccessScore !== null
    ? ` avg_success=${formatDecimal(summary.averageSuccessScore, 0)}`
    : '';
  return `${summary.provider}: sessions=${summary.sessions} tokens=${summary.totalTokens} cost_usd=${formatDecimal(summary.totalCostUsd, 4)} pricing=${pricingCoverage} avg_efficiency=${formatOptionalNumber(summary.averageEfficiency)}${avgSuccess}`;
}

export function formatSessionRow(session: StoredSessionListItem): string {
  const successTag = session.successScore !== null
    ? ` success=${session.successScore}`
    : '';
  const verifTag = session.verificationState && session.verificationState !== 'missing'
    ? ` [${session.verificationState}]`
    : '';
  return `${session.providerSessionId} | ${session.provider} | ${session.startedAt} | ${formatOptionalText(session.model)} | tokens=${session.tokenTotal} | cost_usd=${formatSessionCost(session)} | efficiency=${formatOptionalNumber(session.efficiencyScore, 0)} | ${session.outcome} | ${session.title ?? '<untitled>'}${successTag}${verifTag}`;
}

export function formatSessionDetailLines(session: StoredSessionDetail): string[] {
  const costStatus = session.pricingSnapshotId === null ? 'unknown pricing' : 'known pricing';
  const sa = session.successAnalysis;

  const lines: string[] = [
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

  if (sa) {
    lines.push('');
    lines.push('--- success analysis ---');
    lines.push(formatKeyValueLine('completion_state', sa.completionState));
    lines.push(formatKeyValueLine('verification_state', sa.verificationState));
    lines.push(formatKeyValueLine('success_score', formatScore(sa.successScore)));
    lines.push(formatKeyValueLine('execution_quality', formatScore(sa.executionQualityScore)));
    lines.push(formatKeyValueLine('rework_score', formatScore(sa.reworkScore)));
    lines.push(formatKeyValueLine('value_density', formatScore(sa.valueDensityScore)));
    lines.push(formatKeyValueLine('analysis_confidence', formatOptionalNumber(sa.analysisConfidence) + confidenceIndicator(sa.analysisConfidence)));

    if (sa.successSignals && sa.successSignals.length > 0) {
      lines.push('');
      lines.push('signals:');
      const sorted = [...sa.successSignals].sort((a, b) => {
        if (a.direction === 'positive' && b.direction !== 'positive') return -1;
        if (a.direction !== 'positive' && b.direction === 'positive') return 1;
        return b.weight - a.weight;
      });
      for (const signal of sorted) {
        const dir = signal.direction === 'positive' ? '+' : signal.direction === 'negative' ? '-' : '~';
        lines.push(`  [${dir}] ${signal.label} (${signal.kind}, weight=${signal.weight}, confidence=${formatDecimal(signal.confidence, 2)})`);
        if (signal.evidence) {
          lines.push(`      evidence: ${signal.evidence}`);
        }
      }
      }
    }

    const contextAudit = auditSessionContext(
      session.tokenInput,
      session.tokenOutput,
      session.tokenReasoning,
      session.tokenCachedInput,
      0,
      session.model,
      session.loopCount,
      null,
      session.cacheHitRate,
      sa?.successScore ?? null,
      sa?.valueDensityScore ?? null
    );

    if (contextAudit.hasContextLimit || contextAudit.contextPressureState !== 'unknown') {
      lines.push('');
      lines.push('--- context audit ---');
      lines.push(formatKeyValueLine('context_pressure', contextAudit.contextPressureState));
      if (contextAudit.contextUsagePercent !== null) {
        lines.push(formatKeyValueLine('context_usage', `${contextAudit.contextUsagePercent.toFixed(1)}%`));
      }
      if (contextAudit.contextLimit !== null) {
        lines.push(formatKeyValueLine('context_limit', contextAudit.contextLimit));
      }

      const breakdownParts: string[] = [];
      for (const bd of contextAudit.contextBreakdown) {
        if (bd.percent !== null) {
          breakdownParts.push(`${bd.label}=${bd.percent.toFixed(1)}%`);
        }
      }
      if (breakdownParts.length > 0) {
        lines.push(formatKeyValueLine('context_breakdown', breakdownParts.join(' ')));
      }

      if (contextAudit.contextWarnings.length > 0) {
        lines.push('');
        lines.push('context_warnings:');
        for (const warn of contextAudit.contextWarnings) {
          lines.push(`  - ${warn}`);
        }
      }
    }

    return lines;
  }
