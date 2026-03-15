import {
  LANDING_PAGE_TEMPLATE_KEY,
  buildAnalysisFromPage,
  createLandingPageBrief,
  validateAndNormalizeLandingPage,
} from "./landingPage.js";

const TEMPLATE_PLACEHOLDER_LINKS = {
  whatsapp: "#ganti-link-whatsapp",
  checkout: "#ganti-link-checkout",
};

function sanitizeTemplateHref(value) {
  const raw = String(value || "").trim();
  if (!raw) return raw;
  if (/wa\.me\/6281234567890/i.test(raw)) return TEMPLATE_PLACEHOLDER_LINKS.whatsapp;
  if (/checkout\.funnelpilot\.app/i.test(raw)) return TEMPLATE_PLACEHOLDER_LINKS.checkout;
  return raw;
}

function sanitizePlaceholderText(value) {
  const raw = String(value || "").trim();
  if (!raw) return raw;
  if (/^placeholder\s*:/i.test(raw)) {
    return `Contoh placeholder: ${raw.replace(/^placeholder\s*:/i, "").trim()}`;
  }
  return raw;
}

function sanitizeTemplateSections(sections = []) {
  return sections.map((section, index) => {
    const next = {
      ...section,
      primaryCtaHref: sanitizeTemplateHref(section.primaryCtaHref),
      secondaryCtaHref: sanitizeTemplateHref(section.secondaryCtaHref),
      ctaHref: sanitizeTemplateHref(section.ctaHref),
    };

    if (section.type === "proof") {
      next.intro = sanitizePlaceholderText(section.intro);
      next.testimonials = (section.testimonials || []).map((item, testimonialIndex) => ({
        ...item,
        name: `Contoh Testimoni ${testimonialIndex + 1}`,
        role: "Ganti dengan customer asli",
        quote: `Placeholder: ${String(item.quote || `Tambahkan bukti sosial untuk template ${index + 1}.`).trim()}`,
      }));
    }

    return next;
  });
}

function createTemplate(definition) {
  const brief = createLandingPageBrief({
    ...definition.brief,
    ctaWhatsapp: sanitizeTemplateHref(definition.brief?.ctaWhatsapp),
    ctaCheckout: sanitizeTemplateHref(definition.brief?.ctaCheckout),
    socialProof: sanitizePlaceholderText(definition.brief?.socialProof),
  });
  const sanitizedSections = sanitizeTemplateSections(definition.sections);
  const page = validateAndNormalizeLandingPage({
    pageType: "landing",
    framework: definition.framework,
    templateKey: LANDING_PAGE_TEMPLATE_KEY,
    stylePreset: definition.stylePreset,
    seo: definition.seo,
    sections: sanitizedSections,
  }, {
    brief,
    framework: definition.framework,
  });

  return {
    ...definition,
    brief,
    page: {
      ...page,
      generatedAnalysis: buildAnalysisFromPage(page, brief),
    },
  };
}

export const LANDING_PAGE_TEMPLATE_LIBRARY = [
  createTemplate({
    id: "coach-mentor",
    label: "Coach / Mentor",
    category: "Creator",
    framework: "StoryBrand",
    stylePreset: "atelier",
    summary: "Lead magnet sampai sesi mentoring berbayar.",
    artDirection: "Editorial, warm authority, terasa seperti personal coach premium.",
    seo: {
      title: "Template Funnel Coach Mentor",
      description: "Template landing page untuk coach, mentor, dan creator knowledge product.",
    },
    brief: {
      productName: "Blueprint Konsultan 30 Hari",
      targetMarket: "coach, mentor, dan konsultan solo yang ingin jual program tanpa terdengar memaksa",
      offer: "Program 30 hari + worksheet, audit messaging, dan sesi coaching mingguan.",
      price: "Rp 1.497.000",
      ctaWhatsapp: "https://wa.me/6281234567890",
      ctaCheckout: "https://checkout.funnelpilot.app/coach-blueprint",
      usp: "Framework ringan untuk jualan jasa tanpa perlu konten yang ramai tiap hari.",
      benefitMain: "Membantu mentor menjelaskan value offer dengan lebih yakin dan lebih cepat closing.",
      socialProof: "Placeholder: 270+ coach sudah pakai struktur ini untuk launching batch baru.",
      guarantee: "Garansi 7 hari uang kembali bila materi belum relevan untuk positioning bisnis kamu.",
      faq: "Cocok untuk pemula?\nApakah ada review copy?\nBerapa lama akses materi?\nBisa tanya lewat WhatsApp?",
      tone: "hangat, dewasa, menenangkan, tetap tegas di bagian CTA",
    },
    sections: [
      { type: "hero", badge: "Mentor sales system", headline: "Jual program mentoring tanpa terdengar maksa.", subheadline: "Template ini bantu coach dan mentor menjelaskan value dengan bahasa yang lebih tenang, rapi, dan tetap convert.", primaryCtaText: "Diskusi via WhatsApp", primaryCtaHref: "https://wa.me/6281234567890", secondaryCtaText: "Lihat Paket Program", secondaryCtaHref: "https://checkout.funnelpilot.app/coach-blueprint", highlightBullets: ["Posisikan audiens sebagai hero, bukan jadi objek pitch.", "Tunjukkan langkah yang sederhana sebelum offer dijelaskan.", "Tutupi keberatan utama tanpa copy yang terasa agresif."] },
      { type: "problem", title: "Masalah yang bikin mentor sulit closing", intro: "Banyak coach punya materi bagus, tapi landing page-nya masih terasa kabur atau terlalu panjang.", painPoints: ["Calon client paham topikmu, tapi belum paham kenapa harus daftar sekarang.", "Kamu capek bikin konten tiap hari, tapi CTA-nya tetap dingin.", "Offer terdengar generik karena pembeda belum diucapkan dengan jelas."] },
      { type: "benefits", title: "Yang berubah setelah struktur offer rapi", items: [{ title: "Pesan lebih terfokus", description: "Hero dan problem langsung bicara ke situasi client idealmu." }, { title: "Closing terasa lebih ringan", description: "CTA diarahkan ke percakapan, bukan hard sell dari kalimat pertama." }, { title: "Program terlihat lebih premium", description: "Value stack dan risk reversal disusun supaya harga terasa masuk akal." }] },
      { type: "cta", title: "Mulai dari percakapan yang lebih tenang", text: "Kalau kamu ingin menjual program tanpa merasa sedang memaksa orang, template ini memberi struktur yang jauh lebih dewasa.", ctaText: "Buka WhatsApp", ctaHref: "https://wa.me/6281234567890" },
      { type: "proof", title: "Bukti sosial untuk launching batch baru", intro: "Template ini sudah menyiapkan ruang untuk testimoni, hasil murid, dan bukti sosial yang nanti bisa kamu ganti.", testimonials: [{ name: "Alya", role: "Business Coach", quote: "Begitu headline dan CTA dirapikan, inquiry yang masuk jauh lebih relevan." }, { name: "Dimas", role: "Career Mentor", quote: "Landing page saya jadi terasa lebih jelas. Orang ngerti siapa yang cocok join." }, { name: "Nita", role: "Brand Strategist", quote: "Saya nggak perlu menjelaskan offer berulang-ulang lewat chat karena halaman sudah menjawab banyak hal." }] },
      { type: "offer", title: "Isi funnel coach yang paling sering dipakai", priceLabel: "Investasi", priceValue: "Rp 1.497.000", guarantee: "Garansi 7 hari dan ruang tanya jawab sebelum checkout.", bonuses: ["Template headline untuk 3 angle positioning.", "Worksheet audit offer dan bonus.", "Script follow-up WhatsApp setelah calon client klik CTA."], ctaText: "Lanjut ke Checkout", ctaHref: "https://checkout.funnelpilot.app/coach-blueprint" },
      { type: "faq", title: "FAQ yang paling sering muncul", items: [{ question: "Apakah cocok untuk mentor pemula?", answer: "Cocok, terutama kalau offer kamu sudah ada tapi cara menjelaskannya masih terasa mentah." }, { question: "Template ini bisa dipakai untuk webinar?", answer: "Bisa. Kamu tinggal menyesuaikan CTA dan bagian offer agar mengarah ke registrasi webinar." }, { question: "Apakah bisa diubah total?", answer: "Bisa. Semua section bisa kamu edit, ubah urutan, duplikasi, atau sembunyikan." }] },
      { type: "footer", smallText: "Template ini dirancang untuk coach dan mentor yang ingin menjual dengan bahasa yang lebih dewasa.", contactLine: "Perlu tanya dulu? Arahkan calon client ke WhatsApp sebelum checkout." },
    ],
  }),
  createTemplate({
    id: "jasa-profesional",
    label: "Jasa Profesional",
    category: "Jasa",
    framework: "AIDA",
    stylePreset: "signal",
    summary: "Portfolio LP dengan alur konsultasi dan proposal.",
    artDirection: "Crisp studio, tajam, profesional, cocok untuk agency dan consultant.",
    seo: {
      title: "Template Landing Page Jasa Profesional",
      description: "Template landing page untuk consultant, agency, dan jasa profesional.",
    },
    brief: {
      productName: "Audit Funnel & Iklan 14 Hari",
      targetMarket: "brand owner dan tim marketing yang butuh audit cepat sebelum scaling ads",
      offer: "Audit funnel, creative feedback, dan action plan prioritas tinggi selama 14 hari.",
      price: "Mulai Rp 3.500.000",
      ctaWhatsapp: "https://wa.me/6281234567890",
      ctaCheckout: "https://checkout.funnelpilot.app/audit-funnel",
      usp: "Cepat, spesifik, dan fokus ke bottleneck dengan impact tertinggi.",
      benefitMain: "Client langsung tahu kebocoran funnel dan urutan perbaikannya.",
      socialProof: "Placeholder: 90+ audit funnel untuk creator, jasa, dan info product brand.",
      guarantee: "Jika action plan terlalu generik, kami revisi tanpa biaya tambahan.",
      faq: "Berapa lama audit berjalan?\nApakah termasuk review ads?\nBisa untuk tim in-house?\nApakah ada call kickoff?",
      tone: "tajam, profesional, tidak terlalu ramai, meyakinkan",
    },
    sections: [
      { type: "hero", badge: "Performance audit", headline: "Temukan bottleneck funnel sebelum budget iklan kamu habis lagi.", subheadline: "Template ini cocok untuk jasa audit, konsultasi, dan agency yang ingin terlihat cepat, rapi, dan high-trust.", primaryCtaText: "Jadwalkan Konsultasi", primaryCtaHref: "https://wa.me/6281234567890", secondaryCtaText: "Lihat Scope Audit", secondaryCtaHref: "https://checkout.funnelpilot.app/audit-funnel", highlightBullets: ["Struktur AIDA yang cepat menjelaskan problem dan solusi.", "Bagian proof diposisikan dekat offer agar trust naik sebelum CTA.", "Cocok untuk jasa audit, agency, hingga consultant niche."] },
      { type: "benefits", title: "Apa yang client dapat", items: [{ title: "Scope audit terlihat jelas", description: "Section offer menjabarkan deliverable sehingga inquiry lebih berkualitas." }, { title: "CTA langsung ke call atau WhatsApp", description: "Memudahkan calon client masuk ke next step tanpa friction berlebihan." }, { title: "Cocok untuk high-ticket service", description: "Tone, hierarchy, dan layout menjaga halaman tetap terasa profesional." }] },
      { type: "problem", title: "Sinyal bahwa funnel perlu diaudit", intro: "Template ini secara default menyorot titik sakit yang paling umum di bisnis jasa dan campaign performance.", painPoints: ["Lead masuk, tapi banyak yang tidak qualified.", "Ads sudah jalan, tapi landing page tidak mendukung keputusan beli.", "Tim belum tahu prioritas perubahan mana yang paling cepat berdampak."] },
      { type: "proof", title: "Ruang untuk menaruh hasil audit dan case study", intro: "Gunakan placeholder ini untuk before-after, ringkasan hasil, atau kutipan client.", testimonials: [{ name: "Rian", role: "Founder course brand", quote: "Setelah audit, kami tahu bagian funnel mana yang harus dipotong dulu. Sangat membantu." }, { name: "Mila", role: "Head of Marketing", quote: "Halaman konsultasi kami jadi jauh lebih rapi dan respon call meningkat." }, { name: "Dio", role: "Agency Owner", quote: "Template ini enak dipakai untuk menjual jasa tanpa terasa terlalu ramai." }] },
      { type: "offer", title: "Audit 14 hari yang fokus ke hal paling mahal untuk diabaikan", priceLabel: "Mulai dari", priceValue: "Rp 3.500.000", guarantee: "Jika rekomendasi belum cukup actionable, kami revisi dengan scope yang lebih spesifik.", bonuses: ["Kickoff call untuk align objective.", "Audit funnel + creative + CTA.", "Action plan prioritas tinggi yang siap dikerjakan tim."], ctaText: "Ajukan Audit", ctaHref: "https://checkout.funnelpilot.app/audit-funnel" },
      { type: "faq", title: "Pertanyaan sebelum booking", items: [{ question: "Apakah harus sudah running ads?", answer: "Tidak wajib, tapi paling ideal kalau sudah punya traffic atau funnel yang sedang berjalan." }, { question: "Berapa lama hasil audit keluar?", answer: "Biasanya 5-14 hari kerja, tergantung scope dan data yang diberikan." }, { question: "Apakah bisa untuk tim internal?", answer: "Bisa. Template ini juga cocok untuk consultant yang menjual ke perusahaan dan tim in-house." }] },
      { type: "cta", title: "Kalau traffic sudah jalan, jangan tunggu sampai budget habis dulu.", text: "Arahkan CTA ke konsultasi cepat agar calon client bisa masuk ke call atau WhatsApp tanpa kebingungan.", ctaText: "Diskusi Scope Audit", ctaHref: "https://wa.me/6281234567890" },
      { type: "footer", smallText: "Template ini disusun untuk menjual jasa dengan struktur yang lebih rapi dan mudah dipercaya.", contactLine: "Masih ada pertanyaan? Gunakan CTA WhatsApp untuk membuka percakapan awal." },
    ],
  }),
  createTemplate({
    id: "produk-digital",
    label: "Produk Digital",
    category: "Produk digital",
    framework: "Hormozi",
    stylePreset: "atelier",
    summary: "Sales page straight-to-checkout untuk ebook, kelas, atau bundle.",
    artDirection: "Bold premium, value-stack heavy, tetap hangat untuk creator economy.",
    seo: {
      title: "Template Produk Digital",
      description: "Template sales page siap pakai untuk info product dan digital product.",
    },
    brief: {
      productName: "Bundle Script Iklan 50 Hari",
      targetMarket: "owner UMKM, freelancer, dan tim marketing kecil yang butuh bahan nulis iklan lebih cepat",
      offer: "50 script iklan, template hook, dan angle board siap pakai.",
      price: "Rp 297.000",
      ctaWhatsapp: "https://wa.me/6281234567890",
      ctaCheckout: "https://checkout.funnelpilot.app/script-iklan",
      usp: "Siap pakai, cepat diadaptasi, dan dibuat untuk market Indonesia.",
      benefitMain: "Bikin proses nulis iklan jauh lebih cepat tanpa blank page syndrome.",
      socialProof: "Placeholder: 1.200+ marketer dan owner UMKM sudah download bundle ini.",
      guarantee: "Garansi 7 hari jika file tidak bisa diakses atau struktur tidak sesuai deskripsi.",
      faq: "Apakah file langsung dikirim?\nBisa dipakai untuk semua niche?\nAda update gratis?\nApakah cocok untuk pemula?",
      tone: "to the point, energik, tapi tidak norak",
    },
    sections: [
      { type: "hero", badge: "Digital product template", headline: "Jual produk digital dengan value stack yang langsung kebaca.", subheadline: "Template ini dibuat untuk sales page straight-to-checkout, cocok untuk ebook, kelas mini, bundle script, dan tool digital.", primaryCtaText: "Tanya via WhatsApp", primaryCtaHref: "https://wa.me/6281234567890", secondaryCtaText: "Checkout Sekarang", secondaryCtaHref: "https://checkout.funnelpilot.app/script-iklan", highlightBullets: ["Headline dan offer sudah menonjolkan hasil, bukan cuma file yang dijual.", "Section bonus dibuat untuk memperbesar perceived value.", "CTA checkout disiapkan dekat value stack agar momentum tidak turun."] },
      { type: "problem", title: "Hambatan beli yang sering muncul di info product", intro: "Template ini menyiapkan problem statement yang biasanya menghambat pembelian produk digital.", painPoints: ["Calon buyer belum melihat hasil yang akan mereka dapat.", "Produk digital terlihat seperti kumpulan file biasa, bukan solusi yang terstruktur.", "Harga terasa mahal kalau value stack belum dibuka dengan jelas."] },
      { type: "benefits", title: "Value yang ingin langsung terasa", items: [{ title: "Lebih cepat eksekusi", description: "Produk terasa praktis dan bisa langsung dipakai, bukan sekadar teori." }, { title: "Perceived value naik", description: "Bonus, guarantee, dan CTA disusun supaya harga terasa lebih masuk akal." }, { title: "Cocok untuk direct response", description: "Bagian offer dan proof diposisikan untuk mempercepat keputusan beli." }] },
      { type: "proof", title: "Bukti sosial untuk peluncuran produk digital", intro: "Gunakan bagian ini untuk testimoni buyer, angka penjualan, atau review dari creator lain.", testimonials: [{ name: "Arum", role: "Owner UMKM", quote: "Saya jadi nggak blank lagi tiap mau bikin ads baru." }, { name: "Yoga", role: "Freelance copywriter", quote: "Template ini bikin proses brainstorming jauh lebih cepat." }, { name: "Karin", role: "Course creator", quote: "Offer saya jadi terlihat lebih rapi ketika value stack-nya jelas." }] },
      { type: "offer", title: "Semua yang buyer dapat dalam satu checkout", priceLabel: "Harga peluncuran", priceValue: "Rp 297.000", guarantee: "Garansi 7 hari untuk akses file dan deskripsi produk yang sesuai.", bonuses: ["50 script siap adaptasi.", "Hook bank untuk beberapa awareness level.", "Template angle board untuk campaign berikutnya."], ctaText: "Ambil Bundle Ini", ctaHref: "https://checkout.funnelpilot.app/script-iklan" },
      { type: "faq", title: "FAQ produk digital", items: [{ question: "Apakah file langsung dikirim?", answer: "Ya, buyer langsung diarahkan ke halaman/akses file setelah pembayaran selesai." }, { question: "Bisa dipakai untuk niche apa saja?", answer: "Bisa. Tinggal sesuaikan angle dan istilah produk dengan marketmu." }, { question: "Apakah cocok untuk pemula?", answer: "Cocok, justru template ini membantu pemula yang belum punya struktur copy yang rapi." }] },
      { type: "cta", title: "Kalau value-nya sudah cocok, jangan biarkan momentum turun.", text: "Gunakan CTA yang singkat, tegas, dan dekat dengan harga agar buyer bisa langsung bergerak ke checkout.", ctaText: "Checkout Sekarang", ctaHref: "https://checkout.funnelpilot.app/script-iklan" },
      { type: "footer", smallText: "Template ini cocok untuk creator dan info product seller yang ingin landing page lebih cepat jadi.", contactLine: "Masih ragu? Arahkan buyer ke WhatsApp atau FAQ sebelum checkout." },
    ],
  }),
  createTemplate({
    id: "event-workshop",
    label: "Event / Workshop",
    category: "Event",
    framework: "PAS",
    stylePreset: "signal",
    summary: "Landing page countdown untuk registrasi workshop dan webinar.",
    artDirection: "Urgent but clean, fokus ke momentum pendaftaran.",
    seo: {
      title: "Template Event Workshop",
      description: "Template untuk landing page webinar, workshop, dan event countdown.",
    },
    brief: {
      productName: "Workshop Closing via WhatsApp",
      targetMarket: "owner bisnis kecil dan social seller yang mau closing lebih rapi lewat chat",
      offer: "Workshop live 2 jam + workbook + replay 7 hari.",
      price: "Rp 149.000",
      ctaWhatsapp: "https://wa.me/6281234567890",
      ctaCheckout: "https://checkout.funnelpilot.app/workshop-wa",
      usp: "Praktis, live, dan fokus ke script yang langsung bisa dipakai.",
      benefitMain: "Peserta pulang dengan flow follow-up yang lebih jelas dan lebih siap dipraktikkan.",
      socialProof: "Placeholder: 800+ peserta di batch workshop sebelumnya.",
      guarantee: "Kalau jadwal berubah, replay tetap dikirim ke semua peserta.",
      faq: "Workshop live atau rekaman?\nAda replay?\nCocok untuk admin CS?\nBisa tanya saat sesi?",
      tone: "ringkas, energik, jelas",
    },
    sections: [
      { type: "hero", badge: "Workshop registration", headline: "Bangun landing page event yang terasa mendesak tanpa terlihat panik.", subheadline: "Template ini cocok untuk webinar, workshop, dan class launch dengan CTA registrasi yang jelas.", primaryCtaText: "Daftar via WhatsApp", primaryCtaHref: "https://wa.me/6281234567890", secondaryCtaText: "Amankan Seat", secondaryCtaHref: "https://checkout.funnelpilot.app/workshop-wa", highlightBullets: ["Problem dan agitation dibuat singkat agar cepat masuk ke solusi.", "Offer cocok untuk early bird, countdown, dan bonus terbatas.", "CTA bisa diarahkan ke WhatsApp atau checkout event."] },
      { type: "problem", title: "Kenapa registrasi event sering seret", intro: "Banyak workshop bagus tidak punya halaman yang cukup jelas untuk menjelaskan urgency dan hasil yang akan dibawa pulang peserta.", painPoints: ["Calon peserta belum yakin acara ini worth waktu mereka.", "Info tanggal, hasil, dan bonus tersebar, jadi orang tidak langsung paham offer.", "CTA terlalu lemah sehingga momentum pendaftaran hilang."] },
      { type: "offer", title: "Penawaran event yang terasa jelas sejak pertama scroll", priceLabel: "Harga kursi", priceValue: "Rp 149.000", guarantee: "Jika jadwal bergeser, replay tetap dikirim ke semua peserta yang sudah daftar.", bonuses: ["Live training 2 jam.", "Workbook siap isi.", "Replay 7 hari untuk peserta."], ctaText: "Daftar Sekarang", ctaHref: "https://checkout.funnelpilot.app/workshop-wa" },
      { type: "benefits", title: "Kenapa template ini cocok untuk event", items: [{ title: "Urgency lebih rapi", description: "CTA dan offer bisa diarahkan ke early bird, seat limit, atau bonus batch awal." }, { title: "Hasil workshop lebih kebaca", description: "Benefit disusun supaya calon peserta tahu apa yang akan mereka bawa pulang." }, { title: "Bisa cepat dikustom", description: "Tanggal, host, bonus, dan proof tinggal diubah tanpa menyusun ulang halaman." }] },
      { type: "proof", title: "Tempat untuk recap batch sebelumnya", intro: "Masukkan testimoni peserta, jumlah registrasi, atau hasil workshop sebelumnya agar momentum registrasi naik.", testimonials: [{ name: "Riska", role: "Social seller", quote: "Saya jadi paham alur follow-up yang nggak bikin chat terasa kaku." }, { name: "Bimo", role: "Owner F&B", quote: "Workshop-nya padat dan langsung bisa dipakai untuk closing harian." }, { name: "Nadia", role: "Admin sales", quote: "Replay dan workbook-nya membantu banget buat praktek setelah sesi." }] },
      { type: "faq", title: "Pertanyaan peserta sebelum daftar", items: [{ question: "Apakah workshop live?", answer: "Ya, live. Tapi replay tetap tersedia untuk waktu tertentu." }, { question: "Bisa tanya saat sesi?", answer: "Bisa. Sisihkan waktu Q&A di akhir agar terasa lebih personal." }, { question: "Cocok untuk tim admin?", answer: "Cocok, terutama bila mereka yang pegang closing via WhatsApp." }] },
      { type: "cta", title: "Kalau topiknya relevan, amankan seat sebelum batch ini penuh.", text: "Gunakan CTA yang terasa mendesak, tapi tetap jelas ke mana peserta diarahkan setelah klik.", ctaText: "Amankan Seat Sekarang", ctaHref: "https://checkout.funnelpilot.app/workshop-wa" },
      { type: "footer", smallText: "Template ini dibuat untuk workshop dan webinar yang butuh momentum pendaftaran cepat.", contactLine: "Jika peserta masih ragu, arahkan ke WhatsApp untuk pertanyaan singkat." },
    ],
  }),
  createTemplate({
    id: "umkm-fisik",
    label: "UMKM Fisik",
    category: "Produk fisik",
    framework: "AIDA",
    stylePreset: "noir",
    summary: "Product landing page ringan untuk order manual via WhatsApp.",
    artDirection: "Warm catalog, terasa akrab dan cocok untuk bisnis lokal.",
    seo: {
      title: "Template UMKM Fisik",
      description: "Template landing page untuk produk fisik ringan dan order via WhatsApp.",
    },
    brief: {
      productName: "Paket Frozen Food Hemat",
      targetMarket: "ibu bekerja dan keluarga muda yang ingin stok menu praktis di rumah",
      offer: "Paket frozen food isi 12 menu + bonus sambal + free ongkir area tertentu.",
      price: "Rp 189.000",
      ctaWhatsapp: "https://wa.me/6281234567890",
      ctaCheckout: "https://checkout.funnelpilot.app/frozen-food",
      usp: "Rasa rumahan, stok hemat, dan praktis disajikan.",
      benefitMain: "Membantu calon pembeli langsung paham isi paket dan cara ordernya.",
      socialProof: "Placeholder: 1.500+ paket terkirim ke area Jabodetabek.",
      guarantee: "Jika ada item rusak saat sampai, langsung diganti pada order berikutnya.",
      faq: "Isi paket apa saja?\nPengiriman ke mana?\nTahan berapa lama?\nCara ordernya bagaimana?",
      tone: "ramah, praktis, tidak terlalu formal",
    },
    sections: [
      { type: "hero", badge: "UMKM order page", headline: "Jual produk fisik simpel dengan halaman yang langsung mengarah ke order.", subheadline: "Template ini cocok untuk paket produk, hampers, frozen food, skincare lokal, dan order yang mayoritas masih lewat WhatsApp.", primaryCtaText: "Order via WhatsApp", primaryCtaHref: "https://wa.me/6281234567890", secondaryCtaText: "Lihat Detail Paket", secondaryCtaHref: "https://checkout.funnelpilot.app/frozen-food", highlightBullets: ["Bagian hero dan offer menonjolkan isi paket secara cepat.", "Cocok untuk bisnis lokal yang masih mengandalkan order manual.", "CTA dibuat sederhana agar calon buyer tidak bingung."] },
      { type: "benefits", title: "Kenapa template ini cocok untuk UMKM fisik", items: [{ title: "Isi paket mudah dipahami", description: "Calon buyer langsung tahu apa yang mereka dapat dan berapa harganya." }, { title: "Flow order lebih ringan", description: "CTA diarahkan ke WhatsApp untuk mempercepat order manual." }, { title: "Bisa dipakai ulang untuk promo baru", description: "Tinggal ganti foto, paket, atau bonus tanpa menyusun ulang halaman dari nol." }] },
      { type: "problem", title: "Masalah umum saat jualan produk fisik", intro: "Sering kali calon buyer tertarik, tapi batal karena informasi produk dan order tidak cukup jelas.", painPoints: ["Detail paket tersebar di chat dan story, tidak terkumpul dalam satu halaman.", "Harga terlihat biasa saja karena bonus dan pembeda tidak ditulis rapi.", "Calon pembeli bingung harus chat apa atau order lewat mana."] },
      { type: "proof", title: "Bukti sosial untuk review dan repeat order", intro: "Masukkan testimoni pembeli, repeat order, atau bukti pengiriman agar trust naik.", testimonials: [{ name: "Dina", role: "Ibu bekerja", quote: "Praktis banget untuk stok seminggu. Rasanya juga enak." }, { name: "Farah", role: "Langganan bulanan", quote: "Bagian order jadi lebih gampang karena saya tinggal klik WhatsApp." }, { name: "Wulan", role: "Keluarga muda", quote: "Informasi paketnya jelas, jadi nggak perlu tanya hal basic lagi." }] },
      { type: "offer", title: "Paket yang mudah dipilih dan mudah dipesan", priceLabel: "Harga paket", priceValue: "Rp 189.000", guarantee: "Jika ada item rusak saat sampai, kami ganti pada order berikutnya.", bonuses: ["12 menu frozen food.", "Bonus sambal.", "Free ongkir area tertentu."], ctaText: "Pesan Paket Ini", ctaHref: "https://checkout.funnelpilot.app/frozen-food" },
      { type: "faq", title: "Pertanyaan buyer sebelum order", items: [{ question: "Isi paket apa saja?", answer: "Gunakan FAQ ini untuk menuliskan item produk secara singkat dan jelas." }, { question: "Pengiriman ke mana saja?", answer: "Tulis cakupan area kirim dan opsi kurir yang tersedia." }, { question: "Order lewat mana?", answer: "Arahkan buyer ke WhatsApp untuk order manual atau checkout sederhana." }] },
      { type: "cta", title: "Kalau paketnya cocok, arahkan buyer langsung ke chat order.", text: "Untuk bisnis lokal, CTA yang paling kuat biasanya yang membuat buyer tinggal klik dan chat.", ctaText: "Chat untuk Order", ctaHref: "https://wa.me/6281234567890" },
      { type: "footer", smallText: "Template ini cocok untuk UMKM fisik yang ingin halaman promo lebih rapi tanpa sistem yang rumit.", contactLine: "Masih ragu? Gunakan WhatsApp sebagai jalur order dan pertanyaan cepat." },
    ],
  }),
  createTemplate({
    id: "saas-startup",
    label: "SaaS / Startup",
    category: "SaaS",
    framework: "BAB",
    stylePreset: "signal",
    summary: "Waitlist atau beta invite page untuk produk software.",
    artDirection: "Sharper, cleaner, product-led, tetap terasa ringan.",
    seo: {
      title: "Template SaaS Startup",
      description: "Template landing page untuk waitlist, beta launch, dan SaaS positioning.",
    },
    brief: {
      productName: "FunnelPilot Beta",
      targetMarket: "creator, coach, dan digital marketer yang ingin funnel cepat jadi tanpa tim teknis",
      offer: "Akses beta + setup funnel starter + onboarding call.",
      price: "Daftar tunggu gratis",
      ctaWhatsapp: "https://wa.me/6281234567890",
      ctaCheckout: "https://checkout.funnelpilot.app/funnelpilot-beta",
      usp: "AI membantu membangun funnel, bukan sekadar memberi template kosong.",
      benefitMain: "User mengerti transformasi dari proses manual ke funnel yang lebih cepat live.",
      socialProof: "Placeholder: 180+ founder dan marketer sudah masuk daftar tunggu beta.",
      guarantee: "Priority onboarding untuk batch beta awal.",
      faq: "Apakah ini builder biasa?\nKapan beta dibuka?\nApakah ada onboarding?\nBisa untuk agency?",
      tone: "jelas, percaya diri, modern, tidak berlebihan",
    },
    sections: [
      { type: "hero", badge: "Daftar tunggu beta", headline: "Tunjukkan transformasi produk SaaS kamu tanpa copy yang terasa generik.", subheadline: "Template ini dibuat untuk daftar tunggu, private beta, dan landing page startup yang ingin cepat menjelaskan before-after-bridge.", primaryCtaText: "Masuk Daftar Tunggu", primaryCtaHref: "https://wa.me/6281234567890", secondaryCtaText: "Lihat Cakupan Beta", secondaryCtaHref: "https://checkout.funnelpilot.app/funnelpilot-beta", highlightBullets: ["Kontraskan proses manual vs hasil setelah produk dipakai.", "Bagian jembatan diarahkan ke onboarding atau undangan beta.", "Cocok untuk SaaS, AI tool, dan halaman produk startup."] },
      { type: "problem", title: "Before: workflow yang masih manual dan lambat", intro: "Template ini menyiapkan ruang untuk mengangkat rasa friksi sebelum produkmu hadir.", painPoints: ["Masih pindah-pindah tool untuk bikin funnel dasar.", "Tim kecil kehabisan waktu hanya untuk setup, bukan optimasi.", "Launch tertahan karena tidak ada sistem yang menyatukan copy, page, dan follow-up."] },
      { type: "benefits", title: "Sesudahnya: sistem yang terasa lebih cepat jalan", items: [{ title: "Dari brief ke halaman lebih cepat", description: "Visitor langsung paham janji utama dan langkah berikutnya yang ingin kamu tawarkan." }, { title: "Onboarding lebih ringan", description: "CTA diarahkan ke daftar tunggu, demo, atau undangan beta tanpa friction yang berlebihan." }, { title: "Positioning produk lebih jelas", description: "Before-after-bridge membantu user memahami transformasi, bukan sekadar fitur." }] },
      { type: "proof", title: "Bukti awal untuk early adopters", intro: "Gunakan bagian ini untuk jumlah daftar tunggu, kutipan founder, atau feedback beta awal.", testimonials: [{ name: "Hadi", role: "Solo founder", quote: "Halaman beta saya jadi lebih jelas menjelaskan kenapa product ini layak ditunggu." }, { name: "Sinta", role: "Growth lead", quote: "Bridge section-nya membantu menjelaskan cara kerja produk tanpa terlalu teknis." }, { name: "Raka", role: "Agency operator", quote: "Template ini enak untuk pre-launch page karena clean dan langsung ke inti." }] },
      { type: "offer", title: "Jembatan masuk ke ekosistem produkmu", priceLabel: "Status", priceValue: "Daftar tunggu gratis", guarantee: "Batch awal mendapat onboarding prioritas dan akses update beta lebih cepat.", bonuses: ["Akses beta terbatas.", "Onboarding starter funnel.", "Update produk prioritas untuk daftar tunggu awal."], ctaText: "Gabung Daftar Tunggu", ctaHref: "https://checkout.funnelpilot.app/funnelpilot-beta" },
      { type: "cta", title: "Kalau problem-nya familiar, ajak mereka masuk lebih dulu.", text: "Untuk SaaS, CTA yang bagus tidak selalu harus langsung jualan. Waitlist dan demo juga bisa jadi langkah yang tepat.", ctaText: "Minta Invite", ctaHref: "https://wa.me/6281234567890" },
      { type: "faq", title: "FAQ seputar beta", items: [{ question: "Apakah ini builder biasa?", answer: "Gunakan jawaban ini untuk menjelaskan diferensiasi produk dibanding tool lain." }, { question: "Kapan beta dibuka?", answer: "Tulis timeline atau batch plan dengan singkat dan jujur." }, { question: "Apakah cocok untuk agency?", answer: "Bisa, terutama jika use case agency memang bagian dari positioning produkmu." }] },
      { type: "footer", smallText: "Template ini cocok untuk startup dan SaaS yang sedang menyiapkan daftar tunggu atau beta launch.", contactLine: "Jika user butuh info lebih lanjut, arahkan ke WhatsApp atau permintaan demo." },
    ],
  }),
];

export function getLandingPageTemplateById(templateId) {
  return LANDING_PAGE_TEMPLATE_LIBRARY.find((template) => template.id === templateId) || null;
}

export function instantiateLandingPageTemplate(templateId) {
  const template = getLandingPageTemplateById(templateId);
  if (!template) return null;
  const brief = createLandingPageBrief(template.brief);
  const page = validateAndNormalizeLandingPage({
    ...template.page,
    sections: template.page.sections.map((section) => ({ ...section })),
  }, {
    brief,
    framework: template.framework,
  });

  return {
    ...template,
    brief,
    page: {
      ...page,
      generatedAnalysis: buildAnalysisFromPage(page, brief),
    },
  };
}
