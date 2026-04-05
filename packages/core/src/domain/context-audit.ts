export type ContextBreakdownKind =
  | 'user'
  | 'assistant'
  | 'tool'
  | 'cache'
  | 'reasoning'
  | 'verification'
  | 'other';

export interface ContextBreakdown {
  kind: ContextBreakdownKind;
  tokens: number;
  percent: number | null;
  label: string;
}

export type ContextPressureState = 'low' | 'medium' | 'high' | 'critical' | 'unknown';

export interface ContextAuditResult {
  contextLimit: number | null;
  contextUsagePercent: number | null;
  contextPressureState: ContextPressureState;
  inputTokens: number;
  outputTokens: number;
  reasoningTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
  userMessages: number | null;
  assistantMessages: number | null;
  toolCallCount: number;
  contextBreakdown: ContextBreakdown[];
  contextWarnings: string[];
  hasContextLimit: boolean;
}

const CONTEXT_LIMITS: Record<string, number> = {
  'claude-3-5-sonnet-20241022': 200000,
  'claude-3-5-sonnet-20240620': 200000,
  'claude-3-5-haiku-20241022': 200000,
  'claude-3-opus-20240229': 200000,
  'claude-3-sonnet-20240229': 200000,
  'claude-3-haiku-20240307': 200000,
  'o1-preview': 200000,
  'o1-mini': 200000,
  'o1': 200000,
  'gpt-4o': 128000,
  'gpt-4o-mini': 128000,
  'gpt-4-turbo': 128000,
  'gpt-4': 128000,
  'gpt-3.5-turbo': 16385,
  'sonnet': 200000,
  'haiku': 200000,
  'opus': 200000,
  'default': 128000,
};

function getContextLimitForModel(model: string | null): number | null {
  if (!model) return null;
  const lowerModel = model.toLowerCase();
  for (const [key, limit] of Object.entries(CONTEXT_LIMITS)) {
    if (lowerModel.includes(key)) {
      return limit;
    }
  }
  return CONTEXT_LIMITS.default;
}

function deriveContextBreakdown(
  inputTokens: number,
  outputTokens: number,
  reasoningTokens: number,
  cacheReadTokens: number,
  cacheWriteTokens: number,
  totalTokens: number
): ContextBreakdown[] {
  const breakdown: ContextBreakdown[] = [];
  
  if (totalTokens > 0) {
    breakdown.push({
      kind: 'user',
      tokens: inputTokens,
      percent: (inputTokens / totalTokens) * 100,
      label: 'User Input',
    });
    
    breakdown.push({
      kind: 'assistant',
      tokens: outputTokens,
      percent: (outputTokens / totalTokens) * 100,
      label: 'Assistant Output',
    });
    
    breakdown.push({
      kind: 'reasoning',
      tokens: reasoningTokens,
      percent: (reasoningTokens / totalTokens) * 100,
      label: 'Reasoning',
    });
    
    const totalCache = cacheReadTokens + cacheWriteTokens;
    if (totalCache > 0) {
      breakdown.push({
        kind: 'cache',
        tokens: totalCache,
        percent: (totalCache / totalTokens) * 100,
        label: 'Cache',
      });
    }
    
    const accounted = inputTokens + outputTokens + reasoningTokens + totalCache;
    const other = Math.max(0, totalTokens - accounted);
    if (other > 0) {
      breakdown.push({
        kind: 'other',
        tokens: other,
        percent: (other / totalTokens) * 100,
        label: 'Other',
      });
    }
  }
  
  return breakdown.sort((a, b) => b.tokens - a.tokens);
}

function deriveContextWarnings(
  pressureState: ContextPressureState,
  contextUsagePercent: number | null,
  cacheHitRate: number | null,
  toolCallCount: number,
  totalTokens: number,
  successScore: number | null,
  valueDensityScore: number | null
): string[] {
  const warnings: string[] = [];
  
  if (pressureState === 'critical') {
    warnings.push('Session was near or at context limit');
  } else if (pressureState === 'high' && contextUsagePercent !== null) {
    warnings.push(`Session used ${contextUsagePercent.toFixed(0)}% of available context`);
  }
  
  if (toolCallCount > 50) {
    warnings.push('High tool call count may indicate retry loops');
  }
  
  if (cacheHitRate !== null && cacheHitRate < 0.1 && totalTokens > 100000) {
    warnings.push('Low cache benefit despite high token count');
  }
  
  if (successScore !== null && successScore < 30 && totalTokens > 100000) {
    warnings.push('High context spend with low success score');
  }
  
  if (valueDensityScore !== null && valueDensityScore < 30 && totalTokens > 100000) {
    warnings.push('Low value density relative to token spend');
  }
  
  return warnings;
}

export function auditSessionContext(inputTokens: number, outputTokens: number, reasoningTokens: number, cacheReadTokens: number, cacheWriteTokens: number, model: string | null, toolCallCount: number, messageCount: number | null, cacheHitRate: number | null, successScore: number | null, valueDensityScore: number | null): ContextAuditResult {
  const contextLimit = getContextLimitForModel(model);
  const totalTokens = inputTokens + outputTokens + reasoningTokens + cacheReadTokens + cacheWriteTokens;
  
  let contextUsagePercent: number | null = null;
  let contextPressureState: ContextPressureState = 'unknown';
  let hasContextLimit = false;
  
  if (contextLimit !== null && contextLimit > 0 && totalTokens > 0) {
    hasContextLimit = true;
    contextUsagePercent = (totalTokens / contextLimit) * 100;
    
    if (contextUsagePercent >= 90) {
      contextPressureState = 'critical';
    } else if (contextUsagePercent >= 70) {
      contextPressureState = 'high';
    } else if (contextUsagePercent >= 40) {
      contextPressureState = 'medium';
    } else {
      contextPressureState = 'low';
    }
  } else {
    contextPressureState = 'unknown';
  }
  
  const contextBreakdown = deriveContextBreakdown(
    inputTokens,
    outputTokens,
    reasoningTokens,
    cacheReadTokens,
    cacheWriteTokens,
    totalTokens
  );
  
  const contextWarnings = deriveContextWarnings(
    contextPressureState,
    contextUsagePercent,
    cacheHitRate,
    toolCallCount,
    totalTokens,
    successScore,
    valueDensityScore
  );
  
  return {
    contextLimit,
    contextUsagePercent,
    contextPressureState,
    inputTokens,
    outputTokens,
    reasoningTokens,
    cacheReadTokens,
    cacheWriteTokens,
    userMessages: messageCount !== null ? Math.ceil(messageCount / 2) : null,
    assistantMessages: messageCount !== null ? Math.floor(messageCount / 2) : null,
    toolCallCount,
    contextBreakdown,
    contextWarnings,
    hasContextLimit,
  };
}

export function getContextPressureColor(state: ContextPressureState): string {
  switch (state) {
    case 'critical': return 'var(--critical)';
    case 'high': return 'var(--warning)';
    case 'medium': return 'var(--accent)';
    case 'low': return 'var(--success)';
    default: return 'var(--text-muted)';
  }
}

export function getContextPressureLabel(state: ContextPressureState): string {
  switch (state) {
    case 'critical': return 'Critical';
    case 'high': return 'High';
    case 'medium': return 'Medium';
    case 'low': return 'Low';
    default: return 'Unknown';
  }
}