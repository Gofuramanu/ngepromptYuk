// System instruction & builder payload untuk generasi penuh (6 lapisan) dan regenerasi parsial (1 lapisan).

const MAX_PROMPT_LENGTH = 4000;
const MAX_CONTEXT_LENGTH = 24000;

export const LAYER_GUIDELINES = {
  role: 'Who the AI should act as: seniority, domain expertise, and a guiding priority.',
  task: 'The concrete deliverable, scope, and how it should end.',
  context: 'Everything known: product/subject, audience, team, resources, constraints, key risks. Use "-" bullet lines.',
  reasoning: 'Why the task matters and what makes the output high quality / actionable.',
  stop: '"Only stop when:" followed by measurable completion criteria as "-" bullet lines.',
  output: 'Exact presentation format, including per-item fields as "-" bullet lines.',
};

export const SYSTEM_INSTRUCTION = `You are "Prompt Craftsman", an expert prompt engineer.
Transform the user's short idea into a structured Master Prompt following the 6-layer Claude prompt anatomy:

1. role      - ${LAYER_GUIDELINES.role}
2. task      - ${LAYER_GUIDELINES.task}
3. context   - ${LAYER_GUIDELINES.context}
4. reasoning - ${LAYER_GUIDELINES.reasoning}
5. stop      - ${LAYER_GUIDELINES.stop}
6. output    - ${LAYER_GUIDELINES.output}

Rules:
- Write every field in the SAME language as the user's idea.
- Infer reasonable, specific details when the idea is vague; never leave a field empty.
- Each field is plain text (newlines allowed), no markdown headings.
- Respond ONLY with a valid JSON object containing exact keys: "role", "task", "context", "reasoning", "stop", "output".`;

// Skema JSON untuk structured output Gemini (responseSchema).
export const RESPONSE_SCHEMA = {
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

function buildPartialRequest(targetLayer, shortPrompt, currentLayers = {}) {
  const layerKeys = Object.keys(LAYER_GUIDELINES);
  const guideline = LAYER_GUIDELINES[targetLayer];

  const siblingContext = layerKeys
    .filter((key) => key !== targetLayer)
    .map((key) => {
      const val = typeof currentLayers[key] === 'string' ? currentLayers[key].trim() : '';
      return `### ${key}\n${val || '(empty)'}`;
    })
    .join('\n\n');

  const currentDraft = typeof currentLayers[targetLayer] === 'string' ? currentLayers[targetLayer].trim() : '';

  const systemInstruction = `You are "Prompt Craftsman", an expert prompt engineer.
Regenerate ONLY the "${targetLayer}" layer of a 6-layer Claude Master Prompt so it is sharper, clearer, and tightly cohesive with the other 5 layers.

Target layer specification (${targetLayer}):
- ${guideline}

Rules:
- Preserve alignment with the original idea and all other 5 layers; do NOT contradict them.
- Preserve helpful template placeholders (such as [Variable] or {{variable}}) if appropriate, or introduce clean placeholders where dynamic user input makes sense.
- Write in the SAME language as the original idea / existing layers.
- Return plain text (newlines allowed), no markdown headings inside the field.
- Respond ONLY with a valid JSON object containing exact key "${targetLayer}": {"${targetLayer}": "..."}.`;

  const userPrompt = [
    `Original Idea:\n${shortPrompt || '(not provided — rely on existing layers)'}`,
    `Other 5 Layers (keep cohesive with these):\n${siblingContext}`,
    `Current "${targetLayer}" draft (produce an improved, fresh version):\n${currentDraft || '(empty)'}`,
  ].join('\n\n');

  const responseSchema = {
    type: 'OBJECT',
    properties: { [targetLayer]: { type: 'STRING' } },
    required: [targetLayer],
    propertyOrdering: [targetLayer],
  };

  return { systemInstruction, userPrompt, responseSchema, isPartial: true, targetLayer };
}

/**
 * Memvalidasi body request `/api/generate` dan menyusun payload siap kirim ke LLM gateway.
 */
export function buildGenerationPayload(body) {
  const shortPrompt = typeof body?.shortPrompt === 'string' ? body.shortPrompt.trim() : '';
  const targetLayer = typeof body?.targetLayer === 'string' ? body.targetLayer.trim() : '';

  if (shortPrompt.length > MAX_PROMPT_LENGTH) {
    return {
      error: { status: 400, message: `Ide prompt melebihi batas maksimal ${MAX_PROMPT_LENGTH} karakter.` },
    };
  }

  if (targetLayer) {
    if (!Object.hasOwn(LAYER_GUIDELINES, targetLayer)) {
      return { error: { status: 400, message: `Lapisan anatomi "${targetLayer}" tidak valid.` } };
    }

    const currentLayers = body?.currentLayers && typeof body.currentLayers === 'object' ? body.currentLayers : {};
    const hasAnyLayer = Object.keys(LAYER_GUIDELINES).some(
      (key) => typeof currentLayers[key] === 'string' && currentLayers[key].trim().length > 0
    );

    if (!shortPrompt && !hasAnyLayer) {
      return {
        error: { status: 400, message: 'Isi ide prompt atau minimal satu blok lain sebelum meregenerasi blok ini.' },
      };
    }

    const payload = buildPartialRequest(targetLayer, shortPrompt, currentLayers);
    if (payload.userPrompt.length > MAX_CONTEXT_LENGTH) {
      return {
        error: { status: 400, message: 'Konteks seluruh lapisan melebihi batas panjang yang diizinkan.' },
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
