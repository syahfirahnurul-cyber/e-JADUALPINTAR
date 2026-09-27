// Data Pengurusan Rekod Klien & Template Surat Pelepasan UBK SK Tampasuk 1
// Disimpan & Dipulihkan untuk Cikgu Nurul Syahfirah binti Arjaman

const CLIENT_RECORDS = [
  { id: "K001", name: "AFFAN MIKAEAL BIN MOHD. HAMIZAN", className: "4 ARIF", category: "Akademik / Disiplin", sessionsCount: 1, status: "Aktif" },
  { id: "K002", name: "EADEN PRESTON BRYAN RAY RICHIE", className: "4 ARIF", category: "Disiplin", sessionsCount: 1, status: "Aktif" },
  { id: "K003", name: "KELOMPOK 1 (KENALI EMOSI)", className: "5 ARIF", category: "Psikososial & Emosi", sessionsCount: 2, status: "Aktif" },
  { id: "K004", name: "5 BESTARI (KENALI DIRI)", className: "5 BESTARI", category: "Sahsiah & Disiplin", sessionsCount: 1, status: "Aktif" }
];

const RECOVERED_CLIENT_PROFILES = [
  {
    id: "client_1790455381837",
    name: "5 BESTARI (KENALI DIRI)",
    type: "kelompok",
    targetClass: "5 BESTARI",
    focus: "sahsiah",
    sessionTag: "Sesi 1",
    lastSessionTag: "Sesi 1",
    sessionCount: 1,
    students: [
      { id: 332, idMurid: "221201040737", name: "AHMAD SHAMSURI PELAN BIN ABDULLAH", ic: "150703120775", classCode: "5B", className: "5 BESTARI", gender: "L", kaumAsal: "BAJAU", agama: "ISLAM" },
      { id: 333, idMurid: "221201090300", name: "AIN FATINI BINTI BAYU SANTOSO", ic: "150926120596", classCode: "5B", className: "5 BESTARI", gender: "P", kaumAsal: "KADAZANDUSUN", agama: "ISLAM" },
      { id: 334, idMurid: "221201051512", name: "MEER MIRZA BIN MOHD AZREY", ic: "150515121281", classCode: "5B", className: "5 BESTARI", gender: "L", kaumAsal: "BAJAU", agama: "ISLAM" },
      { id: 335, idMurid: "221201081217", name: "MUHAMMAD FARISY BIN MUHAMMAD ASRI", ic: "150812120769", classCode: "5B", className: "5 BESTARI", gender: "L", kaumAsal: "BAJAU", agama: "ISLAM" },
      { id: 336, idMurid: "221201050812", name: "MAYA ADRIANA BINTI NORDIN", ic: "150508120018", classCode: "5B", className: "5 BESTARI", gender: "P", kaumAsal: "BAJAU", agama: "ISLAM" }
    ]
  },
  {
    id: "client_1790453151153",
    name: "KELOMPOK 1 (KENALI EMOSI) (RUJUKAN UBK)",
    type: "kelompok",
    targetClass: "5 ARIF",
    focus: "psikososial",
    sessionTag: "Sesi 1",
    lastSessionTag: "Sesi 1",
    sessionCount: 1,
    students: [
      { id: 330, idMurid: "221201046813", name: "NURUL SYUHADA BINTI MUHAMMAD RIFKY", ic: "150918120422", classCode: "5A", className: "5 ARIF", gender: "P", kaumAsal: "MURUT", agama: "ISLAM" },
      { id: 331, idMurid: "221201099604", name: "ADIY WAFI BIN MOHD.SUBRI", ic: "150929120429", classCode: "5A", className: "5 ARIF", gender: "L", kaumAsal: "BAJAU", agama: "ISLAM" },
      { id: 337, idMurid: "221201099615", name: "ZARA SALSABILA BINTI MOHD HAFIZ", ic: "150911120120", classCode: "5A", className: "5 ARIF", gender: "P", kaumAsal: "BAJAU", agama: "ISLAM" },
      { id: 338, idMurid: "221201091310", name: "NUR AISYAH BINTI ROSLI", ic: "150913120105", classCode: "5A", className: "5 ARIF", gender: "P", kaumAsal: "MELAYU", agama: "ISLAM" }
    ]
  },
  {
    id: "client_affan_mikaeal",
    name: "AFFAN MIKAEAL BIN MOHD. HAMIZAN",
    type: "individu",
    targetClass: "4 ARIF",
    focus: "akademik",
    sessionTag: "Sesi 1",
    lastSessionTag: "Sesi 1",
    sessionCount: 1,
    students: [
      { id: 201, idMurid: "231203037592", name: "AFFAN MIKAEAL BIN MOHD. HAMIZAN", ic: "161227121291", classCode: "4A", className: "4 ARIF", gender: "L", kaumAsal: "BAJAU", agama: "ISLAM" }
    ]
  },
  {
    id: "client_eaden_preston",
    name: "EADEN PRESTON BRYAN RAY RICHIE",
    type: "individu",
    targetClass: "4 ARIF",
    focus: "disiplin",
    sessionTag: "Sesi 1",
    lastSessionTag: "Sesi 1",
    sessionCount: 1,
    students: [
      { id: 202, idMurid: "231203037593", name: "EADEN PRESTON BRYAN RAY RICHIE", ic: "161022120015", classCode: "4A", className: "4 ARIF", gender: "L", kaumAsal: "DUSUN", agama: "KRISTIAN" }
    ]
  }
];

const RELEASE_SLIP_TEMPLATE = {
  schoolName: "SEKOLAH KEBANGSAAN TAMPASUK 1, KOTA BELUD",
  unitName: "UNIT BIMBINGAN DAN KAUNSELING (UBK)",
  teacherName: "NURUL SYAHFIRAH BINTI ARJAMAN",
  teacherRole: "Guru Praktikal Bimbingan dan Kaunseling"
};
