import { ANATOMY_LAYERS } from '../constants/anatomy';
import type { PromptData } from '../types/prompt';
import { applyVariables } from './promptVariables';

// Merangkai 6 lapisan menjadi satu Master Prompt siap salin dengan nilai variabel tersubstitusi.
export function buildMasterPrompt(data: PromptData): string {
  const variables = data?.variables || {};

  return ANATOMY_LAYERS.filter(({ key }) => data[key]?.trim())
    .map(({ key, title }) => `# ${title}\n${applyVariables(data[key], variables).trim()}`)
    .join('\n\n');
}
