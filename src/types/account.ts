import type { AnatomyLayersMap, PromptVariablesMap } from './prompt';

export type AIProviderId = 'gemini' | 'anthropic' | 'openai' | 'openrouter' | 'custom';

export type OAuthProviderId = 'google' | 'github';

export type AuthMode = 'login' | 'signup';

export interface ProviderCatalogItem {
  id: AIProviderId;
  label: string;
  defaultModel: string;
  suggestedModels: string[];
  keyPlaceholder: string;
  consoleUrl: string;
  requiresBaseUrl: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
}

export interface UserAIConnectionPublic {
  provider: AIProviderId;
  model: string;
  baseUrl: string;
  keyHint: string;
  isActive: boolean;
  updatedAt?: string;
}

export interface SaveConnectionInput {
  provider: AIProviderId;
  model: string;
  baseUrl?: string;
  apiKey?: string;
  isActive?: boolean;
}

export interface DecryptedUserAIConnection {
  userId: string;
  provider: AIProviderId;
  model: string;
  baseUrl: string;
  apiKey: string;
}

export interface SavedPromptItem {
  id: string;
  title: string;
  shortPrompt: string;
  layers: Partial<AnatomyLayersMap>;
  variables: PromptVariablesMap;
  updatedAt?: string;
}

export interface SavePromptInput {
  title: string;
  shortPrompt: string;
  layers: AnatomyLayersMap;
  variables: PromptVariablesMap;
}

export interface AccountSessionData {
  user: UserProfile;
  accessToken?: string;
  storageMode?: 'supabase' | 'encrypted_vault';
  connection: UserAIConnectionPublic | null;
  prompts: SavedPromptItem[];
}
