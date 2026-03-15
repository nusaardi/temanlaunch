import { useEffect, useState } from "react";

export default function TabSettings({
  settings,
  setSettings,
  project,
  aiProviders,
  aiCredentials,
  serverAiInfo,
  aiSettingsLoading,
  onSaveAiSettings,
  onSaveCredential,
  onValidateCredential,
  onDeleteCredential,
  ui,
}) {
  const {
    AI_BILLING_MODES,
    Box,
    Btn,
    C,
    FONT_DISPLAY,
    FRAMEWORKS,
    Ic,
    Lbl,
    Pill,
    SectionLead,
    SLANG_LEVELS,
    Zero,
    buildContext,
    getDefaultModelForProvider,
    getProviderConfig,
    sanitizeAiSettings,
  } = ui;
  const [activeFramework, setActiveFramework] = useState(settings.framework);
  const [showAdvancedAi, setShowAdvancedAi] = useState(false);
  const [credentialDraft, setCredentialDraft] = useState(() => ({ provider: settings.provider, label: "", payload: {} }));
  const [editingCredentialId, setEditingCredentialId] = useState(null);
  const [credentialBusy, setCredentialBusy] = useState(false);
  const [credentialNotice, setCredentialNotice] = useState("");
  const [credentialError, setCredentialError] = useState("");
  const [aiSaveNotice, setAiSaveNotice] = useState("");
  const [aiSaveError, setAiSaveError] = useState("");
  const [validatingCredentialId, setValidatingCredentialId] = useState(null);
  const fw = FRAMEWORKS[activeFramework];
  const aiSettings = sanitizeAiSettings(settings);
  const providerCatalog = aiProviders.length ? aiProviders : [];
  const selectedProvider = providerCatalog.find((item) => item.id === aiSettings.provider) || providerCatalog[0] || getProviderConfig(aiSettings.provider);
  const selectedProviderModels = selectedProvider?.models || [];
  const currentCredential = aiCredentials.find((item) => item.id === aiSettings.credentialId) || null;

  useEffect(() => {
    setActiveFramework(settings.framework);
  }, [settings.framework]);

  useEffect(() => {
    setCredentialDraft((current) => {
      if (current.provider === aiSettings.provider) return current;
      return { provider: aiSettings.provider, label: "", payload: {} };
    });
  }, [aiSettings.provider]);

  const update = (key, val) => setSettings((state) => ({ ...state, [key]: val }));
  const saveFramework = () => { setSettings((state) => ({ ...state, framework: activeFramework })); };
  const updateAiField = (key, value) => setSettings((state) => {
    const next = sanitizeAiSettings({ ...state, [key]: value });
    if (key === "provider") {
      next.model = getDefaultModelForProvider(next.provider);
      if (!aiCredentials.some((item) => item.id === next.credentialId && item.provider === next.provider)) {
        next.credentialId = null;
      }
    }
    return { ...state, ...next };
  });

  const providerCredentialOptions = aiCredentials.filter((item) => item.provider === aiSettings.provider);

  const submitAiSettings = async () => {
    setAiSaveNotice("");
    setAiSaveError("");
    try {
      await onSaveAiSettings(aiSettings);
      setAiSaveNotice(project
        ? "AI settings project berhasil disimpan."
        : "AI settings disimpan lokal untuk session ini. Pilih project jika ingin persist.");
    } catch (err) {
      setAiSaveError(err.message || "Gagal menyimpan AI settings.");
    }
  };

  const resetCredentialDraft = (providerId = aiSettings.provider) => {
    setEditingCredentialId(null);
    setCredentialDraft({ provider: providerId, label: "", payload: {} });
    setCredentialNotice("");
    setCredentialError("");
  };

  const startEditCredential = (credential) => {
    setEditingCredentialId(credential.id);
    setCredentialDraft({
      provider: credential.provider,
      label: credential.label,
      payload: {},
    });
    setCredentialNotice(`Edit ${credential.label}. Field secret yang kosong akan tetap memakai nilai lama.`);
    setCredentialError("");
  };

  const submitCredential = async () => {
    setCredentialBusy(true);
    setCredentialNotice("");
    setCredentialError("");
    try {
      const saved = await onSaveCredential({
        credentialId: editingCredentialId,
        provider: credentialDraft.provider,
        label: credentialDraft.label,
        payload: credentialDraft.payload,
        isActive: true,
      });
      setCredentialNotice(`${saved.label} berhasil disimpan.`);
      setSettings((state) => {
        if (state.provider !== saved.provider) return state;
        return { ...state, credentialId: saved.id };
      });
      resetCredentialDraft(saved.provider);
    } catch (err) {
      setCredentialError(err.message || "Gagal menyimpan credential.");
    } finally {
      setCredentialBusy(false);
    }
  };

  const validateCredential = async (credential) => {
    setValidatingCredentialId(credential.id);
    setCredentialError("");
    setCredentialNotice("");
    try {
      await onValidateCredential({ credentialId: credential.id, model: aiSettings.model });
      setCredentialNotice(`Credential ${credential.label} valid.`);
    } catch (err) {
      setCredentialError(err.message || "Validasi credential gagal.");
    } finally {
      setValidatingCredentialId(null);
    }
  };

  const removeCredential = async (credential) => {
    if (!window.confirm(`Hapus credential ${credential.label}?`)) return;
    setCredentialBusy(true);
    setCredentialError("");
    setCredentialNotice("");
    try {
      await onDeleteCredential(credential.id);
      setCredentialNotice(`${credential.label} dihapus.`);
    } catch (err) {
      setCredentialError(err.message || "Gagal menghapus credential.");
    } finally {
      setCredentialBusy(false);
    }
  };

  return (
    <div style={{ animation: "up .25s ease" }}>
      <SectionLead
        eyebrow="Campaign Setup"
        title="Atur nada campaign dan aturan copy."
        sub="Framework, bahasa, dan persona tetap jadi kontrol utama. Pengaturan provider, billing mode, dan BYOK disimpan di panel lanjutan agar workspace utama tetap ringan."
        aside={<Pill ch={`Framework aktif: ${FRAMEWORKS[settings.framework]?.label}`} color={C.accent} />}
      />

      <div className="auto-grid">
        <Box style={{ gridColumn: "1/-1", background: "linear-gradient(140deg,#fbf7ef 0%,#efe2cb 100%)", borderColor: `${C.accent}32` }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 14, alignItems: "flex-start", flexWrap: "wrap" }}>
            <div>
              <Lbl ch={<><span style={{ display: "inline-flex", marginRight: 4 }}>{Ic.wrench({ size: 12, color: C.accent })}</span> Pengaturan AI Lanjutan</>} color={C.accent} />
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 28, lineHeight: .98, letterSpacing: -.8, color: C.text, marginBottom: 8 }}>Provider, billing mode, dan BYOK disimpan terpisah.</div>
              <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.75, maxWidth: 720 }}>
                Workspace utama cukup fokus ke framework dan output campaign. Kalau perlu memilih provider server, API key sendiri, atau credential, buka panel lanjutan ini.
              </div>
            </div>
            <div style={{ display: "grid", gap: 8, justifyItems: "end" }}>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
                <Pill ch={aiSettings.billingMode === AI_BILLING_MODES.BYOK ? "API key sendiri" : "Server managed"} color={aiSettings.billingMode === AI_BILLING_MODES.BYOK ? C.purple : C.accent} />
                <Pill ch={selectedProvider?.label || aiSettings.provider} color={C.cyan} sm />
                {currentCredential && <Pill ch={currentCredential.masked} color={C.yellow} sm />}
              </div>
              <Btn
                ch={showAdvancedAi ? "Sembunyikan Panel Lanjutan" : "Buka Panel Lanjutan"}
                onClick={() => setShowAdvancedAi((value) => !value)}
                v="s"
                size="sm"
              />
            </div>
          </div>
        </Box>

        {showAdvancedAi && (
          <>
            <Box style={{ gridColumn: "1/-1", background: "linear-gradient(140deg,#fbf7ef 0%,#efe2cb 100%)", borderColor: `${C.accent}32` }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start", flexWrap: "wrap", marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 2, fontWeight: 900, color: C.accent, marginBottom: 8 }}>AI Control Desk</div>
                  <div style={{ fontFamily: FONT_DISPLAY, fontSize: 30, lineHeight: .96, letterSpacing: -.7, color: C.text, marginBottom: 10 }}>Tentukan apakah project pakai server managed atau API key sendiri.</div>
                  <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.8, maxWidth: 720 }}>
                    Mode internal tetap memakai provider server bawaan. Mode BYOK mencatat token usage tanpa mendebit credit in-house. Project aktif sekarang: <strong style={{ color: C.text }}>{project?.name || "belum dipilih"}</strong>.
                  </div>
                </div>
                <div style={{ display: "grid", gap: 8, minWidth: 240 }}>
                  <div style={{ padding: "12px 14px", borderRadius: 18, border: `1px solid ${C.border}`, background: "#fffdf7" }}>
                    <div style={{ fontSize: 10, letterSpacing: 1.6, textTransform: "uppercase", fontWeight: 800, color: C.dim, marginBottom: 6 }}>Managed server provider</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: C.text }}>{serverAiInfo?.defaultProvider || "Internal"}</div>
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>{serverAiInfo?.defaultModel || "Model dikelola operator"}</div>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <Pill ch={aiSettings.billingMode === AI_BILLING_MODES.BYOK ? "API key sendiri aktif" : "Server managed aktif"} color={aiSettings.billingMode === AI_BILLING_MODES.BYOK ? C.purple : C.accent} />
                    {currentCredential && <Pill ch={currentCredential.masked} color={C.cyan} sm />}
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.15fr) minmax(320px,.85fr)", gap: 16 }}>
                <div style={{ display: "grid", gap: 12 }}>
                  <div>
                    <Lbl ch={<><span style={{ display: "inline-flex", marginRight: 4 }}>{Ic.hash({ size: 12, color: C.accent })}</span> Billing Mode</>} color={C.accent} />
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 10 }}>
                      {[
                        { id: AI_BILLING_MODES.INTERNAL, label: "Server Managed", note: "Gunakan provider server bawaan dan debit credit user." },
                        { id: AI_BILLING_MODES.BYOK, label: "API Key Sendiri", note: "Gunakan API key milik user dan jangan debit credit in-house." },
                      ].map((option) => {
                        const active = aiSettings.billingMode === option.id;
                        return (
                          <button
                            key={option.id}
                            onClick={() => updateAiField("billingMode", option.id)}
                            style={{
                              textAlign: "left",
                              borderRadius: 18,
                              border: `1px solid ${active ? C.accent : C.border}`,
                              background: active ? "#fffaf0" : "#fffdf8",
                              padding: "14px 15px",
                              cursor: "pointer",
                            }}
                          >
                            <div style={{ fontSize: 12, fontWeight: 800, color: active ? C.accent : C.text }}>{option.label}</div>
                            <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.7, marginTop: 6 }}>{option.note}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <Lbl ch={<><span style={{ display: "inline-flex", marginRight: 4 }}>{Ic.layers({ size: 12, color: C.cyan })}</span> Provider & Model</>} color={C.cyan} />
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 10, marginBottom: 12 }}>
                      {providerCatalog.map((provider) => {
                        const active = aiSettings.provider === provider.id;
                        return (
                          <button
                            key={provider.id}
                            onClick={() => updateAiField("provider", provider.id)}
                            style={{
                              textAlign: "left",
                              borderRadius: 18,
                              border: `1px solid ${active ? provider.baseColor || C.accent : C.border}`,
                              background: active ? "#fffaf1" : "#fffdf8",
                              padding: "14px 15px",
                              cursor: "pointer",
                            }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", marginBottom: 8 }}>
                              <div style={{ fontSize: 12, fontWeight: 800, color: active ? (provider.baseColor || C.accent) : C.text }}>{provider.label}</div>
                              <Pill ch={provider.badge} color={provider.group === "advanced" ? C.orange : C.cyan} sm />
                            </div>
                            <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.7 }}>{provider.description}</div>
                          </button>
                        );
                      })}
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12 }}>
                      <div>
                        <div style={{ fontSize: 10, letterSpacing: 1.6, textTransform: "uppercase", fontWeight: 800, color: C.dim, marginBottom: 6 }}>Model</div>
                        <select
                          value={aiSettings.model}
                          onChange={(e) => updateAiField("model", e.target.value)}
                          style={{ width: "100%", background: "#fffdf8", border: `1px solid ${C.border}`, borderRadius: 14, padding: "12px 14px", color: C.text, fontSize: 13 }}
                        >
                          {selectedProviderModels.map((model) => (
                            <option key={model.id} value={model.id}>{model.label}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <div style={{ fontSize: 10, letterSpacing: 1.6, textTransform: "uppercase", fontWeight: 800, color: C.dim, marginBottom: 6 }}>Credential</div>
                        <select
                          value={aiSettings.credentialId || ""}
                          onChange={(e) => updateAiField("credentialId", e.target.value ? Number(e.target.value) : null)}
                          disabled={aiSettings.billingMode !== AI_BILLING_MODES.BYOK}
                          style={{ width: "100%", background: "#fffdf8", border: `1px solid ${C.border}`, borderRadius: 14, padding: "12px 14px", color: C.text, fontSize: 13 }}
                        >
                          <option value="">{aiSettings.billingMode === AI_BILLING_MODES.BYOK ? "Pilih credential" : "Server managed tidak butuh credential"}</option>
                          {providerCredentialOptions.map((credential) => (
                            <option key={credential.id} value={credential.id}>{credential.label} · {credential.masked}</option>
                          ))}
                        </select>
                        <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.7, marginTop: 6 }}>
                          {currentCredential
                            ? `Validasi terakhir: ${currentCredential.lastValidatedAt ? new Date(currentCredential.lastValidatedAt).toLocaleString("id-ID") : "belum pernah"}`
                            : "Pilih credential yang sesuai dengan provider."}
                        </div>
                      </div>
                    </div>
                  </div>

                  {aiSaveNotice && <div style={{ background: "#ecfdf5", border: `1px solid ${C.accent}30`, borderRadius: 16, padding: "10px 12px", fontSize: 12, color: C.accent, lineHeight: 1.7 }}>{aiSaveNotice}</div>}
                  {aiSaveError && <div style={{ background: "#fef2f2", border: `1px solid ${C.red}30`, borderRadius: 16, padding: "10px 12px", fontSize: 12, color: C.red, lineHeight: 1.7 }}>{aiSaveError}</div>}
                </div>

                <div style={{ background: "#fffaf1", border: `1px solid ${C.border}`, borderRadius: 24, padding: 18, alignSelf: "start" }}>
                  <Lbl ch="Project AI Snapshot" color={C.purple} />
                  <div style={{ display: "grid", gap: 10 }}>
                    <div style={{ padding: "12px 14px", borderRadius: 16, border: `1px solid ${C.border}`, background: "#fffdf8" }}>
                      <div style={{ fontSize: 10, letterSpacing: 1.4, textTransform: "uppercase", fontWeight: 800, color: C.dim, marginBottom: 6 }}>Billing Source</div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: C.text }}>{aiSettings.billingMode === AI_BILLING_MODES.BYOK ? "API Key Sendiri" : "Server Managed"}</div>
                      <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.7, marginTop: 6 }}>
                        {aiSettings.billingMode === AI_BILLING_MODES.BYOK
                          ? "Event usage tetap tercatat, tapi ledger tidak didebit."
                          : "Usage akan menulis debit credit ke wallet dan ledger."}
                      </div>
                    </div>
                    <div style={{ padding: "12px 14px", borderRadius: 16, border: `1px solid ${C.border}`, background: "#fffdf8" }}>
                      <div style={{ fontSize: 10, letterSpacing: 1.4, textTransform: "uppercase", fontWeight: 800, color: C.dim, marginBottom: 6 }}>Provider Aktif</div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: C.text }}>{selectedProvider?.label || aiSettings.provider}</div>
                      <div style={{ fontSize: 11, color: C.muted, marginTop: 6 }}>{aiSettings.model}</div>
                    </div>
                    <div style={{ padding: "12px 14px", borderRadius: 16, border: `1px solid ${C.border}`, background: "#fffdf8" }}>
                      <div style={{ fontSize: 10, letterSpacing: 1.4, textTransform: "uppercase", fontWeight: 800, color: C.dim, marginBottom: 6 }}>Persistence</div>
                      <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.8 }}>
                        {project ? "AI settings ini akan tersimpan ke project aktif dan dipakai otomatis di setiap langkah." : "Belum ada project aktif. Perubahan masih berlaku lokal sampai project dipilih."}
                      </div>
                    </div>
                    <Btn ch={<><span style={{ display: "inline-flex" }}>{Ic.save({ size: 13 })}</span> Simpan AI Settings</>} onClick={submitAiSettings} loading={aiSettingsLoading} />
                  </div>
                </div>
              </div>
            </Box>

            <Box style={{ gridColumn: "1/-1", background: "linear-gradient(180deg,#fffaf2 0%,#f4ecde 100%)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", flexWrap: "wrap", marginBottom: 14 }}>
                <div>
                  <Lbl ch={<><span style={{ display: "inline-flex", marginRight: 4 }}>{Ic.key({ size: 12, color: C.yellow })}</span> Credential Vault</>} color={C.yellow} />
                  <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.75, maxWidth: 720 }}>
                    Simpan credential BYOK terenkripsi di server. Secret tidak pernah dikirim balik ke UI; setelah tersimpan kamu hanya akan melihat label, provider, masked suffix, dan status validasi.
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <Pill ch={`${aiCredentials.length} credential`} color={C.yellow} />
                  <Pill ch="AES-256-GCM" color={C.cyan} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(320px,.85fr)", gap: 16 }}>
                <div style={{ display: "grid", gap: 10, alignContent: "start" }}>
                  {!aiCredentials.length && <Zero icon={Ic.key} title="Belum ada credential" sub="Tambahkan API key agar mode BYOK bisa dipakai per project." />}
                  {!!aiCredentials.length && aiCredentials.map((credential) => (
                    <div key={credential.id} style={{ borderRadius: 18, border: `1px solid ${C.border}`, background: "#fffdf8", padding: "12px 14px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start", flexWrap: "wrap" }}>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 800, color: C.text }}>{credential.label}</div>
                          <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>{credential.provider} · {credential.masked}</div>
                        </div>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          <Pill ch={credential.isActive ? "active" : "inactive"} color={credential.isActive ? C.accent : C.orange} sm />
                          {credential.lastError && <Pill ch="error" color={C.red} sm />}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                        <Pill ch={credential.lastUsedModel || "belum dipakai"} color={C.purple} sm />
                        <Pill ch={credential.lastValidatedAt ? `Validated ${new Date(credential.lastValidatedAt).toLocaleDateString("id-ID")}` : "Belum divalidasi"} color={C.cyan} sm />
                      </div>
                      {!!credential.lastError && (
                        <div style={{ marginTop: 10, fontSize: 11, color: C.red, lineHeight: 1.7, background: "#fef2f2", borderRadius: 12, padding: "8px 10px", border: `1px solid ${C.red}22` }}>
                          {credential.lastError}
                        </div>
                      )}
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                        <Btn ch="Edit" onClick={() => startEditCredential(credential)} v="s" size="sm" />
                        <Btn ch="Validate" onClick={() => validateCredential(credential)} v="g" size="sm" loading={validatingCredentialId === credential.id} />
                        <Btn ch="Hapus" onClick={() => removeCredential(credential)} v="g" size="sm" disabled={credentialBusy} />
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ background: "#fffdf7", border: `1px solid ${C.border}`, borderRadius: 24, padding: 18, alignSelf: "start" }}>
                  <Lbl ch={editingCredentialId ? "Edit Credential" : "Tambah Credential Baru"} color={C.accent} />
                  <div style={{ display: "grid", gap: 10 }}>
                    <div>
                      <div style={{ fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 800, color: C.dim, marginBottom: 6 }}>Provider</div>
                      <select
                        value={credentialDraft.provider || aiSettings.provider}
                        onChange={(e) => setCredentialDraft((current) => ({ ...current, provider: e.target.value, payload: {} }))}
                        style={{ width: "100%", background: "#fffdf8", border: `1px solid ${C.border}`, borderRadius: 14, padding: "12px 14px", color: C.text, fontSize: 13 }}
                      >
                        {providerCatalog.map((provider) => (
                          <option key={provider.id} value={provider.id}>{provider.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 800, color: C.dim, marginBottom: 6 }}>Label</div>
                      <input
                        value={credentialDraft.label}
                        onChange={(e) => setCredentialDraft((current) => ({ ...current, label: e.target.value }))}
                        placeholder="Contoh: OpenAI pribadi"
                        style={{ width: "100%", background: "#fffdf8", border: `1px solid ${C.border}`, borderRadius: 14, padding: "12px 14px", color: C.text, fontSize: 13 }}
                      />
                    </div>
                    {(providerCatalog.find((provider) => provider.id === (credentialDraft.provider || aiSettings.provider))?.credentialFields || []).map((field) => (
                      <div key={field.key}>
                        <div style={{ fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 800, color: C.dim, marginBottom: 6 }}>{field.label}</div>
                        <input
                          type={field.type === "password" ? "password" : "text"}
                          value={credentialDraft.payload[field.key] || ""}
                          onChange={(e) => setCredentialDraft((current) => ({
                            ...current,
                            payload: { ...current.payload, [field.key]: e.target.value },
                          }))}
                          placeholder={field.placeholder}
                          style={{ width: "100%", background: "#fffdf8", border: `1px solid ${C.border}`, borderRadius: 14, padding: "12px 14px", color: C.text, fontSize: 13 }}
                        />
                      </div>
                    ))}
                    {credentialNotice && <div style={{ background: "#ecfdf5", border: `1px solid ${C.accent}30`, borderRadius: 14, padding: "10px 12px", fontSize: 12, color: C.accent, lineHeight: 1.7 }}>{credentialNotice}</div>}
                    {credentialError && <div style={{ background: "#fef2f2", border: `1px solid ${C.red}30`, borderRadius: 14, padding: "10px 12px", fontSize: 12, color: C.red, lineHeight: 1.7 }}>{credentialError}</div>}
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <Btn ch={editingCredentialId ? "Update Credential" : "Simpan Credential"} onClick={submitCredential} loading={credentialBusy} />
                      {(editingCredentialId || credentialDraft.label || Object.keys(credentialDraft.payload || {}).length > 0) && <Btn ch="Reset" onClick={() => resetCredentialDraft()} v="g" size="sm" />}
                    </div>
                  </div>
                </div>
              </div>
            </Box>
          </>
        )}

        <Box style={{ gridColumn: "1/-1" }}>
          <Lbl ch={<><span style={{ display: "inline-flex", marginRight: 4 }}>{Ic.bookOpen({ size: 12, color: C.accent })}</span> Framework Copy</>} color={C.accent} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(116px,1fr))", gap: 8, marginBottom: 16 }}>
            {Object.entries(FRAMEWORKS).map(([key, framework]) => (
              <button key={key} onClick={() => setActiveFramework(key)}
                style={{ background: activeFramework === key ? C.accent + "18" : C.s1, border: `1px solid ${activeFramework === key ? C.accent : C.border}`, borderRadius: 10, padding: "12px 8px", cursor: "pointer", textAlign: "center", fontFamily: "inherit", transition: "all .15s" }}>
                <div style={{ marginBottom: 6, display: "flex", justifyContent: "center" }}>{Ic[framework.icon]({ size: 22, color: activeFramework === key ? C.accent : C.muted })}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: activeFramework === key ? C.accent : C.text }}>{framework.label}</div>
              </button>
            ))}
          </div>
          <div style={{ background: C.s1, borderRadius: 10, padding: "14px 16px" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>{Ic[fw.icon]({ size: 15, color: C.accent })} {fw.label}</div>
            <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.7, marginBottom: 10 }}>{fw.desc}</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {fw.structure.map((item, index) => (
                <div key={index} style={{ background: C.dim, borderRadius: 6, padding: "4px 10px", fontSize: 11, color: C.muted }}>
                  <span style={{ color: C.accent, fontWeight: 700 }}>{index + 1}.</span> {item}
                </div>
              ))}
            </div>
          </div>
          {activeFramework !== settings.framework && (
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
              <Btn ch={<><span style={{ display: "inline-flex" }}>{Ic.check({ size: 14, color: "#fff" })}</span> Pakai Framework Ini</>} onClick={saveFramework} />
            </div>
          )}
          {activeFramework === settings.framework && (
            <div style={{ marginTop: 10, fontSize: 12, color: C.mid, display: "flex", alignItems: "center", gap: 6 }}>
              {Ic.check({ size: 14, color: C.mid })} Framework aktif: <strong>{fw.label}</strong>
            </div>
          )}
        </Box>

        <Box>
          <Lbl ch={<><span style={{ display: "inline-flex", marginRight: 4 }}>{Ic.chat({ size: 12, color: C.cyan })}</span> Level Bahasa</>} color={C.cyan} />
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>
                {SLANG_LEVELS.find((item) => item.val === settings.slangLevel)?.label}
              </span>
              <Pill ch={`Level ${settings.slangLevel}`} color={C.cyan} />
            </div>
            <input type="range" min={1} max={5} value={settings.slangLevel}
              onChange={(e) => update("slangLevel", Number(e.target.value))}
              style={{ width: "100%", accentColor: C.cyan }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: C.dim, marginTop: 4 }}>
              <span>Formal</span><span>Super Gaul</span>
            </div>
          </div>
          <div style={{ background: C.s1, borderRadius: 8, padding: "10px 14px", fontSize: 12, color: C.muted, lineHeight: 1.7 }}>
            <span style={{ display: "inline-flex", marginRight: 4 }}>{Ic.chat({ size: 12, color: C.cyan })}</span>
            {SLANG_LEVELS.find((item) => item.val === settings.slangLevel)?.ex}
          </div>
        </Box>

        <Box>
          <Lbl ch={<><span style={{ display: "inline-flex", marginRight: 4 }}>{Ic.mask({ size: 12, color: C.purple })}</span> Brand Voice / Persona</>} color={C.purple} />
          <textarea
            value={settings.brandVoice}
            onChange={(e) => update("brandVoice", e.target.value)}
            placeholder="Deskripsikan persona brand kamu...&#10;&#10;Contoh: Seperti teman akrab yang pernah struggle sama masalah yang sama, lalu nemuin solusi. Empatinya tinggi, nggak menghakimi, sedikit humor."
            rows={5}
            style={{ width: "100%", background: C.s1, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", color: C.text, fontSize: 12, fontFamily: "inherit", resize: "vertical", lineHeight: 1.7 }}
          />
        </Box>

        <Box>
          <Lbl ch={<><span style={{ display: "inline-flex", marginRight: 4 }}>{Ic.ban({ size: 12, color: C.red })}</span> Kata yang Dilarang</>} color={C.red} />
          <textarea
            value={settings.forbiddenWords}
            onChange={(e) => update("forbiddenWords", e.target.value)}
            placeholder="Contoh: murah, terjangkau, segera, gratis, terbatas&#10;&#10;Pisahkan dengan koma."
            rows={3}
            style={{ width: "100%", background: C.s1, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", color: C.text, fontSize: 12, fontFamily: "inherit", resize: "vertical", lineHeight: 1.7, marginBottom: 12 }}
          />
          <Lbl ch={<><span style={{ display: "inline-flex", marginRight: 4 }}>{Ic.check({ size: 12, color: C.accent })}</span> Kata yang Wajib Muncul</>} color={C.accent} />
          <textarea
            value={settings.requiredWords}
            onChange={(e) => update("requiredWords", e.target.value)}
            placeholder="Contoh: Bazi, Human Design, blueprint, garansi 30 hari&#10;&#10;Pisahkan dengan koma."
            rows={3}
            style={{ width: "100%", background: C.s1, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", color: C.text, fontSize: 12, fontFamily: "inherit", resize: "vertical", lineHeight: 1.7 }}
          />
        </Box>

        <Box style={{ gridColumn: "1/-1" }}>
          <Lbl ch={<><span style={{ display: "inline-flex", marginRight: 4 }}>{Ic.fileText({ size: 12, color: C.yellow })}</span> Instruksi Tambahan (System Prompt)</>} color={C.yellow} />
          <textarea
            value={settings.customInstructions}
            onChange={(e) => update("customInstructions", e.target.value)}
            placeholder="Tambahkan instruksi khusus yang mau kamu inject ke setiap prompt AI...&#10;&#10;Contoh: Selalu mention angka '10.000+ member' di setiap copy. Jangan pernah klaim jadi kaya raya. Selalu akhiri dengan emoji. Fokus ke benefit emotional bukan logical."
            rows={4}
            style={{ width: "100%", background: C.s1, border: `1px solid ${C.border}`, borderRadius: 8, padding: "12px 16px", color: C.text, fontSize: 13, fontFamily: "inherit", resize: "vertical", lineHeight: 1.7 }}
          />
          <div style={{ marginTop: 10, fontSize: 12, color: C.dim, lineHeight: 1.6, display: "flex", alignItems: "flex-start", gap: 6 }}>
            {Ic.bulb({ size: 14, color: C.dim })} Instruksi ini akan diinjeksi ke setiap request AI - analisa, audience, angle, dan copy.
          </div>
        </Box>
      </div>

      <Box style={{ marginTop: 16, background: C.s1 }}>
        <Lbl ch={<><span style={{ display: "inline-flex", marginRight: 4 }}>{Ic.eye({ size: 12, color: C.muted })}</span> Preview System Context</>} color={C.muted} />
        <pre style={{ fontSize: 11, color: C.muted, lineHeight: 1.8, whiteSpace: "pre-wrap", fontFamily: "inherit" }}>
          {buildContext(settings)}
        </pre>
      </Box>
    </div>
  );
}
