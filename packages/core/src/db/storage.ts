import type { AdapterStorage, ProviderCheckpoint } from '../adapters/types.js';

export class InMemoryCheckpointStorage implements AdapterStorage {
  private readonly checkpoints = new Map<string, ProviderCheckpoint>();

  public async readCheckpoint(
    provider: ProviderCheckpoint['provider'],
    sourceId: string,
  ): Promise<ProviderCheckpoint | null> {
    return this.checkpoints.get(`${provider}:${sourceId}`) ?? null;
  }

  public async writeCheckpoints(checkpoints: ProviderCheckpoint[]): Promise<void> {
    for (const checkpoint of checkpoints) {
      this.checkpoints.set(
        `${checkpoint.provider}:${checkpoint.sourceId}`,
        checkpoint,
      );
    }
  }
}

