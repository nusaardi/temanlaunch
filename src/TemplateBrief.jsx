import { useMemo, useState } from "react";
import { LANDING_PAGE_BRIEF_FIELDS, STARTER_BRIEF_KITS, createLandingPageBrief } from "../shared/landingPage.js";

const PRIMARY_FIELDS = ["productName", "targetMarket", "offer", "price", "usp", "benefitMain"];
const ADVANCED_FIELDS = ["socialProof", "guarantee", "faq", "tone", "ctaWhatsapp", "ctaCheckout"];

function pickFields(keys) {
  return keys
    .map((key) => LANDING_PAGE_BRIEF_FIELDS.find((field) => field.key === key))
    .filter(Boolean);
}

function Field({ field, value, onChange, palette }) {
  const commonStyle = {
    width: "100%",
    background: palette.inputBg,
    border: `1px solid ${palette.border}`,
    borderRadius: 18,
    padding: "13px 15px",
    color: palette.text,
    fontSize: 13,
    fontFamily: "inherit",
    lineHeight: 1.65,
  };

  return (
    <label style={{ display: "grid", gap: 8 }}>
      <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 0.2, color: palette.text }}>
        {field.label}
        {field.required && <span style={{ color: palette.accent }}> *</span>}
      </span>
      {field.multiline ? (
        <textarea
          rows={field.rows || 3}
          value={value || ""}
          onChange={(event) => onChange(field.key, event.target.value)}
          placeholder={field.placeholder}
          style={{ ...commonStyle, resize: "vertical", minHeight: field.rows ? field.rows * 24 : 96 }}
        />
      ) : (
        <input
          value={value || ""}
          onChange={(event) => onChange(field.key, event.target.value)}
          placeholder={field.placeholder}
          style={commonStyle}
        />
      )}
    </label>
  );
}

export default function TemplateBrief({
  value,
  onChange,
  onSubmit,
  onApplyStarterKit,
  onQuickStartStarterKit,
  loading = false,
  projectName = "",
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const brief = useMemo(() => createLandingPageBrief(value), [value]);
  const primaryFields = useMemo(() => pickFields(PRIMARY_FIELDS), []);
  const advancedFields = useMemo(() => pickFields(ADVANCED_FIELDS), []);

  const palette = {
    panel: "linear-gradient(180deg, #fffaf0 0%, #f6ecdc 100%)",
    border: "#cfbea0",
    inputBg: "#fffdf7",
    text: "#1d2a21",
    muted: "#5a6757",
    dim: "#8c8578",
    accent: "#1f6b4a",
    accentSoft: "#e7f1eb",
    caution: "#a86533",
  };

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <div style={{ borderRadius: 32, border: `1px solid ${palette.border}`, background: palette.panel, padding: "22px clamp(18px,3vw,28px)", boxShadow: "0 18px 42px #5d43210e" }}>
        <div style={{ display: "grid", gap: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 14, alignItems: "flex-start", flexWrap: "wrap" }}>
            <div style={{ maxWidth: 720 }}>
              <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: 2, textTransform: "uppercase", color: palette.accent, marginBottom: 10 }}>
                Template Brief
              </div>
              <div style={{ fontSize: "clamp(1.8rem,3vw,2.7rem)", lineHeight: 0.98, letterSpacing: -1.1, color: palette.text, fontFamily: "'Fraunces', 'Georgia', serif", marginBottom: 10 }}>
                Isi bahan produk sekali, lalu biarkan wizard menyusun arah campaign awal.
              </div>
              <div style={{ fontSize: 13, lineHeight: 1.85, color: palette.muted }}>
                Jalur ini cocok untuk produk yang belum punya landing page. Fokus dulu ke nama produk, siapa targetnya, offer inti, dan hasil yang paling ingin dibeli market.
              </div>
            </div>
            <div style={{ minWidth: 220, display: "grid", gap: 8 }}>
              <div style={{ padding: "12px 14px", borderRadius: 18, border: `1px solid ${palette.border}`, background: "#fffdf8" }}>
                <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1.6, fontWeight: 800, color: palette.dim, marginBottom: 6 }}>Project aktif</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: palette.text }}>{projectName || "Session lokal"}</div>
                <div style={{ fontSize: 11, color: palette.muted, lineHeight: 1.65, marginTop: 6 }}>
                  Brief ini tetap bisa dipakai meski kamu belum memilih project.
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <span style={{ background: palette.accentSoft, color: palette.accent, border: `1px solid ${palette.accent}22`, borderRadius: 999, padding: "5px 11px", fontSize: 11, fontWeight: 700 }}>Tanpa landing page</span>
                <span style={{ background: "#fff1e3", color: palette.caution, border: `1px solid ${palette.caution}22`, borderRadius: 999, padding: "5px 11px", fontSize: 11, fontWeight: 700 }}>Masuk ke audience lebih cepat</span>
              </div>
            </div>
          </div>

          <div style={{ borderRadius: 24, border: `1px solid ${palette.border}`, background: "#fffdf8", padding: "18px 18px 16px" }}>
            <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: 1.8, textTransform: "uppercase", color: palette.accent, marginBottom: 10 }}>
              Mulai dari Nol
            </div>
            <div style={{ fontSize: 15, fontWeight: 800, color: palette.text, marginBottom: 8 }}>
              Kalau bingung mulai dari mana, jawab 3 pertanyaan ini dulu.
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginBottom: 14 }}>
              {[
                {
                  label: "Apa yang kamu jual?",
                  key: "productName",
                  placeholder: "Contoh: Serum wajah, jasa ads, kelas konten",
                },
                {
                  label: "Siapa yang paling mungkin beli?",
                  key: "targetMarket",
                  placeholder: "Contoh: owner UMKM yang sudah jualan tapi iklannya belum stabil",
                  multiline: true,
                },
                {
                  label: "Hasil utama yang dijanjikan?",
                  key: "benefitMain",
                  placeholder: "Contoh: bikin order lebih rapi tanpa trial-error terlalu lama",
                  multiline: true,
                },
              ].map((item) => (
                <label key={item.key} style={{ display: "grid", gap: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: palette.text }}>{item.label}</span>
                  {item.multiline ? (
                    <textarea
                      rows={3}
                      value={brief[item.key] || ""}
                      onChange={(event) => onChange(item.key, event.target.value)}
                      placeholder={item.placeholder}
                      style={{ width: "100%", background: palette.inputBg, border: `1px solid ${palette.border}`, borderRadius: 16, padding: "12px 14px", color: palette.text, fontSize: 13, fontFamily: "inherit", lineHeight: 1.65, resize: "vertical" }}
                    />
                  ) : (
                    <input
                      value={brief[item.key] || ""}
                      onChange={(event) => onChange(item.key, event.target.value)}
                      placeholder={item.placeholder}
                      style={{ width: "100%", background: palette.inputBg, border: `1px solid ${palette.border}`, borderRadius: 16, padding: "12px 14px", color: palette.text, fontSize: 13, fontFamily: "inherit", lineHeight: 1.65 }}
                    />
                  )}
                </label>
              ))}
            </div>
            <div style={{ fontSize: 11, lineHeight: 1.7, color: palette.dim }}>
              Tiga jawaban ini sudah cukup untuk mulai. Detail seperti harga, FAQ, dan CTA bisa kamu isi setelahnya atau belakangan.
            </div>
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: palette.text, marginBottom: 4 }}>Pakai contoh siap edit</div>
                <div style={{ fontSize: 11, lineHeight: 1.7, color: palette.dim }}>
                  Pilih salah satu starter kit kalau kamu ingin lihat contoh brief yang sudah terisi.
                </div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
              {STARTER_BRIEF_KITS.map((starter) => (
                <div
                  key={starter.id}
                  style={{ textAlign: "left", borderRadius: 20, border: `1px solid ${palette.border}`, background: "#fffdf8", padding: "14px 15px", display: "grid", gap: 8 }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: palette.text }}>{starter.label}</div>
                    <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: 1.2, textTransform: "uppercase", color: palette.accent }}>Starter</span>
                  </div>
                  <div style={{ fontSize: 11, color: palette.muted, lineHeight: 1.7 }}>{starter.summary}</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", paddingTop: 2 }}>
                    <button
                      type="button"
                      onClick={() => onQuickStartStarterKit?.(starter.id)}
                      disabled={loading}
                      style={{
                        border: "none",
                        borderRadius: 999,
                        padding: "9px 12px",
                        background: palette.accent,
                        color: "#f8f3e8",
                        fontSize: 11,
                        fontWeight: 800,
                        cursor: loading ? "not-allowed" : "pointer",
                        opacity: loading ? 0.7 : 1,
                      }}
                    >
                      {loading ? "Menjalankan..." : "Coba sekarang"}
                    </button>
                    <button
                      type="button"
                      onClick={() => onApplyStarterKit?.(starter.id)}
                      style={{
                        border: `1px solid ${palette.border}`,
                        borderRadius: 999,
                        padding: "9px 12px",
                        background: "#fffdf8",
                        color: palette.text,
                        fontSize: 11,
                        fontWeight: 800,
                        cursor: "pointer",
                      }}
                    >
                      Isi sebagai contoh
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 14 }}>
            {primaryFields.map((field) => (
              <div key={field.key} style={field.multiline ? { gridColumn: "1 / -1" } : null}>
                <Field field={field} value={brief[field.key]} onChange={onChange} palette={palette} />
              </div>
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", gap: 14, alignItems: "center", flexWrap: "wrap", paddingTop: 6, borderTop: `1px solid ${palette.border}` }}>
            <button
              type="button"
              onClick={() => setShowAdvanced((current) => !current)}
              style={{ background: "transparent", border: "none", padding: 0, cursor: "pointer", color: palette.accent, fontSize: 12, fontWeight: 800 }}
            >
              {showAdvanced ? "Sembunyikan detail lanjutan" : "Buka detail lanjutan"}
            </button>
            <div style={{ fontSize: 11, color: palette.dim }}>
              Detail lanjutan membantu AI memberi konteks lebih baik, tapi tidak wajib.
            </div>
          </div>

          {showAdvanced && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 14, padding: "16px 0 4px" }}>
              {advancedFields.map((field) => (
                <div key={field.key} style={field.multiline ? { gridColumn: "1 / -1" } : null}>
                  <Field field={field} value={brief[field.key]} onChange={onChange} palette={palette} />
                </div>
              ))}
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-end", flexWrap: "wrap", paddingTop: 6 }}>
            <div style={{ maxWidth: 640 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: palette.text, marginBottom: 6 }}>Yang akan dibuat wizard</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                {["Ringkasan produk", "6 target pembeli awal", "6 ide jualan awal", "1 teks iklan pertama"].map((item) => (
                  <span key={item} style={{ background: "#fffdf8", color: palette.muted, border: `1px solid ${palette.border}`, borderRadius: 999, padding: "5px 11px", fontSize: 11, fontWeight: 700 }}>
                    {item}
                  </span>
                ))}
              </div>
              <div style={{ fontSize: 11, lineHeight: 1.75, color: palette.dim }}>
                Setelah itu kamu masih bisa lanjut ke studio penuh untuk mengedit audience, angle, landing page, dan copy secara manual.
              </div>
            </div>
            <button
              type="button"
              onClick={() => onSubmit?.(brief)}
              disabled={loading}
              style={{
                border: "none",
                borderRadius: 999,
                padding: "14px 22px",
                background: "#1f6b4a",
                color: "#f8f3e8",
                fontSize: 13,
                fontWeight: 800,
                cursor: loading ? "not-allowed" : "pointer",
                minWidth: 220,
                boxShadow: "0 14px 28px #1f6b4a22",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Menjalankan Wizard..." : "Mulai dari Brief Ini"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
