export const LANDING_PAGE_PAGE_TYPE = "landing";
export const LANDING_PAGE_TEMPLATE_KEY = "sales-v1";
export const LANDING_PAGE_STYLE_PRESETS = {
  atelier: {
    label: "Atelier",
    displayFont: "'Fraunces', 'Georgia', serif",
    bodyFont: "'Instrument Sans', 'Segoe UI', sans-serif",
    radius: "26px",
    frame: "linear-gradient(180deg, rgba(255,255,255,.92) 0%, rgba(255,250,240,.96) 100%)",
    heroPattern: "radial-gradient(circle at top right, rgba(255,255,255,.18), transparent 36%), radial-gradient(circle at bottom left, rgba(255,255,255,.12), transparent 32%)",
  },
  signal: {
    label: "Signal",
    displayFont: "'Bricolage Grotesque', 'Trebuchet MS', sans-serif",
    bodyFont: "'Manrope', 'Segoe UI', sans-serif",
    radius: "20px",
    frame: "linear-gradient(180deg, rgba(255,255,255,.98) 0%, rgba(245,248,255,.96) 100%)",
    heroPattern: "linear-gradient(135deg, rgba(255,255,255,.08) 0%, transparent 40%), radial-gradient(circle at 80% 10%, rgba(255,255,255,.12), transparent 28%)",
  },
  noir: {
    label: "Noir Ledger",
    displayFont: "'Cormorant Garamond', 'Times New Roman', serif",
    bodyFont: "'Plus Jakarta Sans', 'Segoe UI', sans-serif",
    radius: "30px",
    frame: "linear-gradient(180deg, rgba(255,255,255,.96) 0%, rgba(250,246,239,.98) 100%)",
    heroPattern: "linear-gradient(145deg, rgba(255,255,255,.09) 0%, transparent 52%), radial-gradient(circle at 15% 20%, rgba(255,255,255,.14), transparent 22%)",
  },
};

export const LANDING_PAGE_BRIEF_DEFAULTS = {
  productName: "",
  targetMarket: "",
  offer: "",
  price: "",
  ctaWhatsapp: "",
  ctaCheckout: "",
  usp: "",
  benefitMain: "",
  socialProof: "",
  guarantee: "",
  faq: "",
  tone: "",
};

export const STARTER_BRIEF_KITS = [
  {
    id: "starter-skincare",
    label: "Produk fisik",
    projectName: "Starter Skincare Brightening",
    goalPreset: "physical_product",
    summary: "Contoh untuk skincare lokal yang butuh manfaat cepat, bukti aman, dan CTA order yang ringan.",
    brief: {
      productName: "Glowbarrier Serum",
      targetMarket: "Perempuan 23-35 tahun yang pengin kulit lebih cerah dan lembap tapi capek coba produk yang hasilnya nggak jelas.",
      offer: "Serum brightening 30ml dengan niacinamide, tranexamic acid, dan ceramide untuk bantu mencerahkan sekaligus jaga skin barrier.",
      price: "Rp189.000",
      ctaWhatsapp: "https://wa.me/6281234567890",
      ctaCheckout: "https://checkout.brand.com/glowbarrier",
      usp: "Ringan dipakai harian, fokus bantu cerah tanpa bikin kulit terasa ketarik.",
      benefitMain: "Kulit terasa lebih lembap, tampak lebih cerah, dan lebih nyaman dipakai daily tanpa drama.",
      socialProof: "12.000+ botol terjual dan repeat order tinggi dari customer yang cari serum pencerah untuk pemakaian harian.",
      guarantee: "Kalau salah pilih varian, tim CS bantu arahkan pemakaian yang lebih pas.",
      faq: "Apakah aman untuk pemula?\nBisa dipakai pagi dan malam?\nApakah cocok untuk kulit sensitif?",
      tone: "hangat, meyakinkan, tidak terlalu formal, gampang dipahami",
    },
  },
  {
    id: "starter-agency",
    label: "Jasa",
    projectName: "Starter Jasa Ads UMKM",
    goalPreset: "service_offer",
    summary: "Contoh untuk jasa iklan atau freelance yang perlu menjelaskan masalah klien dan alasan pakai layanan sekarang.",
    brief: {
      productName: "Jasa Meta Ads UMKM",
      targetMarket: "Owner UMKM yang sudah pernah jalanin iklan tapi hasilnya nggak stabil, atau belum sempat bikin sistem iklan yang rapi.",
      offer: "Setup campaign, riset audience, ide jualan, copy, dan optimasi mingguan untuk produk UMKM yang ingin dapat order lebih stabil.",
      price: "Mulai Rp2.500.000 / bulan",
      ctaWhatsapp: "https://wa.me/6281234567890",
      ctaCheckout: "https://cal.com/agency/ads-audit",
      usp: "Bukan cuma setting ads, tapi bantu rapikan offer dan pesan jualan supaya iklan nggak boncos dari awal.",
      benefitMain: "Klien lebih cepat tahu kenapa iklannya seret dan apa yang harus diperbaiki supaya lead atau order lebih masuk akal.",
      socialProof: "Sudah bantu puluhan UMKM fashion, kuliner, dan skincare yang sebelumnya stuck di iklan trial-error.",
      guarantee: "Kalau setelah audit awal ternyata belum siap scaling, kamu dapat roadmap perbaikan yang tetap bisa dipakai tim internal.",
      faq: "Apakah cocok untuk budget kecil?\nApakah tim kami tetap bisa approval materi?\nBerapa lama sampai campaign jalan?",
      tone: "tajam, profesional, tetap enak dibaca pemilik bisnis",
    },
  },
  {
    id: "starter-class",
    label: "Kelas",
    projectName: "Starter Kelas Konten Jualan",
    goalPreset: "course_consulting",
    summary: "Contoh untuk kelas online, workshop, atau konsultasi yang menjual perubahan, bukan cuma materi.",
    brief: {
      productName: "Kelas Konten yang Jualan",
      targetMarket: "Freelancer, coach, dan owner bisnis kecil yang rutin bikin konten tapi bingung kenapa kontennya ramai lihat tapi sepi closing.",
      offer: "Program 4 minggu berisi modul, bedah konten, template hook, dan sesi feedback untuk bantu peserta bikin konten yang lebih enak dibaca dan lebih jelas arah jualannya.",
      price: "Rp497.000",
      ctaWhatsapp: "https://wa.me/6281234567890",
      ctaCheckout: "https://checkout.brand.com/kelas-konten",
      usp: "Materinya bukan teori panjang. Peserta langsung dikasih struktur, contoh, dan revisi yang bisa dipakai untuk niche masing-masing.",
      benefitMain: "Peserta lebih paham cara bikin konten yang nyambung ke produk, bukan sekadar ramai views.",
      socialProof: "2.300+ peserta dari creator, coach, dan UMKM sudah ikut kelas ini dalam 8 batch terakhir.",
      guarantee: "Kalau setelah 7 hari merasa tidak cocok, peserta bisa ajukan refund sesuai syarat program.",
      faq: "Apakah cocok untuk pemula?\nApakah ada rekaman?\nApakah bisa tanya niche sendiri?",
      tone: "jelas, suportif, terasa seperti mentor yang paham masalah peserta",
    },
  },
];

export const LANDING_PAGE_BRIEF_FIELDS = [
  { key: "productName", label: "Nama Produk", placeholder: "Contoh: Kelas Copywriting Cuan", required: true },
  { key: "targetMarket", label: "Target Pembeli", placeholder: "Contoh: freelancer & UMKM yang mau belajar nulis iklan", required: true, multiline: true, rows: 3 },
  { key: "offer", label: "Offer Inti", placeholder: "Contoh: Kursus online 6 modul + template iklan + grup diskusi", required: true, multiline: true, rows: 3 },
  { key: "price", label: "Harga", placeholder: "Contoh: Rp 297.000" },
  { key: "ctaWhatsapp", label: "CTA WhatsApp", placeholder: "Contoh: https://wa.me/6281234567890", required: true },
  { key: "ctaCheckout", label: "CTA Checkout", placeholder: "Contoh: https://checkout.brand.com/copywriting", required: true },
  { key: "usp", label: "USP / Pembeda", placeholder: "Contoh: Modul singkat, fokus praktek, cocok untuk pemula", multiline: true, rows: 3 },
  { key: "benefitMain", label: "Benefit Utama", placeholder: "Contoh: Bisa bikin iklan yang lebih enak dibaca dan lebih potensial closing", multiline: true, rows: 3 },
  { key: "socialProof", label: "Bukti sosial sementara", placeholder: "Contoh: 1.200+ peserta dari freelancer, owner UMKM, dan tim marketing", multiline: true, rows: 3 },
  { key: "guarantee", label: "Garansi", placeholder: "Contoh: Garansi 7 hari uang kembali kalau belum kebayang cara pakainya", multiline: true, rows: 3 },
  { key: "faq", label: "FAQ Dasar", placeholder: "Tulis 3-5 FAQ. Satu baris per item.\nContoh:\nApakah cocok untuk pemula?\nDapat template iklan?\nAkses berapa lama?", multiline: true, rows: 5 },
  { key: "tone", label: "Nada / gaya brand", placeholder: "Contoh: hangat, to the point, meyakinkan, tidak terlalu formal", multiline: true, rows: 3 },
];

export const LANDING_PAGE_REQUIRED_BRIEF_FIELDS = LANDING_PAGE_BRIEF_FIELDS.filter((field) => field.required).map((field) => field.key);

export const LANDING_PAGE_SECTION_TYPES = ["hero", "problem", "benefits", "proof", "offer", "faq", "cta", "footer"];

export const LANDING_PAGE_SECTION_LABELS = {
  hero: "Pembuka",
  problem: "Masalah",
  benefits: "Manfaat",
  proof: "Bukti",
  offer: "Penawaran",
  faq: "FAQ",
  cta: "CTA",
  footer: "Penutup",
};

const FRAMEWORK_CONFIG = {
  Hormozi: {
    label: "Hormozi",
    badge: "Funnel fokus nilai",
    headlineHint: "tekankan hasil, value stack, dan risk reversal",
    sectionOrder: ["hero", "problem", "benefits", "proof", "offer", "faq", "cta", "footer"],
    theme: {
      accent: "#16a34a",
      accent2: "#0f766e",
      accentSoft: "#dcfce7",
      ink: "#12301d",
      bg: "#f5fbf7",
      surface: "#ffffff",
      muted: "#53705d",
      heroBg: "linear-gradient(135deg, #0f172a 0%, #11301d 56%, #16a34a 100%)",
    },
  },
  AIDA: {
    label: "AIDA",
    badge: "Dari perhatian ke aksi",
    headlineHint: "headline harus cepat menarik, lalu bangun desire sebelum CTA",
    sectionOrder: ["hero", "benefits", "problem", "proof", "offer", "faq", "cta", "footer"],
    theme: {
      accent: "#2563eb",
      accent2: "#0891b2",
      accentSoft: "#dbeafe",
      ink: "#12243b",
      bg: "#f4f8ff",
      surface: "#ffffff",
      muted: "#54667f",
      heroBg: "linear-gradient(135deg, #0f172a 0%, #1d4ed8 55%, #0891b2 100%)",
    },
  },
  PAS: {
    label: "PAS",
    badge: "Funnel dari masalah",
    headlineHint: "angkat problem dan agitation dengan tegas lalu beri solusi yang jelas",
    sectionOrder: ["hero", "problem", "offer", "benefits", "proof", "faq", "cta", "footer"],
    theme: {
      accent: "#dc2626",
      accent2: "#ea580c",
      accentSoft: "#fee2e2",
      ink: "#3b1717",
      bg: "#fff7f5",
      surface: "#ffffff",
      muted: "#7a5555",
      heroBg: "linear-gradient(135deg, #2f1321 0%, #7f1d1d 58%, #ea580c 100%)",
    },
  },
  StoryBrand: {
    label: "StoryBrand",
    badge: "Funnel dengan brand sebagai pemandu",
    headlineHint: "posisikan audiens sebagai hero dan brand sebagai guide",
    sectionOrder: ["hero", "problem", "benefits", "cta", "proof", "offer", "faq", "footer"],
    theme: {
      accent: "#4f46e5",
      accent2: "#7c3aed",
      accentSoft: "#e0e7ff",
      ink: "#221b46",
      bg: "#f7f7ff",
      surface: "#ffffff",
      muted: "#645f83",
      heroBg: "linear-gradient(135deg, #111827 0%, #312e81 56%, #7c3aed 100%)",
    },
  },
  BAB: {
    label: "Before-After-Bridge",
    badge: "Funnel transformasi",
    headlineHint: "kontraskan kondisi sekarang vs hasil setelah beli, lalu jelaskan jembatannya",
    sectionOrder: ["hero", "problem", "benefits", "proof", "offer", "cta", "faq", "footer"],
    theme: {
      accent: "#0f766e",
      accent2: "#16a34a",
      accentSoft: "#ccfbf1",
      ink: "#113333",
      bg: "#f2fbfa",
      surface: "#ffffff",
      muted: "#4d6f6b",
      heroBg: "linear-gradient(135deg, #0f172a 0%, #134e4a 56%, #16a34a 100%)",
    },
  },
};

function cleanString(value, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

const LEGACY_COPY_REPLACEMENTS = [
  [/Proof section/gi, "Bagian bukti"],
  [/high-trust/gi, "lebih meyakinkan"],
  [/creator economy/gi, "bisnis creator"],
  [/class launch/gi, "peluncuran kelas"],
  [/private beta/gi, "beta tertutup"],
  [/waitlist/gi, "daftar tunggu"],
  [/Workshop registration/gi, "Pendaftaran workshop"],
  [/UMKM order page/gi, "Halaman order UMKM"],
  [/Performance audit/gi, "Audit performa"],
  [/Mentor sales system/gi, "Sistem jualan mentor"],
  [/\bclient\b/gi, "klien"],
  [/\bcustomer\b/gi, "pelanggan"],
  [/Placeholder role/gi, "Contoh peran"],
  [/Placeholder customer/gi, "Contoh pelanggan"],
];

function normalizeLegacyCopy(value, fallback = "") {
  let text = cleanString(value, fallback);
  if (!text) return text;
  for (const [pattern, replacement] of LEGACY_COPY_REPLACEMENTS) {
    text = text.replace(pattern, replacement);
  }
  return text.replace(/\s{2,}/g, " ").trim();
}

function cleanArray(items) {
  return (Array.isArray(items) ? items : []).map((item) => cleanString(item)).filter(Boolean);
}

function fromMultiline(value) {
  return cleanString(value)
    .split(/\n+/)
    .map((item) => cleanString(item.replace(/^[-\d.)\s]+/, "")))
    .filter(Boolean);
}

function ensureStringList(value, fallback = []) {
  if (Array.isArray(value)) return cleanArray(value);
  if (typeof value === "string") {
    const multi = value.includes("\n") ? fromMultiline(value) : value.split(/[;,]/).map((item) => cleanString(item)).filter(Boolean);
    return multi.length ? multi : fallback;
  }
  return fallback;
}

function normalizeHref(value, fallback = "#cta") {
  const raw = cleanString(value);
  if (!raw) return fallback;
  if (/^\+?\d[\d\s-]+$/.test(raw)) return `https://wa.me/${raw.replace(/\D/g, "")}`;
  if (/^(https?:\/\/|mailto:|tel:|#)/i.test(raw)) return raw;
  if (/^(wa\.me|api\.whatsapp\.com)/i.test(raw)) return `https://${raw}`;
  if (raw.includes(".")) return `https://${raw.replace(/^\/+/, "")}`;
  return fallback;
}

function normalizeObjectArray(items, mapper, fallback = []) {
  if (!Array.isArray(items)) return fallback;
  const mapped = items.map((item) => mapper(item)).filter(Boolean);
  return mapped.length ? mapped : fallback;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getFrameworkConfig(framework) {
  return FRAMEWORK_CONFIG[cleanString(framework)] || FRAMEWORK_CONFIG.Hormozi;
}

export function getLandingPageStylePreset(stylePreset) {
  return LANDING_PAGE_STYLE_PRESETS[cleanString(stylePreset)] || LANDING_PAGE_STYLE_PRESETS.atelier;
}

function normalizeStylePreset(stylePreset) {
  const raw = cleanString(stylePreset);
  return LANDING_PAGE_STYLE_PRESETS[raw] ? raw : "atelier";
}

function createSectionMeta(section, type, index) {
  return {
    id: cleanString(section?.id, `${type}-${index + 1}`),
    hidden: Boolean(section?.hidden),
  };
}

function normalizeHero(section, brief, config, index = 0) {
  return {
    type: "hero",
    ...createSectionMeta(section, "hero", index),
    badge: normalizeLegacyCopy(section?.badge, brief.usp || config.badge),
    headline: normalizeLegacyCopy(section?.headline, `${brief.productName || "Produk ini"} dibuat untuk ${brief.targetMarket || "orang yang butuh hasil lebih cepat"}`),
    subheadline: normalizeLegacyCopy(section?.subheadline, brief.offer || brief.benefitMain || "Tawarkan solusi yang jelas, ringkas, dan siap dijual."),
    primaryCtaText: normalizeLegacyCopy(section?.primaryCtaText, "Chat via WhatsApp"),
    primaryCtaHref: normalizeHref(section?.primaryCtaHref || brief.ctaWhatsapp, "#whatsapp"),
    secondaryCtaText: normalizeLegacyCopy(section?.secondaryCtaText, "Lihat Checkout"),
    secondaryCtaHref: normalizeHref(section?.secondaryCtaHref || brief.ctaCheckout, "#checkout"),
    highlightBullets: ensureStringList(section?.highlightBullets, [
      brief.benefitMain || "Fokus ke hasil yang paling dicari pasar.",
      brief.usp || "Tonjolkan alasan kenapa solusi ini lebih mudah dipilih.",
      brief.guarantee || "Tambahkan risk reversal yang menenangkan calon buyer.",
    ]).map((item) => normalizeLegacyCopy(item)).slice(0, 4),
  };
}

function normalizeProblem(section, brief, index = 0) {
  return {
    type: "problem",
    ...createSectionMeta(section, "problem", index),
    title: normalizeLegacyCopy(section?.title, "Masalah yang sering bikin calon buyer menunda"),
    intro: normalizeLegacyCopy(section?.intro, `Kalau ${brief.targetMarket || "target market kamu"} masih mengalami hal-hal ini, landing page harus menyebutnya dengan jelas.`),
    painPoints: ensureStringList(section?.painPoints, [
      `Sudah coba cari solusi tapi belum nemu yang terasa pas untuk ${brief.targetMarket || "kebutuhannya"}.`,
      "Masih bingung harus mulai dari mana dan takut buang waktu.",
      "Sudah tertarik, tapi belum cukup yakin untuk ambil keputusan sekarang.",
    ]).map((item) => normalizeLegacyCopy(item)).slice(0, 5),
  };
}

function normalizeBenefits(section, brief, index = 0) {
  return {
    type: "benefits",
    ...createSectionMeta(section, "benefits", index),
    title: normalizeLegacyCopy(section?.title, "Apa yang mereka dapat setelah ambil offer ini"),
    items: normalizeObjectArray(section?.items, (item) => {
      const title = normalizeLegacyCopy(item?.title);
      const description = normalizeLegacyCopy(item?.description || item?.desc);
      if (!title && !description) return null;
      return {
        title: title || "Benefit utama",
        description: description || brief.benefitMain || "Jelaskan hasil yang akan dirasakan setelah produk dipakai.",
      };
    }, [
      { title: "Lebih jelas langkahnya", description: brief.offer || "Produk ini memberi jalur yang lebih rapi untuk mulai jalan." },
      { title: "Lebih percaya diri eksekusinya", description: brief.benefitMain || "Calon buyer tahu apa yang harus dilakukan setelah checkout." },
      { title: "Lebih cepat lihat hasil awal", description: brief.usp || "Tonjolkan kecepatan, kemudahan, atau struktur yang mempersingkat trial-error." },
    ]).slice(0, 4),
  };
}

function normalizeProof(section, brief, index = 0) {
  return {
    type: "proof",
    ...createSectionMeta(section, "proof", index),
    title: normalizeLegacyCopy(section?.title, "Bukti sosial yang bikin offer lebih meyakinkan"),
    intro: normalizeLegacyCopy(section?.intro, brief.socialProof || "Tambahkan testimoni placeholder yang nanti bisa diganti dengan bukti sosial asli."),
    testimonials: normalizeObjectArray(section?.testimonials, (item, idx) => {
      const quote = normalizeLegacyCopy(item?.quote || item?.text);
      const name = normalizeLegacyCopy(item?.name);
      const role = normalizeLegacyCopy(item?.role);
      if (!quote && !name && !role) return null;
      return {
        name: name || `Testimoni ${idx + 1}`,
        role: role || "Contoh peran",
        quote: quote || "Isi testimoni ini dengan pengalaman nyata pelanggan agar offer terasa lebih solid.",
      };
    }, [
      { name: "Testimoni 1", role: "Contoh pelanggan", quote: "Bagian ini bisa diisi testimoni real untuk memperkuat rasa percaya sebelum checkout." },
      { name: "Testimoni 2", role: "Contoh pelanggan", quote: "Gunakan hasil spesifik, perubahan yang dirasakan, atau alasan kenapa mereka akhirnya pilih offer ini." },
      { name: "Testimoni 3", role: "Contoh pelanggan", quote: "Kalau belum punya testimoni, pakai placeholder sementara lalu update setelah ada bukti sosial asli." },
    ]).slice(0, 4),
  };
}

function normalizeOffer(section, brief, index = 0) {
  return {
    type: "offer",
    ...createSectionMeta(section, "offer", index),
    title: normalizeLegacyCopy(section?.title, brief.offer || "Offer inti"),
    priceLabel: normalizeLegacyCopy(section?.priceLabel, "Investasi"),
    priceValue: normalizeLegacyCopy(section?.priceValue, brief.price || "Hubungi kami untuk detail harga"),
    guarantee: normalizeLegacyCopy(section?.guarantee, brief.guarantee || "Tambahkan garansi atau risk reversal yang relevan."),
    bonuses: ensureStringList(section?.bonuses, [
      brief.benefitMain || "Benefit utama yang paling dicari audience",
      brief.usp || "Pembeda yang bikin offer ini layak dipilih sekarang",
      "CTA yang langsung mengarahkan ke WhatsApp atau checkout",
    ]).map((item) => normalizeLegacyCopy(item)).slice(0, 5),
    ctaText: normalizeLegacyCopy(section?.ctaText, "Ambil Offer Ini"),
    ctaHref: normalizeHref(section?.ctaHref || brief.ctaCheckout, "#checkout"),
  };
}

function normalizeFaq(section, brief, index = 0) {
  const briefFaq = fromMultiline(brief.faq);
  return {
    type: "faq",
    ...createSectionMeta(section, "faq", index),
    title: normalizeLegacyCopy(section?.title, "Pertanyaan yang paling sering muncul"),
    items: normalizeObjectArray(section?.items, (item) => {
      const question = normalizeLegacyCopy(item?.question || item?.q);
      const answer = normalizeLegacyCopy(item?.answer || item?.a);
      if (!question && !answer) return null;
      return {
        question: question || "Pertanyaan umum",
        answer: answer || "Tambahkan jawaban yang menenangkan keberatan buyer.",
      };
    }, briefFaq.slice(0, 4).map((question) => ({
      question,
      answer: "Sesuaikan jawaban ini dengan detail offer, akses, bonus, atau garansi yang kamu berikan.",
    })).concat([
      { question: "Apakah cocok untuk pemula?", answer: "Gunakan jawaban singkat yang menunjukkan siapa target paling ideal dan apa ekspektasinya." },
      { question: "Aksesnya berapa lama?", answer: "Jelaskan durasi akses, format materi, atau cara produk dikirimkan." },
      { question: "Kalau masih bingung, bisa tanya dulu?", answer: "Arahkan ke WhatsApp agar buyer bisa bertanya sebelum checkout." },
    ])).slice(0, 5),
  };
}

function normalizeCta(section, brief, index = 0) {
  return {
    type: "cta",
    ...createSectionMeta(section, "cta", index),
    title: normalizeLegacyCopy(section?.title, "Kalau offer ini relevan, lanjutkan sekarang"),
    text: normalizeLegacyCopy(section?.text, brief.benefitMain || brief.offer || "Tutup landing page dengan ajakan yang konkret, tenang, dan tidak memaksa."),
    ctaText: normalizeLegacyCopy(section?.ctaText, "Lanjut ke WhatsApp"),
    ctaHref: normalizeHref(section?.ctaHref || brief.ctaWhatsapp, "#whatsapp"),
  };
}

function normalizeFooter(section, brief, index = 0) {
  return {
    type: "footer",
    ...createSectionMeta(section, "footer", index),
    smallText: normalizeLegacyCopy(section?.smallText, `${brief.productName || "Produk"} disusun untuk membantu ${brief.targetMarket || "target market kamu"} mengambil keputusan dengan lebih cepat.`),
    contactLine: normalizeLegacyCopy(section?.contactLine, brief.ctaWhatsapp ? `Butuh tanya dulu? Chat: ${brief.ctaWhatsapp}` : "Butuh tanya dulu? Arahkan ke CTA WhatsApp di atas."),
  };
}

function normalizeSeo(seo, brief) {
  return {
    title: normalizeLegacyCopy(seo?.title, `${brief.productName || "Landing Page"} | ${brief.targetMarket || "Offer"}`),
    description: normalizeLegacyCopy(seo?.description, brief.offer || brief.benefitMain || brief.usp || "Landing page AI-generated untuk membantu closing lebih cepat."),
  };
}

export function createLandingPageBrief(overrides = {}) {
  return {
    ...LANDING_PAGE_BRIEF_DEFAULTS,
    ...Object.fromEntries(Object.entries(overrides || {}).map(([key, value]) => [key, cleanString(value)])),
  };
}

export function getLandingPageMissingBriefFields(brief) {
  return LANDING_PAGE_REQUIRED_BRIEF_FIELDS.filter((key) => !cleanString(brief?.[key]));
}

export function buildLandingPagePrompt({ brief, framework, settings = {} }) {
  const normalizedBrief = createLandingPageBrief(brief);
  const config = getFrameworkConfig(framework);
  const styleContext = [
    settings?.brandVoice ? `Brand voice: ${settings.brandVoice}` : "",
    settings?.customInstructions ? `Instruksi tambahan: ${settings.customInstructions}` : "",
    settings?.requiredWords ? `Kata yang wajib muncul: ${settings.requiredWords}` : "",
    settings?.forbiddenWords ? `Kata yang dilarang: ${settings.forbiddenWords}` : "",
    normalizedBrief.tone ? `Tone: ${normalizedBrief.tone}` : "",
  ].filter(Boolean).join("\n");

  return `Kamu adalah AI funnel strategist Indonesia.

Tugas: buat landing page terstruktur berbasis framework ${config.label} untuk produk berikut.
Fokus copy:
- ${config.headlineHint}
- Bahasa Indonesia yang jelas, natural, enak dibaca, dan terasa ditulis oleh penjual yang paham market Indonesia.
- Jangan terdengar seperti hasil translate, brosur korporat, atau pitch deck startup.
- Pilih kalimat yang spesifik dan membumi. Lebih baik sederhana tapi kena daripada mewah tapi kosong.
- Jangan klaim angka palsu. Jika social proof belum pasti, tulis placeholder yang jujur.
- Gunakan CTA WhatsApp dan CTA checkout yang diberikan user.
- JANGAN output HTML. Output HANYA JSON valid.
- Tulis headline, bullet, CTA, dan body copy yang benar-benar membantu orang mengambil keputusan beli.

BRIEF:
${JSON.stringify(normalizedBrief, null, 2)}

KONTEKS TAMBAHAN:
${styleContext || "Tidak ada"}

Kembalikan JSON object dengan shape TEPAT seperti ini:
{
  "pageType": "landing",
  "framework": "${config.label}",
  "templateKey": "sales-v1",
  "seo": {
    "title": "string",
    "description": "string"
  },
  "sections": [
    {
      "type": "hero",
      "badge": "string",
      "headline": "string",
      "subheadline": "string",
      "primaryCtaText": "string",
      "primaryCtaHref": "string",
      "secondaryCtaText": "string",
      "secondaryCtaHref": "string",
      "highlightBullets": ["string", "string", "string"]
    },
    {
      "type": "problem",
      "title": "string",
      "intro": "string",
      "painPoints": ["string", "string", "string"]
    },
    {
      "type": "benefits",
      "title": "string",
      "items": [
        { "title": "string", "description": "string" },
        { "title": "string", "description": "string" },
        { "title": "string", "description": "string" }
      ]
    },
    {
      "type": "proof",
      "title": "string",
      "intro": "string",
      "testimonials": [
        { "name": "string", "role": "string", "quote": "string" },
        { "name": "string", "role": "string", "quote": "string" },
        { "name": "string", "role": "string", "quote": "string" }
      ]
    },
    {
      "type": "offer",
      "title": "string",
      "priceLabel": "string",
      "priceValue": "string",
      "guarantee": "string",
      "bonuses": ["string", "string", "string"],
      "ctaText": "string",
      "ctaHref": "string"
    },
    {
      "type": "faq",
      "title": "string",
      "items": [
        { "question": "string", "answer": "string" },
        { "question": "string", "answer": "string" },
        { "question": "string", "answer": "string" }
      ]
    },
    {
      "type": "cta",
      "title": "string",
      "text": "string",
      "ctaText": "string",
      "ctaHref": "string"
    },
    {
      "type": "footer",
      "smallText": "string",
      "contactLine": "string"
    }
  ],
  "generatedAnalysis": {
    "produk": "string",
    "tagline": "string",
    "offer_inti": "string",
    "pain_points": ["string", "string", "string"],
    "dream_outcome": "string",
    "usp": "string",
    "target_market": "string",
    "harga": "string",
    "guarantee": "string",
    "social_proof": "string",
    "cta_utama": "string",
    "framework_produk": "${config.label}",
    "nilai_utama": ["string", "string", "string"]
  }
}

PENTING:
- Tulis sections lengkap dan jangan ada type lain selain hero, problem, benefits, proof, offer, faq, cta, footer.
- Gunakan CTA WhatsApp user untuk hero primary CTA atau CTA section utama.
- Gunakan CTA checkout user untuk hero secondary CTA atau offer CTA.
- Output hanya JSON object valid, tanpa markdown, tanpa komentar, tanpa penjelasan.`;
}

function extractJsonObject(text) {
  if (typeof text !== "string" || !text.trim()) throw new Error("Respons AI kosong.");
  const raw = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
  try {
    return JSON.parse(raw);
  } catch {
    const objectMatch = raw.match(/(\{[\s\S]*\})/);
    if (objectMatch) {
      return JSON.parse(objectMatch[1]);
    }
  }
  throw new Error("JSON landing page tidak valid.");
}

export function buildAnalysisFromPage(page, brief = {}) {
  const normalizedBrief = createLandingPageBrief(brief);
  const sections = Array.isArray(page?.sections) ? page.sections : [];
  const pickSection = (type) => sections.find((section) => section.type === type && !section.hidden)
    || sections.find((section) => section.type === type)
    || {};
  const hero = pickSection("hero");
  const problem = pickSection("problem");
  const benefits = pickSection("benefits");
  const proof = pickSection("proof");
  const offer = pickSection("offer");
  const cta = pickSection("cta");

  return {
    produk: cleanString(normalizedBrief.productName, "Produk"),
    tagline: cleanString(hero.headline, cleanString(normalizedBrief.benefitMain, "Landing page AI-generated")),
    offer_inti: cleanString(normalizedBrief.offer, cleanString(hero.subheadline, "Offer utama belum diisi.")),
    pain_points: ensureStringList(problem.painPoints, fromMultiline(normalizedBrief.faq)).slice(0, 5),
    dream_outcome: cleanString(benefits.items?.[0]?.description, cleanString(normalizedBrief.benefitMain, "Hasil akhir yang diinginkan buyer.")),
    usp: cleanString(normalizedBrief.usp, cleanString(hero.badge, "Pembeda utama offer")),
    target_market: cleanString(normalizedBrief.targetMarket, "Target market"),
    harga: cleanString(offer.priceValue, cleanString(normalizedBrief.price, "tidak disebutkan")),
    guarantee: cleanString(offer.guarantee, cleanString(normalizedBrief.guarantee, "Tidak disebutkan")),
    social_proof: cleanString(normalizedBrief.socialProof, cleanString(proof.intro, "Belum ada social proof yang disimpan.")),
    cta_utama: cleanString(cta.ctaText, cleanString(hero.primaryCtaText, "Hubungi via WhatsApp")),
    framework_produk: cleanString(page?.framework, "Hormozi"),
    nilai_utama: [
      ...normalizeObjectArray(benefits.items, (item) => {
        const title = cleanString(item?.title);
        return title ? title : null;
      }),
      ...ensureStringList(offer.bonuses),
    ].slice(0, 5),
  };
}

export function buildAnalysisFromBrief(brief = {}) {
  const normalizedBrief = createLandingPageBrief(brief);
  const fallbackPainPoints = [
    normalizedBrief.targetMarket ? `Masih kesulitan menemukan solusi yang terasa cocok untuk ${normalizedBrief.targetMarket}.` : "Masih kesulitan menemukan solusi yang terasa cocok untuk kebutuhan saat ini.",
    normalizedBrief.offer ? `Belum yakin apakah offer seperti "${normalizedBrief.offer}" benar-benar worth dibeli sekarang.` : "Belum yakin offer mana yang paling layak dibeli sekarang.",
    normalizedBrief.usp ? `Belum melihat pembeda utama yang membuat offer ini terasa lebih masuk akal daripada opsi lain.` : "Belum melihat pembeda utama yang membuat offer ini lebih masuk akal daripada opsi lain.",
  ];
  const faqAsPainPoints = fromMultiline(normalizedBrief.faq);
  const valuePoints = [
    normalizedBrief.usp,
    normalizedBrief.benefitMain,
    normalizedBrief.guarantee,
    normalizedBrief.offer,
  ].map((item) => cleanString(item)).filter(Boolean);

  return {
    produk: cleanString(normalizedBrief.productName, "Produk"),
    tagline: cleanString(normalizedBrief.benefitMain, cleanString(normalizedBrief.offer, "Brief campaign siap dipakai.")),
    offer_inti: cleanString(normalizedBrief.offer, "Offer utama belum diisi."),
    pain_points: (faqAsPainPoints.length ? faqAsPainPoints : fallbackPainPoints).slice(0, 5),
    dream_outcome: cleanString(normalizedBrief.benefitMain, "Hasil akhir yang diinginkan buyer."),
    usp: cleanString(normalizedBrief.usp, "Pembeda utama offer"),
    target_market: cleanString(normalizedBrief.targetMarket, "Target market"),
    harga: cleanString(normalizedBrief.price, "tidak disebutkan"),
    guarantee: cleanString(normalizedBrief.guarantee, "Tidak disebutkan"),
    social_proof: cleanString(normalizedBrief.socialProof, "Belum ada social proof yang disimpan."),
    cta_utama: cleanString(normalizedBrief.ctaWhatsapp ? "Hubungi via WhatsApp" : "Pelajari offer ini"),
    framework_produk: "Brief Manual",
    nilai_utama: valuePoints.slice(0, 5),
  };
}

export function validateAndNormalizeLandingPage(input, { brief = {}, framework } = {}) {
  const normalizedBrief = createLandingPageBrief(brief);
  const raw = typeof input === "string" ? extractJsonObject(input) : input;
  if (!raw || typeof raw !== "object") throw new Error("Landing page harus berbentuk object.");

  const config = getFrameworkConfig(raw.framework || framework);
  const rawSections = Array.isArray(raw.sections) ? raw.sections : [];
  const missingSections = LANDING_PAGE_SECTION_TYPES.filter((type) => !rawSections.some((section) => cleanString(section?.type) === type));
  if (missingSections.length) {
    throw new Error(`Landing page AI invalid: section wajib hilang (${missingSections.join(", ")}).`);
  }

  const sections = rawSections.map((section, index) => {
    const type = cleanString(section?.type);
    switch (type) {
      case "hero": return normalizeHero(section, normalizedBrief, config, index);
      case "problem": return normalizeProblem(section, normalizedBrief, index);
      case "benefits": return normalizeBenefits(section, normalizedBrief, index);
      case "proof": return normalizeProof(section, normalizedBrief, index);
      case "offer": return normalizeOffer(section, normalizedBrief, index);
      case "faq": return normalizeFaq(section, normalizedBrief, index);
      case "cta": return normalizeCta(section, normalizedBrief, index);
      case "footer": return normalizeFooter(section, normalizedBrief, index);
      default: throw new Error(`Unknown section type: ${type}`);
    }
  });

  const page = {
    pageType: LANDING_PAGE_PAGE_TYPE,
    framework: config.label,
    templateKey: LANDING_PAGE_TEMPLATE_KEY,
    stylePreset: normalizeStylePreset(raw.stylePreset),
    seo: normalizeSeo(raw.seo, normalizedBrief),
    sections,
  };

  return {
    ...page,
    generatedAnalysis: {
      ...buildAnalysisFromPage(page, normalizedBrief),
      ...(raw.generatedAnalysis && typeof raw.generatedAnalysis === "object" ? raw.generatedAnalysis : {}),
      framework_produk: config.label,
    },
  };
}

export function normalizeLandingPageRecord(pageInput, brief = {}) {
  if (!pageInput || typeof pageInput !== "object") return null;
  const normalizedBrief = createLandingPageBrief(pageInput.brief || brief);
  const normalizedPage = validateAndNormalizeLandingPage(pageInput, {
    brief: normalizedBrief,
    framework: pageInput.framework,
  });

  return {
    ...pageInput,
    ...normalizedPage,
    brief: normalizedBrief,
    generatedAnalysis: buildAnalysisFromPage(normalizedPage, normalizedBrief),
  };
}

export function getOrderedSections(page) {
  return Array.isArray(page?.sections) ? page.sections : [];
}

function renderList(items, renderer) {
  return items.map(renderer).join("");
}

function renderHero(section) {
  return `
    <section class="hero">
      <div class="container hero-inner">
        <div class="hero-copy">
          <span class="hero-badge">${escapeHtml(section.badge)}</span>
          <h1>${escapeHtml(section.headline)}</h1>
          <p class="hero-sub">${escapeHtml(section.subheadline)}</p>
          <div class="hero-actions">
            <a class="btn btn-primary" href="${escapeHtml(section.primaryCtaHref)}">${escapeHtml(section.primaryCtaText)}</a>
            <a class="btn btn-secondary" href="${escapeHtml(section.secondaryCtaHref)}">${escapeHtml(section.secondaryCtaText)}</a>
          </div>
        </div>
        <div class="hero-card">
          <div class="eyebrow">Kenapa halaman ini bekerja</div>
          <ul class="bullet-list">
            ${renderList(section.highlightBullets, (item) => `<li>${escapeHtml(item)}</li>`)}
          </ul>
        </div>
      </div>
    </section>
  `;
}

function renderProblem(section) {
  return `
    <section class="section">
      <div class="container">
        <div class="section-heading">
          <span class="eyebrow">Masalah</span>
          <h2>${escapeHtml(section.title)}</h2>
          <p>${escapeHtml(section.intro)}</p>
        </div>
        <div class="grid grid-3">
          ${renderList(section.painPoints, (item) => `
            <article class="card card-plain">
              <div class="card-kicker">Titik masalah</div>
              <p>${escapeHtml(item)}</p>
            </article>
          `)}
        </div>
      </div>
    </section>
  `;
}

function renderBenefits(section) {
  return `
    <section class="section section-soft">
      <div class="container">
        <div class="section-heading">
          <span class="eyebrow">Manfaat</span>
          <h2>${escapeHtml(section.title)}</h2>
        </div>
        <div class="grid grid-3">
          ${renderList(section.items, (item) => `
            <article class="card">
              <h3>${escapeHtml(item.title)}</h3>
              <p>${escapeHtml(item.description)}</p>
            </article>
          `)}
        </div>
      </div>
    </section>
  `;
}

function renderProof(section) {
  return `
    <section class="section">
      <div class="container">
        <div class="section-heading">
          <span class="eyebrow">Bukti</span>
          <h2>${escapeHtml(section.title)}</h2>
          <p>${escapeHtml(section.intro)}</p>
        </div>
        <div class="grid grid-3">
          ${renderList(section.testimonials, (item) => `
            <article class="card testimonial">
              <p class="quote">“${escapeHtml(item.quote)}”</p>
              <div class="person">
                <strong>${escapeHtml(item.name)}</strong>
                <span>${escapeHtml(item.role)}</span>
              </div>
            </article>
          `)}
        </div>
      </div>
    </section>
  `;
}

function renderOffer(section) {
  return `
    <section class="section section-offer">
      <div class="container offer-layout">
        <div class="offer-main">
          <span class="eyebrow">Penawaran</span>
          <h2>${escapeHtml(section.title)}</h2>
          <div class="price-label">${escapeHtml(section.priceLabel)}</div>
          <div class="price-value">${escapeHtml(section.priceValue)}</div>
          <p class="offer-guarantee">${escapeHtml(section.guarantee)}</p>
          <a class="btn btn-primary btn-wide" href="${escapeHtml(section.ctaHref)}">${escapeHtml(section.ctaText)}</a>
        </div>
        <div class="offer-aside">
          <div class="eyebrow">Yang didapat</div>
          <ul class="bullet-list">
            ${renderList(section.bonuses, (item) => `<li>${escapeHtml(item)}</li>`)}
          </ul>
        </div>
      </div>
    </section>
  `;
}

function renderFaq(section) {
  return `
    <section class="section">
      <div class="container">
        <div class="section-heading">
          <span class="eyebrow">FAQ</span>
          <h2>${escapeHtml(section.title)}</h2>
        </div>
        <div class="faq-list">
          ${renderList(section.items, (item) => `
            <details class="faq-item">
              <summary>${escapeHtml(item.question)}</summary>
              <p>${escapeHtml(item.answer)}</p>
            </details>
          `)}
        </div>
      </div>
    </section>
  `;
}

function renderCta(section) {
  return `
    <section class="section section-cta">
      <div class="container cta-box">
        <span class="eyebrow">Langkah berikutnya</span>
        <h2>${escapeHtml(section.title)}</h2>
        <p>${escapeHtml(section.text)}</p>
        <a class="btn btn-primary btn-wide" href="${escapeHtml(section.ctaHref)}">${escapeHtml(section.ctaText)}</a>
      </div>
    </section>
  `;
}

function renderFooter(section, page) {
  return `
    <footer class="footer">
      <div class="container footer-inner">
        <div>
          <strong>${escapeHtml(page.generatedAnalysis?.produk || "Landing Page")}</strong>
          <p>${escapeHtml(section.smallText)}</p>
        </div>
        <div class="footer-contact">${escapeHtml(section.contactLine)}</div>
      </div>
    </footer>
  `;
}

export function renderLandingPageHtml(pageInput) {
  const page = validateAndNormalizeLandingPage(pageInput, { brief: pageInput?.brief || {}, framework: pageInput?.framework });
  const config = getFrameworkConfig(page.framework);
  const theme = config.theme;
  const stylePreset = getLandingPageStylePreset(page.stylePreset);
  const sectionKey = normalizeStylePreset(page.stylePreset);
  const fontImports = {
    atelier: '@import url("https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Instrument+Sans:wght@400;500;600;700;800&display=swap");',
    signal: '@import url("https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@500;600;700;800&family=Manrope:wght@400;500;600;700;800&display=swap");',
    noir: '@import url("https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap");',
  };
  const sections = getOrderedSections(page).filter((section) => !section.hidden);

  const sectionHtml = sections.map((section) => {
    switch (section.type) {
      case "hero": return renderHero(section);
      case "problem": return renderProblem(section);
      case "benefits": return renderBenefits(section);
      case "proof": return renderProof(section);
      case "offer": return renderOffer(section);
      case "faq": return renderFaq(section);
      case "cta": return renderCta(section);
      case "footer": return renderFooter(section, page);
      default: return "";
    }
  }).join("");

  return `<!DOCTYPE html>
<html lang="id">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(page.seo.title)}</title>
    <meta name="description" content="${escapeHtml(page.seo.description)}" />
    <style>
      :root {
        --accent: ${theme.accent};
        --accent-2: ${theme.accent2};
        --accent-soft: ${theme.accentSoft};
        --bg: ${theme.bg};
        --surface: ${theme.surface};
        --ink: ${theme.ink};
        --muted: ${theme.muted};
        --hero-bg: ${theme.heroBg};
        --border: rgba(15, 23, 42, 0.08);
        --shadow: 0 24px 60px rgba(15, 23, 42, 0.08);
        --radius: ${stylePreset.radius};
        --display-font: ${stylePreset.displayFont};
        --body-font: ${stylePreset.bodyFont};
        --frame-surface: ${stylePreset.frame};
      }
      ${fontImports[sectionKey] || ""}
      * { box-sizing: border-box; }
      html { scroll-behavior: smooth; }
      body {
        margin: 0;
        font-family: var(--body-font);
        background: var(--bg);
        color: var(--ink);
        line-height: 1.6;
      }
      a { color: inherit; text-decoration: none; }
      .container {
        width: min(1120px, calc(100% - 32px));
        margin: 0 auto;
      }
      .hero {
        background: var(--hero-bg);
        background-image: ${stylePreset.heroPattern}, var(--hero-bg);
        color: #fff;
        padding: 88px 0 68px;
      }
      .hero-inner {
        display: grid;
        grid-template-columns: minmax(0, 1.1fr) minmax(280px, 0.9fr);
        gap: 24px;
        align-items: center;
      }
      .hero-badge,
      .eyebrow {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: 12px;
        font-weight: 800;
        letter-spacing: 0.14em;
        text-transform: uppercase;
      }
      .hero-badge {
        background: rgba(255,255,255,0.14);
        padding: 8px 14px;
        border-radius: 999px;
        margin-bottom: 18px;
      }
      h1, h2, h3, p { margin: 0; }
      h1 {
        font-family: var(--display-font);
        font-size: clamp(36px, 6vw, 60px);
        line-height: 1.05;
        letter-spacing: -0.04em;
        margin-bottom: 14px;
      }
      .hero-sub {
        font-size: 18px;
        color: rgba(255,255,255,0.86);
        max-width: 56ch;
      }
      .hero-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        margin-top: 24px;
      }
      .btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        min-height: 48px;
        padding: 0 20px;
        border-radius: 999px;
        font-weight: 800;
        transition: transform 0.15s ease, box-shadow 0.15s ease;
      }
      .btn:hover {
        transform: translateY(-1px);
      }
      .btn-primary {
        background: var(--accent);
        color: #fff;
        box-shadow: 0 14px 34px rgba(0, 0, 0, 0.15);
      }
      .btn-secondary {
        background: rgba(255,255,255,0.12);
        color: #fff;
        border: 1px solid rgba(255,255,255,0.18);
      }
      .btn-wide {
        width: 100%;
        max-width: 320px;
      }
      .hero-card,
      .card,
      .card-plain,
      .offer-aside,
      .cta-box,
      .faq-item {
        background: var(--frame-surface);
        border: 1px solid var(--border);
        border-radius: var(--radius);
        box-shadow: var(--shadow);
      }
      .hero-card {
        padding: 24px;
        color: var(--ink);
      }
      .bullet-list {
        padding-left: 20px;
        margin: 14px 0 0;
      }
      .bullet-list li + li {
        margin-top: 10px;
      }
      .section {
        padding: 72px 0;
      }
      .section-soft {
        background: linear-gradient(180deg, rgba(255,255,255,0) 0%, var(--accent-soft) 100%);
      }
      .section-offer {
        background: linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(15, 23, 42, 0.02) 100%);
      }
      .section-cta {
        padding-top: 24px;
        padding-bottom: 88px;
      }
      .section-heading {
        max-width: 68ch;
        margin-bottom: 24px;
      }
      .section-heading h2 {
        font-family: var(--display-font);
        font-size: clamp(28px, 5vw, 40px);
        line-height: 1.12;
        letter-spacing: -0.03em;
        margin: 10px 0 12px;
      }
      .section-heading p {
        color: var(--muted);
      }
      .grid {
        display: grid;
        gap: 16px;
      }
      .grid-3 {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }
      .card,
      .card-plain {
        padding: 22px;
      }
      .card h3 {
        font-size: 20px;
        margin-bottom: 10px;
        line-height: 1.2;
      }
      .card p,
      .card-plain p,
      .quote,
      .faq-item p,
      .offer-guarantee,
      .footer p {
        color: var(--muted);
      }
      .card-kicker,
      .price-label {
        font-size: 12px;
        font-weight: 800;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: var(--accent);
        margin-bottom: 10px;
      }
      .testimonial .quote {
        margin-bottom: 18px;
      }
      .person {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .person span {
        color: var(--muted);
        font-size: 14px;
      }
      .offer-layout {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(280px, 0.9fr);
        gap: 18px;
        align-items: stretch;
      }
      .offer-main,
      .offer-aside,
      .cta-box {
        padding: 28px;
      }
      .offer-main h2,
      .cta-box h2,
      .footer strong,
      .card h3 {
        font-family: var(--display-font);
      }
      .price-value {
        font-size: clamp(34px, 6vw, 52px);
        font-weight: 900;
        letter-spacing: -0.04em;
        line-height: 1;
        margin-bottom: 12px;
      }
      .offer-guarantee {
        margin-bottom: 20px;
      }
      .faq-list {
        display: grid;
        gap: 14px;
      }
      .faq-item {
        padding: 18px 20px;
      }
      .faq-item summary {
        cursor: pointer;
        font-weight: 800;
        list-style: none;
      }
      .faq-item summary::-webkit-details-marker {
        display: none;
      }
      .faq-item p {
        margin-top: 12px;
      }
      .cta-box {
        text-align: center;
        background: linear-gradient(135deg, var(--surface) 0%, var(--accent-soft) 100%);
      }
      .cta-box h2 {
        font-size: clamp(28px, 5vw, 42px);
        line-height: 1.12;
        letter-spacing: -0.03em;
        margin: 10px 0 12px;
      }
      .cta-box p {
        max-width: 56ch;
        margin: 0 auto 20px;
        color: var(--muted);
      }
      .footer {
        padding: 28px 0 40px;
      }
      .footer-inner {
        display: flex;
        justify-content: space-between;
        gap: 18px;
        align-items: center;
        border-top: 1px solid var(--border);
        padding-top: 22px;
      }
      .footer-contact {
        color: var(--muted);
        text-align: right;
      }
      @media (max-width: 860px) {
        .hero-inner,
        .offer-layout,
        .grid-3,
        .footer-inner {
          grid-template-columns: 1fr;
          display: grid;
        }
        .footer-contact {
          text-align: left;
        }
        .hero {
          padding-top: 72px;
        }
      }
    </style>
  </head>
  <body>
    ${sectionHtml}
  </body>
</html>`;
}
