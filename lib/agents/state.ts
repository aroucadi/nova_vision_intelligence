import { DynamoDBStateManager, InMemoryStateManager, type PipelineStateManager } from "./state-manager";

let singleton: PipelineStateManager | null = null;

export function getPipelineStateManager(): PipelineStateManager {
  if (singleton) return singleton;
  if (process.env.NOVA_GLOBAL_STATE_TABLE) {
    singleton = new DynamoDBStateManager(process.env.NOVA_GLOBAL_STATE_TABLE);
    return singleton;
  }
  singleton = new InMemoryStateManager();
  return singleton;
}
