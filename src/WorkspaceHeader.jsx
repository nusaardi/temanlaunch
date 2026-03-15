export default function WorkspaceHeader({
  C,
  Ic,
  Btn,
  Pill,
  SHELL_MAX,
  advancedMode,
  surfaceMode,
  onToggleSurface,
  onOpenAdvancedStudio,
  onOpenSimpleStudio,
  project,
  stageFramework,
  stageGoalPreset,
  settings,
  SLANG_LEVELS,
  analysis,
  history,
  usageSummary,
  user,
  isDemoMode,
  onOpenProjects,
  onSaveProject,
  onLogout,
}) {
  const Button = Btn;
  const Badge = Pill;
  const contextLine = surfaceMode === "wizard"
    ? isDemoMode
      ? "Sample launch desk yang aman dipakai untuk demo desktop."
      : "Masuk dari brief atau link, keluar dengan launch pack awal."
    : advancedMode
      ? `${stageFramework?.label || "Studio"} · ${SLANG_LEVELS.find((item) => item.val === settings.slangLevel)?.label || "Bahasa aktif"} · Launch desk lanjutan`
      : `Editor ringkas untuk ${stageGoalPreset?.shortLabel || "campaign"} yang sedang kamu rapikan.`;
  const primaryLabel = surfaceMode === "wizard" ? "Buka Editor Ringkas" : "Kembali ke Wizard";
  const modeToggle = surfaceMode === "wizard"
    ? { label: "Studio Lanjutan", onClick: onOpenAdvancedStudio }
    : advancedMode
      ? { label: "Studio Sederhana", onClick: onOpenSimpleStudio }
      : { label: "Mode Lanjutan", onClick: onOpenAdvancedStudio };
  const showCredits = advancedMode && usageSummary?.wallet;
  const projectButtonLabel = project
    ? "Ganti Proyek"
    : surfaceMode === "wizard"
      ? "Simpan Hasil"
      : "Pilih Proyek";

  return (
    <div style={{ background: "#fbf7efcf", borderBottom: `1px solid ${C.border}`, padding: "12px 24px 14px", position: "sticky", top: 0, zIndex: 100, backdropFilter: "blur(16px)" }}>
      <div style={{ maxWidth: SHELL_MAX, margin: "0 auto", display: "grid", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 18, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ background: `linear-gradient(135deg,${C.accent},${C.mid})`, width: 40, height: 40, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 12px 26px #1f6b4a20" }}>{Ic.rocket({ size: 18, color: "#fffaf2" })}</div>
            <div style={{ display: "grid", gap: 4 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <div style={{ fontWeight: 900, fontSize: 16, letterSpacing: -0.4 }}>TemanLaunch</div>
                <span style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1.8, color: C.dim, fontWeight: 800 }}>
                  {surfaceMode === "wizard" ? "Launch Flow" : advancedMode ? "Launch Desk Pro" : "Launch Desk"}
                </span>
                {isDemoMode && <Badge ch="Demo Mode" color={C.orange} sm />}
              </div>
              <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.6 }}>
                {contextLine}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
            <div style={{ display: "grid", gap: 2, justifyItems: "end" }}>
              <div style={{ fontSize: 10, color: C.dim, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 800 }}>Workspace</div>
              <div style={{ fontSize: 12, color: C.text, fontWeight: 700, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
                {user.display_name || user.username}
                {user?.is_admin && <Badge ch={<><span style={{ display: "inline-flex" }}>{Ic.shield({ size: 10, color: C.red })}</span> admin</>} color={C.red} sm />}
              </div>
            </div>
            <Button ch={<><span style={{ display: "inline-flex" }}>{Ic.logOut({ size: 12 })}</span> {isDemoMode ? "Keluar Demo" : "Logout"}</>} onClick={onLogout} v="g" size="sm" />
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap", paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            {project && <Badge ch={<><span style={{ display: "inline-flex" }}>{Ic.folder({ size: 10, color: C.accent })}</span> {project.name}</>} color={C.accent} />}
            {!project && surfaceMode === "wizard" && <Badge ch="Sesi masih sementara" color={C.orange} />}
            {isDemoMode && <Badge ch="Sample launch pack preset" color={C.orange} />}
            {analysis?.produk && <Badge ch={analysis.produk} color={C.cyan} />}
            {history.length > 0 && <Badge ch={<><span style={{ display: "inline-flex", marginRight: 3 }}>{Ic.bookOpen({ size: 10, color: C.cyan })}</span> {history.length} draft</>} color={C.cyan} />}
            {showCredits && <Badge ch={`Sisa kredit: ${usageSummary.wallet.balanceCredits} cr`} color={usageSummary.wallet.balanceCredits > 0 ? C.accent : C.orange} />}
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
            <Button ch={primaryLabel} onClick={onToggleSurface} size="sm" />
            <Button ch={modeToggle.label} onClick={modeToggle.onClick} v="g" size="sm" />
            {!isDemoMode && <Button ch={<><span style={{ display: "inline-flex" }}>{Ic.folder({ size: 13 })}</span> {projectButtonLabel}</>} onClick={onOpenProjects} v="s" size="sm" />}
            {!isDemoMode && project && <Button ch={<><span style={{ display: "inline-flex" }}>{Ic.save({ size: 13 })}</span> Simpan</>} onClick={onSaveProject} v="s" size="sm" />}
          </div>
        </div>
      </div>
    </div>
  );
}
