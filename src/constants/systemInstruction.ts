import type {
  AnatomyLayerKey,
  AnatomyLayersMap,
  BuildGenerationPayloadResult,
  GenerationPayload,
  GenerationResponseSchema,
} from '../types/prompt.ts';

// System instruction & builder payload untuk generasi penuh (6 lapisan) dan regenerasi parsial (1 lapisan).

const MAX_PROMPT_LENGTH = 4000;
const MAX_CONTEXT_LENGTH = 24000;

export const LAYER_GUIDELINES: Record<AnatomyLayerKey, string> = {
  role: 'Define the exact principal/senior persona, domain specialization, technical mastery, and 3-4 guiding engineering/domain priorities.',
  task: 'State the direct execution deliverable (NEVER write "Create a prompt to..." even if the user says "buatkan prompt..."). Break down into 3-5 numbered concrete workstreams.',
  context:
    'Provide structured bullet lines (`- **Label**: [Variable Name, misalnya: example1 / example2]`) covering project name, tech stack/tools, target audience, localization, UX preferences, and constraints so the user can fill dynamic placeholders.',
  reasoning:
    'Explain the deep domain & technical rationale: why naive approaches fail in this domain, critical integrity/architectural invariants, and what makes the output actionable.',
  stop: 'Start with a clear completion preamble followed by numbered or "-" bullet criteria covering architecture, core implementation (no pseudocode), security, and domain-specific edge cases.',
  output:
    'Specify the exact presentation order as numbered sections (`1. **Section Title**: detailed description of expected content...`) ready for execution.',
};

export const SYSTEM_INSTRUCTION = `You are "ngepromptYuk", a Principal Prompt Architect.
Transform the user's short idea into a comprehensive, production-grade Master Prompt following the 6-layer Claude prompt anatomy:

1. role      - ${LAYER_GUIDELINES.role}
2. task      - ${LAYER_GUIDELINES.task}
3. context   - ${LAYER_GUIDELINES.context}
4. reasoning - ${LAYER_GUIDELINES.reasoning}
5. stop      - ${LAYER_GUIDELINES.stop}
6. output    - ${LAYER_GUIDELINES.output}

Rules:
- Write every field in the SAME language as the user's idea (e.g. Indonesian if the idea is in Indonesian).
- Anti-Meta-Prompt Rule: If the user writes "buatkan prompt untuk membuat X", the Master Prompt's task must directly instruct the target AI to design/build X, NOT to "write another prompt".
- Include helpful dynamic placeholders in \`context\` using bracket format like \`[Nama Variabel, misalnya: contoh]\` so the user can customize parameters via Smart Variables.
- Each field is plain text/markdown bullets (newlines allowed), without top-level \`# Heading\` inside the field value.
- Respond ONLY with a valid JSON object containing exact keys: "role", "task", "context", "reasoning", "stop", "output".`;

// Skema JSON untuk structured output Gemini (responseSchema).
export const RESPONSE_SCHEMA: GenerationResponseSchema = {
  type: 'OBJECT',
  properties: {
    role: { type: 'STRING' },
    task: { type: 'STRING' },
    context: { type: 'STRING' },
    reasoning: { type: 'STRING' },
    stop: { type: 'STRING' },
    output: { type: 'STRING' },
  },
  required: ['role', 'task', 'context', 'reasoning', 'stop', 'output'],
  propertyOrdering: ['role', 'task', 'context', 'reasoning', 'stop', 'output'],
};

function isAnatomyLayerKey(key: string): key is AnatomyLayerKey {
  return Object.hasOwn(LAYER_GUIDELINES, key);
}

function buildPartialRequest(
  targetLayer: AnatomyLayerKey,
  shortPrompt: string,
  currentLayers: Partial<AnatomyLayersMap> = {}
): GenerationPayload {
  const layerKeys = Object.keys(LAYER_GUIDELINES) as AnatomyLayerKey[];
  const guideline = LAYER_GUIDELINES[targetLayer];

  const siblingContext = layerKeys
    .filter((key) => key !== targetLayer)
    .map((key) => {
      const raw = currentLayers[key];
      const val = typeof raw === 'string' ? raw.trim() : '';
      return `### ${key}\n${val || '(empty)'}`;
    })
    .join('\n\n');

  const rawTarget = currentLayers[targetLayer];
  const currentDraft = typeof rawTarget === 'string' ? rawTarget.trim() : '';

  const systemInstruction = `You are "ngepromptYuk", a Principal Prompt Architect.
Regenerate ONLY the "${targetLayer}" layer of a 6-layer Claude Master Prompt so it is deeper, sharper, and tightly cohesive with the other 5 layers.

Target layer specification (${targetLayer}):
- ${guideline}

Rules:
- Preserve alignment with the original idea and all other 5 layers; do NOT contradict them.
- Preserve or introduce helpful template placeholders (such as [Nama Variabel, misalnya: ...] or {{variable}}) where dynamic user input makes sense.
- Write in the SAME language as the original idea / existing layers.
- Return plain text (newlines allowed), no top-level markdown headings inside the field.
- Respond ONLY with a valid JSON object containing exact key "${targetLayer}": {"${targetLayer}": "..."}.`;

  const userPrompt = [
    `Original Idea:\n${shortPrompt || '(not provided — rely on existing layers)'}`,
    `Other 5 Layers (keep cohesive with these):\n${siblingContext}`,
    `Current "${targetLayer}" draft (produce an improved, fresh version):\n${currentDraft || '(empty)'}`,
  ].join('\n\n');

  const responseSchema: GenerationResponseSchema = {
    type: 'OBJECT',
    properties: { [targetLayer]: { type: 'STRING' } },
    required: [targetLayer],
    propertyOrdering: [targetLayer],
  };

  return { systemInstruction, userPrompt, responseSchema, isPartial: true, targetLayer };
}

/**
 * Memvalidasi body request `/api/generate` dan menyusun payload siap kirim ke LLM provider.
 */
export function buildGenerationPayload(body: Record<string, unknown> | null | undefined): BuildGenerationPayloadResult {
  const shortPrompt = typeof body?.shortPrompt === 'string' ? body.shortPrompt.trim() : '';
  const targetLayer = typeof body?.targetLayer === 'string' ? body.targetLayer.trim() : '';

  if (shortPrompt.length > MAX_PROMPT_LENGTH) {
    return {
      error: {
        status: 400,
        message: `Ide prompt melebihi batas maksimal ${MAX_PROMPT_LENGTH} karakter.`,
      },
    };
  }

  if (targetLayer) {
    if (!isAnatomyLayerKey(targetLayer)) {
      return { error: { status: 400, message: `Lapisan anatomi "${targetLayer}" tidak valid.` } };
    }

    const currentLayers =
      body?.currentLayers && typeof body.currentLayers === 'object'
        ? (body.currentLayers as Partial<AnatomyLayersMap>)
        : {};
    const hasAnyLayer = (Object.keys(LAYER_GUIDELINES) as AnatomyLayerKey[]).some((key) => {
      const val = currentLayers[key];
      return typeof val === 'string' && val.trim().length > 0;
    });

    if (!shortPrompt && !hasAnyLayer) {
      return {
        error: {
          status: 400,
          message: 'Isi ide prompt atau minimal satu blok lain sebelum meregenerasi blok ini.',
        },
      };
    }

    const payload = buildPartialRequest(targetLayer, shortPrompt, currentLayers);
    if (payload.userPrompt.length > MAX_CONTEXT_LENGTH) {
      return {
        error: {
          status: 400,
          message: 'Konteks seluruh lapisan melebihi batas panjang yang diizinkan.',
        },
      };
    }

    return payload;
  }

  if (!shortPrompt) {
    return { error: { status: 400, message: 'Ide prompt tidak boleh kosong.' } };
  }

  return {
    systemInstruction: SYSTEM_INSTRUCTION,
    userPrompt: shortPrompt,
    responseSchema: RESPONSE_SCHEMA,
    isPartial: false,
  };
}
