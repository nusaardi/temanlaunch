import {
  BedrockRuntimeClient,
  ConverseCommand,
} from "@aws-sdk/client-bedrock-runtime";
import {
  AI_PROVIDER_CATALOG,
  getDefaultModelForProvider,
  getModelFamily,
  getProviderList,
  normalizeProviderId,
  resolveModelForProvider,
} from "../shared/aiProviders.js";

const AWS_REGION = process.env.AWS_REGION || "us-east-1";
const MODEL_ID = process.env.MODEL_ID || "us.anthropic.claude-sonnet-4-6";
const AI_DEFAULT_PROVIDER = normalizeProviderId(process.env.AI_DEFAULT_PROVIDER || "bedrock_dev");

function toText(value) {
  if (typeof value === "string") return value;
  if (value == null) return "";
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function normalizeMessages(messages = []) {
  return (Array.isArray(messages) ? messages : [])
    .map((message) => ({
      role: typeof message?.role === "string" ? message.role : "user",
      content: toText(message?.content).trim(),
    }))
    .filter((message) => message.content);
}

function collectSystemPrompt(messages) {
  return messages
    .filter((message) => message.role === "system" || message.role === "developer")
    .map((message) => message.content)
    .filter(Boolean)
    .join("\n\n");
}

function collectConversation(messages) {
  const conversation = messages
    .filter((message) => message.role !== "system" && message.role !== "developer")
    .map((message) => ({
      role: message.role === "assistant" ? "assistant" : "user",
      content: message.content,
    }));

  return conversation.length ? conversation : [{ role: "user", content: "Reply with OK." }];
}

async function httpJson(url, options) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45000);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers || {}),
      },
    });
    const text = await response.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { raw: text };
    }
    if (!response.ok) {
      const message = data?.error?.message || data?.message || data?.raw || `HTTP ${response.status}`;
      const err = new Error(message);
      err.statusCode = response.status;
      err.providerPayload = data;
      throw err;
    }
    return data;
  } finally {
    clearTimeout(timeout);
  }
}

function createBedrockClient(payload = {}) {
  const region = payload.region || AWS_REGION;
  const credentials = payload.accessKeyId && payload.secretAccessKey
    ? {
        accessKeyId: payload.accessKeyId,
        secretAccessKey: payload.secretAccessKey,
        sessionToken: payload.sessionToken || undefined,
      }
    : undefined;

  return new BedrockRuntimeClient({
    region,
    ...(credentials ? { credentials } : {}),
  });
}

async function invokeBedrock({ payload, model, messages, maxTokens, temperature }) {
  const normalized = normalizeMessages(messages);
  const systemPrompt = collectSystemPrompt(normalized);
  const conversation = collectConversation(normalized).map((message) => ({
    role: message.role,
    content: [{ text: message.content }],
  }));
  const client = createBedrockClient(payload);
  const response = await client.send(new ConverseCommand({
    modelId: model,
    messages: conversation,
    ...(systemPrompt ? { system: [{ text: systemPrompt }] } : {}),
    inferenceConfig: {
      maxTokens,
      temperature,
    },
  }));
  const text = (response.output?.message?.content || [])
    .filter((block) => block.text)
    .map((block) => block.text)
    .join("\n")
    .trim();

  return {
    text,
    usage: response.usage || {},
  };
}

async function invokeOpenAIStyle({
  baseUrl,
  apiKey,
  model,
  messages,
  maxTokens,
  temperature,
  headers = {},
  providerId,
}) {
  const normalized = normalizeMessages(messages);
  const payload = {
    model,
    messages: normalized.map((message) => ({
      role: message.role === "developer" ? "system" : message.role,
      content: message.content,
    })),
    temperature,
  };

  if (providerId === "openai") {
    payload.max_completion_tokens = maxTokens;
  } else {
    payload.max_tokens = maxTokens;
  }

  const data = await httpJson(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      ...headers,
    },
    body: JSON.stringify(payload),
  });

  return {
    text: data?.choices?.[0]?.message?.content?.trim?.() || "",
    usage: data?.usage || {},
  };
}

async function invokeAnthropic({ payload, model, messages, maxTokens, temperature }) {
  const normalized = normalizeMessages(messages);
  const systemPrompt = collectSystemPrompt(normalized);
  const conversation = collectConversation(normalized).map((message) => ({
    role: message.role,
    content: message.content,
  }));
  const data = await httpJson("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": payload.apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      temperature,
      ...(systemPrompt ? { system: systemPrompt } : {}),
      messages: conversation,
    }),
  });

  const text = (Array.isArray(data?.content) ? data.content : [])
    .filter((part) => part?.type === "text" && part?.text)
    .map((part) => part.text)
    .join("\n")
    .trim();

  return {
    text,
    usage: data?.usage || {},
  };
}

async function invokeGemini({ payload, model, messages, maxTokens, temperature }) {
  const normalized = normalizeMessages(messages);
  const systemPrompt = collectSystemPrompt(normalized);
  const conversation = collectConversation(normalized).map((message) => ({
    role: message.role === "assistant" ? "model" : "user",
    parts: [{ text: message.content }],
  }));
  const data = await httpJson(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(payload.apiKey)}`, {
    method: "POST",
    body: JSON.stringify({
      ...(systemPrompt ? { systemInstruction: { parts: [{ text: systemPrompt }] } } : {}),
      contents: conversation,
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens,
      },
    }),
  });

  const text = (Array.isArray(data?.candidates?.[0]?.content?.parts) ? data.candidates[0].content.parts : [])
    .filter((part) => typeof part?.text === "string")
    .map((part) => part.text)
    .join("\n")
    .trim();

  return {
    text,
    usage: {
      promptTokens: data?.usageMetadata?.promptTokenCount,
      completionTokens: data?.usageMetadata?.candidatesTokenCount,
      totalTokens: data?.usageMetadata?.totalTokenCount,
    },
  };
}

async function invokeProviderRequest({ providerId, credentialPayload, model, messages, maxTokens = 3000, temperature = 0.7 }) {
  switch (providerId) {
    case "openai":
      return invokeOpenAIStyle({
        baseUrl: "https://api.openai.com/v1",
        apiKey: credentialPayload.apiKey,
        model,
        messages,
        maxTokens,
        temperature,
        providerId,
      });
    case "anthropic":
      return invokeAnthropic({
        payload: credentialPayload,
        model,
        messages,
        maxTokens,
        temperature,
      });
    case "gemini":
      return invokeGemini({
        payload: credentialPayload,
        model,
        messages,
        maxTokens,
        temperature,
      });
    case "zai":
      return invokeOpenAIStyle({
        baseUrl: credentialPayload.baseUrl || "https://api.z.ai/api/paas/v4",
        apiKey: credentialPayload.apiKey,
        model,
        messages,
        maxTokens,
        temperature,
        providerId,
      });
    case "openrouter":
      return invokeOpenAIStyle({
        baseUrl: "https://openrouter.ai/api/v1",
        apiKey: credentialPayload.apiKey,
        model,
        messages,
        maxTokens,
        temperature,
        providerId,
        headers: {
          ...(credentialPayload.httpReferer ? { "HTTP-Referer": credentialPayload.httpReferer } : {}),
          ...(credentialPayload.appName ? { "X-Title": credentialPayload.appName } : {}),
        },
      });
    case "bedrock_dev":
      return invokeBedrock({
        payload: credentialPayload,
        model,
        messages,
        maxTokens,
        temperature,
      });
    default: {
      const err = new Error(`Provider AI tidak dikenal: ${providerId}`);
      err.statusCode = 400;
      throw err;
    }
  }
}

function getServerCredentialPayload(providerId) {
  switch (providerId) {
    case "openai":
      return process.env.OPENAI_API_KEY ? { apiKey: process.env.OPENAI_API_KEY } : null;
    case "anthropic":
      return process.env.ANTHROPIC_API_KEY ? { apiKey: process.env.ANTHROPIC_API_KEY } : null;
    case "gemini":
      return process.env.GEMINI_API_KEY ? { apiKey: process.env.GEMINI_API_KEY } : null;
    case "zai":
      return process.env.ZAI_API_KEY ? { apiKey: process.env.ZAI_API_KEY, baseUrl: process.env.ZAI_BASE_URL || "" } : null;
    case "openrouter":
      return process.env.OPENROUTER_API_KEY ? {
        apiKey: process.env.OPENROUTER_API_KEY,
        httpReferer: process.env.OPENROUTER_HTTP_REFERER || "",
        appName: process.env.OPENROUTER_APP_NAME || "",
      } : null;
    case "bedrock_dev":
      return {
        region: process.env.AWS_REGION || AWS_REGION,
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
        sessionToken: process.env.AWS_SESSION_TOKEN || "",
      };
    default:
      return null;
  }
}

export function getDefaultInternalProviderConfig() {
  const provider = AI_DEFAULT_PROVIDER;
  return {
    provider,
    model: provider === "bedrock_dev"
      ? resolveModelForProvider(provider, MODEL_ID)
      : resolveModelForProvider(provider, process.env.AI_DEFAULT_MODEL),
  };
}

export function getPublicProviderCatalog() {
  return getProviderList({ includeAdvanced: true }).map((provider) => ({
    id: provider.id,
    label: provider.label,
    badge: provider.badge,
    description: provider.description,
    group: provider.group,
    baseColor: provider.baseColor,
    credentialFields: provider.credentialFields.map((field) => ({
      key: field.key,
      label: field.label,
      type: field.type,
      required: field.required,
      placeholder: field.placeholder,
    })),
    models: provider.models,
    defaultModel: getDefaultModelForProvider(provider.id),
  }));
}

export async function invokeTextModel({
  providerId,
  credentialPayload,
  model,
  messages,
  maxTokens = 3000,
  temperature = 0.7,
}) {
  const normalizedProvider = normalizeProviderId(providerId);
  const selectedModel = resolveModelForProvider(normalizedProvider, model);
  const resolvedCredential = credentialPayload || getServerCredentialPayload(normalizedProvider);

  if (!resolvedCredential) {
    const err = new Error(`Credential untuk provider ${normalizedProvider} belum tersedia di server.`);
    err.statusCode = 500;
    err.code = "PROVIDER_CREDENTIAL_MISSING";
    throw err;
  }

  const result = await invokeProviderRequest({
    providerId: normalizedProvider,
    credentialPayload: resolvedCredential,
    model: selectedModel,
    messages,
    maxTokens,
    temperature,
  });

  return {
    text: result.text,
    usage: result.usage || {},
    provider: normalizedProvider,
    model: selectedModel,
    modelFamily: getModelFamily(normalizedProvider, selectedModel),
  };
}

export async function validateProviderCredential({ providerId, credentialPayload, model = null }) {
  const normalizedProvider = normalizeProviderId(providerId);
  const selectedModel = resolveModelForProvider(normalizedProvider, model);
  const result = await invokeTextModel({
    providerId: normalizedProvider,
    credentialPayload,
    model: selectedModel,
    maxTokens: 24,
    temperature: 0,
    messages: [{ role: "user", content: "Reply with OK only." }],
  });

  return {
    ok: Boolean(result.text),
    sample: result.text,
    usage: result.usage || {},
    provider: normalizedProvider,
    model: selectedModel,
    modelFamily: getModelFamily(normalizedProvider, selectedModel),
  };
}

export function resolveInternalModel(providerId, preferredModel = null) {
  const normalizedProvider = normalizeProviderId(providerId);
  if (normalizedProvider === "bedrock_dev") {
    return resolveModelForProvider(normalizedProvider, preferredModel || MODEL_ID);
  }
  return resolveModelForProvider(normalizedProvider, preferredModel || process.env.AI_DEFAULT_MODEL);
}

export function getServerProviderAvailability() {
  const internal = getDefaultInternalProviderConfig();
  return {
    defaultProvider: internal.provider,
    defaultModel: internal.model,
    providers: getPublicProviderCatalog(),
  };
}
