const DEFAULT_FREE_CREDITS = Number(process.env.DEFAULT_FREE_CREDITS || 200);
const ENFORCE_CREDITS = String(process.env.ENFORCE_CREDITS || "false").toLowerCase() === "true";
const INPUT_TOKEN_COST_USD_PER_1K = Number(process.env.INPUT_TOKEN_COST_USD_PER_1K || 0);
const OUTPUT_TOKEN_COST_USD_PER_1K = Number(process.env.OUTPUT_TOKEN_COST_USD_PER_1K || 0);

export const CREDIT_PRICING = Object.freeze({
  analyze_lp: 3,
  generate_audience: 4,
  generate_angle: 5,
  generate_copy: 2,
  generate_landing_page: 6,
  generic_chat: 2,
});

const RUN_COMPLETION_TASKS = new Set(["generate_copy", "generate_landing_page"]);
const INTERNAL_BILLING_SOURCE = "internal_credit";

function normalizeTaskType(taskType) {
  if (!taskType || typeof taskType !== "string") return "generic_chat";
  return Object.prototype.hasOwnProperty.call(CREDIT_PRICING, taskType) ? taskType : "generic_chat";
}

function getCreditsForTask(taskType) {
  return CREDIT_PRICING[normalizeTaskType(taskType)] || CREDIT_PRICING.generic_chat;
}

function normalizeUsage(usage = {}) {
  const promptTokens = Number(usage.inputTokens ?? usage.promptTokens ?? usage.input_tokens ?? 0) || 0;
  const completionTokens = Number(usage.outputTokens ?? usage.completionTokens ?? usage.output_tokens ?? 0) || 0;
  const totalTokens = Number(usage.totalTokens ?? usage.total_tokens ?? promptTokens + completionTokens) || (promptTokens + completionTokens);

  return {
    promptTokens,
    completionTokens,
    totalTokens,
  };
}

function estimateCostUsd({ promptTokens, completionTokens }) {
  const promptCost = (promptTokens / 1000) * INPUT_TOKEN_COST_USD_PER_1K;
  const completionCost = (completionTokens / 1000) * OUTPUT_TOKEN_COST_USD_PER_1K;
  return Number((promptCost + completionCost).toFixed(6));
}

async function ensureWalletRecord(queryable, userId) {
  const inserted = await queryable.query(
    `
      INSERT INTO credit_wallets (user_id, balance_credits, granted_credits)
      VALUES ($1, $2, $2)
      ON CONFLICT (user_id) DO NOTHING
      RETURNING user_id, balance_credits, granted_credits, lifetime_used_credits, updated_at
    `,
    [userId, DEFAULT_FREE_CREDITS]
  );

  if (inserted.rows[0] && DEFAULT_FREE_CREDITS > 0) {
    await queryable.query(
      `
        INSERT INTO credit_ledger (user_id, entry_type, amount, balance_after, reason, meta_json)
        VALUES ($1, 'grant', $2, $2, 'Welcome credits', $3)
      `,
      [userId, DEFAULT_FREE_CREDITS, { source: "system", kind: "welcome_grant" }]
    );
  }

  const wallet = await queryable.query(
    `
      SELECT user_id, balance_credits, granted_credits, lifetime_used_credits, updated_at
      FROM credit_wallets
      WHERE user_id=$1
    `,
    [userId]
  );

  return wallet.rows[0];
}

export async function ensureUsageTables(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS credit_wallets (
      user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      balance_credits INTEGER NOT NULL DEFAULT 0,
      granted_credits INTEGER NOT NULL DEFAULT 0,
      lifetime_used_credits INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS generation_runs (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
      run_type VARCHAR(50) NOT NULL,
      label VARCHAR(140),
      status VARCHAR(30) NOT NULL DEFAULT 'active',
      credits_charged INTEGER NOT NULL DEFAULT 0,
      prompt_tokens INTEGER NOT NULL DEFAULT 0,
      completion_tokens INTEGER NOT NULL DEFAULT 0,
      total_tokens INTEGER NOT NULL DEFAULT 0,
      estimated_cost_usd NUMERIC(12, 6) NOT NULL DEFAULT 0,
      meta_json JSONB NOT NULL DEFAULT '{}'::jsonb,
      started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      finished_at TIMESTAMPTZ
    )
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS generation_runs_user_started_idx
    ON generation_runs (user_id, started_at DESC)
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS generation_runs_project_started_idx
    ON generation_runs (project_id, started_at DESC)
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS ai_usage_events (
      id SERIAL PRIMARY KEY,
      run_id INTEGER REFERENCES generation_runs(id) ON DELETE SET NULL,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
      task_type VARCHAR(50) NOT NULL,
      model_id VARCHAR(140) NOT NULL,
      request_label VARCHAR(140),
      prompt_tokens INTEGER NOT NULL DEFAULT 0,
      completion_tokens INTEGER NOT NULL DEFAULT 0,
      total_tokens INTEGER NOT NULL DEFAULT 0,
      max_tokens_requested INTEGER,
      credits_charged INTEGER NOT NULL DEFAULT 0,
      estimated_cost_usd NUMERIC(12, 6) NOT NULL DEFAULT 0,
      request_meta JSONB NOT NULL DEFAULT '{}'::jsonb,
      status VARCHAR(30) NOT NULL DEFAULT 'success',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    ALTER TABLE ai_usage_events
    ADD COLUMN IF NOT EXISTS billing_source VARCHAR(30) NOT NULL DEFAULT '${INTERNAL_BILLING_SOURCE}'
  `);

  await pool.query(`
    ALTER TABLE ai_usage_events
    ADD COLUMN IF NOT EXISTS provider VARCHAR(50) NOT NULL DEFAULT 'bedrock_dev'
  `);

  await pool.query(`
    ALTER TABLE ai_usage_events
    ADD COLUMN IF NOT EXISTS model_family VARCHAR(120)
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS ai_usage_events_user_created_idx
    ON ai_usage_events (user_id, created_at DESC)
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS ai_usage_events_run_created_idx
    ON ai_usage_events (run_id, created_at DESC)
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS credit_ledger (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      run_id INTEGER REFERENCES generation_runs(id) ON DELETE SET NULL,
      usage_event_id INTEGER REFERENCES ai_usage_events(id) ON DELETE SET NULL,
      entry_type VARCHAR(30) NOT NULL,
      amount INTEGER NOT NULL,
      balance_after INTEGER NOT NULL,
      reason VARCHAR(140) NOT NULL,
      meta_json JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS credit_ledger_user_created_idx
    ON credit_ledger (user_id, created_at DESC)
  `);
}

export async function getOrCreateWallet(pool, userId) {
  return ensureWalletRecord(pool, userId);
}

export async function assertCreditsAvailable(pool, userId, taskType) {
  const wallet = await getOrCreateWallet(pool, userId);
  const requiredCredits = getCreditsForTask(taskType);

  if (ENFORCE_CREDITS && wallet.balance_credits < requiredCredits) {
    const err = new Error(`Credit tidak cukup. Butuh ${requiredCredits} credit untuk ${taskType}.`);
    err.statusCode = 402;
    err.code = "INSUFFICIENT_CREDITS";
    throw err;
  }

  return { wallet, requiredCredits, enforceCredits: ENFORCE_CREDITS };
}

export async function createGenerationRun(pool, { userId, projectId = null, runType = "campaign_cycle", label = null, meta = {} }) {
  await getOrCreateWallet(pool, userId);
  const result = await pool.query(
    `
      INSERT INTO generation_runs (user_id, project_id, run_type, label, meta_json)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `,
    [userId, projectId, runType, label, meta || {}]
  );

  return result.rows[0];
}

export async function recordUsageEvent(pool, {
  userId,
  projectId = null,
  runId = null,
  taskType,
  modelId,
  provider = "bedrock_dev",
  modelFamily = null,
  billingSource = INTERNAL_BILLING_SOURCE,
  requestLabel = null,
  maxTokensRequested = null,
  requestMeta = {},
  usage = {},
  status = "success",
}) {
  const normalizedTask = normalizeTaskType(taskType);
  const usageMetrics = normalizeUsage(usage);
  const creditsCharged = billingSource === INTERNAL_BILLING_SOURCE ? getCreditsForTask(normalizedTask) : 0;
  const estimatedCostUsd = estimateCostUsd(usageMetrics);

  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const wallet = await ensureWalletRecord(client, userId);
    const balanceAfter = wallet.balance_credits - creditsCharged;

    const usageEvent = await client.query(
      `
        INSERT INTO ai_usage_events (
          run_id,
          user_id,
          project_id,
          task_type,
          model_id,
          provider,
          model_family,
          billing_source,
          request_label,
          prompt_tokens,
          completion_tokens,
          total_tokens,
          max_tokens_requested,
          credits_charged,
          estimated_cost_usd,
          request_meta,
          status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        RETURNING *
      `,
      [
        runId,
        userId,
        projectId,
        normalizedTask,
        modelId,
        provider,
        modelFamily,
        billingSource,
        requestLabel,
        usageMetrics.promptTokens,
        usageMetrics.completionTokens,
        usageMetrics.totalTokens,
        maxTokensRequested,
        creditsCharged,
        estimatedCostUsd,
        requestMeta || {},
        status,
      ]
    );

    let walletUpdate;

    if (creditsCharged > 0) {
      walletUpdate = await client.query(
        `
          UPDATE credit_wallets
          SET
            balance_credits = $1,
            lifetime_used_credits = lifetime_used_credits + $2,
            updated_at = NOW()
          WHERE user_id = $3
          RETURNING user_id, balance_credits, granted_credits, lifetime_used_credits, updated_at
        `,
        [balanceAfter, creditsCharged, userId]
      );

      await client.query(
        `
          INSERT INTO credit_ledger (
            user_id,
            run_id,
            usage_event_id,
            entry_type,
            amount,
            balance_after,
            reason,
            meta_json
          )
          VALUES ($1, $2, $3, 'debit', $4, $5, $6, $7)
        `,
        [
          userId,
          runId,
          usageEvent.rows[0].id,
          -creditsCharged,
          balanceAfter,
          requestLabel || normalizedTask,
          {
            taskType: normalizedTask,
            tokens: usageMetrics.totalTokens,
            estimatedCostUsd,
            billingSource,
            provider,
          },
        ]
      );
    } else {
      walletUpdate = await client.query(
        `
          SELECT user_id, balance_credits, granted_credits, lifetime_used_credits, updated_at
          FROM credit_wallets
          WHERE user_id = $1
        `,
        [userId]
      );
    }

    if (runId) {
      await client.query(
        `
          UPDATE generation_runs
          SET
            credits_charged = credits_charged + $1,
            prompt_tokens = prompt_tokens + $2,
            completion_tokens = completion_tokens + $3,
            total_tokens = total_tokens + $4,
            estimated_cost_usd = estimated_cost_usd + $5,
            finished_at = NOW(),
            status = $6
          WHERE id = $7 AND user_id = $8
        `,
        [
          creditsCharged,
          usageMetrics.promptTokens,
          usageMetrics.completionTokens,
          usageMetrics.totalTokens,
          estimatedCostUsd,
          RUN_COMPLETION_TASKS.has(normalizedTask) ? "completed" : "active",
          runId,
          userId,
        ]
      );
    }

    await client.query("COMMIT");

    return {
      usageEvent: usageEvent.rows[0],
      wallet: walletUpdate.rows[0],
      creditsCharged,
      estimatedCostUsd,
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function getUsageSummary(pool, { userId, projectId = null }) {
  const wallet = await getOrCreateWallet(pool, userId);
  const params = [userId];
  let projectFilter = "";

  if (projectId) {
    params.push(projectId);
    projectFilter = ` AND project_id = $${params.length}`;
  }

  const lifetime = await pool.query(
    `
      SELECT
        COUNT(*)::INT AS calls,
        COALESCE(SUM(CASE WHEN billing_source = '${INTERNAL_BILLING_SOURCE}' THEN credits_charged ELSE 0 END), 0)::INT AS credits_used,
        COALESCE(SUM(CASE WHEN billing_source = '${INTERNAL_BILLING_SOURCE}' THEN 1 ELSE 0 END), 0)::INT AS internal_calls,
        COALESCE(SUM(CASE WHEN billing_source <> '${INTERNAL_BILLING_SOURCE}' THEN 1 ELSE 0 END), 0)::INT AS byok_calls,
        COALESCE(SUM(prompt_tokens), 0)::INT AS prompt_tokens,
        COALESCE(SUM(completion_tokens), 0)::INT AS completion_tokens,
        COALESCE(SUM(total_tokens), 0)::INT AS total_tokens,
        COALESCE(SUM(estimated_cost_usd), 0)::FLOAT AS estimated_cost_usd
      FROM ai_usage_events
      WHERE user_id = $1${projectFilter}
    `,
    params
  );

  const monthly = await pool.query(
    `
      SELECT
        COUNT(*)::INT AS calls,
        COALESCE(SUM(CASE WHEN billing_source = '${INTERNAL_BILLING_SOURCE}' THEN credits_charged ELSE 0 END), 0)::INT AS credits_used,
        COALESCE(SUM(CASE WHEN billing_source = '${INTERNAL_BILLING_SOURCE}' THEN 1 ELSE 0 END), 0)::INT AS internal_calls,
        COALESCE(SUM(CASE WHEN billing_source <> '${INTERNAL_BILLING_SOURCE}' THEN 1 ELSE 0 END), 0)::INT AS byok_calls,
        COALESCE(SUM(total_tokens), 0)::INT AS total_tokens,
        COALESCE(SUM(estimated_cost_usd), 0)::FLOAT AS estimated_cost_usd
      FROM ai_usage_events
      WHERE user_id = $1${projectFilter}
        AND created_at >= date_trunc('month', NOW())
    `,
    params
  );

  const runTotals = await pool.query(
    `
      SELECT
        COUNT(*)::INT AS runs,
        COALESCE(SUM(credits_charged), 0)::INT AS credits_used
      FROM generation_runs
      WHERE user_id = $1${projectFilter}
    `,
    params
  );

  const topTasks = await pool.query(
    `
      SELECT
        task_type,
        COUNT(*)::INT AS calls,
        COALESCE(SUM(CASE WHEN billing_source = '${INTERNAL_BILLING_SOURCE}' THEN credits_charged ELSE 0 END), 0)::INT AS credits_used,
        COALESCE(SUM(total_tokens), 0)::INT AS total_tokens
      FROM ai_usage_events
      WHERE user_id = $1${projectFilter}
      GROUP BY task_type
      ORDER BY credits_used DESC, calls DESC
      LIMIT 8
    `,
    params
  );

  return {
    wallet: {
      balanceCredits: wallet.balance_credits,
      grantedCredits: wallet.granted_credits,
      lifetimeUsedCredits: wallet.lifetime_used_credits,
      enforceCredits: ENFORCE_CREDITS,
    },
    pricing: CREDIT_PRICING,
    summary: {
      lifetimeCalls: lifetime.rows[0]?.calls || 0,
      lifetimeCreditsUsed: lifetime.rows[0]?.credits_used || 0,
      lifetimePromptTokens: lifetime.rows[0]?.prompt_tokens || 0,
      lifetimeCompletionTokens: lifetime.rows[0]?.completion_tokens || 0,
      lifetimeTotalTokens: lifetime.rows[0]?.total_tokens || 0,
      lifetimeEstimatedCostUsd: lifetime.rows[0]?.estimated_cost_usd || 0,
      monthCalls: monthly.rows[0]?.calls || 0,
      monthCreditsUsed: monthly.rows[0]?.credits_used || 0,
      monthInternalCalls: monthly.rows[0]?.internal_calls || 0,
      monthByokCalls: monthly.rows[0]?.byok_calls || 0,
      monthTotalTokens: monthly.rows[0]?.total_tokens || 0,
      monthEstimatedCostUsd: monthly.rows[0]?.estimated_cost_usd || 0,
      lifetimeInternalCalls: lifetime.rows[0]?.internal_calls || 0,
      lifetimeByokCalls: lifetime.rows[0]?.byok_calls || 0,
      totalRuns: runTotals.rows[0]?.runs || 0,
      runCreditsUsed: runTotals.rows[0]?.credits_used || 0,
    },
    topTasks: topTasks.rows,
  };
}

export async function getUsageEvents(pool, { userId, projectId = null, limit = 30 }) {
  const params = [userId];
  let projectFilter = "";

  if (projectId) {
    params.push(projectId);
    projectFilter = ` AND e.project_id = $${params.length}`;
  }

  params.push(limit);

  const result = await pool.query(
    `
      SELECT
        e.id,
        e.run_id,
        e.task_type,
        e.model_id,
        e.provider,
        e.model_family,
        e.billing_source,
        e.request_label,
        e.prompt_tokens,
        e.completion_tokens,
        e.total_tokens,
        e.credits_charged,
        e.estimated_cost_usd,
        e.status,
        e.created_at,
        p.name AS project_name,
        gr.run_type,
        gr.label AS run_label
      FROM ai_usage_events e
      LEFT JOIN projects p ON p.id = e.project_id
      LEFT JOIN generation_runs gr ON gr.id = e.run_id
      WHERE e.user_id = $1${projectFilter}
      ORDER BY e.created_at DESC
      LIMIT $${params.length}
    `,
    params
  );

  return result.rows;
}

export async function getGenerationRuns(pool, { userId, projectId = null, limit = 20 }) {
  const params = [userId];
  let projectFilter = "";

  if (projectId) {
    params.push(projectId);
    projectFilter = ` AND gr.project_id = $${params.length}`;
  }

  params.push(limit);

  const result = await pool.query(
    `
      SELECT
        gr.*,
        p.name AS project_name
      FROM generation_runs gr
      LEFT JOIN projects p ON p.id = gr.project_id
      WHERE gr.user_id = $1${projectFilter}
      ORDER BY gr.started_at DESC
      LIMIT $${params.length}
    `,
    params
  );

  return result.rows;
}

export async function getCreditLedger(pool, { userId, projectId = null, limit = 30 }) {
  const params = [userId];
  let projectFilter = "";

  if (projectId) {
    params.push(projectId);
    projectFilter = ` AND (COALESCE(e.project_id, gr.project_id) = $${params.length} OR cl.entry_type = 'grant')`;
  }

  params.push(limit);

  const result = await pool.query(
    `
      SELECT
        cl.id,
        cl.run_id,
        cl.usage_event_id,
        cl.entry_type,
        cl.amount,
        cl.balance_after,
        cl.reason,
        cl.meta_json,
        cl.created_at,
        e.task_type,
        e.model_id,
        e.provider,
        e.model_family,
        e.billing_source,
        e.total_tokens,
        e.request_label,
        gr.run_type,
        gr.label AS run_label,
        p.name AS project_name
      FROM credit_ledger cl
      LEFT JOIN ai_usage_events e ON e.id = cl.usage_event_id
      LEFT JOIN generation_runs gr ON gr.id = COALESCE(cl.run_id, e.run_id)
      LEFT JOIN projects p ON p.id = COALESCE(e.project_id, gr.project_id)
      WHERE cl.user_id = $1${projectFilter}
      ORDER BY cl.created_at DESC
      LIMIT $${params.length}
    `,
    params
  );

  return result.rows;
}

export async function getBillingUsers(pool, { search = "", limit = 24 }) {
  const normalizedSearch = String(search || "").trim().toLowerCase();
  const params = [];
  let whereClause = "";

  if (normalizedSearch) {
    params.push(`%${normalizedSearch}%`);
    whereClause = `WHERE LOWER(u.username) LIKE $1 OR LOWER(COALESCE(u.display_name, '')) LIKE $1`;
  }

  params.push(Math.min(Math.max(Number(limit) || 24, 1), 100));

  const result = await pool.query(
    `
      SELECT
        u.id,
        u.username,
        u.display_name,
        COALESCE(u.is_admin, FALSE) AS is_admin,
        COALESCE(w.balance_credits, 0)::INT AS balance_credits,
        COALESCE(w.granted_credits, 0)::INT AS granted_credits,
        COALESCE(w.lifetime_used_credits, 0)::INT AS lifetime_used_credits,
        COUNT(DISTINCT p.id)::INT AS project_count,
        MAX(e.created_at) AS last_usage_at
      FROM users u
      LEFT JOIN credit_wallets w ON w.user_id = u.id
      LEFT JOIN projects p ON p.user_id = u.id
      LEFT JOIN ai_usage_events e ON e.user_id = u.id
      ${whereClause}
      GROUP BY u.id, u.username, u.display_name, u.is_admin, w.balance_credits, w.granted_credits, w.lifetime_used_credits
      ORDER BY COALESCE(w.balance_credits, 0) ASC, u.id DESC
      LIMIT $${params.length}
    `,
    params
  );

  return result.rows;
}

export async function grantCredits(pool, {
  adminUserId,
  targetUserId,
  amount,
  reason = "Admin top-up credits",
  meta = {},
}) {
  const normalizedTargetUserId = Number(targetUserId);
  const normalizedAmount = Math.trunc(Number(amount));

  if (!Number.isInteger(normalizedTargetUserId) || normalizedTargetUserId <= 0) {
    const err = new Error("User tujuan tidak valid.");
    err.statusCode = 400;
    throw err;
  }

  if (!Number.isInteger(normalizedAmount) || normalizedAmount <= 0) {
    const err = new Error("Nominal top-up harus berupa angka bulat di atas 0.");
    err.statusCode = 400;
    throw err;
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const userResult = await client.query(
      "SELECT id, username, display_name FROM users WHERE id = $1",
      [normalizedTargetUserId]
    );

    if (!userResult.rows[0]) {
      const err = new Error("User tidak ditemukan.");
      err.statusCode = 404;
      throw err;
    }

    const wallet = await ensureWalletRecord(client, normalizedTargetUserId);
    const balanceAfter = Number(wallet.balance_credits || 0) + normalizedAmount;

    const walletUpdate = await client.query(
      `
        UPDATE credit_wallets
        SET
          balance_credits = $1,
          granted_credits = granted_credits + $2,
          updated_at = NOW()
        WHERE user_id = $3
        RETURNING user_id, balance_credits, granted_credits, lifetime_used_credits, updated_at
      `,
      [balanceAfter, normalizedAmount, normalizedTargetUserId]
    );

    const ledgerEntry = await client.query(
      `
        INSERT INTO credit_ledger (
          user_id,
          entry_type,
          amount,
          balance_after,
          reason,
          meta_json
        )
        VALUES ($1, 'grant', $2, $3, $4, $5)
        RETURNING *
      `,
      [
        normalizedTargetUserId,
        normalizedAmount,
        balanceAfter,
        reason || "Admin top-up credits",
        {
          source: "admin_grant",
          adminUserId,
          ...(meta || {}),
        },
      ]
    );

    await client.query("COMMIT");

    return {
      user: userResult.rows[0],
      wallet: walletUpdate.rows[0],
      ledgerEntry: ledgerEntry.rows[0],
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
