// Template Jadual Waktu Praktikum Cikgu Nurul Syahfirah binti Arjaman (Minggu 1 - 10)
// Dikemas kini dengan tagging siri sesi automatik (Sesi 1 - Sesi 10) & status IPGM (B - Baru, K - Kes Berulang)
const PRACTICUM_WEEKS = [
  {
    weekNum: 1,
    title: "MINGGU 1",
    dateRange: "17 OGOS - 21 OGOS 2026",
    dates: {
      ISNIN: "17/08/2026",
      SELASA: "18/08/2026",
      RABU: "19/08/2026",
      KHAMIS: "20/08/2026",
      JUMAAT: "21/08/2026"
    },
    sessions: [
      { day: "ISNIN", timeStart: "07.00", timeEnd: "12.40", title: "LAPOR DIRI HARI PERTAMA", type: "pentadbiran", classTarget: "-" },
      { day: "SELASA", timeStart: "07.10", timeEnd: "08.10", title: "KELOMPOK 1 (KENALI EMOSI) (RUJUKAN UBK)", type: "kelompok", classTarget: "Campuran", sessionTag: "Sesi 1", clientStatus: "B" },
      { day: "SELASA", timeStart: "08.40", timeEnd: "12.40", title: "LAWATAN SOSIAL BERSAMA PENSYARAH PENYELIA", type: "program", classTarget: "-" },
      { day: "RABU", timeStart: "07.10", timeEnd: "08.10", title: "5 BESTARI (KENALI DIRI)", type: "bimbingan", classTarget: "5 BESTARI", focus: "sahsiah", clientStatus: "D/J", arrivalWay: "rujukan", notes: "Kelas ganti guru lain - diisi dengan aktiviti bimbingan (Kenali Diri)" },
      { day: "RABU", timeStart: "08.40", timeEnd: "09.40", title: "1 BESTARI (TENTANG SAYA)", type: "bimbingan", classTarget: "1 BESTARI", focus: "sahsiah", clientStatus: "D/J", arrivalWay: "rujukan", notes: "Kelas ganti guru lain - diisi dengan aktiviti bimbingan (Tentang Saya)" },
      { day: "RABU", timeStart: "10.10", timeEnd: "11.10", title: "KI01", type: "individu", classTarget: "Individu", sessionTag: "Sesi 1", clientStatus: "B" },
      { day: "RABU", timeStart: "11.40", timeEnd: "12.40", title: "4 BESTARI (PSIKOEDUKASI TENTANG SAYA)", type: "bimbingan", classTarget: "4 BESTARI", focus: "sahsiah", clientStatus: "D/J", arrivalWay: "rujukan", notes: "Kelas ganti guru lain - diisi dengan psikoedukasi bimbingan (Tentang Saya)" },
      { day: "KHAMIS", timeStart: "07.10", timeEnd: "08.10", title: "KI02", type: "individu", classTarget: "Individu", sessionTag: "Sesi 1", clientStatus: "B" },
      { day: "KHAMIS", timeStart: "08.40", timeEnd: "09.40", title: "5 BESTARI (RUMAH SAYA)", type: "bimbingan", classTarget: "5 BESTARI", focus: "sahsiah", clientStatus: "D/J", arrivalWay: "rujukan", notes: "Kelas ganti guru lain - diisi dengan aktiviti bimbingan (Rumah Saya)" },
      { day: "KHAMIS", timeStart: "10.10", timeEnd: "11.10", title: "KI03", type: "individu", classTarget: "Individu", sessionTag: "Sesi 1", clientStatus: "B" },
      { day: "KHAMIS", timeStart: "11.10", timeEnd: "12.10", title: "KI04", type: "individu", classTarget: "Individu", sessionTag: "Sesi 1", clientStatus: "B" },
      { day: "JUMAAT", timeStart: "07.10", timeEnd: "08.10", title: "KI05", type: "individu", classTarget: "Individu", sessionTag: "Sesi 1", clientStatus: "B" },
      { day: "JUMAAT", timeStart: "09.40", timeEnd: "10.40", title: "KI06", type: "individu", classTarget: "Individu", sessionTag: "Sesi 1", clientStatus: "B" }
    ]
  },
  {
    weekNum: 2,
    title: "MINGGU 2",
    dateRange: "24 OGOS - 28 OGOS 2026",
    dates: {
      ISNIN: "24/08/2026",
      SELASA: "25/08/2026",
      RABU: "26/08/2026",
      KHAMIS: "27/08/2026",
      JUMAAT: "28/08/2026"
    },
    sessions: [
      { day: "ISNIN", timeStart: "07.00", timeEnd: "12.40", title: "CUTI PERISTIWA DAN CUTI UMUM MAULIDUR RASUL", type: "cuti", classTarget: "-" },
      { day: "SELASA", timeStart: "07.00", timeEnd: "12.40", title: "CUTI PERISTIWA DAN CUTI UMUM MAULIDUR RASUL", type: "cuti", classTarget: "-" },
      { day: "RABU", timeStart: "08.10", timeEnd: "09.10", title: "KELOMPOK 1 (URUS EMOSI)", type: "kelompok", classTarget: "Kelompok 1", sessionTag: "Sesi 2", clientStatus: "K" },
      { day: "RABU", timeStart: "10.40", timeEnd: "11.40", title: "4 ARIF (TENTANG SAYA)", type: "bimbingan", classTarget: "4 ARIF", focus: "sahsiah", clientStatus: "D/J", arrivalWay: "rujukan", notes: "Kelas ganti guru lain - diisi dengan aktiviti bimbingan (Tentang Saya)" },
      { day: "KHAMIS", timeStart: "08.40", timeEnd: "09.40", title: "5 BESTARI (KERJAYA)", type: "bimbingan", classTarget: "5 BESTARI", focus: "kerjaya", clientStatus: "D/J", arrivalWay: "rujukan", notes: "Kelas ganti guru lain - diisi dengan aktiviti bimbingan kerjaya murid" },
      { day: "KHAMIS", timeStart: "11.10", timeEnd: "12.10", title: "KELOMPOK 2 (KENALI DIRI)", type: "kelompok", classTarget: "Kelompok 2", sessionTag: "Sesi 1", clientStatus: "B" },
      { day: "JUMAAT", timeStart: "07.40", timeEnd: "08.40", title: "KI107", type: "individu", classTarget: "Individu", sessionTag: "Sesi 1", clientStatus: "B" },
      { day: "JUMAAT", timeStart: "09.10", timeEnd: "12.40", title: "PROGRAM KEMERDEKAAN DAN PERSARAAN", type: "program", classTarget: "Sekolah" }
    ]
  },
  {
    weekNum: 3,
    title: "MINGGU 3",
    dateRange: "07 SEPTEMBER - 11 SEPTEMBER 2026",
    dates: {
      ISNIN: "07/09/2026",
      SELASA: "08/09/2026",
      RABU: "09/09/2026",
      KHAMIS: "10/09/2026",
      JUMAAT: "11/09/2026"
    },
    sessions: [
      { day: "ISNIN", timeStart: "07.10", timeEnd: "08.10", title: "KI08", type: "individu", classTarget: "Individu", sessionTag: "Sesi 1", clientStatus: "B" },
      { day: "ISNIN", timeStart: "08.10", timeEnd: "08.40", title: "SARINGAN MINDA SIHAT", type: "saringan", classTarget: "UBK" },
      { day: "SELASA", timeStart: "07.10", timeEnd: "08.10", title: "KI08", type: "individu", classTarget: "Individu", sessionTag: "Sesi 2", clientStatus: "K" },
      { day: "SELASA", timeStart: "08.40", timeEnd: "09.40", title: "1 ARIF (KENAL EMOSI, URUS EMOSI)", type: "bimbingan", classTarget: "1 ARIF", focus: "psikososial", clientStatus: "D/J", arrivalWay: "rujukan", notes: "Kelas ganti guru lain - diisi dengan aktiviti bimbingan kesejahteraan mental & emosi" },
      { day: "RABU", timeStart: "08.40", timeEnd: "09.10", title: "KI08", type: "individu", classTarget: "Individu", sessionTag: "Sesi 3", clientStatus: "K" },
      { day: "RABU", timeStart: "09.40", timeEnd: "12.40", title: "PROGRAM KEPIMPINAN CILIK", type: "program", classTarget: "Pemimpin Muda" },
      { day: "KHAMIS", timeStart: "07.00", timeEnd: "12.40", title: "PROGRAM BOMBA DAN PENYELIAAN ENCI SAID BIN JULPIN", type: "program", classTarget: "Sekolah" },
      { day: "JUMAAT", timeStart: "07.00", timeEnd: "10.40", title: "SENAMROBIK BERSAMA PIBG", type: "program", classTarget: "PIBG" },
      { day: "JUMAAT", timeStart: "10.40", timeEnd: "11.40", title: "KI08", type: "individu", classTarget: "Individu", sessionTag: "Sesi 4", clientStatus: "K" }
    ]
  },
  {
    weekNum: 4,
    title: "MINGGU 4",
    dateRange: "14 SEPTEMBER - 18 SEPTEMBER 2026",
    dates: {
      ISNIN: "14/09/2026",
      SELASA: "15/09/2026",
      RABU: "16/09/2026",
      KHAMIS: "17/09/2026",
      JUMAAT: "18/09/2026"
    },
    sessions: [
      { day: "ISNIN", timeStart: "09.10", timeEnd: "10.10", title: "KI09", type: "individu", classTarget: "Individu", sessionTag: "Sesi 1", clientStatus: "B" },
      { day: "ISNIN", timeStart: "10.40", timeEnd: "12.10", title: "KELOMPOK 2 (KONSEP KENDIRI)", type: "kelompok", classTarget: "Kelompok 2", sessionTag: "Sesi 2", clientStatus: "K" },
      { day: "SELASA", timeStart: "07.00", timeEnd: "11.40", title: "PROGRAM CERAMAH BUKU TEKS, MAKANAN SIHAT DAN KESIHATAN MENTAL", type: "program", classTarget: "Sekolah" },
      { day: "SELASA", timeStart: "11.40", timeEnd: "12.40", title: "AKTIVITI BIMBINGAN PSIKOEDUKASI DISIPLIN", type: "bimbingan", classTarget: "Disiplin", focus: "disiplin", clientStatus: "D/J", arrivalWay: "rujukan", notes: "Kelas ganti guru lain - diisi dengan psikoedukasi peningkatan disiplin murid" },
      { day: "RABU", timeStart: "07.00", timeEnd: "12.40", title: "CUTI UMUM HARI MALAYSIA", type: "cuti", classTarget: "-" },
      { day: "KHAMIS", timeStart: "07.00", timeEnd: "08.40", title: "SARINGAN MINDA SIHAT UNTUK YANG TIDAK HADIR 08/09", type: "saringan", classTarget: "UBK" },
      { day: "KHAMIS", timeStart: "10.10", timeEnd: "11.10", title: "6 ARIF PSIKOEDUKASI PERKHIDMATAN UBK", type: "bimbingan", classTarget: "6 ARIF", focus: "psikososial", clientStatus: "D/J", arrivalWay: "rujukan", notes: "Kelas ganti guru lain - diisi dengan psikoedukasi perkhidmatan bimbingan UBK" },
      { day: "KHAMIS", timeStart: "11.10", timeEnd: "12.10", title: "BIMBINGAN KELOMPOK PSIKOSOSIAL", type: "kelompok", classTarget: "Kelompok Psikososial", sessionTag: "Sesi 1", clientStatus: "B" }
    ]
  },
  {
    weekNum: 5,
    title: "MINGGU 5",
    dateRange: "21 SEPTEMBER - 25 SEPTEMBER 2026",
    dates: {
      ISNIN: "21/09/2026",
      SELASA: "22/09/2026",
      RABU: "23/09/2026",
      KHAMIS: "24/09/2026",
      JUMAAT: "25/09/2026"
    },
    sessions: [
      { day: "ISNIN", timeStart: "10.40", timeEnd: "11.40", title: "KI10 (SESI INDIVIDU TAHAP 2)", type: "individu", classTarget: "4 ARIF (Waktu BA/BKD)", sessionTag: "Sesi 1", clientStatus: "B" },
      { day: "SELASA", timeStart: "08.00", timeEnd: "12.00", title: "PROGRAM ZIARAH CAKNA BIL 3", type: "program", classTarget: "HEM/Disiplin" },
      { day: "RABU", timeStart: "07.10", timeEnd: "08.10", title: "KELOMPOK 3 (PENINGKATAN SAHSIAH)", type: "kelompok", classTarget: "4 ARIF (Waktu RBT)", sessionTag: "Sesi 1", clientStatus: "B" },
      { day: "KHAMIS", timeStart: "11.10", timeEnd: "12.10", title: "KI11 (SESI INDIVIDU TAHAP 2)", type: "individu", classTarget: "5 ARIF (Waktu PSV)", sessionTag: "Sesi 1", clientStatus: "B" },
      { day: "JUMAAT", timeStart: "10.10", timeEnd: "11.10", title: "BIMBINGAN KELOMPOK TAHAP 2", type: "kelompok", classTarget: "5 BESTARI (Waktu PSV)", sessionTag: "Sesi 1", clientStatus: "B" }
    ]
  },
  {
    weekNum: 6,
    title: "MINGGU 6",
    dateRange: "28 SEPTEMBER - 02 OKTOBER 2026",
    dates: {
      ISNIN: "28/09/2026",
      SELASA: "29/09/2026",
      RABU: "30/09/2026",
      KHAMIS: "01/10/2026",
      JUMAAT: "02/10/2026"
    },
    sessions: [
      { day: "ISNIN", timeStart: "11.10", timeEnd: "12.10", title: "KI12 (SESI INDIVIDU TAHAP 2)", type: "individu", classTarget: "6 BESTARI (Waktu RBT)", sessionTag: "Sesi 1", clientStatus: "B" },
      { day: "SELASA", timeStart: "08.00", timeEnd: "10.00", title: "PELAPORAN ANALISIS KEHADIRAN KELAS", type: "pentadbiran", classTarget: "HEM" },
      { day: "SELASA", timeStart: "11.10", timeEnd: "12.10", title: "KI13 (SESI INDIVIDU TAHAP 2)", type: "individu", classTarget: "4 BESTARI (Waktu PSV)", sessionTag: "Sesi 1", clientStatus: "B" },
      { day: "RABU", timeStart: "10.40", timeEnd: "11.40", title: "KELOMPOK 4 (PENGURUSAN EMOSI)", type: "kelompok", classTarget: "6 ARIF (Waktu Moral)", sessionTag: "Sesi 1", clientStatus: "B" },
      { day: "KHAMIS", timeStart: "08.10", timeEnd: "09.10", title: "KI14 (SESI INDIVIDU TAHAP 2)", type: "individu", classTarget: "5 ARIF (Waktu RBT)", sessionTag: "Sesi 1", clientStatus: "B" },
      { day: "JUMAAT", timeStart: "07.40", timeEnd: "08.40", title: "BIMBINGAN KELAS TAHAP 2", type: "bimbingan", classTarget: "6 ARIF (Waktu PSV)", focus: "sahsiah", clientStatus: "D/J", arrivalWay: "rujukan", notes: "Kelas ganti guru lain (Waktu PSV) - diisi dengan aktiviti bimbingan sahsiah" }
    ]
  },
  {
    weekNum: 7,
    title: "MINGGU 7",
    dateRange: "05 OKTOBER - 09 OKTOBER 2026",
    dates: {
      ISNIN: "05/10/2026",
      SELASA: "06/10/2026",
      RABU: "07/10/2026",
      KHAMIS: "08/10/2026",
      JUMAAT: "09/10/2026"
    },
    sessions: [
      { day: "ISNIN", timeStart: "08.00", timeEnd: "12.00", title: "PROGRAM KEHADIRAN TERBAIK & PEMERIKSAAN GIGI", type: "program", classTarget: "Sekolah" },
      { day: "SELASA", timeStart: "11.10", timeEnd: "12.10", title: "KI15 (SESI INDIVIDU TAHAP 2)", type: "individu", classTarget: "5 ARIF (Waktu SEJ)", sessionTag: "Sesi 1", clientStatus: "B" },
      { day: "RABU", timeStart: "11.10", timeEnd: "12.10", title: "KI16 (SESI INDIVIDU TAHAP 2)", type: "individu", classTarget: "6 BESTARI (Waktu PSV)", sessionTag: "Sesi 1", clientStatus: "B" },
      { day: "KHAMIS", timeStart: "10.10", timeEnd: "11.10", title: "KELOMPOK 5 (KEMAHIRAN BERSOSIAL)", type: "kelompok", classTarget: "6 ARIF (Waktu SEJ)", sessionTag: "Sesi 1", clientStatus: "B" },
      { day: "JUMAAT", timeStart: "10.10", timeEnd: "11.10", title: "KI17 (SESI INDIVIDU TAHAP 2)", type: "individu", classTarget: "4 ARIF (Waktu PSV)", sessionTag: "Sesi 1", clientStatus: "B" }
    ]
  },
  {
    weekNum: 8,
    title: "MINGGU 8",
    dateRange: "12 OKTOBER - 16 OKTOBER 2026",
    dates: {
      ISNIN: "12/10/2026",
      SELASA: "13/10/2026",
      RABU: "14/10/2026",
      KHAMIS: "15/10/2026",
      JUMAAT: "16/10/2026"
    },
    sessions: [
      { day: "ISNIN", timeStart: "08.10", timeEnd: "09.10", title: "KI18 (SESI INDIVIDU TAHAP 2)", type: "individu", classTarget: "4 BESTARI (Waktu PI)", sessionTag: "Sesi 1", clientStatus: "B" },
      { day: "SELASA", timeStart: "11.40", timeEnd: "12.40", title: "KI19 (SESI INDIVIDU TAHAP 2)", type: "individu", classTarget: "6 ARIF (Waktu BKD)", sessionTag: "Sesi 1", clientStatus: "B" },
      { day: "RABU", timeStart: "08.10", timeEnd: "09.10", title: "BIMBINGAN KELAS TAHAP 2", type: "bimbingan", classTarget: "5 BESTARI (Waktu SEJ)", focus: "sahsiah", clientStatus: "D/J", arrivalWay: "rujukan", notes: "Kelas ganti guru lain (Waktu SEJ) - diisi dengan aktiviti bimbingan sahsiah" },
      { day: "KHAMIS", timeStart: "07.30", timeEnd: "12.40", title: "SAMBUTAN HARI KANAK-KANAK", type: "program", classTarget: "Sekolah" },
      { day: "JUMAAT", timeStart: "08.40", timeEnd: "09.40", title: "KI20 (SESI INDIVIDU TAHAP 2)", type: "individu", classTarget: "5 BESTARI (Waktu RBT)", sessionTag: "Sesi 1", clientStatus: "B" }
    ]
  },
  {
    weekNum: 9,
    title: "MINGGU 9",
    dateRange: "19 OKTOBER - 23 OKTOBER 2026",
    dates: {
      ISNIN: "19/10/2026",
      SELASA: "20/10/2026",
      RABU: "21/10/2026",
      KHAMIS: "22/10/2026",
      JUMAAT: "23/10/2026"
    },
    sessions: [
      { day: "ISNIN", timeStart: "11.40", timeEnd: "12.10", title: "KI21 (SESI INDIVIDU TAHAP 2)", type: "individu", classTarget: "5 BESTARI (Waktu MZ)", sessionTag: "Sesi 1", clientStatus: "B" },
      { day: "SELASA", timeStart: "10.40", timeEnd: "11.40", title: "KI22 (SESI INDIVIDU TAHAP 2)", type: "individu", classTarget: "5 BESTARI (Waktu PI)", sessionTag: "Sesi 1", clientStatus: "B" },
      { day: "RABU", timeStart: "11.10", timeEnd: "11.40", title: "KI23 (SESI INDIVIDU TAHAP 2)", type: "individu", classTarget: "4 ARIF (Waktu MZ)", sessionTag: "Sesi 1", clientStatus: "B" },
      { day: "KHAMIS", timeStart: "08.10", timeEnd: "08.40", title: "BIMBINGAN KELOMPOK PENUTUPAN TAHAP 2", type: "kelompok", classTarget: "4 ARIF (Waktu PJ)", sessionTag: "Sesi 1", clientStatus: "B" },
      { day: "JUMAAT", timeStart: "10.10", timeEnd: "11.10", title: "KI24 (SESI INDIVIDU TAHAP 2)", type: "individu", classTarget: "6 ARIF (Waktu RBT)", sessionTag: "Sesi 1", clientStatus: "B" }
    ]
  },
  {
    weekNum: 10,
    title: "MINGGU 10",
    dateRange: "26 OKTOBER - 30 OKTOBER 2026",
    dates: {
      ISNIN: "26/10/2026",
      SELASA: "27/10/2026",
      RABU: "28/10/2026",
      KHAMIS: "29/10/2026",
      JUMAAT: "30/10/2026"
    },
    sessions: [
      { day: "ISNIN", timeStart: "09.10", timeEnd: "09.40", title: "SESI RUMUSAN & REFLEKSI KLIEN TAHAP 2", type: "individu", classTarget: "Klien UBK", sessionTag: "Sesi 1", clientStatus: "B" },
      { day: "RABU", timeStart: "08.00", timeEnd: "10.00", title: "PELAPORAN ANALISIS KEHADIRAN KELAS", type: "pentadbiran", classTarget: "HEM" },
      { day: "KHAMIS", timeStart: "08.00", timeEnd: "10.00", title: "PELAPORAN & TUNTUAN RMT", type: "pentadbiran", classTarget: "RMT" },
      { day: "JUMAAT", timeStart: "07.00", timeEnd: "12.40", title: "PENUTUPAN PRAKTIKUM UBK SK TAMPASUK 1", type: "program", classTarget: "UBK" }
    ]
  }
];
