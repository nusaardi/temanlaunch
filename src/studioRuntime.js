import {
  buildAnalysisFromBrief,
  buildAnalysisFromPage,
  buildLandingPagePrompt,
  createLandingPageBrief,
  validateAndNormalizeLandingPage,
} from "../shared/landingPage.js";
import { instantiateLandingPageTemplate } from "../shared/landingPageTemplates.js";

export function createStudioRuntime({
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
}) {
  const refreshUsage = () => refreshUsageData(project?.id || null);
  const pickRuntimeSettings = (override) => override || settings;
  const pickRuntimeFmt = (override) => override || fmt;

  const resetCreativeState = () => {
    setAudiences([]);
    setAngles([]);
    setAnglesCache({});
    setSelAud(null);
    setSelAng(null);
    setCopy("");
  };

  const persistAnalysis = (nextAnalysis) => {
    if (!project || !token || !nextAnalysis) return;
    fetch(`${API_BASE}/api/projects/${project.id}`, {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify({ analysis: nextAnalysis }),
    }).catch(() => { });
  };

  const persistAudiences = (nextAudiences) => {
    if (!project || !token || !Array.isArray(nextAudiences)) return;
    fetch(`${API_BASE}/api/projects/${project.id}/audiences`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ data: nextAudiences }),
    }).catch(() => { });
  };

  const persistAngles = (nextAngles, audienceIdx) => {
    if (!project || !token || !Array.isArray(nextAngles) || audienceIdx == null || audienceIdx < 0) return;
    fetch(`${API_BASE}/api/projects/${project.id}/angles`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ data: nextAngles, audienceIdx }),
    }).catch(() => { });
  };

  const pushGeneratedCopy = async ({ resultCopy, audience, angle, runtimeFmt, runtimeSettings }) => {
    const activeFmt = pickRuntimeFmt(runtimeFmt);
    const activeSettings = pickRuntimeSettings(runtimeSettings);
    const tempId = Date.now();
    setHistory((current) => [{
      id: tempId,
      audience: audience?.nama || "?",
      angle: angle?.teknik || "?",
      fmt: activeFmt,
      framework: activeSettings.framework,
      copy: resultCopy,
      is_used: false,
      time: new Date().toLocaleString("id-ID"),
    }, ...current]);
    const dbId = await saveCopyToDB(resultCopy, audience, angle);
    if (dbId) {
      setHistory((current) => current.map((item) => item.id === tempId ? { ...item, id: dbId } : item));
    }
  };

  const generateAudienceList = async ({ nextAnalysis, runId, requestLabel, meta, runtimeSettings }) => {
    const activeSettings = pickRuntimeSettings(runtimeSettings);
    const rawAudience = await callClaude([{ role: "user", content: P_AUDIENCE(nextAnalysis, activeSettings) }], {
      maxTokens: 3000,
      taskType: "generate_audience",
      projectId: project?.id || null,
      runId,
      requestLabel,
      meta,
    });
    const parsedAudience = parseJSON(rawAudience);
    return Array.isArray(parsedAudience) ? parsedAudience : [];
  };

  const generateAngleList = async ({ nextAnalysis, audience, runId, requestLabel, meta, runtimeSettings }) => {
    const activeSettings = pickRuntimeSettings(runtimeSettings);
    const rawAngles = await callClaude([{ role: "user", content: P_ANGLE(nextAnalysis, audience, activeSettings) }], {
      maxTokens: 4500,
      taskType: "generate_angle",
      projectId: project?.id || null,
      runId,
      requestLabel,
      meta,
    });
    const parsedAngles = parseJSON(rawAngles);
    return Array.isArray(parsedAngles) ? parsedAngles : [];
  };

  const generateCopyText = async ({ nextAnalysis, audience, angle, notes = "", runId, requestLabel, meta, runtimeFmt, runtimeSettings }) => {
    const activeFmt = pickRuntimeFmt(runtimeFmt);
    const activeSettings = pickRuntimeSettings(runtimeSettings);
    const rawCopy = await callClaude([{ role: "user", content: P_COPY(nextAnalysis, audience, angle, activeFmt, notes, activeSettings) }], {
      maxTokens: 2000,
      taskType: "generate_copy",
      projectId: project?.id || null,
      runId,
      requestLabel,
      meta,
    });
    return rawCopy.trim();
  };

  const runWizardFlow = async ({ sourceMode, initialSetup, resolveAnalysis, runtimeSettings = null, runtimeFmt = null }) => {
    const activeSettings = pickRuntimeSettings(runtimeSettings);
    const activeFmt = pickRuntimeFmt(runtimeFmt);
    await initialSetup();
    resetWizardFlow(sourceMode);
    updateWizardProgress("analysis", "active", { sourceMode, phase: "process", reset: true });

    const parsedAnalysis = await resolveAnalysis();
    setAnalysis(parsedAnalysis);
    resetCreativeState();
    persistAnalysis(parsedAnalysis);
    updateWizardProgress("analysis", "done", { sourceMode, phase: "process" });

    updateWizardProgress("audience", "active", { sourceMode, phase: "process" });
    const audienceRunId = await resolveUsageRunId({
      fresh: sourceMode === "brief",
      runType: "campaign_cycle",
      label: parsedAnalysis?.produk
        ? sourceMode === "brief"
          ? `Wizard brief · ${parsedAnalysis.produk}`
          : `Wizard · ${parsedAnalysis.produk}`
        : sourceMode === "brief"
          ? "Wizard brief cycle"
          : "Wizard campaign cycle",
      meta: { stage: "audience", source: sourceMode === "brief" ? "wizard_brief" : "wizard_url" },
    });
    const audienceList = await generateAudienceList({
      nextAnalysis: parsedAnalysis,
      runId: audienceRunId,
      requestLabel: sourceMode === "brief" ? "Wizard Brief Audience" : "Wizard Generate Audience",
      meta: { framework: activeSettings.framework, source: sourceMode === "brief" ? "wizard_brief" : "wizard_url" },
      runtimeSettings: activeSettings,
    });
    setAudiences(audienceList);
    persistAudiences(audienceList);
    updateWizardProgress("audience", "done", { sourceMode, phase: "process" });

    const primaryAudience = audienceList[0];
    if (!primaryAudience) {
      updateWizardProgress("angle", "idle", { sourceMode, phase: "output" });
      updateWizardProgress("copy", "idle", { sourceMode, phase: "output" });
      setTab("audience");
      await refreshUsage();
      return;
    }

    updateWizardProgress("angle", "active", { sourceMode, phase: "process" });
    const angleRunId = await resolveUsageRunId({
      runType: "campaign_cycle",
      label: parsedAnalysis?.produk
        ? sourceMode === "brief"
          ? `Wizard brief angle · ${parsedAnalysis.produk}`
          : `Wizard angle · ${parsedAnalysis.produk}`
        : sourceMode === "brief"
          ? "Wizard brief angle"
          : "Wizard angle",
      meta: { stage: "angle", audience: primaryAudience.nama, source: sourceMode === "brief" ? "wizard_brief" : "wizard_url" },
    });
    const angleList = await generateAngleList({
      nextAnalysis: parsedAnalysis,
      audience: primaryAudience,
      runId: angleRunId,
      requestLabel: sourceMode === "brief" ? "Wizard Brief Angle" : "Wizard Generate Angle",
      meta: { audience: primaryAudience.nama, framework: activeSettings.framework, source: sourceMode === "brief" ? "wizard_brief" : "wizard_url" },
      runtimeSettings: activeSettings,
    });
    setSelAud(primaryAudience);
    setAngles(angleList);
    setAnglesCache({ 0: angleList });
    persistAngles(angleList, 0);
    updateWizardProgress("angle", "done", { sourceMode, phase: "process" });

    const primaryAngle = angleList[0];
    if (!primaryAngle) {
      updateWizardProgress("copy", "idle", { sourceMode, phase: "output" });
      setTab("angle");
      await refreshUsage();
      return;
    }

    updateWizardProgress("copy", "active", { sourceMode, phase: "process" });
    const copyRunId = await resolveUsageRunId({
      runType: "campaign_cycle",
      label: parsedAnalysis?.produk
        ? sourceMode === "brief"
          ? `Wizard brief copy · ${parsedAnalysis.produk}`
          : `Wizard copy · ${parsedAnalysis.produk}`
        : sourceMode === "brief"
          ? "Wizard brief copy"
          : "Wizard copy",
      meta: { stage: "copy", angle: primaryAngle.teknik, source: sourceMode === "brief" ? "wizard_brief" : "wizard_url" },
    });
    const resultCopy = await generateCopyText({
      nextAnalysis: parsedAnalysis,
      audience: primaryAudience,
      angle: primaryAngle,
      runId: copyRunId,
      requestLabel: sourceMode === "brief" ? "Wizard Brief Copy" : "Wizard Generate Copy",
      meta: { angle: primaryAngle.teknik, format: activeFmt, framework: activeSettings.framework, source: sourceMode === "brief" ? "wizard_brief" : "wizard_url" },
      runtimeFmt: activeFmt,
      runtimeSettings: activeSettings,
    });
    setSelAng(primaryAngle);
    setCopy(resultCopy);
    await pushGeneratedCopy({ resultCopy, audience: primaryAudience, angle: primaryAngle, runtimeFmt: activeFmt, runtimeSettings: activeSettings });
    setTab("copy");
    updateWizardProgress("copy", "done", { sourceMode, phase: "output" });
    await refreshUsage();
  };

  const runWizardFromUrl = (rawUrl) => run("Wizard sedang membaca link dan menyusun campaign awal...", async () => {
    const sourceMode = "url";
    const normalizedUrl = rawUrl.match(/^https?:\/\//) ? rawUrl : `https://${rawUrl}`;
    await runWizardFlow({
      sourceMode,
      initialSetup: async () => {
        setSurfaceMode("wizard");
        setWizardSourceMode(sourceMode);
        setWizardUrl(rawUrl);
        setWizardBrief(createLandingPageBrief());
        setLandingBrief(createLandingPageBrief());
        setLandingPage(null);
      },
      resolveAnalysis: async () => {
        const analysisRunId = await resolveUsageRunId({
          fresh: true,
          runType: "campaign_cycle",
          label: "Wizard · Analisa LP dari URL",
          meta: { source: "wizard_url" },
        });
        const scraped = await scrapeUrl(normalizedUrl);
        const rawAnalysis = await callClaude([{ role: "user", content: P_TEXT(scraped) }], {
          maxTokens: 2500,
          taskType: "analyze_lp",
          projectId: project?.id || null,
          runId: analysisRunId,
          requestLabel: "Wizard Analisa LP",
          meta: { source: "wizard_url", url: normalizedUrl },
        });
        return parseJSON(rawAnalysis);
      },
    });
  });

  const runWizardFromBrief = (briefInput, options = {}) => run("Wizard sedang menyusun campaign dari brief...", async () => {
    const sourceMode = "brief";
    const runtimeSettings = options.settingsOverride || null;
    const runtimeFmt = options.fmtOverride || null;
    const normalizedBrief = createLandingPageBrief({
      ...briefInput,
      ctaWhatsapp: briefInput?.ctaWhatsapp || "#whatsapp",
      ctaCheckout: briefInput?.ctaCheckout || "#checkout",
    });
    await runWizardFlow({
      sourceMode,
      runtimeSettings,
      runtimeFmt,
      initialSetup: async () => {
        setSurfaceMode("wizard");
        setWizardSourceMode(sourceMode);
        setWizardUrl("");
        setWizardBrief(normalizedBrief);
        setLandingBrief(normalizedBrief);
        setLandingPage(null);
      },
      resolveAnalysis: async () => buildAnalysisFromBrief(normalizedBrief),
    });
  });

  const doGenerateLandingPage = () => run("Generate landing page...", async () => {
    const normalizedBrief = createLandingPageBrief(landingBrief);
    const runId = await resolveUsageRunId({
      fresh: true,
      runType: "landing_page_build",
      label: normalizedBrief.productName ? `Landing page · ${normalizedBrief.productName}` : "Landing page build",
      meta: { framework: settings.framework, source: project ? "project" : "session" },
    });
    let nextPage;

    if (project && token) {
      const res = await fetch(`${API_BASE}/api/projects/${project.id}/funnel-pages/generate`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ brief: normalizedBrief, framework: settings.framework, runId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal generate landing page.");
      nextPage = data.page;
    } else {
      const raw = await callClaude([
        {
          role: "user",
          content: buildLandingPagePrompt({
            brief: normalizedBrief,
            framework: settings.framework,
            settings,
          }),
        },
      ], {
        maxTokens: 4500,
        taskType: "generate_landing_page",
        projectId: project?.id || null,
        runId,
        requestLabel: "Generate Landing Page",
        meta: { framework: settings.framework, templateKey: "sales-v1" },
      });
      const parsed = validateAndNormalizeLandingPage(raw, { brief: normalizedBrief, framework: settings.framework });
      nextPage = {
        id: null,
        projectId: null,
        pageType: parsed.pageType,
        framework: parsed.framework,
        templateKey: parsed.templateKey,
        seo: parsed.seo,
        sections: parsed.sections,
        generatedAnalysis: buildAnalysisFromPage(parsed, normalizedBrief),
      };
    }

    if (!nextPage) throw new Error("Landing page tidak berhasil dibuat.");

    setLandingBrief(nextPage.brief || normalizedBrief);
    setLandingPage(nextPage);
    setAnalysis(nextPage.generatedAnalysis || buildAnalysisFromPage(nextPage, normalizedBrief));
    resetCreativeState();
    setTab("landing");
    await refreshUsage();
  });

  const onSaveLandingPage = () => run("Menyimpan landing page...", async () => {
    if (!project || !token) throw new Error("Pilih project dulu untuk menyimpan landing page.");
    if (!landingPage) throw new Error("Belum ada landing page untuk disimpan.");
    await saveLandingPageToDB();
  });

  const onApplyLandingTemplate = (templateId) => run("Menerapkan template landing page...", async () => {
    const applied = instantiateLandingPageTemplate(templateId);
    if (!applied) throw new Error("Template tidak ditemukan.");
    const nextBrief = applied.brief;
    const nextPage = {
      ...applied.page,
      id: landingPage?.id || null,
      projectId: project?.id || null,
    };
    setLandingBrief(nextBrief);
    setLandingPage(nextPage);
    setAnalysis(nextPage.generatedAnalysis || buildAnalysisFromPage(nextPage, nextBrief));
    resetCreativeState();
    setTab("landing");
    if (project && token) {
      await saveLandingPageToDB(nextPage, nextBrief);
    }
  });

  const onUseLandingPageForCampaign = () => run("Sinkronisasi landing page ke campaign...", async () => {
    if (!landingPage) throw new Error("Generate landing page dulu.");
    const latestAnalysis = buildAnalysisFromPage(landingPage, landingBrief);
    if (project && token) {
      await saveLandingPageToDB({
        ...landingPage,
        generatedAnalysis: latestAnalysis,
      }, landingBrief);
    }
    setAnalysis(latestAnalysis);
    resetCreativeState();
    setTab("audience");
  });

  const doUrl = (rawUrl) => run("Fetch dan analisa LP...", async () => {
    const runId = await resolveUsageRunId({
      fresh: true,
      runType: "campaign_cycle",
      label: "Analisa LP dari URL",
      meta: { source: "url" },
    });
    const url = rawUrl.match(/^https?:\/\//) ? rawUrl : `https://${rawUrl}`;
    const scraped = await scrapeUrl(url);
    const raw = await callClaude([{ role: "user", content: P_TEXT(scraped) }], {
      maxTokens: 2500,
      taskType: "analyze_lp",
      projectId: project?.id || null,
      runId,
      requestLabel: "Analisa LP",
      meta: { source: "url", url },
    });
    const parsed = parseJSON(raw);
    setAnalysis(parsed);
    resetCreativeState();
    persistAnalysis(parsed);
    await refreshUsage();
  });

  const doText = (text) => run("Analisa konten LP...", async () => {
    const runId = await resolveUsageRunId({
      fresh: true,
      runType: "campaign_cycle",
      label: "Analisa LP dari paste",
      meta: { source: "paste" },
    });
    const raw = await callClaude([{ role: "user", content: P_TEXT(text) }], {
      maxTokens: 2500,
      taskType: "analyze_lp",
      projectId: project?.id || null,
      runId,
      requestLabel: "Analisa LP",
      meta: { source: "paste" },
    });
    const parsed = parseJSON(raw);
    setAnalysis(parsed);
    resetCreativeState();
    persistAnalysis(parsed);
    await refreshUsage();
  });

  const doBuildAud = () => run("Build 6 audience segments...", async () => {
    const runId = await resolveUsageRunId({
      runType: "campaign_cycle",
      label: analysis?.produk ? `Campaign cycle · ${analysis.produk}` : "Campaign cycle",
      meta: { stage: "audience" },
    });
    const parsed = await generateAudienceList({
      nextAnalysis: analysis,
      runId,
      requestLabel: "Generate Audience",
      meta: { framework: settings.framework },
    });
    setAudiences(parsed);
    setAngles([]);
    setAnglesCache({});
    setSelAng(null);
    setCopy("");
    setTab("audience");
    persistAudiences(parsed);
    await refreshUsage();
  });

  const doSelAud = (aud, idx, force = false) => {
    if (!force && anglesCache[idx]) {
      setSelAud(aud);
      setAngles(anglesCache[idx]);
      setSelAng(null);
      setCopy("");
      setTab("angle");
      return;
    }

    run(`Generate angles untuk ${aud.nama}...`, async () => {
      const runId = await resolveUsageRunId({
        runType: "campaign_cycle",
        label: analysis?.produk ? `Campaign cycle · ${analysis.produk}` : "Campaign cycle",
        meta: { stage: "angle", audience: aud.nama },
      });
      setSelAud(aud);
      setSelAng(null);
      setCopy("");
      setTab("angle");
      const arr = await generateAngleList({
        nextAnalysis: analysis,
        audience: aud,
        runId,
        requestLabel: "Generate Angle",
        meta: { audience: aud.nama, framework: settings.framework },
      });
      const existing = anglesCache[idx] || [];
      const combined = [...arr, ...existing];
      setAngles(combined);
      setAnglesCache((current) => ({ ...current, [idx]: combined }));
      persistAngles(combined, idx);
      await refreshUsage();
    });
  };

  const onDeleteAngle = (angToDelete) => {
    const idx = audiences.findIndex((item) => item.nama === selAud?.nama);
    if (idx === -1) return;
    const updatedAngles = angles.filter((item) => item.hook !== angToDelete.hook || item.nama !== angToDelete.nama);
    setAngles(updatedAngles);
    setAnglesCache((current) => ({ ...current, [idx]: updatedAngles }));
    persistAngles(updatedAngles, idx);
  };

  const doGenCopy = (ang, notes = "") => run(`Nulis copy - ${ang.teknik}...`, async () => {
    const runId = await resolveUsageRunId({
      runType: "campaign_cycle",
      label: analysis?.produk ? `Campaign cycle · ${analysis.produk}` : "Campaign cycle",
      meta: { stage: "copy", angle: ang.teknik },
    });
    setSelAng(ang);
    setTab("copy");
    setCopy("");
    const result = await generateCopyText({
      nextAnalysis: analysis,
      audience: selAud,
      angle: ang,
      notes,
      runId,
      requestLabel: "Generate Ad Copy",
      meta: { angle: ang.teknik, format: fmt, framework: settings.framework },
    });
    setCopy(result);
    await pushGeneratedCopy({ resultCopy: result, audience: selAud, angle: ang });
    await refreshUsage();
  });

  const onDeleteCopy = (idToDelete) => {
    setHistory((current) => current.filter((item) => item.id !== idToDelete));
    if (token) {
      fetch(`${API_BASE}/api/copies/${idToDelete}`, { method: "DELETE", headers: authHeaders }).catch(() => { });
    }
  };

  const onToggleUsed = (idToToggle, currentStatus) => {
    const nextStatus = !currentStatus;
    setHistory((current) => current.map((item) => item.id === idToToggle ? { ...item, is_used: nextStatus } : item));
    if (token) {
      fetch(`${API_BASE}/api/copies/${idToToggle}/used`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify({ is_used: nextStatus }),
      }).catch(() => { });
    }
  };

  return {
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
  };
}
