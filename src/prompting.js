export function buildLanguageGuardrails(settings, slang) {
  const forbidden = settings.forbiddenWords ? `\n- Kata yang dilarang: ${settings.forbiddenWords}` : "";
  const required = settings.requiredWords ? `\n- Kata yang wajib muncul jika relevan: ${settings.requiredWords}` : "";
  const voice = settings.brandVoice ? `\n- Brand voice: ${settings.brandVoice}` : "";
  const custom = settings.customInstructions ? `\n- Instruksi tambahan: ${settings.customInstructions}` : "";

  return `ATURAN BAHASA WAJIB:
- Tulis dalam Bahasa Indonesia yang alami, enak dibaca, dan terasa ditulis oleh orang Indonesia, bukan oleh mesin.
- Jangan terdengar seperti hasil terjemahan literal dari bahasa Inggris. Susunan kalimat harus mengikuti ritme bahasa Indonesia.
- Hindari jargon kosong, bahasa presentasi agency, dan frasa generik seperti "maksimalkan potensi", "solusi inovatif", "revolusioner", "komprehensif", kecuali memang muncul di sumber.
- Pilih kata yang konkret, tajam, dan dekat dengan situasi pembeli. Lebih baik "capek bikin konten tapi sepi order" daripada kalimat abstrak.
- Utamakan kalimat yang jelas, spesifik, dan langsung ke manfaat nyata bagi pembeli.
- Gunakan level bahasa ${slang.label}. Contoh diksi yang boleh dipakai: ${slang.ex}
- Tulis untuk membantu user menjual, bukan untuk mengesankan marketer lain.${voice}${forbidden}${required}${custom}`;
}

export function buildUsefulnessGuardrails() {
  return `ATURAN KUALITAS:
- Pilih detail yang paling berguna untuk eksekusi iklan, bukan teori.
- Jika informasi tidak ada di sumber, tulis "tidak disebutkan" atau inferensi paling aman.
- Jangan menambah klaim bombastis yang tidak didukung data.
- Hasil harus terasa siap pakai, bukan seperti catatan brainstorming mentah.`;
}

export function buildConversionGuardrails() {
  return `ATURAN KETAMANAN COPY:
- Prioritaskan manfaat yang terasa di dunia nyata, bukan janji besar yang kabur.
- Kalau bisa pilih antara "terdengar keren" dan "mudah dipakai user", pilih yang kedua.
- Jangan menulis seperti brosur, presentasi startup, atau caption motivasi kosong.
- Setiap kalimat harus mendorong user ke langkah berikutnya: paham, tertarik, atau ingin bertindak.`;
}
