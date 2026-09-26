// Data Jadual Waktu Induk 12 Kelas SK Tampasuk 1 Sesi 2026
// Berkuat kuasa pada 07 SEPTEMBER 2026
const CLASS_SCHEDULES = {
  "1 ARIF": {
    guruKelas: "Pn. Mastikajunaidah Shahrom",
    guruPembantu: "-",
    tahap: 1,
    rehatTime: "09.40 - 10.10",
    schedule: {
      "ISNIN": [
        { time: "07.00 - 07.40", code: "PERHIMPUNAN", name: "Perhimpunan Rasmi", isBreak: false },
        { time: "07.40 - 08.10", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "08.10 - 08.40", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "08.40 - 09.10", code: "BI", name: "Bahasa Inggeris", core: true },
        { time: "09.10 - 09.40", code: "BI", name: "Bahasa Inggeris", core: true },
        { time: "09.40 - 10.10", code: "REHAT", name: "Waktu Rehat", isBreak: true },
        { time: "10.10 - 10.40", code: "M3", name: "Matematik", core: true },
        { time: "10.40 - 11.10", code: "M3", name: "Matematik", core: true },
        { time: "11.10 - 11.40", code: "SN", name: "Sains", core: true },
        { time: "11.40 - 12.10", code: "SN", name: "Sains", core: true },
        { time: "12.10 - 12.40", code: "BM", name: "Bahasa Melayu", core: true }
      ],
      "SELASA": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "Program SEMAI" },
        { time: "07.10 - 07.40", code: "PJ", name: "Pendidikan Jasmani", core: false },
        { time: "07.40 - 08.10", code: "BI", name: "Bahasa Inggeris", core: true },
        { time: "08.10 - 08.40", code: "BI", name: "Bahasa Inggeris", core: true },
        { time: "08.40 - 09.10", code: "SN", name: "Sains", core: true },
        { time: "09.10 - 09.40", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "09.40 - 10.10", code: "REHAT", name: "Waktu Rehat", isBreak: true },
        { time: "10.10 - 10.40", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "10.40 - 11.10", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "11.10 - 11.40", code: "PK", name: "Pendidikan Kesihatan", core: false },
        { time: "11.40 - 12.10", code: "PI/PM", name: "Pendidikan Islam / Moral", core: false },
        { time: "12.10 - 12.40", code: "PI/PM", name: "Pendidikan Islam / Moral", core: false }
      ],
      "RABU": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "Program SEMAI" },
        { time: "07.10 - 07.40", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "07.40 - 08.10", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "08.10 - 08.40", code: "MZ", name: "Pendidikan Muzik", core: false },
        { time: "08.40 - 09.10", code: "BI", name: "Bahasa Inggeris", core: true },
        { time: "09.10 - 09.40", code: "BI", name: "Bahasa Inggeris", core: true },
        { time: "09.40 - 10.10", code: "REHAT", name: "Waktu Rehat", isBreak: true },
        { time: "10.10 - 10.40", code: "M3", name: "Matematik", core: true },
        { time: "10.40 - 11.10", code: "M3", name: "Matematik", core: true },
        { time: "11.10 - 11.40", code: "PI/PM", name: "Pendidikan Islam / Moral", core: false },
        { time: "11.40 - 12.10", code: "PI/PM", name: "Pendidikan Islam / Moral", core: false }
      ],
      "KHAMIS": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "Program SEMAI" },
        { time: "07.10 - 07.40", code: "BA/BKD", name: "BA / BKD", core: false },
        { time: "07.40 - 08.10", code: "BA/BKD", name: "BA / BKD", core: false },
        { time: "08.10 - 08.40", code: "PJ", name: "Pendidikan Jasmani", core: false },
        { time: "08.40 - 09.10", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "09.10 - 09.40", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "09.40 - 10.10", code: "REHAT", name: "Waktu Rehat", isBreak: true },
        { time: "10.10 - 10.40", code: "BI", name: "Bahasa Inggeris", core: true },
        { time: "10.40 - 11.10", code: "BI", name: "Bahasa Inggeris", core: true },
        { time: "11.10 - 11.40", code: "PSV", name: "Pendidikan Seni Visual", core: false },
        { time: "11.40 - 12.10", code: "PSV", name: "Pendidikan Seni Visual", core: false },
        { time: "12.40 - 01.10", code: "TASMEK", name: "TASMEK", core: false }
      ],
      "JUMAAT": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "Program SEMAI" },
        { time: "07.10 - 07.40", code: "PI/PM", name: "Pendidikan Islam / Moral", core: false },
        { time: "07.40 - 08.10", code: "PI/PM", name: "Pendidikan Islam / Moral", core: false },
        { time: "08.10 - 08.40", code: "BI", name: "Bahasa Inggeris", core: true },
        { time: "08.40 - 09.10", code: "M3", name: "Matematik", core: true },
        { time: "09.10 - 09.40", code: "M3", name: "Matematik", core: true },
        { time: "09.40 - 10.10", code: "REHAT", name: "Waktu Rehat", isBreak: true },
        { time: "10.10 - 10.40", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "10.40 - 11.10", code: "BM", name: "Bahasa Melayu", core: true }
      ]
    }
  },

  "1 BESTARI": {
    guruKelas: "En. George Simun",
    guruPembantu: "-",
    tahap: 1,
    rehatTime: "09.40 - 10.10",
    schedule: {
      "ISNIN": [
        { time: "07.00 - 07.40", code: "PERHIMPUNAN", name: "Perhimpunan Rasmi" },
        { time: "07.40 - 08.10", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "08.10 - 08.40", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "08.40 - 09.10", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "09.10 - 09.40", code: "MZ", name: "Pendidikan Muzik", core: false },
        { time: "09.40 - 10.10", code: "REHAT", name: "Waktu Rehat", isBreak: true },
        { time: "10.10 - 10.40", code: "BI", name: "Bahasa Inggeris", core: true },
        { time: "10.40 - 11.10", code: "BI", name: "Bahasa Inggeris", core: true },
        { time: "11.10 - 11.40", code: "PK", name: "Pendidikan Kesihatan", core: false },
        { time: "11.40 - 12.10", code: "M3", name: "Matematik", core: true },
        { time: "12.10 - 12.40", code: "M3", name: "Matematik", core: true }
      ],
      "SELASA": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "Program SEMAI" },
        { time: "07.10 - 07.40", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "07.40 - 08.10", code: "PI", name: "Pendidikan Islam", core: false },
        { time: "08.10 - 08.40", code: "PI", name: "Pendidikan Islam", core: false },
        { time: "08.40 - 09.10", code: "M3", name: "Matematik", core: true },
        { time: "09.10 - 09.40", code: "M3", name: "Matematik", core: true },
        { time: "09.40 - 10.10", code: "REHAT", name: "Waktu Rehat", isBreak: true },
        { time: "10.10 - 10.40", code: "BI", name: "Bahasa Inggeris", core: true },
        { time: "10.40 - 11.10", code: "BI", name: "Bahasa Inggeris", core: true },
        { time: "11.10 - 11.40", code: "SN", name: "Sains", core: true },
        { time: "11.40 - 12.10", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "12.10 - 12.40", code: "BM", name: "Bahasa Melayu", core: true }
      ],
      "RABU": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "Program SEMAI" },
        { time: "07.10 - 07.40", code: "BI", name: "Bahasa Inggeris", core: true },
        { time: "07.40 - 08.10", code: "BI", name: "Bahasa Inggeris", core: true },
        { time: "08.10 - 08.40", code: "PI", name: "Pendidikan Islam", core: false },
        { time: "08.40 - 09.10", code: "PI", name: "Pendidikan Islam", core: false },
        { time: "09.10 - 09.40", code: "PJ", name: "Pendidikan Jasmani", core: false },
        { time: "09.40 - 10.10", code: "REHAT", name: "Waktu Rehat", isBreak: true },
        { time: "10.10 - 10.40", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "10.40 - 11.10", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "11.10 - 11.40", code: "M3", name: "Matematik", core: true },
        { time: "11.40 - 12.10", code: "M3", name: "Matematik", core: true }
      ],
      "KHAMIS": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "Program SEMAI" },
        { time: "07.10 - 07.40", code: "PJ", name: "Pendidikan Jasmani", core: false },
        { time: "07.40 - 08.10", code: "PI", name: "Pendidikan Islam", core: false },
        { time: "08.10 - 08.40", code: "PI", name: "Pendidikan Islam", core: false },
        { time: "08.40 - 09.10", code: "BA", name: "Bahasa Arab", core: false },
        { time: "09.10 - 09.40", code: "BA", name: "Bahasa Arab", core: false },
        { time: "09.40 - 10.10", code: "REHAT", name: "Waktu Rehat", isBreak: true },
        { time: "10.10 - 10.40", code: "PSV", name: "Pendidikan Seni Visual", core: false },
        { time: "10.40 - 11.10", code: "PSV", name: "Pendidikan Seni Visual", core: false },
        { time: "11.10 - 11.40", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "11.40 - 12.10", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "12.40 - 01.10", code: "TASMEK", name: "TASMEK", core: false }
      ],
      "JUMAAT": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "Program SEMAI" },
        { time: "07.10 - 07.40", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "07.40 - 08.10", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "08.10 - 08.40", code: "SN", name: "Sains", core: true },
        { time: "08.40 - 09.10", code: "SN", name: "Sains", core: true },
        { time: "09.10 - 09.40", code: "BI", name: "Bahasa Inggeris", core: true },
        { time: "09.40 - 10.10", code: "REHAT", name: "Waktu Rehat", isBreak: true },
        { time: "10.10 - 10.40", code: "BI", name: "Bahasa Inggeris", core: true },
        { time: "10.40 - 11.10", code: "BI", name: "Bahasa Inggeris", core: true }
      ]
    }
  },

  "2 ARIF": {
    guruKelas: "Pn. Kasmalah Ismail",
    guruPembantu: "En. Duin Lasig",
    tahap: 1,
    rehatTime: "09.40 - 10.10",
    schedule: {
      "ISNIN": [
        { time: "07.00 - 07.40", code: "PERHIMPUNAN", name: "Perhimpunan Rasmi" },
        { time: "07.40 - 08.10", code: "BI", name: "Bahasa Inggeris", core: true },
        { time: "08.10 - 08.40", code: "BI", name: "Bahasa Inggeris", core: true },
        { time: "08.40 - 09.10", code: "SN", name: "Sains", core: true },
        { time: "09.10 - 09.40", code: "SN", name: "Sains", core: true },
        { time: "09.40 - 10.10", code: "REHAT", name: "Waktu Rehat", isBreak: true },
        { time: "10.10 - 10.40", code: "MZ", name: "Pendidikan Muzik", core: false },
        { time: "10.40 - 11.10", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "11.10 - 11.40", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "11.40 - 12.10", code: "PI/PM", name: "Pendidikan Islam / Moral", core: false },
        { time: "12.10 - 12.40", code: "PI/PM", name: "Pendidikan Islam / Moral", core: false },
        { time: "12.40 - 01.40", code: "TASMEK", name: "TASMEK", core: false }
      ],
      "SELASA": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "Program SEMAI" },
        { time: "07.10 - 07.40", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "07.40 - 08.10", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "08.10 - 08.40", code: "M3", name: "Matematik", core: true },
        { time: "08.40 - 09.10", code: "M3", name: "Matematik", core: true },
        { time: "09.10 - 09.40", code: "PJ", name: "Pendidikan Jasmani", core: false },
        { time: "09.40 - 10.10", code: "REHAT", name: "Waktu Rehat", isBreak: true },
        { time: "10.10 - 10.40", code: "PI/PM", name: "Pendidikan Islam / Moral", core: false },
        { time: "10.40 - 11.10", code: "PI/PM", name: "Pendidikan Islam / Moral", core: false },
        { time: "11.10 - 11.40", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "11.40 - 12.10", code: "BI", name: "Bahasa Inggeris", core: true },
        { time: "12.10 - 12.40", code: "BI", name: "Bahasa Inggeris", core: true }
      ],
      "RABU": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "Program SEMAI" },
        { time: "07.10 - 07.40", code: "BI", name: "Bahasa Inggeris", core: true },
        { time: "07.40 - 08.10", code: "BI", name: "Bahasa Inggeris", core: true },
        { time: "08.10 - 08.40", code: "PJ", name: "Pendidikan Jasmani", core: false },
        { time: "08.40 - 09.10", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "09.10 - 09.40", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "09.40 - 10.10", code: "REHAT", name: "Waktu Rehat", isBreak: true },
        { time: "10.10 - 10.40", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "10.40 - 11.10", code: "BA/BKD", name: "BA / BKD", core: false },
        { time: "11.10 - 11.40", code: "BA/BKD", name: "BA / BKD", core: false },
        { time: "11.40 - 12.10", code: "BI", name: "Bahasa Inggeris", core: true }
      ],
      "KHAMIS": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "Program SEMAI" },
        { time: "07.10 - 07.40", code: "BI", name: "Bahasa Inggeris", core: true },
        { time: "07.40 - 08.10", code: "BI", name: "Bahasa Inggeris", core: true },
        { time: "08.10 - 08.40", code: "PK", name: "Pendidikan Kesihatan", core: false },
        { time: "08.40 - 09.10", code: "M3", name: "Matematik", core: true },
        { time: "09.10 - 09.40", code: "M3", name: "Matematik", core: true },
        { time: "09.40 - 10.10", code: "REHAT", name: "Waktu Rehat", isBreak: true },
        { time: "10.10 - 10.40", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "10.40 - 11.10", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "11.10 - 11.40", code: "PI/PM", name: "Pendidikan Islam / Moral", core: false },
        { time: "11.40 - 12.10", code: "PI/PM", name: "Pendidikan Islam / Moral", core: false }
      ],
      "JUMAAT": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "Program SEMAI" },
        { time: "07.10 - 07.40", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "07.40 - 08.10", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "08.10 - 08.40", code: "SN", name: "Sains", core: true },
        { time: "08.40 - 09.10", code: "PSV", name: "Pendidikan Seni Visual", core: false },
        { time: "09.10 - 09.40", code: "PSV", name: "Pendidikan Seni Visual", core: false },
        { time: "09.40 - 10.10", code: "REHAT", name: "Waktu Rehat", isBreak: true },
        { time: "10.10 - 10.40", code: "M3", name: "Matematik", core: true },
        { time: "10.40 - 11.10", code: "M3", name: "Matematik", core: true }
      ]
    }
  },

  "2 BESTARI": {
    guruKelas: "Pn. Anna Octavia Ninteh",
    guruPembantu: "Pn. Yunizah Esun",
    tahap: 1,
    rehatTime: "09.40 - 10.10",
    schedule: {
      "ISNIN": [
        { time: "07.00 - 07.40", code: "PERHIMPUNAN", name: "Perhimpunan Rasmi" },
        { time: "07.40 - 08.10", code: "M3", name: "Matematik", core: true },
        { time: "08.10 - 08.40", code: "M3", name: "Matematik", core: true },
        { time: "08.40 - 09.10", code: "PI", name: "Pendidikan Islam", core: false },
        { time: "09.10 - 09.40", code: "PI", name: "Pendidikan Islam", core: false },
        { time: "09.40 - 10.10", code: "REHAT", name: "Waktu Rehat", isBreak: true },
        { time: "10.10 - 10.40", code: "BI", name: "Bahasa Inggeris", core: true },
        { time: "10.40 - 11.10", code: "BI", name: "Bahasa Inggeris", core: true },
        { time: "11.10 - 11.40", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "11.40 - 12.10", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "12.10 - 12.40", code: "SN", name: "Sains", core: true }
      ],
      "SELASA": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "Program SEMAI" },
        { time: "07.10 - 07.40", code: "BI", name: "Bahasa Inggeris", core: true },
        { time: "07.40 - 08.10", code: "BI", name: "Bahasa Inggeris", core: true },
        { time: "08.10 - 08.40", code: "PJ", name: "Pendidikan Jasmani", core: false },
        { time: "08.40 - 09.10", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "09.10 - 09.40", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "09.40 - 10.10", code: "REHAT", name: "Waktu Rehat", isBreak: true },
        { time: "10.10 - 10.40", code: "PI", name: "Pendidikan Islam", core: false },
        { time: "10.40 - 11.10", code: "PI", name: "Pendidikan Islam", core: false },
        { time: "11.10 - 11.40", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "11.40 - 12.10", code: "M3", name: "Matematik", core: true },
        { time: "12.10 - 12.40", code: "M3", name: "Matematik", core: true }
      ],
      "RABU": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "Program SEMAI" },
        { time: "07.10 - 07.40", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "07.40 - 08.10", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "08.10 - 08.40", code: "BA", name: "Bahasa Arab", core: false },
        { time: "08.40 - 09.10", code: "BA", name: "Bahasa Arab", core: false },
        { time: "09.10 - 09.40", code: "PJ", name: "Pendidikan Jasmani", core: false },
        { time: "09.40 - 10.10", code: "REHAT", name: "Waktu Rehat", isBreak: true },
        { time: "10.10 - 10.40", code: "BI", name: "Bahasa Inggeris", core: true },
        { time: "10.40 - 11.10", code: "BI", name: "Bahasa Inggeris", core: true },
        { time: "11.10 - 11.40", code: "SN", name: "Sains", core: true },
        { time: "11.40 - 12.10", code: "SN", name: "Sains", core: true },
        { time: "12.10 - 01.10", code: "TASMEK", name: "TASMEK", core: false }
      ],
      "KHAMIS": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "Program SEMAI" },
        { time: "07.10 - 07.40", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "07.40 - 08.10", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "08.10 - 08.40", code: "MZ", name: "Pendidikan Muzik", core: false },
        { time: "08.40 - 09.10", code: "PSV", name: "Pendidikan Seni Visual", core: false },
        { time: "09.10 - 09.40", code: "PSV", name: "Pendidikan Seni Visual", core: false },
        { time: "09.40 - 10.10", code: "REHAT", name: "Waktu Rehat", isBreak: true },
        { time: "10.10 - 10.40", code: "BI", name: "Bahasa Inggeris", core: true },
        { time: "10.40 - 11.10", code: "BI", name: "Bahasa Inggeris", core: true },
        { time: "11.10 - 11.40", code: "M3", name: "Matematik", core: true },
        { time: "11.40 - 12.10", code: "M3", name: "Matematik", core: true }
      ],
      "JUMAAT": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "Program SEMAI" },
        { time: "07.10 - 07.40", code: "PI", name: "Pendidikan Islam", core: false },
        { time: "07.40 - 08.10", code: "PI", name: "Pendidikan Islam", core: false },
        { time: "08.10 - 08.40", code: "PK", name: "Pendidikan Kesihatan", core: false },
        { time: "08.40 - 09.10", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "09.10 - 09.40", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "09.40 - 10.10", code: "REHAT", name: "Waktu Rehat", isBreak: true },
        { time: "10.10 - 10.40", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "10.40 - 11.10", code: "BI", name: "Bahasa Inggeris", core: true }
      ]
    }
  },

  "3 ARIF": {
    guruKelas: "Pn. Muhayan Diman",
    guruPembantu: "Pn. Zuraidah Hj. Marjin",
    tahap: 1,
    rehatTime: "09.40 - 10.10",
    schedule: {
      "ISNIN": [
        { time: "07.00 - 07.40", code: "PERHIMPUNAN", name: "Perhimpunan Rasmi" },
        { time: "07.40 - 08.10", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "08.10 - 08.40", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "08.40 - 09.10", code: "BA/BKD", name: "BA / BKD", core: false },
        { time: "09.10 - 09.40", code: "BA/BKD", name: "BA / BKD", core: false },
        { time: "09.40 - 10.10", code: "REHAT", name: "Waktu Rehat", isBreak: true },
        { time: "10.10 - 10.40", code: "BI", name: "Bahasa Inggeris", core: true },
        { time: "10.40 - 11.10", code: "BI", name: "Bahasa Inggeris", core: true },
        { time: "11.10 - 11.40", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "11.40 - 12.10", code: "M3", name: "Matematik", core: true },
        { time: "12.10 - 12.40", code: "M3", name: "Matematik", core: true }
      ],
      "SELASA": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "Program SEMAI" },
        { time: "07.10 - 07.40", code: "SN", name: "Sains", core: true },
        { time: "07.40 - 08.10", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "08.10 - 08.40", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "08.40 - 09.10", code: "PI/PM", name: "Pendidikan Islam / Moral", core: false },
        { time: "09.10 - 09.40", code: "PI/PM", name: "Pendidikan Islam / Moral", core: false },
        { time: "09.40 - 10.10", code: "REHAT", name: "Waktu Rehat", isBreak: true },
        { time: "10.10 - 10.40", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "10.40 - 11.10", code: "M3", name: "Matematik", core: true },
        { time: "11.10 - 11.40", code: "M3", name: "Matematik", core: true },
        { time: "11.40 - 12.10", code: "BI", name: "Bahasa Inggeris", core: true },
        { time: "12.10 - 12.40", code: "BI", name: "Bahasa Inggeris", core: true },
        { time: "12.40 - 01.40", code: "TASMEK", name: "TASMEK", core: false }
      ],
      "RABU": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "Program SEMAI" },
        { time: "07.10 - 07.40", code: "PJ", name: "Pendidikan Jasmani", core: false },
        { time: "07.40 - 08.10", code: "M3", name: "Matematik", core: true },
        { time: "08.10 - 08.40", code: "M3", name: "Matematik", core: true },
        { time: "08.40 - 09.10", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "09.10 - 09.40", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "09.40 - 10.10", code: "REHAT", name: "Waktu Rehat", isBreak: true },
        { time: "10.10 - 10.40", code: "PI/PM", name: "Pendidikan Islam / Moral", core: false },
        { time: "10.40 - 11.10", code: "PI/PM", name: "Pendidikan Islam / Moral", core: false },
        { time: "11.10 - 11.40", code: "BI", name: "Bahasa Inggeris", core: true },
        { time: "11.40 - 12.10", code: "BI", name: "Bahasa Inggeris", core: true }
      ],
      "KHAMIS": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "Program SEMAI" },
        { time: "07.10 - 07.40", code: "BI", name: "Bahasa Inggeris", core: true },
        { time: "07.40 - 08.10", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "08.10 - 08.40", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "08.40 - 09.10", code: "SN", name: "Sains", core: true },
        { time: "09.10 - 09.40", code: "SN", name: "Sains", core: true },
        { time: "09.40 - 10.10", code: "REHAT", name: "Waktu Rehat", isBreak: true },
        { time: "10.10 - 10.40", code: "PI/PM", name: "Pendidikan Islam / Moral", core: false },
        { time: "10.40 - 11.10", code: "PI/PM", name: "Pendidikan Islam / Moral", core: false },
        { time: "11.10 - 11.40", code: "PK", name: "Pendidikan Kesihatan", core: false },
        { time: "11.40 - 12.10", code: "MZ", name: "Pendidikan Muzik", core: false }
      ],
      "JUMAAT": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "Program SEMAI" },
        { time: "07.10 - 07.40", code: "PSV", name: "Pendidikan Seni Visual", core: false },
        { time: "07.40 - 08.10", code: "PSV", name: "Pendidikan Seni Visual", core: false },
        { time: "08.10 - 08.40", code: "PJ", name: "Pendidikan Jasmani", core: false },
        { time: "08.40 - 09.10", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "09.10 - 09.40", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "09.40 - 10.10", code: "REHAT", name: "Waktu Rehat", isBreak: true },
        { time: "10.10 - 10.40", code: "BI", name: "Bahasa Inggeris", core: true },
        { time: "10.40 - 11.10", code: "BI", name: "Bahasa Inggeris", core: true }
      ]
    }
  },

  "3 BESTARI": {
    guruKelas: "Pn. Rohanah Mohd Suod",
    guruPembantu: "Pn. Salhah Awg Tengah",
    tahap: 1,
    rehatTime: "09.40 - 10.10",
    schedule: {
      "ISNIN": [
        { time: "07.00 - 07.40", code: "PERHIMPUNAN", name: "Perhimpunan Rasmi" },
        { time: "07.40 - 08.10", code: "PI", name: "Pendidikan Islam", core: false },
        { time: "08.10 - 08.40", code: "PI", name: "Pendidikan Islam", core: false },
        { time: "08.40 - 09.10", code: "M3", name: "Matematik", core: true },
        { time: "09.10 - 09.40", code: "M3", name: "Matematik", core: true },
        { time: "09.40 - 10.10", code: "REHAT", name: "Waktu Rehat", isBreak: true },
        { time: "10.10 - 10.40", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "10.40 - 11.10", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "11.10 - 11.40", code: "MZ", name: "Pendidikan Muzik", core: false },
        { time: "11.40 - 12.10", code: "BI", name: "Bahasa Inggeris", core: true },
        { time: "12.10 - 12.40", code: "BI", name: "Bahasa Inggeris", core: true }
      ],
      "SELASA": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "Program SEMAI" },
        { time: "07.10 - 07.40", code: "BA", name: "Bahasa Arab", core: false },
        { time: "07.40 - 08.10", code: "BA", name: "Bahasa Arab", core: false },
        { time: "08.10 - 08.40", code: "SN", name: "Sains", core: true },
        { time: "08.40 - 09.10", code: "SN", name: "Sains", core: true },
        { time: "09.10 - 09.40", code: "PK", name: "Pendidikan Kesihatan", core: false },
        { time: "09.40 - 10.10", code: "REHAT", name: "Waktu Rehat", isBreak: true },
        { time: "10.10 - 10.40", code: "BI", name: "Bahasa Inggeris", core: true },
        { time: "10.40 - 11.10", code: "BI", name: "Bahasa Inggeris", core: true },
        { time: "11.10 - 11.40", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "11.40 - 12.10", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "12.10 - 12.40", code: "SN", name: "Sains", core: true }
      ],
      "RABU": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "Program SEMAI" },
        { time: "07.10 - 07.40", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "07.40 - 08.10", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "08.10 - 08.40", code: "PJ", name: "Pendidikan Jasmani", core: false },
        { time: "08.40 - 09.10", code: "BI", name: "Bahasa Inggeris", core: true },
        { time: "09.10 - 09.40", code: "BI", name: "Bahasa Inggeris", core: true },
        { time: "09.40 - 10.10", code: "REHAT", name: "Waktu Rehat", isBreak: true },
        { time: "10.10 - 10.40", code: "M3", name: "Matematik", core: true },
        { time: "10.40 - 11.10", code: "M3", name: "Matematik", core: true },
        { time: "11.10 - 11.40", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "11.40 - 12.10", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "12.40 - 01.10", code: "TASMEK", name: "TASMEK", core: false }
      ],
      "KHAMIS": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "Program SEMAI" },
        { time: "07.10 - 07.40", code: "PSV", name: "Pendidikan Seni Visual", core: false },
        { time: "07.40 - 08.10", code: "PSV", name: "Pendidikan Seni Visual", core: false },
        { time: "08.10 - 08.40", code: "PI", name: "Pendidikan Islam", core: false },
        { time: "08.40 - 09.10", code: "PI", name: "Pendidikan Islam", core: false },
        { time: "09.10 - 09.40", code: "BI", name: "Bahasa Inggeris", core: true },
        { time: "09.40 - 10.10", code: "REHAT", name: "Waktu Rehat", isBreak: true },
        { time: "10.10 - 10.40", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "10.40 - 11.10", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "11.10 - 11.40", code: "M3", name: "Matematik", core: true },
        { time: "11.40 - 12.10", code: "M3", name: "Matematik", core: true }
      ],
      "JUMAAT": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "Program SEMAI" },
        { time: "07.10 - 07.40", code: "PI", name: "Pendidikan Islam", core: false },
        { time: "07.40 - 08.10", code: "PI", name: "Pendidikan Islam", core: false },
        { time: "08.10 - 08.40", code: "BI", name: "Bahasa Inggeris", core: true },
        { time: "08.40 - 09.10", code: "BI", name: "Bahasa Inggeris", core: true },
        { time: "09.10 - 09.40", code: "PJ", name: "Pendidikan Jasmani", core: false },
        { time: "09.40 - 10.10", code: "REHAT", name: "Waktu Rehat", isBreak: true },
        { time: "10.10 - 10.40", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "10.40 - 11.10", code: "BM", name: "Bahasa Melayu", core: true }
      ]
    }
  },

  "4 ARIF": {
    guruKelas: "En. Mohd. Hafiz Qayyum Ahmad",
    guruPembantu: "En. Amriee Abdullah",
    tahap: 2,
    rehatTime: "09.40 - 10.10",
    schedule: {
      "ISNIN": [
        { time: "07.00 - 07.40", code: "PERHIMPUNAN", name: "Perhimpunan Rasmi" },
        { time: "07.40 - 08.10", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "08.10 - 08.40", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "08.40 - 09.10", code: "SN", name: "Sains", core: true },
        { time: "09.10 - 09.40", code: "SN", name: "Sains", core: true },
        { time: "09.40 - 10.10", code: "REHAT", name: "Waktu Rehat", isBreak: true },
        { time: "10.10 - 10.40", code: "BI", name: "Bahasa Inggeris", core: true },
        { time: "10.40 - 11.10", code: "BI", name: "Bahasa Inggeris", core: true },
        { time: "11.10 - 11.40", code: "MZ", name: "Pendidikan Muzik", core: false },
        { time: "11.40 - 12.10", code: "M3", name: "Matematik", core: true },
        { time: "12.10 - 12.40", code: "M3", name: "Matematik", core: true }
      ],
      "SELASA": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "Program SEMAI" },
        { time: "07.10 - 07.40", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "07.40 - 08.10", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "08.10 - 08.40", code: "M3", name: "Matematik", core: true },
        { time: "08.40 - 09.10", code: "PI/PM", name: "Pendidikan Islam / Moral", core: false },
        { time: "09.10 - 09.40", code: "PI/PM", name: "Pendidikan Islam / Moral", core: false },
        { time: "09.40 - 10.10", code: "REHAT", name: "Waktu Rehat", isBreak: true },
        { time: "10.10 - 10.40", code: "BI", name: "Bahasa Inggeris", core: true },
        { time: "10.40 - 11.10", code: "BI", name: "Bahasa Inggeris", core: true },
        { time: "11.10 - 11.40", code: "PK", name: "Pendidikan Kesihatan", core: false },
        { time: "11.40 - 12.10", code: "BA/BKD", name: "BA / BKD", core: false },
        { time: "12.10 - 12.40", code: "BA/BKD", name: "BA / BKD", core: false }
      ],
      "RABU": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "Program SEMAI" },
        { time: "07.10 - 07.40", code: "BI", name: "Bahasa Inggeris", core: true },
        { time: "07.40 - 08.10", code: "BI", name: "Bahasa Inggeris", core: true },
        { time: "08.10 - 08.40", code: "PJ", name: "Pendidikan Jasmani", core: false },
        { time: "08.40 - 09.10", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "09.10 - 09.40", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "09.40 - 10.10", code: "REHAT", name: "Waktu Rehat", isBreak: true },
        { time: "10.10 - 10.40", code: "PI/PM", name: "Pendidikan Islam / Moral", core: false },
        { time: "10.40 - 11.10", code: "PI/PM", name: "Pendidikan Islam / Moral", core: false },
        { time: "11.10 - 11.40", code: "SEJ", name: "Sejarah", core: false },
        { time: "11.40 - 12.10", code: "SEJ", name: "Sejarah", core: false },
        { time: "12.40 - 01.10", code: "TASMEK", name: "TASMEK", core: false }
      ],
      "KHAMIS": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "Program SEMAI" },
        { time: "07.10 - 07.40", code: "M3", name: "Matematik", core: true },
        { time: "07.40 - 08.10", code: "M3", name: "Matematik", core: true },
        { time: "08.10 - 08.40", code: "PI/PM", name: "Pendidikan Islam / Moral", core: false },
        { time: "08.40 - 09.10", code: "PI/PM", name: "Pendidikan Islam / Moral", core: false },
        { time: "09.10 - 09.40", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "09.40 - 10.10", code: "REHAT", name: "Waktu Rehat", isBreak: true },
        { time: "10.10 - 10.40", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "10.40 - 11.10", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "11.10 - 11.40", code: "SN", name: "Sains", core: true },
        { time: "11.40 - 12.10", code: "SN", name: "Sains", core: true }
      ],
      "JUMAAT": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "Program SEMAI" },
        { time: "07.10 - 07.40", code: "PSV", name: "Pendidikan Seni Visual", core: false },
        { time: "07.40 - 08.10", code: "PSV", name: "Pendidikan Seni Visual", core: false },
        { time: "08.10 - 08.40", code: "PJ", name: "Pendidikan Jasmani", core: false },
        { time: "08.40 - 09.10", code: "BI", name: "Bahasa Inggeris", core: true },
        { time: "09.10 - 09.40", code: "BI", name: "Bahasa Inggeris", core: true },
        { time: "09.40 - 10.10", code: "REHAT", name: "Waktu Rehat", isBreak: true },
        { time: "10.10 - 10.40", code: "RBT", name: "Reka Bentuk & Teknologi", core: false },
        { time: "10.40 - 11.10", code: "RBT", name: "Reka Bentuk & Teknologi", core: false }
      ]
    }
  },

  "4 BESTARI": {
    guruKelas: "Pn. Anidah Samad",
    guruPembantu: "Pn. Zurinah Jubidi",
    tahap: 2,
    rehatTime: "09.40 - 10.10",
    schedule: {
      "ISNIN": [
        { time: "07.00 - 07.40", code: "PERHIMPUNAN", name: "Perhimpunan Rasmi" },
        { time: "07.40 - 08.10", code: "M3", name: "Matematik", core: true },
        { time: "08.10 - 08.40", code: "M3", name: "Matematik", core: true },
        { time: "08.40 - 09.10", code: "RBT", name: "Reka Bentuk & Teknologi", core: false },
        { time: "09.10 - 09.40", code: "RBT", name: "Reka Bentuk & Teknologi", core: false },
        { time: "09.40 - 10.10", code: "REHAT", name: "Waktu Rehat", isBreak: true },
        { time: "10.10 - 10.40", code: "PI", name: "Pendidikan Islam", core: false },
        { time: "10.40 - 11.10", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "11.10 - 11.40", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "11.40 - 12.10", code: "BI", name: "Bahasa Inggeris", core: true },
        { time: "12.10 - 12.40", code: "BI", name: "Bahasa Inggeris", core: true },
        { time: "12.40 - 01.40", code: "TASMEK", name: "TASMEK", core: false }
      ],
      "SELASA": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "Program SEMAI" },
        { time: "07.10 - 07.40", code: "SN", name: "Sains", core: true },
        { time: "07.40 - 08.10", code: "SN", name: "Sains", core: true },
        { time: "08.10 - 08.40", code: "PJ", name: "Pendidikan Jasmani", core: false },
        { time: "08.40 - 09.10", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "09.10 - 09.40", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "09.40 - 10.10", code: "REHAT", name: "Waktu Rehat", isBreak: true },
        { time: "10.10 - 10.40", code: "MZ", name: "Pendidikan Muzik", core: false },
        { time: "10.40 - 11.10", code: "PI", name: "Pendidikan Islam", core: false },
        { time: "11.10 - 11.40", code: "PI", name: "Pendidikan Islam", core: false },
        { time: "11.40 - 12.10", code: "BI", name: "Bahasa Inggeris", core: true },
        { time: "12.10 - 12.40", code: "BI", name: "Bahasa Inggeris", core: true }
      ],
      "RABU": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "Program SEMAI" },
        { time: "07.10 - 07.40", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "07.40 - 08.10", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "08.10 - 08.40", code: "PJ", name: "Pendidikan Jasmani", core: false },
        { time: "08.40 - 09.10", code: "PI", name: "Pendidikan Islam", core: false },
        { time: "09.10 - 09.40", code: "PI", name: "Pendidikan Islam", core: false },
        { time: "09.40 - 10.10", code: "REHAT", name: "Waktu Rehat", isBreak: true },
        { time: "10.10 - 10.40", code: "SEJ", name: "Sejarah", core: false },
        { time: "10.40 - 11.10", code: "SEJ", name: "Sejarah", core: false },
        { time: "11.10 - 11.40", code: "BI", name: "Bahasa Inggeris", core: true },
        { time: "11.40 - 12.10", code: "BI", name: "Bahasa Inggeris", core: true }
      ],
      "KHAMIS": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "Program SEMAI" },
        { time: "07.10 - 07.40", code: "PI", name: "Pendidikan Islam", core: false },
        { time: "07.40 - 08.10", code: "PSV", name: "Pendidikan Seni Visual", core: false },
        { time: "08.10 - 08.40", code: "PSV", name: "Pendidikan Seni Visual", core: false },
        { time: "08.40 - 09.10", code: "BI", name: "Bahasa Inggeris", core: true },
        { time: "09.10 - 09.40", code: "BI", name: "Bahasa Inggeris", core: true },
        { time: "09.40 - 10.10", code: "REHAT", name: "Waktu Rehat", isBreak: true },
        { time: "10.10 - 10.40", code: "PK", name: "Pendidikan Kesihatan", core: false },
        { time: "10.40 - 11.10", code: "M3", name: "Matematik", core: true },
        { time: "11.10 - 11.40", code: "M3", name: "Matematik", core: true },
        { time: "11.40 - 12.10", code: "BM", name: "Bahasa Melayu", core: true }
      ],
      "JUMAAT": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "Program SEMAI" },
        { time: "07.10 - 07.40", code: "SN", name: "Sains", core: true },
        { time: "07.40 - 08.10", code: "SN", name: "Sains", core: true },
        { time: "08.10 - 08.40", code: "BA", name: "Bahasa Arab", core: false },
        { time: "08.40 - 09.10", code: "BA", name: "Bahasa Arab", core: false },
        { time: "09.10 - 09.40", code: "M3", name: "Matematik", core: true },
        { time: "09.40 - 10.10", code: "REHAT", name: "Waktu Rehat", isBreak: true },
        { time: "10.10 - 10.40", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "10.40 - 11.10", code: "BM", name: "Bahasa Melayu", core: true }
      ]
    }
  },

  "5 ARIF": {
    guruKelas: "En. Muhd. Huzaifah Arman",
    guruPembantu: "Cik Rozeline Francis",
    tahap: 2,
    rehatTime: "09.40 - 10.10",
    schedule: {
      "ISNIN": [
        { time: "07.00 - 07.40", code: "PERHIMPUNAN", name: "Perhimpunan Rasmi" },
        { time: "07.40 - 08.10", code: "PSV", name: "Pendidikan Seni Visual", core: false },
        { time: "08.10 - 08.40", code: "PSV", name: "Pendidikan Seni Visual", core: false },
        { time: "08.40 - 09.10", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "09.10 - 09.40", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "09.40 - 10.10", code: "REHAT", name: "Waktu Rehat", isBreak: true },
        { time: "10.10 - 10.40", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "10.40 - 11.10", code: "PI/PM", name: "Pendidikan Islam / Moral", core: false },
        { time: "11.10 - 11.40", code: "PI/PM", name: "Pendidikan Islam / Moral", core: false },
        { time: "11.40 - 12.10", code: "BA/BKD", name: "BA / BKD", core: false },
        { time: "12.10 - 12.40", code: "BA/BKD", name: "BA / BKD", core: false }
      ],
      "SELASA": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "Program SEMAI" },
        { time: "07.10 - 07.40", code: "PI/PM", name: "Pendidikan Islam / Moral", core: false },
        { time: "07.40 - 08.10", code: "PI/PM", name: "Pendidikan Islam / Moral", core: false },
        { time: "08.10 - 08.40", code: "SEJ", name: "Sejarah", core: false },
        { time: "08.40 - 09.10", code: "BI", name: "Bahasa Inggeris", core: true },
        { time: "09.10 - 09.40", code: "BI", name: "Bahasa Inggeris", core: true },
        { time: "09.40 - 10.10", code: "REHAT", name: "Waktu Rehat", isBreak: true },
        { time: "10.10 - 10.40", code: "M3", name: "Matematik", core: true },
        { time: "10.40 - 11.10", code: "M3", name: "Matematik", core: true },
        { time: "11.10 - 11.40", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "11.40 - 12.10", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "12.10 - 12.40", code: "PK", name: "Pendidikan Kesihatan", core: false }
      ],
      "RABU": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "Program SEMAI" },
        { time: "07.10 - 07.40", code: "SN", name: "Sains", core: true },
        { time: "07.40 - 08.10", code: "SN", name: "Sains", core: true },
        { time: "08.10 - 08.40", code: "M3", name: "Matematik", core: true },
        { time: "08.40 - 09.10", code: "M3", name: "Matematik", core: true },
        { time: "09.10 - 09.40", code: "PJ", name: "Pendidikan Jasmani", core: false },
        { time: "09.40 - 10.10", code: "REHAT", name: "Waktu Rehat", isBreak: true },
        { time: "10.10 - 10.40", code: "BI", name: "Bahasa Inggeris", core: true },
        { time: "10.40 - 11.10", code: "BI", name: "Bahasa Inggeris", core: true },
        { time: "11.10 - 11.40", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "11.40 - 12.10", code: "BM", name: "Bahasa Melayu", core: true }
      ],
      "KHAMIS": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "Program SEMAI" },
        { time: "07.10 - 07.40", code: "M3", name: "Matematik", core: true },
        { time: "07.40 - 08.10", code: "RBT", name: "Reka Bentuk & Teknologi", core: false },
        { time: "08.10 - 08.40", code: "RBT", name: "Reka Bentuk & Teknologi", core: false },
        { time: "08.40 - 09.10", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "09.10 - 09.40", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "09.40 - 10.10", code: "REHAT", name: "Waktu Rehat", isBreak: true },
        { time: "10.10 - 10.40", code: "SEJ", name: "Sejarah", core: false },
        { time: "10.40 - 11.10", code: "MZ", name: "Pendidikan Muzik", core: false },
        { time: "11.10 - 11.40", code: "BI", name: "Bahasa Inggeris", core: true },
        { time: "11.40 - 12.10", code: "BI", name: "Bahasa Inggeris", core: true },
        { time: "12.40 - 01.10", code: "TASMEK", name: "TASMEK", core: false }
      ],
      "JUMAAT": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "Program SEMAI" },
        { time: "07.10 - 07.40", code: "PJ", name: "Pendidikan Jasmani", core: false },
        { time: "07.40 - 08.10", code: "BI", name: "Bahasa Inggeris", core: true },
        { time: "08.10 - 08.40", code: "BI", name: "Bahasa Inggeris", core: true },
        { time: "08.40 - 09.10", code: "PI/PM", name: "Pendidikan Islam / Moral", core: false },
        { time: "09.10 - 09.40", code: "PI/PM", name: "Pendidikan Islam / Moral", core: false },
        { time: "09.40 - 10.10", code: "REHAT", name: "Waktu Rehat", isBreak: true },
        { time: "10.10 - 10.40", code: "SN", name: "Sains", core: true },
        { time: "10.40 - 11.10", code: "SN", name: "Sains", core: true }
      ]
    }
  },

  "5 BESTARI": {
    guruKelas: "Pn. Jamlinah Maliasan",
    guruPembantu: "En. Rejos Baking",
    tahap: 2,
    rehatTime: "09.40 - 10.10",
    schedule: {
      "ISNIN": [
        { time: "07.00 - 07.40", code: "PERHIMPUNAN", name: "Perhimpunan Rasmi" },
        { time: "07.40 - 08.10", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "08.10 - 08.40", code: "PK", name: "Pendidikan Kesihatan", core: false },
        { time: "08.40 - 09.10", code: "BI", name: "Bahasa Inggeris", core: true },
        { time: "09.10 - 09.40", code: "BI", name: "Bahasa Inggeris", core: true },
        { time: "09.40 - 10.10", code: "REHAT", name: "Waktu Rehat", isBreak: true },
        { time: "10.10 - 10.40", code: "M3", name: "Matematik", core: true },
        { time: "10.40 - 11.10", code: "M3", name: "Matematik", core: true },
        { time: "11.10 - 11.40", code: "PI", name: "Pendidikan Islam", core: false },
        { time: "11.40 - 12.10", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "12.10 - 12.40", code: "BM", name: "Bahasa Melayu", core: true }
      ],
      "SELASA": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "Program SEMAI" },
        { time: "07.10 - 07.40", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "07.40 - 08.10", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "08.10 - 08.40", code: "PI", name: "Pendidikan Islam", core: false },
        { time: "08.40 - 09.10", code: "BA", name: "Bahasa Arab", core: false },
        { time: "09.10 - 09.40", code: "BA", name: "Bahasa Arab", core: false },
        { time: "09.40 - 10.10", code: "REHAT", name: "Waktu Rehat", isBreak: true },
        { time: "10.10 - 10.40", code: "SN", name: "Sains", core: true },
        { time: "10.40 - 11.10", code: "BI", name: "Bahasa Inggeris", core: true },
        { time: "11.10 - 11.40", code: "BI", name: "Bahasa Inggeris", core: true },
        { time: "11.40 - 12.10", code: "M3", name: "Matematik", core: true },
        { time: "12.10 - 12.40", code: "M3", name: "Matematik", core: true }
      ],
      "RABU": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "Program SEMAI" },
        { time: "07.10 - 07.40", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "07.40 - 08.10", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "08.10 - 08.40", code: "PJ", name: "Pendidikan Jasmani", core: false },
        { time: "08.40 - 09.10", code: "BI", name: "Bahasa Inggeris", core: true },
        { time: "09.10 - 09.40", code: "BI", name: "Bahasa Inggeris", core: true },
        { time: "09.40 - 10.10", code: "REHAT", name: "Waktu Rehat", isBreak: true },
        { time: "10.10 - 10.40", code: "PI", name: "Pendidikan Islam", core: false },
        { time: "10.40 - 11.10", code: "PI", name: "Pendidikan Islam", core: false },
        { time: "11.10 - 11.40", code: "RBT", name: "Reka Bentuk & Teknologi", core: false },
        { time: "11.40 - 12.10", code: "RBT", name: "Reka Bentuk & Teknologi", core: false },
        { time: "12.40 - 01.10", code: "TASMEK", name: "TASMEK", core: false }
      ],
      "KHAMIS": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "Program SEMAI" },
        { time: "07.10 - 07.40", code: "SN", name: "Sains", core: true },
        { time: "07.40 - 08.10", code: "SN", name: "Sains", core: true },
        { time: "08.10 - 08.40", code: "BI", name: "Bahasa Inggeris", core: true },
        { time: "08.40 - 09.10", code: "BI", name: "Bahasa Inggeris", core: true },
        { time: "09.10 - 09.40", code: "PJ", name: "Pendidikan Jasmani", core: false },
        { time: "09.40 - 10.10", code: "REHAT", name: "Waktu Rehat", isBreak: true },
        { time: "10.10 - 10.40", code: "MZ", name: "Pendidikan Muzik", core: false },
        { time: "10.40 - 11.10", code: "PI", name: "Pendidikan Islam", core: false },
        { time: "11.10 - 11.40", code: "PI", name: "Pendidikan Islam", core: false },
        { time: "11.40 - 12.10", code: "SN", name: "Sains", core: true }
      ],
      "JUMAAT": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "Program SEMAI" },
        { time: "07.10 - 08.10", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "08.10 - 08.40", code: "M3", name: "Matematik", core: true },
        { time: "08.40 - 09.10", code: "PSV", name: "Pendidikan Seni Visual", core: false },
        { time: "09.10 - 09.40", code: "PSV", name: "Pendidikan Seni Visual", core: false },
        { time: "09.40 - 10.10", code: "REHAT", name: "Waktu Rehat", isBreak: true },
        { time: "10.10 - 10.40", code: "SEJ", name: "Sejarah", core: false },
        { time: "10.40 - 11.10", code: "SEJ", name: "Sejarah", core: false }
      ]
    }
  },

  "6 ARIF": {
    guruKelas: "Pn. Milnah Namih",
    guruPembantu: "En. L Asmara Luandim",
    tahap: 2,
    rehatTime: "09.40 - 10.10",
    schedule: {
      "ISNIN": [
        { time: "07.00 - 07.40", code: "PERHIMPUNAN", name: "Perhimpunan Rasmi" },
        { time: "07.40 - 08.10", code: "BA/BKD", name: "BA / BKD", core: false },
        { time: "08.10 - 08.40", code: "BI", name: "Bahasa Inggeris", core: true },
        { time: "08.40 - 09.10", code: "BI", name: "Bahasa Inggeris", core: true },
        { time: "09.10 - 09.40", code: "SEJ", name: "Sejarah", core: false },
        { time: "09.40 - 10.10", code: "REHAT", name: "Waktu Rehat", isBreak: true },
        { time: "10.10 - 10.40", code: "SN", name: "Sains", core: true },
        { time: "10.40 - 11.10", code: "SN", name: "Sains", core: true },
        { time: "11.10 - 11.40", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "11.40 - 12.10", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "12.10 - 12.40", code: "PI/PM", name: "Pendidikan Islam / Moral", core: false },
        { time: "12.40 - 01.40", code: "TASMEK", name: "TASMEK", core: false }
      ],
      "SELASA": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "Program SEMAI" },
        { time: "07.10 - 07.40", code: "BI", name: "Bahasa Inggeris", core: true },
        { time: "07.40 - 08.10", code: "BI", name: "Bahasa Inggeris", core: true },
        { time: "08.10 - 08.40", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "08.40 - 09.10", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "09.10 - 09.40", code: "SEJ", name: "Sejarah", core: false },
        { time: "09.40 - 10.10", code: "REHAT", name: "Waktu Rehat", isBreak: true },
        { time: "10.10 - 10.40", code: "M3", name: "Matematik", core: true },
        { time: "10.40 - 11.10", code: "M3", name: "Matematik", core: true },
        { time: "11.10 - 11.40", code: "RBT", name: "Reka Bentuk & Teknologi", core: false },
        { time: "11.40 - 12.10", code: "RBT", name: "Reka Bentuk & Teknologi", core: false },
        { time: "12.10 - 12.40", code: "BM", name: "Bahasa Melayu", core: true }
      ],
      "RABU": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "Program SEMAI" },
        { time: "07.10 - 07.40", code: "PSV", name: "Pendidikan Seni Visual", core: false },
        { time: "07.40 - 08.10", code: "PSV", name: "Pendidikan Seni Visual", core: false },
        { time: "08.10 - 08.40", code: "PI/PM", name: "Pendidikan Islam / Moral", core: false },
        { time: "08.40 - 09.10", code: "BI", name: "Bahasa Inggeris", core: true },
        { time: "09.10 - 09.40", code: "BI", name: "Bahasa Inggeris", core: true },
        { time: "09.40 - 10.10", code: "REHAT", name: "Waktu Rehat", isBreak: true },
        { time: "10.10 - 10.40", code: "PK", name: "Pendidikan Kesihatan", core: false },
        { time: "10.40 - 11.10", code: "BA/BKD", name: "BA / BKD", core: false },
        { time: "11.10 - 11.40", code: "M3", name: "Matematik", core: true },
        { time: "11.40 - 12.10", code: "MZ", name: "Pendidikan Muzik", core: false }
      ],
      "KHAMIS": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "Program SEMAI" },
        { time: "07.10 - 07.40", code: "SN", name: "Sains", core: true },
        { time: "07.40 - 08.10", code: "SN", name: "Sains", core: true },
        { time: "08.10 - 08.40", code: "BI", name: "Bahasa Inggeris", core: true },
        { time: "08.40 - 09.10", code: "BI", name: "Bahasa Inggeris", core: true },
        { time: "09.10 - 09.40", code: "PJ", name: "Pendidikan Jasmani", core: false },
        { time: "09.40 - 10.10", code: "REHAT", name: "Waktu Rehat", isBreak: true },
        { time: "10.10 - 10.40", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "10.40 - 11.10", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "11.10 - 11.40", code: "PI/PM", name: "Pendidikan Islam / Moral", core: false },
        { time: "11.40 - 12.10", code: "PI/PM", name: "Pendidikan Islam / Moral", core: false }
      ],
      "JUMAAT": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "Program SEMAI" },
        { time: "07.10 - 07.40", code: "M3", name: "Matematik", core: true },
        { time: "07.40 - 08.10", code: "M3", name: "Matematik", core: true },
        { time: "08.10 - 08.40", code: "PJ", name: "Pendidikan Jasmani", core: false },
        { time: "08.40 - 09.10", code: "PI/PM", name: "Pendidikan Islam / Moral", core: false },
        { time: "09.10 - 09.40", code: "PI/PM", name: "Pendidikan Islam / Moral", core: false },
        { time: "09.40 - 10.10", code: "REHAT", name: "Waktu Rehat", isBreak: true },
        { time: "10.10 - 10.40", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "10.40 - 11.10", code: "BM", name: "Bahasa Melayu", core: true }
      ]
    }
  },

  "6 BESTARI": {
    guruKelas: "Cik Rozie Sumil",
    guruPembantu: "Pn. Fatimah Daud",
    tahap: 2,
    rehatTime: "09.40 - 10.10",
    schedule: {
      "ISNIN": [
        { time: "07.00 - 07.40", code: "PERHIMPUNAN", name: "Perhimpunan Rasmi" },
        { time: "07.40 - 08.10", code: "SEJ", name: "Sejarah", core: false },
        { time: "08.10 - 08.40", code: "SEJ", name: "Sejarah", core: false },
        { time: "08.40 - 09.10", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "09.10 - 09.40", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "09.40 - 10.10", code: "REHAT", name: "Waktu Rehat", isBreak: true },
        { time: "10.10 - 10.40", code: "PK", name: "Pendidikan Kesihatan", core: false },
        { time: "10.40 - 11.10", code: "PI", name: "Pendidikan Islam", core: false },
        { time: "11.10 - 11.40", code: "PI", name: "Pendidikan Islam", core: false },
        { time: "11.40 - 12.10", code: "BI", name: "Bahasa Inggeris", core: true },
        { time: "12.10 - 12.40", code: "BI", name: "Bahasa Inggeris", core: true }
      ],
      "SELASA": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "Program SEMAI" },
        { time: "07.10 - 07.40", code: "M3", name: "Matematik", core: true },
        { time: "07.40 - 08.10", code: "M3", name: "Matematik", core: true },
        { time: "08.10 - 08.40", code: "BI", name: "Bahasa Inggeris", core: true },
        { time: "08.40 - 09.10", code: "BI", name: "Bahasa Inggeris", core: true },
        { time: "09.10 - 09.40", code: "PJ", name: "Pendidikan Jasmani", core: false },
        { time: "09.40 - 10.10", code: "REHAT", name: "Waktu Rehat", isBreak: true },
        { time: "10.10 - 10.40", code: "RBT", name: "Reka Bentuk & Teknologi", core: false },
        { time: "10.40 - 11.10", code: "SN", name: "Sains", core: true },
        { time: "11.10 - 11.40", code: "SN", name: "Sains", core: true },
        { time: "11.40 - 12.10", code: "PI", name: "Pendidikan Islam", core: false },
        { time: "12.10 - 12.40", code: "PI", name: "Pendidikan Islam", core: false }
      ],
      "RABU": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "Program SEMAI" },
        { time: "07.10 - 07.40", code: "PJ", name: "Pendidikan Jasmani", core: false },
        { time: "07.40 - 08.10", code: "SN", name: "Sains", core: true },
        { time: "08.10 - 08.40", code: "SN", name: "Sains", core: true },
        { time: "08.40 - 09.10", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "09.10 - 09.40", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "09.40 - 10.10", code: "REHAT", name: "Waktu Rehat", isBreak: true },
        { time: "10.10 - 10.40", code: "BA", name: "Bahasa Arab", core: false },
        { time: "10.40 - 11.10", code: "M3", name: "Matematik", core: true },
        { time: "11.10 - 11.40", code: "MZ", name: "Pendidikan Muzik", core: false },
        { time: "11.40 - 12.10", code: "PI", name: "Pendidikan Islam", core: false }
      ],
      "KHAMIS": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "Program SEMAI" },
        { time: "07.10 - 07.40", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "07.40 - 08.10", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "08.10 - 08.40", code: "M3", name: "Matematik", core: true },
        { time: "08.40 - 09.10", code: "M3", name: "Matematik", core: true },
        { time: "09.10 - 09.40", code: "PI", name: "Pendidikan Islam", core: false },
        { time: "09.40 - 10.10", code: "REHAT", name: "Waktu Rehat", isBreak: true },
        { time: "10.10 - 10.40", code: "RBT", name: "Reka Bentuk & Teknologi", core: false },
        { time: "10.40 - 11.10", code: "BI", name: "Bahasa Inggeris", core: true },
        { time: "11.10 - 11.40", code: "BI", name: "Bahasa Inggeris", core: true },
        { time: "11.40 - 12.10", code: "BA", name: "Bahasa Arab", core: false },
        { time: "12.40 - 01.10", code: "TASMEK", name: "TASMEK", core: false }
      ],
      "JUMAAT": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "Program SEMAI" },
        { time: "07.10 - 07.40", code: "PSV", name: "Pendidikan Seni Visual", core: false },
        { time: "07.40 - 08.10", code: "PSV", name: "Pendidikan Seni Visual", core: false },
        { time: "08.10 - 08.40", code: "BI", name: "Bahasa Inggeris", core: true },
        { time: "08.40 - 09.10", code: "BI", name: "Bahasa Inggeris", core: true },
        { time: "09.10 - 09.40", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "09.40 - 10.10", code: "REHAT", name: "Waktu Rehat", isBreak: true },
        { time: "10.10 - 10.40", code: "BM", name: "Bahasa Melayu", core: true },
        { time: "10.40 - 11.10", code: "BM", name: "Bahasa Melayu", core: true }
      ]
    }
  }
};
