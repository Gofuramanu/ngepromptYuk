import { ANATOMY_LAYERS } from '../constants/anatomy';

// Merangkai 6 lapisan menjadi satu Master Prompt siap salin.
export function buildMasterPrompt(data) {
  return ANATOMY_LAYERS.filter(({ key }) => data[key]?.trim())
    .map(({ key, title }) => `# ${title}\n${data[key].trim()}`)
    .join('\n\n');
}

