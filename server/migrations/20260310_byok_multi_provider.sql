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
);

CREATE INDEX IF NOT EXISTS user_ai_credentials_user_provider_idx
ON user_ai_credentials (user_id, provider, updated_at DESC);

ALTER TABLE ai_usage_events
ADD COLUMN IF NOT EXISTS billing_source VARCHAR(30) NOT NULL DEFAULT 'internal_credit';

ALTER TABLE ai_usage_events
ADD COLUMN IF NOT EXISTS provider VARCHAR(50) NOT NULL DEFAULT 'bedrock_dev';

ALTER TABLE ai_usage_events
ADD COLUMN IF NOT EXISTS model_family VARCHAR(120);
