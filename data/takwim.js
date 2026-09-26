// Takwim Hal Ehwal Murid & UBK SK Tampasuk 1 2026 (Ogos - Oktober)
const TAKWIM_EVENTS = [
  // Ogos 2026
  { date: "2026-08-03", day: "ISNIN", month: "OGOS", title: "Program Kehadiran Terbaik", unit: "UBK / HEM", category: "program" },
  { date: "2026-08-07", day: "JUMAAT", month: "OGOS", title: "Pemantauan RMT dan Kantin", unit: "HEM", category: "pemantauan" },
  { date: "2026-08-13", day: "KHAMIS", month: "OGOS", title: "Mesyuarat Pengurusan Bil 3", unit: "HEM", category: "mesyuarat" },
  { date: "2026-08-17", day: "ISNIN", month: "OGOS", title: "Lapor Diri Hari Pertama Praktikum", unit: "UBK", category: "praktikum" },
  { date: "2026-08-18", day: "SELASA", month: "OGOS", title: "Latihan Kebakaran", unit: "Unit 3K", category: "program" },
  { date: "2026-08-19", day: "RABU", month: "OGOS", title: "Mesyuarat HEM Bil 3", unit: "HEM", category: "mesyuarat" },
  { date: "2026-08-20", day: "KHAMIS", month: "OGOS", title: "Spot Check Kekemasan Diri", unit: "Unit Disiplin", category: "spotcheck" },
  { date: "2026-08-24", day: "ISNIN", month: "OGOS", title: "Cuti Peristiwa & Cuti Umum Maulidur Rasul", unit: "SEKOLAH", category: "cuti" },
  { date: "2026-08-25", day: "SELASA", month: "OGOS", title: "Cuti Peristiwa & Cuti Umum Maulidur Rasul", unit: "SEKOLAH", category: "cuti" },
  { date: "2026-08-26", day: "RABU", month: "OGOS", title: "Pelaporan Analisis Kehadiran Kelas", unit: "S/U HEM", category: "pelaporan" },
  { date: "2026-08-27", day: "KHAMIS", month: "OGOS", title: "Pelaporan & Tuntutan RMT", unit: "Guru RMT", category: "pelaporan" },
  { date: "2026-08-29", day: "SABTU", month: "OGOS", title: "Cuti Penggal 2 Bermula", unit: "SEKOLAH", category: "cuti" },
  { date: "2026-08-30", day: "AHAD", month: "OGOS", title: "Cuti Penggal 2", unit: "SEKOLAH", category: "cuti" },
  { date: "2026-08-31", day: "ISNIN", month: "OGOS", title: "Cuti Hari Kebangsaan (Cuti Penggal 2)", unit: "SEKOLAH", category: "cuti" },

  // September 2026
  { date: "2026-09-01", day: "SELASA", month: "SEPTEMBER", title: "Cuti Penggal 2", unit: "SEKOLAH", category: "cuti" },
  { date: "2026-09-02", day: "RABU", month: "SEPTEMBER", title: "Cuti Penggal 2", unit: "SEKOLAH", category: "cuti" },
  { date: "2026-09-03", day: "KHAMIS", month: "SEPTEMBER", title: "Cuti Penggal 2", unit: "SEKOLAH", category: "cuti" },
  { date: "2026-09-04", day: "JUMAAT", month: "SEPTEMBER", title: "Cuti Penggal 2", unit: "SEKOLAH", category: "cuti" },
  { date: "2026-09-07", day: "ISNIN", month: "SEPTEMBER", title: "Program Kehadiran Terbaik & Intervensi Minda Sihat 1", unit: "UBK / HEM", category: "program" },
  { date: "2026-09-08", day: "SELASA", month: "SEPTEMBER", title: "Intervensi Minda Sihat UBK", unit: "UBK", category: "program" },
  { date: "2026-09-09", day: "RABU", month: "SEPTEMBER", title: "Program Kepimpinan Pemimpin Muda Sekolah", unit: "UBK / Disiplin", category: "program" },
  { date: "2026-09-10", day: "KHAMIS", month: "SEPTEMBER", title: "Intervensi Minda Sihat UBK", unit: "UBK", category: "program" },
  { date: "2026-09-11", day: "JUMAAT", month: "SEPTEMBER", title: "Intervensi Minda Sihat UBK & Senamrobik PIBG", unit: "UBK / PIBG", category: "program" },
  { date: "2026-09-14", day: "ISNIN", month: "SEPTEMBER", title: "Saringan Minda Sihat 2 Bermula", unit: "UBK", category: "saringan" },
  { date: "2026-09-15", day: "SELASA", month: "SEPTEMBER", title: "Saringan Minda Sihat 2", unit: "UBK", category: "saringan" },
  { date: "2026-09-16", day: "RABU", month: "SEPTEMBER", title: "Cuti Hari Malaysia", unit: "SEKOLAH", category: "cuti" },
  { date: "2026-09-22", day: "SELASA", month: "SEPTEMBER", title: "Program Ziarah Cakna Bil 3", unit: "HEM / Disiplin", category: "program" },
  { date: "2026-09-29", day: "SELASA", month: "SEPTEMBER", title: "Pelaporan Analisis Kehadiran Kelas", unit: "S/U HEM", category: "pelaporan" },
  { date: "2026-09-30", day: "RABU", month: "SEPTEMBER", title: "Pelaporan & Tuntutan RMT", unit: "Guru RMT", category: "pelaporan" },

  // Oktober 2026
  { date: "2026-10-05", day: "ISNIN", month: "OKTOBER", title: "Program Kehadiran Terbaik & Pemeriksaan Gigi", unit: "UBK / Kesihatan", category: "program" },
  { date: "2026-10-15", day: "KHAMIS", month: "OKTOBER", title: "Sambutan Hari Kanak-Kanak", unit: "HEM / UBK", category: "program" },
  { date: "2026-10-28", day: "RABU", month: "OKTOBER", title: "Pelaporan Analisis Kehadiran Kelas", unit: "S/U HEM", category: "pelaporan" },
  { date: "2026-10-29", day: "KHAMIS", month: "OKTOBER", title: "Pelaporan & Tuntutan RMT", unit: "Guru RMT", category: "pelaporan" },
  { date: "2026-10-30", day: "JUMAAT", month: "OKTOBER", title: "Penutupan Praktikum UBK", unit: "UBK", category: "praktikum" }
];
