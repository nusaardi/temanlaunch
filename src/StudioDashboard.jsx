export default function StudioDashboard({
  C,
  Ic,
  Btn,
  Pill,
  ShellMetric,
  ErrBox,
  FONT_DISPLAY,
  tabs,
  tab,
  onSelectTab,
  activeTab,
  stepIndex,
  advancedMode,
  onOpenAdvancedStudio,
  onOpenSimpleStudio,
  project,
  stageFramework,
  stageGoalPreset,
  fmt,
  analysis,
  stageProduct,
  stageOffer,
  stageReadiness,
  completedCount,
  audiences,
  previewAudience,
  usageSummary,
  history,
  isDone,
  loading,
  loadMsg,
  autoProjectLoading,
  onOpenProjects,
  error,
  onClearError,
  children,
}) {
  const Button = Btn;
  const Badge = Pill;
  const Metric = ShellMetric;
  const ErrorBox = ErrBox;
  const heroBadges = advancedMode
    ? [
        project ? { label: `Project: ${project.name}`, color: C.accent } : null,
        { label: `Framework: ${stageFramework?.label}`, color: C.cyan },
        { label: `Format aktif: ${fmt}`, color: C.yellow },
      ].filter(Boolean)
    : [
        project ? { label: `Project: ${project.name}`, color: C.accent } : null,
        { label: `Goal: ${stageGoalPreset?.shortLabel || "Campaign cepat"}`, color: C.cyan },
      ].filter(Boolean);
  const summaryItems = advancedMode
    ? [
        {
          label: "Project",
          value: project ? project.name : "Belum dipilih",
          hint: project ? "Dipakai sebagai rumah utama untuk semua hasil." : "Pilih project kalau kamu ingin hasilnya tersimpan rapi.",
          tone: project ? C.accent : C.orange,
        },
        {
          label: "Kesiapan",
          value: stageReadiness,
          hint: `${completedCount} dari ${tabs.length} bagian sudah terisi.`,
          tone: project && stageReadiness === "Landing page siap dipakai" ? C.accent : analysis ? C.cyan : C.red,
        },
        {
          label: "Audience",
          value: audiences.length ? `${audiences.length} segment` : "Belum ada",
          hint: previewAudience ? previewAudience.nama : "Belum ada target utama yang dipilih.",
          tone: audiences.length ? C.blue : C.hi,
        },
        {
          label: "Jatah AI",
          value: usageSummary?.wallet ? `${usageSummary.wallet.balanceCredits} cr` : "Belum termuat",
          hint: history.some((item) => item.is_used)
            ? `${history.filter((item) => item.is_used).length} draft sudah ditandai dipakai.`
            : "Buka tab pemakaian untuk melihat riwayat generate.",
          tone: usageSummary?.wallet?.balanceCredits > 0 ? C.purple : C.orange,
        },
      ]
    : [
        {
          label: "Kesiapan",
          value: stageReadiness,
          hint: `${completedCount} dari ${tabs.length} bagian sudah terisi.`,
          tone: analysis ? C.accent : C.orange,
        },
        {
          label: "Target",
          value: audiences.length ? `${audiences.length} segment` : "Belum ada",
          hint: previewAudience ? previewAudience.nama : "Belum ada target utama yang dipilih.",
          tone: audiences.length ? C.blue : C.hi,
        },
        {
          label: "Draft",
          value: history.length ? `${history.length} versi` : "Belum ada",
          hint: history.length ? "Pilih draft yang paling terasa siap dipakai." : "Lanjutkan sampai ada teks iklan yang terasa siap dipakai.",
          tone: history.length ? C.purple : C.orange,
        },
      ];

  return (
    <>
      <div className="shell-hero">
        <div>
          <Badge ch={advancedMode ? "TemanLaunch Pro" : "Launch Desk"} color={C.accent} />
          <div className="hero-title">{advancedMode ? "Bangun funnel, angle, dan copy dari satu launch desk." : "Rapikan hasil flow tanpa tenggelam di panel yang tidak perlu."}</div>
          <div className="hero-copy">
            {advancedMode
              ? "Mode lanjutan ini memberi kontrol penuh: mulai dari framework, bentuk halaman jualan, baca produk, lalu turunkan ke target pembeli, ide jualan, dan teks iklan tanpa pindah konteks."
              : "Mode ini menyisakan bagian yang paling penting lebih dulu: ringkasan produk, target pembeli, ide jualan, teks iklan, dan halaman jualan. Pengaturan teknis dipindah ke mode lanjutan supaya desk review tetap ringan."}
          </div>
          <div className="hero-actions">
            {heroBadges.map((item) => (
              <Badge key={item.label} ch={item.label} color={item.color} />
            ))}
            <button type="button" onClick={advancedMode ? onOpenSimpleStudio : onOpenAdvancedStudio} style={{ border: `1px solid ${C.border}`, borderRadius: 999, background: "#fffdf7", color: C.text, padding: "8px 12px", fontSize: 11, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>
              {advancedMode ? "Kembali ke mode sederhana" : "Buka mode lanjutan"}
            </button>
          </div>
          {analysis && (
            <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${C.border}`, maxWidth: 620 }}>
              <div style={{ fontSize: 11, letterSpacing: 1.7, textTransform: "uppercase", color: C.dim, fontWeight: 800, marginBottom: 6 }}>
                Produk yang sedang dirapikan
              </div>
              <div style={{ fontSize: 17, fontWeight: 800, color: C.text, lineHeight: 1.35, marginBottom: 6 }}>
                {stageProduct}
              </div>
              <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.75 }}>
                {stageOffer}
              </div>
            </div>
          )}
        </div>

        <div className="hero-side">
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 2, fontWeight: 800, color: C.accent, marginBottom: 8 }}>
              Bagian aktif · {stepIndex} / {tabs.length}
            </div>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 34, letterSpacing: -1, lineHeight: 0.98, color: C.text, marginBottom: 10 }}>{activeTab.label}</div>
            <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.75 }}>{activeTab.note}</div>
            <div className="summary-grid">
              {summaryItems.map((item) => (
                <Metric key={item.label} label={item.label} value={item.value} hint={item.hint} tone={item.tone} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="step-strip" style={{ marginBottom: 8 }}>
        {tabs.map((item, index) => {
          const active = tab === item.id;
          const done = isDone(item.id);
          return (
            <button key={item.id} onClick={() => onSelectTab(item.id)} className={`step-tab ${active ? "active" : ""} ${done ? "done" : ""}`}>
              <span className="step-index">{done && !active ? "✓" : index + 1}</span>
              <span style={{ display: "grid", gap: 4 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 800 }}>
                  {item.icon({ size: 14, color: active ? C.s1 : done ? C.accent : C.muted })} {item.label}
                </span>
                {advancedMode && <span style={{ fontSize: 11, lineHeight: 1.45, color: active ? "#e9dfcf" : C.dim }}>{item.note}</span>}
              </span>
            </button>
          );
        })}
      </div>

      {loading && (
        <div style={{ background: "#f8efe3", border: `1px solid ${C.mid}18`, borderRadius: 20, padding: "11px 14px", margin: "10px 0 14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: C.accent }}>
            <div style={{ width: 12, height: 12, border: `2px solid ${C.accent}22`, borderTop: `2px solid ${C.accent}`, borderRadius: "50%", animation: "spin .7s linear infinite" }} />
            {loadMsg}
          </div>
        </div>
      )}

      {!project && !autoProjectLoading && (
        <div className="stage-note">
          <div className="stage-note-grid">
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, borderRadius: 999, border: "1px solid #d7b98c", background: "#fff8ee", padding: "6px 11px", fontSize: 10, fontWeight: 900, letterSpacing: 1.6, textTransform: "uppercase", color: "#9a3412", marginBottom: 12 }}>
                {Ic.alertTri({ size: 13, color: "#9a3412" })} Sesi sementara
              </div>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 28, lineHeight: 0.98, letterSpacing: -0.7, color: C.text, marginBottom: 10, maxWidth: 14 }}>
                Simpan dulu ke project supaya hasilmu tidak tercecer.
              </div>
              <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.8, maxWidth: 560 }}>
                Kamu tetap bisa lanjut mengisi audience, ide jualan, dan copy. Tapi sebelum sesi ini terasa matang, lebih aman pilih satu project supaya semua hasil berikutnya langsung menempel ke rumah campaign yang sama.
              </div>
            </div>

            <div style={{ position: "relative", zIndex: 1, display: "grid", gap: 12 }}>
              <div className="stage-note-points">
                {[
                  "Audience, angle, copy, dan landing page tetap masuk ke konteks yang sama.",
                  "Draft yang paling bagus jadi lebih mudah dicari lagi nanti.",
                  "Kalau ganti campaign, kamu tinggal pindah project, bukan mulai ulang dari nol.",
                ].map((item) => (
                  <div key={item} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 11, color: C.text, lineHeight: 1.65 }}>
                    <span style={{ width: 18, height: 18, borderRadius: 999, background: "#fff9f1", border: "1px solid #d7c2a4", display: "inline-flex", alignItems: "center", justifyContent: "center", color: C.accent, flexShrink: 0 }}>
                      {Ic.check({ size: 11, color: C.accent })}
                    </span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Button ch={<><span style={{ display: "inline-flex" }}>{Ic.folder({ size: 13 })}</span> Simpan ke Proyek</>} onClick={onOpenProjects} size="sm" />
                <div style={{ fontSize: 11, color: "#8b5a2b", lineHeight: 1.6, display: "flex", alignItems: "center" }}>
                  Butuh kurang dari 1 menit untuk pilih atau buat project baru.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="stage-shell">
        {error && <ErrorBox msg={error} onClose={onClearError} />}
        {children}
      </div>
    </>
  );
}
