import {
  LANDING_PAGE_PAGE_TYPE,
  LANDING_PAGE_TEMPLATE_KEY,
  buildAnalysisFromPage,
  buildLandingPagePrompt,
  createLandingPageBrief,
  validateAndNormalizeLandingPage,
} from "../shared/landingPage.js";

export { LANDING_PAGE_PAGE_TYPE };

function normalizeSettings(settings) {
  return settings && typeof settings === "object" ? settings : {};
}

function serializeRow(row) {
  if (!row) return null;
  const brief = createLandingPageBrief(row.brief_json || {});
  const pageJson = row.page_json || {};
  const page = validateAndNormalizeLandingPage(
    {
      ...pageJson,
      framework: row.framework || pageJson.framework,
      templateKey: row.template_key || pageJson.templateKey,
      pageType: row.page_type || pageJson.pageType,
      generatedAnalysis: row.generated_analysis || pageJson.generatedAnalysis,
    },
    { brief, framework: row.framework || pageJson.framework }
  );

  return {
    id: row.id,
    projectId: row.project_id,
    pageType: row.page_type,
    framework: row.framework,
    templateKey: row.template_key,
    stylePreset: page.stylePreset,
    brief,
    seo: page.seo,
    sections: page.sections,
    generatedAnalysis: row.generated_analysis || page.generatedAnalysis,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function writePage(pool, projectId, payload) {
  const brief = createLandingPageBrief(payload.brief);
  const framework = payload.framework || payload.pageJson?.framework || "Hormozi";
  const normalizedPage = validateAndNormalizeLandingPage(
    {
      ...(payload.pageJson || {}),
      framework,
      templateKey: payload.templateKey || payload.pageJson?.templateKey || LANDING_PAGE_TEMPLATE_KEY,
      pageType: payload.pageType || payload.pageJson?.pageType || LANDING_PAGE_PAGE_TYPE,
      generatedAnalysis: payload.generatedAnalysis || payload.pageJson?.generatedAnalysis,
    },
    { brief, framework }
  );
  const generatedAnalysis = buildAnalysisFromPage(normalizedPage, brief);

  const query = `
    INSERT INTO funnel_pages (
      project_id,
      page_type,
      framework,
      template_key,
      brief_json,
      page_json,
      generated_analysis
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    ON CONFLICT (project_id, page_type)
    DO UPDATE SET
      framework = EXCLUDED.framework,
      template_key = EXCLUDED.template_key,
      brief_json = EXCLUDED.brief_json,
      page_json = EXCLUDED.page_json,
      generated_analysis = EXCLUDED.generated_analysis,
      updated_at = NOW()
    RETURNING *
  `;

  const result = await pool.query(query, [
    projectId,
    payload.pageType || LANDING_PAGE_PAGE_TYPE,
    framework,
    payload.templateKey || LANDING_PAGE_TEMPLATE_KEY,
    brief,
    { ...normalizedPage, generatedAnalysis },
    generatedAnalysis,
  ]);

  await pool.query("UPDATE projects SET analysis=$1, updated_at=NOW() WHERE id=$2", [generatedAnalysis, projectId]);

  return serializeRow(result.rows[0]);
}

export async function ensureFunnelPagesTable(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS funnel_pages (
      id SERIAL PRIMARY KEY,
      project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      page_type VARCHAR(50) NOT NULL,
      framework VARCHAR(50) NOT NULL,
      template_key VARCHAR(100) NOT NULL DEFAULT '${LANDING_PAGE_TEMPLATE_KEY}',
      brief_json JSONB NOT NULL DEFAULT '{}'::jsonb,
      page_json JSONB NOT NULL DEFAULT '{}'::jsonb,
      generated_analysis JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (project_id, page_type)
    )
  `);
}

export async function getProjectForUser(pool, projectId, userId) {
  const result = await pool.query("SELECT id, user_id, settings FROM projects WHERE id=$1 AND user_id=$2", [projectId, userId]);
  return result.rows[0] || null;
}

export async function getFunnelPageByProject(pool, projectId, pageType = LANDING_PAGE_PAGE_TYPE) {
  const result = await pool.query(
    "SELECT * FROM funnel_pages WHERE project_id=$1 AND page_type=$2 ORDER BY updated_at DESC LIMIT 1",
    [projectId, pageType]
  );
  return serializeRow(result.rows[0] || null);
}

export async function createOrUpdateFunnelPage(pool, projectId, payload) {
  return writePage(pool, projectId, payload);
}

export async function updateFunnelPageById(pool, pageId, userId, payload) {
  const result = await pool.query(
    `SELECT fp.*, p.user_id
     FROM funnel_pages fp
     JOIN projects p ON p.id = fp.project_id
     WHERE fp.id=$1 AND p.user_id=$2`,
    [pageId, userId]
  );
  const row = result.rows[0];
  if (!row) return null;
  return writePage(pool, row.project_id, {
    pageType: row.page_type,
    framework: payload.framework || row.framework,
    templateKey: payload.templateKey || row.template_key,
    brief: payload.brief || row.brief_json,
    pageJson: payload.pageJson || row.page_json,
    generatedAnalysis: payload.generatedAnalysis || row.generated_analysis,
  });
}

export async function generateLandingPage({ invokeModel, brief, framework, settings = {} }) {
  const prompt = buildLandingPagePrompt({
    brief,
    framework,
    settings: normalizeSettings(settings),
  });

  const response = await invokeModel({
    messages: [{ role: "user", content: prompt }],
    maxTokens: 4500,
    temperature: 0.6,
  });

  const text = response?.text?.trim?.() || "";

  if (!text) throw new Error("AI tidak mengembalikan landing page.");

  return {
    page: validateAndNormalizeLandingPage(text, {
      brief,
      framework,
    }),
    usage: response?.usage || null,
    provider: response?.provider || null,
    model: response?.model || null,
    modelFamily: response?.modelFamily || null,
  };
}
