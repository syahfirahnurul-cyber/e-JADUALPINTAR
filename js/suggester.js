// Enjin Cadangan Masa Sesi UBK Pintar & Penjana Jadual Subjek Bukan Teras
const SessionSuggester = {
  // Senarai subjek bukan teras yang paling sesuai untuk sesi UBK
  NON_CORE_SUBJECTS: ["PSV", "MZ", "PJ", "PK", "RBT", "SEJ", "TASMEK", "BA/BKD", "BA", "BKD", "PM", "PI/PM"],

  // Analisis kelapangan slot untuk kelas & jenis sesi tertentu
  findOptimalSlots: function(className, sessionType, practicumSessions = []) {
    const classData = CLASS_SCHEDULES[className];
    if (!classData) return [];

    const recommendations = [];
    const days = ["ISNIN", "SELASA", "RABU", "KHAMIS", "JUMAAT"];

    days.forEach(day => {
      const daySlots = classData.schedule[day] || [];

      daySlots.forEach((slot, index) => {
        // Melangkau slot perhimpunan rasmi & semai awal pagi
        if (slot.code === "PERHIMPUNAN" || slot.code === "SEMAI") {
          return;
        }

        let score = 50;
        let status = "kuning"; // hijau, kuning, merah
        let reason = "";
        let details = [];

        // 1. Semak Waktu Rehat
        if (slot.isBreak) {
          status = "merah";
          score = 0;
          reason = `Waktu Rehat (${classData.rehatTime}) - Rehat adalah hak murid.`;
        } 
        // 2. Semak Subjek Teras vs Sampingan
        else if (slot.core) {
          status = "kuning";
          score = 35;
          reason = `Subjek Teras: ${slot.name} (${slot.code}). Ketinggalan pelajaran jika dipanggil.`;
          details.push("Sebaiknya elakkan waktu subjek teras akademik.");
        } else {
          status = "hijau";
          score = 90;
          reason = `Subjek Bukan Teras: ${slot.name} (${slot.code}). Sangat sesuai untuk sesi UBK!`;
          details.push("Masa paling ideal kerana murid tidak ketinggalan subjek peperiksaan.");
        }

        // Bonus khas untuk subjek amali/seni/jasmani/tasmek
        if (this.NON_CORE_SUBJECTS.includes(slot.code)) {
          score += 10;
          details.push("Pelepasan kelas mudah diperolehi daripada guru mata pelajaran.");
        }

        // 3. Semak Pertembungan dengan Sesi Persendirian Cikgu Syahfirah
        const hasConflict = practicumSessions.some(s => {
          return s.day === day && this.isTimeOverlapping(s.timeStart, s.timeEnd, slot.time);
        });

        if (hasConflict) {
          status = "merah";
          score = 10;
          reason = "Bertembung dengan aktiviti / sesi lain dalam Jadual Praktikum anda!";
        }

        // 4. Semak Takwim Sekolah
        const takwimMatch = TAKWIM_EVENTS.find(e => e.day === day && e.category === "cuti");
        if (takwimMatch) {
          status = "merah";
          score = 0;
          reason = `Cuti Sekolah / Peristiwa: ${takwimMatch.title}`;
        }

        recommendations.push({
          day: day,
          time: slot.time,
          className: className,
          subjectCode: slot.code,
          subjectName: slot.name,
          isCore: slot.core,
          status: status,
          score: Math.min(100, score),
          reason: reason,
          details: details,
          sessionType: sessionType
        });
      });
    });

    return recommendations.sort((a, b) => b.score - a.score);
  },

  // Mengimbas seluruh 12 kelas untuk semua slot bukan teras bagi hari atau tahap tertentu
  getAllNonCoreSlots: function(filterDay = null, filterTahap = 2) {
    const results = [];
    const classNames = Object.keys(CLASS_SCHEDULES);
    const days = filterDay ? [filterDay] : ["ISNIN", "SELASA", "RABU", "KHAMIS", "JUMAAT"];

    classNames.forEach(clsName => {
      const cls = CLASS_SCHEDULES[clsName];
      if (filterTahap && cls.tahap !== filterTahap) return;

      days.forEach(day => {
        const slots = cls.schedule[day] || [];
        slots.forEach(slot => {
          if (!slot.core && !slot.isBreak && slot.code !== "PERHIMPUNAN" && slot.code !== "SEMAI") {
            results.push({
              className: clsName,
              tahap: cls.tahap,
              day: day,
              time: slot.time,
              subjectCode: slot.code,
              subjectName: slot.name
            });
          }
        });
      });
    });

    return results;
  },

  // Menjana pelan jadual mingguan lengkap berasaskan waktu bukan teras
  generateSmartWeeklyPlan: function(weekNum, existingSessions = []) {
    const plan = [];
    const days = ["ISNIN", "SELASA", "RABU", "KHAMIS", "JUMAAT"];
    
    // Semak jika ada cuti umum / peristiwa pada minggu ini daripada takwim
    const weekCutiEvents = TAKWIM_EVENTS.filter(e => e.category === "cuti");

    // Template tema cadangan sesi untuk praktikum
    const sessionBlueprints = [
      // ISNIN
      { day: "ISNIN", timeStart: "07.00", timeEnd: "07.40", title: "PERHIMPUNAN RASMI MINGGUAN", type: "program", classTarget: "Seluruh Sekolah" },
      { day: "ISNIN", timeStart: "07.40", timeEnd: "08.40", title: "PENGURUSAN REKOD & PERSEDIAAN BILIK UBK", type: "pentadbiran", classTarget: "Bilik UBK" },
      { day: "ISNIN", timeStart: "10.40", timeEnd: "11.40", title: "KI (SESI KAUNSELING INDIVIDU)", type: "individu", classTarget: "5 ARIF (Waktu PSV)", defaultClass: "5 ARIF", prefSubject: "PSV" },
      { day: "ISNIN", timeStart: "11.40", timeEnd: "12.40", title: "KI (SESI KAUNSELING INDIVIDU)", type: "individu", classTarget: "4 BESTARI (Waktu TASMEK)", defaultClass: "4 BESTARI", prefSubject: "TASMEK" },

      // SELASA
      { day: "SELASA", timeStart: "07.10", timeEnd: "08.10", title: "SESI KAUNSELING KELOMPOK (KEMAJAS / KELOMPOK KECIL)", type: "kelompok", classTarget: "4 ARIF (Waktu PJ)", defaultClass: "4 ARIF", prefSubject: "PJ" },
      { day: "SELASA", timeStart: "08.40", timeEnd: "09.40", title: "KI (SESI KAUNSELING INDIVIDU)", type: "individu", classTarget: "6 BESTARI (Waktu SEJ)", defaultClass: "6 BESTARI", prefSubject: "SEJ" },
      { day: "SELASA", timeStart: "10.40", timeEnd: "11.40", title: "BIMBINGAN KELAS / PSIKOEDUKASI (URUS EMOSI)", type: "bimbingan", classTarget: "5 BESTARI (Waktu RBT)", defaultClass: "5 BESTARI", prefSubject: "RBT" },
      { day: "SELASA", timeStart: "11.40", timeEnd: "12.40", title: "RUNDINGAN GURU KELAS & KEMASKINI LOG", type: "pentadbiran", classTarget: "Bilik Guru" },

      // RABU
      { day: "RABU", timeStart: "07.10", timeEnd: "08.10", title: "KI (SESI KAUNSELING INDIVIDU)", type: "individu", classTarget: "6 ARIF (Waktu PJ)", defaultClass: "6 ARIF", prefSubject: "PJ" },
      { day: "RABU", timeStart: "08.10", timeEnd: "09.10", title: "BIMBINGAN KELAS / PSIKOEDUKASI (MOTIVASI BELAJAR)", type: "bimbingan", classTarget: "4 BESTARI (Waktu MZ)", defaultClass: "4 BESTARI", prefSubject: "MZ" },
      { day: "RABU", timeStart: "10.40", timeEnd: "11.40", title: "SESI KAUNSELING KELOMPOK (PENINGKATAN DISIPLIN)", type: "kelompok", classTarget: "5 ARIF (Waktu RBT)", defaultClass: "5 ARIF", prefSubject: "RBT" },
      { day: "RABU", timeStart: "11.40", timeEnd: "12.40", title: "BIMBINGAN KELOMPOK RAKAN SEBAYA (PRS)", type: "kelompok", classTarget: "PRS SK Tampasuk 1" },

      // KHAMIS
      { day: "KHAMIS", timeStart: "07.10", timeEnd: "08.10", title: "KI (SESI KAUNSELING INDIVIDU)", type: "individu", classTarget: "5 BESTARI (Waktu PJ)", defaultClass: "5 BESTARI", prefSubject: "PJ" },
      { day: "KHAMIS", timeStart: "08.40", timeEnd: "09.40", title: "BIMBINGAN KELAS (PENDIDIKAN PENCEGAHAN / KERJAYA)", type: "bimbingan", classTarget: "6 BESTARI (Waktu PSV)", defaultClass: "6 BESTARI", prefSubject: "PSV" },
      { day: "KHAMIS", timeStart: "10.10", timeEnd: "11.10", title: "KI (SESI KAUNSELING INDIVIDU)", type: "individu", classTarget: "4 ARIF (Waktu BA/BKD)", defaultClass: "4 ARIF", prefSubject: "BA/BKD" },
      { day: "KHAMIS", timeStart: "11.10", timeEnd: "12.10", title: "KONSULTASI IBU BAPA / GURU MATAPELAJARAN", type: "pentadbiran", classTarget: "Bilik UBK" },

      // JUMAAT
      { day: "JUMAAT", timeStart: "07.10", timeEnd: "08.10", title: "PROGRAM KEROHANIAN / MOTIVASI PAGI JUMAAT", type: "program", classTarget: "Murid Tahap 2" },
      { day: "JUMAAT", timeStart: "08.10", timeEnd: "09.10", title: "KI (SESI KAUNSELING INDIVIDU)", type: "individu", classTarget: "6 ARIF (Waktu SEJ)", defaultClass: "6 ARIF", prefSubject: "SEJ" },
      { day: "JUMAAT", timeStart: "10.10", timeEnd: "11.10", title: "ANALISIS SESI MINGGUAN & SEMAKAN BUKU LOG", type: "pentadbiran", classTarget: "Guru Pembimbing" }
    ];

    // Semak dan padankan slot masa dengan jadual kelas sebenar
    sessionBlueprints.forEach(bp => {
      // Pastikan bukan waktu rehat (09.40 - 10.10)
      if (bp.timeStart === "09.40" || bp.timeEnd === "10.10") return;

      // Cari pengesahan slot bukan teras jika ada sasaran kelas
      if (bp.defaultClass && CLASS_SCHEDULES[bp.defaultClass]) {
        const clsSlots = CLASS_SCHEDULES[bp.defaultClass].schedule[bp.day] || [];
        const nonCoreMatch = clsSlots.find(s => !s.core && !s.isBreak && s.time.startsWith(bp.timeStart.slice(0, 2)));
        if (nonCoreMatch) {
          bp.classTarget = `${bp.defaultClass} (Waktu ${nonCoreMatch.name} - ${nonCoreMatch.code})`;
        }
      }

      plan.push({
        day: bp.day,
        timeStart: bp.timeStart,
        timeEnd: bp.timeEnd,
        title: bp.title,
        type: bp.type,
        classTarget: bp.classTarget
      });
    });

    return plan;
  },

  // Penukar format masa kepada minit dengan sokongan waktu petang PM (contoh: 01.10 = 13:10)
  toMinutes: function(t) {
    if (!t) return 0;
    const clean = String(t).trim().toLowerCase().replace(/[^0-9.:]/g, '');
    const parts = clean.replace('.', ':').split(':');
    let h = parseInt(parts[0], 10) || 0;
    const m = parseInt(parts[1], 10) || 0;
    if (h >= 1 && h <= 5) {
      h += 12;
    }
    return h * 60 + m;
  },

  // Pembantu penyemak pertindihan masa yang tepat berasaskan minit
  isTimeOverlapping: function(start1, end1, slotTimeStr) {
    if (!slotTimeStr) return false;
    const [slotStart, slotEnd] = slotTimeStr.split(" - ");
    const s1 = this.toMinutes(start1);
    const e1 = this.toMinutes(end1);
    const slotS = this.toMinutes(slotStart);
    const slotE = this.toMinutes(slotEnd || slotStart);
    return (s1 < slotE && e1 > slotS);
  }
};
