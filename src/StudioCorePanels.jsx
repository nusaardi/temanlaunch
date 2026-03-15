import { useState } from "react";

export function TabAnalyzer({ analysis, setAnalysis, onUrl, onText, onBuild, loading, ui }) {
  const { Box, Btn, C, Ic, Lbl, Pill, SectionLead, Spin, Zero } = ui;
  const [url, setUrl] = useState("");
  const [pasted, setPasted] = useState("");
  const [mode, setMode] = useState("paste");
  const [editMode, setEditMode] = useState(false);
  const [draft, setDraft] = useState(null);

  const startEdit = () => { setDraft(JSON.parse(JSON.stringify(analysis))); setEditMode(true); };
  const saveEdit = () => { setAnalysis(draft); setEditMode(false); };
  const editField = (key, val) => setDraft((current) => ({ ...current, [key]: val }));
  const editArr = (key, idx, val) => setDraft((current) => ({ ...current, [key]: current[key].map((item, index) => index === idx ? val : item) }));
  const addArrItem = (key) => setDraft((current) => ({ ...current, [key]: [...(current[key] || []), ""] }));
  const removeArrItem = (key, idx) => setDraft((current) => ({ ...current, [key]: current[key].filter((_, index) => index !== idx) }));

  const data = editMode ? draft : analysis;

  return (
    <div style={{ animation: "up .25s ease" }}>
      <SectionLead
        eyebrow="Ringkasan Produk"
        title="Baca isi produkmu, lalu rapikan poin yang paling penting."
        sub="Tempel isi halaman jualan atau masukkan link, lalu cek apakah ringkasan produknya sudah cukup jelas untuk dipakai ke target pembeli dan teks iklan."
        aside={analysis ? <Pill ch={analysis.produk || "Ringkasan siap"} color={C.accent} /> : <Pill ch="Belum ada ringkasan" color={C.orange} />}
      />
      <div style={{ display: "flex", gap: 2, background: C.s1, border: `1px solid ${C.border}`, borderRadius: 12, padding: 4, marginBottom: 16, width: "fit-content" }}>
        {[["paste", <><span style={{ display: "inline-flex" }}>{Ic.copy({ size: 13 })}</span> Tempel Teks</>], ["url", <><span style={{ display: "inline-flex" }}>{Ic.link({ size: 13 })}</span> Pakai Link</>]].map(([itemMode, label]) => (
          <button key={itemMode} onClick={() => setMode(itemMode)} style={{ background: mode === itemMode ? C.s3 : "transparent", border: `1px solid ${mode === itemMode ? C.hi : "transparent"}`, borderRadius: 8, color: mode === itemMode ? C.text : C.muted, padding: "8px 16px", cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "inherit", transition: "all .15s" }}>{label}</button>
        ))}
      </div>

      <Box style={{ marginBottom: 16 }}>
        {mode === "paste" ? (
          <>
            <Lbl ch="Tempel isi halaman jualan" />
            <div style={{ background: C.s1, border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 14px", marginBottom: 10, fontSize: 12, color: C.muted, lineHeight: 1.7 }}>
              <span style={{ display: "inline-flex", marginRight: 4 }}>{Ic.bulb({ size: 12, color: C.accent })}</span> Buka halaman jualan di browser, salin teks utamanya, lalu tempel di sini supaya sistem bisa membaca offer, manfaat, dan CTA.
            </div>
            <textarea value={pasted} onChange={(event) => setPasted(event.target.value)} placeholder="Paste teks dari landing page kamu di sini..." rows={8}
              style={{ width: "100%", background: C.s1, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 16px", color: C.text, fontSize: 13, fontFamily: "inherit", resize: "vertical", lineHeight: 1.7 }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
              <span style={{ fontSize: 12, color: pasted.length < 100 ? C.red : C.muted }}>{pasted.length < 100 ? "Tambahkan sedikit lagi agar ringkasan lebih akurat." : `${pasted.length} karakter siap dibaca.`}</span>
              <Btn ch="Buat ringkasan" onClick={() => onText(pasted)} loading={loading} disabled={pasted.length < 100} />
            </div>
          </>
        ) : (
          <>
            <Lbl ch="Link halaman jualan" />
            <div style={{ background: "#fff7ed", border: `1px solid ${C.orange}25`, borderRadius: 10, padding: "10px 14px", marginBottom: 10, fontSize: 12, color: "#9a3412", lineHeight: 1.7 }}>
              <span style={{ display: "inline-flex", marginRight: 4 }}>{Ic.alertTri({ size: 12, color: "#9a3412" })}</span> Kalau halaman sulit dibaca dari link, balik ke mode tempel teks supaya hasilnya tetap aman.
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <input value={url} onChange={(event) => setUrl(event.target.value)} onKeyDown={(event) => event.key === "Enter" && url.trim() && onUrl(url)} placeholder="contoh.com/landing-page"
                style={{ flex: 1, background: C.s1, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 16px", color: C.text, fontSize: 14, fontFamily: "inherit" }} />
              <Btn ch={<><span style={{ display: "inline-flex" }}>{Ic.search({ size: 14 })}</span> Baca Link</>} onClick={() => onUrl(url.trim())} loading={loading} disabled={!url.trim()} size="lg" />
            </div>
          </>
        )}
      </Box>

      {loading && !analysis && <Spin msg="Sedang membaca produk dan merangkum poin penting..." />}
      {!analysis && !loading && <Zero icon={Ic.search} title="Ringkasan produk belum dibuat" sub="Mulai dari link atau tempel teks halaman jualan supaya sistem bisa menangkap inti offer." />}

      {analysis && !loading && (
        <div style={{ animation: "up .25s ease" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 8, height: 8, background: C.accent, borderRadius: "50%", display: "inline-block", animation: "pulse 2s ease infinite" }} />
              <span style={{ fontWeight: 800, fontSize: 14, color: C.accent }}>Ringkasan produk siap dicek</span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {editMode
                ? <><Btn ch="✓ Simpan Edit" onClick={saveEdit} size="sm" /><Btn ch="Batal" onClick={() => setEditMode(false)} v="g" size="sm" /></>
                : <><Btn ch={<><span style={{ display: "inline-flex" }}>{Ic.edit({ size: 13 })}</span> Rapikan Ringkasan</>} onClick={startEdit} v="s" size="sm" /><Btn ch={<><span style={{ display: "inline-flex" }}>{Ic.users({ size: 13 })}</span> Cari Target Pembeli</>} onClick={onBuild} loading={loading} /></>
              }
            </div>
          </div>

          <div className="auto-grid-tight">
            <Box style={{ gridColumn: "1/-1", background: `linear-gradient(135deg,${C.s3},${C.s2})`, borderColor: `${C.mid}35` }}>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 180 }}>
                  {editMode ? (
                    <>
                      <input value={data.produk} onChange={(event) => editField("produk", event.target.value)} style={{ background: C.dim, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 12px", color: C.text, fontSize: 18, fontWeight: 900, width: "100%", marginBottom: 8, fontFamily: "inherit" }} />
                      <input value={data.tagline} onChange={(event) => editField("tagline", event.target.value)} style={{ background: C.dim, border: `1px solid ${C.border}`, borderRadius: 8, padding: "6px 12px", color: C.muted, fontSize: 13, width: "100%", marginBottom: 8, fontFamily: "inherit", fontStyle: "italic" }} />
                      <textarea value={data.offer_inti} onChange={(event) => editField("offer_inti", event.target.value)} rows={2} style={{ background: C.dim, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 12px", color: "#3a6a3a", fontSize: 13, width: "100%", fontFamily: "inherit", resize: "none" }} />
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: 21, fontWeight: 900, color: C.text, marginBottom: 4 }}>{data.produk}</div>
                      <div style={{ fontSize: 13, color: C.muted, marginBottom: 10, fontStyle: "italic" }}>"{data.tagline}"</div>
                      <div style={{ fontSize: 13, color: "#3a6a3a", lineHeight: 1.7 }}>{data.offer_inti}</div>
                    </>
                  )}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {data.harga && data.harga !== "tidak disebutkan" && <Pill ch={<><span style={{ display: "inline-flex", marginRight: 3 }}>{Ic.dollar({ size: 10, color: C.yellow })}</span> {data.harga}</>} color={C.yellow} />}
                  {data.framework_produk && <Pill ch={<><span style={{ display: "inline-flex", marginRight: 3 }}>{Ic.wrench({ size: 10, color: C.cyan })}</span> {data.framework_produk}</>} color={C.cyan} />}
                  {data.social_proof && <Pill ch={<><span style={{ display: "inline-flex", marginRight: 3 }}>{Ic.users({ size: 10, color: C.purple })}</span> {data.social_proof}</>} color={C.purple} />}
                </div>
              </div>
            </Box>

            <Box>
              <Lbl ch={<><span style={{ display: "inline-flex", marginRight: 4 }}>{Ic.alertTri({ size: 12, color: C.red })}</span> Masalah Utama</>} color={C.red} />
              {(data.pain_points || []).map((item, index) => (
                <div key={index} style={{ display: "flex", gap: 6, marginBottom: 8, alignItems: "flex-start" }}>
                  <span style={{ color: C.red, flexShrink: 0, marginTop: 2 }}>{Ic.chevronR({ size: 14, color: C.red })}</span>
                  {editMode
                    ? <input value={item} onChange={(event) => editArr("pain_points", index, event.target.value)} style={{ flex: 1, background: C.dim, border: `1px solid ${C.border}`, borderRadius: 6, padding: "5px 10px", color: C.text, fontSize: 12, fontFamily: "inherit" }} />
                    : <span style={{ fontSize: 13, color: "#7a3a3a", lineHeight: 1.5 }}>{item}</span>}
                  {editMode && <button onClick={() => removeArrItem("pain_points", index)} style={{ background: "none", border: "none", color: C.red, cursor: "pointer", opacity: 0.6, fontSize: 14, flexShrink: 0 }}>×</button>}
                </div>
              ))}
              {editMode && <Btn ch="+ Tambah" onClick={() => addArrItem("pain_points")} v="s" size="sm" style={{ marginTop: 4 }} />}
            </Box>

            <Box>
              <Lbl ch={<><span style={{ display: "inline-flex", marginRight: 4 }}>{Ic.target({ size: 12, color: C.accent })}</span> Info Kunci</>} color={C.accent} />
              {[
                ["dream_outcome", "Hasil yang dicari", C.accent],
                ["usp", "USP", C.cyan],
                ["guarantee", "Jaminan", C.blue],
                ["cta_utama", "CTA", C.orange],
              ].map(([key, label, color]) => (
                <div key={key} style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 10, color: `${color}88`, letterSpacing: 1, textTransform: "uppercase", fontWeight: 700, marginBottom: 3 }}>{label}</div>
                  {editMode
                    ? <input value={data[key] || ""} onChange={(event) => editField(key, event.target.value)} style={{ width: "100%", background: C.dim, border: `1px solid ${C.border}`, borderRadius: 6, padding: "5px 10px", color: C.text, fontSize: 12, fontFamily: "inherit" }} />
                    : <div style={{ fontSize: 12, color: "#3a6a3a", lineHeight: 1.5 }}>{data[key]}</div>}
                </div>
              ))}
            </Box>

            {(data.nilai_utama || []).length > 0 && (
              <Box style={{ gridColumn: "1/-1" }}>
                <Lbl ch="🎁 Nilai Utama" color={C.yellow} />
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {data.nilai_utama.map((item, index) => (
                    editMode
                      ? <div key={index} style={{ display: "flex", gap: 4, alignItems: "center" }}>
                        <input value={item} onChange={(event) => editArr("nilai_utama", index, event.target.value)} style={{ background: C.dim, border: `1px solid ${C.border}`, borderRadius: 6, padding: "5px 10px", color: C.text, fontSize: 12, fontFamily: "inherit", width: 160 }} />
                        <button onClick={() => removeArrItem("nilai_utama", index)} style={{ background: "none", border: "none", color: C.red, cursor: "pointer", fontSize: 14 }}>×</button>
                      </div>
                      : <Pill key={index} ch={`✓ ${item}`} color={[C.accent, C.cyan, C.purple][index % 3]} />
                  ))}
                  {editMode && <Btn ch="+ Tambah" onClick={() => addArrItem("nilai_utama")} v="s" size="sm" />}
                </div>
              </Box>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function TabAudience({ analysis, audiences, onBuild, onSelect, loading, ui }) {
  const { AC, Box, Btn, C, Ic, Pill, SectionLead, Spin, Zero } = ui;
  if (!analysis) return <Zero icon={Ic.alertTri} title="Mulai dari ringkasan produk dulu" sub="Buka tab Ringkasan Produk agar sistem tahu apa yang kamu jual dan siapa yang cocok beli." />;
  return (
    <div style={{ animation: "up .25s ease" }}>
      <SectionLead
        eyebrow="Target Pembeli"
        title="Cari siapa yang paling mungkin membeli lebih dulu."
        sub="Sistem memecah produkmu menjadi beberapa tipe pembeli, lengkap dengan masalah utama, hasil yang mereka cari, dan ide targeting awal."
        aside={<Btn ch={audiences.length ? <><span style={{ display: "inline-flex" }}>{Ic.refresh({ size: 13 })}</span> Buat Ulang</> : <><span style={{ display: "inline-flex" }}>{Ic.zap({ size: 13 })}</span> Cari Target</>} onClick={onBuild} loading={loading} v={audiences.length ? "s" : "p"} />}
      />
      {loading && !audiences.length && <Spin msg="Sedang mencari beberapa target pembeli yang paling masuk akal..." />}
      {!loading && !audiences.length && <Zero icon={Ic.users} title="Target pembeli belum dibuat" sub="Klik Cari Target agar kamu dapat beberapa tipe pembeli yang bisa diprioritaskan." />}
      {audiences.length > 0 && (
        <div className="auto-grid-tight">
          {audiences.map((audience, index) => (
            <Box key={index} cls="hov" onClick={() => onSelect(audience, index)} style={{ cursor: "pointer" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: `${C.accent}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: C.accent }}>{(audience.nama || "A").charAt(0).toUpperCase()}</div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 13, color: C.text }}>{audience.nama}</div>
                    <div style={{ fontSize: 11, color: C.muted }}>{audience.usia}</div>
                  </div>
                </div>
                <Pill ch={audience.awareness} color={AC[audience.awareness] || C.muted} />
              </div>
              <div style={{ fontSize: 12, color: "#3a6a3a", lineHeight: 1.6, marginBottom: 12 }}>{audience.deskripsi}</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
                <div style={{ background: `${C.red}0c`, border: `1px solid ${C.red}1e`, borderRadius: 8, padding: 10 }}>
                  <div style={{ fontSize: 9, color: C.red, textTransform: "uppercase", letterSpacing: 1, fontWeight: 700, marginBottom: 4 }}>Masalah</div>
                  <div style={{ fontSize: 11, color: "#7a3a3a", lineHeight: 1.5 }}>{audience.pain_utama}</div>
                </div>
                <div style={{ background: `${C.accent}0c`, border: `1px solid ${C.accent}1e`, borderRadius: 8, padding: 10 }}>
                  <div style={{ fontSize: 9, color: C.accent, textTransform: "uppercase", letterSpacing: 1, fontWeight: 700, marginBottom: 4 }}>Hasil</div>
                  <div style={{ fontSize: 11, color: "#2a5a2a", lineHeight: 1.5 }}>{audience.dream_outcome}</div>
                </div>
              </div>
              <div style={{ background: C.s1, borderRadius: 8, padding: "8px 12px", marginBottom: 10, fontSize: 11, color: C.dim, lineHeight: 1.5 }}>
                <span style={{ display: "inline-flex", marginRight: 4 }}>{Ic.target({ size: 11, color: C.cyan })}</span>{audience.meta_targeting}
              </div>
              <div style={{ fontSize: 11, color: C.muted, fontStyle: "italic", lineHeight: 1.5, marginBottom: 12, display: "flex", alignItems: "flex-start", gap: 4 }}>{Ic.bulb({ size: 12, color: C.dim })} {audience.hormozi_hook}</div>
              <Btn ch={<><span style={{ display: "inline-flex" }}>{Ic.target({ size: 13 })}</span> Lanjut ke Ide Jualan</>} full size="sm" />
            </Box>
          ))}
        </div>
      )}
    </div>
  );
}

export function TabAngle({ audience, audienceIdx, angles, onRebuild, onGenCopy, onDeleteAngle, fmt, setFmt, loading, advancedMode = false, ui }) {
  const { Box, Btn, C, FMT_ICON, Ic, Lbl, Pill, SectionLead, Spin, TC, Zero } = ui;
  if (!audience) return <Zero icon={Ic.target} title="Pilih target pembeli dulu" sub="Buka tab Target Pembeli, lalu pilih tipe pembeli yang paling ingin kamu kejar lebih dulu." />;
  const latestAngles = angles.slice(0, 6);
  const historyAngles = angles.slice(6);
  return (
    <div style={{ animation: "up .25s ease" }}>
      <SectionLead
        eyebrow="Ide Jualan"
        title="Coba beberapa sudut pesan sebelum menulis iklan."
        sub="Di sini kamu bisa melihat beberapa pembuka dan janji utama yang berbeda, lalu pilih mana yang paling cocok untuk target pembeli yang aktif."
        aside={<Pill ch={`${latestAngles.length || angles.length} ide aktif`} color={latestAngles.length ? C.accent : C.orange} />}
      />
      <Box style={{ marginBottom: 14, background: C.s3, borderColor: `${C.mid}30` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ width: 22, height: 22, borderRadius: "50%", background: `${C.accent}18`, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: C.accent }}>{(audience.nama || "A").charAt(0).toUpperCase()}</span>
            <div>
              <div style={{ fontSize: 10, color: C.accent, textTransform: "uppercase", letterSpacing: 1, fontWeight: 700 }}>Target aktif</div>
              <div style={{ fontWeight: 700, color: C.text, fontSize: 14 }}>{audience.nama} · {audience.usia}</div>
              <div style={{ fontSize: 11, color: C.muted }}>Masalah utama: {audience.pain_utama}</div>
            </div>
          </div>
          <Btn ch={<span style={{ display: "inline-flex" }}>{Ic.refresh({ size: 13 })}</span>} onClick={() => onRebuild(audience, audienceIdx, true)} loading={loading} v="s" size="sm" />
        </div>
      </Box>
      {advancedMode ? (
        <Box style={{ marginBottom: 14 }}>
          <Lbl ch="Format Iklan" />
          <div style={{ display: "flex", gap: 8 }}>
            {["Static", "Carousel", "Reels", "Story"].map((itemFmt) => (
              <button key={itemFmt} onClick={() => setFmt(itemFmt)} className="fb" style={{ background: fmt === itemFmt ? `${C.accent}18` : "transparent", border: `1px solid ${fmt === itemFmt ? C.accent : C.border}`, borderRadius: 8, color: fmt === itemFmt ? C.accent : C.muted, padding: "8px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "all .15s" }}>
                <span style={{ display: "inline-flex", marginRight: 4 }}>{FMT_ICON[itemFmt]?.({ size: 12 })}</span>{itemFmt}
              </button>
            ))}
          </div>
        </Box>
      ) : (
        <Box style={{ marginBottom: 14, background: C.s1 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: C.text, marginBottom: 6 }}>Format awal dipilih otomatis</div>
          <div style={{ fontSize: 12, lineHeight: 1.7, color: C.muted }}>
            Untuk mode sederhana, sistem memakai format <strong style={{ color: C.text }}>{fmt}</strong> sebagai jalur awal. Kalau mau ganti per placement, buka mode lanjutan.
          </div>
        </Box>
      )}
      {loading && !angles.length && <Spin msg={`Sedang menyusun beberapa ide jualan untuk ${audience.nama}...`} />}
      {!loading && !angles.length && (
        <Box style={{ textAlign: "center" }}>
          <Zero icon={Ic.target} title={`Belum ada ide jualan untuk ${audience.nama}`} sub="Klik tombol di bawah untuk melihat beberapa sudut pesan yang bisa langsung dipilih." />
          <div style={{ marginTop: 8 }}>
            <Btn ch={<><span style={{ display: "inline-flex" }}>{Ic.zap({ size: 13 })}</span> Buat Ide Jualan</>} onClick={() => onRebuild(audience, audienceIdx, true)} v="p" />
          </div>
        </Box>
      )}
      {latestAngles.length > 0 && (
        <div className="auto-grid-tight">
          {latestAngles.map((angle) => {
            const toneColor = TC[angle.teknik] || C.accent;
            return (
              <Box key={angle.id || `${angle.nama || "angle"}-${angle.hook || angle.teknik}`}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ width: 22, height: 22, borderRadius: "50%", background: `${toneColor}18`, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: toneColor }}>{(angle.nama || "A").charAt(0).toUpperCase()}</span>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 13, color: C.text }}>{angle.nama}</div>
                      <div style={{ fontSize: 10, color: C.dim, marginTop: 2 }}>{angle.framework_note || angle.hormozi_principle}</div>
                    </div>
                  </div>
                  <Pill ch={angle.teknik} color={toneColor} />
                </div>
                <div style={{ background: `${toneColor}0e`, border: `1px solid ${toneColor}20`, borderRadius: 10, padding: 12, marginBottom: 10 }}>
                  <div style={{ fontSize: 9, color: toneColor, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 700, marginBottom: 5, display: "flex", alignItems: "center", gap: 3 }}>{Ic.flag({ size: 10, color: toneColor })} Hook</div>
                  <div style={{ fontSize: 13, color: C.text, fontStyle: "italic", lineHeight: 1.65, fontWeight: 600 }}>{angle.hook}</div>
                </div>
                <div style={{ fontSize: 12, color: "#3a6a3a", lineHeight: 1.6, marginBottom: 10 }}>{angle.big_promise}</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                  <Pill ch={angle.tone} color={C.muted} sm />
                  <Pill ch={angle.rekomendasi_format || angle.format || "Semua Format"} color={C.muted} sm />
                </div>
                <div style={{ fontSize: 11, color: C.dim, lineHeight: 1.5, fontStyle: "italic", marginBottom: 14, display: "flex", alignItems: "flex-start", gap: 4 }}>{Ic.bulb({ size: 12, color: C.dim })} {angle.why_it_works}</div>
                <Btn ch={<><span style={{ display: "inline-flex" }}>{Ic.edit({ size: 13 })}</span> Tulis Teks Iklan</>} onClick={() => onGenCopy(angle)} loading={loading} full size="sm" />
              </Box>
            );
          })}
        </div>
      )}

      {historyAngles.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <div style={{ height: 1, background: C.border, flex: 1 }}></div>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 1 }}>Ide Jualan Sebelumnya</div>
            <div style={{ height: 1, background: C.border, flex: 1 }}></div>
          </div>
          <div className="auto-grid-tight" style={{ opacity: 0.75 }}>
            {historyAngles.map((angle, index) => {
              const toneColor = TC[angle.teknik] || C.accent;
              return (
                <div key={index} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <div style={{ fontWeight: 700, fontSize: 12, color: C.text }}>{angle.nama}</div>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <Pill ch={angle.teknik} color={toneColor} sm />
                      <button onClick={() => { if (window.confirm("Hapus histori angle ini?")) onDeleteAngle(angle); }} style={{ background: "none", border: "none", color: C.red, cursor: "pointer", fontSize: 14, padding: "2px 4px", opacity: 0.6 }} title="Hapus Angle">{Ic.trash({ size: 13 })}</button>
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: C.dim, fontStyle: "italic", lineHeight: 1.5, marginBottom: 10, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>"{angle.hook}"</div>
                  <Btn ch={<><span style={{ display: "inline-flex" }}>{Ic.edit({ size: 11 })}</span> Pakai Ide Ini</>} onClick={() => onGenCopy(angle)} size="sm" />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
