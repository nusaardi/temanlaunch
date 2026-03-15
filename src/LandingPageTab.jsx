import { useState } from "react";
import {
  LANDING_PAGE_BRIEF_FIELDS,
  LANDING_PAGE_SECTION_LABELS,
  LANDING_PAGE_STYLE_PRESETS,
  createLandingPageBrief,
  getLandingPageMissingBriefFields,
  getLandingPageStylePreset,
  getOrderedSections,
  renderLandingPageHtml,
  validateAndNormalizeLandingPage,
} from "../shared/landingPage.js";
import { LANDING_PAGE_TEMPLATE_LIBRARY } from "../shared/landingPageTemplates.js";

const DISPLAY_FONT = "'Fraunces', 'Georgia', serif";
const BODY_FONT = "'Instrument Sans', 'Segoe UI', sans-serif";

const STYLE_NOTES = {
  atelier: "Editorial warm, cocok untuk creator, coach, dan premium offer yang terasa personal.",
  signal: "Sharper product-led, cocok untuk jasa, SaaS, dan halaman yang butuh tempo cepat.",
  noir: "Refined and weighty, cocok untuk offer yang perlu authority dan rasa premium yang lebih formal.",
};

const landingTabCss = `
  .lpb-root{
    display:grid;
    gap:18px;
  }
  .lpb-toolbar{
    display:flex;
    flex-wrap:wrap;
    align-items:flex-start;
    justify-content:space-between;
    gap:14px;
    padding:20px 22px;
    border-radius:28px;
    background:
      radial-gradient(circle at top right, rgba(31,107,74,.10), transparent 30%),
      linear-gradient(180deg, rgba(251,247,239,.96) 0%, rgba(244,237,223,.98) 100%);
    border:1px solid rgba(204,190,163,.9);
    box-shadow:0 14px 34px rgba(87,60,27,.08);
  }
  .lpb-toolbar-copy{
    max-width:640px;
  }
  .lpb-toolbar-copy h2{
    margin:0 0 8px;
    font-family:${DISPLAY_FONT};
    font-size:clamp(28px, 4vw, 40px);
    line-height:1.02;
    letter-spacing:-.04em;
  }
  .lpb-toolbar-copy p{
    margin:0;
    color:#485648;
    font-size:14px;
    line-height:1.68;
  }
  .lpb-toolbar-actions{
    display:flex;
    flex-wrap:wrap;
    gap:10px;
    justify-content:flex-end;
  }
  .lpb-grid{
    display:grid;
    grid-template-columns:minmax(220px, 250px) minmax(0, 1fr) minmax(280px, 320px);
    gap:16px;
    align-items:start;
  }
  .lpb-panel{
    position:relative;
    min-height:280px;
  }
  .lpb-panel-side{
    position:sticky;
    top:96px;
  }
  .lpb-scroller{
    display:grid;
    gap:14px;
    max-height:calc(100vh - 230px);
    overflow:auto;
    padding-right:4px;
  }
  .lpb-scroller::-webkit-scrollbar{
    width:8px;
  }
  .lpb-scroller::-webkit-scrollbar-thumb{
    background:rgba(139,132,117,.28);
    border-radius:999px;
  }
  .lpb-subtle{
    font-size:12px;
    line-height:1.7;
    color:#8b8475;
  }
  .lpb-segment{
    display:flex;
    flex-wrap:wrap;
    gap:8px;
  }
  .lpb-segment button,
  .lpb-mini-btn{
    appearance:none;
    border:1px solid rgba(204,190,163,.9);
    background:#fbf7ef;
    color:#485648;
    border-radius:999px;
    font:700 11px/1 ${BODY_FONT};
    letter-spacing:.02em;
    padding:8px 12px;
    cursor:pointer;
    transition:all .15s ease;
  }
  .lpb-segment button:hover,
  .lpb-mini-btn:hover{
    transform:translateY(-1px);
    border-color:#b09b78;
  }
  .lpb-segment button.is-active{
    background:#1f6b4a;
    color:#fbf7ef;
    border-color:#174c35;
    box-shadow:0 10px 20px rgba(31,107,74,.16);
  }
  .lpb-mini-row{
    display:flex;
    flex-wrap:wrap;
    gap:8px;
    align-items:center;
  }
  .lpb-navigator{
    display:grid;
    gap:12px;
  }
  .lpb-nav-card{
    border:1px solid rgba(204,190,163,.84);
    border-radius:22px;
    padding:14px;
    background:rgba(251,247,239,.9);
    cursor:pointer;
    transition:all .16s ease;
  }
  .lpb-nav-card:hover{
    transform:translateY(-1px);
    border-color:#b09b78;
    box-shadow:0 12px 24px rgba(87,60,27,.08);
  }
  .lpb-nav-card.is-active{
    background:linear-gradient(180deg, rgba(31,107,74,.08) 0%, rgba(244,237,223,.98) 100%);
    border-color:#1f6b4a;
    box-shadow:0 16px 30px rgba(31,107,74,.12);
  }
  .lpb-nav-head{
    display:flex;
    justify-content:space-between;
    gap:10px;
    align-items:flex-start;
    margin-bottom:10px;
  }
  .lpb-nav-title{
    display:grid;
    gap:5px;
  }
  .lpb-order{
    font-size:10px;
    letter-spacing:.18em;
    text-transform:uppercase;
    color:#8b8475;
    font-weight:800;
  }
  .lpb-nav-title strong{
    font-size:15px;
    line-height:1.2;
    color:#1f2a20;
  }
  .lpb-nav-excerpt{
    font-size:12px;
    line-height:1.6;
    color:#485648;
    display:-webkit-box;
    -webkit-line-clamp:2;
    -webkit-box-orient:vertical;
    overflow:hidden;
  }
  .lpb-actions{
    display:flex;
    flex-wrap:wrap;
    gap:6px;
  }
  .lpb-canvas-shell{
    display:grid;
    gap:14px;
  }
  .lpb-canvas-meta{
    display:flex;
    flex-wrap:wrap;
    justify-content:space-between;
    gap:12px;
    align-items:center;
  }
  .lpb-preview-wrap{
    border-radius:30px;
    border:1px solid rgba(204,190,163,.9);
    padding:14px;
    background:
      radial-gradient(circle at top left, rgba(31,107,74,.08), transparent 28%),
      linear-gradient(180deg, rgba(241,232,214,.84) 0%, rgba(251,247,239,.98) 100%);
    box-shadow:0 22px 50px rgba(87,60,27,.08);
  }
  .lpb-preview-window{
    border:1px solid rgba(31,42,32,.08);
    background:#fff;
    border-radius:26px;
    overflow:hidden;
    box-shadow:0 18px 40px rgba(31,42,32,.12);
    transition:width .18s ease, transform .18s ease;
  }
  .lpb-preview-window.is-mobile{
    width:min(392px, 100%);
    margin:0 auto;
  }
  .lpb-preview-window.is-desktop{
    width:100%;
  }
  .lpb-preview-window iframe{
    display:block;
    width:100%;
    height:720px;
    border:0;
    background:#fff;
  }
  .lpb-empty{
    display:grid;
    gap:18px;
    padding:clamp(18px, 3vw, 28px);
    min-height:560px;
    align-content:start;
  }
  .lpb-start{
    border:1px solid rgba(204,190,163,.9);
    border-radius:30px;
    overflow:hidden;
    background:
      radial-gradient(circle at 80% 18%, rgba(31,107,74,.10), transparent 22%),
      linear-gradient(135deg, rgba(251,247,239,.96) 0%, rgba(244,237,223,.98) 100%);
  }
  .lpb-start-hero{
    padding:26px;
    display:grid;
    gap:12px;
  }
  .lpb-start-hero h3{
    margin:0;
    font-family:${DISPLAY_FONT};
    font-size:clamp(30px, 5vw, 48px);
    line-height:.98;
    letter-spacing:-.05em;
    color:#1f2a20;
    max-width:10ch;
  }
  .lpb-start-hero p{
    margin:0;
    color:#485648;
    line-height:1.75;
    max-width:60ch;
    font-size:14px;
  }
  .lpb-start-grid{
    display:grid;
    grid-template-columns:repeat(2, minmax(0, 1fr));
    gap:0;
    border-top:1px solid rgba(204,190,163,.88);
  }
  .lpb-path{
    padding:22px 24px;
    display:grid;
    gap:10px;
  }
  .lpb-path + .lpb-path{
    border-left:1px solid rgba(204,190,163,.88);
  }
  .lpb-path h4,
  .lpb-spotlight h4,
  .lpb-inspector-head h4{
    margin:0;
    font-size:18px;
    line-height:1.15;
    color:#1f2a20;
  }
  .lpb-path p,
  .lpb-spotlight p{
    margin:0;
    color:#485648;
    line-height:1.7;
    font-size:13px;
  }
  .lpb-template-list{
    display:grid;
    gap:12px;
  }
  .lpb-template-card{
    border:1px solid rgba(204,190,163,.84);
    border-radius:24px;
    padding:16px;
    background:#fbf7ef;
    display:grid;
    gap:12px;
  }
  .lpb-template-head{
    display:flex;
    justify-content:space-between;
    gap:12px;
    align-items:flex-start;
  }
  .lpb-template-head strong{
    display:block;
    font-size:16px;
    line-height:1.15;
    color:#1f2a20;
    margin-bottom:6px;
  }
  .lpb-template-art{
    font-size:12px;
    line-height:1.65;
    color:#8b8475;
  }
  .lpb-template-visual{
    border-radius:20px;
    padding:16px;
    color:#fbf7ef;
    min-height:120px;
    display:grid;
    align-content:space-between;
    gap:14px;
    box-shadow:inset 0 0 0 1px rgba(255,255,255,.08);
  }
  .lpb-template-visual strong{
    font-family:${DISPLAY_FONT};
    font-size:24px;
    line-height:.98;
    letter-spacing:-.05em;
  }
  .lpb-template-visual span{
    font-size:11px;
    letter-spacing:.14em;
    text-transform:uppercase;
    opacity:.82;
    font-weight:800;
  }
  .lpb-template-foot{
    display:flex;
    justify-content:space-between;
    gap:10px;
    align-items:center;
    flex-wrap:wrap;
  }
  .lpb-inspector{
    display:grid;
    gap:14px;
  }
  .lpb-inspector-head{
    display:grid;
    gap:6px;
  }
  .lpb-tab-row{
    display:flex;
    flex-wrap:wrap;
    gap:8px;
  }
  .lpb-field{
    display:grid;
    gap:6px;
  }
  .lpb-field label{
    font-size:11px;
    letter-spacing:.16em;
    text-transform:uppercase;
    color:#8b8475;
    font-weight:800;
  }
  .lpb-field input,
  .lpb-field textarea{
    width:100%;
    border:1px solid rgba(204,190,163,.9);
    background:#fbf7ef;
    color:#1f2a20;
    border-radius:18px;
    padding:12px 14px;
    font:500 13px/1.65 ${BODY_FONT};
    outline:none;
    transition:border-color .15s ease, box-shadow .15s ease;
    resize:vertical;
  }
  .lpb-field input:focus,
  .lpb-field textarea:focus{
    border-color:#1f6b4a;
    box-shadow:0 0 0 4px rgba(31,107,74,.10);
  }
  .lpb-field small{
    color:#8b8475;
    line-height:1.6;
  }
  .lpb-split{
    display:grid;
    grid-template-columns:repeat(2, minmax(0, 1fr));
    gap:12px;
  }
  .lpb-stack{
    display:grid;
    gap:12px;
  }
  .lpb-array-card{
    border:1px solid rgba(204,190,163,.84);
    border-radius:20px;
    padding:14px;
    background:rgba(251,247,239,.74);
    display:grid;
    gap:10px;
  }
  .lpb-array-head{
    display:flex;
    justify-content:space-between;
    gap:10px;
    align-items:center;
  }
  .lpb-array-head strong{
    font-size:12px;
    letter-spacing:.12em;
    text-transform:uppercase;
    color:#485648;
  }
  .lpb-style-grid{
    display:grid;
    gap:10px;
  }
  .lpb-style-card{
    width:100%;
    text-align:left;
    border:1px solid rgba(204,190,163,.88);
    background:#fbf7ef;
    border-radius:22px;
    padding:14px;
    cursor:pointer;
    transition:all .15s ease;
  }
  .lpb-style-card:hover{
    transform:translateY(-1px);
    border-color:#b09b78;
  }
  .lpb-style-card.is-active{
    border-color:#1f6b4a;
    background:linear-gradient(180deg, rgba(31,107,74,.08) 0%, rgba(251,247,239,.98) 100%);
    box-shadow:0 14px 28px rgba(31,107,74,.10);
  }
  .lpb-style-card strong{
    display:block;
    margin-bottom:6px;
    font-size:18px;
  }
  .lpb-kv{
    display:grid;
    grid-template-columns:repeat(2, minmax(0, 1fr));
    gap:10px;
  }
  .lpb-kv-item{
    border-radius:18px;
    padding:13px;
    border:1px solid rgba(204,190,163,.82);
    background:rgba(251,247,239,.72);
  }
  .lpb-kv-item span{
    display:block;
    font-size:10px;
    letter-spacing:.16em;
    text-transform:uppercase;
    color:#8b8475;
    font-weight:800;
    margin-bottom:6px;
  }
  .lpb-kv-item strong{
    display:block;
    font-size:18px;
    color:#1f2a20;
    font-family:${DISPLAY_FONT};
    line-height:1;
  }
  .lpb-kv-item p{
    margin:0;
    font-size:12px;
    line-height:1.6;
    color:#485648;
  }
  @media (max-width: 1180px){
    .lpb-grid{
      grid-template-columns:1fr;
    }
    .lpb-panel-side{
      position:relative;
      top:auto;
    }
    .lpb-scroller{
      max-height:none;
      overflow:visible;
      padding-right:0;
    }
  }
  @media (max-width: 760px){
    .lpb-toolbar{
      padding:20px;
    }
    .lpb-start-grid,
    .lpb-split,
    .lpb-kv{
      grid-template-columns:1fr;
    }
    .lpb-path + .lpb-path{
      border-left:0;
      border-top:1px solid rgba(204,190,163,.88);
    }
    .lpb-preview-window iframe{
      height:640px;
    }
  }
`;

function cloneValue(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function createSectionId(type) {
  return `${type}-${Math.random().toString(36).slice(2, 9)}`;
}

function toLines(items = []) {
  return (Array.isArray(items) ? items : []).join("\n");
}

function fromLines(value) {
  return String(value || "")
    .split(/\n+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function getSectionHeadline(section) {
  if (!section) return "";
  switch (section.type) {
    case "hero":
      return section.headline || section.subheadline || "Copy pembuka";
    case "problem":
    case "benefits":
    case "proof":
    case "offer":
    case "faq":
    case "cta":
      return section.title || section.text || "Isi bagian";
    case "footer":
      return section.smallText || section.contactLine || "Catatan penutup";
    default:
      return "Bagian";
  }
}

function getTemplateGradient(template) {
  const stylePreset = getLandingPageStylePreset(template?.page?.stylePreset || template?.stylePreset);
  switch (template?.page?.stylePreset || template?.stylePreset) {
    case "signal":
      return "linear-gradient(140deg, #0f172a 0%, #1d4ed8 56%, #0891b2 100%)";
    case "noir":
      return "linear-gradient(140deg, #20161e 0%, #5f3b53 48%, #8c6b52 100%)";
    default:
      return stylePreset.heroPattern
        ? `${stylePreset.heroPattern}, linear-gradient(140deg, #2d1d13 0%, #7a4b2d 48%, #c68a45 100%)`
        : "linear-gradient(140deg, #2d1d13 0%, #7a4b2d 48%, #c68a45 100%)";
  }
}

function Field({ label, value, onChange, placeholder = "", multiline = false, rows = 4, note = "" }) {
  return (
    <div className="lpb-field">
      <label>{label}</label>
      {multiline ? (
        <textarea
          rows={rows}
          value={value || ""}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <input
          value={value || ""}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
      {note ? <small>{note}</small> : null}
    </div>
  );
}

function MiniButton({ children, onClick, title, disabled = false }) {
  return (
    <button
      type="button"
      className="lpb-mini-btn"
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      title={title}
      disabled={disabled}
      style={{
        opacity: disabled ? 0.4 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
        padding: "7px 10px",
      }}
    >
      {children}
    </button>
  );
}

export default function LandingPageTab({
  brief,
  page,
  project,
  settings,
  advancedMode = false,
  loading,
  onChangeBrief,
  onChangePage,
  onGenerate,
  onApplyTemplate,
  onSave,
  onUseForCampaign,
  onExport,
  C,
  Ic,
  Box,
  Btn,
  Lbl,
  Pill,
  Zero,
}) {
  const uiKitReady = Boolean(Box && Btn && Lbl && Pill && Zero);
  void uiKitReady;
  const normalizedBrief = createLandingPageBrief(brief);
  const sections = getOrderedSections(page);
  const missingBriefFields = getLandingPageMissingBriefFields(normalizedBrief);
  const templateCategories = ["Semua", ...new Set(LANDING_PAGE_TEMPLATE_LIBRARY.map((template) => template.category))];

  const [selectedSectionId, setSelectedSectionId] = useState("");
  const [inspectorTab, setInspectorTab] = useState(page ? "section" : "brief");
  const [device, setDevice] = useState("desktop");
  const [templateCategory, setTemplateCategory] = useState("Semua");
  const [templateSpotlightId, setTemplateSpotlightId] = useState(LANDING_PAGE_TEMPLATE_LIBRARY[0]?.id || "");

  const filteredTemplates = LANDING_PAGE_TEMPLATE_LIBRARY.filter((template) => (
    templateCategory === "Semua" || template.category === templateCategory
  ));
  const spotlightTemplate = filteredTemplates.find((template) => template.id === templateSpotlightId)
    || filteredTemplates[0]
    || LANDING_PAGE_TEMPLATE_LIBRARY[0]
    || null;
  const showToolbarSecondaryActions = Boolean(page);
  const activeSectionId = sections.some((section) => section.id === selectedSectionId)
    ? selectedSectionId
    : (sections[0]?.id || "");
  const activeInspectorTab = !page
    ? "brief"
    : (inspectorTab === "section" && !activeSectionId ? "page" : inspectorTab);
  const selectedSection = sections.find((section) => section.id === activeSectionId) || null;
  const currentStylePreset = getLandingPageStylePreset(page?.stylePreset);

  let previewDoc = "";
  let previewError = "";
  if (page) {
    try {
      previewDoc = renderLandingPageHtml({ ...page, brief: normalizedBrief });
    } catch (err) {
      previewError = err.message || "Preview landing page gagal dirender.";
    }
  }

  function normalizePage(candidate, briefOverride = normalizedBrief) {
    const normalized = validateAndNormalizeLandingPage(candidate, {
      brief: briefOverride,
      framework: candidate?.framework || settings?.framework,
    });
    return {
      ...normalized,
      id: candidate?.id ?? page?.id ?? null,
      projectId: candidate?.projectId ?? page?.projectId ?? project?.id ?? null,
    };
  }

  function createPageDraft(source = page) {
    if (!source) return null;
    return {
      id: source.id ?? null,
      projectId: source.projectId ?? project?.id ?? null,
      pageType: source.pageType,
      framework: source.framework || settings?.framework,
      templateKey: source.templateKey,
      stylePreset: source.stylePreset,
      seo: cloneValue(source.seo || {}),
      sections: cloneValue(source.sections || []),
    };
  }

  function commitPage(candidate, briefOverride = normalizedBrief) {
    if (!candidate) return;
    onChangePage(normalizePage(candidate, briefOverride));
  }

  function mutatePage(mutator, briefOverride = normalizedBrief) {
    const draft = createPageDraft();
    if (!draft) return;
    const next = mutator(draft) || draft;
    commitPage(next, briefOverride);
  }

  function updateBriefField(key, value) {
    const nextBrief = createLandingPageBrief({
      ...normalizedBrief,
      [key]: value,
    });
    onChangeBrief(nextBrief);

    const draft = createPageDraft();
    if (draft) {
      commitPage(draft, nextBrief);
    }
  }

  function updateSelectedSection(mutator) {
    if (!activeSectionId) return;
    mutatePage((draft) => {
      const sectionIndex = draft.sections.findIndex((section) => section.id === activeSectionId);
      if (sectionIndex === -1) return draft;
      const nextSection = cloneValue(draft.sections[sectionIndex]);
      draft.sections[sectionIndex] = mutator(nextSection, sectionIndex, draft.sections) || nextSection;
      return draft;
    });
  }

  function updateSectionField(field, value) {
    updateSelectedSection((section) => {
      section[field] = value;
      return section;
    });
  }

  function updateSectionListField(field, rawValue) {
    updateSelectedSection((section) => {
      section[field] = fromLines(rawValue);
      return section;
    });
  }

  function updateSectionObjectItem(field, index, key, value) {
    updateSelectedSection((section) => {
      const items = cloneValue(section[field] || []);
      items[index] = {
        ...(items[index] || {}),
        [key]: value,
      };
      section[field] = items;
      return section;
    });
  }

  function addSectionObjectItem(field, seed) {
    updateSelectedSection((section) => {
      const items = cloneValue(section[field] || []);
      items.push(seed);
      section[field] = items;
      return section;
    });
  }

  function removeSectionObjectItem(field, index) {
    updateSelectedSection((section) => {
      const items = cloneValue(section[field] || []);
      items.splice(index, 1);
      section[field] = items;
      return section;
    });
  }

  function moveSelectedSection(delta) {
    if (!activeSectionId) return;
    mutatePage((draft) => {
      const fromIndex = draft.sections.findIndex((section) => section.id === activeSectionId);
      const toIndex = fromIndex + delta;
      if (fromIndex === -1 || toIndex < 0 || toIndex >= draft.sections.length) return draft;
      const [section] = draft.sections.splice(fromIndex, 1);
      draft.sections.splice(toIndex, 0, section);
      return draft;
    });
  }

  function duplicateSelectedSection() {
    if (!selectedSection) return;
    const nextSectionId = createSectionId(selectedSection.type);
    mutatePage((draft) => {
      const index = draft.sections.findIndex((section) => section.id === selectedSection.id);
      if (index === -1) return draft;
      const copy = cloneValue(draft.sections[index]);
      copy.id = nextSectionId;
      draft.sections.splice(index + 1, 0, copy);
      return draft;
    });
    setSelectedSectionId(nextSectionId);
  }

  function toggleSelectedSectionVisibility() {
    updateSelectedSection((section) => {
      section.hidden = !section.hidden;
      return section;
    });
  }

  function removeSelectedSection() {
    if (!selectedSection) return;
    const sameTypeCount = sections.filter((section) => section.type === selectedSection.type).length;
    if (sameTypeCount <= 1) return;
    mutatePage((draft) => {
      const index = draft.sections.findIndex((section) => section.id === selectedSection.id);
      if (index === -1) return draft;
      draft.sections.splice(index, 1);
      return draft;
    });
    setSelectedSectionId("");
  }

  function updateSeoField(key, value) {
    mutatePage((draft) => {
      draft.seo = {
        ...(draft.seo || {}),
        [key]: value,
      };
      return draft;
    });
  }

  function updateStylePreset(stylePreset) {
    mutatePage((draft) => {
      draft.stylePreset = stylePreset;
      return draft;
    });
  }

  function onTemplateAction(templateId) {
    setTemplateSpotlightId(templateId);
    setInspectorTab("brief");
    onApplyTemplate(templateId);
  }

  function renderTemplateCard(template, compact = false) {
    return (
      <div key={template.id} className="lpb-template-card">
        <div className="lpb-template-head">
          <div>
            <strong>{template.label}</strong>
            <div className="lpb-subtle" style={{ color: C.muted }}>{template.summary}</div>
          </div>
          <div className="lpb-mini-row">
            <Pill ch={template.category} color={C.cyan} sm />
            <Pill ch={template.framework} color={C.orange} sm />
          </div>
        </div>
        <div
          className="lpb-template-visual"
          style={{
            background: getTemplateGradient(template),
            fontFamily: getLandingPageStylePreset(template.stylePreset).displayFont,
          }}
        >
          <span>{template.artDirection}</span>
          <strong>{template.page.sections.find((section) => section.type === "hero")?.headline || template.label}</strong>
        </div>
        <div className="lpb-template-art">{template.artDirection}</div>
        <div className="lpb-template-foot">
          <div className="lpb-subtle" style={{ color: C.dim }}>
            {template.page.sections.length} section siap edit · style {getLandingPageStylePreset(template.stylePreset).label}
          </div>
          <Btn
            ch={<><span style={{ display: "inline-flex" }}>{Ic.layers({ size: 13 })}</span> Gunakan</>}
            onClick={() => onTemplateAction(template.id)}
            size={compact ? "sm" : "md"}
          />
        </div>
      </div>
    );
  }

  function renderBriefInspector() {
    return (
      <div className="lpb-stack">
        <div className="lpb-inspector-head">
          <Lbl ch="Brief Halaman" color={C.muted} />
          <h4 style={{ fontFamily: DISPLAY_FONT }}>Isi bahan utama halaman jualanmu.</h4>
          <div className="lpb-subtle">
            Isi di sini dipakai untuk generate halaman lewat AI, menerapkan template, dan menyamakan isi preview dengan hasil yang akan disimpan.
          </div>
        </div>
        {!!missingBriefFields.length && (
          <div style={{ padding: "12px 14px", borderRadius: 18, background: `${C.orange}10`, border: `1px solid ${C.orange}28`, color: C.orange, fontSize: 12, lineHeight: 1.7 }}>
            Masih ada {missingBriefFields.length} field wajib kosong: {LANDING_PAGE_BRIEF_FIELDS.filter((field) => missingBriefFields.includes(field.key)).map((field) => field.label).join(", ")}.
          </div>
        )}
        {LANDING_PAGE_BRIEF_FIELDS.map((field) => (
          <Field
            key={field.key}
            label={field.label}
            value={normalizedBrief[field.key]}
            placeholder={field.placeholder}
            multiline={field.multiline}
            rows={field.rows}
            note={field.required ? "Wajib diisi kalau kamu ingin halaman dibuat otomatis oleh AI." : ""}
            onChange={(value) => updateBriefField(field.key, value)}
          />
        ))}
      </div>
    );
  }

  function renderPageInspector() {
    return (
      <div className="lpb-stack">
        <div className="lpb-inspector-head">
          <Lbl ch="Pengaturan Halaman" color={C.muted} />
          <h4 style={{ fontFamily: DISPLAY_FONT }}>Atur tampilan umum dan data dasar halaman.</h4>
          <div className="lpb-subtle">
            Preset visual hanya mengubah rasa tampilannya. Struktur halaman dan isi utamanya tetap aman.
          </div>
        </div>

        <div className="lpb-kv">
          <div className="lpb-kv-item">
            <span>Framework halaman</span>
            <strong>{page?.framework || settings.framework}</strong>
            <p>Ini mesin struktur yang dipakai di belakang layar.</p>
          </div>
          <div className="lpb-kv-item">
            <span>Project</span>
            <strong>{project?.name || "Session"}</strong>
            <p>{project ? "Siap disimpan ke project aktif." : "Masih berjalan sebagai sesi sementara."}</p>
          </div>
        </div>

        <Field
          label="Judul browser"
          value={page?.seo?.title || ""}
          placeholder="Judul halaman yang muncul di tab browser"
          onChange={(value) => updateSeoField("title", value)}
        />
        <Field
          label="Deskripsi singkat"
          value={page?.seo?.description || ""}
          placeholder="Ringkasan halaman untuk preview mesin pencari atau share link"
          multiline
          rows={3}
          onChange={(value) => updateSeoField("description", value)}
        />

        <div className="lpb-stack">
          <Lbl ch="Pilihan Gaya Cepat" color={C.muted} />
          <div className="lpb-style-grid">
            {Object.entries(LANDING_PAGE_STYLE_PRESETS).map(([stylePreset, config]) => {
              const active = page?.stylePreset === stylePreset;
              return (
                <button
                  key={stylePreset}
                  type="button"
                  className={`lpb-style-card${active ? " is-active" : ""}`}
                  onClick={() => updateStylePreset(stylePreset)}
                >
                  <strong style={{ fontFamily: config.displayFont }}>{config.label}</strong>
                  <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.7, marginBottom: 10 }}>{STYLE_NOTES[stylePreset]}</div>
                  <div className="lpb-mini-row">
                    <Pill ch={config.radius} color={active ? C.accent : C.hi} sm />
                    <Pill ch={config.bodyFont.split(",")[0].replace(/'/g, "")} color={C.cyan} sm />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  function renderSectionInspector() {
    if (!selectedSection) {
      return (
        <Zero
          icon={Ic.layers}
          title="Pilih Section"
          sub="Klik salah satu section di navigator kiri untuk mengedit copy, CTA, urutan, atau visibility."
        />
      );
    }

    const sameTypeCount = sections.filter((section) => section.type === selectedSection.type).length;

    return (
      <div className="lpb-stack">
        <div className="lpb-inspector-head">
          <Lbl ch={LANDING_PAGE_SECTION_LABELS[selectedSection.type] || selectedSection.type} color={C.muted} />
          <h4 style={{ fontFamily: DISPLAY_FONT }}>{getSectionHeadline(selectedSection)}</h4>
          <div className="lpb-mini-row">
            <Pill ch={`ID ${selectedSection.id}`} color={C.hi} sm />
            <Pill ch={selectedSection.hidden ? "Disembunyikan" : "Tampil"} color={selectedSection.hidden ? C.orange : C.accent} sm />
          </div>
        </div>

        <div className="lpb-mini-row">
          <MiniButton title="Pindah ke atas" onClick={() => moveSelectedSection(-1)}>
            <span style={{ display: "inline-flex" }}>{Ic.chevronR({ size: 12, color: C.text, style: { transform: "rotate(-90deg)" } })}</span>
          </MiniButton>
          <MiniButton title="Pindah ke bawah" onClick={() => moveSelectedSection(1)}>
            <span style={{ display: "inline-flex" }}>{Ic.chevronR({ size: 12, color: C.text, style: { transform: "rotate(90deg)" } })}</span>
          </MiniButton>
          <MiniButton title="Duplikat section" onClick={duplicateSelectedSection}>
            <span style={{ display: "inline-flex" }}>{Ic.copy({ size: 12, color: C.text })}</span>
          </MiniButton>
          <MiniButton title={selectedSection.hidden ? "Tampilkan section" : "Sembunyikan section"} onClick={toggleSelectedSectionVisibility}>
            <span style={{ display: "inline-flex" }}>
              {selectedSection.hidden ? Ic.eye({ size: 12, color: C.text }) : Ic.ban({ size: 12, color: C.text })}
            </span>
          </MiniButton>
          <MiniButton title="Hapus duplicate ini" onClick={removeSelectedSection} disabled={sameTypeCount <= 1}>
            <span style={{ display: "inline-flex" }}>{Ic.trash({ size: 12, color: sameTypeCount <= 1 ? C.dim : C.red })}</span>
          </MiniButton>
        </div>

        {selectedSection.type === "hero" && (
          <>
            <Field label="Label kecil" value={selectedSection.badge} onChange={(value) => updateSectionField("badge", value)} />
            <Field label="Headline" value={selectedSection.headline} multiline rows={3} onChange={(value) => updateSectionField("headline", value)} />
            <Field label="Subheadline" value={selectedSection.subheadline} multiline rows={4} onChange={(value) => updateSectionField("subheadline", value)} />
            <div className="lpb-split">
              <Field label="Teks CTA utama" value={selectedSection.primaryCtaText} onChange={(value) => updateSectionField("primaryCtaText", value)} />
              <Field label="Link CTA utama" value={selectedSection.primaryCtaHref} onChange={(value) => updateSectionField("primaryCtaHref", value)} />
            </div>
            <div className="lpb-split">
              <Field label="Teks CTA kedua" value={selectedSection.secondaryCtaText} onChange={(value) => updateSectionField("secondaryCtaText", value)} />
              <Field label="Link CTA kedua" value={selectedSection.secondaryCtaHref} onChange={(value) => updateSectionField("secondaryCtaHref", value)} />
            </div>
            <Field
              label="Poin sorotan"
              value={toLines(selectedSection.highlightBullets)}
              multiline
              rows={5}
              note="Satu bullet per baris."
              onChange={(value) => updateSectionListField("highlightBullets", value)}
            />
          </>
        )}

        {selectedSection.type === "problem" && (
          <>
            <Field label="Judul" value={selectedSection.title} onChange={(value) => updateSectionField("title", value)} />
            <Field label="Intro" value={selectedSection.intro} multiline rows={4} onChange={(value) => updateSectionField("intro", value)} />
            <Field
              label="Daftar masalah"
              value={toLines(selectedSection.painPoints)}
              multiline
              rows={6}
              note="Satu pain point per baris."
              onChange={(value) => updateSectionListField("painPoints", value)}
            />
          </>
        )}

        {selectedSection.type === "benefits" && (
          <>
            <Field label="Judul" value={selectedSection.title} onChange={(value) => updateSectionField("title", value)} />
            <div className="lpb-stack">
              {(selectedSection.items || []).map((item, index) => (
                <div key={`${selectedSection.id}-benefit-${index}`} className="lpb-array-card">
                  <div className="lpb-array-head">
                    <strong>Benefit {index + 1}</strong>
                    <MiniButton title="Hapus benefit" onClick={() => removeSectionObjectItem("items", index)}>
                      <span style={{ display: "inline-flex" }}>{Ic.trash({ size: 12, color: C.red })}</span>
                    </MiniButton>
                  </div>
                  <Field label="Judul" value={item.title} onChange={(value) => updateSectionObjectItem("items", index, "title", value)} />
                  <Field label="Deskripsi" value={item.description} multiline rows={3} onChange={(value) => updateSectionObjectItem("items", index, "description", value)} />
                </div>
              ))}
              <Btn
                ch={<><span style={{ display: "inline-flex" }}>{Ic.plus({ size: 12 })}</span> Tambah Benefit</>}
                v="s"
                size="sm"
                onClick={() => addSectionObjectItem("items", { title: "Benefit baru", description: "Tulis hasil spesifik yang ingin kamu tonjolkan." })}
              />
            </div>
          </>
        )}

        {selectedSection.type === "proof" && (
          <>
            <Field label="Judul" value={selectedSection.title} onChange={(value) => updateSectionField("title", value)} />
            <Field label="Intro" value={selectedSection.intro} multiline rows={4} onChange={(value) => updateSectionField("intro", value)} />
            <div className="lpb-stack">
              {(selectedSection.testimonials || []).map((item, index) => (
                <div key={`${selectedSection.id}-proof-${index}`} className="lpb-array-card">
                  <div className="lpb-array-head">
                    <strong>Testimoni {index + 1}</strong>
                    <MiniButton title="Hapus testimoni" onClick={() => removeSectionObjectItem("testimonials", index)}>
                      <span style={{ display: "inline-flex" }}>{Ic.trash({ size: 12, color: C.red })}</span>
                    </MiniButton>
                  </div>
                  <div className="lpb-split">
                    <Field label="Nama" value={item.name} onChange={(value) => updateSectionObjectItem("testimonials", index, "name", value)} />
                    <Field label="Peran" value={item.role} onChange={(value) => updateSectionObjectItem("testimonials", index, "role", value)} />
                  </div>
                  <Field label="Testimoni" value={item.quote} multiline rows={4} onChange={(value) => updateSectionObjectItem("testimonials", index, "quote", value)} />
                </div>
              ))}
              <Btn
                ch={<><span style={{ display: "inline-flex" }}>{Ic.plus({ size: 12 })}</span> Tambah Testimoni</>}
                v="s"
                size="sm"
                onClick={() => addSectionObjectItem("testimonials", { name: "Nama", role: "Role", quote: "Isi kutipan testimoni di sini." })}
              />
            </div>
          </>
        )}

        {selectedSection.type === "offer" && (
          <>
            <Field label="Judul" value={selectedSection.title} multiline rows={3} onChange={(value) => updateSectionField("title", value)} />
            <div className="lpb-split">
              <Field label="Label harga" value={selectedSection.priceLabel} onChange={(value) => updateSectionField("priceLabel", value)} />
              <Field label="Isi harga" value={selectedSection.priceValue} onChange={(value) => updateSectionField("priceValue", value)} />
            </div>
            <Field label="Jaminan" value={selectedSection.guarantee} multiline rows={3} onChange={(value) => updateSectionField("guarantee", value)} />
            <Field
              label="Bonus / value stack"
              value={toLines(selectedSection.bonuses)}
              multiline
              rows={6}
              note="Satu item per baris."
              onChange={(value) => updateSectionListField("bonuses", value)}
            />
            <div className="lpb-split">
              <Field label="Teks CTA" value={selectedSection.ctaText} onChange={(value) => updateSectionField("ctaText", value)} />
              <Field label="Link CTA" value={selectedSection.ctaHref} onChange={(value) => updateSectionField("ctaHref", value)} />
            </div>
          </>
        )}

        {selectedSection.type === "faq" && (
          <>
            <Field label="Judul" value={selectedSection.title} onChange={(value) => updateSectionField("title", value)} />
            <div className="lpb-stack">
              {(selectedSection.items || []).map((item, index) => (
                <div key={`${selectedSection.id}-faq-${index}`} className="lpb-array-card">
                  <div className="lpb-array-head">
                    <strong>FAQ {index + 1}</strong>
                    <MiniButton title="Hapus FAQ" onClick={() => removeSectionObjectItem("items", index)}>
                      <span style={{ display: "inline-flex" }}>{Ic.trash({ size: 12, color: C.red })}</span>
                    </MiniButton>
                  </div>
                  <Field label="Pertanyaan" value={item.question} onChange={(value) => updateSectionObjectItem("items", index, "question", value)} />
                  <Field label="Jawaban" value={item.answer} multiline rows={4} onChange={(value) => updateSectionObjectItem("items", index, "answer", value)} />
                </div>
              ))}
              <Btn
                ch={<><span style={{ display: "inline-flex" }}>{Ic.plus({ size: 12 })}</span> Tambah FAQ</>}
                v="s"
                size="sm"
                onClick={() => addSectionObjectItem("items", { question: "Pertanyaan baru", answer: "Tulis jawaban yang menenangkan objection." })}
              />
            </div>
          </>
        )}

        {selectedSection.type === "cta" && (
          <>
            <Field label="Judul" value={selectedSection.title} multiline rows={3} onChange={(value) => updateSectionField("title", value)} />
            <Field label="Isi" value={selectedSection.text} multiline rows={4} onChange={(value) => updateSectionField("text", value)} />
            <div className="lpb-split">
              <Field label="Teks CTA" value={selectedSection.ctaText} onChange={(value) => updateSectionField("ctaText", value)} />
              <Field label="Link CTA" value={selectedSection.ctaHref} onChange={(value) => updateSectionField("ctaHref", value)} />
            </div>
          </>
        )}

        {selectedSection.type === "footer" && (
          <>
            <Field label="Teks kecil" value={selectedSection.smallText} multiline rows={4} onChange={(value) => updateSectionField("smallText", value)} />
            <Field label="Baris kontak" value={selectedSection.contactLine} multiline rows={3} onChange={(value) => updateSectionField("contactLine", value)} />
          </>
        )}
      </div>
    );
  }

  return (
    <div className="lpb-root">
      <style>{landingTabCss}</style>

      <div className="lpb-toolbar">
        <div className="lpb-toolbar-copy">
          <div className="lpb-mini-row" style={{ marginBottom: 10 }}>
            <Pill ch={page ? "Halaman siap dirapikan" : "Builder halaman siap"} color={page ? C.accent : C.orange} />
            {advancedMode && <Pill ch={`Framework ${page?.framework || settings.framework}`} color={C.blue} />}
            <Pill ch={project?.name || "Sesi sementara"} color={project ? C.cyan : C.purple} />
          </div>
          <h2>{page ? "Rapikan halaman jualanmu dari satu meja kerja." : "Mulai dari brief atau template, lalu susun halaman pertama tanpa ribet."}</h2>
          <p>
            Mau mulai dari AI atau template, hasilnya tetap bisa kamu edit, simpan, dan pakai ke campaign tanpa pindah alur kerja.
          </p>
        </div>

        <div className="lpb-toolbar-actions">
          <Btn
            ch={<><span style={{ display: "inline-flex" }}>{Ic.zap({ size: 13 })}</span> Susun dengan AI</>}
            onClick={onGenerate}
            loading={loading}
            disabled={missingBriefFields.length > 0}
          />
          {!page && !advancedMode && spotlightTemplate && (
            <Btn
              ch={<><span style={{ display: "inline-flex" }}>{Ic.layers({ size: 13 })}</span> Pakai Template Pilihan</>}
              onClick={() => onTemplateAction(spotlightTemplate.id)}
              v="s"
            />
          )}
          {showToolbarSecondaryActions && (
            <>
              <Btn
                ch={<><span style={{ display: "inline-flex" }}>{Ic.save({ size: 13 })}</span> Simpan</>}
                onClick={onSave}
                v="s"
                disabled={!project}
              />
              <Btn
                ch={<><span style={{ display: "inline-flex" }}>{Ic.arrowR({ size: 13 })}</span> Pakai Halaman Ini</>}
                onClick={onUseForCampaign}
                v="s"
              />
              {advancedMode && (
                <Btn
                  ch={<><span style={{ display: "inline-flex" }}>{Ic.download({ size: 13 })}</span> Export HTML</>}
                  onClick={onExport}
                  v="s"
                />
              )}
            </>
          )}
        </div>
      </div>

      <div className="lpb-grid">
        <Box cls="lpb-panel lpb-panel-side" style={{ padding: 18 }}>
          <div className="lpb-scroller">
            <div>
              <Lbl ch={page ? "Navigator Halaman" : "Galeri Template"} color={C.muted} />
              <div style={{ fontSize: 20, fontFamily: DISPLAY_FONT, letterSpacing: -.4, color: C.text, marginBottom: 8 }}>
                {page ? "Atur alur halaman dari panel kiri." : "Pilih template kalau ingin mulai lebih cepat."}
              </div>
              <div className="lpb-subtle">
                {page
                  ? "Pilih satu bagian untuk mengubah isi, menyembunyikan bagian, atau memindahkan urutannya tanpa kehilangan konteks."
                  : "Semua template di bawah bisa langsung dipakai lalu diedit. Cocok kalau kamu belum ingin mulai dari brief kosong."}
              </div>
            </div>

            {!page && (
              <div className="lpb-segment">
                {templateCategories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    className={templateCategory === category ? "is-active" : ""}
                    onClick={() => {
                      setTemplateCategory(category);
                      setTemplateSpotlightId("");
                    }}
                  >
                    {category}
                  </button>
                ))}
              </div>
            )}

            {page ? (
              <div className="lpb-navigator">
                {sections.map((section, index) => (
                  <div
                    key={section.id}
                    className={`lpb-nav-card${activeSectionId === section.id ? " is-active" : ""}`}
                    onClick={() => {
                      setSelectedSectionId(section.id);
                      setInspectorTab("section");
                    }}
                  >
                    <div className="lpb-nav-head">
                      <div className="lpb-nav-title">
                        <div className="lpb-order">Bagian {index + 1}</div>
                        <strong>{LANDING_PAGE_SECTION_LABELS[section.type] || section.type}</strong>
                      </div>
                      <div className="lpb-mini-row">
                        {section.hidden ? <Pill ch="Disembunyikan" color={C.orange} sm /> : <Pill ch="Tampil" color={C.accent} sm />}
                      </div>
                    </div>
                    <div className="lpb-nav-excerpt">{getSectionHeadline(section)}</div>
                  </div>
                ))}

                <div style={{ paddingTop: 2 }}>
                  <Lbl ch="Ganti Template Cepat" color={C.muted} />
                  <div className="lpb-template-list">
                    {LANDING_PAGE_TEMPLATE_LIBRARY.slice(0, 3).map((template) => renderTemplateCard(template, true))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="lpb-template-list">
                {filteredTemplates.map((template) => renderTemplateCard(template))}
              </div>
            )}
          </div>
        </Box>

        <div className="lpb-canvas-shell">
          <Box cls="lpb-panel" style={{ padding: 18 }}>
            {page ? (
              <div className="lpb-scroller">
                <div className="lpb-canvas-meta">
                  <div>
                    <Lbl ch="Preview Halaman" color={C.muted} />
                    <div style={{ fontSize: 20, fontFamily: DISPLAY_FONT, color: C.text, letterSpacing: -.4, marginBottom: 6 }}>
                      {page.seo?.title || normalizedBrief.productName || "Preview halaman jualan"}
                    </div>
                    <div className="lpb-subtle">
                      Preview ini memakai HTML yang sama dengan hasil export, jadi tampilannya hampir final.
                    </div>
                  </div>
                  <div className="lpb-segment">
                    <button type="button" className={device === "desktop" ? "is-active" : ""} onClick={() => setDevice("desktop")}>
                      Layar lebar
                    </button>
                    <button type="button" className={device === "mobile" ? "is-active" : ""} onClick={() => setDevice("mobile")}>
                      Ponsel
                    </button>
                  </div>
                </div>

                <div className="lpb-preview-wrap">
                  {previewError ? (
                    <div style={{ padding: 20, borderRadius: 20, background: `${C.red}10`, border: `1px solid ${C.red}28`, color: C.red, fontSize: 13, lineHeight: 1.7 }}>
                      {previewError}
                    </div>
                  ) : (
                    <div className={`lpb-preview-window ${device === "mobile" ? "is-mobile" : "is-desktop"}`}>
                      <iframe
                        title="Landing page preview"
                        srcDoc={previewDoc}
                        sandbox="allow-same-origin allow-popups allow-forms"
                      />
                    </div>
                  )}
                </div>

                <div className="lpb-kv">
                  <div className="lpb-kv-item">
                    <span>Bagian yang tampil</span>
                    <strong>{sections.filter((section) => !section.hidden).length}</strong>
                    <p>Jumlah bagian yang ikut muncul di preview dan file export.</p>
                  </div>
                  <div className="lpb-kv-item">
                    <span>Gaya aktif</span>
                    <strong>{currentStylePreset.label}</strong>
                    <p>{STYLE_NOTES[page.stylePreset] || "Preset visual aktif untuk preview dan export."}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="lpb-empty">
                <div className="lpb-start">
                  <div className="lpb-start-hero">
                    <div className="lpb-mini-row">
                      <Pill ch="Jalur 1" color={C.accent} />
                      <Pill ch="Jalur 2" color={C.orange} />
                    </div>
                    <h3>Pilih jalur tercepat untuk mulai bikin halaman.</h3>
                    <p>
                      Kamu bisa mulai dari brief yang sudah ada, atau langsung pakai template kalau ingin landing page dasar yang cepat diedit.
                    </p>
                  </div>
                  <div className="lpb-start-grid">
                    <div className="lpb-path">
                      <Pill ch="Buat dengan AI" color={C.accent} sm />
                      <h4>Susun halaman dari brief yang sudah ada.</h4>
                      <p>
                        Cocok kalau arah produk, target pasar, dan CTA utamanya sudah cukup jelas, lalu kamu ingin AI menyusun draft yang lebih utuh.
                      </p>
                      <div>
                        <Btn
                          ch={<><span style={{ display: "inline-flex" }}>{Ic.zap({ size: 13 })}</span> Buat Halaman</>}
                          onClick={onGenerate}
                          loading={loading}
                          disabled={missingBriefFields.length > 0}
                        />
                      </div>
                    </div>
                    <div className="lpb-path">
                      <Pill ch="Galeri Template" color={C.orange} sm />
                      <h4>Mulai dari contoh, lalu ganti isinya.</h4>
                      <p>
                        Cocok kalau kamu ingin struktur cepat tanpa generate dulu. Template memberi fondasi halaman yang tinggal kamu sesuaikan.
                      </p>
                      <div>
                        <Btn
                          ch={<><span style={{ display: "inline-flex" }}>{Ic.layers({ size: 13 })}</span> Pakai Template</>}
                          onClick={() => spotlightTemplate && onTemplateAction(spotlightTemplate.id)}
                          v="s"
                          disabled={!spotlightTemplate}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {spotlightTemplate && advancedMode && (
                  <div className="lpb-spotlight">
                    <Lbl ch="Template Pilihan" color={C.muted} />
                    <div style={{ fontSize: 24, fontFamily: DISPLAY_FONT, color: C.text, letterSpacing: -.5, marginBottom: 8 }}>
                      {spotlightTemplate.label}
                    </div>
                    <p style={{ marginBottom: 14 }}>
                      {spotlightTemplate.summary} Template ini memakai framework {spotlightTemplate.framework} dan gaya {getLandingPageStylePreset(spotlightTemplate.stylePreset).label}.
                    </p>
                    <div className="lpb-template-card">
                      <div
                        className="lpb-template-visual"
                        style={{
                          background: getTemplateGradient(spotlightTemplate),
                          fontFamily: getLandingPageStylePreset(spotlightTemplate.stylePreset).displayFont,
                        }}
                      >
                        <span>{spotlightTemplate.category}</span>
                        <strong>{spotlightTemplate.page.sections.find((section) => section.type === "hero")?.headline || spotlightTemplate.label}</strong>
                      </div>
                      <div className="lpb-template-foot">
                        <div className="lpb-subtle">{spotlightTemplate.artDirection}</div>
                        <Btn
                          ch={<><span style={{ display: "inline-flex" }}>{Ic.arrowR({ size: 13 })}</span> Buka di Builder</>}
                          onClick={() => onTemplateAction(spotlightTemplate.id)}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Box>
        </div>

        <Box cls="lpb-panel lpb-panel-side" style={{ padding: 18 }}>
          <div className="lpb-scroller">
            <div className="lpb-inspector">
              <div className="lpb-inspector-head">
                <Lbl ch="Inspector" color={C.muted} />
                <h4 style={{ fontFamily: DISPLAY_FONT }}>
                  {activeInspectorTab === "brief"
                    ? "Editor brief"
                    : activeInspectorTab === "page"
                      ? "Pengaturan halaman"
                      : "Editor bagian"}
                </h4>
                <div className="lpb-subtle">
                  Rapikan isi utama di Brief, atur setting umum di Halaman, lalu edit detail tiap bagian di Bagian.
                </div>
              </div>

              <div className="lpb-tab-row">
                <button type="button" className={activeInspectorTab === "brief" ? "is-active" : ""} onClick={() => setInspectorTab("brief")}>
                  Brief
                </button>
                <button type="button" className={activeInspectorTab === "page" ? "is-active" : ""} onClick={() => setInspectorTab("page")} disabled={!page}>
                  Halaman
                </button>
                <button type="button" className={activeInspectorTab === "section" ? "is-active" : ""} onClick={() => setInspectorTab("section")} disabled={!page}>
                  Bagian
                </button>
              </div>

              {activeInspectorTab === "brief" && renderBriefInspector()}
              {activeInspectorTab === "page" && page && renderPageInspector()}
              {activeInspectorTab === "section" && page && renderSectionInspector()}
              {activeInspectorTab !== "brief" && !page && (
                <Zero
                  icon={Ic.edit}
                  title="Halaman belum dibuat"
                  sub="Pakai template atau buat dari brief dulu. Setelah itu panel ini otomatis berubah jadi pengaturan halaman dan editor section."
                />
              )}
            </div>
          </div>
        </Box>
      </div>
    </div>
  );
}
