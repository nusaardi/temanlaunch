import { useMemo, useState } from "react";

function splitCopyParts(copy = "") {
  const [caption = "", imagePrompt = ""] = String(copy || "").split("===IMAGE PROMPT===");
  return {
    caption: caption.trim(),
    imagePrompt: imagePrompt.trim(),
  };
}

function truncate(text, max = 220) {
  const clean = String(text || "").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max).trim()}...`;
}

function MiniCard({ eyebrow, title, detail, tone = "#1f6b4a", children }) {
  return (
    <div style={{ borderRadius: 24, border: `1px solid ${tone}24`, background: `${tone}0d`, padding: "16px 16px 15px" }}>
      <div style={{ fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 900, color: tone, marginBottom: 8 }}>
        {eyebrow}
      </div>
      <div style={{ fontSize: 17, fontWeight: 800, color: "#1f2a20", lineHeight: 1.25, marginBottom: 7 }}>
        {title}
      </div>
      {detail && <div style={{ fontSize: 12, lineHeight: 1.75, color: "#536151" }}>{detail}</div>}
      {children}
    </div>
  );
}

export default function CampaignPack({
  analysis,
  audiences = [],
  angles = [],
  copy = "",
  project,
  onOpenStudio,
  onOpenAdvancedStudio,
  onOpenTab,
}) {
  const [copied, setCopied] = useState(false);
  const topAudiences = audiences.slice(0, 3);
  const topAngles = angles.slice(0, 3);
  const { caption, imagePrompt } = useMemo(() => splitCopyParts(copy), [copy]);

  const copyCaption = async () => {
    if (!caption) return;
    await navigator.clipboard.writeText(caption);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ borderRadius: 28, border: "1px solid #cfbea1", background: "linear-gradient(180deg, #fff9f1 0%, #f3e8d8 100%)", padding: "20px 20px 18px", boxShadow: "0 16px 40px #5d43210d" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
          <div style={{ maxWidth: 720 }}>
            <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 2, fontWeight: 900, color: "#1f6b4a", marginBottom: 8 }}>
              Campaign Pack
            </div>
            <div style={{ fontFamily: "'Fraunces', 'Georgia', serif", fontSize: 30, lineHeight: 0.98, letterSpacing: -0.9, color: "#1f2a20", marginBottom: 9 }}>
              Paket jualan awal yang bisa langsung kamu pakai.
            </div>
            <div style={{ fontSize: 13, color: "#536151", lineHeight: 1.8 }}>
              Bukan hasil mentah per step. Di sini kamu langsung dapat ringkasan produk, target pembeli utama, ide jualan awal, teks iklan pertama, dan arahan visual yang siap dibawa ke eksekusi.
            </div>
          </div>
          <div style={{ display: "grid", gap: 10, minWidth: 250 }}>
            <div style={{ padding: "12px 14px", borderRadius: 18, border: "1px solid #cfbea1", background: "#fffdf8" }}>
              <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 800, color: "#8d8579", marginBottom: 6 }}>Siap dipakai di</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#1f2a20" }}>{project?.name || "Session lokal"}</div>
              <div style={{ fontSize: 11, color: "#5b6757", lineHeight: 1.65, marginTop: 6 }}>Kalau hasilnya cocok, lanjutkan ke editor untuk mengubah detail atau membuat halaman jualannya.</div>
            </div>
            <div style={{ fontSize: 11, lineHeight: 1.6, color: "#6b6356" }}>
              Tiga langkah paling masuk akal setelah hasil jadi:
            </div>
            <div style={{ display: "grid", gap: 8 }}>
              <button type="button" onClick={copyCaption} disabled={!caption} style={{ display: "flex", justifyContent: "center", alignItems: "center", border: "none", borderRadius: 999, padding: "12px 15px", background: caption ? "#1f6b4a" : "#d7d1c4", color: "#f8f3e8", fontSize: 12, fontWeight: 800, cursor: caption ? "pointer" : "not-allowed" }}>
                {copied ? "Tersalin" : "Salin teks iklan"}
              </button>
              <button type="button" onClick={() => onOpenStudio?.()} style={{ display: "flex", justifyContent: "center", alignItems: "center", border: "none", borderRadius: 999, padding: "12px 15px", background: "#1f6b4a", color: "#f8f3e8", fontSize: 12, fontWeight: 800, cursor: "pointer" }}>
                Rapikan hasil
              </button>
              <button type="button" onClick={() => onOpenTab?.("landing")} style={{ display: "flex", justifyContent: "center", alignItems: "center", border: "1px solid #cfbea1", borderRadius: 999, padding: "12px 15px", background: "#fffdf7", color: "#1f2a20", fontSize: 12, fontWeight: 800, cursor: "pointer" }}>
                Buat halaman jualan
              </button>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              <button type="button" onClick={() => onOpenTab?.("copy")} style={{ border: "none", background: "transparent", padding: 0, width: "fit-content", fontSize: 11, fontWeight: 700, color: "#5b6757", cursor: "pointer" }}>
                Lihat teks lengkap
              </button>
              <button type="button" onClick={() => onOpenTab?.("angle")} style={{ border: "none", background: "transparent", padding: 0, width: "fit-content", fontSize: 11, fontWeight: 700, color: "#5b6757", cursor: "pointer" }}>
                Bandingkan ide lain
              </button>
              <button type="button" onClick={() => onOpenAdvancedStudio?.()} style={{ border: "none", background: "transparent", padding: 0, width: "fit-content", fontSize: 11, fontWeight: 700, color: "#5b6757", cursor: "pointer" }}>
                Buka studio lanjutan
              </button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
        <MiniCard
          eyebrow="Yang dijual"
          title={analysis?.produk || "Produk belum terbaca"}
          detail={analysis?.offer_inti || "Offer utama belum tersedia."}
          tone="#1f6b4a"
        >
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
            {analysis?.usp && <span style={{ background: "#fffdf8", border: "1px solid #cfbea1", borderRadius: 999, padding: "5px 10px", fontSize: 11, color: "#5b6757", fontWeight: 700 }}>{analysis.usp}</span>}
            {analysis?.cta_utama && <span style={{ background: "#fffdf8", border: "1px solid #cfbea1", borderRadius: 999, padding: "5px 10px", fontSize: 11, color: "#5b6757", fontWeight: 700 }}>CTA: {analysis.cta_utama}</span>}
          </div>
        </MiniCard>

        <MiniCard
          eyebrow="Target utama"
          title={topAudiences[0]?.nama || "Belum ada target"}
          detail={topAudiences[0]?.pain_utama || "Wizard belum menemukan segment yang paling prioritas."}
          tone="#b26b36"
        >
          {topAudiences.length > 0 && (
            <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
              {topAudiences.map((audience) => (
                <div key={`${audience.id}-${audience.nama}`} style={{ background: "#fffdf8", border: "1px solid #cfbea1", borderRadius: 16, padding: "10px 12px" }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: "#1f2a20", marginBottom: 4 }}>{audience.nama}</div>
                  <div style={{ fontSize: 11, color: "#536151", lineHeight: 1.65 }}>{truncate(audience.deskripsi || audience.dream_outcome, 120)}</div>
                </div>
              ))}
            </div>
          )}
        </MiniCard>

        <MiniCard
          eyebrow="Sudut pesan"
          title={topAngles[0]?.teknik || "Belum ada ide jualan"}
          detail={topAngles[0]?.hook || "Wizard belum sempat menyusun angle utama."}
          tone="#2d7973"
        >
          {topAngles.length > 0 && (
            <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
              {topAngles.map((angle) => (
                <div key={`${angle.id}-${angle.teknik}`} style={{ background: "#fffdf8", border: "1px solid #cfbea1", borderRadius: 16, padding: "10px 12px" }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: "#1f2a20", marginBottom: 4 }}>{angle.teknik}</div>
                  <div style={{ fontSize: 11, color: "#536151", lineHeight: 1.65 }}>{truncate(angle.hook, 120)}</div>
                </div>
              ))}
            </div>
          )}
        </MiniCard>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.12fr) minmax(260px, .88fr)", gap: 14 }}>
        <div style={{ borderRadius: 26, border: "1px solid #cfbea1", background: "#fffaf2", padding: "18px 18px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", marginBottom: 10, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1.6, fontWeight: 900, color: "#6e5568", marginBottom: 6 }}>Teks iklan pertama</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#1f2a20" }}>Draft yang bisa langsung dipakai atau diedit</div>
            </div>
            <div style={{ fontSize: 11, color: "#7a6d60" }}>Aksi utama sudah ada di bagian atas pack ini.</div>
          </div>
          <div style={{ borderRadius: 18, border: "1px solid #ded4c0", background: "#fffdf8", padding: "14px 15px", fontSize: 12, color: "#304132", lineHeight: 1.9, whiteSpace: "pre-wrap", minHeight: 164 }}>
            {caption || "Teks iklan pertama akan muncul di sini setelah wizard selesai."}
          </div>
        </div>

        <div style={{ borderRadius: 26, border: "1px solid #cfbea1", background: "linear-gradient(180deg, #f7fbfb 0%, #edf6f5 100%)", padding: "18px 18px 16px" }}>
          <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1.6, fontWeight: 900, color: "#2d7973", marginBottom: 6 }}>Arahan visual</div>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#1f2a20", marginBottom: 10 }}>Pegangan cepat untuk gambar iklan</div>
          <div style={{ fontSize: 12, color: "#536151", lineHeight: 1.8 }}>
            {imagePrompt
              ? truncate(imagePrompt, 360)
              : topAngles[0]?.hook
                ? `Mulai dari hook "${truncate(topAngles[0].hook, 90)}", lalu buat visual yang mendukung janji utama produk tanpa terlihat seperti poster penuh teks.`
                : "Begitu copy selesai, wizard akan menampilkan arahan visual di sini."}
          </div>
          <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid #cfe0dd", fontSize: 11, lineHeight: 1.7, color: "#536151" }}>
            Fokus halaman ini tetap ke paket awal yang siap dipakai. Kalau ingin bongkar semua opsi, buka detail dari baris aksi kecil di atas.
          </div>
        </div>
      </div>
    </div>
  );
}
