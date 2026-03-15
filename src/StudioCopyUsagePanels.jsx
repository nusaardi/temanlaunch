import { useEffect, useState } from "react";

function IGPreview({ copy, angle, fmt, analysis, ui }) {
  const { C, FMT_ICON, Ic } = ui;
  const truncated = copy && copy.length > 180 ? copy.slice(0, 180) + "... more" : copy;
  const isStory = fmt === "Story";
  const isReel = fmt === "Reels";

  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "10px 0" }}>
      <div style={{ width: 260, background: "#000", borderRadius: 36, padding: "10px 6px", boxShadow: "0 24px 64px #000a, 0 0 0 1px #333", position: "relative" }}>
        <div style={{ width: 70, height: 20, background: "#000", borderRadius: 10, margin: "0 auto 6px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 40, height: 4, background: "#222", borderRadius: 4 }} />
        </div>

        <div style={{ background: "#fff", borderRadius: 26, overflow: "hidden", minHeight: isStory ? 420 : 360 }}>
          {isStory ? (
            <div style={{ background: "linear-gradient(160deg,#1a1a2e,#16213e,#0f3460)", minHeight: 420, padding: 16, display: "flex", flexDirection: "column", position: "relative" }}>
              <div style={{ display: "flex", gap: 3, marginBottom: 12 }}>
                {[1, 2, 3].map((item) => <div key={item} style={{ flex: 1, height: 2, background: item === 1 ? "#fff" : "#ffffff40", borderRadius: 2 }} />)}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: `linear-gradient(135deg,${C.accent},${C.cyan})`, display: "flex", alignItems: "center", justifyContent: "center" }}>{Ic.rocket({ size: 12, color: "#fff" })}</div>
                <div style={{ fontSize: 11, color: "#fff", fontWeight: 700 }}>{analysis?.produk?.slice(0, 16) || "Brand"}</div>
                <div style={{ fontSize: 10, color: "#ffffff70", marginLeft: "auto" }}>Sponsored</div>
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", padding: "0 8px" }}>
                <div style={{ fontSize: 16, fontWeight: 900, color: "#fff", lineHeight: 1.4, marginBottom: 12 }}>
                  {angle?.hook?.slice(0, 60) || "Hook iklan kamu tampil di sini"}
                </div>
                <div style={{ fontSize: 11, color: "#ffffffaa", lineHeight: 1.6 }}>
                  {truncated?.slice(0, 100) || "Copy iklan kamu..."}
                </div>
              </div>
              <div style={{ textAlign: "center", marginTop: 16 }}>
                <div style={{ fontSize: 10, color: "#ffffff80" }}>↑ Swipe Up</div>
                <div style={{ background: C.accent, borderRadius: 20, padding: "6px 20px", display: "inline-block", fontSize: 11, fontWeight: 800, color: "#000", marginTop: 6 }}>Lihat Sekarang</div>
              </div>
            </div>
          ) : isReel ? (
            <div style={{ background: "#111", minHeight: 400, position: "relative", overflow: "hidden" }}>
              <div style={{ background: "linear-gradient(180deg,transparent 40%,#000d 100%)", position: "absolute", inset: 0, zIndex: 1 }} />
              <div style={{ background: "linear-gradient(135deg,#1a3a2a,#0a1a12)", width: "100%", height: "100%", minHeight: 400, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ opacity: 0.3, display: "flex", justifyContent: "center" }}>{Ic.film({ size: 40, color: C.muted })}</div>
              </div>
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 40, padding: 14, zIndex: 2 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                  <div style={{ width: 24, height: 24, borderRadius: "50%", background: `linear-gradient(135deg,${C.accent},${C.cyan})`, flexShrink: 0 }} />
                  <div style={{ fontSize: 11, color: "#fff", fontWeight: 700 }}>{analysis?.produk?.slice(0, 14) || "Brand"}</div>
                  <div style={{ fontSize: 9, color: "#ffffff70", background: "#ffffff20", borderRadius: 4, padding: "1px 6px" }}>Sponsored</div>
                </div>
                <div style={{ fontSize: 12, color: "#fff", lineHeight: 1.6, marginBottom: 8 }}>
                  {truncated?.slice(0, 100) || "Copy iklan..."}
                </div>
                <div style={{ background: C.accent, borderRadius: 8, padding: "7px 14px", display: "inline-block", fontSize: 11, fontWeight: 800, color: "#000" }}>
                  {analysis?.cta_utama?.slice(0, 20) || "Cek Sekarang"}
                </div>
              </div>
              <div style={{ position: "absolute", right: 8, bottom: 60, zIndex: 2, display: "flex", flexDirection: "column", gap: 14, alignItems: "center" }}>
                {["heart", "comment", "share"].map((item) => (
                  <div key={item} style={{ textAlign: "center" }}>
                    <div style={{ display: "flex", justifyContent: "center" }}>{item === "heart" ? Ic.zap({ size: 18, color: "#fff" }) : item === "comment" ? Ic.chat({ size: 18, color: "#fff" }) : Ic.arrowR({ size: 18, color: "#fff" })}</div>
                    <div style={{ fontSize: 9, color: "#fff" }}>123</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px" }}>
                <div style={{ width: 30, height: 30, borderRadius: "50%", background: `linear-gradient(135deg,${C.accent},${C.cyan})`, display: "flex", alignItems: "center", justifyContent: "center" }}>{Ic.rocket({ size: 14, color: "#fff" })}</div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#000" }}>{analysis?.produk?.slice(0, 16) || "Brand Name"}</div>
                  <div style={{ fontSize: 9, color: "#888" }}>Sponsored · {fmt}</div>
                </div>
                <div style={{ marginLeft: "auto", fontSize: 16, color: "#888" }}>...</div>
              </div>
              <div style={{ background: `linear-gradient(135deg,${C.s3},${C.dim})`, height: 200, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <div style={{ opacity: 0.4, display: "flex", justifyContent: "center" }}>{FMT_ICON[fmt]?.({ size: 32, color: C.muted }) || fmt}</div>
                {angle && (
                  <div style={{ fontSize: 13, color: C.muted, textAlign: "center", padding: "0 24px", lineHeight: 1.5, fontStyle: "italic" }}>
                    "{angle.hook?.slice(0, 50)}..."
                  </div>
                )}
                {fmt === "Carousel" && (
                  <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                    {[1, 2, 3].map((item) => <div key={item} style={{ width: item === 1 ? 16 : 6, height: 6, borderRadius: 3, background: item === 1 ? C.accent : C.dim }} />)}
                  </div>
                )}
              </div>
              <div style={{ display: "flex", gap: 14, padding: "10px 12px 6px", fontSize: 18 }}>
                <span style={{ display: "flex", gap: 14, opacity: 0.5 }}>
                  <span style={{ display: "flex" }}>{Ic.zap({ size: 18, color: C.muted })}</span>
                  <span style={{ display: "flex" }}>{Ic.chat({ size: 18, color: C.muted })}</span>
                  <span style={{ display: "flex" }}>{Ic.arrowR({ size: 18, color: C.muted })}</span>
                </span>
                <span style={{ marginLeft: "auto" }}>{Ic.bookmark({ size: 18, color: C.muted })}</span>
              </div>
              <div style={{ padding: "0 12px 12px" }}>
                <div style={{ fontSize: 11, color: "#000", lineHeight: 1.6 }}>
                  <span style={{ fontWeight: 800 }}>{analysis?.produk?.slice(0, 12) || "brand"} </span>
                  {truncated?.slice(0, 120) || "Copy iklan kamu akan tampil di sini..."}
                </div>
                {copy && copy.length > 120 && (
                  <div style={{ fontSize: 10, color: "#888", marginTop: 3 }}>more</div>
                )}
                <div style={{ marginTop: 8, background: "#f5f5f5", borderRadius: 8, padding: "8px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 9, color: "#888" }}>{analysis?.produk || "Brand"}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#000" }}>{analysis?.cta_utama?.slice(0, 24) || "Cek Sekarang"}</div>
                  </div>
                  <div style={{ background: "#1877f2", borderRadius: 6, padding: "5px 10px", fontSize: 10, fontWeight: 700, color: "#fff", whiteSpace: "nowrap" }}>Pelajari Selengkapnya</div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "center", padding: "8px 0" }}>
          <div style={{ width: 80, height: 4, background: "#333", borderRadius: 4 }} />
        </div>
      </div>
    </div>
  );
}

export function TabCopy({ analysis, audience, angle, copy, history, onRegen, onGoTo, loading, fmt, setFmt, settings, advancedMode = false, onDeleteCopy, onToggleUsed, ui }) {
  const { Box, Btn, C, FMT_ICON, FRAMEWORKS, Ic, Lbl, Pill, SectionLead, SLANG_LEVELS, Spin, TC, Zero } = ui;
  const [notes, setNotes] = useState("");
  const [copied, setCopied] = useState(null);
  const [viewMode, setViewMode] = useState("copy");
  const hasActiveCopyContext = !!(angle || copy);

  const doCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const exportAll = () => {
    const txt = history.map((item, index) => `=== COPY ${index + 1} ===\nAudience: ${item.audience}\nAngle: ${item.angle} | Format: ${item.fmt}\n${item.time}\n\n${item.copy}\n`).join("\n\n");
    const blob = new Blob([txt], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `meta-ads-copy-${Date.now()}.txt`;
    link.click();
  };

  return (
    <div style={{ animation: "up .25s ease" }}>
      <SectionLead
        eyebrow="Teks Iklan"
        title="Tulis, cek preview, simpan, lalu tandai yang benar-benar dipakai."
        sub="Di sini kamu bisa fokus ke naskah utamanya, melihat bentuk preview sederhananya, lalu menyimpan hasil yang paling layak dipakai."
        aside={<Pill ch={`${history.length} draft tersimpan`} color={history.length ? C.cyan : C.orange} />}
      />
      <div style={{ display: "flex", gap: 2, background: C.s1, border: `1px solid ${C.border}`, borderRadius: 12, padding: 4, marginBottom: 16, width: "fit-content" }}>
        {[["copy", <><span style={{ display: "inline-flex" }}>{Ic.edit({ size: 12 })}</span> Teks</>], ["preview", <><span style={{ display: "inline-flex" }}>{Ic.phone({ size: 12 })}</span> Preview</>], ["history", <><span style={{ display: "inline-flex" }}>{Ic.bookOpen({ size: 12 })}</span> Arsip ({history.length})</>]].map(([mode, label]) => (
          <button key={mode} onClick={() => setViewMode(mode)} style={{ background: viewMode === mode ? C.s3 : "transparent", border: `1px solid ${viewMode === mode ? C.hi : "transparent"}`, borderRadius: 8, color: viewMode === mode ? C.text : C.muted, padding: "7px 14px", cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "inherit", transition: "all .15s" }}>{label}</button>
        ))}
      </div>

      {viewMode === "history" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}>{Ic.bookOpen({ size: 16 })} Semua Draft yang Pernah Dibuat</div>
            {history.length > 0 && <Btn ch={<><span style={{ display: "inline-flex" }}>{Ic.download({ size: 13 })}</span> Export Semua (.txt)</>} onClick={exportAll} v="s" size="sm" />}
          </div>
          {history.length === 0 && <Zero icon={Ic.bookOpen} title="Arsip draft masih kosong" sub="Tulis teks iklan dari tab Ide Jualan dulu, lalu hasilnya akan otomatis masuk ke sini." />}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {history.map((item) => (
              <Box key={item.id}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <Pill ch={item.audience} color={C.accent} sm />
                    <Pill ch={item.angle} color={TC[item.angle] || C.orange} sm />
                    <Pill ch={<><span style={{ display: "inline-flex", marginRight: 3 }}>{FMT_ICON[item.fmt]?.({ size: 10, color: C.muted })}</span>{item.fmt}</>} color={C.muted} sm />
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    {item.is_used ? (
                      <Btn ch={<span style={{ display: "inline-flex", gap: 5, alignItems: "center" }}>{Ic.check({ size: 12, color: "#fff" })} Digunakan</span>} onClick={() => onToggleUsed(item.id, item.is_used)} v="p" size="sm" style={{ padding: "0 10px", background: "#16a34a", borderColor: "#15803d" }} title="Batal tandai" />
                    ) : (
                      <Btn ch={<span style={{ display: "inline-flex", gap: 5, alignItems: "center" }}>{Ic.bookmark({ size: 12, color: C.muted })} Tandai Dipakai</span>} onClick={() => onToggleUsed(item.id, item.is_used)} v="s" size="sm" style={{ padding: "0 10px" }} title="Tandai copy ini dipakai" />
                    )}
                    <Btn ch={<span style={{ display: "inline-flex" }}>{Ic.trash({ size: 13, color: C.red })}</span>} onClick={() => { if (window.confirm("Hapus histori copy ini?")) onDeleteCopy(item.id); }} v="g" size="sm" style={{ padding: "0 6px", opacity: 0.6 }} title="Hapus Copy" />
                    <Btn ch={<span style={{ display: "inline-flex" }}>{copied === item.id ? Ic.check({ size: 13, color: "#fff" }) : Ic.copy({ size: 13 })}</span>} onClick={() => doCopy(item.copy, item.id)} v={copied === item.id ? "p" : "s"} size="sm" />
                  </div>
                </div>
                {(() => {
                  const parts = (item.copy || "").split("===IMAGE PROMPT===");
                  return (
                    <>
                      <div style={{ background: C.s1, borderRadius: 8, padding: "12px 16px", fontSize: 13, lineHeight: 2, color: "#2a4a2a", whiteSpace: "pre-wrap", fontFamily: "inherit", maxHeight: 200, overflowY: "auto" }}>{parts[0].trim()}</div>
                      {parts[1] && <div style={{ marginTop: 10, background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "12px 16px" }}>
                        <div style={{ fontSize: 11, fontWeight: 800, color: "#1e40af", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8, display: "flex", alignItems: "center", gap: 5 }}>{Ic.image({ size: 12, color: "#1e40af" })} Image Design Prompt</div>
                        <div style={{ fontSize: 12, lineHeight: 1.8, color: "#1e3a5f", whiteSpace: "pre-wrap" }}>{parts[1].trim()}</div>
                        <button onClick={() => doCopy(parts[1].trim(), `img-${item.id}`)} className="fb" style={{ marginTop: 8, background: copied === `img-${item.id}` ? "#16a34a" : "#1e40af", color: "#fff", border: "none", borderRadius: 6, padding: "5px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>{copied === `img-${item.id}` ? "Copied!" : "Copy Image Prompt"}</button>
                      </div>}
                    </>
                  );
                })()}
                <div style={{ fontSize: 10, color: C.dim, marginTop: 8, display: "flex", alignItems: "center", gap: 4 }}>{Ic.clock({ size: 10, color: C.dim })} {item.time}</div>
              </Box>
            ))}
          </div>
        </div>
      )}

      {viewMode === "preview" && (
        hasActiveCopyContext ? (
          <div className="copy-preview-grid">
            <div>
              <Box style={{ marginBottom: 12 }}>
                <Lbl ch={advancedMode ? "Format untuk Preview" : "Preview format awal"} />
                {advancedMode ? (
                  <div style={{ display: "flex", gap: 6 }}>
                    {["Static", "Carousel", "Reels", "Story"].map((item) => (
                      <button key={item} onClick={() => setFmt(item)} className="fb" style={{ background: fmt === item ? C.accent + "18" : "transparent", border: `1px solid ${fmt === item ? C.accent : C.border}`, borderRadius: 8, color: fmt === item ? C.accent : C.muted, padding: "7px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "all .15s" }}>
                        <span style={{ display: "inline-flex", marginRight: 4 }}>{FMT_ICON[item]?.({ size: 12 })}</span>{item}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: 12, lineHeight: 1.7, color: C.muted }}>
                    Mode sederhana menampilkan preview <strong style={{ color: C.text }}>{fmt}</strong> lebih dulu supaya kamu tidak perlu memilih placement dari awal.
                  </div>
                )}
              </Box>
              {copy && (
                <Box>
                  <Lbl ch="Teks iklan aktif" />
                  <div style={{ background: C.s1, borderRadius: 8, padding: "12px 16px", fontSize: 13, lineHeight: 2, color: "#2a4a2a", whiteSpace: "pre-wrap", fontFamily: "inherit" }}>{copy}</div>
                </Box>
              )}
              {!copy && <Zero icon={Ic.fileText} title="Teks iklan belum ada" sub="Tulis teks iklan dulu dari tab Ide Jualan, lalu preview akan muncul di sini." />}
            </div>
            <div style={{ position: "sticky", top: 80 }}>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 10, textAlign: "center", textTransform: "uppercase", letterSpacing: 1 }}>Preview {fmt}</div>
              <IGPreview copy={copy} angle={angle} fmt={fmt} analysis={analysis} ui={ui} />
            </div>
          </div>
        ) : (
          <Zero icon={Ic.phone} title="Preview belum siap" sub="Pilih satu ide jualan lalu buat teks iklannya dulu supaya bentuk preview bisa ditampilkan." />
        )
      )}

      {viewMode === "copy" && (
        <>
          {loading && !copy && <Spin msg="Sedang menulis teks iklan pertamamu..." />}
          {hasActiveCopyContext ? (
            <>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
                {audience && <Pill ch={audience.nama} color={C.accent} />}
                {angle && <Pill ch={angle.teknik} color={TC[angle.teknik] || C.accent} />}
                <Pill ch={<><span style={{ display: "inline-flex", marginRight: 3 }}>{FMT_ICON[fmt]?.({ size: 10, color: C.muted })}</span>{fmt}</>} color={C.muted} />
                {advancedMode && settings && <Pill ch={settings.framework} color={C.yellow} sm />}
              </div>

              {copy && (() => {
                const parts = copy.split("===IMAGE PROMPT===");
                const captionText = parts[0].trim();
                const imagePrompt = parts[1]?.trim();

                return (
                  <>
                    <Box style={{ marginBottom: 14 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                        <div style={{ fontWeight: 800, fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}>{Ic.fileText({ size: 15 })} {imagePrompt ? "Caption siap pakai" : "Teks iklan siap pakai"}</div>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <span style={{ fontSize: 11, color: C.muted }}>{captionText.length} karakter</span>
                          <Btn ch={<><span style={{ display: "inline-flex" }}>{copied === "main" ? Ic.check({ size: 13, color: "#fff" }) : Ic.copy({ size: 13 })}</span>{copied === "main" ? " Copied" : " Copy"}</>} onClick={() => doCopy(captionText, "main")} v={copied === "main" ? "p" : "s"} size="sm" />
                        </div>
                      </div>
                      <div style={{ background: C.s1, borderRadius: 10, padding: 20, fontSize: 14, lineHeight: 2.1, color: "#1a3a1a", whiteSpace: "pre-wrap", fontFamily: "inherit", border: `1px solid ${C.border}` }}>
                        {captionText}
                      </div>
                    </Box>

                    {imagePrompt && (
                      <Box style={{ marginBottom: 14, background: "#eff6ff", borderColor: "#bfdbfe" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                          <div style={{ fontWeight: 800, fontSize: 14, display: "flex", alignItems: "center", gap: 6, color: "#1e40af" }}>{Ic.image({ size: 15, color: "#1e40af" })} Image Design Prompt</div>
                          <Btn ch={<><span style={{ display: "inline-flex" }}>{copied === "imgprompt" ? Ic.check({ size: 13, color: "#fff" }) : Ic.copy({ size: 13 })}</span>{copied === "imgprompt" ? " Copied" : " Copy"}</>} onClick={() => doCopy(imagePrompt, "imgprompt")} v={copied === "imgprompt" ? "p" : "s"} size="sm" />
                        </div>
                        <div style={{ background: "#ffffff", borderRadius: 10, padding: 20, fontSize: 13, lineHeight: 2, color: "#1e3a5f", whiteSpace: "pre-wrap", fontFamily: "inherit", border: "1px solid #bfdbfe" }}>
                          {imagePrompt}
                        </div>
                        <div style={{ marginTop: 10, padding: "8px 12px", background: "#dbeafe", borderRadius: 8, fontSize: 11, color: "#1e40af", display: "flex", alignItems: "center", gap: 6 }}>
                          {Ic.alertTri({ size: 12, color: "#1e40af" })} Safe zone: Hindari teks di bawah 20% dan kanan 15% gambar
                        </div>
                      </Box>
                    )}

                    {advancedMode && (
                      <Box style={{ marginBottom: 14 }}>
                        <Lbl ch={<><span style={{ display: "inline-flex", marginRight: 4 }}>{Ic.check({ size: 12, color: C.accent })}</span> {settings.framework} Checklist</>} color={C.accent} />
                        <div className="auto-grid-tight">
                          {(FRAMEWORKS[settings.framework]?.structure || []).map((item, index) => (
                            <div key={index} style={{ display: "flex", gap: 8, fontSize: 12, color: "#2a5a2a", alignItems: "center" }}>{Ic.check({ size: 12, color: C.accent })}<span>{item}</span></div>
                          ))}
                          <div style={{ display: "flex", gap: 8, fontSize: 12, color: "#2a5a2a", alignItems: "center" }}>{Ic.chat({ size: 12, color: C.accent })}<span>Bahasa: {SLANG_LEVELS.find((item) => item.val === settings.slangLevel)?.label}</span></div>
                        </div>
                      </Box>
                    )}
                  </>
                );
              })()}

              <Box>
                <Lbl ch={<><span style={{ display: "inline-flex", marginRight: 4 }}>{Ic.refresh({ size: 12, color: C.accent })}</span>Ubah atau Buat Variasi</>} />
                {advancedMode ? (
                  <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
                    {["Static", "Carousel", "Reels", "Story"].map((item) => (
                      <button key={item} onClick={() => setFmt(item)} className="fb" style={{ background: fmt === item ? C.accent + "18" : "transparent", border: `1px solid ${fmt === item ? C.accent : C.border}`, borderRadius: 8, color: fmt === item ? C.accent : C.muted, padding: "7px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "all .15s" }}>
                        <span style={{ display: "inline-flex", marginRight: 4 }}>{FMT_ICON[item]?.({ size: 12 })}</span>{item}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: 12, lineHeight: 1.7, color: C.muted, marginBottom: 12 }}>
                    Format awal <strong style={{ color: C.text }}>{fmt}</strong> dipilih otomatis. Kalau butuh versi placement lain, buka mode lanjutan.
                  </div>
                )}
                <textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Catatan: lebih pendek, tambah urgency, fokus ke harga, tambah humor, versi untuk senior..." rows={2}
                  style={{ width: "100%", background: C.s1, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", color: C.text, fontSize: 13, fontFamily: "inherit", resize: "vertical", marginBottom: 12 }} />
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <Btn ch={<><span style={{ display: "inline-flex" }}>{Ic.refresh({ size: 13 })}</span> Buat Variasi Baru</>} onClick={() => onRegen(notes)} loading={loading} />
                  <Btn ch="<- Ganti Ide Jualan" onClick={() => onGoTo("angle")} v="s" />
                  <Btn ch="<- Ganti Target" onClick={() => onGoTo("audience")} v="g" />
                  {history.length > 0 && <Btn ch={<><span style={{ display: "inline-flex" }}>{Ic.bookOpen({ size: 13 })}</span> Lihat Arsip ({history.length})</>} onClick={() => setViewMode("history")} v="g" />}
                </div>
              </Box>
            </>
          ) : (
            !loading && <Zero icon={Ic.edit} title="Pilih ide jualan dulu" sub="Buka tab Ide Jualan, pilih sudut pesan yang paling cocok, lalu tulis teks iklannya dari sana." />
          )}
        </>
      )}
    </div>
  );
}

export function TabUsage({
  summary,
  events,
  runs,
  ledger,
  billingUsers,
  user,
  project,
  onRefresh,
  onAdminSearch,
  onAdminGrant,
  adminLoading,
  loading,
  ui,
}) {
  const { AI_BILLING_MODES, Box, Btn, C, FONT_DISPLAY, Ic, Lbl, Pill, SectionLead, TASK_LABELS, Zero } = ui;
  const [search, setSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [grantAmount, setGrantAmount] = useState("50");
  const [grantReason, setGrantReason] = useState("Manual top-up credits");
  const [grantBusy, setGrantBusy] = useState(false);
  const [grantNotice, setGrantNotice] = useState("");
  const [grantError, setGrantError] = useState("");

  useEffect(() => {
    if (!billingUsers?.length) {
      setSelectedUserId(null);
      return;
    }
    if (!selectedUserId || !billingUsers.some((item) => item.id === selectedUserId)) {
      setSelectedUserId(billingUsers[0].id);
    }
  }, [billingUsers, selectedUserId]);

  const fmtNumber = (value) => new Intl.NumberFormat("id-ID").format(Number(value || 0));
  const fmtCost = (value) => {
    const amount = Number(value || 0);
    if (!amount) return "$0";
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(amount);
  };
  const fmtDate = (value) => value ? new Date(value).toLocaleString("id-ID") : "Belum ada aktivitas";
  const fmtAmount = (value) => {
    const amount = Number(value || 0);
    const sign = amount > 0 ? "+" : "";
    return `${sign}${fmtNumber(amount)} cr`;
  };
  const pricingEntries = Object.entries(summary?.pricing || {});
  const selectedUser = billingUsers?.find((item) => item.id === selectedUserId) || null;
  const avgCostPerCall = Number(summary?.summary?.lifetimeCalls || 0) > 0
    ? Number(summary.summary.lifetimeEstimatedCostUsd || 0) / Number(summary.summary.lifetimeCalls || 1)
    : 0;

  const submitGrant = async () => {
    if (!selectedUser) return;
    setGrantBusy(true);
    setGrantError("");
    setGrantNotice("");
    try {
      await onAdminGrant({
        userId: selectedUser.id,
        amount: Number(grantAmount),
        reason: grantReason,
        search,
      });
      setGrantNotice(`Top-up ${fmtNumber(grantAmount)} credit berhasil untuk ${selectedUser.display_name || selectedUser.username}.`);
    } catch (err) {
      setGrantError(err.message || "Top-up gagal.");
    } finally {
      setGrantBusy(false);
    }
  };

  return (
    <div style={{ animation: "up .25s ease" }}>
      <SectionLead
        eyebrow={user?.is_admin ? "Billing Desk + Admin" : "Billing Desk"}
        title="Pantau saldo, spend, dan jejak kredit tanpa keluar dari workflow."
        sub={`Semua metrik tetap mengikuti project aktif: ${project?.name || "semua project"}. Ledger manual seperti top-up admin tetap muncul agar billing user mudah diaudit.`}
        aside={(
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            {user?.is_admin && <Pill ch={<><span style={{ display: "inline-flex" }}>{Ic.shield({ size: 10, color: C.red })}</span> Admin billing aktif</>} color={C.red} />}
            <Btn ch={<><span style={{ display: "inline-flex" }}>{Ic.refresh({ size: 13 })}</span> Refresh</>} onClick={onRefresh} v="s" size="sm" loading={loading} />
          </div>
        )}
      />

      {!summary && !loading && <Zero icon={Ic.hash} title="Belum ada data billing" sub="Begitu ada generasi AI, saldo, ledger, run, dan event akan otomatis muncul di sini." />}

      {summary && (
        <>
          <div className="auto-grid-tight" style={{ marginBottom: 16 }}>
            <Box style={{ background: "linear-gradient(160deg,#fcf8f0 0%,#efe3cf 100%)", borderColor: `${C.hi}` }}>
              <Lbl ch="Saldo Credit" color={C.accent} />
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 34, lineHeight: 0.92, letterSpacing: -0.8, color: C.text }}>{fmtNumber(summary.wallet?.balanceCredits)}</div>
              <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.7, marginTop: 8 }}>
                Granted: {fmtNumber(summary.wallet?.grantedCredits)} · Lifetime used: {fmtNumber(summary.wallet?.lifetimeUsedCredits)}
              </div>
              <div style={{ marginTop: 10, display: "flex", gap: 6, flexWrap: "wrap" }}>
                <Pill ch={summary.wallet?.enforceCredits ? "Credit enforcement aktif" : "Credit enforcement belum aktif"} color={summary.wallet?.enforceCredits ? C.red : C.cyan} />
                <Pill ch={`${fmtCost(summary.summary?.lifetimeEstimatedCostUsd)} biaya internal`} color={C.yellow} />
                <Pill ch={`${fmtNumber(summary.summary?.lifetimeInternalCalls)} internal`} color={C.accent} />
                <Pill ch={`${fmtNumber(summary.summary?.lifetimeByokCalls)} BYOK`} color={C.purple} />
              </div>
            </Box>

            <Box>
              <Lbl ch="Bulan Ini" color={C.cyan} />
              <div style={{ fontSize: 24, fontWeight: 800, color: C.text }}>{fmtNumber(summary.summary?.monthCreditsUsed)} credit</div>
              <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.7, marginTop: 8 }}>
                {fmtNumber(summary.summary?.monthCalls)} call · {fmtNumber(summary.summary?.monthTotalTokens)} token · {fmtNumber(summary.summary?.monthInternalCalls)} internal · {fmtNumber(summary.summary?.monthByokCalls)} BYOK · cost {fmtCost(summary.summary?.monthEstimatedCostUsd)}
              </div>
            </Box>

            <Box>
              <Lbl ch="Lifetime Spend" color={C.yellow} />
              <div style={{ fontSize: 24, fontWeight: 800, color: C.text }}>{fmtNumber(summary.summary?.lifetimeCreditsUsed)} credit</div>
              <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.7, marginTop: 8 }}>
                {fmtNumber(summary.summary?.lifetimeCalls)} call · {fmtNumber(summary.summary?.lifetimeTotalTokens)} token · {fmtNumber(summary.summary?.lifetimeInternalCalls)} internal · {fmtNumber(summary.summary?.lifetimeByokCalls)} BYOK · avg {fmtCost(avgCostPerCall)} per call
              </div>
            </Box>

            <Box>
              <Lbl ch="Full Runs" color={C.purple} />
              <div style={{ fontSize: 24, fontWeight: 800, color: C.text }}>{fmtNumber(summary.summary?.totalRuns)} run</div>
              <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.7, marginTop: 8 }}>
                Debit total dari run: {fmtNumber(summary.summary?.runCreditsUsed)} credit
              </div>
            </Box>
          </div>

          <div className="auto-grid" style={{ alignItems: "start" }}>
            <Box>
              <Lbl ch="Pricing Catalog" color={C.accent} />
              <div style={{ display: "grid", gap: 10 }}>
                {pricingEntries.map(([task, credits]) => (
                  <div key={task} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 14, border: `1px solid ${C.border}`, background: C.s1 }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 800, color: C.text }}>{TASK_LABELS[task] || task}</div>
                      <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>{task}</div>
                    </div>
                    <Pill ch={`${credits} credit`} color={C.accent} />
                  </div>
                ))}
              </div>
            </Box>

            <Box>
              <Lbl ch="Top Tasks" color={C.cyan} />
              {!summary.topTasks?.length && <Zero icon={Ic.hash} title="Belum ada task" sub="Begitu ada usage, distribusi task akan muncul di sini." />}
              {!!summary.topTasks?.length && (
                <div style={{ display: "grid", gap: 10 }}>
                  {summary.topTasks.map((item) => (
                    <div key={item.task_type} style={{ padding: "10px 12px", borderRadius: 14, border: `1px solid ${C.border}`, background: C.s1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                        <div style={{ fontSize: 12, fontWeight: 800, color: C.text }}>{TASK_LABELS[item.task_type] || item.task_type}</div>
                        <Pill ch={`${item.credits_used} credit`} color={C.cyan} sm />
                      </div>
                      <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.7, marginTop: 6 }}>
                        {fmtNumber(item.calls)} call · {fmtNumber(item.total_tokens)} token
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Box>

            <Box style={{ gridColumn: "1/-1", background: "linear-gradient(180deg,#fbf7ef 0%,#f4eddf 100%)" }}>
              <Lbl ch="Billing Ledger" color={C.purple} />
              {!ledger?.length && <Zero icon={Ic.bookOpen} title="Belum ada ledger" sub="Debit dan top-up credit akan muncul di sini agar user bisa audit billing dengan cepat." />}
              {!!ledger?.length && (
                <div style={{ display: "grid", gap: 10 }}>
                  {ledger.map((entry) => (
                    <div key={entry.id} style={{ display: "grid", gridTemplateColumns: "minmax(0,1.3fr) minmax(120px,.38fr) minmax(130px,.42fr)", gap: 12, alignItems: "center", padding: "12px 14px", borderRadius: 16, border: `1px solid ${C.border}`, background: "#fffcf7" }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          <div style={{ fontSize: 12, fontWeight: 800, color: C.text }}>{entry.reason}</div>
                          <Pill ch={entry.entry_type === "grant" ? "grant" : "debit"} color={entry.entry_type === "grant" ? C.accent : C.red} sm />
                          {entry.billing_source && <Pill ch={entry.billing_source === AI_BILLING_MODES.BYOK ? "BYOK" : "Internal"} color={entry.billing_source === AI_BILLING_MODES.BYOK ? C.purple : C.cyan} sm />}
                        </div>
                        <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.75, marginTop: 5 }}>
                          {entry.project_name || "Tanpa project"} · {entry.request_label || TASK_LABELS[entry.task_type] || entry.run_label || "Manual adjustment"} · {entry.provider || entry.model_id || "manual"} · {fmtDate(entry.created_at)}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 800, color: entry.amount > 0 ? C.accent : C.red }}>{fmtAmount(entry.amount)}</div>
                        <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>
                          {entry.total_tokens ? `${fmtNumber(entry.total_tokens)} token` : entry.model_id ? entry.model_id : "Non-AI"}
                        </div>
                      </div>
                      <div style={{ justifySelf: "end", textAlign: "right" }}>
                        <div style={{ fontSize: 10, letterSpacing: 1.3, textTransform: "uppercase", color: C.dim, fontWeight: 800 }}>Balance after</div>
                        <div style={{ fontSize: 13, fontWeight: 800, color: C.text, marginTop: 4 }}>{fmtNumber(entry.balance_after)} credit</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Box>

            <Box>
              <Lbl ch="Recent Runs" color={C.yellow} />
              {!runs.length && <Zero icon={Ic.layers} title="Belum ada run" sub="Run akan tercipta saat kamu mulai satu cycle generasi." />}
              {!!runs.length && (
                <div style={{ display: "grid", gap: 10 }}>
                  {runs.map((run) => (
                    <div key={run.id} style={{ padding: "12px 14px", borderRadius: 16, border: `1px solid ${C.border}`, background: C.s1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start", flexWrap: "wrap" }}>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 800, color: C.text }}>{run.label || run.run_type}</div>
                          <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.7, marginTop: 4 }}>
                            {run.project_name || "Tanpa project"} · {fmtDate(run.started_at)}
                          </div>
                        </div>
                        <Pill ch={run.status} color={run.status === "completed" ? C.accent : C.orange} sm />
                      </div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                        <Pill ch={`${fmtNumber(run.credits_charged)} credit`} color={C.yellow} sm />
                        <Pill ch={`${fmtNumber(run.total_tokens)} token`} color={C.cyan} sm />
                        <Pill ch={fmtCost(run.estimated_cost_usd)} color={C.purple} sm />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Box>

            <Box>
              <Lbl ch="Recent Events" color={C.purple} />
              {!events.length && <Zero icon={Ic.bookOpen} title="Belum ada event" sub="Event usage akan tercatat per generasi AI." />}
              {!!events.length && (
                <div style={{ display: "grid", gap: 10 }}>
                  {events.map((event) => (
                    <div key={event.id} style={{ padding: "12px 14px", borderRadius: 16, border: `1px solid ${C.border}`, background: C.s1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 800, color: C.text }}>{event.request_label || TASK_LABELS[event.task_type] || event.task_type}</div>
                          <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.7, marginTop: 4 }}>
                            {event.project_name || "Tanpa project"} · {event.model_id} · {fmtDate(event.created_at)}
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          <Pill ch={event.billing_source === AI_BILLING_MODES.BYOK ? "0 credit" : `${event.credits_charged} credit`} color={event.billing_source === AI_BILLING_MODES.BYOK ? C.purple : C.accent} sm />
                          <Pill ch={`${fmtNumber(event.total_tokens)} token`} color={C.cyan} sm />
                          <Pill ch={event.billing_source === AI_BILLING_MODES.BYOK ? "BYOK" : "Internal"} color={event.billing_source === AI_BILLING_MODES.BYOK ? C.purple : C.yellow} sm />
                          <Pill ch={event.status} color={event.status === "success" ? C.purple : C.red} sm />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Box>

            {user?.is_admin && (
              <Box style={{ gridColumn: "1/-1", background: "linear-gradient(155deg,#f7efe4 0%,#ece1cf 100%)", borderColor: `${C.red}40` }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 14, alignItems: "flex-start", flexWrap: "wrap", marginBottom: 16 }}>
                  <div>
                    <Lbl ch={<><span style={{ display: "inline-flex", marginRight: 4 }}>{Ic.shield({ size: 12, color: C.red })}</span> Admin Credit Desk</>} color={C.red} />
                    <div style={{ fontFamily: FONT_DISPLAY, fontSize: 28, lineHeight: 0.98, letterSpacing: -0.7, color: C.text, marginBottom: 8 }}>Top-up credit user tanpa keluar dari app.</div>
                    <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.75, maxWidth: 620 }}>
                      Cari user berdasarkan username atau display name, pilih target, lalu lakukan grant manual. Perubahan langsung masuk ke wallet dan ledger user.
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      onKeyDown={(event) => event.key === "Enter" && onAdminSearch(search)}
                      placeholder="Cari username / display name"
                      style={{ minWidth: 220, background: "#fffaf2", border: `1px solid ${C.border}`, borderRadius: 999, padding: "10px 14px", color: C.text, fontSize: 12 }}
                    />
                    <Btn ch="Cari User" onClick={() => onAdminSearch(search)} size="sm" v="s" loading={adminLoading} />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.2fr) minmax(300px,.8fr)", gap: 16 }}>
                  <div style={{ display: "grid", gap: 10, alignContent: "start" }}>
                    {!billingUsers?.length && !adminLoading && <Zero icon={Ic.users} title="Belum ada user" sub="Coba refresh atau ubah keyword pencarian." />}
                    {!!billingUsers?.length && billingUsers.map((item) => {
                      const active = item.id === selectedUserId;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setSelectedUserId(item.id)}
                          style={{
                            textAlign: "left",
                            borderRadius: 18,
                            border: `1px solid ${active ? C.accent : C.border}`,
                            background: active ? "#fff9f1" : "#fffdf8",
                            padding: "12px 14px",
                            cursor: "pointer",
                            boxShadow: active ? "0 12px 26px #1f6b4a12" : "none",
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start", flexWrap: "wrap" }}>
                            <div>
                              <div style={{ fontSize: 12, fontWeight: 800, color: C.text }}>{item.display_name || item.username}</div>
                              <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>@{item.username}</div>
                            </div>
                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
                              <Pill ch={`${fmtNumber(item.balance_credits)} cr`} color={active ? C.accent : C.cyan} sm />
                              {item.is_admin && <Pill ch="admin" color={C.red} sm />}
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                            <Pill ch={`${fmtNumber(item.project_count)} project`} color={C.yellow} sm />
                            <Pill ch={`Granted ${fmtNumber(item.granted_credits)}`} color={C.accent} sm />
                            <Pill ch={`Used ${fmtNumber(item.lifetime_used_credits)}`} color={C.purple} sm />
                          </div>
                          <div style={{ fontSize: 11, color: C.dim, lineHeight: 1.7, marginTop: 8 }}>
                            Aktivitas terakhir: {fmtDate(item.last_usage_at)}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div style={{ background: "#fff9f0", border: `1px solid ${C.border}`, borderRadius: 22, padding: 18, alignSelf: "start" }}>
                    <Lbl ch="Grant Form" color={C.accent} />
                    {!selectedUser && <Zero icon={Ic.shield} title="Pilih user" sub="Pilih satu user di panel kiri untuk melakukan top-up." />}
                    {selectedUser && (
                      <>
                        <div style={{ marginBottom: 14 }}>
                          <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1.8, fontWeight: 800, color: C.dim, marginBottom: 6 }}>Target User</div>
                          <div style={{ fontSize: 18, fontWeight: 800, color: C.text }}>{selectedUser.display_name || selectedUser.username}</div>
                          <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>@{selectedUser.username}</div>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 10, marginBottom: 14 }}>
                          <div style={{ padding: "10px 12px", borderRadius: 16, border: `1px solid ${C.border}`, background: "#fffdf8" }}>
                            <div style={{ fontSize: 10, letterSpacing: 1.3, textTransform: "uppercase", color: C.dim, fontWeight: 800, marginBottom: 5 }}>Current balance</div>
                            <div style={{ fontSize: 16, fontWeight: 800, color: C.text }}>{fmtNumber(selectedUser.balance_credits)} cr</div>
                          </div>
                          <div style={{ padding: "10px 12px", borderRadius: 16, border: `1px solid ${C.border}`, background: "#fffdf8" }}>
                            <div style={{ fontSize: 10, letterSpacing: 1.3, textTransform: "uppercase", color: C.dim, fontWeight: 800, marginBottom: 5 }}>Projects</div>
                            <div style={{ fontSize: 16, fontWeight: 800, color: C.text }}>{fmtNumber(selectedUser.project_count)}</div>
                          </div>
                        </div>
                        <div style={{ display: "grid", gap: 10 }}>
                          <div>
                            <div style={{ fontSize: 10, letterSpacing: 1.7, textTransform: "uppercase", fontWeight: 800, color: C.dim, marginBottom: 6 }}>Jumlah Credit</div>
                            <input value={grantAmount} onChange={(event) => setGrantAmount(event.target.value.replace(/[^\d]/g, ""))} placeholder="50" style={{ width: "100%", background: "#fffdf8", border: `1px solid ${C.border}`, borderRadius: 14, padding: "12px 14px", color: C.text, fontSize: 13 }} />
                          </div>
                          <div>
                            <div style={{ fontSize: 10, letterSpacing: 1.7, textTransform: "uppercase", fontWeight: 800, color: C.dim, marginBottom: 6 }}>Alasan / catatan</div>
                            <textarea value={grantReason} onChange={(event) => setGrantReason(event.target.value)} rows={4} style={{ width: "100%", background: "#fffdf8", border: `1px solid ${C.border}`, borderRadius: 14, padding: "12px 14px", color: C.text, fontSize: 13, resize: "vertical" }} />
                          </div>
                          {grantNotice && <div style={{ background: "#ecfdf5", border: `1px solid ${C.accent}30`, borderRadius: 14, padding: "10px 12px", fontSize: 12, color: C.accent, lineHeight: 1.7 }}>{grantNotice}</div>}
                          {grantError && <div style={{ background: "#fef2f2", border: `1px solid ${C.red}30`, borderRadius: 14, padding: "10px 12px", fontSize: 12, color: C.red, lineHeight: 1.7 }}>{grantError}</div>}
                          <Btn ch={<><span style={{ display: "inline-flex" }}>{Ic.plus({ size: 13 })}</span> Top-up Credit</>} onClick={submitGrant} loading={grantBusy} disabled={!grantAmount || Number(grantAmount) <= 0} />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </Box>
            )}
          </div>
        </>
      )}
    </div>
  );
}
