import type { ModelPricing, PricingReader } from '../adapters/types.js';

export interface PricingStatus {
  status: 'known' | 'unknown';
  displayModel: string | null;
  source: string | null;
}

const OPENAI_PRICING: Record<string, ModelPricing> = {
  'gpt-5': {
    inputPerMillionUsd: 1.25,
    outputPerMillionUsd: 10,
    cacheReadPerMillionUsd: 0.125,
    cacheWritePerMillionUsd: null,
    pricingSnapshotId: 'openai-api-pricing:gpt-5',
    pricingSource: 'OpenAI API pricing snapshot',
    displayModel: 'gpt-5',
  },
  'gpt-5.1': {
    inputPerMillionUsd: 1.25,
    outputPerMillionUsd: 10,
    cacheReadPerMillionUsd: 0.125,
    cacheWritePerMillionUsd: null,
    pricingSnapshotId: 'openai-api-pricing:gpt-5.1',
    pricingSource: 'OpenAI API pricing snapshot',
    displayModel: 'gpt-5.1',
  },
  'gpt-5.2': {
    inputPerMillionUsd: 1.75,
    outputPerMillionUsd: 14,
    cacheReadPerMillionUsd: 0.175,
    cacheWritePerMillionUsd: null,
    pricingSnapshotId: 'openai-api-pricing:gpt-5.2',
    pricingSource: 'OpenAI API pricing snapshot',
    displayModel: 'gpt-5.2',
  },
  'gpt-5.4': {
    inputPerMillionUsd: 2.5,
    outputPerMillionUsd: 15,
    cacheReadPerMillionUsd: 0.25,
    cacheWritePerMillionUsd: null,
    pricingSnapshotId: 'openai-api-pricing:gpt-5.4',
    pricingSource: 'OpenAI API pricing snapshot',
    displayModel: 'gpt-5.4',
  },
  'gpt-5-mini': {
    inputPerMillionUsd: 0.25,
    outputPerMillionUsd: 2,
    cacheReadPerMillionUsd: 0.025,
    cacheWritePerMillionUsd: null,
    pricingSnapshotId: 'openai-api-pricing:gpt-5-mini',
    pricingSource: 'OpenAI API pricing snapshot',
    displayModel: 'gpt-5-mini',
  },
  'gpt-5-nano': {
    inputPerMillionUsd: 0.05,
    outputPerMillionUsd: 0.4,
    cacheReadPerMillionUsd: 0.005,
    cacheWritePerMillionUsd: null,
    pricingSnapshotId: 'openai-api-pricing:gpt-5-nano',
    pricingSource: 'OpenAI API pricing snapshot',
    displayModel: 'gpt-5-nano',
  },
};

const UNKNOWN_PRICING: ModelPricing = {
  inputPerMillionUsd: null,
  outputPerMillionUsd: null,
  cacheReadPerMillionUsd: null,
  cacheWritePerMillionUsd: null,
  pricingSnapshotId: null,
  pricingSource: null,
  displayModel: null,
};

export class StaticPricingReader implements PricingReader {
  public async getModelPricing(model: string | null): Promise<ModelPricing> {
    const resolved = resolveOpenAiPricing(model);
    if (resolved) {
      return resolved;
    }

    return {
      ...UNKNOWN_PRICING,
      displayModel: model,
    };
  }
}

function resolveOpenAiPricing(model: string | null): ModelPricing | null {
  if (!model) {
    return null;
  }

  const normalized = model.toLowerCase();
  const direct = OPENAI_PRICING[normalized];
  if (direct) {
    return direct;
  }

  const aliasMatches = [
    ['gpt-5.4', /^gpt-5\.4([-.].+)?$/],
    ['gpt-5.2', /^gpt-5\.2([-.].+)?$/],
    ['gpt-5.1', /^gpt-5\.1([-.].+)?$/],
    ['gpt-5', /^gpt-5([-.].+)?$/],
    ['gpt-5-mini', /^gpt-5-mini([-.].+)?$/],
    ['gpt-5-nano', /^gpt-5-nano([-.].+)?$/],
  ] as const;

  for (const [key, pattern] of aliasMatches) {
    if (pattern.test(normalized)) {
      return OPENAI_PRICING[key];
    }
  }

  return null;
}
