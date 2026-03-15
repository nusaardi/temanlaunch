import TemplateBrief from "./TemplateBrief.jsx";
import CampaignPack from "./CampaignPack.jsx";

const STEP_LABELS = {
  input: "Input",
  process: "AI Process",
  output: "Output",
};

function stepTone(status) {
  if (status === "done") return { bg: "#eaf5ee", fg: "#1f6b4a", bd: "#1f6b4a33" };
  if (status === "active") return { bg: "#f7f1e4", fg: "#8d6428", bd: "#b57a2a33" };
  if (status === "error") return { bg: "#fbeeea", fg: "#a74a34", bd: "#a74a3428" };
  return { bg: "#f5efe4", fg: "#7f7462", bd: "#ccbea33d" };
}

function ProcessRow({ title, detail, status }) {
  const tone = stepTone(status);
  const label = status === "done" ? "Selesai" : status === "active" ? "Sedang jalan" : status === "error" ? "Perlu dicek" : "Menunggu";

  return (
    <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 12, alignItems: "center", padding: "14px 15px", borderRadius: 18, border: `1px solid ${tone.bd}`, background: tone.bg }}>
      <div style={{ width: 30, height: 30, borderRadius: 999, border: `1px solid ${tone.bd}`, display: "grid", placeItems: "center", color: tone.fg, fontWeight: 900, fontSize: 13 }}>
        {status === "done" ? "✓" : status === "active" ? "•" : status === "error" ? "!" : "·"}
      </div>
      <div>
        <div style={{ fontSize: 12, fontWeight: 800, color: "#1f2a20", marginBottom: 4 }}>{title}</div>
        <div style={{ fontSize: 11, lineHeight: 1.65, color: "#596557" }}>{detail}</div>
      </div>
      <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", color: tone.fg }}>
        {label}
      </div>
    </div>
  );
}

function SummaryCard({ label, value, detail, tone }) {
  return (
    <div style={{ borderRadius: 22, border: `1px solid ${tone}28`, background: `${tone}0d`, padding: "16px 16px 15px" }}>
      <div style={{ fontSize: 10, letterSpacing: 1.6, textTransform: "uppercase", fontWeight: 800, color: tone, marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ fontSize: 16, fontWeight: 800, color: "#1f2a20", lineHeight: 1.25, marginBottom: 6 }}>
        {value}
      </div>
      <div style={{ fontSize: 11, lineHeight: 1.65, color: "#596557" }}>
        {detail}
      </div>
    </div>
  );
}

export default function WizardFlow({
  sourceMode = "url",
  onSourceModeChange,
  goalPreset,
  goalPresets = [],
  onGoalPresetChange,
  urlValue = "",
  onUrlChange,
  onRunFromUrl,
  briefValue,
  onBriefChange,
  onRunFromBrief,
  onApplyStarterKit,
  onQuickStartStarterKit,
  wizardProgress,
  loading = false,
  project,
  analysis,
  audiences = [],
  angles = [],
  copy = "",
  onOpenStudio,
  onOpenAdvancedStudio,
  onOpenTab,
}) {
  const panel = {
    surface: "linear-gradient(180deg, #fdf8ef 0%, #f5ecdd 100%)",
    border: "#cfbea1",
    text: "#1f2a20",
    muted: "#5b6757",
    dim: "#8d8579",
    accent: "#1f6b4a",
    orange: "#b26b36",
    cyan: "#2d7973",
    purple: "#6e5568",
  };

  const activeStep = wizardProgress?.phase || "input";
  const hasOutput = Boolean(analysis || audiences.length || copy);
  const stepMap = wizardProgress?.steps || {};

  return (
    <section style={{ display: "grid", gap: 20, marginBottom: 26 }}>
      <div style={{ position: "relative", overflow: "hidden", borderRadius: 34, border: `1px solid ${panel.border}`, background: "linear-gradient(135deg, #fcf6ea 0%, #f1e0bf 48%, #ead7b1 100%)", padding: "clamp(22px,4vw,34px)", boxShadow: "0 24px 70px #5c412110" }}>
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(circle at top right, rgba(255,255,255,.55), transparent 28%), radial-gradient(circle at 12% 18%, rgba(31,107,74,.10), transparent 26%)" }} />
        <div style={{ position: "relative", display: "grid", gap: 22 }}>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.12fr) minmax(260px,.88fr)", gap: 18, alignItems: "end" }}>
            <div>
              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 2.2, fontWeight: 900, color: panel.accent, marginBottom: 10 }}>
                Angle 2 Wizard
              </div>
              <div style={{ fontFamily: "'Fraunces', 'Georgia', serif", fontSize: "clamp(2.2rem,5vw,4.6rem)", lineHeight: 0.93, letterSpacing: -1.5, color: panel.text, maxWidth: "10.5ch", marginBottom: 12 }}>
                Masuk dari link atau brief, lalu keluar dengan bahan campaign awal.
              </div>
              <div style={{ maxWidth: 620, fontSize: 14, lineHeight: 1.85, color: panel.muted }}>
                Wizard ini membungkus flow yang sudah ada menjadi urutan yang lebih tenang: pilih bahan, jalankan AI, review hasil awal, lalu masuk ke editor sederhana. Studio penuh tetap ada kalau kamu ingin menyunting lebih detail.
              </div>
            </div>
            <div style={{ justifySelf: "stretch", display: "grid", gap: 12 }}>
              <div style={{ borderRadius: 24, border: `1px solid ${panel.border}`, background: "#fff9f1cc", padding: "16px 16px 14px" }}>
                <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1.7, fontWeight: 800, color: panel.dim, marginBottom: 6 }}>{project ? "Project aktif" : "Sesi saat ini"}</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: panel.text }}>{project?.name || "Session lokal"}</div>
                <div style={{ fontSize: 11, color: panel.muted, lineHeight: 1.65, marginTop: 6 }}>
                  {project
                    ? "Semua hasil wizard berikutnya akan langsung masuk ke project ini, jadi konteks campaign tetap rapih."
                    : "Semua hasil wizard tetap bisa jalan tanpa project, tapi akan lebih rapi kalau nanti kamu menyimpannya ke project aktif."}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {Object.entries(STEP_LABELS).map(([key, label], index) => {
                  const status = key === activeStep ? "active" : key === "output" && hasOutput ? "done" : index === 0 && activeStep !== "input" ? "done" : "idle";
                  const tone = stepTone(status);
                  return (
                    <span key={key} style={{ display: "inline-flex", alignItems: "center", gap: 7, borderRadius: 999, border: `1px solid ${tone.bd}`, background: tone.bg, color: tone.fg, padding: "7px 12px", fontSize: 11, fontWeight: 800 }}>
                      <span style={{ width: 18, height: 18, borderRadius: 999, background: "#fff7", display: "grid", placeItems: "center", fontSize: 10 }}>{index + 1}</span>
                      {label}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 14 }}>
            <SummaryCard label="Jalur cepat" value="URL landing page" detail="Tempel link produk, wizard akan scrape lalu meringkasnya jadi bahan audience pertama." tone={panel.accent} />
            <SummaryCard label="Jalur tanpa LP" value="Template brief" detail="Isi bahan produk manual untuk mulai dari offer inti, target market, dan pembeda." tone={panel.orange} />
            <SummaryCard label="Output awal" value="Target pembeli, ide jualan, dan copy pertama" detail="Wizard menyusun hasil awal supaya kamu tidak harus lompat ke banyak tab dulu." tone={panel.cyan} />
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.08fr) minmax(300px,.92fr)", gap: 18, alignItems: "start" }}>
        <div style={{ borderRadius: 30, border: `1px solid ${panel.border}`, background: panel.surface, padding: "24px clamp(18px,3vw,26px)", boxShadow: "0 16px 42px #5d432108" }}>
          <div style={{ display: "grid", gap: 16 }}>
            <div>
              <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 2, fontWeight: 900, color: panel.accent, marginBottom: 8 }}>
                Step 1
              </div>
              <div style={{ fontFamily: "'Fraunces', 'Georgia', serif", fontSize: 32, lineHeight: 0.98, letterSpacing: -0.9, color: panel.text, marginBottom: 8 }}>
                Pilih goal dan bahan campaign pertama.
              </div>
              <div style={{ fontSize: 13, lineHeight: 1.8, color: panel.muted }}>
                Tentukan dulu tipe jualannya supaya wizard otomatis memilih arah kerja paling masuk akal. Setelah itu baru masuk dari link produk atau brief manual.
              </div>
            </div>

            <div style={{ display: "grid", gap: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: panel.text }}>Goal utama</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 10 }}>
                {goalPresets.map((preset) => {
                  const active = goalPreset === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => onGoalPresetChange?.(preset.id)}
                      style={{
                        textAlign: "left",
                        borderRadius: 20,
                        border: `1px solid ${active ? panel.accent : panel.border}`,
                        background: active ? "#edf6f0" : "#fffdf8",
                        padding: "14px 15px",
                        cursor: "pointer",
                        display: "grid",
                        gap: 7,
                        boxShadow: active ? "0 12px 28px #1f6b4a14" : "none",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                        <div style={{ fontSize: 13, fontWeight: 800, color: panel.text }}>{preset.label}</div>
                        <span style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1.3, fontWeight: 900, color: active ? panel.accent : panel.dim }}>
                          {active ? "Aktif" : "Preset"}
                        </span>
                      </div>
                      <div style={{ fontSize: 11, lineHeight: 1.7, color: panel.muted }}>{preset.description}</div>
                    </button>
                  );
                })}
              </div>
              <div style={{ fontSize: 11, lineHeight: 1.7, color: panel.dim }}>
                Framework, gaya bahasa, dan format awal akan dipilih otomatis dari preset ini. Kalau mau utak-atik manual, buka studio lanjutan nanti.
              </div>
            </div>

            <div style={{ display: "inline-flex", gap: 6, background: "#f5ecde", border: `1px solid ${panel.border}`, borderRadius: 999, padding: 5, width: "fit-content", flexWrap: "wrap" }}>
              {[
                { id: "url", label: "Analisa Link" },
                { id: "brief", label: "Isi Brief Manual" },
              ].map((option) => {
                const active = sourceMode === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => onSourceModeChange?.(option.id)}
                    style={{
                      border: "none",
                      borderRadius: 999,
                      padding: "10px 16px",
                      background: active ? "#1f6b4a" : "transparent",
                      color: active ? "#f9f4ea" : panel.muted,
                      fontSize: 12,
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>

            {sourceMode === "url" ? (
              <div style={{ display: "grid", gap: 14 }}>
                <div style={{ display: "grid", gap: 8 }}>
                  <label style={{ fontSize: 11, fontWeight: 800, color: panel.text }}>Link landing page</label>
                  <input
                    value={urlValue}
                    onChange={(event) => onUrlChange?.(event.target.value)}
                    placeholder="contoh.com/produk-utama"
                    style={{ width: "100%", background: "#fffdf7", border: `1px solid ${panel.border}`, borderRadius: 18, padding: "14px 16px", color: panel.text, fontSize: 14 }}
                  />
                  <div style={{ fontSize: 11, lineHeight: 1.7, color: panel.dim }}>
                    Wizard akan membaca isi halaman, menyusun analysis, lalu langsung membangun audience pertama.
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ background: "#fffdf8", color: panel.muted, border: `1px solid ${panel.border}`, borderRadius: 999, padding: "5px 11px", fontSize: 11, fontWeight: 700 }}>Scrape aman</span>
                    <span style={{ background: "#fffdf8", color: panel.muted, border: `1px solid ${panel.border}`, borderRadius: 999, padding: "5px 11px", fontSize: 11, fontWeight: 700 }}>Analysis auto</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRunFromUrl?.(urlValue)}
                    disabled={loading || !String(urlValue || "").trim()}
                    style={{ border: "none", borderRadius: 999, padding: "14px 22px", background: "#1f6b4a", color: "#f8f3e8", fontSize: 13, fontWeight: 800, cursor: loading ? "not-allowed" : "pointer", minWidth: 210, opacity: loading || !String(urlValue || "").trim() ? 0.7 : 1 }}
                  >
                    {loading && activeStep === "process" ? "Sedang Berjalan..." : "Mulai dari Link Ini"}
                  </button>
                </div>
              </div>
            ) : (
              <TemplateBrief
                value={briefValue}
                onChange={onBriefChange}
                onSubmit={onRunFromBrief}
                onApplyStarterKit={onApplyStarterKit}
                onQuickStartStarterKit={onQuickStartStarterKit}
                loading={loading}
                projectName={project?.name || ""}
              />
            )}
          </div>
        </div>

        <div style={{ display: "grid", gap: 18 }}>
          <div style={{ borderRadius: 30, border: `1px solid ${panel.border}`, background: "linear-gradient(180deg, #fbf7ef 0%, #f1e7d7 100%)", padding: "22px 20px" }}>
            <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 2, fontWeight: 900, color: panel.orange, marginBottom: 8 }}>
              Step 2
            </div>
            <div style={{ fontFamily: "'Fraunces', 'Georgia', serif", fontSize: 28, lineHeight: 0.98, letterSpacing: -0.8, color: panel.text, marginBottom: 12 }}>
              Pantau proses AI tanpa perlu pindah menu.
            </div>
            <div style={{ display: "grid", gap: 10 }}>
              <ProcessRow title="Siapkan bahan" detail={sourceMode === "url" ? "Scrape dan ringkas landing page." : "Susun brief jadi analysis campaign."} status={stepMap.analysis || "idle"} />
              <ProcessRow title="Generate target pembeli" detail="Bangun 6 segment awal berdasarkan konteks produk." status={stepMap.audience || "idle"} />
              <ProcessRow title="Generate ide jualan pertama" detail="Ambil segment pertama dan turunkan 6 angle awal." status={stepMap.angle || "idle"} />
              <ProcessRow title="Generate teks iklan pertama" detail="Tuliskan satu draft awal agar editor tidak mulai dari halaman kosong." status={stepMap.copy || "idle"} />
            </div>
          </div>

          <div style={{ borderRadius: 30, border: `1px solid ${panel.border}`, background: "linear-gradient(180deg, #fffaf2 0%, #f3eadb 100%)", padding: "22px 20px" }}>
            <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 2, fontWeight: 900, color: panel.purple, marginBottom: 8 }}>
              Step 3
            </div>
            <div style={{ fontFamily: "'Fraunces', 'Georgia', serif", fontSize: 28, lineHeight: 0.98, letterSpacing: -0.8, color: panel.text, marginBottom: 12 }}>
              Review hasil awal lalu lanjut ke editor.
            </div>

            {!hasOutput ? (
              <div style={{ borderRadius: 22, border: `1px dashed ${panel.border}`, padding: "20px 18px", fontSize: 12, lineHeight: 1.8, color: panel.muted }}>
                Hasil wizard akan muncul di sini setelah proses berjalan. Begitu selesai, kamu langsung bisa lompat ke bagian yang relevan tanpa harus menata ulang konteks campaign dari awal.
              </div>
            ) : (
              <CampaignPack
                analysis={analysis}
                audiences={audiences}
                angles={angles}
                copy={copy}
                project={project}
                onOpenStudio={onOpenStudio}
                onOpenAdvancedStudio={onOpenAdvancedStudio}
                onOpenTab={onOpenTab}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
