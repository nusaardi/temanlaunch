import { useEffect, useState } from "react";

export function LoginModal({ onAuth, onDevLogin, devLoginEnabled = false, devLoginBusy = false, ui }) {
  const { API_BASE, Btn, C, FONT_DISPLAY, Pill } = ui;
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!username || !password) return setErr("Username dan password wajib");
    setBusy(true);
    setErr("");
    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const body = mode === "login" ? { username, password } : { username, password, displayName: displayName || username };
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      localStorage.setItem("mab_token", data.token);
      localStorage.setItem("mab_user", JSON.stringify(data.user));
      onAuth(data.user, data.token);
    } catch (error) {
      setErr(error.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="auth-panel">
        <div className="auth-brand">
          <div style={{ position: "relative", zIndex: 1 }}>
            <Pill ch="Campaign Atelier" color="#f0d8a2" />
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 44, lineHeight: 0.92, letterSpacing: -1.2, margin: "18px 0 12px" }}>
              Meta Ads Builder
            </div>
            <div style={{ fontSize: 13, lineHeight: 1.85, color: "#e3d7c6", maxWidth: 300 }}>
              Studio kerja untuk membentuk landing page, audience, angle, dan ad copy dalam satu workflow yang rapi.
            </div>
            <div style={{ marginTop: 22, display: "grid", gap: 12 }}>
              {[
                ["Landing Page", "Generate halaman jualan dari brief dan framework aktif."],
                ["Audience Mapping", "Turunkan offer jadi segment yang bisa langsung dieksekusi."],
                ["Copy Library", "Simpan, tandai, dan pakai ulang copy yang benar-benar dipakai."],
              ].map(([title, text]) => (
                <div key={title} style={{ padding: "14px 0", borderTop: "1px solid #ffffff1b" }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: "#f7efe3", marginBottom: 4 }}>{title}</div>
                  <div style={{ fontSize: 11, lineHeight: 1.7, color: "#d3c5b2" }}>{text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="auth-form">
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", fontWeight: 800, color: C.accent, marginBottom: 8 }}>
              {mode === "login" ? "Masuk ke workspace" : "Buat workspace baru"}
            </div>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 34, lineHeight: 0.98, letterSpacing: -0.8, color: C.text, marginBottom: 8 }}>
              {mode === "login" ? "Kembali ke meja kerja kamu." : "Mulai dari akun baru."}
            </div>
            <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.8 }}>
              {mode === "login" ? "Pilih project terakhir dan lanjutkan produksi campaign tanpa setup ulang." : "Daftar sekali, lalu semua project dan eksperimen kamu akan tersimpan."}
            </div>
          </div>

          {err && <div style={{ background: "#fef2f2", border: `1px solid ${C.red}30`, borderRadius: 14, padding: "10px 14px", fontSize: 12, color: C.red, marginBottom: 14 }}>{err}</div>}
          {mode === "register" && (
            <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Nama tampilan"
              style={{ width: "100%", background: C.s1, border: `1px solid ${C.border}`, borderRadius: 16, padding: "13px 16px", color: C.text, fontSize: 13, marginBottom: 10 }} />
          )}
          <input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Username"
            style={{ width: "100%", background: C.s1, border: `1px solid ${C.border}`, borderRadius: 16, padding: "13px 16px", color: C.text, fontSize: 13, marginBottom: 10 }} />
          <input value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" type="password"
            onKeyDown={(event) => event.key === "Enter" && submit()}
            style={{ width: "100%", background: C.s1, border: `1px solid ${C.border}`, borderRadius: 16, padding: "13px 16px", color: C.text, fontSize: 13, marginBottom: 18 }} />
          <Btn ch={busy ? "Loading..." : mode === "login" ? "Masuk" : "Daftar"} onClick={submit} loading={busy} full size="lg" />
          {devLoginEnabled && (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "14px 0 10px" }}>
                <div style={{ flex: 1, height: 1, background: `${C.border}` }} />
                <div style={{ fontSize: 10, letterSpacing: 1.6, textTransform: "uppercase", fontWeight: 800, color: C.dim }}>Dev lokal</div>
                <div style={{ flex: 1, height: 1, background: `${C.border}` }} />
              </div>
              <Btn
                ch={devLoginBusy ? "Masuk cepat..." : "Masuk cepat tanpa login manual"}
                onClick={async () => {
                  setErr("");
                  try {
                    await onDevLogin?.();
                  } catch (error) {
                    setErr(error.message || "Dev login gagal.");
                  }
                }}
                loading={devLoginBusy}
                full
                size="lg"
                v="s"
              />
              <div style={{ fontSize: 11, color: C.dim, lineHeight: 1.7, marginTop: 8 }}>
                Tombol ini hanya untuk local dev dan butuh endpoint `DEV_AUTO_LOGIN` aktif di backend.
              </div>
            </>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16, gap: 12, flexWrap: "wrap" }}>
            <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6 }}>
              {mode === "login" ? "Belum punya akun?" : "Sudah punya akun?"}
            </div>
            <button onClick={() => { setMode(mode === "login" ? "register" : "login"); setErr(""); }}
              style={{ background: "none", border: "none", color: C.accent, cursor: "pointer", fontWeight: 800, fontSize: 12 }}>
              {mode === "login" ? "Buka pendaftaran" : "Kembali ke login"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProjectModal({ token, onSelect, onClose, currentId, starterProjects = [], ui }) {
  const { API_BASE, Btn, C, FONT_DISPLAY, Ic, Pill, Spin } = ui;
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
  const sortProjects = (items) => [...items].sort((a, b) => new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime());
  const currentProject = projects.find((item) => item.id === currentId) || null;
  const suggestedProjectNames = starterProjects
    .map((item) => item.projectName || item.label)
    .filter(Boolean)
    .slice(0, 4);

  const formatProjectDate = (value) => {
    const date = new Date(value || "");
    if (Number.isNaN(date.getTime())) return "Baru disentuh";
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  const formatRelativeProjectTime = (value) => {
    const date = new Date(value || "");
    if (Number.isNaN(date.getTime())) return "Baru disentuh";
    const diffDays = Math.max(0, Math.round((Date.now() - date.getTime()) / 86400000));
    if (diffDays <= 0) return "Aktif hari ini";
    if (diffDays === 1) return "Aktif kemarin";
    if (diffDays < 7) return `${diffDays} hari lalu`;
    if (diffDays < 30) return `${Math.round(diffDays / 7)} minggu lalu`;
    return formatProjectDate(value);
  };

  const getProjectSummary = (project) => {
    if (project?.analysis?.offer_inti) return project.analysis.offer_inti;
    if (project?.analysis?.produk) return `Produk utama: ${project.analysis.produk}`;
    return "Belum ada hasil di dalamnya. Cocok untuk mulai dari wizard cepat lalu simpan semua bahan ke sini.";
  };

  const load = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/projects`, { headers });
      const data = await response.json();
      setProjects(sortProjects(data.projects || []));
    } catch {
      setProjects([]);
    }
    setLoading(false);
  };

  const create = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const response = await fetch(`${API_BASE}/api/projects`, { method: "POST", headers, body: JSON.stringify({ name: newName.trim() }) });
      const data = await response.json();
      if (data.project) onSelect(data.project);
    } catch {
      return;
    } finally {
      setCreating(false);
    }
  };

  const del = async (id) => {
    setDeletingId(id);
    try {
      await fetch(`${API_BASE}/api/projects/${id}`, { method: "DELETE", headers });
      await load();
    } catch {
      return;
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`${API_BASE}/api/projects`, {
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (active) setProjects(sortProjects(data.projects || []));
      } catch {
        if (active) setProjects([]);
      } finally {
        if (active) setLoading(false);
      }
    }, 0);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [API_BASE, token]);

  return (
    <div className="modal-backdrop">
      <div className="project-panel">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 22, flexWrap: "wrap" }}>
          <div style={{ maxWidth: 580 }}>
            <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", fontWeight: 800, color: C.accent, marginBottom: 8 }}>Rumah kerja</div>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 34, lineHeight: 0.98, letterSpacing: -0.7, color: C.text, marginBottom: 8 }}>Pilih tempat menyimpan campaign ini.</div>
            <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.75, maxWidth: 520 }}>
              Project aktif akan jadi rumah yang sama untuk audience, angle, copy, dan halaman jualan. Begitu kamu pilih satu project, semua hasil berikutnya tetap rapi dalam konteks yang sama.
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ width: 42, height: 42, borderRadius: 999, border: `1px solid ${C.border}`, background: "#fffaf2", color: C.muted, cursor: "pointer", fontSize: 24, lineHeight: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
            aria-label="Tutup dialog proyek"
          >
            ×
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.15fr) minmax(240px, .85fr)", gap: 14, marginBottom: 18 }}>
          <div style={{ borderRadius: 24, border: `1px solid ${C.border}`, background: "linear-gradient(180deg, #fffaf2 0%, #f7eddc 100%)", padding: "18px 18px 16px", boxShadow: "0 16px 34px #5d43210d" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", marginBottom: 12, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: 10, letterSpacing: 1.8, textTransform: "uppercase", fontWeight: 800, color: C.dim, marginBottom: 6 }}>Project aktif saat ini</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: C.text, lineHeight: 1.2 }}>
                  {currentProject?.name || "Belum ada project aktif"}
                </div>
              </div>
              <Pill ch={currentProject ? "Siap dipakai lagi" : "Masih sesi lokal"} color={currentProject ? C.accent : C.orange} sm />
            </div>
            <div style={{ fontSize: 12, lineHeight: 1.75, color: C.muted, maxWidth: 440 }}>
              {currentProject
                ? getProjectSummary(currentProject)
                : "Kalau kamu baru mulai, buat satu nama project dulu. Setelah itu semua hasil wizard bisa langsung menempel ke project yang sama."}
            </div>
          </div>

          <div style={{ borderRadius: 24, border: `1px solid ${C.border}`, background: "#fffdf8", padding: "18px 18px 16px" }}>
            <div style={{ fontSize: 10, letterSpacing: 1.8, textTransform: "uppercase", fontWeight: 800, color: C.dim, marginBottom: 8 }}>Cara paling aman</div>
            <div style={{ display: "grid", gap: 10 }}>
              {[
                "Buat atau pilih satu project untuk campaign ini.",
                "Biarkan wizard dan editor menyimpan semua hasil ke situ.",
                "Kalau campaign baru mulai, cukup pindah project.",
              ].map((item, index) => (
                <div key={item} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <div style={{ width: 24, height: 24, borderRadius: 999, background: "#f5ecde", border: `1px solid ${C.border}`, color: C.text, fontSize: 11, fontWeight: 800, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {index + 1}
                  </div>
                  <div style={{ fontSize: 12, lineHeight: 1.7, color: C.muted }}>{item}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.1fr) minmax(240px, .9fr)", gap: 14, marginBottom: 18 }}>
          <div style={{ borderRadius: 28, border: `1px solid ${C.border}`, background: "linear-gradient(180deg, #fffdf8 0%, #f8efe0 100%)", padding: "20px 20px 18px", boxShadow: "0 16px 32px #5d43210d" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", marginBottom: 12, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: 10, letterSpacing: 1.8, textTransform: "uppercase", fontWeight: 800, color: C.dim, marginBottom: 6 }}>Langkah pertama</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: C.text, lineHeight: 1.2, marginBottom: 6 }}>Buat satu nama project yang jelas.</div>
                <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.75, maxWidth: 460 }}>
                  Pikirkan project ini seperti map untuk satu campaign. Nama produk, offer, atau momentum campaign biasanya jauh lebih membantu daripada nama internal tim.
                </div>
              </div>
              <Pill ch="Bisa diganti nanti" color={C.cyan} sm />
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "stretch" }}>
              <input value={newName} onChange={(event) => setNewName(event.target.value)} placeholder="Contoh: Serum Glow Ramadan"
                onKeyDown={(event) => event.key === "Enter" && create()}
                aria-label="Nama project baru"
                style={{ flex: 1, background: C.s1, border: `1px solid ${C.border}`, borderRadius: 16, padding: "12px 16px", color: C.text, fontSize: 13 }} />
              <Btn ch={<><span style={{ display: "inline-flex" }}>{Ic.plus({ size: 13 })}</span> Buat Project</>} onClick={create} size="sm" disabled={!newName.trim() || creating} loading={creating} />
            </div>
            <div style={{ marginTop: 10, fontSize: 11, lineHeight: 1.65, color: C.dim }}>
              Begitu dibuat, project itu langsung jadi tempat simpan untuk semua audience, angle, copy, dan landing page berikutnya.
            </div>
          </div>

          <div style={{ borderRadius: 24, border: `1px solid ${C.border}`, background: "#fff8ec", padding: "18px 18px 16px" }}>
            <div style={{ fontSize: 10, letterSpacing: 1.8, textTransform: "uppercase", fontWeight: 800, color: C.dim, marginBottom: 6 }}>Nama siap pakai</div>
            <div style={{ fontSize: 12, lineHeight: 1.7, color: C.muted, marginBottom: 10 }}>
              Kalau belum kepikiran, mulai dari nama yang paling dekat dengan campaign ini.
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {suggestedProjectNames.map((starter) => (
                <button
                  key={starter}
                  type="button"
                  onClick={() => setNewName(starter)}
                  style={{ border: `1px solid ${C.border}`, borderRadius: 999, background: "#fffdf8", color: C.muted, padding: "7px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}
                >
                  {starter}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          {loading && <Spin msg="Memuat daftar proyek..." />}
          {!loading && !projects.length && (
            <div style={{ borderRadius: 28, border: `1px dashed ${C.border}`, background: "linear-gradient(180deg, #fffdf8 0%, #f9f1e2 100%)", padding: "34px 28px", textAlign: "left" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14, flexWrap: "wrap" }}>
                <div style={{ width: 46, height: 46, borderRadius: 18, background: "#f4ead8", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                  {Ic.folder({ size: 20, color: C.accent })}
                </div>
                <div>
                  <div style={{ fontFamily: FONT_DISPLAY, fontSize: 28, lineHeight: 0.98, letterSpacing: -0.6, color: C.text, marginBottom: 4 }}>Belum ada project tersimpan.</div>
                  <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.7, maxWidth: 520 }}>
                    Kamu tinggal isi nama di bagian atas, lalu tekan buat. Setelah itu project baru akan langsung aktif dan sesi ini punya rumah yang jelas.
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {suggestedProjectNames.slice(0, 3).map((starter) => (
                  <button
                    key={starter}
                    type="button"
                    onClick={() => setNewName(starter)}
                    style={{ border: `1px solid ${C.border}`, borderRadius: 999, background: "#fff7ea", color: C.text, padding: "9px 14px", fontSize: 11, fontWeight: 800, cursor: "pointer" }}
                  >
                    Pakai nama: {starter}
                  </button>
                ))}
              </div>
            </div>
          )}
          {!loading && projects.length > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-end", marginBottom: 14, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: 10, letterSpacing: 1.8, textTransform: "uppercase", fontWeight: 800, color: C.dim, marginBottom: 6 }}>Atau lanjut dari yang sudah ada</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: C.text }}>Pilih project yang paling cocok dengan campaign ini.</div>
              </div>
              <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.6 }}>
                Project aktif sekarang diberi label jelas supaya kamu tidak salah simpan konteks.
              </div>
            </div>
          )}
          <div className="project-list">
            {projects.map((project) => (
              <div key={project.id} onClick={() => onSelect(project)}
                style={{ background: project.id === currentId ? "#f2ead9" : C.s1, border: `1px solid ${project.id === currentId ? C.accent + "45" : C.border}`, borderRadius: 24, padding: "18px 18px 16px", cursor: "pointer", display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 14, transition: "all .15s", minHeight: 188, boxShadow: project.id === currentId ? "0 18px 38px #1f6b4a14" : "0 12px 28px #5f45220d" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1.8, fontWeight: 800, color: project.id === currentId ? C.accent : C.dim, marginBottom: 8 }}>
                      {project.id === currentId ? "Sedang dipakai" : "Project"}
                    </div>
                    <div style={{ fontWeight: 800, fontSize: 18, color: C.text, lineHeight: 1.15 }}>{project.name}</div>
                  </div>
                  <button
                    type="button"
                    onClick={(event) => { event.stopPropagation(); del(project.id); }}
                    disabled={deletingId === project.id}
                    aria-label={`Hapus proyek ${project.name}`}
                    style={{ width: 34, height: 34, borderRadius: 999, background: deletingId === project.id ? "#f7ebe8" : "transparent", border: "none", color: C.red, cursor: deletingId === project.id ? "wait" : "pointer", opacity: deletingId === project.id ? 1 : 0.55, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
                  >
                    {Ic.trash({ size: 15, color: C.red })}
                  </button>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.7, marginBottom: 10 }}>
                    {getProjectSummary(project)}
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <Pill ch={formatProjectDate(project.updated_at)} color={C.cyan} sm />
                    <Pill ch={project.analysis ? "Siap campaign" : "Masih kosong"} color={project.analysis ? C.accent : C.orange} sm />
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", paddingTop: 12, borderTop: `1px solid ${project.id === currentId ? C.accent + "20" : C.border}` }}>
                  <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.6 }}>
                    {formatRelativeProjectTime(project.updated_at)}
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: project.id === currentId ? C.accent : C.text }}>
                    {project.id === currentId ? "Sedang aktif" : "Klik untuk lanjut"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
