export type IconName =
  | 'sparkles'
  | 'bulb'
  | 'user'
  | 'listChecks'
  | 'globe'
  | 'brain'
  | 'hand'
  | 'fileOutput'
  | 'wand'
  | 'eye'
  | 'eyeOff'
  | 'share'
  | 'reset'
  | 'check'
  | 'x'
  | 'copy'
  | 'refresh';

export type AnatomyLayerKey = 'role' | 'task' | 'context' | 'reasoning' | 'stop' | 'output';

export interface AnatomyLayerMeta {
  key: AnatomyLayerKey;
  title: string;
  eyebrow: string;
  icon: IconName;
  question: string;
  placeholder: string;
  eyebrowColor: string;
  dotColor: string;
  iconStyle: string;
  activeBorder: string;
  cornerGlow: string;
  focus: string;
}

export type AnatomyLayersMap = Record<AnatomyLayerKey, string>;

export type PromptVariablesMap = Record<string, string>;

export interface PromptData extends AnatomyLayersMap {
  shortPrompt: string;
  variables: PromptVariablesMap;
}

export type PromptDataField = keyof PromptData;

export interface LayerErrorState {
  layer: AnatomyLayerKey;
  message: string;
}

export interface GenerationSchemaProperty {
  type: string;
}

export interface GenerationResponseSchema {
  type: string;
  properties: Record<string, GenerationSchemaProperty>;
  required: string[];
  propertyOrdering: string[];
}

export interface GenerationPayload {
  systemInstruction: string;
  userPrompt: string;
  responseSchema: GenerationResponseSchema;
  isPartial: boolean;
  targetLayer?: AnatomyLayerKey;
}

export interface GenerationPayloadError {
  error: {
    status: number;
    message: string;
  };
}

export type BuildGenerationPayloadResult = GenerationPayload | GenerationPayloadError;
