export const AI_BILLING_MODES = Object.freeze({
  INTERNAL: "internal_credit",
  BYOK: "byok",
});

const TEXT_FIELD = "text";
const PASSWORD_FIELD = "password";
const URL_FIELD = "url";

export const AI_PROVIDER_ORDER = [
  "openai",
  "anthropic",
  "gemini",
  "zai",
  "openrouter",
  "bedrock_dev",
];

export const AI_PROVIDER_CATALOG = Object.freeze({
  openai: {
    id: "openai",
    label: "OpenAI",
    badge: "Direct API",
    description: "Gunakan API key OpenAI langsung untuk GPT models.",
    group: "popular",
    supportsInternal: true,
    baseColor: "#0f766e",
    credentialFields: [
      { key: "apiKey", label: "API Key", type: PASSWORD_FIELD, required: true, placeholder: "sk-..." },
    ],
    models: [
      { id: "gpt-4.1-mini", label: "GPT-4.1 Mini", family: "gpt-4.1" },
      { id: "gpt-4.1", label: "GPT-4.1", family: "gpt-4.1" },
      { id: "gpt-5.1-chat-latest", label: "GPT-5.1 Chat", family: "gpt-5.1" },
      { id: "gpt-5.1", label: "GPT-5.1", family: "gpt-5.1" },
    ],
  },
  anthropic: {
    id: "anthropic",
    label: "Anthropic",
    badge: "Direct API",
    description: "Claude langsung lewat Anthropic Messages API.",
    group: "popular",
    supportsInternal: true,
    baseColor: "#7c2d12",
    credentialFields: [
      { key: "apiKey", label: "API Key", type: PASSWORD_FIELD, required: true, placeholder: "sk-ant-..." },
    ],
    models: [
      { id: "claude-sonnet-4-20250514", label: "Claude Sonnet 4", family: "claude-4" },
      { id: "claude-opus-4-1-20250805", label: "Claude Opus 4.1", family: "claude-4" },
      { id: "claude-3-5-haiku-latest", label: "Claude 3.5 Haiku", family: "claude-3.5" },
    ],
  },
  gemini: {
    id: "gemini",
    label: "Gemini",
    badge: "Google AI",
    description: "Gunakan Gemini API key dari Google AI Studio.",
    group: "popular",
    supportsInternal: true,
    baseColor: "#1d4ed8",
    credentialFields: [
      { key: "apiKey", label: "API Key", type: PASSWORD_FIELD, required: true, placeholder: "AIza..." },
    ],
    models: [
      { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash", family: "gemini-2.5" },
      { id: "gemini-2.5-pro", label: "Gemini 2.5 Pro", family: "gemini-2.5" },
      { id: "gemini-3-pro", label: "Gemini 3 Pro", family: "gemini-3" },
    ],
  },
  zai: {
    id: "zai",
    label: "Z.ai",
    badge: "GLM",
    description: "BYOK lewat endpoint OpenAI-compatible milik Z.ai.",
    group: "popular",
    supportsInternal: true,
    baseColor: "#7c3aed",
    credentialFields: [
      { key: "apiKey", label: "API Key", type: PASSWORD_FIELD, required: true, placeholder: "zai_..." },
      { key: "baseUrl", label: "Base URL", type: URL_FIELD, required: false, placeholder: "https://api.z.ai/api/paas/v4" },
    ],
    models: [
      { id: "glm-5", label: "GLM-5", family: "glm-5" },
      { id: "glm-4.6", label: "GLM-4.6", family: "glm-4.6" },
    ],
  },
  openrouter: {
    id: "openrouter",
    label: "OpenRouter",
    badge: "Broker",
    description: "Pakai OpenRouter key untuk routing ke banyak model.",
    group: "popular",
    supportsInternal: true,
    baseColor: "#9333ea",
    credentialFields: [
      { key: "apiKey", label: "API Key", type: PASSWORD_FIELD, required: true, placeholder: "sk-or-..." },
      { key: "httpReferer", label: "HTTP Referer", type: URL_FIELD, required: false, placeholder: "https://funnelpilot.app" },
      { key: "appName", label: "App Name", type: TEXT_FIELD, required: false, placeholder: "FunnelPilot" },
    ],
    models: [
      { id: "openai/gpt-4.1-mini", label: "GPT-4.1 Mini", family: "openai" },
      { id: "anthropic/claude-sonnet-4", label: "Claude Sonnet 4", family: "anthropic" },
      { id: "google/gemini-2.5-flash", label: "Gemini 2.5 Flash", family: "google" },
    ],
  },
  bedrock_dev: {
    id: "bedrock_dev",
    label: "AWS Bedrock",
    badge: "Advanced",
    description: "Opsi developer untuk akses model lewat kredensial AWS.",
    group: "advanced",
    supportsInternal: true,
    baseColor: "#9a3412",
    credentialFields: [
      { key: "accessKeyId", label: "Access Key ID", type: TEXT_FIELD, required: true, placeholder: "AKIA..." },
      { key: "secretAccessKey", label: "Secret Access Key", type: PASSWORD_FIELD, required: true, placeholder: "..." },
      { key: "region", label: "AWS Region", type: TEXT_FIELD, required: true, placeholder: "us-east-1" },
      { key: "sessionToken", label: "Session Token", type: PASSWORD_FIELD, required: false, placeholder: "Opsional" },
    ],
    models: [
      { id: "us.anthropic.claude-sonnet-4-6", label: "Claude Sonnet (Bedrock)", family: "anthropic-bedrock" },
      { id: "us.amazon.nova-pro-v1:0", label: "Amazon Nova Pro", family: "nova" },
    ],
  },
});

export function normalizeProviderId(value) {
  const raw = typeof value === "string" ? value.trim().toLowerCase() : "";
  return AI_PROVIDER_CATALOG[raw] ? raw : "openai";
}

export function getProviderConfig(providerId) {
  return AI_PROVIDER_CATALOG[normalizeProviderId(providerId)];
}

export function getProviderList({ includeAdvanced = true } = {}) {
  return AI_PROVIDER_ORDER
    .map((id) => AI_PROVIDER_CATALOG[id])
    .filter((provider) => includeAdvanced || provider.group !== "advanced");
}

export function getDefaultModelForProvider(providerId) {
  const provider = getProviderConfig(providerId);
  return provider.models[0]?.id || "";
}

export function isModelSupportedForProvider(providerId, modelId) {
  const provider = getProviderConfig(providerId);
  const selectedModel = typeof modelId === "string" ? modelId.trim() : "";
  if (!selectedModel) return false;
  return provider.models.some((model) => model.id === selectedModel);
}

export function resolveModelForProvider(providerId, preferredModel = null) {
  return isModelSupportedForProvider(providerId, preferredModel)
    ? preferredModel.trim()
    : getDefaultModelForProvider(providerId);
}

export function getModelFamily(providerId, modelId) {
  const provider = getProviderConfig(providerId);
  const selected = provider.models.find((model) => model.id === modelId);
  return selected?.family || provider.id;
}

export function createDefaultAiSettings(overrides = {}) {
  return {
    billingMode: AI_BILLING_MODES.INTERNAL,
    provider: "openai",
    credentialId: null,
    model: getDefaultModelForProvider("openai"),
    ...overrides,
  };
}

export function sanitizeAiSettings(input = {}) {
  const next = createDefaultAiSettings(input);
  const provider = normalizeProviderId(next.provider);
  const model = resolveModelForProvider(provider, next.model);

  return {
    billingMode: next.billingMode === AI_BILLING_MODES.BYOK ? AI_BILLING_MODES.BYOK : AI_BILLING_MODES.INTERNAL,
    provider,
    credentialId: Number.isInteger(Number(next.credentialId)) && Number(next.credentialId) > 0 ? Number(next.credentialId) : null,
    model,
  };
}
