import { useEffect, useEffectEvent, useState } from "react";
import LandingPageTab from "./LandingPageTab.jsx";
import { TabCopy, TabUsage } from "./StudioCopyUsagePanels.jsx";
import { LoginModal, ProjectModal } from "./StudioDialogs.jsx";
import { TabAnalyzer, TabAngle, TabAudience } from "./StudioCorePanels.jsx";
import TabSettings from "./StudioSettingsPanel.jsx";
import { createStudioRuntime } from "./studioRuntime.js";
import StudioDashboard from "./StudioDashboard.jsx";
import WizardFlow from "./WizardFlow.jsx";
import WorkspaceHeader from "./WorkspaceHeader.jsx";
import { createDemoWorkspace } from "./demoWorkspace.js";
import { buildConversionGuardrails, buildLanguageGuardrails, buildUsefulnessGuardrails } from "./prompting.js";
import {
  buildAnalysisFromPage,
  createLandingPageBrief,
  normalizeLandingPageRecord,
  renderLandingPageHtml,
  STARTER_BRIEF_KITS,
} from "../shared/landingPage.js";
import {
  AI_BILLING_MODES,
  createDefaultAiSettings,
  getDefaultModelForProvider,
  getProviderConfig,
  sanitizeAiSettings,
} from "../shared/aiProviders.js";

// ─── ICONS (inline SVG) ──────────────────────────────────────────────────────
const I = ({ d, size = 16, color = "currentColor", style: s = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, display: "inline-block", verticalAlign: "middle", ...s }}><path d={d} /></svg>
);
const Ic = {
  settings: (p) => <I d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" {...p} />,
  search: (p) => <I d="M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z" {...p} />,
  users: (p) => <I d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z M22 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75" {...p} />,
  target: (p) => <I d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M12 6a6 6 0 1 0 0 12 6 6 0 0 0 0-6z M12 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" {...p} />,
  edit: (p) => <I d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" {...p} />,
  rocket: (p) => <I d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z M12 15l-3-3 M22 2l-7.5 7.5 M15 2H22V9 M22 2L13.5 10.5" {...p} />,
  book: (p) => <I d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" {...p} />,
  megaphone: (p) => <I d="m3 11 18-5v12L3 13v-2z M11.6 16.8a3 3 0 1 1-5.8-1.6" {...p} />,
  bridge: (p) => <I d="M2 20h20 M6 20V8 M18 20V8 M2 8h20 M6 8c0-3.31 2.69-6 6-6s6 2.69 6 6" {...p} />,
  flag: (p) => <I d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z M4 22v-7" {...p} />,
  chat: (p) => <I d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" {...p} />,
  mask: (p) => <I d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z M8 14s1.5 2 4 2 4-2 4-2 M9 9h.01 M15 9h.01" {...p} />,
  ban: (p) => <I d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M4.93 4.93l14.14 14.14" {...p} />,
  check: (p) => <I d="M20 6L9 17l-5-5" {...p} />,
  fileText: (p) => <I d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8" {...p} />,
  eye: (p) => <I d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" {...p} />,
  folder: (p) => <I d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" {...p} />,
  save: (p) => <I d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z M17 21v-8H7v8 M7 3v5h8" {...p} />,
  alertTri: (p) => <I d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z M12 9v4 M12 17h.01" {...p} />,
  copy: (p) => <I d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2 M15 2H9a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1z" {...p} />,
  clock: (p) => <I d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M12 6v6l4 2" {...p} />,
  bulb: (p) => <I d="M9 18h6 M10 22h4 M12 2a7 7 0 0 0-4 12.72V17h8v-2.28A7 7 0 0 0 12 2z" {...p} />,
  dollar: (p) => <I d="M12 1v22 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" {...p} />,
  image: (p) => <I d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z M8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z M21 15l-5-5L5 21" {...p} />,
  film: (p) => <I d="M19.82 2H4.18A2.18 2.18 0 0 0 2 4.18v15.64A2.18 2.18 0 0 0 4.18 22h15.64A2.18 2.18 0 0 0 22 19.82V4.18A2.18 2.18 0 0 0 19.82 2z M7 2v20 M17 2v20 M2 12h20 M2 7h5 M2 17h5 M17 17h5 M17 7h5" {...p} />,
  phone: (p) => <I d="M5 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H5z M8 18h.01" {...p} />,
  layers: (p) => <I d="M12 2L2 7l10 5 10-5-10-5z M2 17l10 5 10-5 M2 12l10 5 10-5" {...p} />,
  zap: (p) => <I d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" {...p} />,
  trash: (p) => <I d="M3 6h18 M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6 M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" {...p} />,
  plus: (p) => <I d="M12 5v14 M5 12h14" {...p} />,
  logOut: (p) => <I d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9" {...p} />,
  link: (p) => <I d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71 M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" {...p} />,
  hash: (p) => <I d="M4 9h16 M4 15h16 M10 3l-2 18 M16 3l-2 18" {...p} />,
  bookOpen: (p) => <I d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" {...p} />,
  arrowR: (p) => <I d="M5 12h14 M12 5l7 7-7 7" {...p} />,
  bookmark: (p) => <I d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" {...p} />,
  wrench: (p) => <I d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" {...p} />,
  shield: (p) => <I d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" {...p} />,
  chevronR: (p) => <I d="M9 18l6-6-6-6" {...p} />,
  download: (p) => <I d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M7 10l5 5 5-5 M12 15V3" {...p} />,
  refresh: (p) => <I d="M1 4v6h6 M23 20v-6h-6 M20.49 9A9 9 0 0 0 5.64 5.64L1 10 M23 14l-4.64 4.36A9 9 0 0 1 3.51 15" {...p} />,
  key: (p) => <I d="M21 2l-2 2m-7.61 7.61a5 5 0 1 1 7.07-7.07L22 8l-3 3-2-2-1 1 2 2-3 3-1.39-1.39z" {...p} />,
};

// ─── API HELPERS ──────────────────────────────────────────────────────────────
const LOCAL_API_PORT = import.meta.env.VITE_API_PORT || (typeof window !== "undefined" && !["localhost", "127.0.0.1"].includes(window.location.hostname) ? "3011" : "3001");

function resolveApiBase() {
  if (typeof window === "undefined") return `http://localhost:${LOCAL_API_PORT}`;
  if (import.meta.env.VITE_API_BASE) return import.meta.env.VITE_API_BASE;

  const { protocol, hostname } = window.location;

  if (hostname === "temanlaunch.my.id" || hostname === "www.temanlaunch.my.id") {
    return "https://api.temanlaunch.my.id";
  }

  if (hostname.endsWith(".onrender.com") && hostname.startsWith("temanlaunch-web.")) {
    return `${protocol}//${hostname.replace("temanlaunch-web.", "temanlaunch-api.")}`;
  }

  return `${protocol}//${hostname}:${LOCAL_API_PORT}`;
}

const API_BASE = resolveApiBase();
const DEV_AUTO_LOGIN_ENABLED = import.meta.env.DEV && String(import.meta.env.VITE_DEV_AUTO_LOGIN || "false").toLowerCase() === "true";
const DEMO_MODE_STORAGE_KEY = "temanlaunch_demo_mode";

function humanizeAppErrorMessage(message) {
  const raw = String(message || "").trim();
  if (!raw) return "Terjadi kendala. Coba lagi sebentar lagi.";
  if (/provided model identifier is invalid/i.test(raw) || /invalid model/i.test(raw)) {
    return "Pengaturan AI untuk project ini perlu diperbarui. Buka mode lanjutan lalu cek pengaturan AI project ini.";
  }
  if (/credit/i.test(raw) && /insufficient|not enough|saldo|balance/i.test(raw)) {
    return "Jatah AI untuk project ini tidak cukup. Tambah kredit atau pakai API key sendiri di mode lanjutan.";
  }
  return raw;
}

async function callClaude(messages, {
  maxTokens = 3000,
  taskType = "generic_chat",
  projectId = null,
  runId = null,
  requestLabel = null,
  meta = {},
} = {}) {
  const token = localStorage.getItem("mab_token") || "";
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}/api/chat`, {
    method: "POST",
    headers,
    body: JSON.stringify({ messages, maxTokens, taskType, projectId, runId, requestLabel, meta }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(humanizeAppErrorMessage(data.error || "API error"));
  return data.text;
}

async function scrapeUrl(url) {
  const token = localStorage.getItem("mab_token") || "";
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}/api/scrape`, {
    method: "POST",
    headers,
    body: JSON.stringify({ url }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(humanizeAppErrorMessage(data.error || "Scrape error"));
  return data.content;
}

function parseJSON(text) {
  if (!text || text.trim().length < 5) throw new Error("Respons AI kosong.");
  let t = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
  const attempt = (input) => {
    try { return JSON.parse(input); } catch { return null; }
  };
  const direct = attempt(t);
  if (direct) return direct;
  const a = t.match(/(\[[\s\S]*\])/); if (a) { const arr = attempt(a[1]); if (arr) return arr; }
  const o = t.match(/(\{[\s\S]*\})/); if (o) { const obj = attempt(o[1]); if (obj) return obj; }
  const relaxed = attempt(t.replace(/,\s*([}\]])/g, "$1"));
  if (relaxed) return relaxed;
  // Try to repair truncated JSON arrays — find last complete object
  if (t.startsWith("[")) {
    let repaired = t;
    // Remove trailing incomplete object after last },
    const lastComplete = repaired.lastIndexOf("},");
    if (lastComplete > 0) {
      repaired = repaired.slice(0, lastComplete + 1) + "]";
      const repairedArray = attempt(repaired);
      if (repairedArray) return repairedArray;
    }
    // Try closing with }]
    const lastBrace = repaired.lastIndexOf("}");
    if (lastBrace > 0) {
      repaired = repaired.slice(0, lastBrace + 1) + "]";
      const closedArray = attempt(repaired);
      if (closedArray) return closedArray;
    }
  }
  throw new Error("JSON tidak valid.\n\nRespons AI:\n" + text.slice(0, 500));
}

// ─── DEFAULT SETTINGS ─────────────────────────────────────────────────────────
const DEFAULT_SETTINGS = {
  framework: "Hormozi",
  slangLevel: 3,
  beginnerGoal: "physical_product",
  brandVoice: "",
  forbiddenWords: "",
  requiredWords: "",
  customInstructions: "",
  language: "informal",
  ...createDefaultAiSettings(),
};

const FRAMEWORKS = {
  Hormozi: {
    label: "Alex Hormozi",
    icon: "dollar",
    desc: "Value Equation: Dream Outcome × Likelihood ÷ Time × Effort. Fokus ke nilai, bukan harga.",
    structure: ["Hook yang stop-the-scroll", "Agitate pain secara spesifik", "Bridge ke solusi", "Value stack dengan angka", "Social proof", "Risk reversal / garansi", "CTA dengan urgency"],
  },
  AIDA: {
    label: "AIDA",
    icon: "megaphone",
    desc: "Attention → Interest → Desire → Action. Framework klasik yang terbukti.",
    structure: ["Attention: headline yang bikin penasaran", "Interest: fakta atau cerita yang menarik", "Desire: manfaat spesifik yang diinginkan", "Action: CTA yang clear"],
  },
  PAS: {
    label: "PAS",
    icon: "target",
    desc: "Problem → Agitate → Solution. Simpel, direct, dan sangat efektif untuk cold audience.",
    structure: ["Problem: naming the pain", "Agitate: perbesar dan dramatisasi pain", "Solution: tawaran sebagai jalan keluar"],
  },
  StoryBrand: {
    label: "StoryBrand",
    icon: "book",
    desc: "Posisikan customer sebagai hero, brand sebagai guide. Donald Miller framework.",
    structure: ["Character (customer sebagai hero)", "Problem yang mereka hadapi", "Guide muncul (brand)", "Plan yang jelas", "Call to action", "Avoiding failure", "Success outcome"],
  },
  BAB: {
    label: "Before-After-Bridge",
    icon: "bridge",
    desc: "Before (situasi sekarang) → After (situasi ideal) → Bridge (cara mencapainya).",
    structure: ["Before: gambarkan situasi buruk sekarang", "After: gambarkan situasi ideal yang diinginkan", "Bridge: tawaran sebagai jembatan antara keduanya"],
  },
};

const SLANG_LEVELS = [
  { val: 1, label: "Formal", ex: "Anda, tidak, sudah, sangat" },
  { val: 2, label: "Semi-Formal", ex: "Anda/kamu, nggak, sudah, banget" },
  { val: 3, label: "Informal", ex: "kamu, nggak, udah, banget, beneran" },
  { val: 4, label: "Gaul", ex: "lo, gue, nggak, udah, banget, emang, dll" },
  { val: 5, label: "Super Gaul", ex: "elo, gue, gak, udah, anjir (mild), btw, fyi" },
];

const GOAL_PRESETS = [
  {
    id: "physical_product",
    label: "Jual produk fisik",
    shortLabel: "Produk fisik",
    description: "Cocok untuk skincare, fashion, makanan, alat rumah, dan produk yang butuh bukti manfaat cepat.",
    framework: "Hormozi",
    fmt: "Carousel",
    slangLevel: 3,
    promptHint: "Fokus ke manfaat yang terasa cepat, pembeda produk, alasan beli sekarang, dan risiko beli yang kecil.",
  },
  {
    id: "service_offer",
    label: "Jual jasa atau freelance",
    shortLabel: "Jasa",
    description: "Cocok untuk agency, desain, ads service, web dev, dan layanan profesional lain.",
    framework: "PAS",
    fmt: "Static",
    slangLevel: 3,
    promptHint: "Tonjolkan problem yang bikin calon klien rugi kalau ditunda, lalu posisikan jasa sebagai solusi yang jelas dan meyakinkan.",
  },
  {
    id: "course_consulting",
    label: "Jual kelas atau konsultasi",
    shortLabel: "Kelas",
    description: "Cocok untuk mentoring, coaching, workshop, kelas online, atau program transformasi.",
    framework: "StoryBrand",
    fmt: "Carousel",
    slangLevel: 3,
    promptHint: "Tekankan perubahan sebelum-sesudah, rasa percaya, dan langkah yang bikin calon pembeli yakin program ini bisa diikuti.",
  },
  {
    id: "personal_brand",
    label: "Bangun personal brand",
    shortLabel: "Personal brand",
    description: "Cocok untuk creator, expert, edukator, atau founder yang menjual lewat persona dan sudut pandang.",
    framework: "BAB",
    fmt: "Reels",
    slangLevel: 4,
    promptHint: "Pakai bahasa yang terasa lebih hidup dan personal. Fokus pada cerita, sudut pandang, dan kedekatan dengan audiens.",
  },
];

function getGoalPreset(id) {
  return GOAL_PRESETS.find((item) => item.id === id) || GOAL_PRESETS[0];
}

// ─── PROMPTS ──────────────────────────────────────────────────────────────────
function buildContext(settings) {
  const fw = FRAMEWORKS[settings.framework];
  const slang = SLANG_LEVELS.find(s => s.val === settings.slangLevel);
  const preset = getGoalPreset(settings.beginnerGoal);
  return `FRAMEWORK YANG DIPAKAI: ${fw.label} — ${fw.desc}
GOAL USER: ${preset.label}
LEVEL BAHASA: ${slang.label} (${slang.ex})
ARAH CAMPAIGN: ${preset.promptHint}

${buildLanguageGuardrails(settings, slang)}

${buildUsefulnessGuardrails()}`;
}

const P_TEXT = (content) => `Kamu adalah analis marketing Indonesia yang jago membedah landing page untuk dijadikan bahan jualan.

Fokusmu adalah menangkap inti offer, pain pembeli, manfaat nyata, bukti sosial, CTA, dan positioning produk dengan bahasa Indonesia yang rapi dan natural.

ATURAN:
- Kerja hanya dari konten yang tersedia.
- Jangan mengarang detail yang tidak ada.
- Jika harga, garansi, atau social proof tidak muncul, tulis "tidak disebutkan".
- Ringkas tapi tetap tajam dan berguna untuk dipakai ke tahap audience, ide jualan, dan copy.
- Gunakan Bahasa Indonesia yang alami, tidak kaku, dan tidak terasa seperti hasil translate.
- Kalau landing page memakai istilah Inggris, boleh pertahankan yang memang penting, tapi penjelasannya tetap harus natural untuk pembaca Indonesia.
- Pilih rumusan yang paling membantu user cepat paham apa yang dijual, siapa yang cocok beli, dan kenapa offer ini menarik.

KONTEN:
---
${content.slice(0, 8000)}
---

Respond HANYA dengan raw JSON object (langsung JSON, no markdown, no teks lain):
{"produk":"nama produk","tagline":"tagline utama","offer_inti":"deskripsi offer 1-2 kalimat","pain_points":["pain 1","pain 2","pain 3","pain 4","pain 5"],"dream_outcome":"hasil impian yang dijanjikan","usp":"apa yang bikin ini beda","target_market":"siapa target utamanya","harga":"harga atau tidak disebutkan","guarantee":"garansi atau risk reversal","social_proof":"bukti sosial","cta_utama":"CTA utama di halaman","framework_produk":"framework atau metodologi (Bazi, Human Design, dll)","nilai_utama":["nilai 1","nilai 2","nilai 3"]}`;

const P_URL = (url) => `Gunakan web search untuk membaca landing page: ${url}

Setelah membaca, respond HANYA dengan raw JSON (langsung JSON, no markdown):
{"produk":"nama produk","tagline":"tagline utama","offer_inti":"deskripsi offer 1-2 kalimat","pain_points":["pain 1","pain 2","pain 3","pain 4","pain 5"],"dream_outcome":"hasil impian yang dijanjikan","usp":"apa yang bikin ini beda","target_market":"siapa target utamanya","harga":"harga atau tidak disebutkan","guarantee":"garansi atau risk reversal","social_proof":"bukti sosial","cta_utama":"CTA utama di halaman","framework_produk":"framework atau metodologi","nilai_utama":["nilai 1","nilai 2","nilai 3"]}`;

const P_AUDIENCE = (analysis, settings) => `Kamu adalah strategist Meta Ads Indonesia yang terbiasa menyusun segment pembeli untuk iklan performa.

${buildContext(settings)}

Data produk:
${JSON.stringify(analysis, null, 2)}

Buat TEPAT 6 segment pembeli yang terasa nyata, spesifik, dan bisa langsung dipakai untuk iklan.

ATURAN TAMBAHAN:
- Nama segment harus pendek, manusiawi, dan mudah dimengerti user biasa.
- Pain dan dream outcome harus konkret, bukan jargon marketing.
- Field "meta_targeting" harus berisi ide targeting praktis yang masuk akal untuk pasar Indonesia.
- Jangan membuat 6 segment yang sebenarnya mirip semua.
- Hindari deskripsi segment yang terdengar seperti laporan riset korporat. Tulis seperti orang lapangan yang paham pembeli nyata.
- Isi setiap segment harus terasa berbeda dari sisi situasi, motivasi beli, dan sudut pesan yang relevan.

Respond HANYA raw JSON array (langsung JSON, no markdown, tepat 6 object):
[{"id":1,"nama":"max 4 kata","usia":"range usia","deskripsi":"siapa mereka 1-2 kalimat","situasi":"kondisi mereka sekarang","pain_utama":"pain terbesar paling spesifik","dream_outcome":"apa yang paling mereka inginkan","awareness":"cold atau warm atau hot","meta_targeting":"interest dan behavior Meta Ads Indonesia","hormozi_hook":"kenapa offer ini perfect 1 kalimat"},{"id":2},{"id":3},{"id":4},{"id":5},{"id":6}]`;

const ANGLE_TECHNIQUES = {
  Hormozi: ["Value Stack", "Risk Reversal", "Dream Outcome vs Current State", "Specificity Bomb", "Social Proof Stack", "Urgency/Scarcity"],
  AIDA: ["Attention Grabber", "Interest Builder", "Desire Amplifier", "Action Driver", "Emotion Trigger", "Curiosity Gap"],
  PAS: ["Pain Focused", "Agitate Deep", "Solution Reveal", "Fear of Missing Out", "Before-After Contrast", "Social Proof"],
  StoryBrand: ["Hero's Journey", "Guide Positioning", "Problem Naming", "Plan Clarity", "Success Vision", "Failure Avoidance"],
  BAB: ["Before Pain", "After Dream", "Bridge Solution", "Contrast Frame", "Future Pacing", "Transformation Proof"],
};

const P_ANGLE = (analysis, audience, settings) => {
  const fw = FRAMEWORKS[settings.framework];
  const techniques = ANGLE_TECHNIQUES[settings.framework] || ANGLE_TECHNIQUES.Hormozi;
  return `Kamu adalah strategist creative Indonesia yang tugasnya menyusun ide jualan untuk Meta Ads.

${buildContext(settings)}

Produk: ${JSON.stringify(analysis)}
Audience: ${JSON.stringify(audience)}

Buat TEPAT 6 ide jualan/angle iklan. Setiap angle pakai teknik berbeda sesuai ${fw.label} framework.
Teknik yang harus ada: ${techniques.join(", ")}.

PENTING: Setiap angle harus benar-benar menerapkan prinsip ${fw.label}:
- ${fw.structure.join("\n- ")}
- HOOK harus universal (JANGAN menyebutkan kata "video ini" atau "gambar ini"), karena angle ini akan dipakai untuk berbagai format (Reels/Static/Carousel).
- Hook harus terdengar seperti pembuka iklan yang alami di Indonesia, bukan terjemahan literal atau headline korporat.
- Field "why_it_works" harus menjelaskan alasan angle ini relevan untuk audience, bukan teori umum.
- Nama angle, hook, dan big promise harus terasa seperti bahan iklan sungguhan, bukan label workshop copywriting.
- Hindari hook yang terlalu generik seperti "Mau hidup lebih baik?" atau "Sudah saatnya berubah." Cari pembuka yang lebih tajam dan membumi.

Respond HANYA raw JSON array (langsung JSON, no markdown, tepat 6 object):
[{"id":1,"nama":"nama angle","teknik":"${techniques[0]}","hook":"hook 1-2 kalimat bikin scroll stop (universal, jgn sebut video/gambar)","big_promise":"janji besar spesifik","why_it_works":"kenapa works untuk audience ini","rekomendasi_format":"Reels / Static / Carousel","tone":"emosional","framework_note":"cara framework ${fw.label} diterapkan di angle ini"},{"id":2,"teknik":"${techniques[1]}"},{"id":3,"teknik":"${techniques[2]}"},{"id":4,"teknik":"${techniques[3]}"},{"id":5,"teknik":"${techniques[4]}"},{"id":6,"teknik":"${techniques[5]}"}]`;
};

const FORMAT_GUIDE = {
  Static: `FORMAT: Static Image Ad (Feed Post)
ATURAN FORMAT CAPTION:
- Tulis caption ALL-IN-ONE yang langsung menarik. Ini teks caption di bawah gambar.
- Mulai dengan HOOK 1 baris yang bikin stop scroll.
- Paragraf singkat 2-3 kalimat, pakai line break untuk readability.
- Maksimal 125 karakter untuk 2 baris pertama (yang visible tanpa "Selengkapnya").
- Total caption 150-300 kata. Akhiri dengan CTA + link/arahan.
- Cocok untuk penjelasan detail + storytelling pendek.

OUTPUT FORMAT: Tulis 2 bagian yang dipisahkan oleh "===IMAGE PROMPT===" :
1. BAGIAN PERTAMA: Caption (seperti aturan di atas)
2. BAGIAN KEDUA: Image Design Prompt untuk desainer (lihat aturan di bawah)

ATURAN IMAGE DESIGN PROMPT:
Tulis prompt desain gambar yang SANGAT SPESIFIK untuk desainer/AI image generator. Ikuti kaidah berikut:

SAFE ZONE META ADS (WAJIB):
- JANGAN taruh teks apapun di BAWAH 20% gambar — area ini tertutup tombol CTA, caption, dan UI Meta.
- JANGAN taruh teks di KANAN 15% gambar — area ini tertutup tombol like/comment/share jika crosspost ke Reels/Story.
- JANGAN taruh teks di TENGAH BAWAH — pasti tidak terbaca.
- Area AMAN untuk teks: ATAS-TENGAH (top-center), ATAS-KIRI (top-left), atau CENTER-CENTER.
- Rasio teks di gambar: maksimal 20% dari total area gambar (Meta policy).

YANG HARUS DITULIS DI IMAGE PROMPT:
- Headline utama: teks apa yang ada di gambar, posisi (misal: "atas-tengah"), ukuran font (besar/sedang), style (bold, uppercase, dll).
- Sub-headline: jika ada, posisi dan style-nya.
- Background: warna/gradien/foto apa, mood (bright, dark, minimal, dll).
- Elemen visual: icon, foto produk, ilustrasi — posisi dan ukurannya.
- Warna dominan dan aksen.
- CTA button di gambar (jika ada): teks, warna, posisi (biasanya center-center atau center-left, BUKAN di bawah).
- Ukuran gambar: 1080x1080px (square) atau 1080x1350px (portrait 4:5).
- Typography style: modern/clean/bold/playful/premium — sesuai brand.
- Overall vibe: profesional, energetic, calm, urgent, dll.

Contoh output:
===IMAGE PROMPT===
Gambar 1080x1080px, background gradien biru tua ke hitam.
HEADLINE: "Capek Iklan Boncos?" — posisi atas-tengah, font bold 72px, warna putih, uppercase.
SUB-HEADLINE: "Framework yang Dipakai 1000+ Advertiser" — posisi tepat di bawah headline, font regular 28px, warna kuning #FFD700.
VISUAL: Icon chart naik + screenshot testimonial — posisi center-left, ukuran 40% area gambar.
CTA BUTTON: Kotak rounded hijau (#16a34a) dengan teks "COBA GRATIS" — posisi center, di bawah visual.
LOGO: Kecil, pojok kiri bawah (masih di safe zone, bukan di paling bawah).
Typography: Modern sans-serif (Inter/Montserrat), clean, premium feel.
Overall: High-contrast, dark luxury vibe, text sangat readable.
JANGAN ada teks di 20% bawah dan 15% kanan gambar.`,

  Carousel: `FORMAT: Carousel Ad (Multi-slide)
ATURAN FORMAT:
- Tulis copy per SLIDE, pisahkan dengan "---" di antara setiap slide.
- Slide 1: HOOK kuat, bikin orang swipe. Kalimat teaser, BUKAN jawaban langsung.
- Slide 2-7: Masing-masing 1 ide/poin. Singkat, punchy, 1-3 kalimat per slide.
- Slide terakhir: CTA yang jelas + urgency.
- Total 7-10 slides. Setiap slide harus bisa berdiri sendiri tapi mengalir.
- Tulis juga CAPTION pendek di bawah (2-3 kalimat + CTA) setelah semua slide.`,

  Reels: `FORMAT: Reels / Video Script
ATURAN FORMAT:
- Tulis sebagai SCRIPT yang dibaca/diucapkan. Bukan caption.
- Detik 0-3: HOOK yang bikin stop scroll. 1 kalimat super catchy.
- Detik 3-15: Build-up — agitate pain atau reveal insight.
- Detik 15-45: Isi utama — solusi, value, proof.
- Detik 45-60: CTA yang actionable.
- Tulis dalam bahasa ngomong (spoken), bukan bahasa tulis.
- Tambahkan [VISUAL: ...] di setiap section untuk petunjuk visual.
- Total durasi ~60 detik (sekitar 150-200 kata spoken).
- Juga sertakan CAPTION singkat di akhir (1-2 kalimat + CTA).`,

  Story: `FORMAT: Instagram Story Ad
ATURAN FORMAT:
- Tulis copy SANGAT SINGKAT — per frame/story.
- Frame 1: Hook 1 kalimat (max 8 kata). BOLD. Bikin penasaran.
- Frame 2: Pain → agitate (1-2 kalimat pendek).
- Frame 3: Solusi (1 kalimat + visual cue).
- Frame 4: Social proof singkat (1 baris).
- Frame 5: CTA + urgency + "Swipe Up" / "Klik Link".
- Total 3-5 frames. Pisahkan dengan "---".
- Setiap frame MAX 2 kalimat. Story itu dibaca 3-5 detik per frame.
- Pakai bahasa casual, direct, punchy, seperti ngobrol.`,
};

const TASK_LABELS = {
  analyze_lp: "Analisa LP",
  generate_audience: "Generate Audience",
  generate_angle: "Generate Angle",
  generate_copy: "Generate Copy",
  generate_landing_page: "Generate Landing Page",
  generic_chat: "AI Request",
};

const P_COPY = (analysis, audience, angle, fmt, notes, settings) => {
  const fw = FRAMEWORKS[settings.framework];
  const slang = SLANG_LEVELS.find(s => s.val === settings.slangLevel);
  const languageGuardrails = buildLanguageGuardrails(settings, slang);

  return `Kamu adalah copywriter Meta Ads terbaik Indonesia.

FRAMEWORK: ${fw.label}
Struktur ${fw.label}: ${fw.structure.join(" → ")}
LEVEL BAHASA: ${slang.label} — gunakan kata seperti: ${slang.ex}

${languageGuardrails}

${buildUsefulnessGuardrails()}

${buildConversionGuardrails()}

${FORMAT_GUIDE[fmt] || FORMAT_GUIDE.Static}

KONTEKS:
- Produk: ${analysis.produk} | ${analysis.offer_inti}
- Audience: ${audience.nama} | Pain: ${audience.pain_utama} | Dream: ${audience.dream_outcome}
- Angle: ${angle.teknik} | Opening: ${angle.hook}
- Garansi: ${analysis.guarantee || "ada garansi"}
- Social proof: ${analysis.social_proof || "ada testimoni"}
${notes ? `- Catatan: ${notes}` : ""}

Tulis ad copy mengikuti struktur ${fw.label} DAN sesuai aturan FORMAT di atas.
JIKA formatnya Static/Carousel, pastikan copy ditulis untuk DIBACA (bukan script video/Reels).
JANGAN tulis label section — langsung tulis copy mengalir natural sesuai format.
- Utamakan kalimat yang enak dibaca orang Indonesia, tajam, dan spesifik.
- Jangan terdengar seperti brosur kaku, deck startup, atau hasil translate.
- Jangan menjelaskan framework ke user. Yang user lihat harus murni hasil jualan.
- Kalau perlu memilih, utamakan copy yang bikin pembeli merasa "ini gue banget" dibanding copy yang terdengar puitis tapi kosong.
- Hindari frasa klise seperti "bayangkan jika", "solusi terbaik untuk Anda", "ubah hidup Anda sekarang juga", kecuali memang konteks produk menuntut itu.
Tulis HANYA copynya, tidak ada penjelasan tambahan.`;
};

// ─── DESIGN ───────────────────────────────────────────────────────────────────
const FONT_BODY = "'Instrument Sans', 'Segoe UI', sans-serif";
const FONT_DISPLAY = "'Fraunces', 'Georgia', serif";
const C = {
  bg: "#efe8db", s1: "#fbf7ef", s2: "#f4eddf", s3: "#e4d8c1",
  border: "#ccbea3", hi: "#b09b78",
  accent: "#1f6b4a", mid: "#174c35", dim2: "#1f6b4a10",
  text: "#1f2a20", muted: "#485648", dim: "#8b8475",
  red: "#a74a34", orange: "#b56c35", blue: "#385f74",
  purple: "#6e5568", cyan: "#2d7973", yellow: "#9e7c24",
  pink: "#b25d74",
};

const TC = { "PAS": C.red, "Contrast Frame": C.orange, "Specificity Bomb": C.accent, "Risk Reversal": C.blue, "Social Proof": C.purple, "Authority & Social Proof": C.purple, "Curiosity Gap": C.cyan };
const AC = { cold: C.blue, warm: C.orange, hot: C.red };
const FMT = { Static: "image", Carousel: "layers", Reels: "film", Story: "phone" };
const FMT_ICON = { Static: Ic.image, Carousel: Ic.layers, Reels: Ic.film, Story: Ic.phone };
const SHELL_MAX = 1280;

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700;9..144,800&family=Instrument+Sans:wght@400;500;600;700;800&display=swap');
  :root{color-scheme:light}
  *{box-sizing:border-box;margin:0;padding:0}
  body{
    font-family:${FONT_BODY};
    background:
      radial-gradient(circle at 10% 10%, #dbc08655 0, transparent 22%),
      radial-gradient(circle at 88% 18%, #1f6b4a14 0, transparent 28%),
      linear-gradient(180deg, #f8f3ea 0%, ${C.bg} 100%);
    color:${C.text};
  }
  body::before{
    content:"";
    position:fixed;
    inset:0;
    pointer-events:none;
    opacity:.18;
    background:
      linear-gradient(90deg, transparent 0, transparent calc(100% - 1px), #ffffff55 calc(100% - 1px)),
      linear-gradient(180deg, transparent 0, transparent calc(100% - 1px), #ffffff33 calc(100% - 1px));
    background-size:52px 52px;
    mask-image:linear-gradient(180deg,#000 0%,#000 38%,transparent 100%);
  }
  ::selection{background:${C.accent};color:${C.s1}}
  ::-webkit-scrollbar{width:6px}::-webkit-scrollbar-track{background:${C.s2}}::-webkit-scrollbar-thumb{background:${C.hi};border-radius:999px}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}
  @keyframes up{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  @keyframes sh{0%{opacity:.6}50%{opacity:1}100%{opacity:.6}}
  @keyframes drift{0%,100%{transform:translate3d(0,0,0) scale(1)}50%{transform:translate3d(12px,-10px,0) scale(1.03)}}
  textarea,input{transition:border-color .15s}
  button,input,textarea{font:inherit}
  textarea:focus,input:focus{border-color:${C.mid} !important;outline:none}
  .hov{transition:border-color .2s,transform .18s,box-shadow .2s,background .2s}
  .hov:hover{border-color:${C.mid} !important;transform:translateY(-3px);box-shadow:0 18px 34px #5b42211a}
  .pb:hover{background:${C.mid} !important}
  .sb:hover{border-color:${C.accent} !important;color:${C.accent} !important;background:${C.accent}08 !important}
  .gb:hover{color:${C.accent} !important;background:${C.accent}08 !important}
  .tab:hover{color:${C.accent} !important}
  .fb:hover{border-color:${C.mid} !important;background:${C.s1}}
  input[type=range]{-webkit-appearance:none;height:4px;border-radius:4px;background:${C.dim};outline:none}
  input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;border-radius:50%;background:${C.accent};cursor:pointer}
  .shell-ambient{position:fixed;inset:0;pointer-events:none;overflow:hidden;z-index:0}
  .shell-ambient i{position:absolute;border-radius:999px;filter:blur(0);animation:drift 18s ease-in-out infinite}
  .shell-ambient .orb-a{width:320px;height:320px;top:-120px;right:-80px;background:#c3a16822}
  .shell-ambient .orb-b{width:240px;height:240px;top:28%;left:-80px;background:#1f6b4a16;animation-duration:22s}
  .shell-ambient .orb-c{width:220px;height:220px;bottom:-90px;right:20%;background:#a74a3410;animation-duration:26s}
  .shell-hero{display:grid;grid-template-columns:minmax(0,1.16fr) minmax(320px,.84fr);gap:20px;align-items:start;margin:28px 0 20px}
  .hero-title{font-family:${FONT_DISPLAY};font-size:clamp(2.45rem,5vw,4.7rem);line-height:.94;letter-spacing:-1.5px;max-width:11ch;margin-bottom:12px}
  .hero-copy{max-width:50ch;font-size:14px;line-height:1.78;color:${C.muted}}
  .hero-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:16px}
  .hero-side{position:relative;overflow:hidden;padding:22px;border-radius:28px;border:1px solid ${C.border};background:linear-gradient(155deg,#fcf8f0 0%,#f1e6d3 100%);box-shadow:0 22px 60px #5f452212}
  .hero-side::before{content:"";position:absolute;inset:0;background:radial-gradient(circle at top right,#1f6b4a14 0,transparent 42%),radial-gradient(circle at bottom left,#b56c3516 0,transparent 36%);pointer-events:none}
  .summary-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px;margin-top:16px}
  .summary-tile{position:relative;padding:13px 14px 12px;border-radius:18px;border:1px solid #ffffff70;background:#fffcf6cc}
  .step-strip{display:flex;gap:10px;overflow:auto;padding:2px 0 10px;scrollbar-width:none}
  .step-strip::-webkit-scrollbar{display:none}
  .step-tab{min-width:164px;display:flex;gap:12px;align-items:flex-start;padding:13px 15px;border-radius:22px;border:1px solid ${C.border};background:#faf4e9c9;color:${C.muted};cursor:pointer;transition:transform .18s,background .2s,border-color .2s,box-shadow .2s;text-align:left}
  .step-tab:hover{transform:translateY(-2px);border-color:${C.mid};box-shadow:0 14px 34px #5f452211}
  .step-tab.active{background:${C.mid};color:${C.s1};border-color:${C.mid};box-shadow:0 16px 36px #1f6b4a22}
  .step-tab.done{border-color:${C.mid}55}
  .step-index{width:32px;height:32px;display:inline-flex;align-items:center;justify-content:center;border-radius:999px;background:#ffffffaa;color:${C.text};font-size:11px;font-weight:800;flex-shrink:0}
  .step-tab.active .step-index{background:#ffffff1c;color:${C.s1};border:1px solid #ffffff24}
  .stage-shell{padding:10px 0 44px}
  .stage-note{position:relative;overflow:hidden;padding:22px 22px 20px;border-radius:28px;border:1px solid ${C.orange}2f;background:linear-gradient(135deg,#fff7ea 0%,#f8ecdd 55%,#f6efe4 100%);margin-bottom:20px;box-shadow:0 18px 42px #8b4c1112}
  .stage-note::before{content:"";position:absolute;inset:0;background:radial-gradient(circle at top right,#ffffffa8 0,transparent 34%),radial-gradient(circle at bottom left,#b56c3510 0,transparent 36%);pointer-events:none}
  .stage-note-grid{position:relative;z-index:1;display:grid;grid-template-columns:minmax(0,1.15fr) minmax(260px,.85fr);gap:18px;align-items:end}
  .stage-note-points{display:grid;gap:8px}
  .modal-backdrop{position:fixed;inset:0;background:#261b1242;backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;padding:24px;z-index:999}
  .auth-panel{display:grid;grid-template-columns:minmax(240px,.9fr) minmax(0,1.1fr);width:min(920px,calc(100vw - 32px));background:linear-gradient(145deg,#fcf8f0 0%,#f4ead8 100%);border:1px solid ${C.border};border-radius:34px;overflow:hidden;box-shadow:0 34px 90px #3d261216}
  .auth-brand{padding:34px 30px;background:linear-gradient(180deg,#1d503a 0%,#143425 100%);color:#f6efe5;position:relative;overflow:hidden}
  .auth-brand::before{content:"";position:absolute;inset:auto -40px -80px auto;width:180px;height:180px;border-radius:999px;background:#d6b4711f}
  .auth-form{padding:32px 30px}
  .project-panel{width:min(920px,calc(100vw - 32px));max-height:min(86vh,900px);background:linear-gradient(145deg,#fcf8f0 0%,#f4ead8 100%);border:1px solid ${C.border};border-radius:34px;box-shadow:0 34px 90px #3d261216;display:flex;flex-direction:column;padding:30px}
  .project-list{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:14px}
  .auto-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px}
  .auto-grid-tight{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px}
  .copy-preview-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(250px,320px);gap:16px}
  @media (max-width: 1040px){
    .shell-hero{grid-template-columns:1fr}
    .hero-title{max-width:none}
    .copy-preview-grid{grid-template-columns:1fr}
  }
  @media (max-width: 760px){
    .auth-panel{grid-template-columns:1fr}
    .auth-brand{padding:26px 24px}
    .auth-form{padding:26px 24px}
    .summary-grid{grid-template-columns:1fr}
    .stage-note{padding:18px}
    .stage-note-grid{grid-template-columns:1fr}
    .project-panel{padding:22px}
  }
`;

// ─── UI ATOMS ─────────────────────────────────────────────────────────────────
const Pill = ({ ch, color = C.accent, sm }) => (
  <span style={{ background: color + "16", color, border: `1px solid ${color}30`, borderRadius: 999, padding: sm ? "3px 9px" : "5px 12px", fontSize: sm ? 10 : 11, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4, whiteSpace: "nowrap", letterSpacing: .2 }}>{ch}</span>
);
const Lbl = ({ ch, color = C.muted }) => (
  <div style={{ fontSize: 10, color, textTransform: "uppercase", letterSpacing: 1.9, fontWeight: 800, marginBottom: 8 }}>{ch}</div>
);
function Btn({ ch, onClick, v = "p", disabled, loading, size = "md", full, style: s = {} }) {
  const sz = { sm: { fontSize: 11, padding: "8px 14px" }, md: { fontSize: 13, padding: "11px 18px" }, lg: { fontSize: 14, padding: "14px 24px" } }[size];
  const vs = {
    p: { background: C.accent, color: C.s1, border: `1px solid ${C.mid}`, cn: "pb", boxShadow: "0 10px 24px #1f6b4a18" },
    s: { background: "transparent", color: C.muted, border: `1px solid ${C.border}`, cn: "sb", boxShadow: "none" },
    g: { background: "transparent", color: C.muted, border: "1px solid transparent", cn: "gb", boxShadow: "none" },
    d: { background: C.red + "12", color: C.red, border: `1px solid ${C.red}26`, cn: "", boxShadow: "none" }
  }[v];
  return (
    <button onClick={onClick} disabled={disabled || loading} className={vs.cn}
      style={{ ...sz, ...vs, borderRadius: 999, fontWeight: 800, cursor: (disabled || loading) ? "not-allowed" : "pointer", opacity: disabled ? .3 : 1, display: "inline-flex", alignItems: "center", gap: 7, transition: "all .15s", fontFamily: FONT_BODY, width: full ? "100%" : "auto", justifyContent: "center", letterSpacing: .1, ...s }}>
      {loading && <span style={{ width: 13, height: 13, border: `2px solid ${v === "p" ? "#ffffff40" : C.dim}`, borderTop: `2px solid ${v === "p" ? "#fff" : C.accent}`, borderRadius: "50%", animation: "spin .7s linear infinite", flexShrink: 0 }} />}
      {ch}
    </button>
  );
}
const Box = ({ children, style: s = {}, onClick, glow, cls = "" }) => (
  <div onClick={onClick} className={`hov ${cls}`}
    style={{ background: `linear-gradient(180deg, ${C.s1} 0%, ${C.s2} 100%)`, border: `1px solid ${glow ? C.mid : C.border}`, borderRadius: 24, padding: 20, boxShadow: glow ? `0 18px 44px ${C.mid}18` : "0 10px 30px #573c1b0d", cursor: onClick ? "pointer" : "default", position: "relative", ...s }}>
    {children}
  </div>
);
const Spin = ({ msg }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18, padding: "56px 24px" }}>
    <div style={{ position: "relative", width: 44, height: 44 }}>
      <div style={{ position: "absolute", inset: 0, border: `2px solid ${C.border}`, borderRadius: "50%" }} />
      <div style={{ position: "absolute", inset: 0, border: "2px solid transparent", borderTop: `2px solid ${C.accent}`, borderRadius: "50%", animation: "spin .75s linear infinite" }} />
      <div style={{ position: "absolute", inset: 9, border: "2px solid transparent", borderTop: `2px solid ${C.mid}60`, borderRadius: "50%", animation: "spin 1.3s linear infinite reverse" }} />
    </div>
    <div style={{ color: C.muted, fontSize: 13, lineHeight: 1.7, textAlign: "center", maxWidth: 260, animation: "sh 2s ease infinite" }}>{msg}</div>
  </div>
);
const Zero = ({ icon, title, sub }) => (
  <div style={{ textAlign: "center", padding: "56px 24px", animation: "up .3s ease" }}>
    <div style={{ marginBottom: 10, opacity: .35, display: "flex", justifyContent: "center" }}>{typeof icon === "function" ? icon({ size: 30, color: C.muted }) : icon}</div>
    <div style={{ fontSize: 20, fontWeight: 700, color: C.text, marginBottom: 8, fontFamily: FONT_DISPLAY, letterSpacing: -.3 }}>{title}</div>
    <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.7, maxWidth: 280, margin: "0 auto" }}>{sub}</div>
  </div>
);
function ErrBox({ msg, onClose }) {
  return (
    <div style={{ background: "#fbf0eb", border: `1px solid ${C.red}28`, borderRadius: 20, padding: "14px 18px", marginBottom: 16, animation: "up .2s ease", boxShadow: "0 10px 24px #7d341114" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 800, color: C.red, marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>{Ic.alertTri({ size: 14, color: C.red })} Error</div>
          <div style={{ fontSize: 12, color: "#991b1b", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{msg}</div>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", color: C.red, cursor: "pointer", fontSize: 20, lineHeight: 1, opacity: .7, flexShrink: 0 }}>×</button>
      </div>
    </div>
  );
}

function ShellMetric({ label, value, hint, tone = C.accent }) {
  return (
    <div className="summary-tile">
      <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1.7, fontWeight: 800, color: tone, marginBottom: 7 }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 800, color: C.text, lineHeight: 1.25 }}>{value}</div>
      {hint && <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.55, marginTop: 6 }}>{hint}</div>}
    </div>
  );
}

function SectionLead({ eyebrow, title, sub, aside }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, marginBottom: 18, flexWrap: "wrap" }}>
      <div>
        {eyebrow && (
          <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 2.1, fontWeight: 800, color: C.accent, marginBottom: 8 }}>
            {eyebrow}
          </div>
        )}
        <div style={{ fontSize: 32, fontFamily: FONT_DISPLAY, letterSpacing: -.9, lineHeight: 1, color: C.text, marginBottom: 8 }}>{title}</div>
        {sub && <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.75, maxWidth: 680 }}>{sub}</div>}
      </div>
      {aside}
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
const STUDIO_TABS = [
  {
    id: "settings",
    label: "Campaign Setup",
    simpleLabel: "Gaya Jualan",
    icon: Ic.settings,
    note: "Framework, tone, dan aturan copy",
    simpleNote: "Atur gaya bahasa dan arah pesan",
    advancedOnly: true,
  },
  {
    id: "landing",
    label: "Landing Page",
    simpleLabel: "Halaman Jualan",
    icon: Ic.layers,
    note: "Bangun halaman jualan",
    simpleNote: "Susun halaman jualan dari brief atau template",
  },
  {
    id: "analyzer",
    label: "Analisa LP",
    simpleLabel: "Ringkasan Produk",
    icon: Ic.search,
    note: "Bedah LP existing",
    simpleNote: "Lihat ringkasan produk dan offer utama",
  },
  {
    id: "audience",
    label: "Audience",
    simpleLabel: "Target Pembeli",
    icon: Ic.users,
    note: "Peta segment pasar",
    simpleNote: "Siapa yang paling mungkin membeli",
  },
  {
    id: "angle",
    label: "Angle",
    simpleLabel: "Ide Jualan",
    icon: Ic.target,
    note: "Pilih serangan kreatif",
    simpleNote: "Pilih sudut pesan yang paling kuat",
  },
  {
    id: "copy",
    label: "Ad Copy",
    simpleLabel: "Teks Iklan",
    icon: Ic.edit,
    note: "Finalkan naskah iklan",
    simpleNote: "Rapikan teks iklan yang siap dipakai",
  },
  {
    id: "usage",
    label: "Pemakaian AI",
    simpleLabel: "Pemakaian AI",
    icon: Ic.hash,
    note: "Saldo, riwayat generate, dan penggunaan AI",
    simpleNote: "Pantau saldo dan histori penggunaan AI",
    advancedOnly: true,
  },
];

const SIMPLE_TAB_ORDER = ["landing", "analyzer", "audience", "angle", "copy"];

function getVisibleStudioTabs(advancedMode) {
  const visible = advancedMode ? STUDIO_TABS : STUDIO_TABS.filter((item) => !item.advancedOnly);
  return visible.map((item) => ({
    ...item,
    label: advancedMode ? item.label : item.simpleLabel || item.label,
    note: advancedMode ? item.note : item.simpleNote || item.note,
  }));
}

function resolveStudioTab(candidate, visibleTabs) {
  if (candidate && visibleTabs.some((item) => item.id === candidate)) return candidate;
  const fallback = SIMPLE_TAB_ORDER.find((item) => visibleTabs.some((tab) => tab.id === item));
  return fallback || visibleTabs[0]?.id || "landing";
}

function createWizardProgress(sourceMode = "url") {
  return {
    phase: "input",
    sourceMode,
    startedAt: null,
    completedAt: null,
    steps: {
      analysis: "idle",
      audience: "idle",
      angle: "idle",
      copy: "idle",
    },
  };
}

export default function App() {
  const [initialDemoWorkspace] = useState(() => {
    try {
      return localStorage.getItem(DEMO_MODE_STORAGE_KEY) === "true" ? createDemoWorkspace() : null;
    } catch {
      return null;
    }
  });
  const [isDemoMode, setIsDemoMode] = useState(() => Boolean(initialDemoWorkspace));
  const [user, setUser] = useState(() => {
    if (initialDemoWorkspace?.user) return initialDemoWorkspace.user;
    try {
      return JSON.parse(localStorage.getItem("mab_user"));
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => initialDemoWorkspace ? "" : (localStorage.getItem("mab_token") || ""));
  const [sessionResolved, setSessionResolved] = useState(() => Boolean(initialDemoWorkspace) || !localStorage.getItem("mab_token"));
  const [devLoginBusy, setDevLoginBusy] = useState(false);
  const [devAutoLoginAttempted, setDevAutoLoginAttempted] = useState(false);
  const [project, setProject] = useState(() => initialDemoWorkspace?.project || null);
  const [showProjects, setShowProjects] = useState(false);
  const [autoProjectLoading, setAutoProjectLoading] = useState(false);
  const [surfaceMode, setSurfaceMode] = useState(() => initialDemoWorkspace?.surfaceMode || "wizard");
  const [advancedMode, setAdvancedMode] = useState(() => initialDemoWorkspace?.advancedMode || false);
  const [wizardSourceMode, setWizardSourceMode] = useState(() => initialDemoWorkspace?.wizardSourceMode || "url");
  const [wizardUrl, setWizardUrl] = useState(() => initialDemoWorkspace?.wizardUrl || "");
  const [wizardBrief, setWizardBrief] = useState(() => initialDemoWorkspace?.wizardBrief || createLandingPageBrief());
  const [wizardProgress, setWizardProgress] = useState(() => initialDemoWorkspace?.wizardProgress || createWizardProgress(initialDemoWorkspace?.wizardSourceMode || "url"));

  const [tab, setTab] = useState(() => initialDemoWorkspace?.tab || "analyzer");
  const [settings, setSettings] = useState(() => initialDemoWorkspace?.settings || DEFAULT_SETTINGS);
  const [landingBrief, setLandingBrief] = useState(() => initialDemoWorkspace?.landingBrief || createLandingPageBrief());
  const [landingPage, setLandingPage] = useState(() => initialDemoWorkspace?.landingPage || null);
  const [analysis, setAnalysis] = useState(() => initialDemoWorkspace?.analysis || null);
  const [audiences, setAudiences] = useState(() => initialDemoWorkspace?.audiences || []);
  const [selAud, setSelAud] = useState(() => initialDemoWorkspace?.selAud || null);
  const [angles, setAngles] = useState(() => initialDemoWorkspace?.angles || []);
  const [anglesCache, setAnglesCache] = useState(() => initialDemoWorkspace?.anglesCache || {});
  const [selAng, setSelAng] = useState(() => initialDemoWorkspace?.selAng || null);
  const [copy, setCopy] = useState(() => initialDemoWorkspace?.copy || "");
  const [fmt, setFmt] = useState(() => initialDemoWorkspace?.fmt || "Carousel");
  const [history, setHistory] = useState(() => initialDemoWorkspace?.history || []);
  const [aiProviders, setAiProviders] = useState([]);
  const [serverAiInfo, setServerAiInfo] = useState(null);
  const [aiCredentials, setAiCredentials] = useState([]);
  const [aiSettingsLoading, setAiSettingsLoading] = useState(false);
  const [usageSummary, setUsageSummary] = useState(() => initialDemoWorkspace?.usageSummary || null);
  const [usageEvents, setUsageEvents] = useState(() => initialDemoWorkspace?.usageEvents || []);
  const [usageRuns, setUsageRuns] = useState(() => initialDemoWorkspace?.usageRuns || []);
  const [usageLedger, setUsageLedger] = useState(() => initialDemoWorkspace?.usageLedger || []);
  const [adminBillingUsers, setAdminBillingUsers] = useState([]);
  const [usageLoading, setUsageLoading] = useState(false);
  const [adminBillingLoading, setAdminBillingLoading] = useState(false);
  const [activeRunId, setActiveRunId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadMsg, setLoadMsg] = useState("");
  const [error, setError] = useState(null);

  const authHeaders = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const applyDemoWorkspaceState = (workspace) => {
    setIsDemoMode(true);
    setUser(workspace.user);
    setToken("");
    setSessionResolved(true);
    setProject(workspace.project || null);
    setShowProjects(false);
    setAutoProjectLoading(false);
    setSurfaceMode(workspace.surfaceMode || "wizard");
    setAdvancedMode(Boolean(workspace.advancedMode));
    setWizardSourceMode(workspace.wizardSourceMode || "brief");
    setWizardUrl(workspace.wizardUrl || "");
    setWizardBrief(workspace.wizardBrief || createLandingPageBrief());
    setWizardProgress(workspace.wizardProgress || createWizardProgress(workspace.wizardSourceMode || "brief"));
    setTab(workspace.tab || "copy");
    setSettings(workspace.settings || DEFAULT_SETTINGS);
    setLandingBrief(workspace.landingBrief || createLandingPageBrief());
    setLandingPage(workspace.landingPage || null);
    setAnalysis(workspace.analysis || null);
    setAudiences(workspace.audiences || []);
    setSelAud(workspace.selAud || null);
    setAngles(workspace.angles || []);
    setAnglesCache(workspace.anglesCache || {});
    setSelAng(workspace.selAng || null);
    setCopy(workspace.copy || "");
    setFmt(workspace.fmt || "Static");
    setHistory(workspace.history || []);
    setAiProviders([]);
    setServerAiInfo(null);
    setAiCredentials([]);
    setAiSettingsLoading(false);
    setUsageSummary(workspace.usageSummary || null);
    setUsageEvents(workspace.usageEvents || []);
    setUsageRuns(workspace.usageRuns || []);
    setUsageLedger(workspace.usageLedger || []);
    setAdminBillingUsers([]);
    setUsageLoading(false);
    setAdminBillingLoading(false);
    setActiveRunId(null);
    setLoading(false);
    setLoadMsg("");
    setError(null);
  };

  const seedDemoWorkspace = (overrides = {}) => {
    const workspace = { ...createDemoWorkspace(), ...overrides };
    if (overrides.project) workspace.project = overrides.project;
    if (overrides.settings) workspace.settings = overrides.settings;
    localStorage.setItem(DEMO_MODE_STORAGE_KEY, "true");
    localStorage.removeItem("mab_token");
    localStorage.setItem("mab_user", JSON.stringify(workspace.user));
    applyDemoWorkspaceState(workspace);
    return workspace;
  };

  const activateDemoMode = () => {
    seedDemoWorkspace();
  };

  const handleAuth = (u, t) => {
    localStorage.removeItem(DEMO_MODE_STORAGE_KEY);
    setIsDemoMode(false);
    setUser(u);
    setToken(t);
    setSessionResolved(true);
    localStorage.setItem("mab_token", t);
    localStorage.setItem("mab_user", JSON.stringify(u));
  };

  const updateWizardProgress = (step, status, { sourceMode = wizardSourceMode, phase = "process", reset = false } = {}) => {
    setWizardProgress((current) => {
      const base = reset ? createWizardProgress(sourceMode) : current;
      return {
        ...base,
        sourceMode,
        phase,
        startedAt: base.startedAt || Date.now(),
        completedAt: phase === "output" ? Date.now() : base.completedAt,
        steps: {
          ...base.steps,
          [step]: status,
        },
      };
    });
  };

  const resetWizardFlow = (sourceMode = wizardSourceMode) => {
    setWizardProgress(createWizardProgress(sourceMode));
  };

  const doDevLogin = async () => {
    setDevLoginBusy(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/dev-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Dev login gagal.");
      handleAuth(data.user, data.token);
      return data;
    } finally {
      setDevLoginBusy(false);
      setDevAutoLoginAttempted(true);
    }
  };
  const doDevLoginEvent = useEffectEvent(doDevLogin);

  const refreshAiProviders = async () => {
    if (!token) return;
    const res = await fetch(`${API_BASE}/api/ai/providers`, { headers: authHeaders });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Gagal memuat katalog provider AI.");
    setAiProviders(data.providers || []);
    setServerAiInfo(data.server || null);
    return data;
  };
  const refreshAiProvidersEvent = useEffectEvent(refreshAiProviders);

  const refreshAiCredentials = async () => {
    if (!token) return [];
    const res = await fetch(`${API_BASE}/api/ai/credentials`, { headers: authHeaders });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Gagal memuat credential AI.");
    setAiCredentials(data.credentials || []);
    return data.credentials || [];
  };
  const refreshAiCredentialsEvent = useEffectEvent(refreshAiCredentials);

  const upsertAiCredential = async ({ credentialId = null, provider, label, payload, isActive }) => {
    if (!token) throw new Error("Login diperlukan.");
    const endpoint = credentialId
      ? `${API_BASE}/api/ai/credentials/${credentialId}`
      : `${API_BASE}/api/ai/credentials`;
    const method = credentialId ? "PUT" : "POST";
    const res = await fetch(endpoint, {
      method,
      headers: authHeaders,
      body: JSON.stringify({ provider, label, payload, isActive }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Gagal menyimpan credential AI.");
    await refreshAiCredentials();
    return data.credential;
  };

  const validateAiCredential = async ({ credentialId, model = "" }) => {
    if (!token) throw new Error("Login diperlukan.");
    const res = await fetch(`${API_BASE}/api/ai/credentials/${credentialId}/validate`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ model }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Validasi credential gagal.");
    await refreshAiCredentials();
    return data;
  };

  const deleteAiCredential = async (credentialId) => {
    if (!token) throw new Error("Login diperlukan.");
    const res = await fetch(`${API_BASE}/api/ai/credentials/${credentialId}`, {
      method: "DELETE",
      headers: authHeaders,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Gagal menghapus credential.");
    await refreshAiCredentials();
    setSettings((current) => current.credentialId === credentialId
      ? { ...current, billingMode: AI_BILLING_MODES.INTERNAL, credentialId: null }
      : current);
    return true;
  };

  const saveProjectAiSettings = async (nextAiSettings) => {
    const normalized = sanitizeAiSettings(nextAiSettings);
    setSettings((current) => ({ ...current, ...normalized }));
    if (!project || !token) return normalized;
    setAiSettingsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/projects/${project.id}/ai-settings`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify(normalized),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan AI settings project.");
      setProject(data.project);
      setSettings((current) => ({ ...current, ...sanitizeAiSettings(data.project?.settings || normalized) }));
      return data.aiSettings || normalized;
    } finally {
      setAiSettingsLoading(false);
    }
  };

  const refreshUsageData = async (projectId = project?.id || null) => {
    if (!token) return;
    setUsageLoading(true);
    const query = projectId ? `?projectId=${projectId}` : "";
    try {
      const [summaryRes, eventsRes, runsRes, ledgerRes] = await Promise.all([
        fetch(`${API_BASE}/api/usage/summary${query}`, { headers: authHeaders }),
        fetch(`${API_BASE}/api/usage/events${query}`, { headers: authHeaders }),
        fetch(`${API_BASE}/api/usage/runs${query}`, { headers: authHeaders }),
        fetch(`${API_BASE}/api/usage/ledger${query}`, { headers: authHeaders }),
      ]);

      const [summaryData, eventsData, runsData, ledgerData] = await Promise.all([
        summaryRes.json(),
        eventsRes.json(),
        runsRes.json(),
        ledgerRes.json(),
      ]);

      if (!summaryRes.ok) throw new Error(summaryData.error || "Gagal memuat usage summary.");
      if (!eventsRes.ok) throw new Error(eventsData.error || "Gagal memuat usage events.");
      if (!runsRes.ok) throw new Error(runsData.error || "Gagal memuat usage runs.");
      if (!ledgerRes.ok) throw new Error(ledgerData.error || "Gagal memuat billing ledger.");

      setUsageSummary(summaryData);
      setUsageEvents(eventsData.events || []);
      setUsageRuns(runsData.runs || []);
      setUsageLedger(ledgerData.ledger || []);
    } finally {
      setUsageLoading(false);
    }
  };
  const refreshUsageDataEvent = useEffectEvent(refreshUsageData);

  const refreshAdminUsers = async (search = "") => {
    if (!token || !user?.is_admin) {
      setAdminBillingUsers([]);
      return [];
    }
    setAdminBillingLoading(true);
    try {
      const query = search ? `?search=${encodeURIComponent(search)}` : "";
      const res = await fetch(`${API_BASE}/api/admin/billing/users${query}`, { headers: authHeaders });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memuat user billing.");
      setAdminBillingUsers(data.users || []);
      return data.users || [];
    } finally {
      setAdminBillingLoading(false);
    }
  };
  const refreshAdminUsersEvent = useEffectEvent(refreshAdminUsers);

  const createUsageRun = async ({ runType, label, meta = {}, projectId = project?.id || null }) => {
    if (!token) return null;
    const res = await fetch(`${API_BASE}/api/usage/runs`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ projectId, runType, label, meta }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Gagal membuat usage run.");
    setActiveRunId(data.run?.id || null);
    return data.run?.id || null;
  };

  const resolveUsageRunId = async ({ fresh = false, runType = "campaign_cycle", label = null, meta = {} } = {}) => {
    if (!token) return null;
    if (!fresh && activeRunId) return activeRunId;
    return createUsageRun({ runType, label, meta });
  };

  const grantCreditsToUser = async ({ userId, amount, reason, search = "" }) => {
    if (!token) throw new Error("Login diperlukan.");
    const res = await fetch(`${API_BASE}/api/admin/billing/grants`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ userId, amount, reason }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Top-up credit gagal.");
    await Promise.all([
      refreshUsageData(project?.id || null),
      refreshAdminUsers(search),
    ]);
    return data;
  };

  const logout = () => {
    localStorage.removeItem(DEMO_MODE_STORAGE_KEY);
    localStorage.removeItem("mab_token");
    localStorage.removeItem("mab_user");
    setIsDemoMode(false);
    setUser(null);
    setToken("");
    setSessionResolved(true);
    setProject(null);
    setShowProjects(false);
    setAutoProjectLoading(false);
    setSurfaceMode("wizard");
    setAdvancedMode(false);
    setWizardSourceMode("url");
    setWizardUrl("");
    setWizardBrief(createLandingPageBrief());
    setWizardProgress(createWizardProgress("url"));
    setTab("analyzer");
    setSettings(DEFAULT_SETTINGS);
    setLandingBrief(createLandingPageBrief());
    setLandingPage(null);
    setAnalysis(null);
    setAudiences([]);
    setAngles([]);
    setAnglesCache({});
    setSelAud(null);
    setSelAng(null);
    setCopy("");
    setFmt("Carousel");
    setHistory([]);
    setAiProviders([]);
    setServerAiInfo(null);
    setAiCredentials([]);
    setAiSettingsLoading(false);
    setUsageSummary(null);
    setUsageEvents([]);
    setUsageRuns([]);
    setUsageLedger([]);
    setAdminBillingUsers([]);
    setUsageLoading(false);
    setAdminBillingLoading(false);
    setActiveRunId(null);
  };

  useEffect(() => {
    let cancelled = false;
    if (!token) {
      setSessionResolved(true);
      return;
    }

    setSessionResolved(false);

    const syncCurrentUser = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/auth/me`, {
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Gagal memuat user.");
        if (!cancelled) {
          setUser(data.user);
          localStorage.setItem("mab_user", JSON.stringify(data.user));
        }
      } catch (err) {
        if (!cancelled && /token|unauth|401/i.test(String(err.message || ""))) {
          logout();
        }
      } finally {
        if (!cancelled) setSessionResolved(true);
      }
    };

    syncCurrentUser();
    return () => { cancelled = true; };
  }, [token]);

  useEffect(() => {
    let cancelled = false;
    if (!sessionResolved || token || user || !DEV_AUTO_LOGIN_ENABLED || devAutoLoginAttempted) return;

    const attemptDevLogin = async () => {
      try {
        await doDevLoginEvent();
      } catch {
        if (!cancelled) setDevAutoLoginAttempted(true);
      }
    };

    attemptDevLogin();
    return () => { cancelled = true; };
  }, [devAutoLoginAttempted, sessionResolved, token, user]);

  useEffect(() => {
    if (!token || !user || !sessionResolved) {
      setAiProviders([]);
      setServerAiInfo(null);
      setAiCredentials([]);
      return;
    }
    refreshAiProvidersEvent().catch(() => { });
    refreshAiCredentialsEvent().catch(() => { });
  }, [sessionResolved, token, user]);

  const saveLandingPageToDB = async (pageToSave = landingPage, briefToSave = landingBrief) => {
    if (!project || !token || !pageToSave) return null;
    const normalizedRecord = normalizeLandingPageRecord(pageToSave, briefToSave);
    const normalizedBrief = normalizedRecord?.brief || createLandingPageBrief(briefToSave);
    const normalizedPage = normalizedRecord || pageToSave;
    const generatedAnalysis = normalizedPage.generatedAnalysis || buildAnalysisFromPage(normalizedPage, normalizedBrief);
    const payload = {
      brief: normalizedBrief,
      pageJson: {
        ...normalizedPage,
        framework: normalizedPage.framework || settings.framework,
      },
      generatedAnalysis,
      framework: normalizedPage.framework || settings.framework,
      templateKey: normalizedPage.templateKey || "sales-v1",
    };
    const endpoint = normalizedPage.id
      ? `${API_BASE}/api/funnel-pages/${normalizedPage.id}`
      : `${API_BASE}/api/projects/${project.id}/funnel-pages`;
    const method = normalizedPage.id ? "PUT" : "POST";
    const res = await fetch(endpoint, {
      method,
      headers: authHeaders,
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Gagal menyimpan landing page.");
    if (data.page) {
      const nextPage = normalizeLandingPageRecord(data.page, data.page.brief || normalizedBrief);
      setLandingBrief(nextPage?.brief || normalizedBrief);
      setLandingPage(nextPage);
      setAnalysis(nextPage?.generatedAnalysis || generatedAnalysis);
      return nextPage;
    }
    return null;
  };

  // Save project state to DB
  const saveProject = async () => {
    if (!project || !token) return;
    await run("Menyimpan project...", async () => {
      await fetch(`${API_BASE}/api/projects/${project.id}`, {
        method: "PUT", headers: authHeaders,
        body: JSON.stringify({ settings, analysis }),
      });
      if (audiences.length) {
        await fetch(`${API_BASE}/api/projects/${project.id}/audiences`, {
          method: "POST", headers: authHeaders,
          body: JSON.stringify({ data: audiences }),
        });
      }
      if (landingPage) {
        await saveLandingPageToDB(landingPage, landingBrief);
      }
    });
  };

  // Load project state from DB
  const loadProject = async (p) => {
    setProject(p);
    setShowProjects(false);
    setActiveRunId(null);
    setAnalysis(p.analysis || null);
    setSettings(p.settings && Object.keys(p.settings).length ? { ...DEFAULT_SETTINGS, ...p.settings } : DEFAULT_SETTINGS);
    setLandingBrief(createLandingPageBrief());
    setLandingPage(null);
    setAudiences([]);
    setHistory([]);
    setAnglesCache({});
    setAngles([]);
    setSelAud(null);
    setSelAng(null);
    setCopy("");
    // Load audiences
    try {
      const r = await fetch(`${API_BASE}/api/projects/${p.id}/audiences`, { headers: authHeaders });
      const data = await r.json();
      setAudiences(data.audience?.data ? (typeof data.audience.data === "string" ? JSON.parse(data.audience.data) : data.audience.data) : []);
    } catch {
      setAudiences([]);
    }
    // Load copies history
    try {
      const r = await fetch(`${API_BASE}/api/projects/${p.id}/copies`, { headers: authHeaders });
      const data = await r.json();
      if (data.copies?.length) {
        setHistory(data.copies.map(c => ({
          id: c.id,
          audience: c.audience_name || "?",
          angle: c.angle_teknik || "?",
          fmt: c.format || "Carousel",
          framework: c.framework || "Hormozi",
          copy: c.copy_text,
          is_used: c.is_used || false,
          time: new Date(c.created_at).toLocaleString("id-ID"),
        })));
      } else {
        setHistory([]);
      }
    } catch {
      setHistory([]);
    }
    // Load angles cache
    try {
      const r = await fetch(`${API_BASE}/api/projects/${p.id}/angles`, { headers: authHeaders });
      const data = await r.json();
      if (data.angles?.length) {
        const cache = {};
        data.angles.forEach(a => {
          cache[a.audience_idx] = typeof a.data === "string" ? JSON.parse(a.data) : a.data;
        });
        setAnglesCache(cache);
      } else {
        setAnglesCache({});
      }
    } catch {
      setAnglesCache({});
    }
    // Load landing page
    try {
      const r = await fetch(`${API_BASE}/api/projects/${p.id}/funnel-pages?type=landing`, { headers: authHeaders });
      const data = await r.json();
      if (data.page) {
        const nextPage = normalizeLandingPageRecord(data.page, data.page.brief || createLandingPageBrief());
        setLandingBrief(nextPage?.brief || createLandingPageBrief());
        setLandingPage(nextPage);
        if (!p.analysis && nextPage?.generatedAnalysis) setAnalysis(nextPage.generatedAnalysis);
      } else {
        setLandingBrief(createLandingPageBrief());
        setLandingPage(null);
      }
    } catch {
      setLandingBrief(createLandingPageBrief());
      setLandingPage(null);
    }
  };
  const loadProjectEvent = useEffectEvent(loadProject);

  useEffect(() => {
    let cancelled = false;

    const autoSelectDefaultProject = async () => {
      if (!sessionResolved || !user || !token || project || showProjects) return;
      setAutoProjectLoading(true);
      try {
        const r = await fetch(`${API_BASE}/api/projects`, {
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        });
        const data = await r.json();
        if (!cancelled && data.projects?.length) {
          await loadProjectEvent(data.projects[0]);
        }
      } catch {
        if (!cancelled) setProject(null);
      }
      finally {
        if (!cancelled) setAutoProjectLoading(false);
      }
    };

    autoSelectDefaultProject();
    return () => { cancelled = true; };
  }, [project, sessionResolved, showProjects, token, user]);

  useEffect(() => {
    if (!sessionResolved || !token || !user) return;
    refreshUsageDataEvent(project?.id || null).catch(() => { });
  }, [project?.id, sessionResolved, token, user]);

  useEffect(() => {
    if (!sessionResolved || !token || !user?.is_admin) {
      setAdminBillingUsers([]);
      setAdminBillingLoading(false);
      return;
    }
    refreshAdminUsersEvent("").catch(() => { });
  }, [sessionResolved, token, user?.is_admin]);

  // Auto-save copy to DB
  const saveCopyToDB = async (copyText, aud, ang) => {
    if (!project || !token) return null;
    try {
      const res = await fetch(`${API_BASE}/api/projects/${project.id}/copies`, {
        method: "POST", headers: authHeaders,
        body: JSON.stringify({
          audienceName: aud?.nama || "?",
          angleTeknik: ang?.teknik || "?",
          format: fmt,
          framework: settings.framework,
          copyText,
        }),
      });
      const data = await res.json();
      return data.copy?.id;
    } catch (e) {
      console.error("Save copy error:", e);
      return null;
    }
  };

  const onExportLandingPage = () => {
    if (!landingPage) return;
    const html = renderLandingPageHtml({ ...landingPage, brief: landingBrief });
    const blob = new Blob([html], { type: "text/html" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${(landingBrief.productName || "landing-page").toLowerCase().replace(/[^a-z0-9]+/g, "-") || "landing-page"}.html`;
    a.click();
  };

  const run = async (msg, fn) => {
    setLoading(true); setError(null); setLoadMsg(msg);
    try { await fn(); }
    catch (e) { setError(humanizeAppErrorMessage(e.message)); }
    finally { setLoading(false); setLoadMsg(""); }
  };
  const runtime = createStudioRuntime({
    API_BASE,
    analysis,
    angles,
    anglesCache,
    audiences,
    authHeaders,
    callClaude,
    fmt,
    landingBrief,
    landingPage,
    parseJSON,
    project,
    refreshUsageData,
    resolveUsageRunId,
    resetWizardFlow,
    run,
    saveCopyToDB,
    saveLandingPageToDB,
    scrapeUrl,
    selAud,
    settings,
    setAnalysis,
    setAngles,
    setAnglesCache,
    setAudiences,
    setCopy,
    setHistory,
    setLandingBrief,
    setLandingPage,
    setSelAng,
    setSelAud,
    setSurfaceMode,
    setTab,
    setWizardBrief,
    setWizardSourceMode,
    setWizardUrl,
    token,
    updateWizardProgress,
    P_ANGLE,
    P_AUDIENCE,
    P_COPY,
    P_TEXT,
  });
  const {
    doBuildAud,
    doGenCopy,
    doGenerateLandingPage,
    doSelAud,
    doText,
    doUrl,
    onApplyLandingTemplate,
    onDeleteAngle,
    onDeleteCopy,
    onSaveLandingPage,
    onToggleUsed,
    onUseLandingPageForCampaign,
    runWizardFromBrief,
    runWizardFromUrl,
  } = runtime;

  const isDone = (id) => ({ settings: true, landing: !!landingPage, analyzer: !!analysis, audience: audiences.length > 0, angle: angles.length > 0, copy: !!copy, usage: !!usageSummary })[id];
  const visibleTabs = getVisibleStudioTabs(advancedMode);
  const previewAudience = selAud || audiences[0] || null;
  const previewAudienceIdx = previewAudience ? audiences.findIndex(a => a.nama === previewAudience.nama) : -1;
  const previewAngles = previewAudienceIdx >= 0
    ? (selAud?.nama === previewAudience?.nama ? angles : (anglesCache[previewAudienceIdx] || []))
    : angles;
  const previewAngle = selAng || previewAngles[0] || null;
  const activeTab = visibleTabs.find((item) => item.id === tab) || visibleTabs[0];
  const completedCount = visibleTabs.filter((item) => isDone(item.id)).length;
  const stageProduct = analysis?.produk || landingBrief.productName || "Belum ada produk aktif";
  const stageOffer = analysis?.offer_inti || landingBrief.offer || "Mulai dari produk atau halaman jualan untuk membentuk offer dan positioning.";
  const stageFramework = FRAMEWORKS[settings.framework];
  const stageGoalPreset = getGoalPreset(settings.beginnerGoal);
  const stepIndex = visibleTabs.findIndex((item) => item.id === tab) + 1;
  const stageReadiness = landingPage ? "Landing page siap dipakai" : analysis ? "Analisa siap dipakai" : "Bahan awal belum dibuat";
  const rawPreferredStudioTab = copy
    ? "copy"
    : previewAngles.length
      ? "angle"
      : audiences.length
        ? "audience"
        : analysis
          ? "analyzer"
          : "landing";
  const preferredStudioTab = resolveStudioTab(rawPreferredStudioTab, visibleTabs);
  const demoAction = (message, apply) => run(message, async () => {
    await new Promise((resolve) => window.setTimeout(resolve, 280));
    await apply();
  });
  const loadDemoPack = ({
    sourceMode = "brief",
    nextSurfaceMode = "wizard",
    nextTab = "copy",
    nextAdvancedMode = advancedMode,
    wizardUrlValue = "",
  } = {}) => {
    seedDemoWorkspace({
      surfaceMode: nextSurfaceMode,
      advancedMode: nextAdvancedMode,
      tab: nextTab,
      wizardSourceMode: sourceMode,
      wizardUrl: wizardUrlValue,
    });
  };
  const demoBuildAudience = () => demoAction("Menata ulang target demo workspace...", async () => {
    const nextDemo = createDemoWorkspace();
    setAnalysis(nextDemo.analysis);
    setAudiences(nextDemo.audiences);
    setSelAud(nextDemo.selAud);
    setAngles(nextDemo.angles);
    setAnglesCache(nextDemo.anglesCache);
    setSelAng(null);
    setCopy("");
    setTab("audience");
    setWizardProgress(nextDemo.wizardProgress);
  });
  const demoSelectAudience = (aud, idx) => demoAction(`Membuka sudut pesan untuk ${aud.nama}...`, async () => {
    const nextAngles = anglesCache[idx] || [];
    setSelAud(aud);
    setAngles(nextAngles);
    setSelAng(null);
    setCopy("");
    setTab("angle");
  });
  const demoDeleteAngle = (angToDelete) => {
    const idx = audiences.findIndex((item) => item.nama === selAud?.nama);
    if (idx === -1) return;
    const updatedAngles = angles.filter((item) => item.hook !== angToDelete.hook || item.nama !== angToDelete.nama);
    setAngles(updatedAngles);
    setAnglesCache((current) => ({ ...current, [idx]: updatedAngles }));
    if (selAng?.id === angToDelete.id) {
      setSelAng(updatedAngles[0] || null);
      setCopy("");
    }
  };
  const demoGenerateCopy = (ang, notes = "") => demoAction(`Menyiapkan draft demo - ${ang.teknik}...`, async () => {
    const resultCopy = String(ang?.demoCopy || copy || "").trim();
    const finalCopy = notes.trim()
      ? `${resultCopy}\n\nCatatan adaptasi demo:\n- ${notes.trim()}`
      : resultCopy;
    const currentAudience = selAud || previewAudience || audiences[0] || null;
    const nextHistoryItem = {
      id: `demo-copy-${Date.now()}`,
      audience: currentAudience?.nama || "Audience demo",
      angle: ang?.teknik || "Angle demo",
      fmt,
      framework: settings.framework,
      copy: finalCopy,
      is_used: false,
      time: new Date().toLocaleString("id-ID"),
    };
    setSelAng(ang);
    setCopy(finalCopy);
    setTab("copy");
    setHistory((current) => [nextHistoryItem, ...current].slice(0, 12));
  });
  const demoDeleteCopy = (idToDelete) => {
    setHistory((current) => current.filter((item) => item.id !== idToDelete));
  };
  const demoToggleUsed = (idToToggle, currentStatus) => {
    const nextStatus = !currentStatus;
    setHistory((current) => current.map((item) => item.id === idToToggle ? { ...item, is_used: nextStatus } : item));
  };
  const demoGenerateLanding = () => demoAction("Memuat landing page demo yang sudah dipoles...", async () => {
    const nextDemo = createDemoWorkspace();
    setLandingBrief(nextDemo.landingBrief);
    setLandingPage(nextDemo.landingPage);
    setAnalysis(nextDemo.analysis);
    setTab("landing");
  });
  const demoUseLandingForCampaign = () => demoAction("Menyelaraskan landing page demo ke launch pack...", async () => {
    const nextDemo = createDemoWorkspace();
    setAnalysis(nextDemo.analysis);
    setAudiences(nextDemo.audiences);
    setAngles(nextDemo.angles);
    setAnglesCache(nextDemo.anglesCache);
    setSelAud(nextDemo.selAud);
    setSelAng(nextDemo.selAng);
    setCopy(nextDemo.copy);
    setHistory(nextDemo.history);
    setTab("copy");
  });
  const demoRefreshUsage = () => demoAction("Menyegarkan ringkasan demo billing...", async () => {
    const nextDemo = createDemoWorkspace();
    setUsageSummary(nextDemo.usageSummary);
    setUsageEvents(nextDemo.usageEvents);
    setUsageRuns(nextDemo.usageRuns);
    setUsageLedger(nextDemo.usageLedger);
  });
  const handleDemoProjects = () => {
    setError("Demo workspace memakai sample project tetap. Untuk pilih project real, masuk dengan akun yang terhubung backend.");
  };
  const handleDemoSave = () => {
    setError("Mode demo tidak menyimpan perubahan ke server. Masuk dengan akun real saat sudah siap menjalankan flow live.");
  };
  const appActions = isDemoMode
    ? {
        onRunFromUrl: (rawUrl) => demoAction("Menyiapkan launch pack demo dari jalur URL...", async () => {
          loadDemoPack({ sourceMode: "url", nextSurfaceMode: "wizard", nextTab: "copy", wizardUrlValue: rawUrl });
        }),
        onRunFromBrief: () => demoAction("Menyiapkan launch pack demo dari brief preset...", async () => {
          loadDemoPack({ sourceMode: "brief", nextSurfaceMode: "wizard", nextTab: "copy" });
        }),
        onAnalyzeUrl: () => demoAction("Membuka ringkasan produk demo...", async () => {
          loadDemoPack({ sourceMode: "url", nextSurfaceMode: "studio", nextTab: "analyzer" });
        }),
        onAnalyzeText: () => demoAction("Membuka ringkasan produk demo...", async () => {
          loadDemoPack({ sourceMode: "brief", nextSurfaceMode: "studio", nextTab: "analyzer" });
        }),
        onBuildAudience: demoBuildAudience,
        onSelectAudience: demoSelectAudience,
        onGenerateCopy: demoGenerateCopy,
        onDeleteAngle: demoDeleteAngle,
        onDeleteCopy: demoDeleteCopy,
        onToggleUsed: demoToggleUsed,
        onGenerateLanding: demoGenerateLanding,
        onSaveLanding: handleDemoSave,
        onUseLanding: demoUseLandingForCampaign,
        onOpenProjects: handleDemoProjects,
        onSaveProject: handleDemoSave,
        onRefreshUsage: demoRefreshUsage,
        onAdminSearch: async () => [],
        onAdminGrant: async () => {
          throw new Error("Mode demo tidak mendukung top-up kredit.");
        },
      }
    : {
        onRunFromUrl: runWizardFromUrl,
        onRunFromBrief: runWizardFromBrief,
        onAnalyzeUrl: doUrl,
        onAnalyzeText: doText,
        onBuildAudience: doBuildAud,
        onSelectAudience: doSelAud,
        onGenerateCopy: doGenCopy,
        onDeleteAngle,
        onDeleteCopy,
        onToggleUsed,
        onGenerateLanding: doGenerateLandingPage,
        onSaveLanding: onSaveLandingPage,
        onUseLanding: onUseLandingPageForCampaign,
        onOpenProjects: () => setShowProjects(true),
        onSaveProject: saveProject,
        onRefreshUsage: () => refreshUsageData(project?.id || null),
        onAdminSearch: (search) => refreshAdminUsers(search),
        onAdminGrant: grantCreditsToUser,
      };
  const openStudio = (nextTab = tab) => {
    setSurfaceMode("studio");
    if (nextTab) setTab(resolveStudioTab(nextTab, visibleTabs));
  };
  const openAdvancedStudio = (nextTab = rawPreferredStudioTab) => {
    setAdvancedMode(true);
    setSurfaceMode("studio");
    setTab(resolveStudioTab(nextTab, getVisibleStudioTabs(true)));
  };
  const openSimpleStudio = (nextTab = rawPreferredStudioTab) => {
    setAdvancedMode(false);
    setSurfaceMode("studio");
    setTab(resolveStudioTab(nextTab, getVisibleStudioTabs(false)));
  };
  const openWizard = () => setSurfaceMode("wizard");
  const applyGoalPreset = (goalId) => {
    const preset = getGoalPreset(goalId);
    setSettings((current) => ({
      ...current,
      beginnerGoal: preset.id,
      framework: preset.framework,
      slangLevel: preset.slangLevel,
    }));
    setFmt(preset.fmt);
    return preset;
  };
  const applyWizardStarterKit = (starterId) => {
    const starter = STARTER_BRIEF_KITS.find((item) => item.id === starterId);
    if (!starter) return;
    applyGoalPreset(starter.goalPreset);
    setWizardSourceMode("brief");
    setWizardBrief(createLandingPageBrief(starter.brief));
    resetWizardFlow("brief");
  };
  const quickStartWizardStarterKit = (starterId) => {
    const starter = STARTER_BRIEF_KITS.find((item) => item.id === starterId);
    if (!starter) return;
    if (isDemoMode) {
      demoAction("Membuka launch pack demo dari starter kit...", async () => {
        loadDemoPack({ sourceMode: "brief", nextSurfaceMode: "wizard", nextTab: "copy" });
      });
      return;
    }
    const preset = getGoalPreset(starter.goalPreset);
    const runtimeSettings = {
      ...settings,
      beginnerGoal: preset.id,
      framework: preset.framework,
      slangLevel: preset.slangLevel,
    };
    applyGoalPreset(starter.goalPreset);
    setWizardSourceMode("brief");
    setWizardBrief(createLandingPageBrief(starter.brief));
    runWizardFromBrief(starter.brief, {
      settingsOverride: runtimeSettings,
      fmtOverride: preset.fmt,
    });
  };
  const shouldShowAuthSplash = !sessionResolved || (!user && (Boolean(token) || (DEV_AUTO_LOGIN_ENABLED && !devAutoLoginAttempted)));
  const dialogUi = { API_BASE, Btn, C, FONT_DISPLAY, Ic, Pill, Spin, Zero };
  const corePanelUi = { AC, Box, Btn, C, FMT_ICON, Ic, Lbl, Pill, SectionLead, Spin, TC, Zero };
  const copyUsageUi = {
    AI_BILLING_MODES,
    Box,
    Btn,
    C,
    FMT_ICON,
    FONT_DISPLAY,
    FRAMEWORKS,
    Ic,
    Lbl,
    Pill,
    SectionLead,
    SLANG_LEVELS,
    Spin,
    TASK_LABELS,
    TC,
    Zero,
  };
  const settingsUi = {
    AI_BILLING_MODES,
    Box,
    Btn,
    C,
    FONT_DISPLAY,
    FRAMEWORKS,
    Ic,
    Lbl,
    Pill,
    SLANG_LEVELS,
    SectionLead,
    Zero,
    buildContext,
    getDefaultModelForProvider,
    getProviderConfig,
    sanitizeAiSettings,
  };

  useEffect(() => {
    const nextVisibleTabs = getVisibleStudioTabs(advancedMode);
    if (!nextVisibleTabs.some((item) => item.id === tab)) {
      setTab(resolveStudioTab(rawPreferredStudioTab, nextVisibleTabs));
    }
  }, [advancedMode, rawPreferredStudioTab, tab]);

  if (shouldShowAuthSplash) return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.text, fontFamily: FONT_BODY, position: "relative", overflow: "hidden" }}>
      <style>{css}</style>
      <div className="shell-ambient"><i className="orb-a" /><i className="orb-b" /><i className="orb-c" /></div>
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
        <div style={{ width: "min(480px,100%)", background: "#fffaf2", border: `1px solid ${C.border}`, borderRadius: 28, padding: "28px 26px", boxShadow: "0 20px 60px #2d1d1312" }}>
          <Pill ch="Memuat Workspace" color={C.accent} />
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 34, lineHeight: .95, letterSpacing: -.9, color: C.text, margin: "16px 0 10px" }}>Mengecek sesi dan menyiapkan meja kerja.</div>
          <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.8, marginBottom: 18 }}>
            Kami sedang memvalidasi token dan menyalakan login dev lokal bila memang aktif.
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: C.accent }}>
            <div style={{ width: 12, height: 12, border: `2px solid ${C.accent}22`, borderTop: `2px solid ${C.accent}`, borderRadius: "50%", animation: "spin .7s linear infinite" }} />
            Mohon tunggu sebentar.
          </div>
        </div>
      </div>
    </div>
  );

  if (!user) return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.text, fontFamily: FONT_BODY, position: "relative", overflow: "hidden" }}>
      <style>{css}</style>
      <div className="shell-ambient"><i className="orb-a" /><i className="orb-b" /><i className="orb-c" /></div>
      <LoginModal
        onAuth={handleAuth}
        onEnterDemo={activateDemoMode}
        onDevLogin={doDevLogin}
        devLoginEnabled={DEV_AUTO_LOGIN_ENABLED}
        devLoginBusy={devLoginBusy}
        ui={dialogUi}
      />
    </div>
  );

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.text, fontFamily: FONT_BODY, position: "relative", overflowX: "hidden" }}>
      <style>{css}</style>
      <div className="shell-ambient"><i className="orb-a" /><i className="orb-b" /><i className="orb-c" /></div>
      {showProjects && token && <ProjectModal token={token} onSelect={loadProject} onClose={() => setShowProjects(false)} currentId={project?.id} starterProjects={STARTER_BRIEF_KITS} ui={dialogUi} />}

      <WorkspaceHeader
        C={C}
        Ic={Ic}
        Btn={Btn}
        Pill={Pill}
        SHELL_MAX={SHELL_MAX}
        advancedMode={advancedMode}
        surfaceMode={surfaceMode}
        onToggleSurface={() => surfaceMode === "wizard" ? openStudio(preferredStudioTab) : openWizard()}
        onOpenAdvancedStudio={() => openAdvancedStudio(rawPreferredStudioTab)}
        onOpenSimpleStudio={() => openSimpleStudio(rawPreferredStudioTab)}
        project={project}
        stageFramework={stageFramework}
        stageGoalPreset={stageGoalPreset}
        settings={settings}
        SLANG_LEVELS={SLANG_LEVELS}
        analysis={analysis}
        history={history}
        usageSummary={usageSummary}
        user={user}
        isDemoMode={isDemoMode}
        onOpenProjects={appActions.onOpenProjects}
        onSaveProject={appActions.onSaveProject}
        onLogout={logout}
      />

      <div style={{ maxWidth: SHELL_MAX, margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 1 }}>
        {surfaceMode === "wizard" ? (
          <div style={{ paddingTop: 28, paddingBottom: 42 }}>
            {error && <ErrBox msg={error} onClose={() => setError(null)} />}
            <WizardFlow
              sourceMode={wizardSourceMode}
              onSourceModeChange={(nextMode) => {
                setWizardSourceMode(nextMode);
                resetWizardFlow(nextMode);
              }}
              goalPreset={settings.beginnerGoal}
              goalPresets={GOAL_PRESETS}
              onGoalPresetChange={applyGoalPreset}
              urlValue={wizardUrl}
              onUrlChange={setWizardUrl}
              onRunFromUrl={appActions.onRunFromUrl}
              briefValue={wizardBrief}
              onBriefChange={(key, value) => setWizardBrief((current) => ({ ...current, [key]: value }))}
              onRunFromBrief={appActions.onRunFromBrief}
              onApplyStarterKit={applyWizardStarterKit}
              onQuickStartStarterKit={quickStartWizardStarterKit}
              wizardProgress={wizardProgress}
              loading={loading}
              project={project}
              analysis={analysis}
              audiences={audiences}
              angles={previewAngles}
              copy={copy}
              isDemoMode={isDemoMode}
              onOpenStudio={() => openStudio(preferredStudioTab)}
              onOpenAdvancedStudio={() => openAdvancedStudio(rawPreferredStudioTab)}
              onOpenTab={openStudio}
            />
          </div>
        ) : (
          <StudioDashboard
            C={C}
            Ic={Ic}
            Btn={Btn}
            Pill={Pill}
            ShellMetric={ShellMetric}
            ErrBox={ErrBox}
            FONT_DISPLAY={FONT_DISPLAY}
            tabs={visibleTabs}
            tab={tab}
            onSelectTab={setTab}
            activeTab={activeTab}
            stepIndex={stepIndex}
            advancedMode={advancedMode}
            onOpenAdvancedStudio={() => openAdvancedStudio(rawPreferredStudioTab)}
            onOpenSimpleStudio={() => openSimpleStudio(rawPreferredStudioTab)}
            project={project}
            stageFramework={stageFramework}
            stageGoalPreset={stageGoalPreset}
            fmt={fmt}
            analysis={analysis}
            stageProduct={stageProduct}
            stageOffer={stageOffer}
            stageReadiness={stageReadiness}
            completedCount={completedCount}
            audiences={audiences}
            previewAudience={previewAudience}
            usageSummary={usageSummary}
            history={history}
            isDone={isDone}
            loading={loading}
            loadMsg={loadMsg}
            autoProjectLoading={autoProjectLoading}
            onOpenProjects={appActions.onOpenProjects}
            error={error}
            onClearError={() => setError(null)}
          >
          {tab === "settings" && (
            <TabSettings
              settings={settings}
              setSettings={setSettings}
              project={project}
              aiProviders={aiProviders}
              aiCredentials={aiCredentials}
              serverAiInfo={serverAiInfo}
              aiSettingsLoading={aiSettingsLoading}
              onSaveAiSettings={saveProjectAiSettings}
              onSaveCredential={upsertAiCredential}
              onValidateCredential={validateAiCredential}
              onDeleteCredential={deleteAiCredential}
              ui={settingsUi}
            />
          )}
          {tab === "landing" && (
            <LandingPageTab
              brief={landingBrief}
              page={landingPage}
              project={project}
              settings={settings}
              advancedMode={advancedMode}
              loading={loading}
              onChangeBrief={setLandingBrief}
              onChangePage={setLandingPage}
              onGenerate={appActions.onGenerateLanding}
              onApplyTemplate={onApplyLandingTemplate}
              onSave={appActions.onSaveLanding}
              onUseForCampaign={appActions.onUseLanding}
              onExport={onExportLandingPage}
              C={C}
              Ic={Ic}
              Box={Box}
              Btn={Btn}
              Lbl={Lbl}
              Pill={Pill}
              Zero={Zero}
            />
          )}
          {tab === "analyzer" && <TabAnalyzer analysis={analysis} setAnalysis={setAnalysis} onUrl={appActions.onAnalyzeUrl} onText={appActions.onAnalyzeText} onBuild={appActions.onBuildAudience} loading={loading} ui={corePanelUi} />}
          {tab === "audience" && <TabAudience analysis={analysis} audiences={audiences} onBuild={appActions.onBuildAudience} onSelect={appActions.onSelectAudience} loading={loading} ui={corePanelUi} />}
          {tab === "angle" && <TabAngle audience={previewAudience} audienceIdx={previewAudienceIdx} angles={previewAngles} onRebuild={appActions.onSelectAudience} onGenCopy={appActions.onGenerateCopy} onDeleteAngle={appActions.onDeleteAngle} fmt={fmt} setFmt={setFmt} loading={loading} advancedMode={advancedMode} ui={corePanelUi} />}
          {tab === "copy" && <TabCopy analysis={analysis} audience={previewAudience} angle={previewAngle} copy={copy} history={history} onRegen={n => previewAngle && appActions.onGenerateCopy(previewAngle, n)} onGoTo={setTab} loading={loading} fmt={fmt} setFmt={setFmt} settings={settings} advancedMode={advancedMode} onDeleteCopy={appActions.onDeleteCopy} onToggleUsed={appActions.onToggleUsed} ui={copyUsageUi} />}
          {tab === "usage" && (
            <TabUsage
              summary={usageSummary}
              events={usageEvents}
              runs={usageRuns}
              ledger={usageLedger}
              billingUsers={adminBillingUsers}
              user={user}
              project={project}
              onRefresh={appActions.onRefreshUsage}
              onAdminSearch={appActions.onAdminSearch}
              onAdminGrant={appActions.onAdminGrant}
              adminLoading={adminBillingLoading}
              loading={usageLoading}
              ui={copyUsageUi}
            />
          )}
          </StudioDashboard>
        )}
      </div>
    </div>
  );
}
