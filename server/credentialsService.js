import crypto from "crypto";
import { getProviderConfig, normalizeProviderId } from "../shared/aiProviders.js";

const IS_PRODUCTION = String(process.env.NODE_ENV || "").toLowerCase() === "production";
const RAW_ENCRYPTION_KEY = String(process.env.AI_CREDENTIALS_ENCRYPTION_KEY || "").trim();

if (!RAW_ENCRYPTION_KEY && IS_PRODUCTION) {
  throw new Error("AI_CREDENTIALS_ENCRYPTION_KEY wajib diisi saat NODE_ENV=production.");
}

if (!RAW_ENCRYPTION_KEY && !IS_PRODUCTION) {
  console.warn("[credentials] AI_CREDENTIALS_ENCRYPTION_KEY belum diatur. Memakai key dev default untuk local environment.");
}

const EFFECTIVE_ENCRYPTION_KEY = RAW_ENCRYPTION_KEY || "meta-ads-builder-dev-only-encryption-key";
const ENCRYPTION_KEY = crypto.createHash("sha256").update(EFFECTIVE_ENCRYPTION_KEY).digest();

function cleanString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizePayload(providerId, payload = {}) {
  const provider = getProviderConfig(providerId);
  const next = {};

  for (const field of provider.credentialFields) {
    if (payload[field.key] == null) continue;
    next[field.key] = cleanString(payload[field.key]);
  }

  return next;
}

function validatePayload(providerId, payload = {}) {
  const provider = getProviderConfig(providerId);
  const normalized = normalizePayload(providerId, payload);

  for (const field of provider.credentialFields) {
    if (field.required && !cleanString(normalized[field.key])) {
      const err = new Error(`${provider.label}: field ${field.label} wajib diisi.`);
      err.statusCode = 400;
      throw err;
    }
  }

  return normalized;
}

function encryptPayload(payload) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", ENCRYPTION_KEY, iv);
  const ciphertext = Buffer.concat([cipher.update(JSON.stringify(payload), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return JSON.stringify({
    v: 1,
    iv: iv.toString("base64"),
    tag: tag.toString("base64"),
    data: ciphertext.toString("base64"),
  });
}

function decryptPayload(value) {
  const envelope = typeof value === "string" ? JSON.parse(value) : value;
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    ENCRYPTION_KEY,
    Buffer.from(envelope.iv, "base64"),
  );
  decipher.setAuthTag(Buffer.from(envelope.tag, "base64"));
  const clear = Buffer.concat([
    decipher.update(Buffer.from(envelope.data, "base64")),
    decipher.final(),
  ]);
  return JSON.parse(clear.toString("utf8"));
}

function maskToken(value) {
  const clean = cleanString(value);
  if (!clean) return "Belum diisi";
  const suffix = clean.slice(-4);
  return `••••${suffix}`;
}

function buildMask(providerId, payload = {}) {
  if (providerId === "bedrock_dev") {
    const region = cleanString(payload.region) || "AWS region";
    return `${maskToken(payload.accessKeyId)} · ${region}`;
  }
  if (providerId === "openrouter") {
    const referer = cleanString(payload.httpReferer);
    return referer ? `${maskToken(payload.apiKey)} · ${referer}` : maskToken(payload.apiKey);
  }
  if (providerId === "zai" && cleanString(payload.baseUrl)) {
    return `${maskToken(payload.apiKey)} · ${cleanString(payload.baseUrl)}`;
  }
  return maskToken(payload.apiKey);
}

function serializeCredential(row, decryptedPayload = null) {
  if (!row) return null;
  const provider = normalizeProviderId(row.provider);
  const payload = decryptedPayload || decryptPayload(row.encrypted_payload);
  return {
    id: row.id,
    provider,
    label: row.label,
    isActive: Boolean(row.is_active),
    masked: buildMask(provider, payload),
    lastValidatedAt: row.last_validated_at,
    lastError: row.last_error,
    lastUsedModel: row.last_used_model,
    lastUsedAt: row.last_used_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function ensureAiCredentialTables(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_ai_credentials (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      provider VARCHAR(50) NOT NULL,
      label VARCHAR(120) NOT NULL,
      encrypted_payload TEXT NOT NULL,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      last_validated_at TIMESTAMPTZ,
      last_error TEXT,
      last_used_model VARCHAR(140),
      last_used_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS user_ai_credentials_user_provider_idx
    ON user_ai_credentials (user_id, provider, updated_at DESC)
  `);
}

export async function listCredentialsForUser(pool, userId) {
  const result = await pool.query(
    `
      SELECT *
      FROM user_ai_credentials
      WHERE user_id = $1
      ORDER BY updated_at DESC, id DESC
    `,
    [userId],
  );

  return result.rows.map((row) => serializeCredential(row));
}

export async function createCredential(pool, { userId, provider, label, payload }) {
  const normalizedProvider = normalizeProviderId(provider);
  const providerConfig = getProviderConfig(normalizedProvider);
  const nextPayload = validatePayload(normalizedProvider, payload);
  const nextLabel = cleanString(label) || `${providerConfig.label} Key`;
  const result = await pool.query(
    `
      INSERT INTO user_ai_credentials (
        user_id,
        provider,
        label,
        encrypted_payload
      )
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `,
    [userId, normalizedProvider, nextLabel, encryptPayload(nextPayload)],
  );
  return serializeCredential(result.rows[0], nextPayload);
}

export async function getCredentialForUser(pool, { credentialId, userId, decrypt = false }) {
  const result = await pool.query(
    `
      SELECT *
      FROM user_ai_credentials
      WHERE id = $1 AND user_id = $2
      LIMIT 1
    `,
    [credentialId, userId],
  );
  const row = result.rows[0];
  if (!row) return null;
  if (!decrypt) return serializeCredential(row);
  return {
    row,
    payload: decryptPayload(row.encrypted_payload),
    credential: serializeCredential(row),
  };
}

export async function updateCredential(pool, { credentialId, userId, provider, label, payload, isActive }) {
  const existing = await getCredentialForUser(pool, { credentialId, userId, decrypt: true });
  if (!existing) return null;
  const nextProvider = normalizeProviderId(provider || existing.row.provider);
  const mergedPayload = validatePayload(nextProvider, {
    ...existing.payload,
    ...(payload || {}),
  });
  const nextLabel = cleanString(label) || existing.row.label;
  const nextIsActive = typeof isActive === "boolean" ? isActive : Boolean(existing.row.is_active);
  const result = await pool.query(
    `
      UPDATE user_ai_credentials
      SET
        provider = $1,
        label = $2,
        encrypted_payload = $3,
        is_active = $4,
        updated_at = NOW()
      WHERE id = $5 AND user_id = $6
      RETURNING *
    `,
    [nextProvider, nextLabel, encryptPayload(mergedPayload), nextIsActive, credentialId, userId],
  );
  return serializeCredential(result.rows[0], mergedPayload);
}

export async function deleteCredential(pool, { credentialId, userId }) {
  const result = await pool.query(
    `
      DELETE FROM user_ai_credentials
      WHERE id = $1 AND user_id = $2
      RETURNING id
    `,
    [credentialId, userId],
  );
  return Boolean(result.rows[0]);
}

export async function markCredentialValidation(pool, {
  credentialId,
  userId,
  ok,
  errorMessage = "",
}) {
  const result = await pool.query(
    `
      UPDATE user_ai_credentials
      SET
        last_validated_at = CASE WHEN $1 THEN NOW() ELSE last_validated_at END,
        last_error = CASE WHEN $1 THEN NULL ELSE $2 END,
        updated_at = NOW()
      WHERE id = $3 AND user_id = $4
      RETURNING *
    `,
    [Boolean(ok), cleanString(errorMessage), credentialId, userId],
  );
  return result.rows[0] ? serializeCredential(result.rows[0]) : null;
}

export async function markCredentialUsage(pool, {
  credentialId,
  userId,
  model,
}) {
  const result = await pool.query(
    `
      UPDATE user_ai_credentials
      SET
        last_used_model = $1,
        last_used_at = NOW(),
        updated_at = NOW()
      WHERE id = $2 AND user_id = $3
      RETURNING *
    `,
    [cleanString(model), credentialId, userId],
  );
  return result.rows[0] ? serializeCredential(result.rows[0]) : null;
}
