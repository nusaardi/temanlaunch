import express from "express";
import cors from "cors";
import pg from "pg";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import dns from "dns/promises";
import net from "net";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import {
    LANDING_PAGE_PAGE_TYPE,
    createOrUpdateFunnelPage,
    ensureFunnelPagesTable,
    generateLandingPage,
    getFunnelPageByProject,
    getProjectForUser,
    updateFunnelPageById,
} from "./landingPageService.js";
import {
    getPublicProviderCatalog,
    getServerProviderAvailability,
    invokeTextModel,
    validateProviderCredential,
} from "./aiProviders.js";
import {
    createCredential,
    deleteCredential,
    ensureAiCredentialTables,
    getCredentialForUser,
    listCredentialsForUser,
    markCredentialUsage,
    markCredentialValidation,
    updateCredential,
} from "./credentialsService.js";
import {
    CREDIT_PRICING,
    assertCreditsAvailable,
    createGenerationRun,
    ensureUsageTables,
    getBillingUsers,
    getCreditLedger,
    getGenerationRuns,
    getOrCreateWallet,
    getUsageEvents,
    getUsageSummary,
    grantCredits,
    recordUsageEvent,
} from "./usageService.js";
import {
    AI_BILLING_MODES,
    getDefaultModelForProvider,
    resolveModelForProvider,
    sanitizeAiSettings,
} from "../shared/aiProviders.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadEnvFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);

    for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line || line.startsWith("#")) continue;
        const separatorIndex = line.indexOf("=");
        if (separatorIndex <= 0) continue;
        const key = line.slice(0, separatorIndex).trim();
        if (!key || process.env[key] != null) continue;
        let value = line.slice(separatorIndex + 1).trim();
        if (
            (value.startsWith("\"") && value.endsWith("\""))
            || (value.startsWith("'") && value.endsWith("'"))
        ) {
            value = value.slice(1, -1);
        }
        process.env[key] = value;
    }
}

for (const envName of [".env", ".env.local"]) {
    loadEnvFile(path.join(__dirname, envName));
}

// ─── CONFIG ─────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
const DEFAULT_LOCAL_DB_URL = "postgresql://postgres:postgres@127.0.0.1:54329/meta_ads_builder_dev";
const DB_URL = process.env.DATABASE_URL || DEFAULT_LOCAL_DB_URL;
const IS_PRODUCTION = String(process.env.NODE_ENV || "").toLowerCase() === "production";
const DEV_AUTO_LOGIN = String(process.env.DEV_AUTO_LOGIN || "false").toLowerCase() === "true";
const DEV_AUTO_LOGIN_USERNAME = String(process.env.DEV_AUTO_LOGIN_USERNAME || "dev").trim().toLowerCase() || "dev";
const DEV_AUTO_LOGIN_DISPLAY_NAME = String(process.env.DEV_AUTO_LOGIN_DISPLAY_NAME || "Local Dev").trim() || "Local Dev";
const CORS_ORIGINS = (process.env.CORS_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
const CORS_ALLOW_RENDER_ORIGINS = String(process.env.CORS_ALLOW_RENDER_ORIGINS || "false").toLowerCase() === "true";
const ADMIN_USERNAMES = new Set(
    (process.env.ADMIN_USERNAMES || "")
        .split(",")
        .map((value) => value.trim().toLowerCase())
        .filter(Boolean)
);
const JWT_SECRET = String(process.env.JWT_SECRET || "").trim() || (IS_PRODUCTION ? "" : "meta-ads-builder-dev-jwt-secret");

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET wajib diisi saat NODE_ENV=production.");
}

if (!IS_PRODUCTION && !process.env.JWT_SECRET) {
    console.warn("[auth] JWT_SECRET belum diatur. Memakai secret dev default untuk local environment.");
}

const pool = new pg.Pool({ connectionString: DB_URL });
const app = express();
const SERVER_PROVIDER = getServerProviderAvailability();

const allowedOrigins = [/localhost/, /127\.0\.0\.1/, ...CORS_ORIGINS];

function isAllowedCorsOrigin(origin) {
    if (!origin) return true;

    const matchedConfiguredOrigin = allowedOrigins.some((rule) => rule instanceof RegExp ? rule.test(origin) : rule === origin);
    if (matchedConfiguredOrigin) return true;

    if (!CORS_ALLOW_RENDER_ORIGINS) return false;

    try {
        const parsed = new URL(origin);
        return parsed.protocol === "https:" && parsed.hostname.endsWith(".onrender.com");
    } catch {
        return false;
    }
}

app.use(cors({
    origin(origin, callback) {
        if (isAllowedCorsOrigin(origin)) return callback(null, true);
        return callback(new Error("Origin tidak diizinkan oleh CORS"));
    },
}));
app.use(express.json({ limit: "2mb" }));

const authRouteLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Terlalu banyak percobaan auth. Coba lagi sebentar." },
});

const scrapeRouteLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Terlalu banyak request analisa link. Coba lagi sebentar." },
});

const chatRouteLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Terlalu banyak request AI. Coba lagi sebentar." },
});

function isPrivateIpv4(ipAddress) {
    const parts = String(ipAddress || "").split(".").map((part) => Number(part));
    if (parts.length !== 4 || parts.some((part) => Number.isNaN(part))) return false;
    const [a, b] = parts;
    if (a === 10 || a === 127) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    return false;
}

function isPrivateIp(ipAddress) {
    const version = net.isIP(ipAddress);
    if (version === 4) return isPrivateIpv4(ipAddress);
    if (version === 6) {
        const normalized = String(ipAddress || "").toLowerCase();
        return normalized === "::1"
            || normalized.startsWith("fc")
            || normalized.startsWith("fd")
            || normalized.startsWith("fe80")
            || normalized.startsWith("::ffff:127.")
            || normalized.startsWith("::ffff:10.")
            || normalized.startsWith("::ffff:192.168.")
            || /^::ffff:172\.(1[6-9]|2\d|3[0-1])\./.test(normalized);
    }
    return false;
}

function isBlockedHostname(hostname) {
    const normalized = String(hostname || "").trim().toLowerCase();
    return !normalized
        || normalized === "localhost"
        || normalized.endsWith(".localhost")
        || normalized.endsWith(".local")
        || normalized.endsWith(".internal")
        || normalized === "host.docker.internal";
}

async function assertSafePublicUrl(rawUrl) {
    let parsed;
    try {
        parsed = new URL(String(rawUrl || "").trim());
    } catch {
        const err = new Error("URL tidak valid.");
        err.statusCode = 400;
        throw err;
    }

    if (!["http:", "https:"].includes(parsed.protocol)) {
        const err = new Error("Hanya URL http/https yang diizinkan.");
        err.statusCode = 400;
        throw err;
    }

    if (parsed.username || parsed.password) {
        const err = new Error("URL dengan credential inline tidak diizinkan.");
        err.statusCode = 400;
        throw err;
    }

    const hostname = parsed.hostname.trim().toLowerCase();
    if (isBlockedHostname(hostname)) {
        const err = new Error("Hostname internal tidak diizinkan.");
        err.statusCode = 400;
        throw err;
    }

    if (net.isIP(hostname) && isPrivateIp(hostname)) {
        const err = new Error("IP private/internal tidak diizinkan.");
        err.statusCode = 400;
        throw err;
    }

    let resolved = [];
    try {
        resolved = await dns.lookup(hostname, { all: true });
    } catch {
        const err = new Error("Hostname tidak bisa di-resolve.");
        err.statusCode = 400;
        throw err;
    }

    if (!resolved.length || resolved.some((entry) => isPrivateIp(entry.address))) {
        const err = new Error("Target URL mengarah ke jaringan private/internal.");
        err.statusCode = 400;
        throw err;
    }

    return parsed.toString();
}

// ─── AUTH MIDDLEWARE ─────────────────────────────────────────────────────────
function authMiddleware(req, res, next) {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ error: "Token diperlukan" });
    try {
        const payload = jwt.verify(token, JWT_SECRET);
        const userId = Number(payload?.userId);
        if (!Number.isInteger(userId) || userId <= 0) throw new Error("Invalid");
        req.userId = userId;
        next();
    } catch {
        res.status(401).json({ error: "Token tidak valid" });
    }
}

function normalizeUser(row) {
    if (!row) return null;
    return {
        id: row.id,
        username: row.username,
        display_name: row.display_name,
        is_admin: Boolean(row.is_admin) || ADMIN_USERNAMES.has(String(row.username || "").toLowerCase()),
    };
}

function createAuthToken(userId) {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
}

async function ensureCoreTables() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(80) NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            display_name VARCHAR(120) NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS projects (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            name VARCHAR(140) NOT NULL,
            settings JSONB NOT NULL DEFAULT '{}'::jsonb,
            analysis JSONB,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `);

    await pool.query(`
        CREATE INDEX IF NOT EXISTS projects_user_updated_idx
        ON projects (user_id, updated_at DESC)
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS audiences (
            id SERIAL PRIMARY KEY,
            project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
            data JSONB NOT NULL DEFAULT '[]'::jsonb,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `);

    await pool.query(`
        CREATE INDEX IF NOT EXISTS audiences_project_created_idx
        ON audiences (project_id, created_at DESC)
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS angles (
            id SERIAL PRIMARY KEY,
            project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
            audience_idx INTEGER NOT NULL DEFAULT 0,
            data JSONB NOT NULL DEFAULT '[]'::jsonb,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `);

    await pool.query(`
        CREATE INDEX IF NOT EXISTS angles_project_audience_created_idx
        ON angles (project_id, audience_idx, created_at DESC)
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS copies (
            id SERIAL PRIMARY KEY,
            project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
            audience_name VARCHAR(160),
            angle_teknik VARCHAR(160),
            format VARCHAR(40),
            framework VARCHAR(80),
            copy_text TEXT NOT NULL,
            notes TEXT,
            is_used BOOLEAN NOT NULL DEFAULT FALSE,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `);

    await pool.query(`
        CREATE INDEX IF NOT EXISTS copies_project_created_idx
        ON copies (project_id, created_at DESC)
    `);
}

async function getUserById(userId) {
    const result = await pool.query(
        "SELECT id, username, display_name, COALESCE(is_admin, FALSE) AS is_admin FROM users WHERE id = $1",
        [userId]
    );
    return result.rows[0] || null;
}

async function adminMiddleware(req, res, next) {
    try {
        const user = await getUserById(req.userId);
        if (!user) return res.status(404).json({ error: "User tidak ditemukan" });
        const normalized = normalizeUser(user);
        if (!normalized.is_admin) return res.status(403).json({ error: "Akses admin diperlukan" });
        req.currentUser = normalized;
        next();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function ensureAdminUsersColumn() {
    await pool.query(`
        ALTER TABLE users
        ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE
    `);
}

async function ensureDevUser() {
    const existing = await pool.query(
        "SELECT id, username, display_name, COALESCE(is_admin, FALSE) AS is_admin FROM users WHERE username = $1 LIMIT 1",
        [DEV_AUTO_LOGIN_USERNAME]
    );

    if (existing.rows[0]) {
        await getOrCreateWallet(pool, existing.rows[0].id);
        return normalizeUser(existing.rows[0]);
    }

    const passwordHash = await bcrypt.hash(`local-dev:${DEV_AUTO_LOGIN_USERNAME}`, 6);
    const inserted = await pool.query(
        `
            INSERT INTO users (username, password_hash, display_name)
            VALUES ($1, $2, $3)
            RETURNING id, username, display_name, COALESCE(is_admin, FALSE) AS is_admin
        `,
        [DEV_AUTO_LOGIN_USERNAME, passwordHash, DEV_AUTO_LOGIN_DISPLAY_NAME]
    );

    await getOrCreateWallet(pool, inserted.rows[0].id);
    return normalizeUser(inserted.rows[0]);
}

async function resolveOwnedProjectId(projectId, userId) {
    if (!projectId) return null;
    const parsedProjectId = Number(projectId);
    if (!Number.isInteger(parsedProjectId) || parsedProjectId <= 0) return null;
    const owned = await pool.query("SELECT id FROM projects WHERE id=$1 AND user_id=$2", [parsedProjectId, userId]);
    return owned.rows[0]?.id || null;
}

async function resolveOwnedRunId(runId, userId) {
    if (!runId) return null;
    const parsedRunId = Number(runId);
    if (!Number.isInteger(parsedRunId) || parsedRunId <= 0) return null;
    const owned = await pool.query("SELECT id FROM generation_runs WHERE id=$1 AND user_id=$2", [parsedRunId, userId]);
    return owned.rows[0]?.id || null;
}

function mergeProjectSettings(projectSettings = {}, patch = {}) {
    return {
        ...(projectSettings && typeof projectSettings === "object" ? projectSettings : {}),
        ...patch,
    };
}

const AI_SETTINGS_KEYS = ["billingMode", "provider", "credentialId", "model"];

function normalizeProjectSettingsPayload(settings = {}) {
    const rawSettings = settings && typeof settings === "object" ? settings : {};
    const aiSettings = sanitizeAiSettings(rawSettings);
    const mergedSettings = mergeProjectSettings(rawSettings, aiSettings);
    const hasExplicitAiSettings = AI_SETTINGS_KEYS.some((key) => Object.prototype.hasOwnProperty.call(rawSettings, key));
    const didChange = AI_SETTINGS_KEYS.some((key) => (rawSettings?.[key] ?? null) !== (mergedSettings?.[key] ?? null));

    return {
        settings: mergedSettings,
        aiSettings,
        hasExplicitAiSettings,
        didChange,
    };
}

function serializeProjectRow(row) {
    if (!row) return null;
    const normalized = normalizeProjectSettingsPayload(row.settings || {});
    return {
        ...row,
        settings: normalized.settings,
    };
}

async function selfHealProjectAiSettings(project) {
    if (!project?.id) return project;
    const normalized = normalizeProjectSettingsPayload(project.settings || {});
    if (!normalized.hasExplicitAiSettings || !normalized.didChange) {
        return {
            ...project,
            settings: normalized.settings,
        };
    }

    const result = await pool.query(
        "UPDATE projects SET settings=$1, updated_at=NOW() WHERE id=$2 RETURNING *",
        [normalized.settings, project.id]
    );

    return result.rows[0] || {
        ...project,
        settings: normalized.settings,
    };
}

function getAiSettingsFromProject(project) {
    return sanitizeAiSettings(project?.settings || {});
}

async function resolveAiRuntimeForRequest({ userId, project = null, projectId = null }) {
    let ownedProject = project;

    if (!ownedProject && projectId) {
        ownedProject = await getProjectForUser(pool, projectId, userId);
    }

    if (ownedProject) {
        ownedProject = await selfHealProjectAiSettings(ownedProject);
    }

    const aiSettings = getAiSettingsFromProject(ownedProject);
    if (!ownedProject || aiSettings.billingMode !== AI_BILLING_MODES.BYOK) {
        return {
            billingSource: AI_BILLING_MODES.INTERNAL,
            provider: SERVER_PROVIDER.defaultProvider,
            model: SERVER_PROVIDER.defaultModel,
            credentialId: null,
            project: ownedProject,
            aiSettings,
        };
    }

    if (!aiSettings.credentialId) {
        const err = new Error("Project ini memakai mode BYOK, tapi credential belum dipilih.");
        err.statusCode = 400;
        err.code = "BYOK_CREDENTIAL_REQUIRED";
        throw err;
    }

    const credential = await getCredentialForUser(pool, {
        credentialId: aiSettings.credentialId,
        userId,
        decrypt: true,
    });

    if (!credential?.row) {
        const err = new Error("Credential BYOK tidak ditemukan.");
        err.statusCode = 404;
        err.code = "BYOK_CREDENTIAL_NOT_FOUND";
        throw err;
    }

    if (!credential.row.is_active) {
        const err = new Error("Credential BYOK sedang nonaktif.");
        err.statusCode = 400;
        err.code = "BYOK_CREDENTIAL_INACTIVE";
        throw err;
    }

    return {
        billingSource: AI_BILLING_MODES.BYOK,
        provider: credential.row.provider,
        model: resolveModelForProvider(credential.row.provider, aiSettings.model || getDefaultModelForProvider(credential.row.provider)),
        credentialId: credential.row.id,
        credentialPayload: credential.payload,
        project: ownedProject,
        aiSettings,
    };
}

async function invokeAiWithRuntime(runtime, input, userId) {
    const result = await invokeTextModel({
        providerId: runtime.provider,
        credentialPayload: runtime.credentialPayload,
        model: runtime.model,
        ...input,
    });

    if (runtime.credentialId) {
        await markCredentialUsage(pool, {
            credentialId: runtime.credentialId,
            userId,
            model: result.model,
        });
    }

    return result;
}

// ─── AUTH ENDPOINTS ─────────────────────────────────────────────────────────
app.post("/api/auth/register", authRouteLimiter, async (req, res) => {
    const { username, password, displayName } = req.body;
    if (!username || !password) return res.status(400).json({ error: "Username dan password wajib" });
    try {
        const hash = await bcrypt.hash(password, 10);
        const r = await pool.query(
            "INSERT INTO users (username, password_hash, display_name) VALUES ($1, $2, $3) RETURNING id, username, display_name, COALESCE(is_admin, FALSE) AS is_admin",
            [username.toLowerCase().trim(), hash, displayName || username]
        );
        const u = r.rows[0];
        await getOrCreateWallet(pool, u.id);
        res.json({ user: normalizeUser(u), token: createAuthToken(u.id) });
    } catch (err) {
        if (err.code === "23505") return res.status(409).json({ error: "Username sudah dipakai" });
        res.status(500).json({ error: err.message });
    }
});

app.post("/api/auth/login", authRouteLimiter, async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: "Username dan password wajib" });
    try {
        const r = await pool.query("SELECT * FROM users WHERE username = $1", [username.toLowerCase().trim()]);
        if (!r.rows.length) return res.status(401).json({ error: "Username tidak ditemukan" });
        const u = r.rows[0];
        const ok = await bcrypt.compare(password, u.password_hash);
        if (!ok) return res.status(401).json({ error: "Password salah" });
        res.json({ user: normalizeUser(u), token: createAuthToken(u.id) });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/api/auth/dev-login", authRouteLimiter, async (req, res) => {
    if (!DEV_AUTO_LOGIN) {
        return res.status(404).json({ error: "Dev auto-login tidak aktif." });
    }

    try {
        const user = await ensureDevUser();
        res.json({
            user,
            token: createAuthToken(user.id),
            dev: true,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/api/auth/me", authMiddleware, async (req, res) => {
    try {
        const r = await pool.query("SELECT id, username, display_name, COALESCE(is_admin, FALSE) AS is_admin FROM users WHERE id = $1", [req.userId]);
        if (!r.rows.length) return res.status(404).json({ error: "User not found" });
        res.json({ user: normalizeUser(r.rows[0]) });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── AI PROVIDERS & CREDENTIALS ─────────────────────────────────────────────
app.get("/api/ai/providers", authMiddleware, async (req, res) => {
    res.json({
        providers: getPublicProviderCatalog(),
        server: SERVER_PROVIDER,
    });
});

app.get("/api/ai/credentials", authMiddleware, async (req, res) => {
    try {
        const credentials = await listCredentialsForUser(pool, req.userId);
        res.json({ credentials });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/api/ai/credentials", authMiddleware, async (req, res) => {
    const { provider, label, payload } = req.body || {};
    try {
        const credential = await createCredential(pool, {
            userId: req.userId,
            provider,
            label,
            payload,
        });
        res.json({ credential });
    } catch (err) {
        const statusCode = err.statusCode || 500;
        res.status(statusCode).json({ error: err.message });
    }
});

app.put("/api/ai/credentials/:id", authMiddleware, async (req, res) => {
    const { provider, label, payload, isActive } = req.body || {};
    try {
        const credential = await updateCredential(pool, {
            credentialId: req.params.id,
            userId: req.userId,
            provider,
            label,
            payload,
            isActive,
        });
        if (!credential) return res.status(404).json({ error: "Credential tidak ditemukan" });
        res.json({ credential });
    } catch (err) {
        const statusCode = err.statusCode || 500;
        res.status(statusCode).json({ error: err.message });
    }
});

app.delete("/api/ai/credentials/:id", authMiddleware, async (req, res) => {
    try {
        const deleted = await deleteCredential(pool, {
            credentialId: req.params.id,
            userId: req.userId,
        });
        if (!deleted) return res.status(404).json({ error: "Credential tidak ditemukan" });
        res.json({ deleted: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/api/ai/credentials/:id/validate", authMiddleware, async (req, res) => {
    const { model } = req.body || {};
    try {
        const credential = await getCredentialForUser(pool, {
            credentialId: req.params.id,
            userId: req.userId,
            decrypt: true,
        });
        if (!credential?.row) return res.status(404).json({ error: "Credential tidak ditemukan" });

        try {
            const validation = await validateProviderCredential({
                providerId: credential.row.provider,
                credentialPayload: credential.payload,
                model,
            });
            const updated = await markCredentialValidation(pool, {
                credentialId: credential.row.id,
                userId: req.userId,
                ok: true,
            });
            res.json({ ok: true, validation, credential: updated });
        } catch (err) {
            const updated = await markCredentialValidation(pool, {
                credentialId: credential.row.id,
                userId: req.userId,
                ok: false,
                errorMessage: err.message,
            });
            const statusCode = err.statusCode || 400;
            res.status(statusCode).json({ ok: false, error: err.message, credential: updated });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── PROJECT CRUD ───────────────────────────────────────────────────────────
app.get("/api/projects", authMiddleware, async (req, res) => {
    try {
        const r = await pool.query(
            "SELECT id, name, settings, analysis, created_at, updated_at FROM projects WHERE user_id = $1 ORDER BY updated_at DESC",
            [req.userId]
        );
        const projects = await Promise.all(r.rows.map(async (row) => {
            const normalized = normalizeProjectSettingsPayload(row.settings || {});
            if (normalized.hasExplicitAiSettings && normalized.didChange) {
                const healed = await pool.query(
                    "UPDATE projects SET settings=$1, updated_at=NOW() WHERE id=$2 AND user_id=$3 RETURNING id, name, settings, analysis, created_at, updated_at",
                    [normalized.settings, row.id, req.userId]
                );
                return serializeProjectRow(healed.rows[0] || { ...row, settings: normalized.settings });
            }
            return serializeProjectRow(row);
        }));
        res.json({ projects });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/api/projects", authMiddleware, async (req, res) => {
    const { name, settings, analysis } = req.body;
    if (!name) return res.status(400).json({ error: "Nama project wajib" });
    try {
        const normalizedSettings = normalizeProjectSettingsPayload(settings || {}).settings;
        const r = await pool.query(
            "INSERT INTO projects (user_id, name, settings, analysis) VALUES ($1, $2, $3, $4) RETURNING *",
            [req.userId, name, normalizedSettings, analysis || null]
        );
        res.json({ project: serializeProjectRow(r.rows[0]) });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put("/api/projects/:id", authMiddleware, async (req, res) => {
    const { name, settings, analysis } = req.body;
    try {
        const normalizedSettings = settings == null ? null : normalizeProjectSettingsPayload(settings).settings;
        const r = await pool.query(
            "UPDATE projects SET name=COALESCE($1,name), settings=COALESCE($2,settings), analysis=COALESCE($3,analysis), updated_at=NOW() WHERE id=$4 AND user_id=$5 RETURNING *",
            [name, normalizedSettings, analysis, req.params.id, req.userId]
        );
        if (!r.rows.length) return res.status(404).json({ error: "Project tidak ditemukan" });
        res.json({ project: serializeProjectRow(r.rows[0]) });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put("/api/projects/:id/ai-settings", authMiddleware, async (req, res) => {
    try {
        const project = await getProjectForUser(pool, req.params.id, req.userId);
        if (!project) return res.status(404).json({ error: "Project tidak ditemukan" });
        const aiSettings = sanitizeAiSettings(req.body || {});
        if (aiSettings.billingMode === AI_BILLING_MODES.BYOK && !aiSettings.credentialId) {
            return res.status(400).json({ error: "Pilih credential BYOK sebelum menyimpan AI settings." });
        }
        const settings = mergeProjectSettings(project.settings || {}, aiSettings);
        const result = await pool.query(
            "UPDATE projects SET settings=$1, updated_at=NOW() WHERE id=$2 AND user_id=$3 RETURNING *",
            [settings, req.params.id, req.userId]
        );
        res.json({ project: serializeProjectRow(result.rows[0]), aiSettings });
    } catch (err) {
        const statusCode = err.statusCode || 500;
        res.status(statusCode).json({ error: err.message });
    }
});

app.delete("/api/projects/:id", authMiddleware, async (req, res) => {
    try {
        const r = await pool.query("DELETE FROM projects WHERE id=$1 AND user_id=$2 RETURNING id", [req.params.id, req.userId]);
        if (!r.rows.length) return res.status(404).json({ error: "Project tidak ditemukan" });
        res.json({ deleted: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── AUDIENCES ──────────────────────────────────────────────────────────────
app.post("/api/projects/:id/audiences", authMiddleware, async (req, res) => {
    const { data } = req.body;
    try {
        // Verify project ownership
        const p = await pool.query("SELECT id FROM projects WHERE id=$1 AND user_id=$2", [req.params.id, req.userId]);
        if (!p.rows.length) return res.status(404).json({ error: "Project tidak ditemukan" });
        // Upsert — delete old and insert new
        await pool.query("DELETE FROM audiences WHERE project_id=$1", [req.params.id]);
        const r = await pool.query(
            "INSERT INTO audiences (project_id, data) VALUES ($1, $2) RETURNING *",
            [req.params.id, JSON.stringify(data)]
        );
        res.json({ audience: r.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/api/projects/:id/audiences", authMiddleware, async (req, res) => {
    try {
        const r = await pool.query("SELECT * FROM audiences WHERE project_id=$1 ORDER BY created_at DESC LIMIT 1", [req.params.id]);
        res.json({ audience: r.rows[0] || null });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── ANGLES ─────────────────────────────────────────────────────────────────
app.post("/api/projects/:id/angles", authMiddleware, async (req, res) => {
    const { data, audienceIdx } = req.body;
    try {
        const p = await pool.query("SELECT id FROM projects WHERE id=$1 AND user_id=$2", [req.params.id, req.userId]);
        if (!p.rows.length) return res.status(404).json({ error: "Project tidak ditemukan" });
        await pool.query("DELETE FROM angles WHERE project_id=$1 AND audience_idx=$2", [req.params.id, audienceIdx || 0]);
        const r = await pool.query(
            "INSERT INTO angles (project_id, audience_idx, data) VALUES ($1, $2, $3) RETURNING *",
            [req.params.id, audienceIdx || 0, JSON.stringify(data)]
        );
        res.json({ angle: r.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/api/projects/:id/angles", authMiddleware, async (req, res) => {
    try {
        const r = await pool.query("SELECT * FROM angles WHERE project_id=$1 ORDER BY created_at DESC", [req.params.id]);
        res.json({ angles: r.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── COPIES ─────────────────────────────────────────────────────────────────
app.post("/api/projects/:id/copies", authMiddleware, async (req, res) => {
    const { audienceName, angleTeknik, format, framework, copyText, notes } = req.body;
    try {
        const p = await pool.query("SELECT id FROM projects WHERE id=$1 AND user_id=$2", [req.params.id, req.userId]);
        if (!p.rows.length) return res.status(404).json({ error: "Project tidak ditemukan" });
        const r = await pool.query(
            "INSERT INTO copies (project_id, audience_name, angle_teknik, format, framework, copy_text, notes) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *",
            [req.params.id, audienceName, angleTeknik, format, framework, copyText, notes]
        );
        res.json({ copy: r.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/api/projects/:id/copies", authMiddleware, async (req, res) => {
    try {
        const r = await pool.query("SELECT * FROM copies WHERE project_id=$1 ORDER BY created_at DESC", [req.params.id]);
        res.json({ copies: r.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete("/api/copies/:id", authMiddleware, async (req, res) => {
    try {
        const r = await pool.query(
            "DELETE FROM copies WHERE id=$1 AND project_id IN (SELECT id FROM projects WHERE user_id=$2) RETURNING id",
            [req.params.id, req.userId]
        );
        if (!r.rows.length) return res.status(404).json({ error: "Copy tidak ditemukan" });
        res.json({ deleted: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put("/api/copies/:id/used", authMiddleware, async (req, res) => {
    try {
        const { is_used } = req.body;
        const r = await pool.query(
            "UPDATE copies SET is_used=$1 WHERE id=$2 AND project_id IN (SELECT id FROM projects WHERE user_id=$3) RETURNING *",
            [is_used, req.params.id, req.userId]
        );
        if (!r.rows.length) return res.status(404).json({ error: "Copy tidak ditemukan" });
        res.json({ copy: r.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── FUNNEL PAGES ────────────────────────────────────────────────────────────
app.post("/api/projects/:id/funnel-pages/generate", authMiddleware, async (req, res) => {
    const { brief, framework, runId } = req.body;
    try {
        const project = await getProjectForUser(pool, req.params.id, req.userId);
        if (!project) return res.status(404).json({ error: "Project tidak ditemukan" });
        const ownedRunId = await resolveOwnedRunId(runId, req.userId);
        if (runId && !ownedRunId) return res.status(404).json({ error: "Run tidak ditemukan" });
        const runtime = await resolveAiRuntimeForRequest({ userId: req.userId, project });
        if (runtime.billingSource === AI_BILLING_MODES.INTERNAL) {
            await assertCreditsAvailable(pool, req.userId, "generate_landing_page");
        }
        const generated = await generateLandingPage({
            invokeModel: (input) => invokeAiWithRuntime(runtime, input, req.userId),
            brief,
            framework,
            settings: project.settings || {},
        });
        const page = generated.page;
        const saved = await createOrUpdateFunnelPage(pool, project.id, {
            brief,
            framework: framework || page.framework,
            templateKey: page.templateKey,
            pageJson: page,
            generatedAnalysis: page.generatedAnalysis,
            pageType: LANDING_PAGE_PAGE_TYPE,
        });
        const usageRecord = await recordUsageEvent(pool, {
            userId: req.userId,
            projectId: project.id,
            runId: ownedRunId,
            taskType: "generate_landing_page",
            modelId: generated.model || runtime.model,
            provider: generated.provider || runtime.provider,
            modelFamily: generated.modelFamily || null,
            billingSource: runtime.billingSource,
            requestLabel: "Generate Landing Page",
            maxTokensRequested: 4500,
            requestMeta: {
                framework: framework || page.framework,
                templateKey: page.templateKey,
                billingSource: runtime.billingSource,
                provider: generated.provider || runtime.provider,
            },
            usage: generated.usage || {},
        });
        res.json({
            page: saved,
            usageEvent: usageRecord.usageEvent,
            wallet: usageRecord.wallet,
            provider: generated.provider || runtime.provider,
            billingSource: runtime.billingSource,
            creditDebited: usageRecord.creditsCharged > 0,
        });
    } catch (err) {
        const statusCode = err.statusCode || 500;
        res.status(statusCode).json({ error: err.message, code: err.code });
    }
});

app.post("/api/projects/:id/funnel-pages", authMiddleware, async (req, res) => {
    const { brief, pageJson, generatedAnalysis, framework, templateKey, pageType } = req.body;
    try {
        const project = await getProjectForUser(pool, req.params.id, req.userId);
        if (!project) return res.status(404).json({ error: "Project tidak ditemukan" });
        const page = await createOrUpdateFunnelPage(pool, project.id, {
            brief,
            pageJson,
            generatedAnalysis,
            framework,
            templateKey,
            pageType: pageType || LANDING_PAGE_PAGE_TYPE,
        });
        res.json({ page });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/api/projects/:id/funnel-pages", authMiddleware, async (req, res) => {
    try {
        const project = await getProjectForUser(pool, req.params.id, req.userId);
        if (!project) return res.status(404).json({ error: "Project tidak ditemukan" });
        const page = await getFunnelPageByProject(pool, project.id, req.query.type || LANDING_PAGE_PAGE_TYPE);
        res.json({ page: page || null });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put("/api/funnel-pages/:id", authMiddleware, async (req, res) => {
    const { brief, pageJson, generatedAnalysis, framework, templateKey } = req.body;
    try {
        const page = await updateFunnelPageById(pool, req.params.id, req.userId, {
            brief,
            pageJson,
            generatedAnalysis,
            framework,
            templateKey,
        });
        if (!page) return res.status(404).json({ error: "Landing page tidak ditemukan" });
        res.json({ page });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── USAGE & CREDITS ────────────────────────────────────────────────────────
app.post("/api/usage/runs", authMiddleware, async (req, res) => {
    const { projectId, runType, label, meta } = req.body || {};
    try {
        const ownedProjectId = await resolveOwnedProjectId(projectId, req.userId);
        if (projectId && !ownedProjectId) return res.status(404).json({ error: "Project tidak ditemukan" });
        const run = await createGenerationRun(pool, {
            userId: req.userId,
            projectId: ownedProjectId,
            runType: runType || "campaign_cycle",
            label: label || null,
            meta: meta || {},
        });
        res.json({ run });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/api/usage/summary", authMiddleware, async (req, res) => {
    try {
        const projectId = await resolveOwnedProjectId(req.query.projectId, req.userId);
        if (req.query.projectId && !projectId) return res.status(404).json({ error: "Project tidak ditemukan" });
        const summary = await getUsageSummary(pool, { userId: req.userId, projectId });
        res.json(summary);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/api/usage/events", authMiddleware, async (req, res) => {
    try {
        const projectId = await resolveOwnedProjectId(req.query.projectId, req.userId);
        if (req.query.projectId && !projectId) return res.status(404).json({ error: "Project tidak ditemukan" });
        const limit = Math.min(Math.max(Number(req.query.limit) || 30, 1), 100);
        const events = await getUsageEvents(pool, { userId: req.userId, projectId, limit });
        res.json({ events });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/api/usage/ledger", authMiddleware, async (req, res) => {
    try {
        const projectId = await resolveOwnedProjectId(req.query.projectId, req.userId);
        if (req.query.projectId && !projectId) return res.status(404).json({ error: "Project tidak ditemukan" });
        const limit = Math.min(Math.max(Number(req.query.limit) || 30, 1), 100);
        const ledger = await getCreditLedger(pool, { userId: req.userId, projectId, limit });
        res.json({ ledger });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/api/usage/runs", authMiddleware, async (req, res) => {
    try {
        const projectId = await resolveOwnedProjectId(req.query.projectId, req.userId);
        if (req.query.projectId && !projectId) return res.status(404).json({ error: "Project tidak ditemukan" });
        const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
        const runs = await getGenerationRuns(pool, { userId: req.userId, projectId, limit });
        res.json({ runs, pricing: CREDIT_PRICING });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── ADMIN BILLING ──────────────────────────────────────────────────────────
app.get("/api/admin/billing/users", authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const search = String(req.query.search || "");
        const limit = Math.min(Math.max(Number(req.query.limit) || 24, 1), 100);
        const users = await getBillingUsers(pool, { search, limit });
        res.json({
            users: users.map((row) => ({
                ...row,
                is_admin: Boolean(row.is_admin) || ADMIN_USERNAMES.has(String(row.username || "").toLowerCase()),
            })),
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/api/admin/billing/grants", authMiddleware, adminMiddleware, async (req, res) => {
    const { userId, amount, reason, meta } = req.body || {};
    try {
        const granted = await grantCredits(pool, {
            adminUserId: req.userId,
            targetUserId: userId,
            amount,
            reason: reason || "Admin top-up credits",
            meta: meta || {},
        });
        res.json({
            user: normalizeUser(granted.user),
            wallet: granted.wallet,
            ledgerEntry: granted.ledgerEntry,
        });
    } catch (err) {
        const statusCode = err.statusCode || 500;
        res.status(statusCode).json({ error: err.message });
    }
});

// ─── SCRAPE ENDPOINT (Playwright) ───────────────────────────────────────────
app.post("/api/scrape", authMiddleware, scrapeRouteLimiter, async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "URL is required" });

    let browser;
    try {
        const safeUrl = await assertSafePublicUrl(url);
        const { chromium } = await import("playwright");
        browser = await chromium.launch({ headless: true });
        const page = await browser.newPage();
        await page.goto(safeUrl, { waitUntil: "domcontentloaded", timeout: 20000 });
        await page.waitForTimeout(2000);
        const textContent = await page.evaluate(() => {
            document.querySelectorAll("script, style, noscript, iframe").forEach(el => el.remove());
            return document.body?.innerText || "";
        });
        await browser.close();
        res.json({ content: textContent.slice(0, 15000) });
    } catch (err) {
        if (browser) await browser.close().catch(() => { });
        console.error("Scrape error:", err.message);
        res.status(500).json({ error: `Gagal scrape: ${err.message}` });
    }
});

// ─── CHAT ENDPOINT (Provider Resolver) ──────────────────────────────────────
app.post("/api/chat", authMiddleware, chatRouteLimiter, async (req, res) => {
    const {
        messages,
        maxTokens = 3000,
        taskType = "generic_chat",
        projectId = null,
        runId = null,
        requestLabel = null,
        meta = {},
    } = req.body;

    if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "messages array is required" });
    }

    try {
        const ownedProjectId = await resolveOwnedProjectId(projectId, req.userId);
        if (projectId && !ownedProjectId) {
            return res.status(404).json({ error: "Project tidak ditemukan" });
        }
        const ownedRunId = await resolveOwnedRunId(runId, req.userId);
        if (runId && !ownedRunId) {
            return res.status(404).json({ error: "Run tidak ditemukan" });
        }
        const runtime = await resolveAiRuntimeForRequest({ userId: req.userId, projectId: ownedProjectId });
        if (runtime.billingSource === AI_BILLING_MODES.INTERNAL) {
            await assertCreditsAvailable(pool, req.userId, taskType);
        }

        const response = await invokeAiWithRuntime(runtime, {
            messages,
            maxTokens,
            temperature: 0.7,
        }, req.userId);
        const text = response.text || "";

        const usageRecord = await recordUsageEvent(pool, {
            userId: req.userId,
            projectId: ownedProjectId,
            runId: ownedRunId,
            taskType,
            modelId: response.model || runtime.model,
            provider: response.provider || runtime.provider,
            modelFamily: response.modelFamily || null,
            billingSource: runtime.billingSource,
            requestLabel: requestLabel || taskType,
            maxTokensRequested: maxTokens,
            requestMeta: {
                ...(meta || {}),
                billingSource: runtime.billingSource,
                provider: response.provider || runtime.provider,
            },
            usage: response.usage || {},
        });

        res.json({
            text,
            stopReason: "completed",
            usage: response.usage,
            usageEvent: usageRecord.usageEvent,
            wallet: usageRecord.wallet,
            provider: response.provider || runtime.provider,
            billingSource: runtime.billingSource,
            creditDebited: usageRecord.creditsCharged > 0,
        });
    } catch (err) {
        console.error("AI provider error:", err);
        const statusCode = err.statusCode || err.$metadata?.httpStatusCode || 500;
        res.status(statusCode).json({
            error: err.message || "AI provider error",
            code: err.code || err.name,
        });
    }
});

// ─── HEALTH CHECK ───────────────────────────────────────────────────────────
app.get("/api/health", async (req, res) => {
    let dbOk = false;
    try { await pool.query("SELECT 1"); dbOk = true; } catch (err) { void err; }
    res.json({
        status: "ok",
        defaultProvider: SERVER_PROVIDER.defaultProvider,
        model: SERVER_PROVIDER.defaultModel,
        region: process.env.AWS_REGION || null,
        devAutoLogin: DEV_AUTO_LOGIN,
        databaseUrlSource: process.env.DATABASE_URL ? "env" : "local_default",
        database: dbOk ? "connected" : "error",
    });
});

// ─── START ──────────────────────────────────────────────────────────────────
async function start() {
    await ensureCoreTables();
    await ensureAdminUsersColumn();
    await ensureFunnelPagesTable(pool);
    await ensureUsageTables(pool);
    await ensureAiCredentialTables(pool);
    app.listen(PORT, () => {
        console.log(`\n🚀 Meta Ads Builder API`);
        console.log(`   Port:   ${PORT}`);
        console.log(`   Provider:${SERVER_PROVIDER.defaultProvider}`);
        console.log(`   Model:  ${SERVER_PROVIDER.defaultModel}`);
        console.log(`   DevAuth:${DEV_AUTO_LOGIN ? `enabled (${DEV_AUTO_LOGIN_USERNAME})` : "disabled"}`);
        console.log(`   DB:     ${DB_URL.replace(/:[^@]+@/, ':***@')}`);
        console.log(`   Ready!\n`);
    });
}

start().catch((err) => {
    console.error("Startup error:", err);
    process.exit(1);
});
