// Data Jadual Waktu Persendirian Guru (26 Guru) SK Tampasuk 1
// Berkuat kuasa pada 07 SEPTEMBER 2026
const TEACHER_SCHEDULES = {
  "EN. MUDAH HJ. ADMAIM (GURU BESAR)": {
    jawatan: "Guru Besar",
    subjekList: "PI (5B)",
    totalWaktu: "6 Waktu (180 Minit)",
    schedule: {
      "ISNIN": [
        { time: "07.00 - 07.40", code: "PH", name: "Perhimpunan" },
        { time: "11.10 - 11.40", code: "PI 5B", name: "Pendidikan Islam 5B" }
      ],
      "SELASA": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "SEMAI" },
        { time: "08.10 - 08.40", code: "PI 5B", name: "Pendidikan Islam 5B" }
      ],
      "RABU": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "SEMAI" },
        { time: "10.10 - 10.40", code: "PI 5B", name: "Pendidikan Islam 5B" },
        { time: "10.40 - 11.10", code: "PI 5B", name: "Pendidikan Islam 5B" }
      ],
      "KHAMIS": [
        { time: "10.40 - 11.10", code: "PI 5B", name: "Pendidikan Islam 5B" },
        { time: "11.10 - 11.40", code: "PI 5B", name: "Pendidikan Islam 5B" }
      ],
      "JUMAAT": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "SEMAI" }
      ]
    }
  },

  "DATIN RAZANA HJ. ABD. WAHID (PK PENTADBIRAN)": {
    jawatan: "PK Pentadbiran",
    subjekList: "PM (3A, 5A)",
    totalWaktu: "12 Waktu (360 Minit)",
    schedule: {
      "ISNIN": [
        { time: "07.00 - 07.40", code: "PH", name: "Perhimpunan" },
        { time: "10.40 - 11.10", code: "PM 5A", name: "Pendidikan Moral 5A" },
        { time: "11.10 - 11.40", code: "PM 5A", name: "Pendidikan Moral 5A" }
      ],
      "SELASA": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "SEMAI" },
        { time: "07.10 - 07.40", code: "PM 5A", name: "Pendidikan Moral 5A" },
        { time: "07.40 - 08.10", code: "PM 5A", name: "Pendidikan Moral 5A" },
        { time: "08.40 - 09.10", code: "PM 3A", name: "Pendidikan Moral 3A" },
        { time: "09.10 - 09.40", code: "PM 3A", name: "Pendidikan Moral 3A" }
      ],
      "RABU": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "SEMAI" },
        { time: "10.10 - 10.40", code: "PM 3A", name: "Pendidikan Moral 3A" },
        { time: "10.40 - 11.10", code: "PM 3A", name: "Pendidikan Moral 3A" }
      ],
      "KHAMIS": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "SEMAI" },
        { time: "10.10 - 10.40", code: "PM 3A", name: "Pendidikan Moral 3A" },
        { time: "10.40 - 11.10", code: "PM 3A", name: "Pendidikan Moral 3A" }
      ],
      "JUMAAT": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "SEMAI" },
        { time: "08.40 - 09.10", code: "PM 5A", name: "Pendidikan Moral 5A" },
        { time: "09.10 - 09.40", code: "PM 5A", name: "Pendidikan Moral 5A" }
      ]
    }
  },

  "PN. HAMISAH JANAH (PK HEM)": {
    jawatan: "PK HEM",
    subjekList: "PM (1A, 6A)",
    totalWaktu: "12 Waktu (360 Minit)",
    schedule: {
      "ISNIN": [
        { time: "07.00 - 07.40", code: "PH", name: "Perhimpunan" },
        { time: "12.10 - 12.40", code: "PM 6A", name: "Pendidikan Moral 6A" }
      ],
      "SELASA": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "SEMAI" },
        { time: "11.40 - 12.10", code: "PM 1A", name: "Pendidikan Moral 1A" },
        { time: "12.10 - 12.40", code: "PM 1A", name: "Pendidikan Moral 1A" }
      ],
      "RABU": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "SEMAI" },
        { time: "08.10 - 08.40", code: "PM 6A", name: "Pendidikan Moral 6A" },
        { time: "11.10 - 11.40", code: "PM 1A", name: "Pendidikan Moral 1A" },
        { time: "11.40 - 12.10", code: "PM 1A", name: "Pendidikan Moral 1A" }
      ],
      "KHAMIS": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "SEMAI" },
        { time: "11.10 - 11.40", code: "PM 6A", name: "Pendidikan Moral 6A" },
        { time: "11.40 - 12.10", code: "PM 6A", name: "Pendidikan Moral 6A" }
      ],
      "JUMAAT": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "SEMAI" },
        { time: "07.10 - 07.40", code: "PM 1A", name: "Pendidikan Moral 1A" },
        { time: "07.40 - 08.10", code: "PM 1A", name: "Pendidikan Moral 1A" },
        { time: "08.40 - 09.10", code: "PM 6A", name: "Pendidikan Moral 6A" },
        { time: "09.10 - 09.40", code: "PM 6A", name: "Pendidikan Moral 6A" }
      ]
    }
  },

  "PN. JENNET GINDAWA (PK KOKURIKULUM)": {
    jawatan: "PK Kokurikulum",
    subjekList: "SN (1B, 5B), BKD (2A, 3A), MZ (5A)",
    totalWaktu: "12 Waktu (360 Minit)",
    schedule: {
      "ISNIN": [
        { time: "07.00 - 07.40", code: "PH", name: "Perhimpunan" },
        { time: "08.40 - 09.10", code: "BKD 3A", name: "BKD 3A" },
        { time: "09.10 - 09.40", code: "BKD 3A", name: "BKD 3A" }
      ],
      "SELASA": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "SEMAI" },
        { time: "10.10 - 10.40", code: "SN 5B", name: "Sains 5B" },
        { time: "11.40 - 12.10", code: "SN 1B", name: "Sains 1B" }
      ],
      "RABU": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "SEMAI" },
        { time: "10.40 - 11.10", code: "BKD 2A", name: "BKD 2A" },
        { time: "11.10 - 11.40", code: "BKD 2A", name: "BKD 2A" }
      ],
      "KHAMIS": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "SEMAI" },
        { time: "07.10 - 07.40", code: "SN 5B", name: "Sains 5B" },
        { time: "07.40 - 08.10", code: "SN 5B", name: "Sains 5B" },
        { time: "10.40 - 11.10", code: "MZ 5A", name: "Muzik 5A" },
        { time: "11.40 - 12.10", code: "SN 5B", name: "Sains 5B" }
      ],
      "JUMAAT": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "SEMAI" },
        { time: "08.10 - 08.40", code: "SN 1B", name: "Sains 1B" },
        { time: "08.40 - 09.10", code: "SN 1B", name: "Sains 1B" }
      ]
    }
  },

  "EN. AMRIEE ABDULLAH": {
    jawatan: "Guru Akademik",
    subjekList: "PM (2A), SEJ (5A, 5B, 6A, 6B), PSV (6A, 6B), PJK (1B, 4A), MZ (2A, 2B)",
    totalWaktu: "26 Waktu (780 Minit)",
    schedule: {
      "ISNIN": [
        { time: "07.00 - 07.40", code: "PH", name: "Perhimpunan" },
        { time: "07.40 - 08.10", code: "SEJ 6B", name: "Sejarah 6B" },
        { time: "08.10 - 08.40", code: "SEJ 6B", name: "Sejarah 6B" },
        { time: "09.10 - 09.40", code: "SEJ 6A", name: "Sejarah 6A" },
        { time: "10.10 - 10.40", code: "MZ 2A", name: "Muzik 2A" },
        { time: "11.10 - 11.40", code: "PK 1B", name: "Pendidikan Kesihatan 1B" },
        { time: "11.40 - 12.10", code: "PM 2A", name: "Pendidikan Moral 2A" },
        { time: "12.10 - 12.40", code: "PM 2A", name: "Pendidikan Moral 2A" }
      ],
      "SELASA": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "SEMAI" },
        { time: "08.10 - 08.40", code: "SEJ 5A", name: "Sejarah 5A" },
        { time: "09.10 - 09.40", code: "SEJ 6A", name: "Sejarah 6A" },
        { time: "10.10 - 10.40", code: "PM 2A", name: "Pendidikan Moral 2A" },
        { time: "10.40 - 11.10", code: "PM 2A", name: "Pendidikan Moral 2A" },
        { time: "11.10 - 11.40", code: "PK 4A", name: "Pendidikan Kesihatan 4A" }
      ],
      "RABU": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "SEMAI" },
        { time: "07.10 - 07.40", code: "PSV 6A", name: "PSV 6A" },
        { time: "07.40 - 08.10", code: "PSV 6A", name: "PSV 6A" },
        { time: "08.10 - 08.40", code: "PJ 4A", name: "PJ 4A" },
        { time: "09.10 - 09.40", code: "PJ 1B", name: "PJ 1B" }
      ],
      "KHAMIS": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "SEMAI" },
        { time: "07.10 - 07.40", code: "PJ 1B", name: "PJ 1B" },
        { time: "08.10 - 08.40", code: "MZ 2B", name: "Muzik 2B" },
        { time: "10.10 - 10.40", code: "SEJ 5A", name: "Sejarah 5A" },
        { time: "11.10 - 11.40", code: "PM 2A", name: "Pendidikan Moral 2A" },
        { time: "11.40 - 12.10", code: "PM 2A", name: "Pendidikan Moral 2A" }
      ],
      "JUMAAT": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "SEMAI" },
        { time: "07.10 - 07.40", code: "PSV 6B", name: "PSV 6B" },
        { time: "07.40 - 08.10", code: "PSV 6B", name: "PSV 6B" },
        { time: "08.10 - 08.40", code: "PJ 4A", name: "PJ 4A" },
        { time: "10.10 - 10.40", code: "SEJ 5B", name: "Sejarah 5B" },
        { time: "10.40 - 11.10", code: "SEJ 5B", name: "Sejarah 5B" }
      ]
    }
  },

  "PN. ANIDAH SAMAD": {
    jawatan: "Guru Kelas 4 Bestari",
    subjekList: "BM (4A, 4B), SEJ (4B), PSV (2A, 4A, 4B)",
    totalWaktu: "26 Waktu (780 Minit)",
    schedule: {
      "ISNIN": [
        { time: "07.00 - 07.40", code: "PH", name: "Perhimpunan" },
        { time: "07.40 - 08.10", code: "BM 4A", name: "Bahasa Melayu 4A" },
        { time: "08.10 - 08.40", code: "BM 4A", name: "Bahasa Melayu 4A" },
        { time: "10.40 - 11.10", code: "BM 4B", name: "Bahasa Melayu 4B" },
        { time: "11.10 - 11.40", code: "BM 4B", name: "Bahasa Melayu 4B" }
      ],
      "SELASA": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "SEMAI" },
        { time: "07.10 - 07.40", code: "BM 4A", name: "Bahasa Melayu 4A" },
        { time: "07.40 - 08.10", code: "BM 4A", name: "Bahasa Melayu 4A" },
        { time: "08.40 - 09.10", code: "BM 4B", name: "Bahasa Melayu 4B" },
        { time: "09.10 - 09.40", code: "BM 4B", name: "Bahasa Melayu 4B" }
      ],
      "RABU": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "SEMAI" },
        { time: "07.10 - 07.40", code: "BM 4B", name: "Bahasa Melayu 4B" },
        { time: "07.40 - 08.10", code: "BM 4B", name: "Bahasa Melayu 4B" },
        { time: "08.40 - 09.10", code: "BM 4A", name: "Bahasa Melayu 4A" },
        { time: "09.10 - 09.40", code: "BM 4A", name: "Bahasa Melayu 4A" },
        { time: "10.10 - 10.40", code: "SEJ 4B", name: "Sejarah 4B" },
        { time: "10.40 - 11.10", code: "SEJ 4B", name: "Sejarah 4B" }
      ],
      "KHAMIS": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "SEMAI" },
        { time: "07.40 - 08.10", code: "PSV 4B", name: "PSV 4B" },
        { time: "08.10 - 08.40", code: "PSV 4B", name: "PSV 4B" },
        { time: "09.10 - 09.40", code: "BM 4A", name: "Bahasa Melayu 4A" },
        { time: "10.10 - 10.40", code: "BM 4A", name: "Bahasa Melayu 4A" },
        { time: "10.40 - 11.10", code: "BM 4A", name: "Bahasa Melayu 4A" },
        { time: "11.40 - 12.10", code: "BM 4B", name: "Bahasa Melayu 4B" }
      ],
      "JUMAAT": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "SEMAI" },
        { time: "07.10 - 07.40", code: "PSV 4A", name: "PSV 4A" },
        { time: "07.40 - 08.10", code: "PSV 4A", name: "PSV 4A" },
        { time: "08.40 - 09.10", code: "PSV 2A", name: "PSV 2A" },
        { time: "09.10 - 09.40", code: "PSV 2A", name: "PSV 2A" },
        { time: "10.10 - 10.40", code: "BM 4B", name: "Bahasa Melayu 4B" },
        { time: "10.40 - 11.10", code: "BM 4B", name: "Bahasa Melayu 4B" }
      ]
    }
  },

  "PN. ANNA OCTAVIA NINTEH": {
    jawatan: "Guru Kelas 2 Bestari",
    subjekList: "M3 (1A, 2B, 4A, 6A), PSV (2B), MZ (1A, 1B)",
    totalWaktu: "26 Waktu (780 Minit)",
    schedule: {
      "ISNIN": [
        { time: "07.00 - 07.40", code: "PH", name: "Perhimpunan" },
        { time: "07.40 - 08.10", code: "M3 2B", name: "Matematik 2B" },
        { time: "08.10 - 08.40", code: "M3 2B", name: "Matematik 2B" },
        { time: "09.10 - 09.40", code: "MZ 1B", name: "Muzik 1B" },
        { time: "10.10 - 10.40", code: "M3 1A", name: "Matematik 1A" },
        { time: "10.40 - 11.10", code: "M3 1A", name: "Matematik 1A" },
        { time: "11.40 - 12.10", code: "M3 4A", name: "Matematik 4A" },
        { time: "12.10 - 12.40", code: "M3 4A", name: "Matematik 4A" }
      ],
      "SELASA": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "SEMAI" },
        { time: "08.10 - 08.40", code: "M3 4A", name: "Matematik 4A" },
        { time: "10.10 - 10.40", code: "M3 6A", name: "Matematik 6A" },
        { time: "10.40 - 11.10", code: "M3 6A", name: "Matematik 6A" },
        { time: "11.40 - 12.10", code: "M3 2B", name: "Matematik 2B" },
        { time: "12.10 - 12.40", code: "M3 2B", name: "Matematik 2B" }
      ],
      "RABU": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "SEMAI" },
        { time: "08.10 - 08.40", code: "MZ 1A", name: "Muzik 1A" },
        { time: "10.10 - 10.40", code: "M3 1A", name: "Matematik 1A" },
        { time: "10.40 - 11.10", code: "M3 1A", name: "Matematik 1A" },
        { time: "11.10 - 11.40", code: "M3 6A", name: "Matematik 6A" }
      ],
      "KHAMIS": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "SEMAI" },
        { time: "07.10 - 07.40", code: "M3 4A", name: "Matematik 4A" },
        { time: "07.40 - 08.10", code: "M3 4A", name: "Matematik 4A" },
        { time: "08.40 - 09.10", code: "PSV 2B", name: "PSV 2B" },
        { time: "09.10 - 09.40", code: "PSV 2B", name: "PSV 2B" },
        { time: "11.10 - 11.40", code: "M3 2B", name: "Matematik 2B" },
        { time: "11.40 - 12.10", code: "M3 2B", name: "Matematik 2B" }
      ],
      "JUMAAT": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "SEMAI" },
        { time: "07.10 - 07.40", code: "M3 6A", name: "Matematik 6A" },
        { time: "07.40 - 08.10", code: "M3 6A", name: "Matematik 6A" },
        { time: "08.40 - 09.10", code: "M3 1A", name: "Matematik 1A" },
        { time: "09.10 - 09.40", code: "M3 1A", name: "Matematik 1A" }
      ]
    }
  },

  "EN. DUIN LASIG (GURU DATA)": {
    jawatan: "Guru Data",
    subjekList: "MT (2A, 3A, 3B)",
    totalWaktu: "18 Waktu (540 Minit)",
    schedule: {
      "ISNIN": [
        { time: "07.00 - 07.40", code: "PH", name: "Perhimpunan" },
        { time: "08.40 - 09.10", code: "M3 3B", name: "Matematik 3B" },
        { time: "09.10 - 09.40", code: "M3 3B", name: "Matematik 3B" },
        { time: "11.40 - 12.10", code: "M3 3A", name: "Matematik 3A" },
        { time: "12.10 - 12.40", code: "M3 3A", name: "Matematik 3A" }
      ],
      "SELASA": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "SEMAI" },
        { time: "08.10 - 08.40", code: "M3 2A", name: "Matematik 2A" },
        { time: "08.40 - 09.10", code: "M3 2A", name: "Matematik 2A" },
        { time: "10.40 - 11.10", code: "M3 3A", name: "Matematik 3A" },
        { time: "11.10 - 11.40", code: "M3 3A", name: "Matematik 3A" }
      ],
      "RABU": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "SEMAI" },
        { time: "07.40 - 08.10", code: "M3 3A", name: "Matematik 3A" },
        { time: "08.10 - 08.40", code: "M3 3A", name: "Matematik 3A" },
        { time: "10.10 - 10.40", code: "M3 3B", name: "Matematik 3B" },
        { time: "10.40 - 11.10", code: "M3 3B", name: "Matematik 3B" }
      ],
      "KHAMIS": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "SEMAI" },
        { time: "08.40 - 09.10", code: "M3 2A", name: "Matematik 2A" },
        { time: "09.10 - 09.40", code: "M3 2A", name: "Matematik 2A" },
        { time: "11.10 - 11.40", code: "M3 3B", name: "Matematik 3B" },
        { time: "11.40 - 12.10", code: "M3 3B", name: "Matematik 3B" }
      ],
      "JUMAAT": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "SEMAI" },
        { time: "10.10 - 10.40", code: "M3 2A", name: "Matematik 2A" },
        { time: "10.40 - 11.10", code: "M3 2A", name: "Matematik 2A" }
      ]
    }
  },

  "PN. FATIMAH DAUD": {
    jawatan: "Guru Akademik",
    subjekList: "PI (2B, 4A, 6A, 6B), TASMEK (3A, 3B, 6A)",
    totalWaktu: "30 Waktu (900 Minit)",
    schedule: {
      "ISNIN": [
        { time: "07.00 - 07.40", code: "PH", name: "Perhimpunan" },
        { time: "08.40 - 09.10", code: "PI 2B", name: "Pendidikan Islam 2B" },
        { time: "09.10 - 09.40", code: "PI 2B", name: "Pendidikan Islam 2B" },
        { time: "10.40 - 11.10", code: "PI 6B", name: "Pendidikan Islam 6B" },
        { time: "11.10 - 11.40", code: "PI 6B", name: "Pendidikan Islam 6B" },
        { time: "12.10 - 12.40", code: "PI 6A", name: "Pendidikan Islam 6A" },
        { time: "12.40 - 01.40", code: "TASMEK 6A", name: "TASMEK 6A" }
      ],
      "SELASA": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "SEMAI" },
        { time: "08.40 - 09.10", code: "PI 4A", name: "Pendidikan Islam 4A" },
        { time: "09.10 - 09.40", code: "PI 4A", name: "Pendidikan Islam 4A" },
        { time: "10.10 - 10.40", code: "PI 2B", name: "Pendidikan Islam 2B" },
        { time: "10.40 - 11.10", code: "PI 2B", name: "Pendidikan Islam 2B" },
        { time: "11.40 - 12.10", code: "PI 6B", name: "Pendidikan Islam 6B" },
        { time: "12.10 - 12.40", code: "PI 6B", name: "Pendidikan Islam 6B" },
        { time: "12.40 - 01.40", code: "TASMEK 3A", name: "TASMEK 3A" }
      ],
      "RABU": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "SEMAI" },
        { time: "08.10 - 08.40", code: "PI 6A", name: "Pendidikan Islam 6A" },
        { time: "10.10 - 10.40", code: "PI 4A", name: "Pendidikan Islam 4A" },
        { time: "10.40 - 11.10", code: "PI 4A", name: "Pendidikan Islam 4A" },
        { time: "11.40 - 12.10", code: "PI 6B", name: "Pendidikan Islam 6B" },
        { time: "12.40 - 01.10", code: "TASMEK 3B", name: "TASMEK 3B" }
      ],
      "KHAMIS": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "SEMAI" },
        { time: "08.10 - 08.40", code: "PI 4A", name: "Pendidikan Islam 4A" },
        { time: "08.40 - 09.10", code: "PI 4A", name: "Pendidikan Islam 4A" },
        { time: "09.10 - 09.40", code: "PI 6B", name: "Pendidikan Islam 6B" },
        { time: "11.10 - 11.40", code: "PI 6A", name: "Pendidikan Islam 6A" },
        { time: "11.40 - 12.10", code: "PI 6A", name: "Pendidikan Islam 6A" }
      ],
      "JUMAAT": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "SEMAI" },
        { time: "07.10 - 07.40", code: "PI 2B", name: "Pendidikan Islam 2B" },
        { time: "07.40 - 08.10", code: "PI 2B", name: "Pendidikan Islam 2B" },
        { time: "08.40 - 09.10", code: "PI 6A", name: "Pendidikan Islam 6A" },
        { time: "09.10 - 09.40", code: "PI 6A", name: "Pendidikan Islam 6A" }
      ]
    }
  },

  "EN. GEORGE SIMUN": {
    jawatan: "Guru Kelas 1 Bestari",
    subjekList: "BM (1B, 2B), MZ (5B)",
    totalWaktu: "25 Waktu (750 Minit)",
    schedule: {
      "ISNIN": [
        { time: "07.00 - 07.40", code: "PH", name: "Perhimpunan" },
        { time: "07.40 - 08.10", code: "BM 1B", name: "Bahasa Melayu 1B" },
        { time: "08.10 - 08.40", code: "BM 1B", name: "Bahasa Melayu 1B" },
        { time: "08.40 - 09.10", code: "BM 1B", name: "Bahasa Melayu 1B" },
        { time: "11.10 - 11.40", code: "BM 2B", name: "Bahasa Melayu 2B" },
        { time: "11.40 - 12.10", code: "BM 2B", name: "Bahasa Melayu 2B" }
      ],
      "SELASA": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "SEMAI" },
        { time: "07.10 - 07.40", code: "BM 1B", name: "Bahasa Melayu 1B" },
        { time: "08.40 - 09.10", code: "BM 2B", name: "Bahasa Melayu 2B" },
        { time: "09.10 - 09.40", code: "BM 2B", name: "Bahasa Melayu 2B" },
        { time: "11.10 - 11.40", code: "BM 2B", name: "Bahasa Melayu 2B" },
        { time: "11.40 - 12.10", code: "BM 1B", name: "Bahasa Melayu 1B" },
        { time: "12.10 - 12.40", code: "BM 1B", name: "Bahasa Melayu 1B" }
      ],
      "RABU": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "SEMAI" },
        { time: "07.10 - 07.40", code: "BM 2B", name: "Bahasa Melayu 2B" },
        { time: "07.40 - 08.10", code: "BM 2B", name: "Bahasa Melayu 2B" },
        { time: "10.10 - 10.40", code: "BM 1B", name: "Bahasa Melayu 1B" },
        { time: "10.40 - 11.10", code: "BM 1B", name: "Bahasa Melayu 1B" }
      ],
      "KHAMIS": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "SEMAI" },
        { time: "07.10 - 07.40", code: "BM 2B", name: "Bahasa Melayu 2B" },
        { time: "07.40 - 08.10", code: "BM 2B", name: "Bahasa Melayu 2B" },
        { time: "10.10 - 10.40", code: "MZ 5B", name: "Muzik 5B" },
        { time: "11.10 - 11.40", code: "BM 1B", name: "Bahasa Melayu 1B" },
        { time: "11.40 - 12.10", code: "BM 1B", name: "Bahasa Melayu 1B" }
      ],
      "JUMAAT": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "SEMAI" },
        { time: "07.10 - 07.40", code: "BM 1B", name: "Bahasa Melayu 1B" },
        { time: "07.40 - 08.10", code: "BM 1B", name: "Bahasa Melayu 1B" },
        { time: "08.40 - 09.10", code: "BM 2B", name: "Bahasa Melayu 2B" },
        { time: "09.10 - 09.40", code: "BM 2B", name: "Bahasa Melayu 2B" },
        { time: "10.10 - 10.40", code: "BM 2B", name: "Bahasa Melayu 2B" }
      ]
    }
  },

  "PN. JAMLINAH MALIASAN": {
    jawatan: "Guru Kelas 5 Bestari",
    subjekList: "BM (5B, 6B), PM (4A)",
    totalWaktu: "24 Waktu (720 Minit)",
    schedule: {
      "ISNIN": [
        { time: "07.00 - 07.40", code: "PH", name: "Perhimpunan" },
        { time: "07.40 - 08.10", code: "BM 5B", name: "Bahasa Melayu 5B" },
        { time: "08.40 - 09.10", code: "BM 6B", name: "Bahasa Melayu 6B" },
        { time: "09.10 - 09.40", code: "BM 6B", name: "Bahasa Melayu 6B" },
        { time: "11.40 - 12.10", code: "BM 5B", name: "Bahasa Melayu 5B" },
        { time: "12.10 - 12.40", code: "BM 5B", name: "Bahasa Melayu 5B" }
      ],
      "SELASA": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "SEMAI" },
        { time: "07.10 - 07.40", code: "BM 5B", name: "Bahasa Melayu 5B" },
        { time: "07.40 - 08.10", code: "BM 5B", name: "Bahasa Melayu 5B" },
        { time: "08.40 - 09.10", code: "PM 4A", name: "Pendidikan Moral 4A" },
        { time: "09.10 - 09.40", code: "PM 4A", name: "Pendidikan Moral 4A" }
      ],
      "RABU": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "SEMAI" },
        { time: "07.10 - 07.40", code: "BM 5B", name: "Bahasa Melayu 5B" },
        { time: "07.40 - 08.10", code: "BM 5B", name: "Bahasa Melayu 5B" },
        { time: "08.40 - 09.10", code: "BM 6B", name: "Bahasa Melayu 6B" },
        { time: "09.10 - 09.40", code: "BM 6B", name: "Bahasa Melayu 6B" },
        { time: "10.10 - 10.40", code: "PM 4A", name: "Pendidikan Moral 4A" },
        { time: "10.40 - 11.10", code: "PM 4A", name: "Pendidikan Moral 4A" }
      ],
      "KHAMIS": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "SEMAI" },
        { time: "07.10 - 07.40", code: "BM 6B", name: "Bahasa Melayu 6B" },
        { time: "07.40 - 08.10", code: "BM 6B", name: "Bahasa Melayu 6B" },
        { time: "08.10 - 08.40", code: "PM 4A", name: "Pendidikan Moral 4A" },
        { time: "08.40 - 09.10", code: "PM 4A", name: "Pendidikan Moral 4A" }
      ],
      "JUMAAT": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "SEMAI" },
        { time: "07.10 - 07.40", code: "BM 5B", name: "Bahasa Melayu 5B" },
        { time: "07.40 - 08.10", code: "BM 5B", name: "Bahasa Melayu 5B" },
        { time: "09.10 - 09.40", code: "BM 6B", name: "Bahasa Melayu 6B" },
        { time: "10.10 - 10.40", code: "BM 6B", name: "Bahasa Melayu 6B" },
        { time: "10.40 - 11.10", code: "BM 6B", name: "Bahasa Melayu 6B" }
      ]
    }
  },

  "PN. KASMALAH ISMAIL": {
    jawatan: "Guru Kelas 2 Arif",
    subjekList: "BM (1A, 2A), SEJ (4A)",
    totalWaktu: "26 Waktu (780 Minit)",
    schedule: {
      "ISNIN": [
        { time: "07.00 - 07.40", code: "PH", name: "Perhimpunan" },
        { time: "07.40 - 08.10", code: "BM 1A", name: "Bahasa Melayu 1A" },
        { time: "08.10 - 08.40", code: "BM 1A", name: "Bahasa Melayu 1A" },
        { time: "10.40 - 11.10", code: "BM 2A", name: "Bahasa Melayu 2A" },
        { time: "11.10 - 11.40", code: "BM 2A", name: "Bahasa Melayu 2A" },
        { time: "12.10 - 12.40", code: "BM 1A", name: "Bahasa Melayu 1A" }
      ],
      "SELASA": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "SEMAI" },
        { time: "07.10 - 07.40", code: "BM 2A", name: "Bahasa Melayu 2A" },
        { time: "07.40 - 08.10", code: "BM 2A", name: "Bahasa Melayu 2A" },
        { time: "09.10 - 09.40", code: "BM 1A", name: "Bahasa Melayu 1A" },
        { time: "10.10 - 10.40", code: "BM 1A", name: "Bahasa Melayu 1A" },
        { time: "10.40 - 11.10", code: "BM 1A", name: "Bahasa Melayu 1A" },
        { time: "11.10 - 11.40", code: "BM 2A", name: "Bahasa Melayu 2A" }
      ],
      "RABU": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "SEMAI" },
        { time: "07.10 - 07.40", code: "BM 1A", name: "Bahasa Melayu 1A" },
        { time: "07.40 - 08.10", code: "BM 1A", name: "Bahasa Melayu 1A" },
        { time: "08.40 - 09.10", code: "BM 2A", name: "Bahasa Melayu 2A" },
        { time: "09.10 - 09.40", code: "BM 2A", name: "Bahasa Melayu 2A" },
        { time: "10.10 - 10.40", code: "BM 2A", name: "Bahasa Melayu 2A" },
        { time: "11.10 - 11.40", code: "SEJ 4A", name: "Sejarah 4A" },
        { time: "11.40 - 12.10", code: "SEJ 4A", name: "Sejarah 4A" }
      ],
      "KHAMIS": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "SEMAI" },
        { time: "08.40 - 09.10", code: "BM 1A", name: "Bahasa Melayu 1A" },
        { time: "09.10 - 09.40", code: "BM 1A", name: "Bahasa Melayu 1A" },
        { time: "10.10 - 10.40", code: "BM 2A", name: "Bahasa Melayu 2A" },
        { time: "10.40 - 11.10", code: "BM 2A", name: "Bahasa Melayu 2A" }
      ],
      "JUMAAT": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "SEMAI" },
        { time: "07.10 - 07.40", code: "BM 2A", name: "Bahasa Melayu 2A" },
        { time: "07.40 - 08.10", code: "BM 2A", name: "Bahasa Melayu 2A" },
        { time: "10.10 - 10.40", code: "BM 1A", name: "Bahasa Melayu 1A" },
        { time: "10.40 - 11.10", code: "BM 1A", name: "Bahasa Melayu 1A" }
      ]
    }
  },

  "EN. L ASMARA LUANDIM": {
    jawatan: "Guru Akademik",
    subjekList: "BM (5A, 6A), PJK (3A, 3B), PSV (3B)",
    totalWaktu: "26 Waktu (780 Minit)",
    schedule: {
      "ISNIN": [
        { time: "07.00 - 07.40", code: "PH", name: "Perhimpunan" },
        { time: "08.40 - 09.10", code: "BM 5A", name: "Bahasa Melayu 5A" },
        { time: "09.10 - 09.40", code: "BM 5A", name: "Bahasa Melayu 5A" },
        { time: "10.10 - 10.40", code: "BM 5A", name: "Bahasa Melayu 5A" },
        { time: "11.10 - 11.40", code: "BM 6A", name: "Bahasa Melayu 6A" },
        { time: "11.40 - 12.10", code: "BM 6A", name: "Bahasa Melayu 6A" }
      ],
      "SELASA": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "SEMAI" },
        { time: "08.10 - 08.40", code: "BM 6A", name: "Bahasa Melayu 6A" },
        { time: "08.40 - 09.10", code: "BM 6A", name: "Bahasa Melayu 6A" },
        { time: "09.10 - 09.40", code: "PK 3B", name: "Pendidikan Kesihatan 3B" },
        { time: "11.10 - 11.40", code: "BM 5A", name: "Bahasa Melayu 5A" },
        { time: "11.40 - 12.10", code: "BM 5A", name: "Bahasa Melayu 5A" },
        { time: "12.10 - 12.40", code: "BM 6A", name: "Bahasa Melayu 6A" }
      ],
      "RABU": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "SEMAI" },
        { time: "07.10 - 07.40", code: "PJ 3A", name: "PJ 3A" },
        { time: "08.10 - 08.40", code: "PJ 3B", name: "PJ 3B" },
        { time: "11.10 - 11.40", code: "BM 5A", name: "Bahasa Melayu 5A" },
        { time: "11.40 - 12.10", code: "BM 5A", name: "Bahasa Melayu 5A" }
      ],
      "KHAMIS": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "SEMAI" },
        { time: "07.10 - 07.40", code: "PSV 3B", name: "PSV 3B" },
        { time: "07.40 - 08.10", code: "PSV 3B", name: "PSV 3B" },
        { time: "08.40 - 09.10", code: "BM 5A", name: "Bahasa Melayu 5A" },
        { time: "09.10 - 09.40", code: "BM 5A", name: "Bahasa Melayu 5A" },
        { time: "10.10 - 10.40", code: "BM 6A", name: "Bahasa Melayu 6A" },
        { time: "10.40 - 11.10", code: "BM 6A", name: "Bahasa Melayu 6A" },
        { time: "11.10 - 11.40", code: "PK 3A", name: "Pendidikan Kesihatan 3A" }
      ],
      "JUMAAT": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "SEMAI" },
        { time: "08.10 - 08.40", code: "PJ 3A", name: "PJ 3A" },
        { time: "09.10 - 09.40", code: "PJ 3B", name: "PJ 3B" },
        { time: "10.10 - 10.40", code: "BM 6A", name: "Bahasa Melayu 6A" },
        { time: "10.40 - 11.10", code: "BM 6A", name: "Bahasa Melayu 6A" }
      ]
    }
  },

  "PN. MASTIKAJUNAIDAH SHAHROM": {
    jawatan: "Guru Kelas 1 Arif",
    subjekList: "PI (1A, 1B, 2A), TASMEK (1A, 1B, 2A, 2B), PI PRA",
    totalWaktu: "30 Waktu (900 Minit)",
    schedule: {
      "ISNIN": [
        { time: "07.00 - 07.40", code: "PH", name: "Perhimpunan" },
        { time: "11.40 - 12.10", code: "PI 2A", name: "Pendidikan Islam 2A" },
        { time: "12.10 - 12.40", code: "PI 2A", name: "Pendidikan Islam 2A" }
      ],
      "SELASA": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "SEMAI" },
        { time: "07.40 - 08.10", code: "PI 1B", name: "Pendidikan Islam 1B" },
        { time: "08.10 - 08.40", code: "PI 1B", name: "Pendidikan Islam 1B" },
        { time: "10.10 - 10.40", code: "PI 2A", name: "Pendidikan Islam 2A" },
        { time: "10.40 - 11.10", code: "PI 2A", name: "Pendidikan Islam 2A" },
        { time: "11.40 - 12.10", code: "PI 1A", name: "Pendidikan Islam 1A" },
        { time: "12.10 - 12.40", code: "PI 1A", name: "Pendidikan Islam 1A" }
      ],
      "RABU": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "SEMAI" },
        { time: "08.10 - 08.40", code: "PI 1B", name: "Pendidikan Islam 1B" },
        { time: "08.40 - 09.10", code: "PI 1B", name: "Pendidikan Islam 1B" },
        { time: "11.10 - 11.40", code: "PI 1A", name: "Pendidikan Islam 1A" },
        { time: "11.40 - 12.10", code: "PI 1A", name: "Pendidikan Islam 1A" }
      ],
      "KHAMIS": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "SEMAI" },
        { time: "07.40 - 08.10", code: "PI 1B", name: "Pendidikan Islam 1B" },
        { time: "08.10 - 08.40", code: "PI 1B", name: "Pendidikan Islam 1B" },
        { time: "11.10 - 11.40", code: "PI 2A", name: "Pendidikan Islam 2A" },
        { time: "11.40 - 12.10", code: "PI 2A", name: "Pendidikan Islam 2A" },
        { time: "12.40 - 01.10", code: "TASMEK 1B", name: "TASMEK 1B" }
      ],
      "JUMAAT": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "SEMAI" },
        { time: "07.10 - 07.40", code: "PI 1A", name: "Pendidikan Islam 1A" },
        { time: "07.40 - 08.10", code: "PI 1A", name: "Pendidikan Islam 1A" }
      ]
    }
  },

  "PN. MILNAH NAMIH": {
    jawatan: "Guru Kelas 6 Arif",
    subjekList: "BI (4A, 5A, 6A), RBT (4A)",
    totalWaktu: "26 Waktu (780 Minit)",
    schedule: {
      "ISNIN": [
        { time: "07.00 - 07.40", code: "PH", name: "Perhimpunan" },
        { time: "08.10 - 08.40", code: "BI 6A", name: "Bahasa Inggeris 6A" },
        { time: "08.40 - 09.10", code: "BI 6A", name: "Bahasa Inggeris 6A" },
        { time: "10.10 - 10.40", code: "BI 4A", name: "Bahasa Inggeris 4A" },
        { time: "10.40 - 11.10", code: "BI 4A", name: "Bahasa Inggeris 4A" }
      ],
      "SELASA": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "SEMAI" },
        { time: "07.10 - 07.40", code: "BI 6A", name: "Bahasa Inggeris 6A" },
        { time: "07.40 - 08.10", code: "BI 6A", name: "Bahasa Inggeris 6A" },
        { time: "08.40 - 09.10", code: "BI 5A", name: "Bahasa Inggeris 5A" },
        { time: "09.10 - 09.40", code: "BI 5A", name: "Bahasa Inggeris 5A" },
        { time: "10.10 - 10.40", code: "BI 4A", name: "Bahasa Inggeris 4A" },
        { time: "10.40 - 11.10", code: "BI 4A", name: "Bahasa Inggeris 4A" }
      ],
      "RABU": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "SEMAI" },
        { time: "07.10 - 07.40", code: "BI 4A", name: "Bahasa Inggeris 4A" },
        { time: "07.40 - 08.10", code: "BI 4A", name: "Bahasa Inggeris 4A" },
        { time: "08.40 - 09.10", code: "BI 6A", name: "Bahasa Inggeris 6A" },
        { time: "09.10 - 09.40", code: "BI 6A", name: "Bahasa Inggeris 6A" },
        { time: "10.10 - 10.40", code: "BI 5A", name: "Bahasa Inggeris 5A" },
        { time: "10.40 - 11.10", code: "BI 5A", name: "Bahasa Inggeris 5A" }
      ],
      "KHAMIS": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "SEMAI" },
        { time: "08.10 - 08.40", code: "BI 6A", name: "Bahasa Inggeris 6A" },
        { time: "08.40 - 09.10", code: "BI 6A", name: "Bahasa Inggeris 6A" },
        { time: "11.10 - 11.40", code: "BI 5A", name: "Bahasa Inggeris 5A" },
        { time: "11.40 - 12.10", code: "BI 5A", name: "Bahasa Inggeris 5A" }
      ],
      "JUMAAT": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "SEMAI" },
        { time: "07.40 - 08.10", code: "BI 5A", name: "Bahasa Inggeris 5A" },
        { time: "08.10 - 08.40", code: "BI 5A", name: "Bahasa Inggeris 5A" },
        { time: "08.40 - 09.10", code: "BI 4A", name: "Bahasa Inggeris 4A" },
        { time: "09.10 - 09.40", code: "BI 4A", name: "Bahasa Inggeris 4A" },
        { time: "10.10 - 10.40", code: "RBT 4A", name: "RBT 4A" },
        { time: "10.40 - 11.10", code: "RBT 4A", name: "RBT 4A" }
      ]
    }
  },

  "EN. MOHD. HAFIZ QAYYUM AHMAD": {
    jawatan: "Guru Kelas 4 Arif",
    subjekList: "SN (1A, 4A, 4B, 5A), RBT (5A, 5B, 6A, 6B), PJK (5B)",
    totalWaktu: "26 Waktu (780 Minit)",
    schedule: {
      "ISNIN": [
        { time: "07.00 - 07.40", code: "PH", name: "Perhimpunan" },
        { time: "08.10 - 08.40", code: "PK 5B", name: "Pendidikan Kesihatan 5B" },
        { time: "08.40 - 09.10", code: "SN 4A", name: "Sains 4A" },
        { time: "09.10 - 09.40", code: "SN 4A", name: "Sains 4A" },
        { time: "11.10 - 11.40", code: "SN 1A", name: "Sains 1A" },
        { time: "11.40 - 12.10", code: "SN 1A", name: "Sains 1A" }
      ],
      "SELASA": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "SEMAI" },
        { time: "07.10 - 07.40", code: "SN 4B", name: "Sains 4B" },
        { time: "07.40 - 08.10", code: "SN 4B", name: "Sains 4B" },
        { time: "08.40 - 09.10", code: "SN 1A", name: "Sains 1A" },
        { time: "10.10 - 10.40", code: "RBT 6B", name: "RBT 6B" },
        { time: "11.10 - 11.40", code: "RBT 6A", name: "RBT 6A" },
        { time: "11.40 - 12.10", code: "RBT 6A", name: "RBT 6A" }
      ],
      "RABU": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "SEMAI" },
        { time: "07.10 - 07.40", code: "SN 5A", name: "Sains 5A" },
        { time: "07.40 - 08.10", code: "SN 5A", name: "Sains 5A" },
        { time: "08.10 - 08.40", code: "PJ 5B", name: "PJ 5B" },
        { time: "11.10 - 11.40", code: "RBT 5B", name: "RBT 5B" },
        { time: "11.40 - 12.10", code: "RBT 5B", name: "RBT 5B" }
      ],
      "KHAMIS": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "SEMAI" },
        { time: "07.40 - 08.10", code: "RBT 5A", name: "RBT 5A" },
        { time: "08.10 - 08.40", code: "RBT 5A", name: "RBT 5A" },
        { time: "09.10 - 09.40", code: "PJ 5B", name: "PJ 5B" },
        { time: "10.10 - 10.40", code: "RBT 6B", name: "RBT 6B" },
        { time: "11.10 - 11.40", code: "SN 4A", name: "Sains 4A" },
        { time: "11.40 - 12.10", code: "SN 4A", name: "Sains 4A" }
      ],
      "JUMAAT": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "SEMAI" },
        { time: "07.10 - 07.40", code: "SN 4B", name: "Sains 4B" },
        { time: "07.40 - 08.10", code: "SN 4B", name: "Sains 4B" },
        { time: "10.10 - 10.40", code: "SN 5A", name: "Sains 5A" },
        { time: "10.40 - 11.10", code: "SN 5A", name: "Sains 5A" }
      ]
    }
  },

  "PN. MUHAYAN DIMAN": {
    jawatan: "Guru Kelas 3 Arif",
    subjekList: "BM (3A, 3B), PSV (3A)",
    totalWaktu: "26 Waktu (780 Minit)",
    schedule: {
      "ISNIN": [
        { time: "07.00 - 07.40", code: "PH", name: "Perhimpunan" },
        { time: "07.40 - 08.10", code: "BM 3A", name: "Bahasa Melayu 3A" },
        { time: "08.10 - 08.40", code: "BM 3A", name: "Bahasa Melayu 3A" },
        { time: "10.10 - 10.40", code: "BM 3B", name: "Bahasa Melayu 3B" },
        { time: "10.40 - 11.10", code: "BM 3B", name: "Bahasa Melayu 3B" },
        { time: "11.10 - 11.40", code: "BM 3A", name: "Bahasa Melayu 3A" }
      ],
      "SELASA": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "SEMAI" },
        { time: "07.40 - 08.10", code: "BM 3A", name: "Bahasa Melayu 3A" },
        { time: "08.10 - 08.40", code: "BM 3A", name: "Bahasa Melayu 3A" },
        { time: "10.10 - 10.40", code: "BM 3A", name: "Bahasa Melayu 3A" },
        { time: "11.10 - 11.40", code: "BM 3B", name: "Bahasa Melayu 3B" },
        { time: "11.40 - 12.10", code: "BM 3B", name: "Bahasa Melayu 3B" }
      ],
      "RABU": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "SEMAI" },
        { time: "07.10 - 07.40", code: "BM 3B", name: "Bahasa Melayu 3B" },
        { time: "07.40 - 08.10", code: "BM 3B", name: "Bahasa Melayu 3B" },
        { time: "08.40 - 09.10", code: "BM 3A", name: "Bahasa Melayu 3A" },
        { time: "09.10 - 09.40", code: "BM 3A", name: "Bahasa Melayu 3A" },
        { time: "11.10 - 11.40", code: "BM 3B", name: "Bahasa Melayu 3B" },
        { time: "11.40 - 12.10", code: "BM 3B", name: "Bahasa Melayu 3B" }
      ],
      "KHAMIS": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "SEMAI" },
        { time: "07.40 - 08.10", code: "BM 3A", name: "Bahasa Melayu 3A" },
        { time: "08.10 - 08.40", code: "BM 3A", name: "Bahasa Melayu 3A" },
        { time: "10.10 - 10.40", code: "BM 3B", name: "Bahasa Melayu 3B" },
        { time: "10.40 - 11.10", code: "BM 3B", name: "Bahasa Melayu 3B" }
      ],
      "JUMAAT": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "SEMAI" },
        { time: "07.10 - 07.40", code: "PSV 3A", name: "PSV 3A" },
        { time: "07.40 - 08.10", code: "PSV 3A", name: "PSV 3A" },
        { time: "08.40 - 09.10", code: "BM 3A", name: "Bahasa Melayu 3A" },
        { time: "09.10 - 09.40", code: "BM 3A", name: "Bahasa Melayu 3A" },
        { time: "10.10 - 10.40", code: "BM 3B", name: "Bahasa Melayu 3B" },
        { time: "10.40 - 11.10", code: "BM 3B", name: "Bahasa Melayu 3B" }
      ]
    }
  },

  "EN. MUHD. HUZAIFAH ARMAN": {
    jawatan: "Guru Kelas 5 Arif",
    subjekList: "PI (3A, 3B, 4B, 5A), TASMEK (4A, 4B, 5A, 5B)",
    totalWaktu: "32 Waktu (930 Minit)",
    schedule: {
      "ISNIN": [
        { time: "07.00 - 07.40", code: "PH", name: "Perhimpunan" },
        { time: "07.40 - 08.10", code: "PI 3B", name: "Pendidikan Islam 3B" },
        { time: "08.10 - 08.40", code: "PI 3B", name: "Pendidikan Islam 3B" },
        { time: "10.10 - 10.40", code: "PI 4B", name: "Pendidikan Islam 4B" },
        { time: "10.40 - 11.10", code: "PI 5A", name: "Pendidikan Islam 5A" },
        { time: "11.10 - 11.40", code: "PI 5A", name: "Pendidikan Islam 5A" }
      ],
      "SELASA": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "SEMAI" },
        { time: "07.10 - 07.40", code: "PI 5A", name: "Pendidikan Islam 5A" },
        { time: "07.40 - 08.10", code: "PI 5A", name: "Pendidikan Islam 5A" },
        { time: "08.40 - 09.10", code: "PI 3A", name: "Pendidikan Islam 3A" },
        { time: "09.10 - 09.40", code: "PI 3A", name: "Pendidikan Islam 3A" },
        { time: "10.40 - 11.10", code: "PI 4B", name: "Pendidikan Islam 4B" },
        { time: "11.10 - 11.40", code: "PI 4B", name: "Pendidikan Islam 4B" }
      ],
      "RABU": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "SEMAI" },
        { time: "07.10 - 07.40", code: "PI 4B", name: "Pendidikan Islam 4B" },
        { time: "07.40 - 08.10", code: "PI 4B", name: "Pendidikan Islam 4B" },
        { time: "08.40 - 09.10", code: "PI 4B", name: "Pendidikan Islam 4B" },
        { time: "09.10 - 09.40", code: "PI 4B", name: "Pendidikan Islam 4B" },
        { time: "10.10 - 10.40", code: "PI 3A", name: "Pendidikan Islam 3A" },
        { time: "10.40 - 11.10", code: "PI 3A", name: "Pendidikan Islam 3A" }
      ],
      "KHAMIS": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "SEMAI" },
        { time: "07.10 - 07.40", code: "PI 4B", name: "Pendidikan Islam 4B" },
        { time: "08.10 - 08.40", code: "PI 3B", name: "Pendidikan Islam 3B" },
        { time: "08.40 - 09.10", code: "PI 3B", name: "Pendidikan Islam 3B" },
        { time: "10.10 - 10.40", code: "PI 3A", name: "Pendidikan Islam 3A" },
        { time: "10.40 - 11.10", code: "PI 3A", name: "Pendidikan Islam 3A" }
      ],
      "JUMAAT": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "SEMAI" },
        { time: "07.10 - 07.40", code: "PI 3B", name: "Pendidikan Islam 3B" },
        { time: "07.40 - 08.10", code: "PI 3B", name: "Pendidikan Islam 3B" },
        { time: "08.40 - 09.10", code: "PI 5A", name: "Pendidikan Islam 5A" },
        { time: "09.10 - 09.40", code: "PI 5A", name: "Pendidikan Islam 5A" }
      ]
    }
  },

  "EN. REJOS BAKING": {
    jawatan: "Guru Akademik",
    subjekList: "PJK (1A, 4B, 5A, 6A, 6B), RBT (4B), PSV (1A, 5A), MZ (3B, 4B, 6A, 6B)",
    totalWaktu: "25 Waktu (750 Minit)",
    schedule: {
      "ISNIN": [
        { time: "07.00 - 07.40", code: "PH", name: "Perhimpunan" },
        { time: "07.40 - 08.10", code: "PSV 5A", name: "PSV 5A" },
        { time: "08.10 - 08.40", code: "PSV 5A", name: "PSV 5A" },
        { time: "08.40 - 09.10", code: "RBT 4B", name: "RBT 4B" },
        { time: "09.10 - 09.40", code: "RBT 4B", name: "RBT 4B" },
        { time: "10.10 - 10.40", code: "PK 6B", name: "Pendidikan Kesihatan 6B" },
        { time: "11.10 - 11.40", code: "MZ 3B", name: "Muzik 3B" }
      ],
      "SELASA": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "SEMAI" },
        { time: "07.10 - 07.40", code: "PJ 1A", name: "PJ 1A" },
        { time: "08.10 - 08.40", code: "PJ 4B", name: "PJ 4B" },
        { time: "09.10 - 09.40", code: "PJ 6B", name: "PJ 6B" },
        { time: "10.10 - 10.40", code: "MZ 4B", name: "Muzik 4B" },
        { time: "11.10 - 11.40", code: "PK 1A", name: "Pendidikan Kesihatan 1A" },
        { time: "12.10 - 12.40", code: "PK 5A", name: "Pendidikan Kesihatan 5A" }
      ],
      "RABU": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "SEMAI" },
        { time: "07.10 - 07.40", code: "PJ 6B", name: "PJ 6B" },
        { time: "08.10 - 08.40", code: "PJ 4B", name: "PJ 4B" },
        { time: "09.10 - 09.40", code: "PJ 5A", name: "PJ 5A" },
        { time: "10.10 - 10.40", code: "PK 6A", name: "Pendidikan Kesihatan 6A" },
        { time: "11.10 - 11.40", code: "MZ 6B", name: "Muzik 6B" },
        { time: "11.40 - 12.10", code: "MZ 6A", name: "Muzik 6A" }
      ],
      "KHAMIS": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "SEMAI" },
        { time: "08.10 - 08.40", code: "PJ 6A", name: "PJ 6A" },
        { time: "09.10 - 09.40", code: "PJ 6A", name: "PJ 6A" },
        { time: "11.10 - 11.40", code: "PSV 1A", name: "PSV 1A" },
        { time: "11.40 - 12.10", code: "PSV 1A", name: "PSV 1A" }
      ],
      "JUMAAT": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "SEMAI" },
        { time: "07.10 - 07.40", code: "PJ 5A", name: "PJ 5A" },
        { time: "08.10 - 08.40", code: "PJ 6A", name: "PJ 6A" }
      ]
    }
  },

  "PN. ROHANAH MOHD. SOUD": {
    jawatan: "Guru Kelas 3 Bestari",
    subjekList: "BI (2A, 2B, 3B)",
    totalWaktu: "27 Waktu (810 Minit)",
    schedule: {
      "ISNIN": [
        { time: "07.00 - 07.40", code: "PH", name: "Perhimpunan" },
        { time: "07.40 - 08.10", code: "BI 2A", name: "Bahasa Inggeris 2A" },
        { time: "08.10 - 08.40", code: "BI 2A", name: "Bahasa Inggeris 2A" },
        { time: "10.10 - 10.40", code: "BI 2B", name: "Bahasa Inggeris 2B" },
        { time: "10.40 - 11.10", code: "BI 2B", name: "Bahasa Inggeris 2B" },
        { time: "11.40 - 12.10", code: "BI 3B", name: "Bahasa Inggeris 3B" },
        { time: "12.10 - 12.40", code: "BI 3B", name: "Bahasa Inggeris 3B" }
      ],
      "SELASA": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "SEMAI" },
        { time: "07.10 - 07.40", code: "BI 2B", name: "Bahasa Inggeris 2B" },
        { time: "07.40 - 08.10", code: "BI 2B", name: "Bahasa Inggeris 2B" },
        { time: "10.10 - 10.40", code: "BI 3B", name: "Bahasa Inggeris 3B" },
        { time: "10.40 - 11.10", code: "BI 3B", name: "Bahasa Inggeris 3B" },
        { time: "11.40 - 12.10", code: "BI 2A", name: "Bahasa Inggeris 2A" },
        { time: "12.10 - 12.40", code: "BI 2A", name: "Bahasa Inggeris 2A" }
      ],
      "RABU": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "SEMAI" },
        { time: "07.10 - 07.40", code: "BI 2A", name: "Bahasa Inggeris 2A" },
        { time: "07.40 - 08.10", code: "BI 2A", name: "Bahasa Inggeris 2A" },
        { time: "08.40 - 09.10", code: "BI 3B", name: "Bahasa Inggeris 3B" },
        { time: "09.10 - 09.40", code: "BI 3B", name: "Bahasa Inggeris 3B" },
        { time: "10.10 - 10.40", code: "BI 2B", name: "Bahasa Inggeris 2B" },
        { time: "10.40 - 11.10", code: "BI 2B", name: "Bahasa Inggeris 2B" },
        { time: "11.40 - 12.10", code: "BI 2A", name: "Bahasa Inggeris 2A" }
      ],
      "KHAMIS": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "SEMAI" },
        { time: "07.10 - 07.40", code: "BI 2A", name: "Bahasa Inggeris 2A" },
        { time: "07.40 - 08.10", code: "BI 2A", name: "Bahasa Inggeris 2A" },
        { time: "09.10 - 09.40", code: "BI 3B", name: "Bahasa Inggeris 3B" },
        { time: "10.10 - 10.40", code: "BI 2B", name: "Bahasa Inggeris 2B" },
        { time: "10.40 - 11.10", code: "BI 2B", name: "Bahasa Inggeris 2B" }
      ],
      "JUMAAT": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "SEMAI" },
        { time: "08.10 - 08.40", code: "BI 3B", name: "Bahasa Inggeris 3B" },
        { time: "08.40 - 09.10", code: "BI 3B", name: "Bahasa Inggeris 3B" },
        { time: "10.40 - 11.10", code: "BI 2B", name: "Bahasa Inggeris 2B" }
      ]
    }
  },

  "CIK ROZELINE FRANCIS (GURU P.SUMBER)": {
    jawatan: "Guru Pusat Sumber",
    subjekList: "BKD (1A, 4A, 5A, 6A), PJK (2A, 2B)",
    totalWaktu: "14 Waktu (420 Minit)",
    schedule: {
      "ISNIN": [
        { time: "07.00 - 07.40", code: "PH", name: "Perhimpunan" },
        { time: "07.40 - 08.10", code: "BKD 6A", name: "BKD 6A" },
        { time: "11.40 - 12.10", code: "BKD 5A", name: "BKD 5A" },
        { time: "12.10 - 12.40", code: "BKD 5A", name: "BKD 5A" }
      ],
      "SELASA": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "SEMAI" },
        { time: "08.10 - 08.40", code: "PJ 2B", name: "PJ 2B" },
        { time: "09.10 - 09.40", code: "PJ 2A", name: "PJ 2A" },
        { time: "10.40 - 11.10", code: "BKD 6A", name: "BKD 6A" },
        { time: "11.40 - 12.10", code: "BKD 4A", name: "BKD 4A" },
        { time: "12.10 - 12.40", code: "BKD 4A", name: "BKD 4A" }
      ],
      "RABU": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "SEMAI" },
        { time: "08.10 - 08.40", code: "PJ 2A", name: "PJ 2A" },
        { time: "09.10 - 09.40", code: "PJ 2B", name: "PJ 2B" }
      ],
      "KHAMIS": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "SEMAI" },
        { time: "07.10 - 07.40", code: "BKD 1A", name: "BKD 1A" },
        { time: "07.40 - 08.10", code: "BKD 1A", name: "BKD 1A" },
        { time: "08.10 - 08.40", code: "PK 2A", name: "Pendidikan Kesihatan 2A" }
      ],
      "JUMAAT": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "SEMAI" },
        { time: "08.10 - 08.40", code: "PK 2B", name: "Pendidikan Kesihatan 2B" }
      ]
    }
  },

  "CIK ROZIE SUMIL": {
    jawatan: "Guru Kelas 6 Bestari",
    subjekList: "M3 (1B, 4B, 5A, 5B, 6B)",
    totalWaktu: "26 Waktu (780 Minit)",
    schedule: {
      "ISNIN": [
        { time: "07.00 - 07.40", code: "PH", name: "Perhimpunan" },
        { time: "07.40 - 08.10", code: "M3 4B", name: "Matematik 4B" },
        { time: "08.10 - 08.40", code: "M3 4B", name: "Matematik 4B" },
        { time: "10.10 - 10.40", code: "M3 5B", name: "Matematik 5B" },
        { time: "10.40 - 11.10", code: "M3 5B", name: "Matematik 5B" },
        { time: "11.40 - 12.10", code: "M3 1B", name: "Matematik 1B" },
        { time: "12.10 - 12.40", code: "M3 1B", name: "Matematik 1B" }
      ],
      "SELASA": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "SEMAI" },
        { time: "07.10 - 07.40", code: "M3 6B", name: "Matematik 6B" },
        { time: "07.40 - 08.10", code: "M3 6B", name: "Matematik 6B" },
        { time: "08.40 - 09.10", code: "M3 1B", name: "Matematik 1B" },
        { time: "09.10 - 09.40", code: "M3 1B", name: "Matematik 1B" },
        { time: "10.10 - 10.40", code: "M3 5A", name: "Matematik 5A" },
        { time: "10.40 - 11.10", code: "M3 5A", name: "Matematik 5A" },
        { time: "11.40 - 12.10", code: "M3 5B", name: "Matematik 5B" },
        { time: "12.10 - 12.40", code: "M3 5B", name: "Matematik 5B" }
      ],
      "RABU": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "SEMAI" },
        { time: "08.10 - 08.40", code: "M3 5A", name: "Matematik 5A" },
        { time: "08.40 - 09.10", code: "M3 5A", name: "Matematik 5A" },
        { time: "10.40 - 11.10", code: "M3 6B", name: "Matematik 6B" },
        { time: "11.10 - 11.40", code: "M3 1B", name: "Matematik 1B" },
        { time: "11.40 - 12.10", code: "M3 1B", name: "Matematik 1B" }
      ],
      "KHAMIS": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "SEMAI" },
        { time: "07.10 - 07.40", code: "M3 5A", name: "Matematik 5A" },
        { time: "08.10 - 08.40", code: "M3 6B", name: "Matematik 6B" },
        { time: "08.40 - 09.10", code: "M3 6B", name: "Matematik 6B" },
        { time: "10.40 - 11.10", code: "M3 4B", name: "Matematik 4B" },
        { time: "11.10 - 11.40", code: "M3 4B", name: "Matematik 4B" }
      ],
      "JUMAAT": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "SEMAI" },
        { time: "08.10 - 08.40", code: "M3 5B", name: "Matematik 5B" },
        { time: "09.10 - 09.40", code: "M3 4B", name: "Matematik 4B" }
      ]
    }
  },

  "PN. SALHAH AWANG TENGAH": {
    jawatan: "Guru Akademik",
    subjekList: "BA (1A, 1B, 2A, 2B, 3A, 3B, 4A, 4B, 5A, 5B, 6A, 6B), PI PRA, TASMEK (6B)",
    totalWaktu: "30 Waktu (900 Minit)",
    schedule: {
      "ISNIN": [
        { time: "07.00 - 07.40", code: "PH", name: "Perhimpunan" },
        { time: "07.40 - 08.10", code: "BA 6A", name: "Bahasa Arab 6A" },
        { time: "08.40 - 09.10", code: "BA 3A", name: "Bahasa Arab 3A" },
        { time: "09.10 - 09.40", code: "BA 3A", name: "Bahasa Arab 3A" },
        { time: "11.40 - 12.10", code: "BA 5A", name: "Bahasa Arab 5A" },
        { time: "12.10 - 12.40", code: "BA 5A", name: "Bahasa Arab 5A" }
      ],
      "SELASA": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "SEMAI" },
        { time: "07.10 - 07.40", code: "BA 3B", name: "Bahasa Arab 3B" },
        { time: "07.40 - 08.10", code: "BA 3B", name: "Bahasa Arab 3B" },
        { time: "08.40 - 09.10", code: "BA 5B", name: "Bahasa Arab 5B" },
        { time: "09.10 - 09.40", code: "BA 5B", name: "Bahasa Arab 5B" },
        { time: "10.40 - 11.10", code: "BA 6A", name: "Bahasa Arab 6A" },
        { time: "11.40 - 12.10", code: "BA 4A", name: "Bahasa Arab 4A" },
        { time: "12.10 - 12.40", code: "BA 4A", name: "Bahasa Arab 4A" }
      ],
      "RABU": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "SEMAI" },
        { time: "08.10 - 08.40", code: "BA 2B", name: "Bahasa Arab 2B" },
        { time: "08.40 - 09.10", code: "BA 2B", name: "Bahasa Arab 2B" },
        { time: "10.10 - 10.40", code: "BA 6B", name: "Bahasa Arab 6B" },
        { time: "10.40 - 11.10", code: "BA 2A", name: "Bahasa Arab 2A" },
        { time: "11.10 - 11.40", code: "BA 2A", name: "Bahasa Arab 2A" }
      ],
      "KHAMIS": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "SEMAI" },
        { time: "07.10 - 07.40", code: "BA 1A", name: "Bahasa Arab 1A" },
        { time: "07.40 - 08.10", code: "BA 1A", name: "Bahasa Arab 1A" },
        { time: "08.40 - 09.10", code: "BA 1B", name: "Bahasa Arab 1B" },
        { time: "09.10 - 09.40", code: "BA 1B", name: "Bahasa Arab 1B" },
        { time: "11.40 - 12.10", code: "BA 6B", name: "Bahasa Arab 6B" }
      ],
      "JUMAAT": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "SEMAI" },
        { time: "08.10 - 08.40", code: "BA 4B", name: "Bahasa Arab 4B" },
        { time: "08.40 - 09.10", code: "BA 4B", name: "Bahasa Arab 4B" }
      ]
    }
  },

  "PN. YUNIZAH ESUN": {
    jawatan: "Guru Akademik",
    subjekList: "SN (2A, 2B, 3A, 3B, 6A, 6B), PSV (1B, 5B), MZ (3A, 4A)",
    totalWaktu: "26 Waktu (780 Minit)",
    schedule: {
      "ISNIN": [
        { time: "07.00 - 07.40", code: "PH", name: "Perhimpunan" },
        { time: "08.40 - 09.10", code: "SN 2A", name: "Sains 2A" },
        { time: "09.10 - 09.40", code: "SN 2A", name: "Sains 2A" },
        { time: "10.10 - 10.40", code: "SN 6A", name: "Sains 6A" },
        { time: "10.40 - 11.10", code: "SN 6A", name: "Sains 6A" },
        { time: "11.10 - 11.40", code: "MZ 4A", name: "Muzik 4A" },
        { time: "12.10 - 12.40", code: "SN 2B", name: "Sains 2B" }
      ],
      "SELASA": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "SEMAI" },
        { time: "07.10 - 07.40", code: "SN 3A", name: "Sains 3A" },
        { time: "08.10 - 08.40", code: "SN 3B", name: "Sains 3B" },
        { time: "08.40 - 09.10", code: "SN 3B", name: "Sains 3B" },
        { time: "10.40 - 11.10", code: "SN 6B", name: "Sains 6B" },
        { time: "11.10 - 11.40", code: "SN 6B", name: "Sains 6B" },
        { time: "12.10 - 12.40", code: "SN 3B", name: "Sains 3B" }
      ],
      "RABU": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "SEMAI" },
        { time: "07.40 - 08.10", code: "SN 6B", name: "Sains 6B" },
        { time: "08.10 - 08.40", code: "SN 6B", name: "Sains 6B" },
        { time: "11.10 - 11.40", code: "SN 2B", name: "Sains 2B" },
        { time: "11.40 - 12.10", code: "SN 2B", name: "Sains 2B" }
      ],
      "KHAMIS": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "SEMAI" },
        { time: "07.10 - 07.40", code: "SN 6A", name: "Sains 6A" },
        { time: "07.40 - 08.10", code: "SN 6A", name: "Sains 6A" },
        { time: "08.40 - 09.10", code: "SN 3A", name: "Sains 3A" },
        { time: "09.10 - 09.40", code: "SN 3A", name: "Sains 3A" },
        { time: "10.10 - 10.40", code: "PSV 1B", name: "PSV 1B" },
        { time: "10.40 - 11.10", code: "PSV 1B", name: "PSV 1B" },
        { time: "11.40 - 12.10", code: "MZ 3A", name: "Muzik 3A" }
      ],
      "JUMAAT": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "SEMAI" },
        { time: "08.10 - 08.40", code: "SN 2A", name: "Sains 2A" },
        { time: "08.40 - 09.10", code: "PSV 5B", name: "PSV 5B" },
        { time: "09.10 - 09.40", code: "PSV 5B", name: "PSV 5B" }
      ]
    }
  },

  "PN. ZURAIDAH HJ. MARJIN": {
    jawatan: "Guru Akademik / Penyelaras Jadual Waktu",
    subjekList: "BI (3A, 5B, 6B)",
    totalWaktu: "25 Waktu (750 Minit)",
    schedule: {
      "ISNIN": [
        { time: "07.00 - 07.40", code: "PH", name: "Perhimpunan" },
        { time: "08.40 - 09.10", code: "BI 5B", name: "Bahasa Inggeris 5B" },
        { time: "09.10 - 09.40", code: "BI 5B", name: "Bahasa Inggeris 5B" },
        { time: "10.10 - 10.40", code: "BI 3A", name: "Bahasa Inggeris 3A" },
        { time: "10.40 - 11.10", code: "BI 3A", name: "Bahasa Inggeris 3A" },
        { time: "11.40 - 12.10", code: "BI 6B", name: "Bahasa Inggeris 6B" },
        { time: "12.10 - 12.40", code: "BI 6B", name: "Bahasa Inggeris 6B" }
      ],
      "SELASA": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "SEMAI" },
        { time: "08.10 - 08.40", code: "BI 6B", name: "Bahasa Inggeris 6B" },
        { time: "08.40 - 09.10", code: "BI 6B", name: "Bahasa Inggeris 6B" },
        { time: "10.40 - 11.10", code: "BI 5B", name: "Bahasa Inggeris 5B" },
        { time: "11.10 - 11.40", code: "BI 5B", name: "Bahasa Inggeris 5B" },
        { time: "11.40 - 12.10", code: "BI 3A", name: "Bahasa Inggeris 3A" },
        { time: "12.10 - 12.40", code: "BI 3A", name: "Bahasa Inggeris 3A" }
      ],
      "RABU": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "SEMAI" },
        { time: "08.40 - 09.10", code: "BI 5B", name: "Bahasa Inggeris 5B" },
        { time: "09.10 - 09.40", code: "BI 5B", name: "Bahasa Inggeris 5B" },
        { time: "11.10 - 11.40", code: "BI 3A", name: "Bahasa Inggeris 3A" },
        { time: "11.40 - 12.10", code: "BI 3A", name: "Bahasa Inggeris 3A" }
      ],
      "KHAMIS": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "SEMAI" },
        { time: "07.10 - 07.40", code: "BI 3A", name: "Bahasa Inggeris 3A" },
        { time: "08.10 - 08.40", code: "BI 5B", name: "Bahasa Inggeris 5B" },
        { time: "08.40 - 09.10", code: "BI 5B", name: "Bahasa Inggeris 5B" },
        { time: "10.40 - 11.10", code: "BI 6B", name: "Bahasa Inggeris 6B" },
        { time: "11.10 - 11.40", code: "BI 6B", name: "Bahasa Inggeris 6B" }
      ],
      "JUMAAT": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "SEMAI" },
        { time: "08.10 - 08.40", code: "BI 6B", name: "Bahasa Inggeris 6B" },
        { time: "08.40 - 09.10", code: "BI 6B", name: "Bahasa Inggeris 6B" },
        { time: "10.10 - 10.40", code: "BI 3A", name: "Bahasa Inggeris 3A" },
        { time: "10.40 - 11.10", code: "BI 3A", name: "Bahasa Inggeris 3A" }
      ]
    }
  },

  "PN. ZURINAH JUBIDI": {
    jawatan: "Guru Akademik",
    subjekList: "BI (1A, 1B, 4A, 4B)",
    totalWaktu: "26 Waktu (780 Minit)",
    schedule: {
      "ISNIN": [
        { time: "07.00 - 07.40", code: "PH", name: "Perhimpunan" },
        { time: "08.40 - 09.10", code: "BI 1A", name: "Bahasa Inggeris 1A" },
        { time: "09.10 - 09.40", code: "BI 1A", name: "Bahasa Inggeris 1A" },
        { time: "10.10 - 10.40", code: "BI 1B", name: "Bahasa Inggeris 1B" },
        { time: "10.40 - 11.10", code: "BI 1B", name: "Bahasa Inggeris 1B" },
        { time: "11.40 - 12.10", code: "BI 4B", name: "Bahasa Inggeris 4B" },
        { time: "12.10 - 12.40", code: "BI 4B", name: "Bahasa Inggeris 4B" }
      ],
      "SELASA": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "SEMAI" },
        { time: "07.40 - 08.10", code: "BI 1A", name: "Bahasa Inggeris 1A" },
        { time: "08.10 - 08.40", code: "BI 1A", name: "Bahasa Inggeris 1A" },
        { time: "10.10 - 10.40", code: "BI 1B", name: "Bahasa Inggeris 1B" },
        { time: "10.40 - 11.10", code: "BI 1B", name: "Bahasa Inggeris 1B" },
        { time: "11.40 - 12.10", code: "BI 4B", name: "Bahasa Inggeris 4B" },
        { time: "12.10 - 12.40", code: "BI 4B", name: "Bahasa Inggeris 4B" }
      ],
      "RABU": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "SEMAI" },
        { time: "07.10 - 07.40", code: "BI 1B", name: "Bahasa Inggeris 1B" },
        { time: "07.40 - 08.10", code: "BI 1B", name: "Bahasa Inggeris 1B" },
        { time: "08.40 - 09.10", code: "BI 1A", name: "Bahasa Inggeris 1A" },
        { time: "09.10 - 09.40", code: "BI 1A", name: "Bahasa Inggeris 1A" },
        { time: "11.10 - 11.40", code: "BI 4B", name: "Bahasa Inggeris 4B" },
        { time: "11.40 - 12.10", code: "BI 4B", name: "Bahasa Inggeris 4B" }
      ],
      "KHAMIS": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "SEMAI" },
        { time: "08.40 - 09.10", code: "BI 4B", name: "Bahasa Inggeris 4B" },
        { time: "09.10 - 09.40", code: "BI 4B", name: "Bahasa Inggeris 4B" },
        { time: "10.10 - 10.40", code: "BI 1A", name: "Bahasa Inggeris 1A" },
        { time: "10.40 - 11.10", code: "BI 1A", name: "Bahasa Inggeris 1A" }
      ],
      "JUMAAT": [
        { time: "07.00 - 07.10", code: "SEMAI", name: "SEMAI" },
        { time: "08.10 - 08.40", code: "BI 1A", name: "Bahasa Inggeris 1A" },
        { time: "09.10 - 09.40", code: "BI 1B", name: "Bahasa Inggeris 1B" },
        { time: "10.10 - 10.40", code: "BI 1B", name: "Bahasa Inggeris 1B" },
        { time: "10.40 - 11.10", code: "BI 1B", name: "Bahasa Inggeris 1B" }
      ]
    }
  }
};
