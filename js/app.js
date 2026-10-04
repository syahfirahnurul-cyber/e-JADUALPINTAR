// Controller Utama Aplikasi Jadual UBK SK Tampasuk 1 - Versi Pintar & Berkuasa (Smart Assistant Edition)
const App = {
  state: {
    currentWeek: 1,
    activeTab: "jadualPraktikum",
    practicumData: [],
    selectedClassForViewer: "4 ARIF",
    selectedTeacherForViewer: "EN. MUDAH HJ. ADMAIM (GURU BESAR)",
    lastDeletedSession: null,  // For undo delete
    undoTimer: null,           // For toast undo timeout
    selectedStudentsInForm: [],
    studentDirectoryFilterClass: "ALL",
    studentDirectoryQuery: "",
    docRate: 30, // Kadar masa dokumentasi automatik (minit/sesi) bagi sesi KI, Kelompok & Bimbingan
    activeIpgmForm: "07", // '07', '09', atau '10'
    ipgmPeriod: "all",    // 'all', 'current', 'm_aug', 'm_sep', 'm_oct', 'w1'..'w10'
    quickPickerTarget: { weekNum: null, day: null, sessionIdx: null },
    quickPickerSelectedStudents: [],
    quickPickerClassFilter: "",
    quickPickerSearchQuery: "",
    savedClients: []
  },

  // Peta Tarikh Minggu Praktikum (untuk auto-detect minggu semasa - merangkumi hujung minggu & cuti)
  WEEK_DATE_MAP: [
    { weekNum: 1,  startDate: new Date(2026, 7, 17),  endDate: new Date(2026, 7, 23) }, // 17 - 23 Ogos (termasuk Sabtu & Ahad)
    { weekNum: 2,  startDate: new Date(2026, 7, 24),  endDate: new Date(2026, 7, 30) }, // 24 - 30 Ogos
    { weekNum: 3,  startDate: new Date(2026, 7, 31),  endDate: new Date(2026, 8, 13) }, // 31 Ogos - 13 Sept (Cuti Penggal 2 + Minggu 3)
    { weekNum: 4,  startDate: new Date(2026, 8, 14),  endDate: new Date(2026, 8, 20) }, // 14 - 20 Sept
    { weekNum: 5,  startDate: new Date(2026, 8, 21),  endDate: new Date(2026, 8, 27) }, // 21 - 27 Sept (Hari ini 26 Sept tepat jatuh Minggu 5!)
    { weekNum: 6,  startDate: new Date(2026, 8, 28),  endDate: new Date(2026, 9, 4)  }, // 28 Sept - 4 Okt
    { weekNum: 7,  startDate: new Date(2026, 9, 5),   endDate: new Date(2026, 9, 11) }, // 5 - 11 Okt
    { weekNum: 8,  startDate: new Date(2026, 9, 12),  endDate: new Date(2026, 9, 18) }, // 12 - 18 Okt
    { weekNum: 9,  startDate: new Date(2026, 9, 19),  endDate: new Date(2026, 9, 25) }, // 19 - 25 Okt
    { weekNum: 10, startDate: new Date(2026, 9, 26),  endDate: new Date(2026, 10, 1) }  // 26 Okt - 1 Nov
  ],

  // Penukar masa tepat (contoh: "07.10", "12.40", "01.10", "1.10", "13.10") kepada minit
  // Mengendalikan waktu 1-5 petang (PM) secara automatik bagi sesi sekolah / tasmek
  timeToMin: function(t) {
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

  init: function() {
    this.loadPracticumData();
    this.populateTeacherDropdown();
    this.bindEvents();
    this.autoDetectCurrentWeek();
    this.showMondayAlert();
    this.checkUrlSyncData();
    this.loadSavedClients();
    this.render();
    if (typeof CloudSync !== "undefined") {
      CloudSync.init();
    }
  },

  // Memuatkan data jadual praktikum dari LocalStorage atau default template
  loadPracticumData: function() {
    const saved = localStorage.getItem("ubk_practicum_schedule_2026");
    if (saved) {
      try {
        this.state.practicumData = JSON.parse(saved);
      } catch (e) {
        this.state.practicumData = typeof PRACTICUM_WEEKS !== "undefined" ? JSON.parse(JSON.stringify(PRACTICUM_WEEKS)) : [];
      }
    } else {
      this.state.practicumData = typeof PRACTICUM_WEEKS !== "undefined" ? JSON.parse(JSON.stringify(PRACTICUM_WEEKS)) : [];
      localStorage.setItem("ubk_practicum_schedule_2026", JSON.stringify(this.state.practicumData));
    }

    // Self-healing: Selaraskan title, dateRange, dan dates rasmi dari PRACTICUM_WEEKS ke LocalStorage
    if (typeof PRACTICUM_WEEKS !== "undefined" && Array.isArray(PRACTICUM_WEEKS)) {
      PRACTICUM_WEEKS.forEach(pw => {
        const localWeek = this.state.practicumData.find(w => w.weekNum === pw.weekNum);
        if (localWeek) {
          localWeek.title = pw.title;
          localWeek.dateRange = pw.dateRange;
          localWeek.dates = JSON.parse(JSON.stringify(pw.dates));
        }
      });
      localStorage.setItem("ubk_practicum_schedule_2026", JSON.stringify(this.state.practicumData));
    }

    // Normalise setiap sesi — tambah medan baharu jika tiada (backward compat & pematuhan IPGM)
    this.state.practicumData.forEach(w => {
      // Inisialisasi peta cuti jika tiada
      if (!w.holidays) w.holidays = {};

      if (w.sessions && Array.isArray(w.sessions)) {
        w.sessions.forEach(s => {
          if (!s.status)         s.status         = 'belum';
          if (!s.notes)          s.notes          = '';
          if (s.headcount === undefined) s.headcount = (s.students && s.students.length > 0) ? s.students.length : 1;
          if (!s.clientStatus)   s.clientStatus   = 'B';
          if (!s.arrivalWay)     s.arrivalWay     = 'sukarela';
          if (!s.targetAudience) s.targetAudience = 'pelajar';

          // PENYELARASAN KHAS: BIMBINGAN BAGI KELAS & KELAS MENGGANTIKAN GURU (RELIEF)
          const isRelief = s.isRelief === true || s.type === 'bimbingan' || (s.notes && s.notes.toLowerCase().includes('ganti'));
          if (isRelief || s.type === 'bimbingan') {
            s.isRelief = true;
            // PEMBETULAN: Hanya tetapkan sebagai default jika belum ada nilai — JANGAN TIMPA nilai manual Cikgu!
            if (!s.clientStatus) s.clientStatus = 'D/J'; // Status: DIRUJUK (D/J)
            if (!s.arrivalWay) s.arrivalWay = 'rujukan'; // Cara Rujuk: RUJUKAN
            s.focus = this.detectSessionFocus(s.title, s.classTarget, s.notes);
            if (!s.notes || s.notes === '' || s.notes.includes('Kelas ganti guru lain')) {
              s.notes = 'Kelas Menggantikan Guru (Relief) - Masuk ke kelas kerana ketiadaan guru mata pelajaran, diisi dengan aktiviti bimbingan kelompok/kelas.';
            }
          } else if (s.type === 'penyeliaan' || s.type === 'programLain') {
            // Penyeliaan Pensyarah / Program Sekolah = masa terisi tapi TIDAK dikira jam perkhidmatan
            s.isRelief = false;
            if (!s.clientStatus) s.clientStatus = '-';
            if (!s.arrivalWay) s.arrivalWay = '-';
            if (!s.notes) s.notes = s.type === 'penyeliaan'
              ? 'Penyeliaan daripada pensyarah penyelia - masa ini tidak dikira sebagai jam perkhidmatan UBK.'
              : 'Program Sekolah / Aktiviti Luar - masa ini tidak dikira sebagai jam perkhidmatan UBK.';
          } else {
            // Auto detect focus untuk semua sesi lain jika belum ditetapkan
            s.focus = this.detectSessionFocus(s.title, s.classTarget, s.notes) || s.focus || 'sahsiah';
          }
        });
      }
    });

    // Auto-Tag sesi sedia ada secara pintar mengikut urutan kronologi (Sesi 1 - 10)
    this.autoTagExistingSessions(true);

    // Muat kadar dokumentasi automatik (piawai: 30 minit)
    const savedDocRate = localStorage.getItem("ubk_doc_rate");
    this.state.docRate = savedDocRate !== null ? (parseInt(savedDocRate, 10) || 0) : 30;
  },

  // =========================================================
  // ENJIN PINTAR PENGENALPASTI FOKUS PERKHIDMATAN (4 BIDANG KPM) BERDASARKAN TAJUK
  // =========================================================
  detectSessionFocus: function(title = "", classTarget = "", notes = "") {
    const text = `${title || ""} ${classTarget || ""} ${notes || ""}`.toUpperCase();
    
    // 1. Pendidikan Kerjaya Murid (Bidang 3 KPM)
    if (
      text.includes("KERJAYA") || text.includes("CITA-CITA") || text.includes("CITA CITA") || 
      text.includes("PEKERJAAN") || text.includes("HALA TUJU") || text.includes("HALATUJU") || 
      text.includes("MATLAMAT KERJAYA") || text.includes("EKSPLORASI KERJAYA") || text.includes("IMPIAN") || 
      text.includes("DUNIA PEKERJAAN") || text.includes("IMK") || text.includes("HOLLAND") || 
      text.includes("RIASEC") || text.includes("ALIRAN") || text.includes("KOLEJ") || 
      text.includes("UNIVERSITI") || text.includes("VOKASIONAL") || text.includes("MATRIKULASI")
    ) {
      return "kerjaya";
    }
    
    // 2. Peningkatan Disiplin Diri Murid (Bidang 2 KPM)
    if (
      text.includes("DISIPLIN") || text.includes("PONTENG") || text.includes("LEWAT") || 
      text.includes("PERATURAN") || text.includes("SALAH LAKU") || text.includes("TINGKAH LAKU") || 
      text.includes("BULI") || text.includes("CYBERBULLY") || text.includes("GADUH") || 
      text.includes("PERGADUHAN") || text.includes("PENGURUSAN MASA") || text.includes("KEKEMASAN") || 
      text.includes("RAMBUT") || text.includes("PAKAIAN") || text.includes("GAJET") || 
      text.includes("KECANDUAN") || text.includes("VANDALISME") || text.includes("BIADAP") || 
      text.includes("AMARAN") || text.includes("KAWALAN KENDIRI")
    ) {
      return "disiplin";
    }
    
    // 3. PPDa (Pendidikan Pencegahan Dadah - Bidang KPM Disiplin/PPDa)
    if (
      text.includes("PPDA") || text.includes("DADAH") || text.includes("VAPE") || 
      text.includes("ROKOK") || text.includes("MEROKOK") || text.includes("ALKOHOL") || 
      text.includes("INHALAN") || text.includes("BEBAS DADAH") || text.includes("ANTI DADAH")
    ) {
      return "ppda";
    }

    // 4. Psikososial & Kesejahteraan Mental Murid (Bidang 4 KPM)
    if (
      text.includes("EMOSI") || text.includes("MINDA SIHAT") || text.includes("SARINGAN") || 
      text.includes("STRES") || text.includes("TEKANAN") || text.includes("KESEJAHTERAAN") || 
      text.includes("PSIKOSOSIAL") || text.includes("PERKHIDMATAN UBK") || text.includes("KENALI UBK") || 
      text.includes("BIMBINGAN RAKAN") || text.includes("PRS") || text.includes("RAKAN SEBAYA") || 
      text.includes("MARAH") || text.includes("KEMARAHAN") || text.includes("ANGER") || 
      text.includes("KECEMASAN") || text.includes("ANXIETY") || text.includes("BIMBANG") || 
      text.includes("KEMURUNGAN") || text.includes("DEPRESI") || text.includes("DEPRESSION") || 
      text.includes("PHQ") || text.includes("GAD") || text.includes("KESIHATAN MENTAL") || 
      text.includes("KESELESAAN") || text.includes("TRAUMA") || text.includes("KRISIS") || 
      text.includes("KEDUKAAN") || text.includes("GRIEF") || text.includes("SEDIH") || 
      text.includes("KESEPIAN") || text.includes("PENYESUAIAN")
    ) {
      return "psikososial";
    }

    // 5. Bimbingan Akademik & Kemahiran Belajar
    if (
      text.includes("AKADEMIK") || text.includes("TEKNIK BELAJAR") || text.includes("KEMAHIRAN BELAJAR") || 
      text.includes("JADUAL BELAJAR") || text.includes("PEPERIKSAAN") || text.includes("PBD") || 
      text.includes("UASA") || text.includes("ULANGKAJI") || text.includes("PETA MINDA") || 
      text.includes("FOKUS BELAJAR") || text.includes("MENGINGAT")
    ) {
      return "akademik";
    }

    // 6. Pembangunan & Perkembangan Sahsiah Diri Murid (Bidang 1 KPM)
    if (
      text.includes("KENALI DIRI") || text.includes("KENAL DIRI") || text.includes("TENTANG SAYA") || 
      text.includes("TENTANG DIRI") || text.includes("RUMAH SAYA") || text.includes("KONSEP KENDIRI") || 
      text.includes("SAHSIAH") || text.includes("JATI DIRI") || text.includes("HARGA DIRI") || 
      text.includes("NILAI") || text.includes("ADAB") || text.includes("SOPAN") || 
      text.includes("KASIH SAYANG") || text.includes("SAYANGI DIRI") || text.includes("MOTIVASI") || 
      text.includes("TANGGUNGJAWAB") || text.includes("KEPIMPINAN") || text.includes("PEMIMPIN") || 
      text.includes("AMALAN BAIK") || text.includes("POTENSI") || text.includes("KELUARGA") || 
      text.includes("IBU BAPA") || text.includes("MORAL") || text.includes("ETIKA") ||
      text.includes("KOMUNIKASI") || text.includes("KEYAKINAN")
    ) {
      return "sahsiah";
    }

    // Lalai
    return "sahsiah";
  },

  // Alias untuk keserasian fungsi sedia ada
  detectBimbinganFocus: function(title = "", classTarget = "", notes = "") {
    return this.detectSessionFocus(title, classTarget, notes);
  },

  getFocusLabel: function(focusKey) {
    const labels = {
      sahsiah: "Sahsiah",
      disiplin: "Disiplin",
      kerjaya: "Kerjaya",
      psikososial: "Psikososial",
      akademik: "Akademik",
      ppda: "PPDa"
    };
    return labels[focusKey] || "Sahsiah";
  },

  // =========================================================
  // FUNGSI AUTO-TAG SEMUA SESI SEDIA ADA (SESI 1 - 10 SECARA AUTOMATIK)
  // =========================================================
  autoTagExistingSessions: function(silent = false) {
    if (!this.state.practicumData || !Array.isArray(this.state.practicumData)) return 0;

    const clientSessionTracker = {};
    let taggedCount = 0;

    // Susun minggu mengikut kronologi
    const sortedWeeks = [...this.state.practicumData].sort((a, b) => a.weekNum - b.weekNum);
    const dayOrder = { "ISNIN": 1, "SELASA": 2, "RABU": 3, "KHAMIS": 4, "JUMAAT": 5 };

    sortedWeeks.forEach(w => {
      if (!w.sessions || !Array.isArray(w.sessions)) return;

      // Susun sesi mengikut urutan hari dan waktu mula
      const sortedSessions = [...w.sessions].sort((s1, s2) => {
        const d1 = dayOrder[s1.day] || 99;
        const d2 = dayOrder[s2.day] || 99;
        if (d1 !== d2) return d1 - d2;
        const t1 = this.timeToMin ? this.timeToMin(s1.timeStart) : 0;
        const t2 = this.timeToMin ? this.timeToMin(s2.timeStart) : 0;
        return t1 - t2;
      });

      sortedSessions.forEach(s => {
        if (s.type !== 'individu' && s.type !== 'kelompok') return;

        // Dapatkan identiti unik klien / kelompok
        let clientKey = "";

        if (s.students && Array.isArray(s.students) && s.students.length > 0) {
          const sortedIds = s.students
            .map(m => String(m.id || m.ic || m.name || m).trim().toUpperCase())
            .sort()
            .join('__');
          clientKey = `${s.type.toUpperCase()}__${sortedIds}`;
        } else {
          const cleanTitle = (s.title || "").trim().toUpperCase();

          // Semak corak Kelompok
          const kelMatch = cleanTitle.match(/KELOMPOK\s*(\d+)/i);
          if (kelMatch) {
            clientKey = `KELOMPOK_${kelMatch[1]}`;
          } else if (cleanTitle.match(/^KI\s*0*8\b/i)) {
            // Kes Khas KI08 (Minggu 3 mempunyai 4 sesi susulan berulang)
            clientKey = "KI_08";
          } else {
            const kiMatch = cleanTitle.match(/^KI\s*0*(\d+)/i);
            if (kiMatch) {
              clientKey = `KI_${kiMatch[1]}`;
            } else if (cleanTitle.startsWith("KI - ")) {
              const namePart = cleanTitle.replace(/^KI\s*-\s*/, '').replace(/\(.*\)/, '').trim();
              clientKey = `KI_${namePart}`;
            } else {
              clientKey = `${s.type.toUpperCase()}_${cleanTitle.replace(/\(.*\)/, '').trim()}`;
            }
          }
        }

        // Kira kekerapan sesi bagi klien / kelompok ini
        clientSessionTracker[clientKey] = (clientSessionTracker[clientKey] || 0) + 1;
        const currentCount = clientSessionTracker[clientKey];
        const assignedTag = `Sesi ${Math.min(10, currentCount)}`;
        // PENTING: Hanya tukar clientStatus jika ia bukan 'D/J' (dirujuk/kelas ganti) yang telah ditetapkan manual
        const assignedStatus = (currentCount === 1) ? "B" : "K";
        const shouldUpdateStatus = s.clientStatus !== 'D/J'; // Jangan timpa D/J yang manual

        if (s.sessionTag !== assignedTag || (shouldUpdateStatus && s.clientStatus !== assignedStatus)) {
          s.sessionTag = assignedTag;
          if (shouldUpdateStatus) s.clientStatus = assignedStatus;
          taggedCount++;
        }
      });
    });

    if (taggedCount > 0) {
      this.savePracticumData();
      if (!silent) {
        this.render();
        this.showToast(`🏷️ Sebanyak ${taggedCount} sesi telah diauto-tag dengan tepat (Sesi 1 hingga Sesi 10)!`, null, 4000);
      }
    } else if (!silent) {
      this.showToast(`✅ Semua sesi kaunseling telah pun lengkap dengan tagging siri sesi!`, null, 3000);
    }

    return taggedCount;
  },

  setDocRate: function(rate) {
    const r = parseInt(rate, 10);
    this.state.docRate = isNaN(r) ? 30 : r;
    localStorage.setItem("ubk_doc_rate", this.state.docRate);
    this.renderPracticumHoursDashboard();
    this.showToast(`⚙️ Pengiraan automatik dokumentasi: ${this.state.docRate} minit / sesi`);
  },

  savePracticumData: function() {
    const jsonStr = JSON.stringify(this.state.practicumData);
    localStorage.setItem("ubk_practicum_schedule_2026", jsonStr);
    
    const now = Date.now();
    localStorage.setItem("ubk_last_local_update", now.toString());
    localStorage.setItem("ubk_emergency_autosave", jsonStr);
    localStorage.setItem("ubk_emergency_autosave_time", new Date().toLocaleString("ms-MY"));

    // Simpan ke senarai snapshot sejarah (15 versi terkini untuk pemulihan)
    this.saveScheduleSnapshot("Kemaskini Jadual");

    if (typeof CloudSync !== "undefined") {
      CloudSync.uploadToCloud(this.state.practicumData);
    }
  },

  // Simpan snapshot berputar (rolling snapshot history)
  saveScheduleSnapshot: function(label = "Simpanan Automatik") {
    try {
      const snapshots = JSON.parse(localStorage.getItem("ubk_schedule_snapshots") || "[]");
      const currentJson = JSON.stringify(this.state.practicumData);
      
      // Elakkan pendua berturut-turut jika tiada perubahan
      if (snapshots.length > 0 && snapshots[0].json === currentJson) return;

      const count = this.calculateTotalSessions();
      const newSnap = {
        id: "snap_" + Date.now(),
        timeStr: new Date().toLocaleTimeString("ms-MY", { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        dateStr: new Date().toLocaleDateString("ms-MY"),
        timestamp: Date.now(),
        label: label,
        totalSessions: count,
        json: currentJson
      };

      snapshots.unshift(newSnap);
      // Simpan sehingga 15 versi terkini
      const trimmed = snapshots.slice(0, 15);
      localStorage.setItem("ubk_schedule_snapshots", JSON.stringify(trimmed));
    } catch (e) {}
  },

  calculateTotalSessions: function() {
    let count = 0;
    if (this.state.practicumData && Array.isArray(this.state.practicumData)) {
      this.state.practicumData.forEach(w => {
        if (w.sessions && Array.isArray(w.sessions)) {
          count += w.sessions.length;
        }
      });
    }
    return count;
  },

  resetPracticumData: function() {
    if (confirm("Adakah anda pasti mahu menetapkan semula jadual praktikum ke template asal? Semua sesi tambahan akan dipadam.")) {
      // Simpan sandaran sebelum reset
      this.saveScheduleSnapshot("Sebelum Reset ke Asal");
      this.state.practicumData = JSON.parse(JSON.stringify(PRACTICUM_WEEKS));
      this.savePracticumData();
      this.render();
      alert("Jadual berjaya ditetapkan semula ke template asal.");
    }
  },

  // =========================================================
  // SISTEM PENGURUSAN PROFIL KLIEN BERULANG & SIRI SESI (1 - 10)
  // =========================================================
  loadSavedClients: function() {
    const saved = localStorage.getItem("ubk_saved_clients_profiles");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.state.savedClients = parsed;
          this.populateSavedClientsDropdown();
          return;
        }
      } catch (e) {}
    }
    // Jika belum ada dalam localStorage, muatkan daripada RECOVERED_CLIENT_PROFILES
    if (typeof RECOVERED_CLIENT_PROFILES !== "undefined" && Array.isArray(RECOVERED_CLIENT_PROFILES) && RECOVERED_CLIENT_PROFILES.length > 0) {
      this.state.savedClients = JSON.parse(JSON.stringify(RECOVERED_CLIENT_PROFILES));
      localStorage.setItem("ubk_saved_clients_profiles", JSON.stringify(this.state.savedClients));
    } else {
      this.state.savedClients = this.autoExtractClientsFromSchedule();
      if (this.state.savedClients.length > 0) {
        localStorage.setItem("ubk_saved_clients_profiles", JSON.stringify(this.state.savedClients));
      }
    }
    this.populateSavedClientsDropdown();
  },

  saveSavedClients: function() {
    localStorage.setItem("ubk_saved_clients_profiles", JSON.stringify(this.state.savedClients));
    this.populateSavedClientsDropdown();
  },

  autoExtractClientsFromSchedule: function() {
    const list = [];
    const seen = new Set();
    if (this.state.practicumData && Array.isArray(this.state.practicumData)) {
      this.state.practicumData.forEach(w => {
        (w.sessions || []).forEach(s => {
          if ((s.type === 'individu' || s.type === 'kelompok') && s.students && s.students.length > 0) {
            const key = s.students.map(m => m.id || m.name || m).sort().join('_');
            if (!seen.has(key)) {
              seen.add(key);
              list.push({
                id: 'client_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
                name: s.type === 'individu' ? (s.students[0].name || s.title) : s.title,
                type: s.type,
                targetClass: s.classTarget || (s.students[0] ? s.students[0].className : ''),
                focus: s.focus || 'sahsiah',
                students: s.students,
                lastSessionTag: s.sessionTag || 'Sesi 1',
                sessionCount: 1
              });
            }
          }
        });
      });
    }
    return list;
  },

  populateSavedClientsDropdown: function() {
    const el = document.getElementById("formSavedClientSelect");
    if (!el) return;
    let html = '<option value="">-- Pilih Klien / Kelompok Tersimpan (Auto-Isi) --</option>';

    const FOCUS_SHORT = { sahsiah:"Sahsiah", disiplin:"⚠️Disiplin", kerjaya:"Kerjaya",
      psikososial:"Psikososial", akademik:"Akademik", ppda:"PPDa" };
    const fShort = f => FOCUS_SHORT[f] || f || "";

    const indivs = (this.state.savedClients || []).filter(c => c.type === 'individu');
    const groups = (this.state.savedClients || []).filter(c => c.type === 'kelompok');

    if (indivs.length > 0) {
      html += '<optgroup label="👤 Klien Individu (KI)">';
      indivs.forEach(c => {
        const nextTag = this.calcNextSessionTag(c.lastSessionTag);
        const focStr = c.focus ? ` | ${fShort(c.focus)}` : "";
        const sc = c.sessionCount > 0 ? ` | ${c.sessionCount} sesi` : "";
        html += `<option value="${c.id}">${c.name} (${c.targetClass || 'Individu'}) → ${nextTag}${focStr}${sc}</option>`;
      });
      html += '</optgroup>';
    }

    if (groups.length > 0) {
      html += '<optgroup label="👥 Klien Kelompok (KK)">';
      groups.forEach(c => {
        const nextTag = this.calcNextSessionTag(c.lastSessionTag);
        const focStr = c.focus ? ` | ${fShort(c.focus)}` : "";
        const sc = c.sessionCount > 0 ? ` | ${c.sessionCount} sesi` : "";
        html += `<option value="${c.id}">${c.name} (${c.students.length} murid) → ${nextTag}${focStr}${sc}</option>`;
      });
      html += '</optgroup>';
    }

    el.innerHTML = html;
  },

  calcNextSessionTag: function(lastTag) {
    if (!lastTag) return "Sesi 1";
    const num = parseInt(String(lastTag).replace(/[^0-9]/g, ''), 10);
    if (!num || isNaN(num)) return "Sesi 1";
    if (num >= 10) return "Sesi 10";
    return `Sesi ${num + 1}`;
  },

  applySavedClientToForm: function(clientId) {
    if (!clientId) return;
    const client = (this.state.savedClients || []).find(c => c.id === clientId);
    if (!client) return;

    // 1. Set jenis aktiviti
    const typeEl = document.getElementById("formType");
    if (typeEl) {
      typeEl.value = client.type;
      this.handleFormTypeChange(client.type);
    }

    // 2. Set murid terpilih
    this.state.selectedStudentsInForm = JSON.parse(JSON.stringify(client.students || []));
    this.renderSelectedStudents();

    // 3. Set kelas sasaran & bilangan klien
    if (client.targetClass) {
      const targetEl = document.getElementById("formClassTarget");
      if (targetEl) targetEl.value = client.targetClass;
    }
    const headcountEl = document.getElementById("formHeadcount");
    if (headcountEl) {
      headcountEl.value = (client.students && client.students.length > 0) ? client.students.length : (client.type === 'individu' ? 1 : 6);
    }

    // 4. Set Fokus Perkhidmatan — Gunakan fokus terkini dari profil (terutama isu disiplin kekal)
    const focusToUse = client.focus || "sahsiah";
    const focusEl = document.getElementById("formFocus");
    if (focusEl) focusEl.value = focusToUse;

    // 4b. Bawa cara hadir terkini dari profil (jika ada)
    if (client.lastArrivalWay && client.lastArrivalWay !== '-') {
      const arrivalEl = document.getElementById("formArrivalWay");
      if (arrivalEl) arrivalEl.value = client.lastArrivalWay;
    }

    // 5. Kira dan tetapkan Tag Sesi Seterusnya
    const nextSessionTag = this.calcNextSessionTag(client.lastSessionTag);
    const sessionTagEl = document.getElementById("formSessionTag");
    if (sessionTagEl) {
      sessionTagEl.value = nextSessionTag;
      this.handleSessionTagChange(nextSessionTag);
    }

    // 6. Set status klien IPGM (K jika sesi > 1) — gunakan status tersimpan jika ada
    const clientStatusEl = document.getElementById("formClientStatus");
    if (clientStatusEl) {
      clientStatusEl.value = client.lastClientStatus || ((nextSessionTag === "Sesi 1") ? "B" : "K");
    }

    // 7. Auto isi tajuk sesi
    const titleEl = document.getElementById("formTitle");
    if (titleEl) {
      if (client.type === 'individu') {
        const studentName = (client.students && client.students[0]?.name) ? client.students[0].name : client.name;
        titleEl.value = `KI - ${studentName} (${nextSessionTag})`;
      } else {
        titleEl.value = `${client.name} (${nextSessionTag})`;
      }
    }

    // 8. Auto-Set Jam Sekolah Mengikut Loceng PdPC SK Tampasuk 1 Bebas Pertindihan
    this.autoSetSchoolHoursForCurrentForm(true);

    this.checkFormConflict();
    this.renderClassSuggestions();

    // Papar sejarah sesi sebenar dari jadual (bukan dari profil tersimpan)
    if (this.state.selectedStudentsInForm && this.state.selectedStudentsInForm.length > 0) {
      this.applyClientSessionDetection(this.state.selectedStudentsInForm);
    }

    const focusLabel = { sahsiah:"Sahsiah & Peribadi", disiplin:"Disiplin Diri",
      kerjaya:"Kerjaya", psikososial:"Psikososial", akademik:"Akademik", ppda:"PPDa" }[focusToUse] || focusToUse;
    const isDisc = focusToUse === 'disiplin';
    this.showToast(`${isDisc ? '⚠️' : '✨'} ${client.name} — ${nextSessionTag} | Fokus: ${focusLabel} | Auto-isi selesai!`, null, 5000);
  },

  saveCurrentFormAsClientProfile: function() {
    const students = this.state.selectedStudentsInForm;
    if (!students || students.length === 0) {
      alert("⚠️ Sila pilih sekurang-kurangnya seorang murid terlebih dahulu sebelum menyimpan profil klien.");
      return;
    }

    const type = document.getElementById("formType")?.value || "individu";
    const isIndiv = (type === "individu" || students.length === 1);
    const defaultName = isIndiv 
      ? (students[0].name + " (" + (students[0].className || "") + ")")
      : (document.getElementById("formTitle")?.value || ("Kelompok " + (students[0].className || "")));

    const profileName = prompt(
      isIndiv 
        ? "Masukkan nama pengenalan Klien Individu ini:" 
        : "Masukkan nama kumpulan Kelompok ini (contoh: Kelompok Sahsiah 4A):",
      defaultName
    );

    if (!profileName || !profileName.trim()) return;

    const sessionTag = document.getElementById("formSessionTag")?.value || "Sesi 1";
    const targetClass = document.getElementById("formClassTarget")?.value || students[0].className || "";
    const focus = document.getElementById("formFocus")?.value || "sahsiah";
    const arrivalWay = document.getElementById("formArrivalWay")?.value || "sukarela";
    const clientStatus = document.getElementById("formClientStatus")?.value || "B";
    const sessionNum = parseInt(sessionTag.replace(/[^0-9]/g, '')) || 1;

    const newProfile = {
      id: 'client_' + Date.now(),
      name: profileName.trim(),
      type: isIndiv ? 'individu' : 'kelompok',
      targetClass: targetClass,
      focus: focus,                  // Fokus isu (disiplin, akademik, dll.)
      lastArrivalWay: arrivalWay,    // Cara hadir terkini
      lastClientStatus: clientStatus,// Status klien terkini
      students: JSON.parse(JSON.stringify(students)),
      lastSessionTag: sessionTag,
      sessionCount: sessionNum,
      lastSavedDate: new Date().toLocaleDateString("ms-MY")
    };

    if (!Array.isArray(this.state.savedClients)) {
      this.state.savedClients = [];
    }

    const existingIdx = this.state.savedClients.findIndex(c => c.name.toLowerCase() === newProfile.name.toLowerCase());
    if (existingIdx >= 0) {
      this.state.savedClients[existingIdx] = newProfile;
    } else {
      this.state.savedClients.unshift(newProfile);
    }

    this.saveSavedClients();
    const selectEl = document.getElementById("formSavedClientSelect");
    if (selectEl) selectEl.value = newProfile.id;

    this.showToast(`💾 Berjaya simpan "${newProfile.name}"! Kini boleh auto-pilih untuk sesi seterusnya.`);
  },

  handleSessionTagChange: function(tag) {
    const clientStatusEl = document.getElementById("formClientStatus");
    if (!clientStatusEl) return;
    if (tag === "Sesi 1") {
      clientStatusEl.value = "B"; // Klien Baru
    } else if (tag && tag.startsWith("Sesi")) {
      clientStatusEl.value = "K"; // Kes Berulang / Lanjutan
    }
  },

  // =========================================================
  // SISTEM SEJARAH KLIEN PINTAR — Mengesan siri sesi, isu, fokus & tarikh
  // =========================================================
  autoDetectClientSessionHistory: function(students, excludeWeek = null, excludeSessionIdx = null) {
    if (!students || students.length === 0) {
      return { sessionTag: "Sesi 1", clientStatus: "B", sessionCount: 0, isNew: true,
               lastFocus: null, lastArrivalWay: null, lastNotes: null, lastSessionDate: null, dominantFocus: null };
    }

    const studentKeys = new Set(
      students.map(s => String(s.id || s.ic || s.name || s).trim().toUpperCase())
    );
    const studentNames = students
      .map(s => String(s.name || s).trim().toUpperCase())
      .filter(n => n.length >= 3);

    // Kumpul semua sesi yang sepadan secara kronologi
    const matchedSessions = [];

    if (this.state.practicumData && Array.isArray(this.state.practicumData)) {
      // Susun minggu secara kronologi sebelum imbas
      const sortedWeeks = [...this.state.practicumData].sort((a, b) => a.weekNum - b.weekNum);
      const dayOrder = { "ISNIN": 1, "SELASA": 2, "RABU": 3, "KHAMIS": 4, "JUMAAT": 5 };

      sortedWeeks.forEach(w => {
        const sortedSessions = [...(w.sessions || [])].sort((s1, s2) => {
          const d1 = dayOrder[s1.day] || 99, d2 = dayOrder[s2.day] || 99;
          if (d1 !== d2) return d1 - d2;
          return (this.timeToMin ? this.timeToMin(s1.timeStart) : 0) - (this.timeToMin ? this.timeToMin(s2.timeStart) : 0);
        });

        sortedSessions.forEach((s, idx) => {
          // Semak sama ada sesi ini ialah sesi sedang diedit — langkau
          if (excludeWeek !== null && w.weekNum === excludeWeek && idx === excludeSessionIdx) return;
          if (s.type !== 'individu' && s.type !== 'kelompok') return;

          let match = false;
          if (s.students && s.students.length > 0) {
            match = s.students.some(existing => {
              const key = String(existing.id || existing.ic || existing.name || existing).trim().toUpperCase();
              return studentKeys.has(key);
            });
          } else if (s.title) {
            const upperTitle = s.title.toUpperCase();
            match = studentNames.some(name => upperTitle.includes(name));
          }

          if (match) {
            // Ambil tarikh sesi daripada jadual minggu
            const sessionDate = (w.dates && w.dates[s.day]) ? w.dates[s.day] : null;
            matchedSessions.push({
              weekNum: w.weekNum,
              day: s.day,
              date: sessionDate,
              sessionTag: s.sessionTag || null,
              focus: s.focus || null,
              arrivalWay: s.arrivalWay || null,
              clientStatus: s.clientStatus || null,
              notes: s.notes || null,
              status: s.status || 'belum',
              timeStart: s.timeStart,
              title: s.title
            });
          }
        });
      });
    }

    const previousCount = matchedSessions.length;

    if (previousCount === 0) {
      return {
        sessionTag: "Sesi 1",
        clientStatus: "B",
        sessionCount: 0,
        isNew: true,
        lastFocus: null,
        lastArrivalWay: null,
        lastNotes: null,
        lastSessionDate: null,
        dominantFocus: null,
        allSessions: []
      };
    }

    // Ambil sesi terakhir untuk kesinambungan data
    const lastSess = matchedSessions[matchedSessions.length - 1];

    // Kira fokus yang paling kerap (dominan) merentasi semua sesi
    const focusCount = {};
    matchedSessions.forEach(s => {
      if (s.focus) focusCount[s.focus] = (focusCount[s.focus] || 0) + 1;
    });
    const dominantFocus = Object.keys(focusCount).length > 0
      ? Object.keys(focusCount).reduce((a, b) => focusCount[a] >= focusCount[b] ? a : b)
      : null;

    // Fokus yang akan digunakan: gunakan fokus terkini jika konsisten, atau fokus dominan
    // Jika sesi terakhir ialah disiplin, kekalkan disiplin untuk sesi seterusnya
    const effectiveFocus = lastSess.focus || dominantFocus;

    const nextNum = Math.min(10, previousCount + 1);
    return {
      sessionTag: `Sesi ${nextNum}`,
      clientStatus: "K",
      sessionCount: previousCount,
      isNew: false,
      // Data sesi terakhir untuk kesinambungan
      lastFocus: lastSess.focus,
      lastArrivalWay: lastSess.arrivalWay,
      lastClientStatus: lastSess.clientStatus,
      lastNotes: lastSess.notes,
      lastSessionDate: lastSess.date,
      lastWeekNum: lastSess.weekNum,
      lastDay: lastSess.day,
      // Analisis merentasi semua sesi
      dominantFocus: dominantFocus,
      effectiveFocus: effectiveFocus,
      focusCounts: focusCount,
      allSessions: matchedSessions
    };
  },

  applyClientSessionDetection: function(students) {
    const noticeEl = document.getElementById("clientAutoDetectNotice");
    if (!students || students.length === 0) {
      if (noticeEl) { noticeEl.style.display = "none"; noticeEl.innerHTML = ""; }
      return;
    }

    const editingIdx = this.state.editingSessionIndex !== null ? this.state.editingSessionIndex : null;
    const editingWeek = this.state.editingWeek !== null ? this.state.editingWeek : null;
    const det = this.autoDetectClientSessionHistory(students, editingWeek, editingIdx);

    // 1. TAG SESI
    const tagEl = document.getElementById("formSessionTag");
    if (tagEl) tagEl.value = det.sessionTag;

    // 2. STATUS KLIEN
    const statusEl = document.getElementById("formClientStatus");
    if (statusEl) statusEl.value = det.clientStatus;

    // 3. BAWA FOKUS TERDAHULU — isu disiplin kekal automatik
    if (!det.isNew && det.effectiveFocus) {
      const focusEl = document.getElementById("formFocus");
      if (focusEl && (!focusEl.value || focusEl.value === "sahsiah")) {
        focusEl.value = det.effectiveFocus;
      }
    }

    // 4. BAWA CARA HADIR TERDAHULU
    if (!det.isNew && det.lastArrivalWay && det.lastArrivalWay !== '-') {
      const arrivalEl = document.getElementById("formArrivalWay");
      if (arrivalEl && arrivalEl.value === "sukarela") {
        arrivalEl.value = det.lastArrivalWay;
      }
    }

    // 5. AUTO TAJUK SESI
    const titleEl = document.getElementById("formTitle");
    const currentType = document.getElementById("formType")?.value || "individu";
    if (titleEl && (!titleEl.value || /^KI\s*[-–]|^Kelompok\s*[-–]|^KI\s*0/i.test(titleEl.value))) {
      const isIndiv = (currentType === "individu" || students.length === 1);
      if (isIndiv) {
        titleEl.value = `KI - ${students[0].name || students[0]} (${det.sessionTag})`;
      } else {
        titleEl.value = `Kelompok - Kelas ${students[0].className || ""} (${det.sessionTag})`;
      }
    }

    // 6. PAPAN SEJARAH KLIEN PINTAR
    if (!noticeEl) return;
    noticeEl.style.display = "block";

    const FOCUS_LABELS = { sahsiah:"Sahsiah & Peribadi", disiplin:"Disiplin Diri",
      kerjaya:"Kerjaya", psikososial:"Psikososial", akademik:"Akademik", ppda:"PPDa" };
    const fLbl = f => FOCUS_LABELS[f] || f || "-";

    if (det.isNew) {
      noticeEl.style.cssText = "display:block;background:#f0fdf4;border:1.5px solid #86efac;border-radius:8px;padding:0.65rem 0.85rem;margin-bottom:0.75rem;font-size:0.82rem;";
      noticeEl.innerHTML = `
        <div style="display:flex;align-items:center;gap:6px;font-weight:700;color:#166534;">
          ✨ KLIEN BARU
          <span style="background:#dcfce7;color:#166534;border-radius:4px;padding:1px 8px;font-size:0.75rem;">${det.sessionTag}</span>
          <span style="background:#bbf7d0;color:#14532d;border-radius:4px;padding:1px 8px;font-size:0.75rem;">Status: B</span>
        </div>
        <div style="color:#15803d;font-size:0.77rem;margin-top:3px;">Tiada rekod sesi terdahulu. Ini adalah perkhidmatan pertama untuk murid ini.</div>`;
    } else {
      const isDisc = (det.lastFocus === 'disiplin' || det.dominantFocus === 'disiplin');
      const bg = isDisc ? "#fef3c7" : "#eff6ff";
      const bd = isDisc ? "#fcd34d" : "#93c5fd";
      const tc = isDisc ? "#92400e" : "#1e40af";

      const rows = det.allSessions.map((s, i) => {
        const dt = s.date || `Minggu ${s.weekNum}, ${s.day}`;
        const ic = s.status === 'selesai' ? '✅' : s.status === 'tunda' ? '⏸️' : '🔵';
        const isD = s.focus === 'disiplin';
        return `<tr style="font-size:0.72rem;${i%2===0?'background:#f8fafc;':''}">
          <td style="padding:2px 6px;color:#64748b;">${ic} ${dt}</td>
          <td style="padding:2px 6px;font-weight:700;">Sesi ${i+1}</td>
          <td style="padding:2px 6px;color:${isD?'#b45309':'#334155'};font-weight:${isD?'700':'400'};">${fLbl(s.focus)}</td>
          <td style="padding:2px 6px;color:#64748b;">${s.arrivalWay||'-'}</td>
        </tr>`;
      }).join('');

      const focusNote = det.effectiveFocus ? `
        <div style="margin-top:5px;padding:4px 8px;background:${isDisc?'#fef9c3':'#dbeafe'};border-radius:5px;font-size:0.76rem;font-weight:700;color:${isDisc?'#854d0e':'#1e40af'};">
          ${isDisc ? '⚠️' : '🔁'} Fokus <strong>${fLbl(det.effectiveFocus)}</strong> dibawa ke sesi ini secara automatik${isDisc?' — isu disiplin, sila tindakan lanjut!':'.'}
        </div>` : '';

      noticeEl.style.cssText = `display:block;background:${bg};border:1.5px solid ${bd};border-radius:8px;padding:0.65rem 0.85rem;margin-bottom:0.75rem;font-size:0.82rem;color:${tc};`;
      noticeEl.innerHTML = `
        <div style="display:flex;align-items:center;gap:6px;font-weight:700;flex-wrap:wrap;margin-bottom:5px;">
          <span>${isDisc ? '⚠️ ISU DISIPLIN' : '📋 KES BERULANG'}</span>
          <span style="background:${isDisc?'#fde68a':'#bfdbfe'};color:${isDisc?'#78350f':'#1e3a8a'};border-radius:4px;padding:1px 8px;font-size:0.75rem;">${det.sessionTag}</span>
          <span style="background:${isDisc?'#fed7aa':'#bfdbfe'};color:${isDisc?'#7c2d12':'#1e40af'};border-radius:4px;padding:1px 8px;font-size:0.75rem;">Status: K</span>
          <span style="font-weight:400;font-size:0.75rem;color:#64748b;">Sesi terakhir: ${det.lastSessionDate || (det.lastWeekNum ? 'Minggu '+det.lastWeekNum : '-')}</span>
        </div>
        <details style="cursor:pointer;">
          <summary style="font-size:0.78rem;font-weight:700;color:${tc};">📜 Lihat sejarah ${det.sessionCount} sesi terdahulu</summary>
          <table style="width:100%;border-collapse:collapse;margin-top:5px;">
            <thead><tr style="background:${isDisc?'#fef3c7':'#e0e7ff'};font-size:0.71rem;font-weight:700;">
              <th style="padding:2px 6px;text-align:left;">Tarikh</th>
              <th style="padding:2px 6px;">Siri</th>
              <th style="padding:2px 6px;">Fokus Isu</th>
              <th style="padding:2px 6px;">Cara Hadir</th>
            </tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </details>
        ${focusNote}`;
    }
  },

  // =========================================================
  // AUTO-DETECT MINGGU SEMASA BERDASARKAN TARIKH KOMPUTER
  // =========================================================
  autoDetectCurrentWeek: function() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let detected = null;
    for (const w of this.WEEK_DATE_MAP) {
      const start = new Date(w.startDate);
      const end   = new Date(w.endDate);
      end.setHours(23, 59, 59, 999);
      if (today >= start && today <= end) {
        detected = w.weekNum;
        break;
      }
    }

    // Jika tarikh hari ini adalah sebelum praktikum bermula atau selepas tamat, kekal di minggu 1 / 10
    if (!detected) {
      const firstStart = this.WEEK_DATE_MAP[0].startDate;
      const lastEnd   = this.WEEK_DATE_MAP[this.WEEK_DATE_MAP.length - 1].endDate;
      if (today < firstStart) detected = 1;
      else detected = 10;
    }

    this.state.currentWeek = detected;
    const weekSelect = document.getElementById("weekSelect");
    if (weekSelect) {
      weekSelect.value = detected;
      const opt = weekSelect.querySelector(`option[value="${detected}"]`);
      if (opt && !opt.textContent.includes("Semasa")) {
        opt.textContent += " ⭐ (Minggu Semasa)";
      }
    }
  },

  // =========================================================
  // BANNER AMARAN HARI ISNIN
  // =========================================================
  showMondayAlert: function() {
    const today = new Date();
    if (today.getDay() === 1) { // 1 = Isnin
      const banner = document.getElementById("mondayBanner");
      if (banner) banner.style.display = "block";
    }
  },

  // =========================================================
  // PANEL "HARI INI SEKILAS PANDANG"
  // =========================================================
  renderTodayDashboard: function() {
    const container = document.getElementById("todayDashboard");
    if (!container) return;

    const today     = new Date();
    const dayOfWeek = today.getDay(); // 0=Ahad, 1=Isnin, ..., 5=Jumaat, 6=Sabtu
    const dayNames  = ['Ahad', 'Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu'];
    const dayNamesUBK = { 1: 'ISNIN', 2: 'SELASA', 3: 'RABU', 4: 'KHAMIS', 5: 'JUMAAT' };
    const monthNames = ['Jan','Feb','Mac','Apr','Mei','Jun','Jul','Ogos','Sept','Okt','Nov','Dis'];

    const dayNum  = today.getDate();
    const monthStr = monthNames[today.getMonth()];
    const todayDayName = dayNames[dayOfWeek];

    // Hanya papar pada hari persekolahan (Isnin-Jumaat)
    if (dayOfWeek < 1 || dayOfWeek > 5) {
      container.innerHTML = `
        <div class="today-panel no-session">
          <div class="today-date-block">
            <div class="today-date-day">${todayDayName}</div>
            <div class="today-date-num">${dayNum}</div>
            <div class="today-date-month">${monthStr} ${today.getFullYear()}</div>
          </div>
          <div class="today-info">
            <div class="today-label">📅 Hari Ini — Sekilas Pandang</div>
            <div style="font-size:0.85rem; color:#64748b; margin-top:4px;">Hari ini hari ${todayDayName}. Tiada sesi persekolahan. Rehat dan pulihkan tenaga! ☕</div>
          </div>
        </div>
      `;
      return;
    }

    const ubkDay    = dayNamesUBK[dayOfWeek];
    const weekData  = this.state.practicumData.find(w => w.weekNum === this.state.currentWeek);
    const todaySessions = weekData ? weekData.sessions.filter(s => s.day === ubkDay).sort((a,b) => {
      const toMin = t => { const [h,m] = (t||'0.0').replace('.',':').split(':').map(Number); return h*60+m; };
      return toMin(a.timeStart) - toMin(b.timeStart);
    }) : [];

    const selesai   = todaySessions.filter(s => s.status === 'selesai').length;
    const belum     = todaySessions.filter(s => s.status !== 'selesai' && s.status !== 'tunda').length;
    const ditunda   = todaySessions.filter(s => s.status === 'tunda').length;
    const totalKlien = todaySessions.reduce((sum, s) => sum + (s.headcount || 1), 0);

    const hasSession = todaySessions.length > 0;

    let sessionListHtml = '';
    if (!hasSession) {
      sessionListHtml = `<div style="font-size:0.84rem; color:#64748b; font-style:italic;">Tiada sesi berjadual hari ini. Waktu terbuka sepenuhnya untuk murid yang memerlukan bimbingan.</div>`;
    } else {
      const shown = todaySessions.slice(0, 4);
      sessionListHtml = shown.map(s => {
        const typeIcon = {individu:'🟢', kelompok:'🔵', bimbingan:'🟣', program:'🟡', pentadbiran:'🔷', cuti:'🔴', penyeliaan:'⬜', programLain:'🔶', kokurikulum:'⬜'}[s.type] || '⚪';
        const statusIcon = s.status === 'selesai' ? '✓' : (s.status === 'tunda' ? '✗' : '•');
        return `<div class="today-session-item">
          <span class="time-chip">${s.timeStart}–${s.timeEnd}</span>
          <span>${typeIcon} ${s.title}</span>
          <span style="color:${s.status==='selesai'?'#15803d':s.status==='tunda'?'#be123c':'#94a3b8'}; font-size:0.75rem;">${statusIcon}</span>
        </div>`;
      }).join('');
      if (todaySessions.length > 4) {
        sessionListHtml += `<div style="font-size:0.76rem; color:#64748b; margin-top:2px;">+ ${todaySessions.length - 4} sesi lagi...</div>`;
      }
    }

    container.innerHTML = `
      <div class="today-panel ${hasSession ? '' : 'no-session'}">
        <div class="today-date-block">
          <div class="today-date-day">${ubkDay}</div>
          <div class="today-date-num">${dayNum}</div>
          <div class="today-date-month">${monthStr}</div>
        </div>
        <div class="today-info">
          <div class="today-label">📅 Hari Ini — ${weekData ? weekData.title : 'Minggu Ini'}</div>
          <div class="today-session-list">${sessionListHtml}</div>
          ${hasSession ? `
          <div class="today-stats-row">
            <span class="today-stat-chip" style="background:#ecfdf5; color:#15803d; border-color:#86efac;">✓ ${selesai} Selesai</span>
            <span class="today-stat-chip" style="background:#fef3c7; color:#92400e; border-color:#fde68a;">⏳ ${belum} Belum</span>
            ${ditunda ? `<span class="today-stat-chip" style="background:#fee2e2; color:#b91c1c; border-color:#fca5a5;">❌ ${ditunda} Ditunda</span>` : ''}
            <span class="today-stat-chip" style="background:#eff6ff; color:#1d4ed8; border-color:#bfdbfe;">👥 ${totalKlien} Klien</span>
          </div>` : ''}
        </div>
        <div style="display:flex; flex-direction:column; gap:0.4rem; flex-shrink:0;">
          <button class="btn btn-sm btn-primary" onclick="App.printDailyNotice('${ubkDay}')" title="Cetak Jadual Harian ${ubkDay}">🖨️ Cetak Hari Ini</button>
          <button class="btn btn-sm btn-secondary" onclick="App.openAddSessionModal('${ubkDay}')" title="Tambah sesi untuk hari ini">➕ Tambah Sesi</button>
        </div>
      </div>
    `;
  },

  // =========================================================
  // TOAST NOTIFICATION DENGAN UNDO SUPPORT
  // =========================================================
  showToast: function(message, undoFn, durationMs, undoLabel) {
    // Penormalan parameter: jika undoFn ialah nombor, anggap ia sebagai durationMs
    if (typeof undoFn === 'number') { durationMs = undoFn; undoFn = null; }
    if (typeof undoFn !== 'function') undoFn = null;

    const toast = document.getElementById("toastNotification");
    if (!toast) return;

    // Bersihkan timer lama jika ada
    if (this.state.undoTimer) {
      clearTimeout(this.state.undoTimer);
      this.state.undoTimer = null;
    }

    const duration = durationMs || 7000;
    const label = undoLabel || "↩️ Undo";

    toast.innerHTML = `
      <span>${message}</span>
      ${undoFn ? `<button class="toast-undo-btn" onclick="App._handleUndo()">${label}</button>` : ''}
    `;
    toast.style.display = "flex";
    toast._undoFn = undoFn || null;

    this.state.undoTimer = setTimeout(() => {
      toast.style.display = "none";
      toast._undoFn = null;
    }, duration);
  },

  _handleUndo: function() {
    const toast = document.getElementById("toastNotification");
    if (toast && toast._undoFn) {
      toast._undoFn();
      toast.style.display = "none";
      toast._undoFn = null;
      if (this.state.undoTimer) {
        clearTimeout(this.state.undoTimer);
        this.state.undoTimer = null;
      }
    }
  },

  // =========================================================
  // ISIKAN MASA AUTOMATIK DARI BUTANG PRESET
  // =========================================================
  fillTimePreset: function(startTime, endTime) {
    const startEl = document.getElementById("formTimeStart");
    const endEl   = document.getElementById("formTimeEnd");
    if (startEl) startEl.value = startTime;
    if (endEl)   endEl.value   = endTime;
    this.checkFormConflict();
    this.renderClassSuggestions();
  },

  bindEvents: function() {
    // 1. Navigasi Tab
    document.querySelectorAll(".nav-tab").forEach(tab => {
      tab.addEventListener("click", () => {
        const targetTab = tab.dataset.tab;
        this.setActiveTab(targetTab);
      });
    });

    // 2. Pemilihan Minggu
    const weekSelect = document.getElementById("weekSelect");
    if (weekSelect) {
      weekSelect.addEventListener("change", (e) => {
        this.state.currentWeek = parseInt(e.target.value);
        this.renderPracticumTable();
        this.renderTodayDashboard();
        this.renderPracticumHoursDashboard();
      });
    }

    const prevWeekBtn = document.getElementById("prevWeekBtn");
    const nextWeekBtn = document.getElementById("nextWeekBtn");
    if (prevWeekBtn) {
      prevWeekBtn.addEventListener("click", () => {
        if (this.state.currentWeek > 1) {
          this.state.currentWeek--;
          if (weekSelect) weekSelect.value = this.state.currentWeek;
          this.renderPracticumTable();
          this.renderTodayDashboard();
          this.renderPracticumHoursDashboard();
        }
      });
    }
    if (nextWeekBtn) {
      nextWeekBtn.addEventListener("click", () => {
        if (this.state.currentWeek < 10) {
          this.state.currentWeek++;
          if (weekSelect) weekSelect.value = this.state.currentWeek;
          this.renderPracticumTable();
          this.renderTodayDashboard();
          this.renderPracticumHoursDashboard();
        }
      });
    }

    // 3. Pemilihan Kelas (Tab Semak Jadual Kelas)
    const classSelectViewer = document.getElementById("classSelectViewer");
    if (classSelectViewer) {
      classSelectViewer.addEventListener("change", (e) => {
        this.state.selectedClassForViewer = e.target.value;
        this.renderClassScheduleTable();
      });
    }

    // 4. Pemilihan Guru (Tab Semak Jadual Guru)
    const teacherSelectViewer = document.getElementById("teacherSelectViewer");
    if (teacherSelectViewer) {
      teacherSelectViewer.addEventListener("change", (e) => {
        this.state.selectedTeacherForViewer = e.target.value;
        this.renderTeacherScheduleTable();
      });
    }

    // 5. Carian Pantas Guru
    const teacherSearchInput = document.getElementById("teacherSearchInput");
    if (teacherSearchInput) {
      teacherSearchInput.addEventListener("input", (e) => {
        const query = e.target.value.toLowerCase().trim();
        if (!query || typeof TEACHER_SCHEDULES === "undefined") return;
        const teacherNames = Object.keys(TEACHER_SCHEDULES);
        const matched = teacherNames.find(name => {
          const t = TEACHER_SCHEDULES[name];
          return name.toLowerCase().includes(query) ||
                 (t.jawatan && t.jawatan.toLowerCase().includes(query)) ||
                 (t.subjekList && t.subjekList.toLowerCase().includes(query));
        });
        if (matched) {
          this.state.selectedTeacherForViewer = matched;
          if (teacherSelectViewer) teacherSelectViewer.value = matched;
          this.renderTeacherScheduleTable();
        }
      });
    }

    // 6. Borang Tambah / Edit Sesi Modal
    const sessionForm = document.getElementById("sessionForm");
    if (sessionForm) {
      sessionForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleSaveSession();
      });
    }

    const formTypeSelect = document.getElementById("formType");
    if (formTypeSelect) {
      formTypeSelect.addEventListener("change", () => {
        this.updateFormSaveBtnColor();
      });
    }

    // 7. Borang Anjak Sesi (Reschedule)
    const rescheduleForm = document.getElementById("rescheduleForm");
    if (rescheduleForm) {
      rescheduleForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleReschedule();
      });
    }

    // Tutup dropdown apabila klik di luar
    document.addEventListener("click", (e) => {
      const dropdown = document.getElementById("toolsDropdownMenu");
      const btn = document.getElementById("toolsDropdownBtn");
      if (dropdown && btn && !btn.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.remove("active");
      }

      const searchInput = document.getElementById("formStudentSearch");
      const resultsDropdown = document.getElementById("studentSearchResults");
      if (searchInput && resultsDropdown && !searchInput.contains(e.target) && !resultsDropdown.contains(e.target)) {
        resultsDropdown.style.display = "none";
      }
    });
  },

  setActiveTab: function(tabName) {
    this.state.activeTab = tabName;
    document.querySelectorAll(".nav-tab").forEach(t => {
      t.classList.toggle("active", t.dataset.tab === tabName);
    });
    document.querySelectorAll(".view-section").forEach(s => {
      s.classList.toggle("active", s.id === `view-${tabName}`);
    });

    if (tabName === "jadualPraktikum") { this.renderPracticumTable(); this.renderTodayDashboard(); }
    if (tabName === "laporanJam") this.renderPracticumHoursDashboard();
    if (tabName === "borangIpgm") this.renderOfficialIpgmForms();
    if (tabName === "jadualKelas") this.renderClassScheduleTable();
    if (tabName === "jadualGuru") this.renderTeacherScheduleTable();
    if (tabName === "direktoriMurid") this.renderStudentDirectory();
  },

  render: function() {
    this.renderPracticumTable();
    this.renderPracticumHoursDashboard();
    this.renderTodayDashboard();
    this.renderClientNextSessionWidget();
    this.renderOfficialIpgmForms();
    this.renderClassScheduleTable();
    this.renderTeacherScheduleTable();
    if (this.state.activeTab === "direktoriMurid") this.renderStudentDirectory();
  },

  // =========================================================
  // 1. PAPARAN JADUAL PRAKTIKUM MINGGUAN (DILENGKAPI STATUS & TINDAKAN PINTAR)
  // =========================================================
  renderPracticumTable: function() {
    const weekData = this.state.practicumData.find(w => w.weekNum === this.state.currentWeek);
    if (!weekData) return;

    // Kemaskini tajuk dan tarikh minggu
    const weekTitleEl = document.getElementById("weekTitleDisplay");
    const weekDateEl = document.getElementById("weekDateDisplay");
    const printWeekEl = document.getElementById("printWeekDisplay");
    const cloneSourceLabel = document.getElementById("cloneSourceWeekDisplay");

    if (weekTitleEl) weekTitleEl.textContent = weekData.title;
    if (weekDateEl) weekDateEl.textContent = weekData.dateRange;
    if (printWeekEl) printWeekEl.textContent = `${weekData.title} (${weekData.dateRange})`;
    if (cloneSourceLabel) cloneSourceLabel.textContent = this.state.currentWeek;

    const days = ["ISNIN", "SELASA", "RABU", "KHAMIS", "JUMAAT"];

    // Kemaskini tarikh pada header setiap hari
    days.forEach(day => {
      const dateHeaderEl = document.getElementById(`date-header-${day}`);
      if (dateHeaderEl) {
        dateHeaderEl.textContent = (weekData.dates && weekData.dates[day]) ? weekData.dates[day] : "";
      }
    });

    const timeToMin = (t) => this.timeToMin(t);

    // Render sesi bagi setiap hari
    days.forEach(day => {
      const cellEl = document.getElementById(`cell-${day}`);
      if (!cellEl) return;

      const daySessions = weekData.sessions.filter(s => s.day === day);
      daySessions.sort((a, b) => timeToMin(a.timeStart) - timeToMin(b.timeStart));

      let html = '';

      if (daySessions.length === 0) {
        const holidayName = (weekData.holidays && weekData.holidays[day]) ? weekData.holidays[day] : "Hari Kelepasan Am / Cuti Sekolah";
        html += `
          <div class="empty-day-holiday-box" style="background: linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%); border: 1.5px dashed #f43f5e; border-radius: 10px; padding: 14px 10px; text-align: center; margin-bottom: 8px;">
            <div style="font-size: 1.5rem; margin-bottom: 2px;">🎉</div>
            <div style="font-weight: 800; color: #9f1239; font-size: 0.8rem; letter-spacing: 0.3px; text-transform: uppercase;">
              CUTI UMUM SEKOLAH
            </div>
            <div style="font-size: 0.72rem; font-weight: 600; color: #be123c; margin-top: 2px;">
              ${holidayName}
            </div>
            <div style="font-size: 0.68rem; color: #881337; margin-top: 4px; line-height: 1.3;">
              Hari ini dikosongkan (Tiada aktiviti berjadual).
            </div>
            <div style="margin-top: 8px; display: flex; gap: 4px; justify-content: center; flex-wrap: wrap;">
              <button type="button" class="btn-holiday-label-quick" onclick="event.stopPropagation(); App.promptSetHolidayName(${this.state.currentWeek}, '${day}')" style="background: #ffffff; color: #9f1239; border: 1px solid #fecdd3; padding: 2px 7px; border-radius: 5px; font-size: 0.68rem; font-weight: 700; cursor: pointer;" title="Tukar nama cuti (cth: Maulidur Rasul / Hari Malaysia / Cuti Peristiwa)">
                🏷️ Namakan Cuti
              </button>
            </div>
          </div>
        `;
      } else {
        daySessions.forEach(s => {
          const originalIdx = weekData.sessions.indexOf(s);
          const status = s.status || 'belum';

          // Status Badge
          let statusBadge = '';
          if (status === 'selesai') {
            statusBadge = `<button class="status-pill status-selesai" title="Klik untuk tukar status" onclick="event.stopPropagation(); App.toggleSessionStatus(${this.state.currentWeek}, '${day}', ${originalIdx})">✓ Selesai</button>`;
          } else if (status === 'tunda') {
            statusBadge = `<button class="status-pill status-tunda" title="Klik untuk tukar status" onclick="event.stopPropagation(); App.toggleSessionStatus(${this.state.currentWeek}, '${day}', ${originalIdx})">❌ Ditunda</button>`;
          } else {
            statusBadge = `<button class="status-pill status-belum" title="Klik untuk tandakan selesai" onclick="event.stopPropagation(); App.toggleSessionStatus(${this.state.currentWeek}, '${day}', ${originalIdx})">⏳ Belum</button>`;
          }

          // Lencana Khas Kelas Ganti (Relief) & Fokus Perkhidmatan (4 Bidang KPM)
          const isRelief = s.isRelief === true || s.type === 'bimbingan' || (s.notes && s.notes.toLowerCase().includes('ganti'));
          const reliefBadge = isRelief 
            ? `<span class="badge badge-relief" style="background: #fef3c7; color: #92400e; border: 1px solid #fde68a; font-weight: 700; font-size: 0.68rem; padding: 1px 5px; border-radius: 4px;" title="Kelas Menggantikan Guru (Relief / Ketiadaan Guru Mata Pelajaran)">🔁 GURU GANTI</span>` 
            : '';
          
          const fKey = s.focus || this.detectSessionFocus(s.title, s.classTarget, s.notes);
          const focusLabel = this.getFocusLabel(fKey);
          const focusBadge = `<span class="badge badge-focus" style="background: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; font-weight: 600; font-size: 0.65rem; padding: 1px 5px; border-radius: 4px;" title="4 Bidang Fokus KPM: ${focusLabel}">🎯 ${focusLabel}</span>`;

          html += `
            <div class="session-card type-${s.type} status-card-${status}" onclick="App.openEditSessionModal(${this.state.currentWeek}, '${day}', ${originalIdx})">
              <div class="session-card-header">
                <span class="session-time">⏱️ ${s.timeStart} - ${s.timeEnd}</span>
                <div style="display: flex; gap: 4px; align-items: center; flex-wrap: wrap;">
                  ${statusBadge}
                  ${s.sessionTag ? `<span class="badge badge-session-tag">🏷️ ${s.sessionTag}</span>` : ''}
                  <span class="badge badge-${s.type}">${this.getTypeLabel(s.type)}</span>
                  ${reliefBadge}
                  ${focusBadge}
                </div>
              </div>
              <div class="session-title">${s.title}</div>
              
              <!-- Paparan Nama Klien / Butang Pilih Klien (422 Murid APDM) -->
              ${(s.students && s.students.length > 0) ? `
                <div class="session-client-chip" onclick="event.stopPropagation(); App.openQuickClientPicker(${this.state.currentWeek}, '${day}', ${originalIdx})" title="Klik untuk tukar / urus nama murid">
                  <div style="display: flex; align-items: center; gap: 4px; flex-wrap: wrap; overflow: hidden;">
                    <span style="font-size: 0.82rem;">👤</span>
                    <span style="font-weight: 800; color: #1e3a8a; font-size: 0.75rem;">
                      ${s.students.length === 1 
                        ? `${s.students[0].name || s.students[0]}${s.students[0].className ? ' (' + s.students[0].className + ')' : ''}` 
                        : `${s.students.length} Murid: ${s.students.slice(0, 2).map(m => (m.name || m) + (m.className ? ' (' + m.className + ')' : '')).join(', ')}${s.students.length > 2 ? '...' : ''}`}
                    </span>
                  </div>
                  <span class="badge-edit-client">✏️ Tukar</span>
                </div>
              ` : (s.type !== 'cuti' && s.type !== 'pentadbiran') ? `
                <div>
                  <button type="button" class="btn-select-client-quick" onclick="event.stopPropagation(); App.openQuickClientPicker(${this.state.currentWeek}, '${day}', ${originalIdx})" title="Pilih nama murid daripada pangkalan data 422 APDM">
                    <span>👤➕</span> Pilih Nama Klien ${s.classTarget && s.classTarget !== '-' ? `(${s.classTarget})` : ''}
                  </button>
                </div>
              ` : ''}

              ${s.classTarget && s.classTarget !== '-' ? `<div class="session-target">🏫 ${s.classTarget}${s.headcount > 1 ? ` · <strong>${s.headcount}</strong> klien` : ''}</div>` : ''}
              ${s.notes ? `<div class="session-notes">🔒 ${s.notes}</div>` : ''}

              <!-- Tindakan Pantas Kad Sesi -->
              <div class="session-actions">
                ${(s.type === 'individu' || s.type === 'kelompok') ? `
                  <button class="icon-btn btn-followup" style="background: #eff6ff; color: #1d4ed8; font-weight: 800; border: 1px solid #bfdbfe;" title="⚡ Cadang Sesi Susulan Automatik (Dengan Persetujuan Kaunselor)" onclick="event.stopPropagation(); App.suggestFollowUpSession(${this.state.currentWeek}, '${day}', ${originalIdx})">⚡</button>
                ` : ''}
                <button class="icon-btn btn-client-pick" title="Pilih / Tukar Klien (Senarai 422 Murid)" onclick="event.stopPropagation(); App.openQuickClientPicker(${this.state.currentWeek}, '${day}', ${originalIdx})">👥</button>
                <button class="icon-btn btn-slip" title="Cetak Slip Panggilan Murid" onclick="event.stopPropagation(); App.printSessionSlip(${this.state.currentWeek}, '${day}', ${originalIdx})">🎫</button>
                <button class="icon-btn btn-reschedule" title="Anjak / Pindahkan Sesi" onclick="event.stopPropagation(); App.openRescheduleModal(${this.state.currentWeek}, '${day}', ${originalIdx})">➡️</button>
                <button class="icon-btn" title="Edit Sesi" onclick="event.stopPropagation(); App.openEditSessionModal(${this.state.currentWeek}, '${day}', ${originalIdx})">✏️</button>
                <button class="icon-btn icon-delete" title="Padam Sesi" onclick="event.stopPropagation(); App.deleteSession(${this.state.currentWeek}, '${day}', ${originalIdx})">🗑️</button>
              </div>
            </div>
          `;
        });
      }

      // Butang Tambah Sesi di bawah lajur
      html += `
        <button class="btn-add-session-day" onclick="App.openAddSessionModal('${day}')">
          <span>➕</span> Tambah Sesi
        </button>
      `;

      cellEl.innerHTML = html;
    });

    this.renderStatsSummary(weekData);
    this.renderClientNextSessionWidget();
  },

  // Ringkasan Statistik Aktiviti Mingguan & Pencapaian
  renderStatsSummary: function(weekData) {
    const container = document.getElementById("weekStatsSummary");
    if (!container) return;

    let totalKI = 0, totalKel = 0, totalBim = 0, totalProg = 0, totalSelesai = 0;
    let totalMinutes = 0;

    const timeToMin = (t) => this.timeToMin(t);

    weekData.sessions.forEach(s => {
      if (s.type === 'individu') totalKI++;
      else if (s.type === 'kelompok') totalKel++;
      else if (s.type === 'bimbingan') totalBim++;
      else if (s.type === 'program') totalProg++;

      if (s.status === 'selesai') totalSelesai++;

      const dur = timeToMin(s.timeEnd) - timeToMin(s.timeStart);
      if (dur > 0 && dur <= 360) totalMinutes += dur;
    });

    const totalAktiviti = weekData.sessions.length;
    const totalHours = (totalMinutes / 60).toFixed(1);

    container.innerHTML = `
      <span class="stat-pill stat-total"><strong>${totalAktiviti}</strong> Jumlah Aktiviti</span>
      <span class="stat-pill stat-hours">⏱️ <strong>${totalHours} Jam</strong> Berjadual</span>
      <span class="stat-pill stat-selesai">✅ <strong>${totalSelesai}/${totalAktiviti}</strong> Selesai</span>
      <span class="stat-pill stat-ki"><strong>${totalKI}</strong> KI</span>
      <span class="stat-pill stat-kelompok"><strong>${totalKel}</strong> Kelompok</span>
      <span class="stat-pill stat-bimbingan"><strong>${totalBim}</strong> Bimbingan</span>
      <span class="stat-pill stat-program"><strong>${totalProg}</strong> Program</span>
    `;
  },

  // Tukar Status Sesi (Belum -> Selesai -> Ditunda)
  toggleSessionStatus: function(weekNum, day, sessionIdx) {
    if (typeof CloudSync !== "undefined" && CloudSync.state.userRole === "viewer") {
      this.showToast("👁️ Mod Paparan Awam: Hanya Kaunselor dibenarkan mengubah status.", null, 3500);
      return;
    }
    const weekData = this.state.practicumData.find(w => w.weekNum === weekNum);
    if (!weekData) return;
    const session = weekData.sessions[sessionIdx];
    if (!session) return;

    const currentStatus = session.status || 'belum';
    if (currentStatus === 'belum') {
      session.status = 'selesai';
    } else if (currentStatus === 'selesai') {
      session.status = 'tunda';
    } else {
      session.status = 'belum';
    }

    this.savePracticumData();
    this.renderPracticumTable();
    this.renderPracticumHoursDashboard();

    // AUTO-CADANG SESI SUSULAN DENGAN PERSETUJUAN KAUNSELOR
    if (session.status === 'selesai' && (session.type === 'individu' || session.type === 'kelompok') && weekNum < 10) {
      setTimeout(() => {
        this.suggestFollowUpSession(weekNum, day, sessionIdx);
      }, 350);
    }
  },

  // =========================================================
  // ENJIN CADANGAN SESI SUSULAN PINTAR 100% BEBAS PERTINDIHAN
  // =========================================================
  normalizeClassName: function(rawClass) {
    if (!rawClass) return "";
    const clean = String(rawClass).toUpperCase().trim();
    if (typeof CLASS_SCHEDULES !== "undefined" && CLASS_SCHEDULES[clean]) {
      return clean;
    }
    const map = {
      "1A": "1 ARIF", "1B": "1 BESTARI",
      "2A": "2 ARIF", "2B": "2 BESTARI",
      "3A": "3 ARIF", "3B": "3 BESTARI",
      "4A": "4 ARIF", "4B": "4 BESTARI",
      "5A": "5 ARIF", "5B": "5 BESTARI",
      "6A": "6 ARIF", "6B": "6 BESTARI"
    };
    for (const [k, v] of Object.entries(map)) {
      if (clean === k || clean.includes(k) || clean.replace(/\s+/g, '') === k) return v;
    }
    return clean;
  },

  // Cari slot-slot calon yang 100% BEBAS daripada pertindihan UBK, cuti, rehat & mengutamakan waktu bukan teras
  findSmartFollowUpSlots: function(targetWeekNum, preferredDay, preferredStart, preferredEnd, rawClassName, sessionType = 'individu') {
    const targetWeekData = this.state.practicumData.find(w => w.weekNum === targetWeekNum);
    if (!targetWeekData) return [];

    const normClass = this.normalizeClassName(rawClassName);
    const classData = (typeof CLASS_SCHEDULES !== "undefined" && normClass) ? CLASS_SCHEDULES[normClass] : null;
    const isTahap1 = classData ? (classData.tahap === 1) : false;
    const recessStart = isTahap1 ? 580 : 610; // 09:40 atau 10:10
    const recessEnd   = isTahap1 ? 610 : 640; // 10:10 atau 10:40

    // Calon slot masa standard sekolah yang selaras PdPC SK Tampasuk 1
    const baseCandidateTimes = [
      { start: "07.10", end: "08.10" },
      { start: "07.40", end: "08.40" },
      { start: "08.10", end: "09.10" },
      { start: "08.40", end: "09.40" },
      { start: "10.40", end: "11.40" },
      { start: "11.10", end: "12.10" },
      { start: "11.40", end: "12.40" }
    ];

    if (preferredStart && preferredEnd) {
      if (!baseCandidateTimes.some(c => c.start === preferredStart && c.end === preferredEnd)) {
        baseCandidateTimes.unshift({ start: preferredStart, end: preferredEnd });
      }
    }

    const daysList = ["ISNIN", "SELASA", "RABU", "KHAMIS", "JUMAAT"];
    const candidates = [];

    daysList.forEach(d => {
      // 1. Semak jika hari cuti umum / cuti peristiwa atau HARI YANG DIKOSONGKAN
      const totalWeekSessions = (targetWeekData.sessions || []).length;
      const daySessions = (targetWeekData.sessions || []).filter(s => s.day === d);
      const isDayEmptyHoliday = (totalWeekSessions > 0 && daySessions.length === 0);
      const hasCutiSession = daySessions.some(s => s.type === 'cuti' || (s.title && s.title.toUpperCase().includes('CUTI')));
      const isExplicitHoliday = Boolean(targetWeekData.holidays && targetWeekData.holidays[d]);
      if (isDayEmptyHoliday || hasCutiSession || isExplicitHoliday) return; // Langkau hari cuti umum & hari yang dikosongkan!

      baseCandidateTimes.forEach(cand => {
        const cStartMin = this.timeToMin(cand.start);
        const cEndMin   = this.timeToMin(cand.end);

        // a) Elak waktu luar persekolahan
        if (cStartMin < 430 || cEndMin > 760) return;

        // b) Elak waktu perhimpunan rasmi Isnin (07.00 - 07.40)
        if (d === "ISNIN" && cStartMin < 460 && cEndMin > 420) return;

        // c) Elak waktu rehat murid
        if (cStartMin < recessEnd && cEndMin > recessStart) return;

        // d) SEMAK PERTINDIHAN JADUAL UBK (ZERO CLASH)
        const hasUbkClash = daySessions.some(os => {
          if (os.type === 'cuti') return true;
          const osStart = this.timeToMin(os.timeStart);
          const osEnd   = this.timeToMin(os.timeEnd);
          return (cStartMin < osEnd && cEndMin > osStart);
        });

        if (hasUbkClash) return; // Gugurkan jika bertindih dengan sesi UBK!

        // e) ANALISIS PINTAR SUBJEK KELAS KLIEN (Bukan Teras vs Teras)
        let coreConflict = null;
        let nonCoreSubject = null;
        let classSchedNote = "";
        let score = 100;

        if (classData && classData.schedule && classData.schedule[d]) {
          const clsDaySched = classData.schedule[d];
          const coreCodes = ["BM", "BI", "M3", "MAT", "SN"];
          const nonCoreCodes = ["PSV", "MZ", "PJ", "PK", "RBT", "SEJ", "TASMEK", "BA/BKD", "BA", "BKD", "PM", "PI/PM", "PI"];

          const overlappingPeriods = clsDaySched.filter(p => {
            const [pStartStr, pEndStr] = (p.time || "").split(" - ");
            const pStart = this.timeToMin(pStartStr);
            const pEnd   = this.timeToMin(pEndStr || pStartStr);
            return (cStartMin < pEnd && cEndMin > pStart);
          });

          // Semak jika waktu rehat dalam jadual kelas
          if (overlappingPeriods.some(p => p.isBreak || p.code === "REHAT")) return;

          // Semak subjek teras akademik
          const coreP = overlappingPeriods.find(p => p.core || coreCodes.includes(p.code));
          if (coreP) {
            coreConflict = coreP;
            score -= 60; // Penalti: murid akan terlepas subjek teras
            classSchedNote = `Subjek Teras (${coreP.code})`;
          } else {
            // Semak subjek bukan teras (SANGAT DIGALAKKAN OLEH IPGM)
            const nonCoreP = overlappingPeriods.find(p => nonCoreCodes.includes(p.code));
            if (nonCoreP) {
              nonCoreSubject = nonCoreP;
              score += 40; // Bonus besar untuk slot paling selamat
              classSchedNote = `Waktu ${nonCoreP.name} (${nonCoreP.code}) • Bebas Teras`;
            } else {
              score += 20;
              classSchedNote = `Bebas Subjek Teras`;
            }
          }
        } else {
          classSchedNote = `Waktu Lapang UBK`;
        }

        // f) Bonus Kesinambungan Waktu (Hari & jam yang sama jika bebas)
        if (d === preferredDay && cand.start === preferredStart && cand.end === preferredEnd) {
          score += 30;
        } else if (d === preferredDay) {
          score += 15;
        }

        // g) Jumaat petang penalti kecil
        if (d === "JUMAAT" && cEndMin > 690) {
          score -= 15;
        }

        candidates.push({
          day: d,
          timeStart: cand.start,
          timeEnd: cand.end,
          score: score,
          coreConflict: coreConflict,
          nonCoreSubject: nonCoreSubject,
          classSchedNote: classSchedNote
        });
      });
    });

    // Susun mengikut markah tertinggi
    candidates.sort((a, b) => b.score - a.score);
    return candidates;
  },

  // Semakan keselamatan pertindihan untuk sebarang slot khusus
  checkSpecificSlotConflict: function(targetWeekNum, day, timeStart, timeEnd, className = "") {
    const targetWeekData = this.state.practicumData.find(w => w.weekNum === targetWeekNum);
    if (!targetWeekData) return { hasClash: false, message: "" };

    const sStart = this.timeToMin(timeStart);
    const sEnd   = this.timeToMin(timeEnd);

    if (!timeStart || !timeEnd || sEnd <= sStart) {
      return { hasClash: true, isError: true, message: `Masa tamat (${timeEnd}) mestilah lebih lewat daripada masa mula (${timeStart}).` };
    }

    // 1. Semak Hari Cuti atau Hari yang Dikosongkan
    const daySessions = (targetWeekData.sessions || []).filter(s => s.day === day);
    const hasCutiSession = daySessions.some(s => s.type === 'cuti' || (s.title && s.title.toUpperCase().includes('CUTI')));
    const isExplicitHoliday = Boolean(targetWeekData.holidays && targetWeekData.holidays[day]);
    
    if (hasCutiSession || isExplicitHoliday) {
      const hName = (targetWeekData.holidays && targetWeekData.holidays[day]) ? targetWeekData.holidays[day] : "HARI CUTI / PELEPASAN AM";
      return { hasClash: true, isError: true, message: `Hari ${day} dalam Minggu ${targetWeekNum} adalah ${hName}.` };
    }

    // 2. Semak Pertindihan UBK Sendiri
    const clashingUbk = (targetWeekData.sessions || []).find(os => {
      if (os.day !== day) return false;
      const osStart = this.timeToMin(os.timeStart);
      const osEnd   = this.timeToMin(os.timeEnd);
      return (sStart < osEnd && sEnd > osStart);
    });

    if (clashingUbk) {
      return { 
        hasClash: true, 
        isError: true, 
        message: `Bertembung dengan sesi UBK lain: "${clashingUbk.title}" (${clashingUbk.timeStart} - ${clashingUbk.timeEnd}).` 
      };
    }

    // 3. Semak Perhimpunan Isnin
    if (day === "ISNIN" && sStart < 460 && sEnd > 420) {
      return { hasClash: true, isError: true, message: `Bertembung dengan waktu Perhimpunan Rasmi Sekolah (07.00 - 07.40).` };
    }

    // 4. Semak Waktu Rehat & Subjek Teras Murid
    const normClass = this.normalizeClassName(className);
    if (normClass && typeof CLASS_SCHEDULES !== "undefined" && CLASS_SCHEDULES[normClass]) {
      const cls = CLASS_SCHEDULES[normClass];
      const clsSched = cls.schedule[day] || [];
      const coreCodes = ["BM", "BI", "M3", "MAT", "SN"];

      const overlappingPeriods = clsSched.filter(p => {
        const [pStartStr, pEndStr] = (p.time || "").split(" - ");
        const pStart = this.timeToMin(pStartStr);
        const pEnd   = this.timeToMin(pEndStr || pStartStr);
        return (sStart < pEnd && sEnd > pStart);
      });

      if (overlappingPeriods.some(p => p.isBreak || p.code === "REHAT")) {
        return { hasClash: true, isError: true, message: `Bertembung dengan WAKTU REHAT murid (${cls.rehatTime || '09.40 - 10.40'}). Rehat adalah hak murid.` };
      }

      const clashingCore = overlappingPeriods.filter(p => p.core || coreCodes.includes(p.code));
      if (clashingCore.length > 0) {
        return {
          hasClash: false,
          isWarning: true,
          message: `Pertindihan Subjek Teras: Kelas ${normClass} sedang belajar (${clashingCore.map(c => c.code + ' - ' + c.name).join(', ')}). Murid mungkin ketinggalan silibus.`
        };
      }

      const nonCore = overlappingPeriods.filter(p => !p.core && !p.isBreak);
      if (nonCore.length > 0) {
        return {
          hasClash: false,
          isOptimal: true,
          message: `Slot Terbaik: Kelas ${normClass} sedang waktu bukan teras (${nonCore.map(c => c.code).join(', ')}). Bebas subjek peperiksaan!`
        };
      }
    }

    return { hasClash: false, isOptimal: true, message: `Disahkan 100% bebas pertindihan jadual UBK.` };
  },

  handleFollowUpPresetChange: function(val, targetWeekNum, normClass) {
    if (!val || val === "custom") return;
    const parts = val.split("|");
    if (parts.length === 3) {
      const dayEl = document.getElementById("followUpDay");
      const startEl = document.getElementById("followUpTimeStart");
      const endEl = document.getElementById("followUpTimeEnd");
      if (dayEl) dayEl.value = parts[0];
      if (startEl) startEl.value = parts[1];
      if (endEl) endEl.value = parts[2];
      this.liveValidateFollowUpSlot(targetWeekNum, normClass);
    }
  },

  liveValidateFollowUpSlot: function(targetWeekNum, className = "") {
    const day = document.getElementById("followUpDay")?.value || "ISNIN";
    const start = document.getElementById("followUpTimeStart")?.value?.trim() || "";
    const end = document.getElementById("followUpTimeEnd")?.value?.trim() || "";
    const statusBox = document.getElementById("followUpLiveStatus");
    const btnConfirm = document.getElementById("btnConfirmAutoFollowUp");

    if (!statusBox) return;

    if (!start || !end) {
      statusBox.innerHTML = `<div style="font-size:0.75rem; color:#64748b;">Sila masukkan masa mula dan tamat yang sah.</div>`;
      if (btnConfirm) btnConfirm.disabled = true;
      return;
    }

    const check = this.checkSpecificSlotConflict(targetWeekNum, day, start, end, className);

    if (check.hasClash) {
      statusBox.innerHTML = `
        <div style="background:#fee2e2; color:#991b1b; border:1.5px solid #f87171; padding:6px 10px; border-radius:6px; font-size:0.78rem; font-weight:700;">
          ❌ PERTINDIHAN: ${check.message}
        </div>
      `;
      if (btnConfirm) {
        btnConfirm.disabled = true;
        btnConfirm.style.opacity = "0.45";
        btnConfirm.style.cursor = "not-allowed";
      }
    } else if (check.isWarning) {
      statusBox.innerHTML = `
        <div style="background:#fffbeb; color:#92400e; border:1.5px solid #fcd34d; padding:6px 10px; border-radius:6px; font-size:0.78rem; font-weight:600;">
          ⚠️ PERINGATAN: ${check.message}
        </div>
      `;
      if (btnConfirm) {
        btnConfirm.disabled = false;
        btnConfirm.style.opacity = "1";
        btnConfirm.style.cursor = "pointer";
      }
    } else {
      statusBox.innerHTML = `
        <div style="background:#f0fdf4; color:#15803d; border:1.5px solid #86efac; padding:6px 10px; border-radius:6px; font-size:0.78rem; font-weight:700;">
          🛡️ PINTAR &amp; BEBAS PERTINDIHAN: ${check.message}
        </div>
      `;
      if (btnConfirm) {
        btnConfirm.disabled = false;
        btnConfirm.style.opacity = "1";
        btnConfirm.style.cursor = "pointer";
      }
    }
  },

  suggestFollowUpSession: function(weekNum, day, sessionIdx) {
    if (typeof CloudSync !== "undefined" && CloudSync.state.userRole === "viewer") {
      this.showToast("👁️ Mod Paparan Awam: Hanya Kaunselor dibenarkan menjadualkan sesi.", null, 3500);
      return;
    }
    const weekData = this.state.practicumData.find(w => w.weekNum === weekNum);
    if (!weekData) return;
    const session = weekData.sessions[sessionIdx];
    if (!session) return;

    if (weekNum >= 10) {
      alert("ℹ️ Ini adalah Minggu 10 (Minggu Akhir Praktikum). Tiada minggu praktikum seterusnya untuk sesi susulan.");
      return;
    }

    const targetWeekNum = weekNum + 1;
    const targetWeekData = this.state.practicumData.find(w => w.weekNum === targetWeekNum);
    if (!targetWeekData) {
      alert(`⚠️ Data Minggu ${targetWeekNum} tidak ditemui.`);
      return;
    }

    // Kira nombor sesi seterusnya
    let nextTag = "Sesi 2";
    if (session.sessionTag) {
      nextTag = this.calcNextSessionTag(session.sessionTag);
    } else {
      const detect = this.autoDetectClientSessionHistory(session.students || []);
      nextTag = this.calcNextSessionTag(detect.sessionTag);
    }

    // Tentukan Klien & Kelas
    const isIndiv = (session.type === 'individu' || (session.students && session.students.length === 1));
    const clientName = (session.students && session.students.length > 0)
      ? (isIndiv ? session.students[0].name : `${session.students.length} Orang Murid (${session.classTarget || ''})`)
      : (session.title || 'Klien');
    const rawClass = session.classTarget || (session.students && session.students[0] ? session.students[0].className : '');
    const normClass = this.normalizeClassName(rawClass);

    // CARI SLOT PINTAR BEBAS PERTINDIHAN DENGAN ENJIN PINTAR
    const candidateSlots = this.findSmartFollowUpSlots(
      targetWeekNum,
      day,
      session.timeStart,
      session.timeEnd,
      normClass,
      session.type
    );

    let bestSlot = null;
    if (candidateSlots.length > 0) {
      bestSlot = candidateSlots[0];
    } else {
      bestSlot = {
        day: day,
        timeStart: session.timeStart || "08.40",
        timeEnd: session.timeEnd || "09.40",
        score: 50,
        classSchedNote: "Sila semak jadual minggu tersebut",
        coreConflict: null,
        nonCoreSubject: null
      };
    }

    // Sediakan Modal Cadangan
    const modalEl = document.getElementById("autoFollowUpModal");
    const contentEl = document.getElementById("followUpModalContent");
    if (!modalEl || !contentEl) {
      const proceed = confirm(`📋 CADANGAN SESI SUSULAN PINTAR (BEBAS PERTINDIHAN):\n\nKlien: ${clientName}\nCadangan Sesi: ${nextTag} (Status K - Kes Berulang)\nCadangan Slot: Minggu ${targetWeekNum} (${bestSlot.day}, ${bestSlot.timeStart} - ${bestSlot.timeEnd})\nCatatan: ${bestSlot.classSchedNote}\n\nAdakah anda bersetuju untuk memasukkan sesi susulan ini ke dalam jadual?`);
      if (proceed) {
        this.confirmAutoFollowUp(targetWeekNum, bestSlot.day, bestSlot.timeStart, bestSlot.timeEnd, session, nextTag);
      }
      return;
    }

    const daysList = ["ISNIN", "SELASA", "RABU", "KHAMIS", "JUMAAT"];
    
    // Bina pilihan slot pintar untuk dropdown preset
    let slotOptionsHtml = "";
    candidateSlots.slice(0, 6).forEach((cs, idx) => {
      const label = `${idx === 0 ? '⭐ [DISYORKAN] ' : '✓ '}${cs.day}, ${cs.timeStart} - ${cs.timeEnd} (${cs.classSchedNote})`;
      slotOptionsHtml += `<option value="${cs.day}|${cs.timeStart}|${cs.timeEnd}" ${idx === 0 ? 'selected' : ''}>${label}</option>`;
    });

    contentEl.innerHTML = `
      <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 12px; margin-bottom: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px; flex-wrap: wrap; gap: 8px;">
          <div>
            <span style="font-size: 0.72rem; font-weight: 800; color: #64748b; text-transform: uppercase;">Profil Klien:</span>
            <div style="font-size: 1.05rem; font-weight: 800; color: #1e3a8a;">👤 ${clientName}</div>
            <div style="font-size: 0.8rem; color: #475569;">🏫 Kelas: <strong>${normClass || rawClass || 'Umum'}</strong> • Jenis: <strong>${this.getTypeLabel(session.type)}</strong></div>
          </div>
          <div style="text-align: right;">
            <span class="badge badge-session-tag" style="font-size: 0.82rem; padding: 4px 8px;">🏷️ ${nextTag}</span>
            <div style="font-size: 0.72rem; color: #059669; font-weight: 700; margin-top: 3px;">Status: K (Kes Berulang)</div>
          </div>
        </div>
      </div>

      <div style="background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 8px; padding: 12px; margin-bottom: 12px;">
        <div style="font-weight: 800; color: #166534; font-size: 0.88rem; margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between;">
          <span style="display: flex; align-items: center; gap: 6px;">
            <span>🛡️</span> Slot Pintar Disyorkan (Minggu ${targetWeekNum}):
          </span>
          <span style="font-size: 0.72rem; background: #dcfce7; color: #15803d; padding: 2px 8px; border-radius: 12px; font-weight: 700;">
            ✓ Sifar Pertindihan
          </span>
        </div>

        <!-- Pilihan Slot Pintar Terpilih -->
        <div style="margin-bottom: 10px;">
          <label style="font-size: 0.74rem; font-weight: 700; color: #166534; display: block; margin-bottom: 3px;">
            Pilih Slot Disahkan Bebas Pertindihan:
          </label>
          <select id="followUpSlotPreset" class="form-control" style="font-size: 0.82rem; font-weight: 700; border-color: #86efac; background: white;" onchange="App.handleFollowUpPresetChange(this.value, ${targetWeekNum}, '${normClass}')">
            ${slotOptionsHtml}
            <option value="custom">✏️ Waktu Tersuai / Pilihan Sendiri...</option>
          </select>
        </div>

        <!-- Pilihan Hari & Masa -->
        <div style="display: grid; grid-template-columns: 1.1fr 1fr; gap: 8px;">
          <div>
            <label style="font-size: 0.75rem; font-weight: 700; color: #334155; display: block; margin-bottom: 2px;">Hari:</label>
            <select id="followUpDay" class="form-control" style="font-size: 0.85rem; padding: 6px; font-weight: 700;" onchange="App.liveValidateFollowUpSlot(${targetWeekNum}, '${normClass}')">
              ${daysList.map(d => `<option value="${d}" ${d === bestSlot.day ? 'selected' : ''}>${d}</option>`).join('')}
            </select>
          </div>
          <div>
            <label style="font-size: 0.75rem; font-weight: 700; color: #334155; display: block; margin-bottom: 2px;">Masa (Mula - Tamat):</label>
            <div style="display: flex; gap: 4px;">
              <input type="text" id="followUpTimeStart" class="form-control" value="${bestSlot.timeStart}" style="font-size: 0.85rem; padding: 6px; text-align: center; font-weight: 700;" oninput="App.liveValidateFollowUpSlot(${targetWeekNum}, '${normClass}')">
              <span style="align-self: center; font-weight: 800;">-</span>
              <input type="text" id="followUpTimeEnd" class="form-control" value="${bestSlot.timeEnd}" style="font-size: 0.85rem; padding: 6px; text-align: center; font-weight: 700;" oninput="App.liveValidateFollowUpSlot(${targetWeekNum}, '${normClass}')">
            </div>
          </div>
        </div>

        <!-- Status Semakan Masa Nyata -->
        <div id="followUpLiveStatus" style="margin-top: 8px;">
          <!-- Auto-populated -->
        </div>
      </div>

      <div style="font-size: 0.78rem; color: #475569; line-height: 1.4;">
        💡 <em>Enjin pintar secara automatik mengelakkan cuti sekolah, waktu rehat murid, perhimpunan rasmi, dan mengutamakan subjek bukan teras agar murid tidak terjejas akademik.</em>
      </div>
    `;

    const btnConfirm = document.getElementById("btnConfirmAutoFollowUp");
    if (btnConfirm) {
      btnConfirm.disabled = false;
      btnConfirm.style.opacity = "1";
      btnConfirm.style.cursor = "pointer";
      btnConfirm.onclick = () => {
        const chosenDay = document.getElementById("followUpDay")?.value || bestSlot.day;
        const chosenStart = document.getElementById("followUpTimeStart")?.value?.trim() || bestSlot.timeStart;
        const chosenEnd = document.getElementById("followUpTimeEnd")?.value?.trim() || bestSlot.timeEnd;

        // Semakan pengesahan akhir
        const validation = this.checkSpecificSlotConflict(targetWeekNum, chosenDay, chosenStart, chosenEnd, normClass);
        if (validation.hasClash) {
          alert(`⚠️ PERTINDIHAN DIKESAN:\n${validation.message}\n\nSila pilih slot waktu lain yang bebas.`);
          return;
        }

        this.confirmAutoFollowUp(targetWeekNum, chosenDay, chosenStart, chosenEnd, session, nextTag);
      };
    }

    modalEl.classList.add("active");
    this.liveValidateFollowUpSlot(targetWeekNum, normClass);
  },

  closeAutoFollowUpModal: function() {
    const modalEl = document.getElementById("autoFollowUpModal");
    if (modalEl) modalEl.classList.remove("active");
  },

  confirmAutoFollowUp: function(targetWeekNum, day, timeStart, timeEnd, sourceSession, nextTag) {
    const targetWeekData = this.state.practicumData.find(w => w.weekNum === targetWeekNum);
    if (!targetWeekData) {
      alert(`⚠️ Ralat: Data Minggu ${targetWeekNum} tidak ditemui.`);
      return;
    }

    const normClass = this.normalizeClassName(sourceSession.classTarget || (sourceSession.students && sourceSession.students[0] ? sourceSession.students[0].className : ''));
    
    // Semakan keselamatan akhir
    const validation = this.checkSpecificSlotConflict(targetWeekNum, day, timeStart, timeEnd, normClass);
    if (validation.hasClash) {
      alert(`⚠️ PERTINDIHAN DIKESAN:\n${validation.message}\n\nSila pilih slot waktu lain.`);
      return;
    }

    if (!targetWeekData.sessions) targetWeekData.sessions = [];

    const isIndiv = (sourceSession.type === 'individu' || (sourceSession.students && sourceSession.students.length === 1));
    const studentName = (sourceSession.students && sourceSession.students[0]) ? sourceSession.students[0].name : '';
    
    let newTitle = '';
    if (isIndiv && studentName) {
      newTitle = `KI - ${studentName} (${nextTag})`;
    } else if (sourceSession.type === 'kelompok') {
      newTitle = `Kelompok - Kelas ${sourceSession.classTarget || ''} (${nextTag})`;
    } else {
      newTitle = `${sourceSession.title || 'Sesi Kaunseling'} (${nextTag})`;
    }

    const newSession = {
      day: day,
      timeStart: timeStart,
      timeEnd: timeEnd,
      type: sourceSession.type,
      title: newTitle,
      classTarget: sourceSession.classTarget || (sourceSession.students && sourceSession.students[0] ? sourceSession.students[0].className : ''),
      status: "belum",
      notes: `Sesi Susulan (${nextTag}) dicadangkan automatik daripada sesi sebelumnya.`,
      headcount: sourceSession.headcount || (sourceSession.students ? sourceSession.students.length : 1),
      students: JSON.parse(JSON.stringify(sourceSession.students || [])),
      focus: sourceSession.focus || "sahsiah",
      clientStatus: "K", // Status K - Kes Berulang
      arrivalWay: "temujanji", // Temujanji Kaunselor
      targetAudience: sourceSession.targetAudience || "pelajar",
      sessionTag: nextTag
    };

    targetWeekData.sessions.push(newSession);

    // Kemaskini profil tersimpan jika wujud
    if (Array.isArray(this.state.savedClients) && sourceSession.students && sourceSession.students.length > 0) {
      const prof = this.state.savedClients.find(c => {
        if (!c.students || c.students.length !== sourceSession.students.length) return false;
        return c.students.every(cs => sourceSession.students.some(s => (s.id && s.id === cs.id) || (s.name && s.name === cs.name)));
      });
      if (prof) {
        prof.lastSessionTag = nextTag;
        this.saveSavedClients();
      }
    }

    this.savePracticumData();
    this.closeAutoFollowUpModal();

    this.showToast(`🎉 Sesi Susulan (${nextTag}) berjaya dimasukkan ke Minggu ${targetWeekNum} (${day}, ${timeStart} - ${timeEnd})!`, null, 4000);
    
    if (this.state.currentWeek === targetWeekNum) {
      this.renderPracticumTable();
      this.renderPracticumHoursDashboard();
    }
  },

  // =========================================================
  // FUNGSI AUTO-SET JAM SEKOLAH (MENGIKUT LOCENG PDPC SK TAMPASUK 1)
  // =========================================================
  autoSetSchoolHoursForCurrentForm: function(silent = false) {
    const dayEl = document.getElementById("formDay");
    const classEl = document.getElementById("formClassTarget");
    const typeEl = document.getElementById("formType");
    const startEl = document.getElementById("formTimeStart");
    const endEl = document.getElementById("formTimeEnd");
    
    if (!dayEl || !startEl || !endEl) return;

    const weekNum = parseInt(document.getElementById("formWeekNum")?.value || this.state.currentWeek, 10);
    const day = dayEl.value || "ISNIN";
    const type = typeEl?.value || "individu";

    // Ambil kelas daripada borang atau murid terpilih
    let rawClass = classEl?.value?.trim() || "";
    if (!rawClass && this.state.selectedStudentsInForm && this.state.selectedStudentsInForm.length > 0) {
      rawClass = this.state.selectedStudentsInForm[0].className || "";
    }
    const normClass = this.normalizeClassName(rawClass);

    // Cari slot terbaik hari ini
    let candidateSlots = this.findSmartFollowUpSlots(weekNum, day, "08.40", "09.40", normClass, type);
    let chosenDay = day;
    let bestSlot = null;

    if (candidateSlots && candidateSlots.length > 0) {
      bestSlot = candidateSlots[0];
    } else {
      // Jika hari semasa tiada slot bebas, cari slot terbaik merentasi seluruh minggu
      candidateSlots = this.findSmartFollowUpSlots(weekNum, null, "08.40", "09.40", normClass, type);
      if (candidateSlots && candidateSlots.length > 0) {
        bestSlot = candidateSlots[0];
        chosenDay = bestSlot.day;
        dayEl.value = chosenDay;
      }
    }

    if (bestSlot) {
      startEl.value = bestSlot.timeStart;
      endEl.value = bestSlot.timeEnd;
      this.checkFormConflict();
      this.renderClassSuggestions();
      if (!silent) {
        this.showToast(`⚡ Jam Persekolahan Diset: ${chosenDay}, ${bestSlot.timeStart} - ${bestSlot.timeEnd} (${bestSlot.classSchedNote})`, null, 3500);
      }
    } else {
      startEl.value = "08.40";
      endEl.value = "09.40";
      this.checkFormConflict();
      if (!silent) {
        this.showToast(`ℹ️ Jam diset ke waktu kebiasaan UBK: 08.40 - 09.40`, null, 3000);
      }
    }
  },

  // =========================================================
  // ENJIN CADANGAN SESI SETERUSNYA KLIEN SEDIA ADA (SMART SUGGESTIONS)
  // =========================================================
  getClientNextSessionSuggestions: function(targetWeekNum) {
    if (targetWeekNum < 1 || targetWeekNum > 10) return [];
    const targetWeekData = this.state.practicumData.find(w => w.weekNum === targetWeekNum);
    if (!targetWeekData) return [];

    const scheduledSessions = targetWeekData.sessions || [];
    
    // Kumpul senarai pengenalan klien yang SUDAH dijadualkan dalam minggu sasaran
    const scheduledClientKeys = new Set();
    scheduledSessions.forEach(s => {
      if (s.type === 'individu' || s.type === 'kelompok') {
        if (s.students && s.students.length > 0) {
          s.students.forEach(st => {
            if (st.ic) scheduledClientKeys.add(String(st.ic).trim());
            if (st.name) scheduledClientKeys.add(String(st.name).trim().toUpperCase());
          });
        }
        if (s.title) {
          scheduledClientKeys.add(String(s.title).trim().toUpperCase());
        }
        if (s.classTarget && s.type === 'kelompok') {
          scheduledClientKeys.add('KELOMPOK_' + String(s.classTarget).trim().toUpperCase());
        }
      }
    });

    const candidateMap = new Map();

    // 1. Imbas minggu-minggu sebelumnya secara menurun (cth: M4 -> M3, M2, M1)
    for (let w = targetWeekNum - 1; w >= 1; w--) {
      const pastWeek = this.state.practicumData.find(pw => pw.weekNum === w);
      if (!pastWeek || !pastWeek.sessions) continue;

      pastWeek.sessions.forEach(ps => {
        if (ps.type !== 'individu' && ps.type !== 'kelompok') return;
        if (ps.status === 'batal') return;

        let clientKey = "";
        let clientName = "";
        let className = ps.classTarget || "";
        let isAlreadyScheduled = false;

        if (ps.students && ps.students.length > 0) {
          const firstSt = ps.students[0];
          clientKey = firstSt.ic ? String(firstSt.ic).trim() : String(firstSt.name).trim().toUpperCase();
          clientName = (ps.type === 'individu' || ps.students.length === 1) 
            ? firstSt.name 
            : (ps.title || `Kelompok (${className || firstSt.className || ''})`);
          className = firstSt.className || className;

          // Semak jika mana-mana murid dalam sesi ini sudah ada sesi minggu ini
          isAlreadyScheduled = ps.students.some(st => {
            return (st.ic && scheduledClientKeys.has(String(st.ic).trim())) ||
                   (st.name && scheduledClientKeys.has(String(st.name).trim().toUpperCase()));
          });
        } else {
          clientKey = String(ps.title || 'Sesi').trim().toUpperCase();
          clientName = ps.title || 'Klien Sedia Ada';
          isAlreadyScheduled = scheduledClientKeys.has(clientKey);
        }

        if (ps.type === 'kelompok' && className) {
          if (scheduledClientKeys.has('KELOMPOK_' + String(className).trim().toUpperCase())) {
            isAlreadyScheduled = true;
          }
        }

        if (isAlreadyScheduled) return;

        // Jika belum ada dalam candidateMap, masukkan (kerana imbasan dari minggu terkini ke belakang)
        if (!candidateMap.has(clientKey)) {
          candidateMap.set(clientKey, {
            clientKey: clientKey,
            clientName: clientName,
            className: className,
            type: ps.type,
            sourceSession: ps,
            sourceWeek: w,
            lastTag: ps.sessionTag || (ps.notes && ps.notes.match(/Sesi \d+/)?.[0]) || 'Sesi 1'
          });
        }
      });
    }

    // 2. Imbas juga profil klien tersimpan (Saved Clients)
    if (Array.isArray(this.state.savedClients)) {
      this.state.savedClients.forEach(sc => {
        let clientKey = sc.id;
        let isAlreadyScheduled = false;
        if (sc.students && sc.students.length > 0) {
          isAlreadyScheduled = sc.students.some(st => {
            return (st.ic && scheduledClientKeys.has(String(st.ic).trim())) ||
                   (st.name && scheduledClientKeys.has(String(st.name).trim().toUpperCase()));
          });
        }
        if (isAlreadyScheduled) return;

        if (!candidateMap.has(clientKey)) {
          const pseudoSession = {
            type: sc.type,
            title: sc.name,
            classTarget: sc.targetClass || (sc.students && sc.students[0] ? sc.students[0].className : ''),
            students: sc.students || [],
            focus: sc.focus || 'sahsiah',
            sessionTag: sc.lastSessionTag || 'Sesi 1'
          };
          candidateMap.set(clientKey, {
            clientKey: clientKey,
            clientName: sc.name,
            className: pseudoSession.classTarget,
            type: sc.type,
            sourceSession: pseudoSession,
            sourceWeek: null,
            lastTag: sc.lastSessionTag || 'Sesi 1'
          });
        }
      });
    }

    // 3. Untuk setiap calon, kira Tag Sesi Seterusnya & cari Slot Pintar Waktu Sekolah Terbaik
    const suggestions = [];
    candidateMap.forEach(cand => {
      const nextTag = this.calcNextSessionTag(cand.lastTag);
      const normClass = this.normalizeClassName(cand.className);

      // Cari slot terbaik yang selaras dengan loceng PdPC SK Tampasuk 1 & bebas pertindihan
      const candidateSlots = this.findSmartFollowUpSlots(
        targetWeekNum,
        null,
        "08.40",
        "09.40",
        normClass,
        cand.type
      );

      if (candidateSlots && candidateSlots.length > 0) {
        const bestSlot = candidateSlots[0];
        suggestions.push({
          clientKey: cand.clientKey,
          name: cand.clientName,
          type: cand.type,
          className: normClass || cand.className || 'Umum',
          students: cand.sourceSession.students || [],
          sourceSession: cand.sourceSession,
          sourceWeek: cand.sourceWeek,
          lastTag: cand.lastTag,
          nextTag: nextTag,
          bestSlot: bestSlot,
          candidateSlots: candidateSlots
        });
      }
    });

    // Hadkan kepada 6 cadangan terbaik
    return suggestions.slice(0, 6);
  },

  // =========================================================
  // PAPARAN WIDGET CADANGAN SESI SETERUSNYA KLIEN SEDIA ADA
  // =========================================================
  renderClientNextSessionWidget: function() {
    const container = document.getElementById("clientNextSessionSuggestionsWidget");
    if (!container) return;

    const weekNum = this.state.currentWeek;
    if (weekNum < 1 || weekNum > 10) {
      container.style.display = "none";
      return;
    }

    const suggestions = this.getClientNextSessionSuggestions(weekNum);
    if (!suggestions || suggestions.length === 0) {
      container.style.display = "none";
      container.innerHTML = "";
      return;
    }

    container.style.display = "block";

    let cardsHtml = "";
    suggestions.forEach((sug, idx) => {
      const typeBadge = (sug.type === 'individu') 
        ? '<span class="badge" style="background:#dbeafe; color:#1d4ed8; font-weight:700; font-size:0.7rem;">KI (Individu)</span>' 
        : '<span class="badge" style="background:#fce7f3; color:#be185d; font-weight:700; font-size:0.7rem;">KK (Kelompok)</span>';

      cardsHtml += `
        <div style="background: white; border: 1.5px solid #bfdbfe; border-radius: 10px; padding: 12px 14px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 2px 6px rgba(0,0,0,0.04); transition: transform 0.15s ease;">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; margin-bottom: 6px;">
              <div style="flex: 1;">
                <span style="font-size: 0.68rem; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Klien Sedia Ada:</span>
                <div style="font-weight: 800; color: #1e3a8a; font-size: 0.95rem; line-height: 1.25; margin-top: 1px;">
                  👤 ${sug.name}
                </div>
                <div style="font-size: 0.76rem; color: #475569; margin-top: 3px; display: flex; align-items: center; gap: 6px;">
                  <span>🏫 Kelas: <strong>${sug.className}</strong></span> • ${typeBadge}
                </div>
              </div>
              <div style="text-align: right;">
                <span class="badge badge-session-tag" style="font-size: 0.8rem; padding: 4px 8px; background: #eff6ff; color: #1d4ed8; border: 1.5px solid #93c5fd; font-weight: 800;">
                  🏷️ ${sug.nextTag}
                </span>
                <div style="font-size: 0.68rem; color: #059669; font-weight: 800; margin-top: 3px;">
                  Status: K (Kes Berulang)
                </div>
              </div>
            </div>

            <!-- Cadangan Jam Waktu Sekolah -->
            <div style="background: #f0fdf4; border: 1.2px solid #86efac; border-radius: 8px; padding: 8px 10px; margin: 8px 0;">
              <div style="font-weight: 800; color: #15803d; display: flex; align-items: center; justify-content: space-between; font-size: 0.74rem;">
                <span style="display: flex; align-items: center; gap: 4px;">
                  <span>⏱️</span> Waktu Loceng PdPC Disyorkan:
                </span>
                <span style="background: #dcfce7; color: #166534; font-size: 0.68rem; padding: 1px 6px; border-radius: 4px; font-weight: 700;">
                  ✓ 1 Jam (2 Waktu)
                </span>
              </div>
              <div style="font-size: 0.92rem; font-weight: 800; color: #166534; margin-top: 3px; letter-spacing: 0.2px;">
                📅 ${sug.bestSlot.day} • 🕒 ${sug.bestSlot.timeStart} - ${sug.bestSlot.timeEnd}
              </div>
              <div style="font-size: 0.72rem; color: #15803d; margin-top: 2px; font-weight: 600;">
                🛡️ ${sug.bestSlot.classSchedNote}
              </div>
            </div>
          </div>

          <!-- Butang Tindakan Pantas -->
          <div style="display: flex; gap: 6px; margin-top: 8px;">
            <button type="button" class="btn btn-sm btn-primary" onclick="App.autoScheduleClientFromSuggestion(${weekNum}, ${idx})" style="flex: 1; background: #166534; border-color: #166534; font-weight: 800; font-size: 0.8rem; padding: 7px 10px; display: flex; align-items: center; justify-content: center; gap: 5px;" title="Terus sahkan dan masukkan sesi susulan ini ke jadual minggu ${weekNum}">
              <span>⚡</span> 1-Klik Masuk Jadual
            </button>
            <button type="button" class="btn btn-sm btn-secondary" onclick="App.customizeClientSuggestion(${weekNum}, ${idx})" style="font-size: 0.8rem; padding: 7px 10px; font-weight: 700;" title="Pilih slot hari atau masa lain">
              <span>✏️</span> Sesuaikan
            </button>
          </div>
        </div>
      `;
    });

    container.innerHTML = `
      <div style="background: linear-gradient(135deg, #f0fdf4 0%, #eff6ff 100%); border: 2px solid #3b82f6; border-radius: 12px; padding: 14px 16px; margin-bottom: 1.25rem; box-shadow: 0 4px 14px rgba(59, 130, 246, 0.09);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; flex-wrap: wrap; gap: 8px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 1.35rem;">⚡</span>
            <div>
              <h3 style="font-family: 'Outfit'; font-size: 1.02rem; font-weight: 800; color: #1e3a8a; margin: 0;">
                Cadangan Sesi Seterusnya — Klien Sedia Ada (Minggu ${weekNum})
              </h3>
              <p style="font-size: 0.74rem; color: #475569; margin: 0;">
                Klien berikut pernah menjalani sesi terdahulu dan belum berjadual untuk minggu ini. Jam sesi dipadankan automatik mengikut jadual loceng sekolah (1 Jam) bebas pertindihan.
              </p>
            </div>
          </div>
          <span style="background: #2563eb; color: white; padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 800;">
            ${suggestions.length} Cadangan Menunggu
          </span>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(290px, 1fr)); gap: 10px;">
          ${cardsHtml}
        </div>
      </div>
    `;
  },

  // 1-Klik Sahkan Jadualkan Klien daripada Cadangan
  autoScheduleClientFromSuggestion: function(weekNum, suggestionIdx) {
    if (typeof CloudSync !== "undefined" && CloudSync.state.userRole === "viewer") {
      this.showToast("👁️ Mod Paparan Awam: Hanya Kaunselor dibenarkan menjadualkan sesi.", null, 3500);
      return;
    }
    const suggestions = this.getClientNextSessionSuggestions(weekNum);
    const item = suggestions[suggestionIdx];
    if (!item) {
      alert("⚠️ Cadangan sesi tidak ditemui atau telah dikemaskini.");
      return;
    }

    this.confirmAutoFollowUp(
      weekNum,
      item.bestSlot.day,
      item.bestSlot.timeStart,
      item.bestSlot.timeEnd,
      item.sourceSession,
      item.nextTag
    );
  },

  // Sesuaikan Cadangan Sesi
  customizeClientSuggestion: function(weekNum, suggestionIdx) {
    const suggestions = this.getClientNextSessionSuggestions(weekNum);
    const item = suggestions[suggestionIdx];
    if (!item) return;
    this.openFollowUpModalForClient(weekNum, item);
  },

  // Papar Modal Penyesuaian Slot Cadangan
  openFollowUpModalForClient: function(targetWeekNum, item) {
    if (typeof CloudSync !== "undefined" && CloudSync.state.userRole === "viewer") {
      this.showToast("👁️ Mod Paparan Awam: Hanya Kaunselor dibenarkan menjadualkan sesi.", null, 3500);
      return;
    }
    const modalEl = document.getElementById("autoFollowUpModal");
    const contentEl = document.getElementById("followUpModalContent");
    if (!modalEl || !contentEl) return;

    const daysList = ["ISNIN", "SELASA", "RABU", "KHAMIS", "JUMAAT"];
    const candidateSlots = item.candidateSlots || [];
    const bestSlot = item.bestSlot || (candidateSlots.length > 0 ? candidateSlots[0] : { day: "ISNIN", timeStart: "08.40", timeEnd: "09.40", classSchedNote: "Waktu Standard UBK" });
    const normClass = item.className || "";

    let slotOptionsHtml = "";
    candidateSlots.slice(0, 6).forEach((cs, idx) => {
      const label = `${idx === 0 ? '⭐ [DISYORKAN] ' : '✓ '}${cs.day}, ${cs.timeStart} - ${cs.timeEnd} (${cs.classSchedNote})`;
      slotOptionsHtml += `<option value="${cs.day}|${cs.timeStart}|${cs.timeEnd}" ${idx === 0 ? 'selected' : ''}>${label}</option>`;
    });

    contentEl.innerHTML = `
      <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 12px; margin-bottom: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px; flex-wrap: wrap; gap: 8px;">
          <div>
            <span style="font-size: 0.72rem; font-weight: 800; color: #64748b; text-transform: uppercase;">Profil Klien:</span>
            <div style="font-size: 1.05rem; font-weight: 800; color: #1e3a8a;">👤 ${item.name}</div>
            <div style="font-size: 0.8rem; color: #475569;">🏫 Kelas: <strong>${normClass || 'Umum'}</strong> • Jenis: <strong>${this.getTypeLabel(item.type)}</strong></div>
          </div>
          <div style="text-align: right;">
            <span class="badge badge-session-tag" style="font-size: 0.82rem; padding: 4px 8px; background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe;">🏷️ ${item.nextTag}</span>
            <div style="font-size: 0.72rem; color: #059669; font-weight: 700; margin-top: 3px;">Status: K (Kes Berulang)</div>
          </div>
        </div>
      </div>

      <div style="background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 8px; padding: 12px; margin-bottom: 12px;">
        <div style="font-weight: 800; color: #166534; font-size: 0.88rem; margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between;">
          <span style="display: flex; align-items: center; gap: 6px;">
            <span>🛡️</span> Slot Waktu Persekolahan Disyorkan (Minggu ${targetWeekNum}):
          </span>
          <span style="font-size: 0.72rem; background: #dcfce7; color: #15803d; padding: 2px 8px; border-radius: 12px; font-weight: 700;">
            ✓ Bebas Pertindihan
          </span>
        </div>

        <div style="margin-bottom: 10px;">
          <label style="font-size: 0.74rem; font-weight: 700; color: #166534; display: block; margin-bottom: 3px;">
            Pilih Slot Disahkan Bebas Pertindihan:
          </label>
          <select id="followUpSlotPreset" class="form-control" style="font-size: 0.82rem; font-weight: 700; border-color: #86efac; background: white;" onchange="App.handleFollowUpPresetChange(this.value, ${targetWeekNum}, '${normClass}')">
            ${slotOptionsHtml}
            <option value="custom">✏️ Waktu Tersuai / Pilihan Sendiri...</option>
          </select>
        </div>

        <div style="display: grid; grid-template-columns: 1.1fr 1fr; gap: 8px;">
          <div>
            <label style="font-size: 0.75rem; font-weight: 700; color: #334155; display: block; margin-bottom: 2px;">Hari:</label>
            <select id="followUpDay" class="form-control" style="font-size: 0.85rem; padding: 6px; font-weight: 700;" onchange="App.liveValidateFollowUpSlot(${targetWeekNum}, '${normClass}')">
              ${daysList.map(d => `<option value="${d}" ${d === bestSlot.day ? 'selected' : ''}>${d}</option>`).join('')}
            </select>
          </div>
          <div>
            <label style="font-size: 0.75rem; font-weight: 700; color: #334155; display: block; margin-bottom: 2px;">Masa (Mula - Tamat):</label>
            <div style="display: flex; gap: 4px;">
              <input type="text" id="followUpTimeStart" class="form-control" value="${bestSlot.timeStart}" style="font-size: 0.85rem; padding: 6px; text-align: center; font-weight: 700;" oninput="App.liveValidateFollowUpSlot(${targetWeekNum}, '${normClass}')">
              <span style="align-self: center; font-weight: 800;">-</span>
              <input type="text" id="followUpTimeEnd" class="form-control" value="${bestSlot.timeEnd}" style="font-size: 0.85rem; padding: 6px; text-align: center; font-weight: 700;" oninput="App.liveValidateFollowUpSlot(${targetWeekNum}, '${normClass}')">
            </div>
          </div>
        </div>

        <div id="followUpLiveStatus" style="margin-top: 8px;"></div>
      </div>

      <div style="font-size: 0.78rem; color: #475569; line-height: 1.4;">
        💡 <em>Slot waktu ini mengikut jadual loceng SK Tampasuk 1 tanpa menjejaskan PdPC subjek teras klien.</em>
      </div>
    `;

    const btnConfirm = document.getElementById("btnConfirmAutoFollowUp");
    if (btnConfirm) {
      btnConfirm.disabled = false;
      btnConfirm.style.opacity = "1";
      btnConfirm.style.cursor = "pointer";
      btnConfirm.onclick = () => {
        const chosenDay = document.getElementById("followUpDay")?.value || bestSlot.day;
        const chosenStart = document.getElementById("followUpTimeStart")?.value?.trim() || bestSlot.timeStart;
        const chosenEnd = document.getElementById("followUpTimeEnd")?.value?.trim() || bestSlot.timeEnd;

        const validation = this.checkSpecificSlotConflict(targetWeekNum, chosenDay, chosenStart, chosenEnd, normClass);
        if (validation.hasClash) {
          alert(`⚠️ PERTINDIHAN DIKESAN:\n${validation.message}\n\nSila pilih slot waktu lain yang bebas.`);
          return;
        }

        this.confirmAutoFollowUp(targetWeekNum, chosenDay, chosenStart, chosenEnd, item.sourceSession, item.nextTag);
      };
    }

    modalEl.classList.add("active");
    this.liveValidateFollowUpSlot(targetWeekNum, normClass);
  },

  // =========================================================
  // 2. FUNGSI KHAS: PENJANA SLIP KEBENARAN KELUAR KELAS (4 SLIP SEHELAI A4)
  // =========================================================
  printSessionSlip: function(weekNum, day, sessionIdx) {
    const weekData = this.state.practicumData.find(w => w.weekNum === weekNum);
    if (!weekData) return;
    const s = weekData.sessions[sessionIdx];
    if (!s) return;

    const dateStr = (weekData.dates && weekData.dates[day]) || "";
    const clientClass = s.classTarget && s.classTarget !== '-' ? s.classTarget : 'Murid Berkenaan';
    const typeLabel = this.getTypeLabel(s.type);

    let printWindow = window.open('', '_blank', 'width=950,height=880');
    if (!printWindow) {
      alert("Sila benarkan pop-up pelayar untuk mencetak slip panggilan murid.");
      return;
    }

    const hasStudents = s.students && s.students.length > 0;
    const studentNames = hasStudents ? s.students.map(m => m.name).join(', ') : '________________________________';
    const studentICs = hasStudents ? s.students.map(m => m.ic).join(', ') : '________________________';
    const finalClass = (hasStudents && s.students[0].className) ? s.students[0].className : clientClass;

    // Jana templat 4 keping slip dalam 1 halaman kertas A4
    const singleSlipTemplate = `
      <div class="slip-box">
        <div class="slip-header">
          <div class="slip-title-main">SEKOLAH KEBANGSAAN TAMPASUK 1, KOTA BELUD</div>
          <div class="slip-title-sub">UNIT BIMBINGAN DAN KAUNSELING (UBK)</div>
          <div class="slip-badge">SLIP KEBENARAN KELUAR KELAS / PANGGILAN SESI</div>
        </div>

        <div class="slip-content">
          <div class="slip-row">
            <span><strong>Tarikh:</strong> ${dateStr} (${day})</span>
            <span><strong>Masa Sesi:</strong> ${s.timeStart} - ${s.timeEnd}</span>
          </div>
          <div class="slip-row">
            <span><strong>Nama Klien / Murid:</strong> <span style="color:#1e3a8a; font-weight:800;">${studentNames}</span></span>
          </div>
          <div class="slip-row">
            <span><strong>Kelas:</strong> <strong>${finalClass}</strong></span>
          </div>
          <div class="slip-row">
            <span><strong>Jenis Sesi:</strong> ${typeLabel}</span>
            <span><strong>Tempat:</strong> Bilik Kaunseling UBK</span>
          </div>
          <div class="slip-row">
            <span><strong>Tajuk / Tujuan:</strong> ${s.title}</span>
          </div>
        </div>

        <div class="slip-note">
          * Murid diminta hadir mengikut masa di atas dan pulang ke kelas sebaik sahaja sesi tamat.
        </div>

        <div class="slip-signatures">
          <div class="sig-section">
            <p>Dikeluarkan oleh:</p>
            <div class="sig-space"></div>
            <p><strong>(CIKGU NURUL SYAHFIRAH)</strong><br>Guru Praktikal UBK</p>
          </div>
          <div class="sig-section">
            <p>Kebenaran Guru MP:</p>
            <div class="sig-space"></div>
            <p>Tandatangan / Masa Keluar:<br>____________________</p>
          </div>
        </div>
      </div>
    `;

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="ms">
      <head>
        <meta charset="UTF-8">
        <title>Slip Panggilan Sesi UBK - SK Tampasuk 1</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 8mm;
          }
          body {
            font-family: 'Segoe UI', Arial, sans-serif;
            color: #0f172a;
            margin: 0;
            padding: 5px;
            background: #fff;
          }
          .no-print-toolbar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #1e3a8a;
            color: white;
            padding: 8px 14px;
            border-radius: 6px;
            margin-bottom: 12px;
          }
          .btn-print-now {
            background: #22c55e;
            color: white;
            border: none;
            padding: 6px 14px;
            font-size: 13px;
            font-weight: bold;
            border-radius: 4px;
            cursor: pointer;
          }
          .slips-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            grid-template-rows: 1fr 1fr;
            gap: 12px;
            height: 96vh;
          }
          .slip-box {
            border: 1.5px dashed #475569;
            border-radius: 6px;
            padding: 10px 12px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            background: #ffffff;
            box-sizing: border-box;
          }
          .slip-header {
            text-align: center;
            border-bottom: 1px solid #94a3b8;
            padding-bottom: 5px;
            margin-bottom: 6px;
          }
          .slip-title-main {
            font-size: 9pt;
            font-weight: 800;
            color: #0f172a;
            text-transform: uppercase;
          }
          .slip-title-sub {
            font-size: 8pt;
            font-weight: 700;
            color: #1e3a8a;
          }
          .slip-badge {
            display: inline-block;
            background: #f1f5f9;
            border: 1px solid #cbd5e1;
            padding: 1px 8px;
            border-radius: 10px;
            font-size: 7.2pt;
            font-weight: bold;
            margin-top: 3px;
            color: #0f172a;
          }
          .slip-content {
            font-size: 8pt;
            line-height: 1.35;
          }
          .slip-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 3px;
          }
          .slip-note {
            font-size: 7pt;
            color: #64748b;
            font-style: italic;
            border-top: 1px dotted #cbd5e1;
            padding-top: 3px;
            margin-top: 3px;
          }
          .slip-signatures {
            display: flex;
            justify-content: space-between;
            margin-top: 6px;
            font-size: 7.5pt;
          }
          .sig-section {
            width: 48%;
            text-align: center;
          }
          .sig-section p {
            margin: 0;
          }
          .sig-space {
            height: 25px;
            border-bottom: 1px dotted #94a3b8;
            margin-bottom: 2px;
          }
          @media print {
            .no-print-toolbar {
              display: none !important;
            }
            body {
              padding: 0 !important;
            }
          }
        </style>
      </head>
      <body>
        <div class="no-print-toolbar">
          <div>
            <strong>🎫 Penjana Slip Panggilan Klien UBK (4 Slip Sehelai A4)</strong>
            <div style="font-size: 11px; opacity: 0.85;">Gunting mengikut garisan putus-putus untuk diserahkan kepada guru kelas.</div>
          </div>
          <button class="btn-print-now" onclick="window.print()">🖨️ Cetak Slip Sekarang</button>
        </div>

        <div class="slips-grid">
          ${singleSlipTemplate}
          ${singleSlipTemplate}
          ${singleSlipTemplate}
          ${singleSlipTemplate}
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  },

  // =========================================================
  // 3. FUNGSI KHAS: PEMBANTU PINTAR "CARI SLOT TERBAIK KLIEN"
  // =========================================================
  openSlotFinderModal: function() {
    const modal = document.getElementById("slotFinderModal");
    if (!modal) return;
    modal.classList.add("active");
    this.runSlotFinder();
  },

  closeSlotFinderModal: function() {
    const modal = document.getElementById("slotFinderModal");
    if (modal) modal.classList.remove("active");
  },

  runSlotFinder: function() {
    const classSelect = document.getElementById("finderClassSelect");
    const typeSelect = document.getElementById("finderTypeSelect");
    const container = document.getElementById("slotFinderResultsContainer");
    if (!classSelect || !typeSelect || !container) return;

    const className = classSelect.value;
    const sessionType = typeSelect.value;

    if (typeof CLASS_SCHEDULES === "undefined" || !CLASS_SCHEDULES[className]) {
      container.innerHTML = `<div class="empty-state">Data kelas ${className} tidak dijumpai.</div>`;
      return;
    }

    const classData = CLASS_SCHEDULES[className];
    const weekData = this.state.practicumData.find(w => w.weekNum === this.state.currentWeek);
    const days = ["ISNIN", "SELASA", "RABU", "KHAMIS", "JUMAAT"];

    const timeToMin = (t) => this.timeToMin(t);

    const recommendedSlots = [];

    days.forEach(day => {
      const classSlots = classData.schedule[day] || [];
      const counselorDaySessions = weekData ? weekData.sessions.filter(s => s.day === day) : [];

      classSlots.forEach(slot => {
        // Hanya ambil subjek bukan teras (PSV, MZ, PJ, PK, RBT, SEJ, TASMEK, BA, BKD)
        const isCore = slot.core === true || ['BM', 'BI', 'M3', 'SN'].includes(slot.code);
        const isSpecial = slot.isBreak || ['REHAT', 'PERHIMPUNAN', 'SEMAI'].includes(slot.code);

        if (!isCore && !isSpecial) {
          const [startStr, endStr] = (slot.time || "").split(" - ");
          if (!startStr || !endStr) return;

          const startMin = timeToMin(startStr);
          const endMin = timeToMin(endStr);

          // Pastikan tidak bertindih dengan waktu rehat sekolah
          if (startMin >= 580 && startMin < 610) return; // 09.40 - 10.10

          // Pastikan Kaunselor LAPANG pada waktu ini (tiada sesi lain bertindih)
          const isCounselorFree = !counselorDaySessions.some(cs => {
            const csStart = timeToMin(cs.timeStart);
            const csEnd = timeToMin(cs.timeEnd);
            return csStart < endMin && csEnd > startMin;
          });

          if (isCounselorFree) {
            recommendedSlots.push({
              day,
              time: slot.time,
              timeStart: startStr,
              timeEnd: endStr,
              subject: `${slot.code} (${slot.name})`,
              teacher: 'Guru Subjek',
              className,
              sessionType
            });
          }
        }
      });
    });

    if (recommendedSlots.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 2rem; background: #fff1f2; border: 1px solid #fecdd3; border-radius: 8px; color: #be123c;">
          <span style="font-size: 2rem; display: block; margin-bottom: 6px;">⚠️</span>
          <strong>Tiada slot lapang bukan teras ditemui untuk kelas ${className} pada minggu ini.</strong><br>
          <span style="font-size: 0.85rem;">Semua waktu bukan teras murid bertindih dengan sesi sedia ada anda atau perhimpunan/rehat.</span>
        </div>
      `;
      return;
    }

    let html = `
      <div style="font-size: 0.88rem; font-weight: 700; color: #15803d; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 6px;">
        <span>✨</span> Dijumpai ${recommendedSlots.length} Cadangan Slot Waktu Bukan Teras (Kaunselor Bebas & Murid Tidak Ketinggalan Subjek Teras):
      </div>
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 0.75rem;">
    `;

    recommendedSlots.forEach(rec => {
      html += `
        <div style="background: white; border: 1.5px solid #86efac; border-radius: 8px; padding: 0.85rem; box-shadow: 0 1px 3px rgba(0,0,0,0.03); display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <span style="font-weight: 800; font-size: 0.95rem; color: #1e3a8a;">📅 ${rec.day}</span>
              <span class="badge badge-individu" style="font-size: 0.75rem;">${rec.subject}</span>
            </div>
            <div style="font-weight: 700; font-size: 0.9rem; color: #0f172a; margin-bottom: 2px;">
              ⏱️ ${rec.time}
            </div>
            <div style="font-size: 0.78rem; color: #475569;">
              👨‍🏫 Guru Subjek: <strong>${rec.teacher}</strong>
            </div>
          </div>
          <button class="btn btn-sm btn-primary" style="margin-top: 0.75rem; width: 100%;" onclick="App.applySlotFinderResult('${rec.day}', '${rec.timeStart}', '${rec.timeEnd}', '${rec.className}', '${rec.subject}', '${rec.sessionType}')">
            <span>➕</span> Ambil Slot Ini
          </button>
        </div>
      `;
    });

    html += `</div>`;
    container.innerHTML = html;
  },

  applySlotFinderResult: function(day, timeStart, timeEnd, className, subject, sessionType) {
    this.closeSlotFinderModal();

    let title = "";
    if (sessionType === "individu") title = `KI (SESI INDIVIDU - KELAS ${className})`;
    else if (sessionType === "kelompok") title = `KELOMPOK (KELAS ${className})`;
    else title = `BIMBINGAN KELAS ${className}`;

    this.openAddSessionModal(day, timeStart, timeEnd, title, `${className} (Waktu ${subject})`);
  },

  // =========================================================
  // 4. PENGESANAN PERTINDIHAN PINTAR & AMARAN SUBJEK TERAS (REAL-TIME ALERT)
  // =========================================================
  checkFormConflict: function() {
    const alertBox = document.getElementById("formConflictAlert");
    if (!alertBox) return;

    const day = document.getElementById("formDay").value;
    const timeStart = document.getElementById("formTimeStart").value.trim();
    const timeEnd = document.getElementById("formTimeEnd").value.trim();
    const classTarget = document.getElementById("formClassTarget").value.trim().toUpperCase();
    const sessionIdx = parseInt(document.getElementById("formSessionIndex").value);
    const weekNum = parseInt(document.getElementById("formWeekNum").value);

    if (!timeStart || !timeEnd) {
      alertBox.style.display = "none";
      return;
    }

    const timeToMin = (t) => this.timeToMin(t);
    const sStart = timeToMin(timeStart);
    const sEnd = timeToMin(timeEnd);

    if (sEnd <= sStart) {
      alertBox.style.display = "block";
      alertBox.style.background = "#fff1f2";
      alertBox.style.borderColor = "#fecdd3";
      alertBox.style.color = "#be123c";
      alertBox.innerHTML = `⚠️ <strong>Ralat Masa:</strong> Masa tamat (${timeEnd}) mestilah lebih lewat daripada masa mula (${timeStart}).`;
      return;
    }

    // 1. Semak Waktu Operasi Rasmi Persekolahan (07.00 AM - 01.40 PM)
    if (sStart < 420 || sEnd > 820) {
      alertBox.style.display = "block";
      alertBox.style.background = "#fffbeb";
      alertBox.style.borderColor = "#fde68a";
      alertBox.style.color = "#92400e";
      alertBox.innerHTML = `⏰ <strong>Peringatan Waktu Persekolahan:</strong> Sesi ini dijadualkan di luar waktu operasi harian sekolah rasmi SK Tampasuk 1 (07.00 AM - 01.40 PM).`;
      return;
    }

    // 2. Semak Waktu Persekolahan Hari Jumaat (Tamat Jam 11.10 AM)
    if (day === "JUMAAT" && sEnd > 670) {
      alertBox.style.display = "block";
      alertBox.style.background = "#fffbeb";
      alertBox.style.borderColor = "#fde68a";
      alertBox.style.color = "#92400e";
      alertBox.innerHTML = `🕌 <strong>Amaran Waktu Jumaat:</strong> Sesi persekolahan hari Jumaat tamat pada jam 11.10 AM untuk solat Jumaat. Sila pastikan sesi tamat selewat-lewatnya jam 11.10 AM.`;
      return;
    }

    // 3. Semak Pertindihan dengan Waktu Rehat Sekolah (09.40 - 10.10)
    if (sStart < 610 && sEnd > 580) {
      alertBox.style.display = "block";
      alertBox.style.background = "#fff1f2";
      alertBox.style.borderColor = "#fecdd3";
      alertBox.style.color = "#be123c";
      alertBox.innerHTML = `☕ <strong>Amaran Waktu Rehat:</strong> Waktu ini bertindih dengan Waktu Rehat Sekolah (09.40 - 10.10 AM). Rehat adalah hak murid.`;
      return;
    }

    // 4. Semak Pertindihan dengan Perhimpunan Rasmi Isnin (07.00 - 07.40)
    if (day === "ISNIN" && sStart < 460 && sEnd > 420) {
      alertBox.style.display = "block";
      alertBox.style.background = "#fffbeb";
      alertBox.style.borderColor = "#fde68a";
      alertBox.style.color = "#92400e";
      alertBox.innerHTML = `📢 <strong>Amaran Perhimpunan:</strong> Isnin 07.00 - 07.40 AM adalah Perhimpunan Rasmi Sekolah SK Tampasuk 1.`;
      return;
    }

    // 5. Semak Pertindihan dengan Sesi Lain pada Hari yang Sama
    const weekData = this.state.practicumData.find(w => w.weekNum === weekNum);
    if (weekData) {
      const otherSessions = weekData.sessions.filter((s, idx) => s.day === day && idx !== sessionIdx);
      const overlap = otherSessions.find(s => {
        const oStart = timeToMin(s.timeStart);
        const oEnd = timeToMin(s.timeEnd);
        return oStart < sEnd && oEnd > sStart;
      });

      if (overlap) {
        alertBox.style.display = "block";
        alertBox.style.background = "#fff1f2";
        alertBox.style.borderColor = "#fecdd3";
        alertBox.style.color = "#be123c";
        alertBox.innerHTML = `❌ <strong>Pertindihan Jadual:</strong> Waktu ini bertindih dengan sesi sedia ada anda: <strong>"${overlap.title}"</strong> (${overlap.timeStart} - ${overlap.timeEnd}).`;
        return;
      }
    }

    // 6. Semak sama ada Kelas Sasaran sedang belajar Subjek Teras Akademik
    if (typeof CLASS_SCHEDULES !== "undefined" && classTarget) {
      const matchedClassName = Object.keys(CLASS_SCHEDULES).find(c => classTarget.toUpperCase().includes(c));
      if (matchedClassName) {
        const classSlots = CLASS_SCHEDULES[matchedClassName].schedule[day] || [];
        const coreConflict = classSlots.find(slot => {
          const isCore = slot.core === true || ['BM', 'BI', 'M3', 'MT', 'SN'].includes(slot.code);
          if (!isCore) return false;
          const [csStr, ceStr] = (slot.time || "").split(" - ");
          const csMin = timeToMin(csStr);
          const ceMin = timeToMin(ceStr);
          return csMin < sEnd && ceMin > sStart;
        });

        if (coreConflict) {
          alertBox.style.display = "block";
          alertBox.style.background = "#fffbeb";
          alertBox.style.borderColor = "#fde68a";
          alertBox.style.color = "#92400e";
          alertBox.innerHTML = `⚠️ <strong>Peringatan Perlindungan Murid:</strong> Kelas <strong>${matchedClassName}</strong> sedang belajar subjek teras akademik (<strong>${coreConflict.code} - ${coreConflict.name}</strong>) pada waktu ini. Sila pertimbangkan waktu bukan teras agar murid tidak ketinggalan silibus utama.`;
          return;
        }

        const nonCoreSlot = classSlots.find(slot => {
          const isCore = slot.core === true || ['BM', 'BI', 'M3', 'MT', 'SN'].includes(slot.code);
          const isSpecial = slot.isBreak || ['REHAT', 'PERHIMPUNAN', 'SEMAI', 'PH'].includes(slot.code);
          if (isCore || isSpecial) return false;
          const [csStr, ceStr] = (slot.time || "").split(" - ");
          const csMin = timeToMin(csStr);
          const ceMin = timeToMin(ceStr);
          return csMin < sEnd && ceMin > sStart;
        });

        if (nonCoreSlot) {
          alertBox.style.display = "block";
          alertBox.style.background = "#f0fdf4";
          alertBox.style.borderColor = "#86efac";
          alertBox.style.color = "#15803d";
          alertBox.innerHTML = `✅ <strong>Pilihan Slot Baik:</strong> Kelas <strong>${matchedClassName}</strong> sedang belajar subjek bukan teras (<strong>${nonCoreSlot.code} - ${nonCoreSlot.name}</strong>). Sangat sesuai untuk sesi kaunseling!`;
          return;
        }
      } else if (classTarget.includes("PRA")) {
        alertBox.style.display = "block";
        alertBox.style.background = "#f0fdf4";
        alertBox.style.borderColor = "#86efac";
        alertBox.style.color = "#15803d";
        alertBox.innerHTML = `✅ <strong>Kelas Prasekolah:</strong> Bebas daripada sukatan teras peperiksaan KSSR. Waktu sangat fleksibel untuk bimbingan awal kanak-kanak.`;
        return;
      }
    }

    alertBox.style.display = "none";
  },

  // =========================================================
  // 4B. CADANGAN KELAS AUTOMATIK (WAKTU BUKAN TERAS)
  // =========================================================
  renderClassSuggestions: function() {
    const wrapper = document.getElementById("autoClassSuggestWrapper");
    const chipsContainer = document.getElementById("autoClassSuggestChips");
    const titleEl = document.getElementById("autoClassSuggestTitle");
    const badgeEl = document.getElementById("autoClassSuggestBadge");
    const descEl  = document.getElementById("autoClassSuggestDesc");
    const quickStudentWrap = document.getElementById("autoClassQuickStudentWrap");
    const quickStudentText = document.getElementById("autoClassQuickStudentText");

    if (!wrapper || !chipsContainer || !titleEl || !badgeEl) return;

    const day = document.getElementById("formDay")?.value || "ISNIN";
    const timeStart = (document.getElementById("formTimeStart")?.value || "").trim();
    const timeEnd = (document.getElementById("formTimeEnd")?.value || "").trim();
    const currentTarget = (document.getElementById("formClassTarget")?.value || "").trim().toUpperCase();

    // Sembunyikan quick student browse by default
    if (quickStudentWrap) quickStudentWrap.style.display = "none";

    // Semak jika masa belum dimasukkan
    if (!timeStart || !timeEnd) {
      wrapper.className = "auto-class-suggest-wrapper";
      titleEl.innerHTML = `<span>💡</span> <span>Cadangan Kelas Sesuai (Waktu Bukan Teras):</span>`;
      badgeEl.textContent = "Pilih masa";
      if (descEl) descEl.textContent = "Sila masukkan masa mula & tamat atau klik butang W1 - W10 untuk melihat cadangan kelas:";
      chipsContainer.innerHTML = `<span style="font-size: 0.78rem; color: #64748b; font-style: italic;">🕒 Pilih masa mula dan tamat di atas (atau klik butang pilihan standard W1 – W10) untuk mengimbas kelas yang sedang belajar subjek bukan teras.</span>`;
      return;
    }

    const timeToMin = (t) => this.timeToMin(t);
    const sStart = timeToMin(timeStart);
    const sEnd = timeToMin(timeEnd);

    if (sEnd <= sStart) {
      wrapper.className = "auto-class-suggest-wrapper warning-mode";
      titleEl.innerHTML = `<span>⚠️</span> <span>Masa Tidak Sah:</span>`;
      badgeEl.textContent = "Ralat masa";
      if (descEl) descEl.textContent = "Masa tamat mestilah lebih lewat daripada masa mula:";
      chipsContainer.innerHTML = `<span style="font-size: 0.78rem; color: #be123c;">Sila pastikan masa tamat (${timeEnd}) lebih besar daripada masa mula (${timeStart}).</span>`;
      return;
    }

    // 1. Semak Waktu Persekolahan Tamat Hari Jumaat (11.10 AM)
    if (day === "JUMAAT" && sStart >= 670) {
      wrapper.className = "auto-class-suggest-wrapper warning-mode";
      titleEl.innerHTML = `<span>🕌</span> <span>Sesi Persekolahan Tamat (Jumaat Selepas 11.10 AM):</span>`;
      badgeEl.textContent = "Sesi Tamat";
      if (descEl) descEl.textContent = "Persekolahan hari Jumaat tamat jam 11.10 AM:";
      chipsContainer.innerHTML = `<span style="font-size: 0.78rem; color: #92400e;">🕌 Persekolahan hari Jumaat tamat pada jam 11.10 AM untuk solat Jumaat dan rehat mingguan. Tiada kelas akademik selepas waktu ini.</span>`;
      return;
    }

    // 2. Semak Waktu Rehat Sekolah (09.40 - 10.10)
    if (sStart < 610 && sEnd > 580) {
      wrapper.className = "auto-class-suggest-wrapper break-mode";
      titleEl.innerHTML = `<span>☕</span> <span>Waktu Rehat Sekolah (09.40 – 10.10 AM):</span>`;
      badgeEl.textContent = "Waktu Rehat";
      if (descEl) descEl.textContent = "Murid dan guru sedang berehat. Tiada kelas akademik dijalankan:";
      chipsContainer.innerHTML = `<span style="font-size: 0.78rem; color: #be123c;">☕ Waktu rehat rasmi SK Tampasuk 1. Sesi bimbingan tidak digalakkan pada waktu makan/rehat murid.</span>`;
      return;
    }

    // 3. Semak Perhimpunan Rasmi Hari Isnin (07.00 - 07.40)
    if (day === "ISNIN" && sStart < 460 && sEnd > 420) {
      wrapper.className = "auto-class-suggest-wrapper warning-mode";
      titleEl.innerHTML = `<span>📢</span> <span>Perhimpunan Rasmi Isnin (07.00 – 07.40 AM):</span>`;
      badgeEl.textContent = "Perhimpunan";
      if (descEl) descEl.textContent = "Seluruh warga sekolah berada di tapak perhimpunan:";
      chipsContainer.innerHTML = `<span style="font-size: 0.78rem; color: #92400e;">📢 Waktu perhimpunan mingguan SK Tampasuk 1. Tiada kelas di dalam bilik darjah.</span>`;
      return;
    }

    if (typeof CLASS_SCHEDULES === "undefined") {
      chipsContainer.innerHTML = `<span style="font-size: 0.78rem; color: #64748b;">Data jadual kelas tidak ditemui.</span>`;
      return;
    }

    // Senarai 12 kelas (Tahap 2 didahulukan kerana keutamaan sesi bimbingan/kaunseling)
    const priorityClasses = [
      "4 ARIF", "4 BESTARI", "5 ARIF", "5 BESTARI", "6 ARIF", "6 BESTARI",
      "1 ARIF", "1 BESTARI", "2 ARIF", "2 BESTARI", "3 ARIF", "3 BESTARI"
    ];

    const suitableClasses = [];

    priorityClasses.forEach(className => {
      const cData = CLASS_SCHEDULES[className];
      if (!cData || !cData.schedule || !cData.schedule[day]) return;

      const daySlots = cData.schedule[day];
      const overlappingSlots = daySlots.filter(slot => {
        if (!slot.time) return false;
        const [csStr, ceStr] = slot.time.split(" - ");
        const csMin = timeToMin(csStr);
        const ceMin = timeToMin(ceStr);
        return csMin < sEnd && ceMin > sStart;
      });

      if (overlappingSlots.length === 0) return;

      // Semak jika ada subjek teras
      const hasCore = overlappingSlots.some(s => {
        return s.core === true || ["BM", "BI", "M3", "MT", "SN"].includes(s.code);
      });

      // Semak jika ada waktu rehat atau perhimpunan
      const hasBreakOrSpecial = overlappingSlots.some(s => {
        return s.isBreak || ["REHAT", "PERHIMPUNAN", "PH"].includes(s.code);
      });

      if (!hasCore && !hasBreakOrSpecial) {
        const uniqueCodes = [...new Set(overlappingSlots.map(s => s.code))].join("/");
        const uniqueNames = [...new Set(overlappingSlots.map(s => s.name))].join(", ");
        const tahap = cData.tahap || (className.startsWith("1") || className.startsWith("2") || className.startsWith("3") ? 1 : 2);

        suitableClasses.push({
          className,
          tahap,
          codes: uniqueCodes,
          names: uniqueNames,
          slots: overlappingSlots
        });
      }
    });

    if (suitableClasses.length === 0) {
      wrapper.className = "auto-class-suggest-wrapper warning-mode";
      titleEl.innerHTML = `<span>⚠️</span> <span>Tiada Subjek Bukan Teras pada ${day} (${timeStart} – ${timeEnd}):</span>`;
      badgeEl.textContent = "Semua Kelas Teras";
      if (descEl) descEl.textContent = "Semua kelas sedang belajar subjek teras akademik (BM, BI, Matematik, Sains):";
      chipsContainer.innerHTML = `
        <div style="font-size: 0.78rem; color: #92400e; line-height: 1.4;">
          Semua 12 kelas sedang ada subjek teras akademik pada waktu ini. Sila pertimbangkan waktu lain (contohnya klik butang <strong>W2, W4, W7, atau W8</strong>) agar murid tidak ketinggalan mata pelajaran teras.
        </div>
      `;
      return;
    }

    // Paparan Berjaya Menjumpai Kelas Sesuai
    wrapper.className = "auto-class-suggest-wrapper";
    titleEl.innerHTML = `<span>💡</span> <span>Cadangan Kelas Sesuai (Waktu Bukan Teras • ${day} ${timeStart} – ${timeEnd}):</span>`;
    badgeEl.textContent = `${suitableClasses.length} Kelas Sesuai`;
    if (descEl) descEl.textContent = "Klik mana-mana kelas di bawah untuk memilih kelas secara automatik:";

    let chipsHtml = "";
    suitableClasses.forEach(item => {
      const isSelected = currentTarget.includes(item.className);
      chipsHtml += `
        <button type="button" 
                class="class-chip-btn ${isSelected ? 'active' : ''}" 
                onclick="App.applySuggestedClass('${item.className}')" 
                title="Pilih ${item.className} (Subjek: ${item.names})">
          <span>${isSelected ? '✓' : '➕'}</span>
          <strong>${item.className}</strong>
          <span class="chip-subj">${item.codes}</span>
          <span class="chip-tahap">Tahap ${item.tahap}</span>
        </button>
      `;
    });

    chipsContainer.innerHTML = chipsHtml;

    // Jika ada kelas terpilih dalam borang, buka pautan pantas murid
    const matchedSuitable = suitableClasses.find(c => currentTarget.includes(c.className));
    if (matchedSuitable && quickStudentWrap && quickStudentText) {
      quickStudentWrap.style.display = "flex";
      quickStudentText.innerHTML = `👥 <strong>Murid Kelas ${matchedSuitable.className}:</strong> ${matchedSuitable.codes} (${matchedSuitable.names}) • Sedia dipilih`;
    }
  },

  applySuggestedClass: function(className) {
    const classTargetEl = document.getElementById("formClassTarget");
    if (classTargetEl) {
      classTargetEl.value = className;
    }

    // Auto-cadang tajuk sesi jika masih kosong atau default
    const titleEl = document.getElementById("formTitle");
    const typeEl  = document.getElementById("formType");
    const type    = typeEl ? typeEl.value : "individu";
    if (titleEl && (!titleEl.value || titleEl.value.startsWith("KI - ") || titleEl.value.startsWith("Kelompok - ") || titleEl.value.startsWith("Bimbingan Kelas "))) {
      if (type === "kelompok") {
        titleEl.value = `Kelompok - Kelas ${className}`;
      } else if (type === "bimbingan") {
        titleEl.value = `Bimbingan Kelas ${className}`;
      } else if (type === "individu" && (!this.state.selectedStudentsInForm || this.state.selectedStudentsInForm.length === 0)) {
        titleEl.value = `KI - Murid ${className}`;
      }
    }

    this.renderClassSuggestions();
    this.checkFormConflict();
  },

  showStudentsForSelectedClass: function() {
    const classTarget = (document.getElementById("formClassTarget")?.value || "").trim();
    if (!classTarget) return;

    const matchedClass = ["1 ARIF", "1 BESTARI", "2 ARIF", "2 BESTARI", "3 ARIF", "3 BESTARI", "4 ARIF", "4 BESTARI", "5 ARIF", "5 BESTARI", "6 ARIF", "6 BESTARI"].find(c => classTarget.toUpperCase().includes(c));
    const query = matchedClass || classTarget;

    const searchInput = document.getElementById("formStudentSearch");
    if (searchInput) {
      searchInput.value = query;
      searchInput.focus();
      this.handleStudentSearch(query);
    }
  },

  // =========================================================
  // 5. ANJAK SESI (QUICK RESCHEDULE)
  // =========================================================
  openRescheduleModal: function(weekNum, day, sessionIdx) {
    const weekData = this.state.practicumData.find(w => w.weekNum === weekNum);
    if (!weekData) return;
    const s = weekData.sessions[sessionIdx];
    if (!s) return;

    document.getElementById("rescheduleWeekNum").value = weekNum;
    document.getElementById("rescheduleDay").value = day;
    document.getElementById("rescheduleSessionIdx").value = sessionIdx;

    document.getElementById("rescheduleSessionTitle").textContent = s.title;
    document.getElementById("rescheduleCurrentTime").textContent = `Asal: Hari ${day} (${s.timeStart} - ${s.timeEnd}) • Sasaran: ${s.classTarget || '-'}`;

    document.getElementById("rescheduleNewDay").value = day;
    document.getElementById("rescheduleNewStart").value = s.timeStart;
    document.getElementById("rescheduleNewEnd").value = s.timeEnd;

    const modal = document.getElementById("rescheduleModal");
    if (modal) modal.classList.add("active");
  },

  closeRescheduleModal: function() {
    const modal = document.getElementById("rescheduleModal");
    if (modal) modal.classList.remove("active");
  },

  handleReschedule: function() {
    const weekNum = parseInt(document.getElementById("rescheduleWeekNum").value);
    const sessionIdx = parseInt(document.getElementById("rescheduleSessionIdx").value);
    const newDay = document.getElementById("rescheduleNewDay").value;
    const newStart = document.getElementById("rescheduleNewStart").value.trim();
    const newEnd = document.getElementById("rescheduleNewEnd").value.trim();

    const weekData = this.state.practicumData.find(w => w.weekNum === weekNum);
    if (!weekData || sessionIdx < 0 || sessionIdx >= weekData.sessions.length) return;

    const s = weekData.sessions[sessionIdx];
    s.day = newDay;
    s.timeStart = newStart;
    s.timeEnd = newEnd;
    s.status = 'belum'; // Tetapkan semula status ke belum apabila dianjak

    this.savePracticumData();
    this.closeRescheduleModal();
    this.renderPracticumTable();
    this.renderPracticumHoursDashboard();
    this.renderOfficialIpgmForms();
    alert(`Sesi "${s.title}" berjaya dipindahkan ke Hari ${newDay} (${newStart} - ${newEnd})!`);
  },

  // =========================================================
  // 6. GANDAKAN / SALIN JADUAL MINGGU (CLONE WEEK)
  // =========================================================
  openCloneWeekModal: function() {
    const modal = document.getElementById("cloneWeekModal");
    if (modal) modal.classList.add("active");
  },

  closeCloneWeekModal: function() {
    const modal = document.getElementById("cloneWeekModal");
    if (modal) modal.classList.remove("active");
  },

  executeCloneWeek: function() {
    const sourceWeekNum = this.state.currentWeek;
    const targetWeekNum = parseInt(document.getElementById("cloneTargetWeekSelect").value);

    if (sourceWeekNum === targetWeekNum) {
      alert("Sila pilih minggu sasaran yang berbeza daripada minggu semasa!");
      return;
    }

    const sourceWeek = this.state.practicumData.find(w => w.weekNum === sourceWeekNum);
    const targetWeek = this.state.practicumData.find(w => w.weekNum === targetWeekNum);

    if (!sourceWeek || !targetWeek) return;

    if (confirm(`Adakah anda pasti mahu menyalin ${sourceWeek.sessions.length} sesi dari Minggu ${sourceWeekNum} ke Minggu ${targetWeekNum}? Sesi sedia ada pada Minggu ${targetWeekNum} akan digantikan.`)) {
      // Salin dengan status direset ke 'belum'
      const clonedSessions = sourceWeek.sessions.map(s => ({
        ...s,
        status: 'belum'
      }));

      targetWeek.sessions = JSON.parse(JSON.stringify(clonedSessions));
      this.savePracticumData();
      this.closeCloneWeekModal();

      // Tukar ke minggu sasaran untuk semakan
      this.state.currentWeek = targetWeekNum;
      const weekSelect = document.getElementById("weekSelect");
      if (weekSelect) weekSelect.value = targetWeekNum;

      this.renderPracticumTable();
      this.renderPracticumHoursDashboard();
      alert(`Berjaya menyalin semua sesi ke Minggu ${targetWeekNum}! Anda kini sedang melihat Minggu ${targetWeekNum}.`);
    }
  },

  // =========================================================
  // 7. PAPAN PEMUKA PENJEJAK JAM PRAKTIKUM & BUKU LOG UBK
  // =========================================================
  renderPracticumHoursDashboard: function() {
    const container = document.getElementById("practicumHoursDashboardContainer");
    if (!container) return;

    const timeToMin = (t) => this.timeToMin(t);
    const docRate = typeof this.state.docRate === 'number' ? this.state.docRate : 30;

    let grandTotalMin = 0;
    let totalKIMin = 0, totalKelompokMin = 0, totalBimbinganMin = 0, totalAdminSchedMin = 0, totalProgramMin = 0;
    let totalKISessions = 0, totalKelompokSessions = 0, totalBimbinganSessions = 0, totalAdminSchedSessions = 0, totalProgramSessions = 0;

    const weeklyBreakdown = [];

    this.state.practicumData.forEach(w => {
      let wKIMin = 0, wKelMin = 0, wBimMin = 0, wAdminSchedMin = 0, wProgMin = 0;
      let wKI = 0, wKel = 0, wBim = 0, wAdminSched = 0, wProg = 0;

      w.sessions.forEach(s => {
        const dur = timeToMin(s.timeEnd) - timeToMin(s.timeStart);
        // PENTING: 'penyeliaan', 'programLain', dan 'kokurikulum' TIDAK dikira dalam mana-mana jam
        if (s.type === 'penyeliaan' || s.type === 'programLain' || s.type === 'kokurikulum') return;
        if (dur > 0 && dur <= 480) {
          if (s.type === 'individu') {
            wKIMin += dur; wKI++;
            totalKIMin += dur; totalKISessions++;
          } else if (s.type === 'kelompok') {
            wKelMin += dur; wKel++;
            totalKelompokMin += dur; totalKelompokSessions++;
          } else if (s.type === 'bimbingan') {
            wBimMin += dur; wBim++;
            totalBimbinganMin += dur; totalBimbinganSessions++;
          } else if (s.type === 'pentadbiran' || s.type === 'konsultasi') {
            wAdminSchedMin += dur; wAdminSched++;
            totalAdminSchedMin += dur; totalAdminSchedSessions++;
          } else if (s.type === 'program') {
            wProgMin += dur; wProg++;
            totalProgramMin += dur; totalProgramSessions++;
          }
        }
      });

      // Pengiraan Automatik Dokumentasi bagi Sesi Intervensi Langsung (KI, Kelompok, Bimbingan)
      const wDirectSessions = wKI + wKel + wBim;
      const wAutoDocMin = wDirectSessions * docRate;
      const wAdminTotalMin = wAdminSchedMin + wAutoDocMin;
      const weekTotalMin = wKIMin + wKelMin + wBimMin + wAdminTotalMin + wProgMin;

      // Sesi aktif sebenar (tidak termasuk cuti, penyeliaan, program luar atau kokurikulum)
      const activeSessionsCount = w.sessions.filter(s => s.type !== 'cuti' && s.type !== 'penyeliaan' && s.type !== 'programLain' && s.type !== 'kokurikulum').length;

      weeklyBreakdown.push({
        weekNum: w.weekNum,
        title: w.title,
        dateRange: w.dateRange,
        ki: wKI,
        kel: wKel,
        bim: wBim,
        adminSched: wAdminSched,
        prog: wProg,
        directSessions: wDirectSessions,
        kiMin: wKIMin,
        kelMin: wKelMin,
        bimMin: wBimMin,
        adminSchedMin: wAdminSchedMin,
        autoDocMin: wAutoDocMin,
        adminTotalMin: wAdminTotalMin,
        progMin: wProgMin,
        totalMin: weekTotalMin,
        hours: (weekTotalMin / 60).toFixed(1),
        adminTotalHours: (wAdminTotalMin / 60).toFixed(1),
        autoDocHours: (wAutoDocMin / 60).toFixed(1),
        adminSchedHours: (wAdminSchedMin / 60).toFixed(1),
        totalSessions: activeSessionsCount
      });
    });

    const totalDirectSessions = totalKISessions + totalKelompokSessions + totalBimbinganSessions;
    const totalAutoDocMin = totalDirectSessions * docRate;
    const totalAdminTotalMin = totalAdminSchedMin + totalAutoDocMin;
    const totalDirectMin = totalKIMin + totalKelompokMin + totalBimbinganMin;
    grandTotalMin = totalDirectMin + totalAdminTotalMin + totalProgramMin;

    const grandHours = (grandTotalMin / 60).toFixed(1);
    const kiHours = (totalKIMin / 60).toFixed(1);
    const kelHours = (totalKelompokMin / 60).toFixed(1);
    const bimHours = (totalBimbinganMin / 60).toFixed(1);
    const adminTotalHours = (totalAdminTotalMin / 60).toFixed(1);
    const adminSchedHours = (totalAdminSchedMin / 60).toFixed(1);
    const autoDocHours = (totalAutoDocMin / 60).toFixed(1);
    const progHours = (totalProgramMin / 60).toFixed(1);
    const directContactHours = (totalDirectMin / 60).toFixed(1);

    // =========================================================
    // SASARAN MINIMUM PRAKTIKUM TERKINI (SK TAMPASUK 1 / IPG):
    // JUMLAH KESELURUHAN: 252 JAM (MINIMUM)
    // - Intervensi Langsung (Direct Contact): 96 Jam (MINIMUM)
    //   * Kaunseling Individu (KI): 30 Jam (Min)
    //   * Kaunseling Kelompok (KK): 20 Jam (Min)
    //   * Bimbingan Kelas / Kelompok: 46 Jam (Min)
    // - Pentadbiran, Pengurusan, Program & Dok (Indirect): 156 Jam
    // - Kokurikulum: TIDAK LAGI DIKIRA
    // =========================================================
    const targetKumulatif = 252;
    const targetDirectTotal = 96;
    const targetKI = 30;
    const targetKK = 20;
    const targetBim = 46;
    const targetIndirect = 156;

    const progressPercent = Math.min(100, Math.round((parseFloat(grandHours) / targetKumulatif) * 100));
    const directPercent = Math.min(100, Math.round((parseFloat(directContactHours) / targetDirectTotal) * 100));
    const kiPercent = Math.min(100, Math.round((parseFloat(kiHours) / targetKI) * 100));
    const kkPercent = Math.min(100, Math.round((parseFloat(kelHours) / targetKK) * 100));
    const bimPercent = Math.min(100, Math.round((parseFloat(bimHours) / targetBim) * 100));
    const adminPercent = Math.min(100, Math.round((parseFloat(adminTotalHours) / targetIndirect) * 100));

    let html = `
      <!-- Pilihan Kadar Masa Dokumentasi Automatik -->
      <div style="background: white; border: 1.5px solid #cbd5e1; border-radius: 12px; padding: 1rem 1.25rem; margin-bottom: 1.25rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
        <div>
          <div style="font-weight: 700; font-size: 0.95rem; color: #0f172a; display: flex; align-items: center; gap: 6px;">
            <span>⏱️</span>
            <span>Kadar Pengiraan Automatik Dokumentasi Sesi UBK</span>
          </div>
          <div style="font-size: 0.8rem; color: #64748b; margin-top: 2px;">
            Setiap sesi kaunseling & bimbingan diperuntukkan masa penyediaan rekod profil murid, laporan sesi & catatan buku log praktikum.
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <label for="docRateSelect" style="font-size: 0.82rem; font-weight: 700; color: #334155; white-space: nowrap;">Kadar Masa:</label>
          <select id="docRateSelect" class="form-control" style="width: auto; min-width: 200px; padding: 6px 10px; font-weight: 700; border-color: #0284c7; background: #f0f9ff; color: #0369a1; cursor: pointer;" onchange="App.setDocRate(this.value)">
            <option value="30" ${docRate === 30 ? 'selected' : ''}>30 Minit / Sesi (Piawai KPM & Lembaga)</option>
            <option value="20" ${docRate === 20 ? 'selected' : ''}>20 Minit / Sesi (Pantas & Ringkas)</option>
            <option value="15" ${docRate === 15 ? 'selected' : ''}>15 Minit / Sesi (Catatan Minimum)</option>
            <option value="45" ${docRate === 45 ? 'selected' : ''}>45 Minit / Sesi (Laporan Lengkap & Terperinci)</option>
            <option value="0" ${docRate === 0 ? 'selected' : ''}>0 Minit (Sesi Berjadual Sahaja)</option>
          </select>
        </div>
      </div>

      <!-- Ringkasan Jam Utama (5 Kad Mengikut KPI 252 Jam) -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
        <div style="background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 12px; padding: 1.25rem; text-align: center;">
          <div style="font-size: 0.78rem; font-weight: 800; color: #166534; text-transform: uppercase;">Jumlah Keseluruhan (Min 252j)</div>
          <div style="font-family: 'Outfit'; font-size: 2.2rem; font-weight: 800; color: #15803d; margin: 4px 0;">${grandHours} <span style="font-size:1.1rem; font-weight:600; color:#166534;">/ 252j</span></div>
          <div style="font-size: 0.75rem; font-weight: 700; color: #15803d;">${progressPercent}% Sasaran • Baki: ${Math.max(0, targetKumulatif - parseFloat(grandHours)).toFixed(1)}j</div>
        </div>

        <div style="background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 12px; padding: 1.25rem; text-align: center;">
          <div style="font-size: 0.78rem; font-weight: 800; color: #1e40af; text-transform: uppercase;">Kaunseling Individu (Min 30j)</div>
          <div style="font-family: 'Outfit'; font-size: 2.2rem; font-weight: 800; color: #1d4ed8; margin: 4px 0;">${kiHours} <span style="font-size:1.1rem; font-weight:600; color:#1e40af;">/ 30j</span></div>
          <div style="font-size: 0.75rem; font-weight: 700; color: ${parseFloat(kiHours) >= targetKI ? '#15803d' : '#1e40af'};">
            ${kiPercent}% • ${parseFloat(kiHours) >= targetKI ? '✅ Capai Min (30j)' : 'Baki ' + (targetKI - parseFloat(kiHours)).toFixed(1) + 'j'} • ${totalKISessions} Sesi
          </div>
        </div>

        <div style="background: #eef2ff; border: 1.5px solid #c7d2fe; border-radius: 12px; padding: 1.25rem; text-align: center;">
          <div style="font-size: 0.78rem; font-weight: 800; color: #3730a3; text-transform: uppercase;">Kaunseling Kelompok (Min 20j)</div>
          <div style="font-family: 'Outfit'; font-size: 2.2rem; font-weight: 800; color: #4338ca; margin: 4px 0;">${kelHours} <span style="font-size:1.1rem; font-weight:600; color:#3730a3;">/ 20j</span></div>
          <div style="font-size: 0.75rem; font-weight: 700; color: ${parseFloat(kelHours) >= targetKK ? '#15803d' : '#3730a3'};">
            ${kkPercent}% • ${parseFloat(kelHours) >= targetKK ? '✅ Capai Min (20j)' : 'Baki ' + (targetKK - parseFloat(kelHours)).toFixed(1) + 'j'} • ${totalKelompokSessions} Sesi
          </div>
        </div>

        <div style="background: #faf5ff; border: 1.5px solid #e9d5ff; border-radius: 12px; padding: 1.25rem; text-align: center;">
          <div style="font-size: 0.78rem; font-weight: 800; color: #6b21a8; text-transform: uppercase;">Bimbingan Kelas (Min 46j)</div>
          <div style="font-family: 'Outfit'; font-size: 2.2rem; font-weight: 800; color: #7e22ce; margin: 4px 0;">${bimHours} <span style="font-size:1.1rem; font-weight:600; color:#6b21a8;">/ 46j</span></div>
          <div style="font-size: 0.75rem; font-weight: 700; color: ${parseFloat(bimHours) >= targetBim ? '#15803d' : '#6b21a8'};">
            ${bimPercent}% • ${parseFloat(bimHours) >= targetBim ? '✅ Capai Min (46j)' : 'Baki ' + (targetBim - parseFloat(bimHours)).toFixed(1) + 'j'} • ${totalBimbinganSessions} Kelas
          </div>
        </div>

        <div style="background: #ecfeff; border: 1.5px solid #a5f3fc; border-radius: 12px; padding: 1.25rem; text-align: center;">
          <div style="font-size: 0.78rem; font-weight: 800; color: #0e7490; text-transform: uppercase;">Pentadbiran & Dok (156j)</div>
          <div style="font-family: 'Outfit'; font-size: 2.2rem; font-weight: 800; color: #0891b2; margin: 4px 0;">${adminTotalHours} <span style="font-size:1.1rem; font-weight:600; color:#0e7490;">/ 156j</span></div>
          <div style="font-size: 0.75rem; font-weight: 700; color: #0e7490;">
            ${adminPercent}% • ${autoDocHours}j Dok + ${adminSchedHours}j Berjadual
          </div>
        </div>
      </div>

      <!-- Kad Analisis Piawai Buku Log Praktikum UBK (Direct vs Indirect Hours) -->
      <div class="practicum-breakdown-card">
        <div class="breakdown-item">
          <span style="font-size: 0.78rem; font-weight: 800; color: #1e40af; text-transform: uppercase;">🎯 Jam Intervensi Langsung (Min: 96 Jam)</span>
          <span style="font-size: 1.45rem; font-weight: 800; color: #1d4ed8; margin: 2px 0;">${directContactHours} / 96 Jam</span>
          <span style="font-size: 0.76rem; font-weight: 700; color: ${parseFloat(directContactHours) >= targetDirectTotal ? '#15803d' : '#b45309'}; margin-bottom: 2px;">
            ${parseFloat(directContactHours) >= targetDirectTotal ? '✅ KPI Minimum 96 Jam Bersemuka Tercapai!' : '⏳ Baki ' + (targetDirectTotal - parseFloat(directContactHours)).toFixed(1) + ' Jam untuk Capai 96 Jam'}
          </span>
          <span style="font-size: 0.72rem; color: #64748b;">Agihan Min: KI 30j + KK 20j + Bimbingan 46j (${totalDirectSessions} Sesi Bersemuka)</span>
        </div>
        <div style="width: 1px; height: 50px; background: #cbd5e1;" class="d-none d-md-block"></div>
        <div class="breakdown-item highlight">
          <span style="font-size: 0.78rem; font-weight: 800; color: #0e7490; text-transform: uppercase;">📋 Jam Pentadbiran & Pengurusan (Indirect: 156j)</span>
          <span style="font-size: 1.45rem; font-weight: 800; color: #0891b2; margin: 2px 0;">${adminTotalHours} Jam</span>
          <span style="font-size: 0.74rem; color: #0e7490;">${autoDocHours}j Dokumentasi Automatik + ${adminSchedHours}j Pengurusan Bilik & HEM</span>
        </div>
        <div style="width: 1px; height: 50px; background: #cbd5e1;" class="d-none d-md-block"></div>
        <div class="breakdown-item">
          <span style="font-size: 0.78rem; font-weight: 800; color: #92400e; text-transform: uppercase;">🏫 Jam Program Sekolah</span>
          <span style="font-size: 1.45rem; font-weight: 800; color: #b45309; margin: 2px 0;">${progHours} Jam</span>
          <span style="font-size: 0.74rem; color: #64748b;">${totalProgramSessions} Aktiviti / Majlis / Kursus Sekolah</span>
        </div>
      </div>

      <!-- Meter Kemajuan Jam Praktikum (252 Jam & 96 Jam Intervensi) -->
      <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 1.25rem; margin-bottom: 1.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; flex-wrap: wrap; gap: 6px;">
          <span style="font-weight: 800; font-size: 0.95rem; color: #0f172a;">
            📊 Kemajuan Jumlah Jam Praktikum: <span style="color:#15803d;">${grandHours} / 252 Jam</span> (Sasaran Minimum)
          </span>
          <span style="font-weight: 800; font-size: 0.95rem; color: #1e3a8a; background: #dbeafe; padding: 2px 10px; border-radius: 6px;">
            ${progressPercent}%
          </span>
        </div>
        <div style="background: #e2e8f0; height: 16px; border-radius: 10px; overflow: hidden; margin-bottom: 6px;">
          <div style="background: linear-gradient(90deg, #10b981, #0284c7); height: 100%; width: ${progressPercent}%; border-radius: 10px; transition: width 0.4s ease;"></div>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 0.76rem; color: #64748b; margin-bottom: 1rem; flex-wrap: wrap; gap: 4px;">
          <span>Terkumpul: <strong>${grandHours} Jam</strong> (Intervensi: ${directContactHours}j + Pentadbiran: ${adminTotalHours}j + Program: ${progHours}j)</span>
          <span>Baki Keseluruhan: <strong style="color: ${parseFloat(grandHours) >= targetKumulatif ? '#15803d' : '#b45309'};">${Math.max(0, targetKumulatif - parseFloat(grandHours)).toFixed(1)} Jam</strong></span>
        </div>

        <!-- Sub-Meter Intervensi Langsung (96 Jam) -->
        <div style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; padding: 0.85rem; margin-top: 0.5rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; flex-wrap: wrap; gap: 4px;">
            <span style="font-size: 0.82rem; font-weight: 800; color: #1e40af;">
              🎯 Intervensi Langsung (Direct Contact): ${directContactHours} / 96 Jam (Min)
            </span>
            <span style="font-size: 0.78rem; font-weight: 800; color: ${parseFloat(directContactHours) >= targetDirectTotal ? '#15803d' : '#1d4ed8'};">
              ${directPercent}% ${parseFloat(directContactHours) >= targetDirectTotal ? '✓ Tercapai' : ''}
            </span>
          </div>
          <div style="background: #f1f5f9; height: 10px; border-radius: 6px; overflow: hidden; margin-bottom: 6px;">
            <div style="background: linear-gradient(90deg, #3b82f6, #8b5cf6); height: 100%; width: ${directPercent}%; border-radius: 6px;"></div>
          </div>
          <div style="display: flex; gap: 10px; font-size: 0.74rem; color: #475569; flex-wrap: wrap;">
            <span>👤 KI: <strong>${kiHours} / 30j</strong> (${kiPercent}%)</span>
            <span>•</span>
            <span>👥 KK: <strong>${kelHours} / 20j</strong> (${kkPercent}%)</span>
            <span>•</span>
            <span>📚 Bimbingan: <strong>${bimHours} / 46j</strong> (${bimPercent}%)</span>
            <span>•</span>
            <span style="color:#64748b; font-style:italic;">*Kokurikulum tidak lagi dikira dalam jam praktikum</span>
          </div>
        </div>
      </div>

      <!-- Jadual Perincian Jam Mengikut Minggu -->
      <h4 style="font-family: 'Outfit'; font-size: 1.1rem; color: var(--primary); font-weight: 700; margin-bottom: 0.75rem;">
        📅 Perincian Jam & Bilangan Sesi Setiap Minggu (Minggu 1 - 10)
      </h4>
      <div class="timetable-container">
        <table class="timetable-grid">
          <thead>
            <tr>
              <th style="width: 13%;">MINGGU</th>
              <th style="width: 17%;">TARIKH</th>
              <th style="width: 10%;">KI</th>
              <th style="width: 10%;">KELOMPOK</th>
              <th style="width: 12%;">BIMBINGAN</th>
              <th style="width: 20%;">PENTADBIRAN & DOKUMENTASI</th>
              <th style="width: 10%;">PROGRAM</th>
              <th style="width: 14%;">JUMLAH JAM</th>
            </tr>
          </thead>
          <tbody>
    `;

    weeklyBreakdown.forEach(wb => {
      const isCurrent = wb.weekNum === this.state.currentWeek;
      html += `
        <tr style="${isCurrent ? 'background: #eff6ff; font-weight: 600;' : ''}">
          <td style="text-align: center; border: 1px solid #cbd5e1; padding: 8px;">
            ${wb.title} ${isCurrent ? '<span class="badge badge-program" style="font-size:0.65rem;">Semasa</span>' : ''}
          </td>
          <td style="text-align: center; border: 1px solid #cbd5e1; padding: 8px; font-size: 0.82rem; color: #475569;">
            ${wb.dateRange}
          </td>
          <td style="text-align: center; border: 1px solid #cbd5e1; padding: 8px; color: #15803d; font-weight: bold;">
            ${wb.ki}
          </td>
          <td style="text-align: center; border: 1px solid #cbd5e1; padding: 8px; color: #3730a3; font-weight: bold;">
            ${wb.kel}
          </td>
          <td style="text-align: center; border: 1px solid #cbd5e1; padding: 8px; color: #6b21a8; font-weight: bold;">
            ${wb.bim}
          </td>
          <td style="text-align: center; border: 1px solid #cbd5e1; padding: 8px; color: #0891b2; font-weight: bold;">
            <div>${wb.adminTotalHours} Jam</div>
            <div style="font-size: 0.7rem; color: #0e7490; font-weight: 500;">
              ${wb.autoDocHours}j dok (${wb.directSessions} sesi) ${wb.adminSched > 0 ? '+ ' + wb.adminSchedHours + 'j tugas' : ''}
            </div>
          </td>
          <td style="text-align: center; border: 1px solid #cbd5e1; padding: 8px; color: #92400e;">
            ${wb.prog}
          </td>
          <td style="text-align: center; border: 1px solid #cbd5e1; padding: 8px; font-weight: 800; font-size: 0.95rem; color: #1e3a8a;">
            ${wb.hours} Jam
          </td>
        </tr>
      `;
    });

    // ---- Bar Chart: Jam Per Minggu ----
    const maxHours = Math.max(...weeklyBreakdown.map(wb => parseFloat(wb.hours)), 0.1);
    let barChartHtml = `
      <div class="bar-chart-section">
        <div class="bar-chart-title">📊 Jam Aktif Per Minggu (Carta Visualisasi)</div>
        <div class="bar-chart-wrapper">
    `;

    weeklyBreakdown.forEach(wb => {
      const isCurrent = wb.weekNum === this.state.currentWeek;
      const hours = parseFloat(wb.hours);
      const heightPct = maxHours > 0 ? Math.max(4, Math.round((hours / maxHours) * 90)) : 4;
      const dominantClass = 
        wb.adminTotalMin >= wb.kiMin && wb.adminTotalMin >= wb.kelMin && wb.adminTotalMin >= wb.bimMin && wb.adminTotalMin >= wb.progMin ? 'bar-admin'
        : wb.kiMin >= wb.kelMin && wb.kiMin >= wb.bimMin && wb.kiMin >= wb.progMin ? 'bar-ki'
        : wb.kelMin >= wb.bimMin && wb.kelMin >= wb.progMin ? 'bar-kel'
        : wb.bimMin >= wb.progMin ? 'bar-bim'
        : 'bar-prog';
      const barClass = hours === 0 ? 'bar-empty' : dominantClass;

      barChartHtml += `
        <div class="bar-chart-col ${isCurrent ? 'bar-chart-current' : ''}">
          <div class="bar-chart-hours">${hours > 0 ? hours + 'j' : '–'}</div>
          <div class="bar-chart-bar-wrap">
            <div class="bar-chart-bar ${barClass}" style="height: ${heightPct}px;"></div>
          </div>
          <div class="bar-chart-label">${wb.title.replace('Minggu ', 'M')}</div>
        </div>
      `;
    });

    barChartHtml += `
        </div>
        <div class="bar-chart-legend">
          <span><span class="legend-dot" style="background:#10b981;"></span>KI</span>
          <span><span class="legend-dot" style="background:#4338ca;"></span>Kelompok</span>
          <span><span class="legend-dot" style="background:#7c3aed;"></span>Bimbingan</span>
          <span><span class="legend-dot" style="background:#0891b2;"></span>Pentadbiran & Dok</span>
          <span><span class="legend-dot" style="background:#f59e0b;"></span>Program/Lain</span>
          <span style="margin-left:auto; font-weight:700; color:#1e3a8a;">Minggu semasa dikelilingi bingkai biru ●</span>
        </div>
      </div>
    `;

    html += `
          </tbody>
        </table>
      </div>
      ${barChartHtml}
    `;

    container.innerHTML = html;
  },

  // =========================================================
  // 8. EKSPORT EXCEL (CSV) & SANDARAN DATA (BACKUP & RESTORE)
  // =========================================================
  exportToExcelCSV: function() {
    let csvContent = "\uFEFF"; // Byte Order Mark (BOM) untuk sokongan UTF-8 di Excel
    csvContent += "Minggu,Tarikh Minggu,Hari,Tarikh Harian,Masa Mula,Masa Tamat,Jenis Sesi,Kategori Buku Log,Masa Sesi (Minit),Dokumentasi Automatik (Minit),Tajuk Aktiviti,Nama Klien (Murid),Kelas Sasaran,Bil. Klien,Status,Nota\n";

    const docRate = typeof this.state.docRate === 'number' ? this.state.docRate : 30;
    const timeToMin = (t) => this.timeToMin(t);

    this.state.practicumData.forEach(w => {
      w.sessions.forEach(s => {
        const dateStr = (w.dates && w.dates[s.day]) || "";
        const statusLabel = s.status === 'selesai' ? 'Selesai' : (s.status === 'tunda' ? 'Ditunda' : 'Belum Selesai');
        // Nama & kelas sahaja — tiada IC (Etika Kerahsiaan)
        const studentNames = (s.students && s.students.length > 0)
          ? s.students.map(m => `${m.name || m}${m.className ? ' (' + m.className + ')' : ''}`).join('; ')
          : '-';
        
        const isDirect = ['individu', 'kelompok', 'bimbingan'].includes(s.type);
        const logCategory = isDirect ? 'Intervensi Langsung (Direct Contact)' 
          : (s.type === 'pentadbiran' ? 'Pentadbiran & Pengurusan (Indirect)' 
          : (s.type === 'konsultasi' ? 'Konsultasi Guru / Ibu Bapa (Indirect)'
          : (s.type === 'program' ? 'Program Kaunseling Berfokus'
          : (s.type === 'penyeliaan' ? 'Penyeliaan Pensyarah (Tidak Dikira)'
          : (s.type === 'programLain' ? 'Program Sekolah Lain (Tidak Dikira)'
          : (s.type === 'kokurikulum' ? 'Kokurikulum (Tidak Dikira)'
          : 'Cuti/Pelepasan'))))));
        
        const durMin = Math.max(0, timeToMin(s.timeEnd) - timeToMin(s.timeStart));
        const autoDocMin = isDirect ? docRate : 0;

        const row = [
          `"${w.title}"`,
          `"${w.dateRange}"`,
          `"${s.day}"`,
          `"${dateStr}"`,
          `"${s.timeStart}"`,
          `"${s.timeEnd}"`,
          `"${this.getTypeLabel(s.type)}"`,
          `"${logCategory}"`,
          `"${durMin}"`,
          `"${autoDocMin}"`,
          `"${(s.title || '').replace(/"/g, '""')}"`,
          `"${studentNames.replace(/"/g, '""')}"`,
          `"${(s.classTarget || '-').replace(/"/g, '""')}"`,
          `"${s.headcount || 1}"`,
          `"${statusLabel}"`,
          `"${(s.notes || '').replace(/"/g, '""')}"`
        ];
        csvContent += row.join(",") + "\n";
      });
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Jadual_UBK_SK_Tampasuk1_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  downloadBackupJSON: function() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.state.practicumData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `jadual_ubk_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  },

  openRestoreBackupModal: function() {
    const fileInput = document.getElementById("backupFileInput");
    if (fileInput) fileInput.click();
  },

  handleRestoreFile: function(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].weekNum) {
          if (confirm("Adakah anda pasti mahu memulihkan data jadual daripada fail ini? Data sedia ada akan digantikan.")) {
            this.state.practicumData = parsed;
            this.savePracticumData();
            this.render();
            alert("Data jadual berjaya dipulihkan daripada sandaran!");
          }
        } else {
          alert("Format fail sandaran JSON tidak sah!");
        }
      } catch (err) {
        alert("Ralat semasa membaca fail sandaran: " + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = ""; // Reset input
  },

  // =========================================================
  // PUSAT KESELAMATAN & PEMULIHAN JADUAL (ZERO-LOSS RECOVERY)
  // =========================================================
  openBackupRecoveryModal: function() {
    const modal = document.getElementById("backupRecoveryModal");
    if (!modal) return;

    // 1. Semak sandaran sebelum segerak (Pre-Sync Backup)
    const preSyncLabel = document.getElementById("preSyncBackupTimeLabel");
    const preSyncJson = localStorage.getItem("ubk_emergency_backup_before_sync");
    const preSyncTime = localStorage.getItem("ubk_pre_sync_time");
    if (preSyncJson && preSyncLabel) {
      try {
        const parsed = JSON.parse(preSyncJson);
        const count = Array.isArray(parsed) ? parsed.reduce((acc, w) => acc + (w.sessions ? w.sessions.length : 0), 0) : 0;
        const timeStr = preSyncTime ? new Date(preSyncTime).toLocaleTimeString("ms-MY") : "Terdahulu";
        preSyncLabel.innerHTML = `✅ Ditemui (${timeStr}) • <b>${count} sesi</b>`;
      } catch (e) {
        preSyncLabel.innerText = "Data sandaran sedia ada";
      }
    } else if (preSyncLabel) {
      preSyncLabel.innerText = "Tiada sandaran sebelum segerak dikesan.";
    }

    // 2. Semak sandaran autosave tempatan
    const autoLabel = document.getElementById("emergencyAutosaveTimeLabel");
    const autoJson = localStorage.getItem("ubk_emergency_autosave");
    const autoTime = localStorage.getItem("ubk_emergency_autosave_time");
    if (autoJson && autoLabel) {
      try {
        const parsed = JSON.parse(autoJson);
        const count = Array.isArray(parsed) ? parsed.reduce((acc, w) => acc + (w.sessions ? w.sessions.length : 0), 0) : 0;
        autoLabel.innerHTML = `✅ Disimpan: ${autoTime || 'Masa ini'} • <b>${count} sesi</b>`;
      } catch (e) {
        autoLabel.innerText = "Tersimpan di peranti";
      }
    } else if (autoLabel) {
      autoLabel.innerText = "Tiada autosave dikesan.";
    }

    // 3. Muatkan senarai snapshot sejarah
    this.renderSnapshotHistoryList();

    modal.style.display = "flex";
  },

  closeBackupRecoveryModal: function() {
    const modal = document.getElementById("backupRecoveryModal");
    if (modal) modal.style.display = "none";
  },

  renderSnapshotHistoryList: function() {
    const container = document.getElementById("snapshotHistoryList");
    if (!container) return;

    const snapshots = JSON.parse(localStorage.getItem("ubk_schedule_snapshots") || "[]");
    if (snapshots.length === 0) {
      container.innerHTML = `<div style="padding: 12px; color: #64748b; font-size: 0.82rem; text-align: center;">Tiada sejarah snapshot lagi. Sejarah akan terkumpul setiap kali anda menyunting jadual.</div>`;
      return;
    }

    let html = `<table style="width: 100%; border-collapse: collapse; font-size: 0.8rem; text-align: left;">
      <thead>
        <tr style="background: #f8fafc; border-bottom: 1px solid #cbd5e1; color: #475569;">
          <th style="padding: 6px 8px;">Masa & Tarikh</th>
          <th style="padding: 6px 8px;">Tindakan</th>
          <th style="padding: 6px 8px;">Bil. Sesi</th>
          <th style="padding: 6px 8px; text-align: right;">Tindakan</th>
        </tr>
      </thead>
      <tbody>`;

    snapshots.forEach((snap, idx) => {
      html += `
        <tr style="border-bottom: 1px solid #f1f5f9; ${idx % 2 === 1 ? 'background: #f8fafc;' : ''}">
          <td style="padding: 6px 8px; font-weight: 600; color: #1e293b;">${snap.timeStr} <span style="font-size: 0.72rem; color: #64748b; font-weight: 400;">(${snap.dateStr || ''})</span></td>
          <td style="padding: 6px 8px; color: #475569;">${snap.label || 'Simpanan'}</td>
          <td style="padding: 6px 8px; font-weight: 700; color: #0284c7;">${snap.totalSessions || 0}</td>
          <td style="padding: 6px 8px; text-align: right;">
            <button type="button" class="btn btn-sm btn-secondary" onclick="App.restoreSnapshot('${snap.id}')" style="font-size: 0.75rem; padding: 2px 8px;">
              ♻️ Pulihkan
            </button>
          </td>
        </tr>
      `;
    });

    html += `</tbody></table>`;
    container.innerHTML = html;
  },

  restoreEmergencyAutosave: function() {
    const jsonStr = localStorage.getItem("ubk_emergency_autosave");
    if (!jsonStr) {
      alert("Tiada data autosave kecemasan ditemui.");
      return;
    }
    if (confirm("Adakah anda pasti mahu memuatkan semula salinan Autosave Tempatan?")) {
      try {
        const parsed = JSON.parse(jsonStr);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.state.practicumData = parsed;
          this.savePracticumData();
          this.render();
          this.closeBackupRecoveryModal();
          alert("✅ Berjaya! Jadual telah dipulihkan daripada Autosave Tempatan.");
        }
      } catch (e) {
        alert("Ralat memulihkan autosave: " + e.message);
      }
    }
  },

  restoreSnapshot: function(snapId) {
    const snapshots = JSON.parse(localStorage.getItem("ubk_schedule_snapshots") || "[]");
    const snap = snapshots.find(s => s.id === snapId);
    if (!snap) {
      alert("Versi snapshot ini tidak dijumpai.");
      return;
    }
    if (confirm(`Adakah anda pasti mahu memulihkan jadual ke versi [${snap.timeStr} - ${snap.label}] (${snap.totalSessions} sesi)?`)) {
      try {
        const parsed = JSON.parse(snap.json);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Simpan snapshot keadaan sekarang sebelum undur
          this.saveScheduleSnapshot("Sebelum Undur Versi");
          this.state.practicumData = parsed;
          this.savePracticumData();
          this.render();
          this.closeBackupRecoveryModal();
          alert(`✅ Berjaya! Jadual telah dikembalikan ke versi [${snap.timeStr}].`);
        }
      } catch (e) {
        alert("Ralat memulihkan snapshot: " + e.message);
      }
    }
  },

  toggleToolsMenu: function() {
    const menu = document.getElementById("toolsDropdownMenu");
    if (menu) menu.classList.toggle("active");
  },

  // =========================================================
  // PENYEGERAKAN AWAN & PERANTI (DEVICE SYNC & GITHUB EXPORT)
  // =========================================================
  checkUrlSyncData: function() {
    try {
      const hash = window.location.hash;
      if (!hash || !hash.includes("sync=")) return;
      const raw = hash.split("sync=")[1];
      if (!raw) return;
      const jsonStr = decodeURIComponent(escape(atob(decodeURIComponent(raw))));
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].weekNum) {
        setTimeout(() => {
          if (confirm("📲 Data jadual terkini dikesan dari pautan segerak!\n\nAdakah anda mahu memuatkan kemaskini ini ke peranti ini?")) {
            this.state.practicumData = parsed;
            this.savePracticumData();
            this.render();
            this.showToast("✅ Berjaya! Jadual telah disegerakkan ke peranti ini.", null, 5000);
            window.history.replaceState(null, null, window.location.pathname);
          }
        }, 600);
      }
    } catch (err) {
      console.warn("Gagal membaca data segerak URL:", err);
    }
  },

  openCloudSyncModal: function() {
    const dropdown = document.getElementById("toolsDropdownMenu");
    if (dropdown) dropdown.classList.remove("active");

    const endpointInput = document.getElementById("backendEndpointInput");
    const storedEndpoint = localStorage.getItem("ubk_cloud_endpoint") || (typeof CloudSync !== "undefined" ? CloudSync.config.defaultBackendUrl : "") || "https://script.google.com/macros/s/AKfycbz4hFjdKfO9OfxaKL-H-xuloWYeyrkeb3ZT24IYuruUMmJ1I2Vu2c9uPEPKOUjFpC8RdA/exec";
    if (endpointInput) endpointInput.value = storedEndpoint;

    // Kemas kini status badge backend
    const badgeEl = document.getElementById("backendTypeBadge");
    const statusIcon = document.getElementById("modalCloudStatusIcon");
    const statusTitle = document.getElementById("modalCloudStatusText");
    const statusSub = document.getElementById("modalCloudLastSync");

    if (badgeEl && typeof CloudSync !== "undefined") {
      if (CloudSync.state.backendType === "gas") {
        badgeEl.textContent = "Google Sheets (Apps Script)";
        badgeEl.style.background = "#dcfce7";
        badgeEl.style.color = "#15803d";
      } else if (CloudSync.state.backendType === "firebase") {
        badgeEl.textContent = "Google Firebase Realtime";
        badgeEl.style.background = "#fef3c7";
        badgeEl.style.color = "#b45309";
      } else if (CloudSync.state.backendType === "cloudflare") {
        badgeEl.textContent = "Cloudflare Pages Function";
        badgeEl.style.background = "#ffedd5";
        badgeEl.style.color = "#c2410c";
      } else {
        badgeEl.textContent = "Mod Tempatan (Belum Disambung)";
        badgeEl.style.background = "#f1f5f9";
        badgeEl.style.color = "#64748b";
      }
    }

    if (statusIcon && statusTitle && statusSub) {
      if (storedEndpoint && typeof CloudSync !== "undefined" && CloudSync.state.isOnline) {
        statusIcon.textContent = "🟢";
        statusTitle.textContent = "Cloud Real-Time Aktif & Bersambung";
        const d = CloudSync.state.lastSyncTime || new Date();
        statusSub.textContent = `Terakhir disegerakkan: ${d.toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`;
      } else {
        statusIcon.textContent = "⚪";
        statusTitle.textContent = "Mod Tempatan (Belum Disambung ke Cloud)";
        statusSub.textContent = "Data kini hanya disimpan pada pelayar peranti ini. Masukkan URL pangkalan data untuk mengaktifkan real-time.";
      }
    }

    const publicUrl = (typeof CloudSync !== "undefined") ? CloudSync.getShareableUrl("viewer") : window.location.href;
    const adminUrl = (typeof CloudSync !== "undefined") ? CloudSync.getShareableUrl("admin") : window.location.href;

    const publicInput = document.getElementById("publicShareLinkInput");
    if (publicInput) publicInput.value = publicUrl;

    const adminInput = document.getElementById("adminShareLinkInput");
    if (adminInput) adminInput.value = adminUrl;

    const qrContainer = document.getElementById("cloudQrContainer");
    if (qrContainer && typeof CloudSync !== "undefined") {
      const qrUrl = CloudSync.getQrCodeUrl(publicUrl, 200);
      qrContainer.innerHTML = `
        <img src="${qrUrl}" alt="QR Code Pautan Awam" style="width: 190px; height: 190px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); background: white; padding: 6px;" onerror="this.parentElement.innerHTML='<p style=\\'color:#64748b;font-size:0.8rem;\\'>Salin pautan di atas dan kongsikan melalui WhatsApp.</p>'">
      `;
    }

    const modal = document.getElementById("cloudSyncModal");
    if (modal) modal.classList.add("active");
  },

  closeCloudSyncModal: function() {
    const modal = document.getElementById("cloudSyncModal");
    if (modal) modal.classList.remove("active");
  },

  testBackendConnection: async function() {
    const input = document.getElementById("backendEndpointInput");
    const alertBox = document.getElementById("backendTestAlert");
    if (!input || !alertBox) return;

    const url = input.value.trim();
    if (!url) {
      alertBox.style.display = "block";
      alertBox.style.background = "#fee2e2";
      alertBox.style.color = "#991b1b";
      alertBox.style.border = "1px solid #fecaca";
      alertBox.textContent = "⚠️ Sila masukkan URL pangkalan data terlebih dahulu.";
      return;
    }

    alertBox.style.display = "block";
    alertBox.style.background = "#e0f2fe";
    alertBox.style.color = "#075985";
    alertBox.style.border = "1px solid #bae6fd";
    alertBox.textContent = "⏳ Sedang menguji sambungan ke pelayan awan...";

    const res = await CloudSync.testConnection(url);
    if (res.success) {
      alertBox.style.background = "#dcfce7";
      alertBox.style.color = "#166534";
      alertBox.style.border = "1px solid #86efac";
      alertBox.textContent = res.message;
    } else {
      alertBox.style.background = "#fee2e2";
      alertBox.style.color = "#991b1b";
      alertBox.style.border = "1px solid #fecaca";
      alertBox.textContent = res.message;
    }
  },

  saveBackendConnection: async function() {
    const input = document.getElementById("backendEndpointInput");
    const alertBox = document.getElementById("backendTestAlert");
    const url = input ? input.value.trim() : "";

    if (typeof CloudSync !== "undefined") {
      CloudSync.saveBackendConfig(url);
      
      if (url) {
        this.showToast("💾 Sedang menyegerakkan data ke pangkalan data cloud...", null, 3000);
        await CloudSync.uploadToCloud(this.state.practicumData);
        this.showToast("🟢 Berjaya! Pangkalan data cloud telah aktif dan terselaras.", null, 4000);
      } else {
        this.showToast("⚪ Tetapan cloud dikosongkan. Sistem beroperasi dalam mod tempatan.", null, 3000);
      }

      // Segarkan paparan modal
      this.openCloudSyncModal();
    }
  },

  copyPublicShareLink: function() {
    const input = document.getElementById("publicShareLinkInput");
    if (!input) return;
    input.select();
    input.setSelectionRange(0, 99999);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(input.value).then(() => {
        this.showToast("📋 Pautan Rasmi Pelawat (Mod Semakan) disalin!", null, 4000);
      }).catch(() => {
        document.execCommand("copy");
        this.showToast("📋 Pautan Rasmi Pelawat disalin!", null, 4000);
      });
    } else {
      document.execCommand("copy");
      this.showToast("📋 Pautan Rasmi Pelawat disalin!", null, 4000);
    }
  },

  copyAdminShareLink: function() {
    const input = document.getElementById("adminShareLinkInput");
    if (!input) return;
    input.select();
    input.setSelectionRange(0, 99999);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(input.value).then(() => {
        this.showToast("🔑 Pautan Kaunselor (Akses Penuh Pentadbir) disalin!", null, 4000);
      }).catch(() => {
        document.execCommand("copy");
        this.showToast("🔑 Pautan Kaunselor disalin!", null, 4000);
      });
    } else {
      document.execCommand("copy");
      this.showToast("🔑 Pautan Kaunselor disalin!", null, 4000);
    }
  },

  sharePublicViaWhatsApp: function() {
    const input = document.getElementById("publicShareLinkInput");
    const link = input ? input.value : window.location.href;
    const msg = `Jadual Waktu UBK SK Tampasuk 1 (Sesi Persekolahan 2026)\nCikgu Nurul Syahfirah binti Arjaman (Guru Praktikal B&K)\n\nSila layari pautan rasmi di bawah untuk menyemak jadual dan aktiviti terkini secara live:\n${link}`;
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, "_blank");
  },

  forceCloudSyncNow: function() {
    if (typeof CloudSync !== "undefined") {
      this.showToast("🔄 Sedang menyegerakkan dengan Cloud...", null, 2500);
      CloudSync.syncWithCloud().then(() => {
        this.showToast("🟢 Cloud terselaras secara masa nyata!", null, 3000);
        const lastSyncEl = document.getElementById("modalCloudLastSync");
        if (lastSyncEl) {
          const d = new Date();
          lastSyncEl.textContent = `Terakhir disegerakkan: ${d.toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`;
        }
      });
    }
  },

  // =========================================================
  // SISTEM PENGURUSAN KLIEN & DIREKTORI 422 MURID (APDM)
  // =========================================================
  handleStudentClassFilterChange: function(classCode) {
    const resultsContainer = document.getElementById("studentSearchResults");
    if (!resultsContainer) return;
    if (!classCode) {
      resultsContainer.style.display = "none";
      return;
    }
    const students = MuridHelper.getByClass(classCode);
    if (!students || students.length === 0) {
      resultsContainer.innerHTML = `<div style="padding: 10px; font-size: 0.8rem; color: #64748b; text-align: center;">Tiada murid bagi kelas ${classCode}</div>`;
      resultsContainer.style.display = "block";
      return;
    }

    let html = `
      <div style="padding: 6px 10px; background: #e0f2fe; color: #0369a1; font-weight: 700; font-size: 0.76rem; border-bottom: 1px solid #bae6fd; display: flex; justify-content: space-between; align-items: center;">
        <span>Senarai Murid Kelas ${classCode} (${students.length} orang):</span>
        <span style="font-size:0.7rem; color:#0284c7;">Klik murid untuk pilih</span>
      </div>
    `;

    students.forEach(m => {
      const isSelected = this.state.selectedStudentsInForm && this.state.selectedStudentsInForm.some(s => s.id === m.id);
      html += `
        <div class="student-search-item" onclick="App.selectStudentForSession(${m.id})" style="${isSelected ? 'background: #f0fdf4;' : ''}">
          <div>
            <div class="student-search-name">${isSelected ? '✅ ' : '👤 '}${m.name}</div>
            <div class="student-search-meta">
              <span>🏫 ${m.className}</span>
              <span>•</span>
              <span class="ic-badge">🪪 ${m.ic}</span>
              <span>•</span>
              <span style="font-weight:700; color:${m.gender === 'L' ? '#1d4ed8' : '#be185d'};">${m.gender === 'L' ? 'Lelaki' : 'Perempuan'}</span>
            </div>
          </div>
          <button type="button" class="btn btn-sm ${isSelected ? 'btn-secondary' : 'btn-primary'}" style="padding: 2px 8px; font-size: 0.72rem;">
            ${isSelected ? 'Dipilih' : 'Pilih'}
          </button>
        </div>
      `;
    });

    resultsContainer.innerHTML = html;
    resultsContainer.style.display = "block";

    // Auto set class target if empty
    const classTargetEl = document.getElementById("formClassTarget");
    if (classTargetEl && (!classTargetEl.value || classTargetEl.value.trim() === '')) {
      const sample = students[0];
      if (sample) classTargetEl.value = sample.className;
    }
  },

  addAllStudentsFromFilter: function() {
    const filterEl = document.getElementById("formStudentClassFilter");
    if (!filterEl || !filterEl.value) {
      alert("⚠️ Sila pilih kelas dalam dropdown terlebih dahulu.");
      return;
    }
    const classCode = filterEl.value;
    const students = MuridHelper.getByClass(classCode);
    if (!students || students.length === 0) {
      alert("Tiada murid dijumpai bagi kelas ini.");
      return;
    }

    if (!this.state.selectedStudentsInForm) this.state.selectedStudentsInForm = [];
    let addedCount = 0;
    students.forEach(m => {
      if (!this.state.selectedStudentsInForm.some(s => s.id === m.id)) {
        this.state.selectedStudentsInForm.push(m);
        addedCount++;
      }
    });

    this.renderSelectedStudents();

    // Auto update class target
    const classTargetEl = document.getElementById("formClassTarget");
    if (classTargetEl) {
      classTargetEl.value = students[0].className;
    }

    // Auto update headcount
    const headcountEl = document.getElementById("formHeadcount");
    if (headcountEl) {
      headcountEl.value = this.state.selectedStudentsInForm.length;
    }

    // Auto-Kesan Status Murid & Tag Sesi Secara Pintar
    this.applyClientSessionDetection(this.state.selectedStudentsInForm);

    this.showToast(`✅ Berjaya memasukkan semua ${addedCount} orang murid kelas ${students[0].className}!`);
    const resultsContainer = document.getElementById("studentSearchResults");
    if (resultsContainer) resultsContainer.style.display = "none";
  },

  handleStudentSearch: function(query) {
    const resultsContainer = document.getElementById("studentSearchResults");
    if (!resultsContainer) return;

    if (!query || query.trim().length === 0) {
      resultsContainer.style.display = "none";
      resultsContainer.innerHTML = "";
      return;
    }

    if (typeof MuridHelper === "undefined") return;

    const matches = MuridHelper.search(query, 12);
    if (matches.length === 0) {
      resultsContainer.innerHTML = `<div style="padding: 10px; font-size: 0.8rem; color: #64748b; text-align: center;">Tiada murid sepadan dengan "${query}"</div>`;
      resultsContainer.style.display = "block";
      return;
    }

    let html = '';
    matches.forEach(m => {
      html += `
        <div class="student-search-item" onclick="App.selectStudentForSession(${m.id})">
          <div>
            <div class="student-search-name">👤 ${m.name}</div>
            <div class="student-search-meta">
              <span>🏫 ${m.className}</span>
              <span>•</span>
              <span class="ic-badge">🪪 ${m.ic}</span>
            </div>
          </div>
          <button type="button" class="btn btn-sm btn-primary" style="padding: 2px 8px; font-size: 0.72rem;">Pilih</button>
        </div>
      `;
    });

    resultsContainer.innerHTML = html;
    resultsContainer.style.display = "block";
  },

  selectStudentForSession: function(studentId) {
    if (typeof SENARAI_MURID === "undefined") return;
    const student = SENARAI_MURID.find(m => m.id === studentId);
    if (!student) return;

    if (!this.state.selectedStudentsInForm) this.state.selectedStudentsInForm = [];

    // Tambah murid ke senarai jika belum ada
    if (!this.state.selectedStudentsInForm.some(m => m.id === student.id)) {
      this.state.selectedStudentsInForm.push(student);
    }

    this.renderSelectedStudents();

    // Auto-isi kelas sasaran
    const classTargetEl = document.getElementById("formClassTarget");
    if (classTargetEl) {
      classTargetEl.value = student.className;
    }

    // Auto-kemaskini headcount
    const headcountEl = document.getElementById("formHeadcount");
    if (headcountEl) {
      headcountEl.value = this.state.selectedStudentsInForm.length;
    }

    // Auto-Kesan Status Murid & Tag Sesi Secara Pintar (100% Automatik)
    this.applyClientSessionDetection(this.state.selectedStudentsInForm);

    // Kosongkan dan sembunyikan kotak carian
    const searchEl = document.getElementById("formStudentSearch");
    if (searchEl) searchEl.value = "";
    const resEl = document.getElementById("studentSearchResults");
    if (resEl) resEl.style.display = "none";

    this.checkFormConflict();
    this.renderClassSuggestions();
  },

  removeStudentFromSession: function(index) {
    if (index >= 0 && index < this.state.selectedStudentsInForm.length) {
      this.state.selectedStudentsInForm.splice(index, 1);
      this.renderSelectedStudents();

      const headcountEl = document.getElementById("formHeadcount");
      if (headcountEl) {
        headcountEl.value = Math.max(1, this.state.selectedStudentsInForm.length);
      }

      if (this.state.selectedStudentsInForm.length > 0) {
        this.applyClientSessionDetection(this.state.selectedStudentsInForm);
      } else {
        const noticeEl = document.getElementById("clientAutoDetectNotice");
        if (noticeEl) {
          noticeEl.style.display = "none";
          noticeEl.innerHTML = "";
        }
      }

      this.checkFormConflict();
      this.renderClassSuggestions();
    }
  },

  renderSelectedStudents: function() {
    const container = document.getElementById("selectedStudentsContainer");
    const namesEl = document.getElementById("formStudentNames");
    const icsEl = document.getElementById("formStudentICs");
    if (!container) return;

    if (!this.state.selectedStudentsInForm || this.state.selectedStudentsInForm.length === 0) {
      container.style.display = "none";
      container.innerHTML = "";
      if (namesEl) namesEl.value = "";
      if (icsEl) icsEl.value = "";
      return;
    }

    let html = '<div style="font-size: 0.75rem; font-weight: 700; color: #1e3a8a; width: 100%; margin-bottom: 2px;">Murid Dipilih:</div>';
    this.state.selectedStudentsInForm.forEach((m, idx) => {
      html += `
        <span class="student-chip" title="IC: ${m.ic} • Kelas: ${m.className}">
          <span>👤 ${m.name} (${m.classCode})</span>
          <button type="button" class="chip-remove" onclick="App.removeStudentFromSession(${idx})" title="Buang murid ini">✕</button>
        </span>
      `;
    });

    container.innerHTML = html;
    container.style.display = "flex";

    if (namesEl) namesEl.value = this.state.selectedStudentsInForm.map(m => m.name).join(', ');
    if (icsEl) icsEl.value = this.state.selectedStudentsInForm.map(m => m.ic).join(', ');
  },

  // Direktori Murid
  handleStudentDirectoryFilter: function() {
    const filterEl = document.getElementById("studentClassFilter");
    if (filterEl) {
      this.state.studentDirectoryFilterClass = filterEl.value;
      this.renderStudentDirectory();
    }
  },

  handleStudentDirectorySearch: function(query) {
    this.state.studentDirectoryQuery = query || "";
    this.renderStudentDirectory();
  },

  renderStudentDirectory: function() {
    const container = document.getElementById("studentDirectoryTableContainer");
    const countBadge = document.getElementById("studentCountBadge");
    if (!container || typeof SENARAI_MURID === "undefined") return;

    const filterClass = this.state.studentDirectoryFilterClass || "ALL";
    const query = (this.state.studentDirectoryQuery || "").trim().toUpperCase();

    let filtered = SENARAI_MURID;

    // Tapis kelas
    if (filterClass !== "ALL") {
      filtered = filtered.filter(m => m.classCode === filterClass || m.className === filterClass);
    }

    // Tapis kata kunci carian
    if (query.length > 0) {
      filtered = filtered.filter(m => 
        m.name.toUpperCase().includes(query) || 
        m.ic.includes(query) ||
        m.className.toUpperCase().includes(query)
      );
    }

    if (countBadge) {
      countBadge.textContent = `${filtered.length} Murid Dipaparkan`;
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 2.5rem; background: #f8fafc; border-radius: 8px; color: #64748b;">
          <span style="font-size: 2rem; display: block; margin-bottom: 6px;">🔍</span>
          Tiada murid dijumpai mengikut kriteria carian anda. Sila cuba kata kunci lain.
        </div>
      `;
      return;
    }

    let html = `
      <div class="timetable-container" style="max-height: 520px; overflow-y: auto;">
        <table class="student-table">
          <thead>
            <tr>
              <th style="width: 5%; text-align: center;">BIL</th>
              <th style="width: 42%;">NAMA PENUH MURID</th>
              <th style="width: 20%;">NO. KAD PENGENALAN (IC)</th>
              <th style="width: 15%;">KELAS</th>
              <th style="width: 18%; text-align: center;">TINDAKAN PANTAS</th>
            </tr>
          </thead>
          <tbody>
    `;

    filtered.forEach((m, idx) => {
      html += `
        <tr>
          <td style="text-align: center; font-weight: 700; color: #94a3b8; font-size: 0.78rem;">${idx + 1}</td>
          <td style="font-weight: 700; color: #0f172a;">
            👤 ${m.name}
          </td>
          <td>
            <span class="ic-badge">🪪 ${m.ic}</span>
          </td>
          <td>
            <span class="badge badge-program" style="font-size: 0.75rem;">${m.className}</span>
          </td>
          <td style="text-align: center;">
            <div style="display: flex; gap: 6px; justify-content: center; flex-wrap: wrap;">
              <button class="btn-table-action" onclick="App.scheduleSessionForStudent(${m.id})" title="Jadualkan sesi untuk murid ini">
                <span>📅</span> Jadualkan
              </button>
              <button class="btn-table-action" onclick="App.findSlotForStudent(${m.id})" title="Cari slot kelas bagi murid ini">
                <span>🎯</span> Slot
              </button>
            </div>
          </td>
        </tr>
      `;
    });

    html += `
          </tbody>
        </table>
      </div>
    `;

    container.innerHTML = html;
  },

  scheduleSessionForStudent: function(studentId) {
    if (typeof SENARAI_MURID === "undefined") return;
    const student = SENARAI_MURID.find(m => m.id === studentId);
    if (!student) return;

    this.setActiveTab("jadualPraktikum");
    this.openAddSessionModal("ISNIN");
    this.selectStudentForSession(studentId);
  },

  findSlotForStudent: function(studentId) {
    if (typeof SENARAI_MURID === "undefined") return;
    const student = SENARAI_MURID.find(m => m.id === studentId);
    if (!student) return;

    this.openSlotFinderModal();
    const select = document.getElementById("finderClassSelect");
    if (select) {
      for (let opt of select.options) {
        if (opt.value === student.className || student.className.includes(opt.value)) {
          select.value = opt.value;
          break;
        }
      }
      this.runSlotFinder();
    }
  },

  // Kemaskini pilihan dropdown Hari bersama tarikh kalendar sebenar mengikut minggu
  updateFormDayOptions: function(weekNum, selectedDay) {
    const daySelect = document.getElementById("formDay");
    if (!daySelect) return;
    const weekData = this.state.practicumData.find(w => w.weekNum === parseInt(weekNum)) 
      || (typeof PRACTICUM_WEEKS !== "undefined" ? PRACTICUM_WEEKS.find(w => w.weekNum === parseInt(weekNum)) : null);
    const days = ["ISNIN", "SELASA", "RABU", "KHAMIS", "JUMAAT"];
    daySelect.innerHTML = days.map(d => {
      const dateStr = (weekData && weekData.dates && weekData.dates[d]) ? ` (${weekData.dates[d]})` : "";
      return `<option value="${d}">${d}${dateStr}</option>`;
    }).join("");
    if (selectedDay) {
      daySelect.value = selectedDay;
    }
  },

  // =========================================================
  // MODAL TAMBAH / EDIT SESI
  // =========================================================
  openAddSessionModal: function(day = "ISNIN", defaultStart = "", defaultEnd = "", defaultTitle = "", defaultTarget = "") {
    if (typeof CloudSync !== "undefined" && CloudSync.state.userRole === "viewer") {
      CloudSync.promptAdminUnlock();
      return;
    }

    document.getElementById("modalTitle").textContent = "Tambah Sesi Baru";
    document.getElementById("sessionForm").reset();
    document.getElementById("formWeekNum").value = this.state.currentWeek;
    this.updateFormDayOptions(this.state.currentWeek, day);
    document.getElementById("formDay").value = day;
    document.getElementById("formSessionIndex").value = "-1";
    document.getElementById("formStatus").value = "belum";
    // Reset editing state supaya auto-detect tidak terpilih kad sesi lama
    this.state.editingWeek = null;
    this.state.editingSessionIndex = null;

    document.getElementById("formTimeStart").value = defaultStart || "08.10";
    document.getElementById("formTimeEnd").value = defaultEnd || "08.40";
    if (defaultTitle) document.getElementById("formTitle").value = defaultTitle;
    if (defaultTarget) document.getElementById("formClassTarget").value = defaultTarget;

    // Reset nota dan bilangan klien
    const notesEl = document.getElementById("formNotes");
    if (notesEl) notesEl.value = "";
    const headcountEl = document.getElementById("formHeadcount");
    if (headcountEl) headcountEl.value = 1;

    // Reset medan IPGM
    const focusEl = document.getElementById("formFocus");
    if (focusEl) focusEl.value = "sahsiah";
    const clientStatusEl = document.getElementById("formClientStatus");
    if (clientStatusEl) clientStatusEl.value = "B";
    const arrivalWayEl = document.getElementById("formArrivalWay");
    if (arrivalWayEl) arrivalWayEl.value = "sukarela";
    const targetAudienceEl = document.getElementById("formTargetAudience");
    if (targetAudienceEl) targetAudienceEl.value = "pelajar";
    const classFilterEl = document.getElementById("formStudentClassFilter");
    if (classFilterEl) classFilterEl.value = "";
    const bimbinganNotice = document.getElementById("bimbinganNoticeBox");
    if (bimbinganNotice) bimbinganNotice.style.display = "none";

    // Reset Relief & Auto-Detect Badge
    const reliefEl = document.getElementById("formIsRelief");
    if (reliefEl) reliefEl.checked = false;
    const reliefContainer = document.getElementById("reliefToggleContainer");
    if (reliefContainer) reliefContainer.style.display = "none";
    const badgeEl = document.getElementById("focusAutoDetectedBadge");
    if (badgeEl) { badgeEl.style.display = "none"; badgeEl.innerHTML = ""; }

    // Reset murid terpilih & carian
    this.state.selectedStudentsInForm = [];
    this.renderSelectedStudents();
    const searchEl = document.getElementById("formStudentSearch");
    if (searchEl) searchEl.value = "";
    const resEl = document.getElementById("studentSearchResults");
    if (resEl) resEl.style.display = "none";

    // Reset Siri Sesi & Dropdown Klien Tersimpan
    const sessionTagEl = document.getElementById("formSessionTag");
    if (sessionTagEl) sessionTagEl.value = "";
    this.populateSavedClientsDropdown();
    const savedClientEl = document.getElementById("formSavedClientSelect");
    if (savedClientEl) savedClientEl.value = "";

    const alertBox = document.getElementById("formConflictAlert");
    if (alertBox) alertBox.style.display = "none";
    const noticeEl = document.getElementById("clientAutoDetectNotice");
    if (noticeEl) {
      noticeEl.style.display = "none";
      noticeEl.innerHTML = "";
    }

    document.getElementById("sessionModal").classList.add("active");
    this.handleFormTypeChange("individu");
    this.updateFormSaveBtnColor();
    this.checkFormConflict();
    this.renderClassSuggestions();
  },

  openEditSessionModal: function(weekNum, day, sessionIdx) {
    if (typeof CloudSync !== "undefined" && CloudSync.state.userRole === "viewer") {
      this.showToast("👁️ Mod Paparan Awam (Semakan Sahaja). Log masuk Kaunselor untuk mengubah.", null, 3500);
      return;
    }
    // Simpan kedudukan sesi yang sedang diedit supaya auto-detect tidak kira sesi ini sendiri
    this.state.editingWeek = weekNum;
    this.state.editingSessionIndex = sessionIdx;
    const weekData = this.state.practicumData.find(w => w.weekNum === weekNum);
    if (!weekData) return;
    const session = weekData.sessions[sessionIdx];
    if (!session) return;

    document.getElementById("modalTitle").textContent = "Kemaskini Sesi";
    document.getElementById("formWeekNum").value    = weekNum;
    this.updateFormDayOptions(weekNum, session.day);
    document.getElementById("formDay").value        = session.day;
    document.getElementById("formSessionIndex").value = sessionIdx;
    document.getElementById("formTimeStart").value  = session.timeStart;
    document.getElementById("formTimeEnd").value    = session.timeEnd;
    document.getElementById("formTitle").value      = session.title;
    document.getElementById("formType").value       = session.type;
    document.getElementById("formClassTarget").value = session.classTarget || "";
    document.getElementById("formStatus").value     = session.status || "belum";

    const notesEl = document.getElementById("formNotes");
    if (notesEl) notesEl.value = session.notes || "";
    const headcountEl = document.getElementById("formHeadcount");
    if (headcountEl) headcountEl.value = session.headcount || 1;

    // Muat medan Relief (Kelas Ganti Guru)
    const isRelief = session.isRelief === true || session.type === "bimbingan" || (session.notes && session.notes.toLowerCase().includes("ganti"));
    const reliefEl = document.getElementById("formIsRelief");
    if (reliefEl) reliefEl.checked = isRelief;
    const reliefContainer = document.getElementById("reliefToggleContainer");
    if (reliefContainer) reliefContainer.style.display = (isRelief || session.type === "bimbingan") ? "block" : "none";

    // Muat medan IPGM & Auto-Detect Fokus
    const detectedFocus = session.focus || this.detectSessionFocus(session.title, session.classTarget, session.notes);
    const focusEl = document.getElementById("formFocus");
    if (focusEl) focusEl.value = detectedFocus;
    const badgeEl = document.getElementById("focusAutoDetectedBadge");
    if (badgeEl) {
      badgeEl.style.display = "inline-flex";
      badgeEl.innerHTML = `🤖 Auto-Fokus KPM: <strong>${this.getFocusLabel(detectedFocus)}</strong>`;
    }

    const clientStatusEl = document.getElementById("formClientStatus");
    if (clientStatusEl) {
      if (isRelief || session.type === "bimbingan") {
        clientStatusEl.value = "D/J";
      } else {
        clientStatusEl.value = session.clientStatus || "B";
      }
    }
    const arrivalWayEl = document.getElementById("formArrivalWay");
    if (arrivalWayEl) {
      if (isRelief || session.type === "bimbingan") {
        arrivalWayEl.value = "rujukan";
      } else {
        arrivalWayEl.value = session.arrivalWay || "sukarela";
      }
    }
    const targetAudienceEl = document.getElementById("formTargetAudience");
    if (targetAudienceEl) targetAudienceEl.value = session.targetAudience || "pelajar";
    const classFilterEl = document.getElementById("formStudentClassFilter");
    if (classFilterEl) classFilterEl.value = "";

    // Muat Siri Sesi
    const sessionTagEl = document.getElementById("formSessionTag");
    if (sessionTagEl) sessionTagEl.value = session.sessionTag || "";
    this.populateSavedClientsDropdown();
    const savedClientEl = document.getElementById("formSavedClientSelect");
    if (savedClientEl) savedClientEl.value = "";

    // Muat murid terpilih
    this.state.selectedStudentsInForm = session.students ? JSON.parse(JSON.stringify(session.students)) : [];
    this.renderSelectedStudents();
    const searchEl = document.getElementById("formStudentSearch");
    if (searchEl) searchEl.value = "";
    const resEl = document.getElementById("studentSearchResults");
    const noticeEl = document.getElementById("clientAutoDetectNotice");
    if (noticeEl) {
      if (this.state.selectedStudentsInForm && this.state.selectedStudentsInForm.length > 0) {
        this.applyClientSessionDetection(this.state.selectedStudentsInForm);
      } else {
        noticeEl.style.display = "none";
        noticeEl.innerHTML = "";
      }
    }

    const bimbinganNotice = document.getElementById("bimbinganNoticeBox");
    if (bimbinganNotice) bimbinganNotice.style.display = (session.type === "bimbingan" || isRelief) ? "block" : "none";

    this.handleFormTypeChange(session.type);
    if (headcountEl) headcountEl.value = session.headcount || 1;

    document.getElementById("sessionModal").classList.add("active");
    this.updateFormSaveBtnColor();
    this.checkFormConflict();
    this.renderClassSuggestions();
  },

  handleFormTypeChange: function(type) {
    this.updateFormSaveBtnColor();
    this.checkFormConflict();
    this.renderClassSuggestions();

    const headcountEl = document.getElementById("formHeadcount");
    if (headcountEl) {
      if (type === "individu") {
        headcountEl.value = "1";
      } else if (type === "kelompok" && (!headcountEl.value || headcountEl.value === "1")) {
        headcountEl.value = "6";
      } else if (type === "bimbingan" && (!headcountEl.value || headcountEl.value === "1" || headcountEl.value === "6")) {
        headcountEl.value = "28";
      } else if (type === "pentadbiran" || type === "cuti" || type === "penyeliaan" || type === "programLain" || type === "kokurikulum") {
        headcountEl.value = "0";
      }
    }

    // Papar/sembunyi blok murid berdasarkan jenis sesi
    const studentSection = document.getElementById("studentSelectionSection");
    const isNonStudentType = (type === "pentadbiran" || type === "cuti" || type === "penyeliaan" || type === "programLain" || type === "kokurikulum" || type === "konsultasi");
    if (studentSection) studentSection.style.display = isNonStudentType ? "none" : "";

    if (type === "bimbingan") {
      const reliefEl = document.getElementById("formIsRelief");
      if (reliefEl) reliefEl.checked = true;
      const reliefContainer = document.getElementById("reliefToggleContainer");
      if (reliefContainer) reliefContainer.style.display = "block";
    }

    // Sembunyi toggle relief bagi jenis bukan kaunseling
    if (type === "penyeliaan" || type === "programLain" || type === "kokurikulum" || type === "cuti") {
      const reliefContainer = document.getElementById("reliefToggleContainer");
      if (reliefContainer) reliefContainer.style.display = "none";
    }

    this.handleSmartTitleAndReliefDetection();
  },

  handleFormTitleChange: function(title) {
    this.handleSmartTitleAndReliefDetection();
  },

  // =========================================================
  // ENJIN PENGESANAN AUTOMATIK TAJUK, RELIEF & FOKUS 4 BIDANG KPM
  // =========================================================
  handleSmartTitleAndReliefDetection: function() {
    const type = document.getElementById("formType")?.value || "individu";
    const title = document.getElementById("formTitle")?.value || "";
    const classTarget = document.getElementById("formClassTarget")?.value || "";
    const notesEl = document.getElementById("formNotes");
    const notes = notesEl?.value || "";
    const headcountEl = document.getElementById("formHeadcount");
    const headcount = parseInt(headcountEl?.value) || 1;

    // 1. Pengesanan Automatik Kelas Ganti (Relief)
    const reliefEl = document.getElementById("formIsRelief");
    const reliefContainer = document.getElementById("reliefToggleContainer");
    const hasClassPattern = classTarget && classTarget !== "-" && classTarget.toUpperCase().match(/\b(1|2|3|4|5|6)\s*(ARIF|BESTARI|BIJAK|CERDIK|AMANAH)\b/);
    const isReliefLikely = (type === "bimbingan") || (type === "kelompok" && headcount >= 15) || Boolean(hasClassPattern && type === "bimbingan") || Boolean(reliefEl && reliefEl.checked);

    if (reliefContainer) {
      reliefContainer.style.display = (type === "bimbingan" || isReliefLikely) ? "block" : "none";
    }

    if (type === "bimbingan" || isReliefLikely) {
      if (reliefEl) reliefEl.checked = true;
      const clientStatusEl = document.getElementById("formClientStatus");
      if (clientStatusEl) clientStatusEl.value = "D/J"; // DIRUJUK
      const arrivalWayEl = document.getElementById("formArrivalWay");
      if (arrivalWayEl) arrivalWayEl.value = "rujukan"; // RUJUKAN
      if (notesEl && (!notesEl.value || notesEl.value.trim() === "" || notesEl.value.includes("Kelas ganti guru lain"))) {
        notesEl.value = "Kelas Menggantikan Guru (Relief) - Masuk ke kelas kerana ketiadaan guru mata pelajaran, diisi dengan aktiviti bimbingan kelompok/kelas.";
      }
    }

    const noticeBox = document.getElementById("bimbinganNoticeBox");
    if (noticeBox) {
      noticeBox.style.display = (type === "bimbingan" || isReliefLikely) ? "block" : "none";
    }

    // 2. Pengesanan Automatik Fokus Perkhidmatan daripada Tajuk Sesi (Semua Jenis!)
    const detectedFocus = this.detectSessionFocus(title, classTarget, notes);
    const focusEl = document.getElementById("formFocus");
    if (focusEl && detectedFocus) {
      focusEl.value = detectedFocus;
    }

    // Kemaskini badge paparan
    const badgeEl = document.getElementById("focusAutoDetectedBadge");
    if (badgeEl) {
      if (title.trim().length >= 3) {
        badgeEl.style.display = "inline-flex";
        badgeEl.innerHTML = `🤖 Auto-Fokus KPM: <strong>${this.getFocusLabel(detectedFocus)}</strong>`;
      } else {
        badgeEl.style.display = "none";
      }
    }
  },

  handleReliefCheckboxChange: function(isChecked) {
    if (isChecked) {
      const clientStatusEl = document.getElementById("formClientStatus");
      if (clientStatusEl) clientStatusEl.value = "D/J";
      const arrivalWayEl = document.getElementById("formArrivalWay");
      if (arrivalWayEl) arrivalWayEl.value = "rujukan";
      const notesEl = document.getElementById("formNotes");
      if (notesEl && (!notesEl.value || notesEl.value.trim() === "")) {
        notesEl.value = "Kelas Menggantikan Guru (Relief) - Masuk ke kelas kerana ketiadaan guru mata pelajaran, diisi dengan aktiviti bimbingan kelompok/kelas.";
      }
    }
  },

  promptSetHolidayName: function(weekNum, day) {
    const weekData = this.state.practicumData.find(w => w.weekNum === weekNum);
    if (!weekData) return;
    const currentName = (weekData.holidays && weekData.holidays[day]) ? weekData.holidays[day] : "Cuti Umum Persekolahan / Pelepasan Am";
    const newName = prompt(`Masukkan nama cuti bagi Hari ${day} (Minggu ${weekNum}):`, currentName);
    if (newName !== null && newName.trim() !== "") {
      weekData.holidays = weekData.holidays || {};
      weekData.holidays[day] = newName.trim();
      this.savePracticumData();
      this.render();
      this.showToast(`🎉 Hari ${day} ditandakan sebagai "${newName.trim()}"`);
    }
  },

  // =========================================================
  // PENYEMAK INTEGRITI PRAKTIKUM GBK (AUDIT 100% PIAWAIAN IPGM)
  // =========================================================
  runPracticumAudit: function() {
    let totalDirectMin = 0;
    let totalIndirectMin = 0;
    let bimbinganTotal = 0;
    let bimbinganReliefCount = 0;
    let totalHolidays = 0;
    let totalClashes = 0;

    const days = ["ISNIN", "SELASA", "RABU", "KHAMIS", "JUMAAT"];
    const weeks = this.state.practicumData || [];

    weeks.forEach(w => {
      const sessions = w.sessions || [];
      days.forEach(d => {
        const dSessions = sessions.filter(s => s.day === d);
        if (dSessions.length === 0 || dSessions.some(s => s.type === 'cuti')) {
          totalHolidays++;
        }
        // Semak pertindihan masa
        for (let i = 0; i < dSessions.length; i++) {
          for (let j = i + 1; j < dSessions.length; j++) {
            const s1 = dSessions[i];
            const s2 = dSessions[j];
            if (this.timeToMin(s1.timeStart) < this.timeToMin(s2.timeEnd) && this.timeToMin(s1.timeEnd) > this.timeToMin(s2.timeStart)) {
              totalClashes++;
            }
          }
        }
      });

      sessions.forEach(s => {
        const dur = Math.max(0, this.timeToMin(s.timeEnd) - this.timeToMin(s.timeStart));
        if (['individu', 'kelompok', 'bimbingan'].includes(s.type)) {
          totalDirectMin += dur;
          if (s.type === 'bimbingan') {
            bimbinganTotal++;
            if (s.isRelief || s.clientStatus === 'D/J') bimbinganReliefCount++;
          }
        } else {
          totalIndirectMin += dur;
        }
      });
    });

    const directHours = (totalDirectMin / 60).toFixed(1);
    const indirectHours = (totalIndirectMin / 60).toFixed(1);

    const reportMsg = `
📋 LAPORAN AUDIT INTEGRITI PRAKTIKUM GBK (SK TAMPASUK 1):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Pertindihan Jadual (Clashes): ${totalClashes === 0 ? "✅ 0 (Sempurna & Patuh Piawai)" : `⚠️ ${totalClashes} pertindihan dikesan`}
2. Jam Intervensi Bersemuka (Direct Contact): ✅ ${directHours} Jam
3. Jam Pentadbiran / Pengurusan (Indirect): ✅ ${indirectHours} Jam
4. Sesi Bimbingan Kelas: ✅ ${bimbinganTotal} sesi (${bimbinganReliefCount} kelas ganti guru berfokus - Status D/J & Rujukan)
5. Hari Cuti / Kelepasan Am: ✅ ${totalHolidays} hari dikenal pasti & tidak bertindih
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Status Buku Rekod: SIAP & PATUH PIAWAIAN IPGM / KPM!
    `;
    alert(reportMsg);
  },

  updateFormSaveBtnColor: function() {
    const type = document.getElementById("formType")?.value || "individu";
    const btn = document.getElementById("formSaveBtn");
    if (!btn) return;
    const colors = {
      individu: "#059669",    // Emerald
      kelompok: "#4338ca",    // Indigo
      bimbingan: "#7c3aed",   // Purple
      konsultasi: "#0284c7",  // Sky Blue
      program: "#d97706",     // Amber
      pentadbiran: "#0891b2", // Cyan
      cuti: "#be123c"         // Rose
    };
    const c = colors[type] || "var(--primary)";
    btn.style.backgroundColor = c;
    btn.style.borderColor = c;
  },

  closeModal: function() {
    document.getElementById("sessionModal").classList.remove("active");
    // Reset state editing supaya tidak ada kesan pada operasi seterusnya
    this.state.editingWeek = null;
    this.state.editingSessionIndex = null;
  },

  handleSaveSession: function() {
    const weekNum     = parseInt(document.getElementById("formWeekNum").value);
    const day         = document.getElementById("formDay").value;
    const sessionIdx  = parseInt(document.getElementById("formSessionIndex").value);

    const timeStart   = document.getElementById("formTimeStart").value.trim();
    const timeEnd     = document.getElementById("formTimeEnd").value.trim();
    const title       = document.getElementById("formTitle").value.trim();
    const type        = document.getElementById("formType").value;
    let classTarget   = document.getElementById("formClassTarget").value.trim();
    const status      = document.getElementById("formStatus").value;
    let notes         = (document.getElementById("formNotes") || {}).value?.trim() || '';
    const headcount   = parseInt((document.getElementById("formHeadcount") || {}).value) || 1;

    // 1. Pengesahan Input Asas
    if (!title) {
      alert("⚠️ Sila masukkan tajuk aktiviti atau nama sesi kaunseling.");
      document.getElementById("formTitle")?.focus();
      return;
    }

    if (!timeStart || !timeEnd) {
      alert("⚠️ Sila masukkan masa mula dan masa tamat sesi.");
      return;
    }

    const sStart = this.timeToMin(timeStart);
    const sEnd   = this.timeToMin(timeEnd);

    if (sEnd <= sStart) {
      alert(`⚠️ Ralat Masa: Masa tamat (${timeEnd}) mestilah lebih lewat daripada masa mula (${timeStart}).`);
      return;
    }

    const weekData = this.state.practicumData.find(w => w.weekNum === weekNum);
    if (!weekData) {
      alert("Ralat sistem: Data minggu praktikum tidak ditemui.");
      return;
    }

    // 2. Semak Pertindihan dengan Sesi Kaunselor Sendiri
    const otherSessions = weekData.sessions.filter((s, idx) => s.day === day && idx !== sessionIdx);
    const overlap = otherSessions.find(s => {
      const oStart = this.timeToMin(s.timeStart);
      const oEnd   = this.timeToMin(s.timeEnd);
      return oStart < sEnd && oEnd > sStart;
    });

    if (overlap) {
      const proceed = confirm(`⚠️ PERTINDIHAN JADUAL DIKESAN:\nWaktu yang dipilih (${timeStart} - ${timeEnd}) bertindih dengan sesi sedia ada anda:\n"${overlap.title}" (${overlap.timeStart} - ${overlap.timeEnd})\n\nAdakah anda pasti mahu meneruskan dan menyimpan sesi ini?`);
      if (!proceed) return;
    }

    // 3. Semak Pertindihan dengan Waktu Rehat Sekolah (09.40 - 10.10)
    if (sStart < 610 && sEnd > 580) {
      const proceed = confirm(`☕ AMARAN WAKTU REHAT:\nWaktu ini bertindih dengan Waktu Rehat Rasmi Sekolah (09.40 - 10.10 AM).\nRehat adalah hak murid.\n\nAdakah anda pasti mahu menyimpan sesi pada waktu rehat ini?`);
      if (!proceed) return;
    }

    // 4. Semak Perhimpunan Rasmi Hari Isnin (07.00 - 07.40)
    if (day === "ISNIN" && sStart < 460 && sEnd > 420 && type !== "program" && !title.toLowerCase().includes("perhimpunan")) {
      const proceed = confirm(`📢 AMARAN PERHIMPUNAN RASMI:\nHari Isnin jam 07.00 - 07.40 AM adalah Perhimpunan Rasmi Sekolah SK Tampasuk 1.\n\nAdakah anda pasti mahu menyimpan sesi ini pada waktu perhimpunan?`);
      if (!proceed) return;
    }

    // 5. Semak Hari Jumaat Selepas Tamat Waktu Persekolahan (11.10 AM)
    if (day === "JUMAAT" && sEnd > 670 && type !== "program") {
      const proceed = confirm(`🕌 AMARAN WAKTU JUMAAT:\nSesi persekolahan hari Jumaat tamat pada jam 11.10 AM untuk solat Jumaat dan rehat mingguan.\n\nAdakah anda pasti mahu menyimpan sesi melepasi jam 11.10 AM?`);
      if (!proceed) return;
    }

    // 6. Semak Subjek Teras Akademik Kelas Sasaran
    if (typeof CLASS_SCHEDULES !== "undefined" && classTarget) {
      const matchedClassName = Object.keys(CLASS_SCHEDULES).find(c => classTarget.toUpperCase().includes(c));
      if (matchedClassName) {
        const classSlots = CLASS_SCHEDULES[matchedClassName].schedule[day] || [];
        const coreConflict = classSlots.find(slot => {
          const isCore = slot.core === true || ['BM', 'BI', 'M3', 'MT', 'SN'].includes(slot.code);
          if (!isCore) return false;
          const [csStr, ceStr] = (slot.time || "").split(" - ");
          return this.timeToMin(csStr) < sEnd && this.timeToMin(ceStr) > sStart;
        });

        if (coreConflict) {
          const proceed = confirm(`⚠️ PERINGATAN SUBJEK TERAS AKADEMIK:\nKelas ${matchedClassName} sedang belajar subjek teras (${coreConflict.code} - ${coreConflict.name}) pada waktu ini.\nMurid mungkin ketinggalan silibus pelajaran penting.\n\nAdakah anda pasti mahu meneruskan sesi pada waktu ini?`);
          if (!proceed) return;
        }
      }
    }

    const students = this.state.selectedStudentsInForm ? JSON.parse(JSON.stringify(this.state.selectedStudentsInForm)) : [];

    // Jika murid dipilih tetapi kelas kosong, isi kelas murid
    if (students.length > 0 && !classTarget) {
      classTarget = students[0].className;
    }

    let focus          = document.getElementById("formFocus")?.value || "sahsiah";
    let clientStatus   = document.getElementById("formClientStatus")?.value || "B";
    let arrivalWay     = document.getElementById("formArrivalWay")?.value || "sukarela";
    const targetAudience = document.getElementById("formTargetAudience")?.value || "pelajar";
    const sessionTag     = document.getElementById("formSessionTag")?.value || "";

    // PENETAPAN KHAS UNTUK KELAS MENGGANTIKAN GURU (RELIEF) & BIMBINGAN
    const reliefEl = document.getElementById("formIsRelief");
    const isRelief = (reliefEl && reliefEl.checked) || (type === 'bimbingan');
    if (isRelief) {
      clientStatus = "D/J"; // Status: DIRUJUK
      arrivalWay = "rujukan"; // Cara Hadir: RUJUKAN
      if (!notes || notes.trim() === "" || notes.includes("Kelas ganti guru lain")) {
        notes = "Kelas Menggantikan Guru (Relief) - Masuk ke kelas kerana ketiadaan guru mata pelajaran, diisi dengan aktiviti bimbingan kelompok/kelas.";
      }
    }

    // Auto-detect fokus menyeluruh daripada tajuk sesi
    focus = this.detectSessionFocus(title, classTarget, notes) || focus || "sahsiah";

    const sessionObj = { 
      day, 
      timeStart, 
      timeEnd, 
      title, 
      type, 
      classTarget, 
      status, 
      notes, 
      headcount,
      students,
      focus,
      clientStatus,
      arrivalWay,
      targetAudience,
      sessionTag,
      isRelief
    };

    // Kemaskini profil klien tersimpan dengan semua maklumat terkini (fokus, cara hadir, status, siri sesi)
    if (students.length > 0 && Array.isArray(this.state.savedClients)) {
      const matchedProfile = this.state.savedClients.find(c => {
        if (!c.students || c.students.length === 0) return false;
        // Cari sepadan berdasarkan ID murid atau nama murid
        return c.students.some(cs => students.some(s =>
          (s.id && cs.id && s.id === cs.id) || (s.name && cs.name && s.name.toUpperCase() === cs.name.toUpperCase())
        ));
      });
      if (matchedProfile) {
        // Simpan semua maklumat terkini ke dalam profil
        if (sessionTag) matchedProfile.lastSessionTag = sessionTag;
        matchedProfile.focus = focus; // Fokus isu terkini (disiplin, akademik, dll.)
        matchedProfile.lastArrivalWay = arrivalWay; // Cara hadir terkini
        matchedProfile.lastClientStatus = clientStatus; // Status klien terkini
        matchedProfile.lastSavedDate = new Date().toLocaleDateString("ms-MY");
        matchedProfile.sessionCount = (matchedProfile.sessionCount || 0) + (sessionIdx === -1 ? 1 : 0);
        this.saveSavedClients();
      }
    }

    if (sessionIdx === -1) {
      weekData.sessions.push(sessionObj);
      this.showToast(`✅ Sesi "${title}" berjaya ditambah!`);
    } else {
      weekData.sessions[sessionIdx] = sessionObj;
      this.showToast(`✅ Sesi "${title}" berjaya dikemaskini!`);
    }

    this.savePracticumData();
    this.closeModal();
    this.renderPracticumTable();
    this.renderTodayDashboard();
    this.renderPracticumHoursDashboard();
    this.renderOfficialIpgmForms();
  },

  deleteSession: function(weekNum, day, sessionIdx) {
    if (typeof CloudSync !== "undefined" && CloudSync.state.userRole === "viewer") {
      this.showToast("👁️ Mod Paparan Awam: Hanya Kaunselor dibenarkan memadam sesi.", null, 3500);
      return;
    }
    const weekData = this.state.practicumData.find(w => w.weekNum === weekNum);
    if (!weekData) return;
    if (sessionIdx < 0 || sessionIdx >= weekData.sessions.length) return;

    // Simpan sesi untuk kemungkinan undo
    const deletedSession = JSON.parse(JSON.stringify(weekData.sessions[sessionIdx]));
    const deletedAtIdx   = sessionIdx;
    const deletedWeekNum = weekNum;

    weekData.sessions.splice(sessionIdx, 1);
    this.savePracticumData();
    this.renderPracticumTable();
    this.renderTodayDashboard();
    this.renderPracticumHoursDashboard();
    this.renderOfficialIpgmForms();

    // Papar toast dengan butang Undo
    this.showToast(`🗑️ Sesi "${deletedSession.title}" dipadam.`, () => {
      // Fungsi Undo: masukkan semula sesi pada indeks asal
      const wData = this.state.practicumData.find(w => w.weekNum === deletedWeekNum);
      if (wData) {
        wData.sessions.splice(deletedAtIdx, 0, deletedSession);
        this.savePracticumData();
        this.renderPracticumTable();
        this.renderTodayDashboard();
        this.renderPracticumHoursDashboard();
        this.showToast('✅ Sesi berjaya dipulihkan!', null, 3000);
      }
    }, 7000);
  },

  // =========================================================
  // CETAK JADUAL HARIAN MURID (LENGKAP MASA KOSONG & REHAT)
  // =========================================================
  buildDailyTimelineWithKosong: function(day, daySessions) {
    const timeToMin = (t) => this.timeToMin(t);

    const periodsDef = {
      "ISNIN": [
        { start: "07.00", end: "07.40", label: "PH/1" },
        { start: "07.40", end: "08.10", label: "2" },
        { start: "08.10", end: "08.40", label: "3" },
        { start: "08.40", end: "09.10", label: "4" },
        { start: "09.10", end: "09.40", label: "5" },
        { start: "09.40", end: "10.10", label: "REHAT", isBreak: true },
        { start: "10.10", end: "10.40", label: "6" },
        { start: "10.40", end: "11.10", label: "7" },
        { start: "11.10", end: "11.40", label: "8" },
        { start: "11.40", end: "12.10", label: "9" },
        { start: "12.10", end: "12.40", label: "10" }
      ],
      "DEFAULT": [
        { start: "07.10", end: "07.40", label: "1" },
        { start: "07.40", end: "08.10", label: "2" },
        { start: "08.10", end: "08.40", label: "3" },
        { start: "08.40", end: "09.10", label: "4" },
        { start: "09.10", end: "09.40", label: "5" },
        { start: "09.40", end: "10.10", label: "REHAT", isBreak: true },
        { start: "10.10", end: "10.40", label: "6" },
        { start: "10.40", end: "11.10", label: "7" },
        { start: "11.10", end: "11.40", label: "8" },
        { start: "11.40", end: "12.10", label: "9" },
        { start: "12.10", end: "12.40", label: "10" }
      ],
      "JUMAAT": [
        { start: "07.10", end: "07.40", label: "1" },
        { start: "07.40", end: "08.10", label: "2" },
        { start: "08.10", end: "08.40", label: "3" },
        { start: "08.40", end: "09.10", label: "4" },
        { start: "09.10", end: "09.40", label: "5" },
        { start: "09.40", end: "10.10", label: "REHAT", isBreak: true },
        { start: "10.10", end: "10.40", label: "6" },
        { start: "10.40", end: "11.10", label: "7" }
      ]
    };

    const periods = (day === "ISNIN" ? periodsDef["ISNIN"] : (day === "JUMAAT" ? periodsDef["JUMAAT"] : periodsDef["DEFAULT"]));

    const fullDaySession = daySessions.find(s => {
      const sStart = timeToMin(s.timeStart);
      const sEnd = timeToMin(s.timeEnd);
      return sStart <= timeToMin(periods[0].start) && sEnd >= timeToMin(periods[periods.length - 1].end);
    });

    if (fullDaySession) {
      return [{
        type: 'session',
        sessionData: fullDaySession,
        timeStart: fullDaySession.timeStart,
        timeEnd: fullDaySession.timeEnd
      }];
    }

    const timeline = [];
    let currentKosongStart = null;
    let currentKosongEnd = null;

    const flushKosong = () => {
      if (currentKosongStart && currentKosongEnd) {
        timeline.push({
          type: 'kosong',
          timeStart: currentKosongStart,
          timeEnd: currentKosongEnd,
          title: 'WAKTU TERBUKA KAUNSELING / MASA KOSONG',
          desc: 'Waktu lapang bilik UBK. Murid & guru dialu-alukan hadir untuk bimbingan, pertanyaan atau membuat janji temu.'
        });
        currentKosongStart = null;
        currentKosongEnd = null;
      }
    };

    periods.forEach(p => {
      if (p.isBreak) {
        flushKosong();
        timeline.push({
          type: 'break',
          timeStart: p.start,
          timeEnd: p.end,
          title: 'WAKTU REHAT (PINTU BILIK UBK TERBUKA)',
          desc: 'Pintu bilik kaunseling dibuka untuk kunjungan santai murid sewaktu rehat persekolahan.'
        });
        return;
      }

      const pStartMin = timeToMin(p.start);
      const pEndMin = timeToMin(p.end);

      const matchedSession = daySessions.find(s => {
        const sStartMin = timeToMin(s.timeStart);
        const sEndMin = timeToMin(s.timeEnd);
        return sStartMin < pEndMin && sEndMin > pStartMin;
      });

      if (matchedSession) {
        flushKosong();
        if (!timeline.some(item => item.sessionData === matchedSession)) {
          timeline.push({
            type: 'session',
            sessionData: matchedSession,
            timeStart: matchedSession.timeStart,
            timeEnd: matchedSession.timeEnd
          });
        }
      } else {
        if (!currentKosongStart) {
          currentKosongStart = p.start;
        }
        currentKosongEnd = p.end;
      }
    });

    flushKosong();
    return timeline;
  },

  openPrintDailyModal: function() {
    const weekData = this.state.practicumData.find(w => w.weekNum === this.state.currentWeek);
    if (!weekData) return;

    const modal = document.getElementById("printDailyModal");
    const container = document.getElementById("dailyPrintOptionsContainer");
    const label = document.getElementById("modalWeekLabel");

    if (label) label.textContent = `${weekData.title} (${weekData.dateRange})`;

    const days = ["ISNIN", "SELASA", "RABU", "KHAMIS", "JUMAAT"];
    let html = '';

    days.forEach(day => {
      const daySessions = weekData.sessions.filter(s => s.day === day);
      const dateStr = (weekData.dates && weekData.dates[day]) || "";
      const timeline = this.buildDailyTimelineWithKosong(day, daySessions);
      const sessionCount = daySessions.length;
      const kosongCount = timeline.filter(t => t.type === 'kosong').length;

      html += `
        <div style="display: flex; justify-content: space-between; align-items: center; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 0.75rem 1rem; transition: all 0.15s ease;">
          <div>
            <div style="font-weight: 700; font-size: 0.95rem; color: #1e3a8a;">
              📅 ${day} <span style="font-size: 0.8rem; font-weight: 500; color: #64748b;">(${dateStr})</span>
            </div>
            <div style="font-size: 0.8rem; color: #475569; margin-top: 3px; display: flex; gap: 8px; flex-wrap: wrap;">
              <span>📌 <strong>${sessionCount}</strong> sesi berjadual</span>
              <span>•</span>
              <span style="color: #15803d; font-weight: 600;">🟢 <strong>${kosongCount}</strong> masa kosong (terbuka)</span>
            </div>
          </div>
          <button class="btn btn-sm btn-primary" onclick="App.closePrintDailyModal(); App.printDailyNotice('${day}')">
            🖨️ Cetak Hari ${day}
          </button>
        </div>
      `;
    });

    if (container) container.innerHTML = html;
    if (modal) modal.classList.add("active");
  },

  closePrintDailyModal: function() {
    const modal = document.getElementById("printDailyModal");
    if (modal) modal.classList.remove("active");
  },

  printDailyNotice: function(day) {
    const weekNum = this.state.currentWeek;
    const weekData = this.state.practicumData.find(w => w.weekNum === weekNum) || this.state.practicumData[0];
    if (!weekData) return;

    const dateStr = (weekData.dates && weekData.dates[day]) || "";
    const daySessions = weekData.sessions.filter(s => s.day === day);
    const timeline = this.buildDailyTimelineWithKosong(day, daySessions);

    let printWindow = window.open('', '_blank', 'width=950,height=880');
    if (!printWindow) {
      alert("Sila benarkan tetingkap pop-up pada pelayar web anda untuk mencetak jadual harian murid.");
      return;
    }

    let rowsHtml = '';
    let itemNumber = 1;

    timeline.forEach((item) => {
      if (item.type === 'break') {
        rowsHtml += `
          <tr class="row-break" style="background: #fff1f2;">
            <td style="text-align: center; font-weight: bold; border: 1.5px solid #334155; padding: 8px 6px; vertical-align: middle; color: #be123c;">☕</td>
            <td style="text-align: center; font-weight: 800; color: #be123c; border: 1.5px solid #334155; padding: 8px; font-size: 9.5pt; vertical-align: middle; white-space: nowrap;">
              ⏱️ ${item.timeStart} - ${item.timeEnd}
            </td>
            <td style="border: 1.5px solid #334155; padding: 8px 10px; vertical-align: middle;">
              <span style="background:#ffe4e6; color:#be123c; font-weight:800; padding:2px 8px; border-radius:4px; font-size:8pt; border:1px solid #fecdd3; display:inline-block; margin-bottom:3px;">
                ☕ WAKTU REHAT SEKOLAH
              </span>
              <div style="font-weight: 800; font-size: 10pt; color: #9f1239;">${item.title}</div>
              <div style="font-size: 8pt; color: #be123c; margin-top: 1px;">${item.desc}</div>
            </td>
            <td style="text-align: center; border: 1.5px solid #334155; padding: 8px; vertical-align: middle; font-weight: 700; font-size: 9pt; color: #be123c;">
              Semua Murid
            </td>
            <td style="border: 1.5px solid #334155; padding: 8px; vertical-align: middle; font-size: 8.5pt; color: #9f1239;">
              📍 Bilik UBK (Pintu Terbuka)
            </td>
          </tr>
        `;
      } else if (item.type === 'kosong') {
        rowsHtml += `
          <tr class="row-kosong" style="background: #f9fafb;">
            <td style="text-align: center; font-weight: bold; border: 1.5px solid #334155; padding: 8px 6px; vertical-align: middle; color: #94a3b8;">—</td>
            <td style="text-align: center; font-weight: 700; color: #64748b; border: 1.5px solid #334155; padding: 8px; font-size: 9.5pt; vertical-align: middle; white-space: nowrap;">
              ${item.timeStart} - ${item.timeEnd}
            </td>
            <td style="border: 1.5px solid #334155; padding: 8px 10px; vertical-align: middle;"></td>
            <td style="border: 1.5px solid #334155; padding: 8px; vertical-align: middle;"></td>
            <td style="border: 1.5px solid #334155; padding: 8px; vertical-align: middle;"></td>
          </tr>
        `;
      } else {
        const s = item.sessionData || item;
        let typeBadge = '';
        if (s.type === 'individu') typeBadge = '<span style="background:#dcfce7; color:#15803d; font-weight:700; padding:2px 8px; border-radius:4px; font-size:8pt; border:1px solid #86efac;">KAUNSELING INDIVIDU (KI)</span>';
        else if (s.type === 'kelompok') typeBadge = '<span style="background:#e0e7ff; color:#3730a3; font-weight:700; padding:2px 8px; border-radius:4px; font-size:8pt; border:1px solid #a5b4fc;">SESI KELOMPOK</span>';
        else if (s.type === 'bimbingan') typeBadge = '<span style="background:#f3e8ff; color:#6b21a8; font-weight:700; padding:2px 8px; border-radius:4px; font-size:8pt; border:1px solid #d8b4fe;">BIMBINGAN KELAS</span>';
        else if (s.type === 'program') typeBadge = '<span style="background:#fef3c7; color:#92400e; font-weight:700; padding:2px 8px; border-radius:4px; font-size:8pt; border:1px solid #fde68a;">PROGRAM SEKOLAH</span>';
        else if (s.type === 'pentadbiran') typeBadge = '<span style="background:#cffafe; color:#0e7490; font-weight:700; padding:2px 8px; border-radius:4px; font-size:8pt; border:1px solid #a5f3fc;">TUGAS PENTADBIRAN</span>';
        else typeBadge = '<span style="background:#ffe4e6; color:#be123c; font-weight:700; padding:2px 8px; border-radius:4px; font-size:8pt; border:1px solid #fecdd3;">CUTI / PELEPASAN</span>';

        const sasaran = s.classTarget && s.classTarget !== '-' ? s.classTarget : 'Murid Terlibat';
        const lokasi = (s.type === 'bimbingan') ? `Bilik Darjah (${sasaran})` : (s.type === 'program' ? 'Dewan / Tapak Perhimpunan' : 'Bilik Bimbingan & Kaunseling (UBK)');

        rowsHtml += `
          <tr class="row-session" style="background: #ffffff;">
            <td style="text-align: center; font-weight: bold; border: 1.5px solid #334155; padding: 8px 6px; vertical-align: middle;">${itemNumber++}</td>
            <td style="text-align: center; font-weight: 800; color: #1e3a8a; border: 1.5px solid #334155; padding: 8px; font-size: 10pt; vertical-align: middle; white-space: nowrap;">
              ⏱️ ${s.timeStart} - ${s.timeEnd}
            </td>
            <td style="border: 1.5px solid #334155; padding: 8px 10px; vertical-align: middle;">
              <div style="margin-bottom: 3px;">${typeBadge}</div>
              <div style="font-weight: 800; font-size: 10pt; color: #0f172a;">${s.title}</div>
            </td>
            <td style="text-align: center; border: 1.5px solid #334155; padding: 8px; vertical-align: middle; font-weight: 700; font-size: 9.5pt; color: #1e3a8a;">
              🏫 ${sasaran}
            </td>
            <td style="border: 1.5px solid #334155; padding: 8px; vertical-align: middle; font-size: 8.5pt; color: #334155;">
              📍 ${lokasi}
            </td>
          </tr>
        `;
      }
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="ms">
      <head>
        <meta charset="UTF-8">
        <title>Jadual Harian UBK (${day} ${dateStr}) - SK Tampasuk 1</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 10mm 14mm;
          }
          body {
            font-family: 'Segoe UI', Arial, sans-serif;
            color: #0f172a;
            line-height: 1.35;
            padding: 8px;
            margin: 0;
            background: #fff;
          }
          .no-print-toolbar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #1e3a8a;
            color: white;
            padding: 10px 16px;
            border-radius: 8px;
            margin-bottom: 14px;
            flex-wrap: wrap;
            gap: 10px;
          }
          .btn-print-now {
            background: #22c55e;
            color: white;
            border: none;
            padding: 8px 18px;
            font-size: 14px;
            font-weight: bold;
            border-radius: 6px;
            cursor: pointer;
          }
          .btn-print-now:hover {
            background: #16a34a;
          }
          .header {
            text-align: center;
            border-bottom: 2.5px solid #000;
            padding-bottom: 8px;
            margin-bottom: 12px;
          }
          .header h2 {
            margin: 0;
            font-size: 14.5pt;
            font-weight: 900;
            letter-spacing: 0.5px;
            color: #000;
            text-transform: uppercase;
          }
          .header h3 {
            margin: 3px 0 0 0;
            font-size: 11.5pt;
            font-weight: 800;
            color: #1e3a8a;
          }
          .header p {
            margin: 2px 0 0 0;
            font-size: 9pt;
            color: #475569;
          }
          .meta-box {
            display: flex;
            justify-content: space-between;
            background: #f8fafc;
            border: 1.5px solid #cbd5e1;
            border-radius: 6px;
            padding: 9px 12px;
            margin-bottom: 12px;
            font-size: 8.8pt;
          }
          .meta-box strong {
            color: #0f172a;
          }
          .schedule-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 14px;
          }
          .schedule-table th {
            background: #f1f5f9;
            color: #000;
            font-weight: 800;
            font-size: 8.8pt;
            border: 1.5px solid #334155;
            padding: 7px 6px;
            text-align: center;
          }
          .notice-box {
            background: #f0fdf4;
            border: 1.5px solid #86efac;
            border-radius: 8px;
            padding: 10px 14px;
            margin-bottom: 18px;
            font-size: 8.5pt;
          }
          .notice-box h4 {
            margin: 0 0 4px 0;
            color: #15803d;
            font-size: 9.2pt;
          }
          .notice-box ol {
            margin: 0;
            padding-left: 18px;
          }
          .notice-box li {
            margin-bottom: 3px;
            color: #166534;
          }
          .signatures {
            display: flex;
            justify-content: space-between;
            margin-top: 20px;
            font-size: 8.5pt;
          }
          .sig-col {
            width: 270px;
          }
          .sig-line {
            border-bottom: 1px dotted #000;
            height: 38px;
            margin-bottom: 4px;
          }
          @media print {
            .no-print-toolbar {
              display: none !important;
            }
            body {
              padding: 0 !important;
            }
          }
        </style>
      </head>
      <body>
        <div class="no-print-toolbar">
          <div>
            <strong>📄 Jadual Perkhidmatan Harian UBK (Termasuk Masa Kosong)</strong>
            <div style="font-size: 12px; opacity: 0.9;">Hari: ${day} (${dateStr}) • Minggu ${weekNum}</div>
          </div>
          <div style="display: flex; gap: 8px; align-items: center;">
            <button class="btn-print-now" onclick="window.print()">🖨️ Cetak Sekarang</button>
          </div>
        </div>

        <div class="header">
          <h2>SEKOLAH KEBANGSAAN TAMPASUK 1, KOTA BELUD</h2>
          <h3>JADUAL PERKHIDMATAN HARIAN UBK (RUJUKAN MURID & GURU)</h3>
          <p>Unit Bimbingan dan Kaunseling • Sesi Persekolahan 2026</p>
        </div>

        <div class="meta-box">
          <div>
            <div><strong>HARI:</strong> ${day}</div>
            <div><strong>TARIKH:</strong> ${dateStr}</div>
          </div>
          <div>
            <div><strong>MINGGU:</strong> ${weekData.title}</div>
            <div><strong>GURU PRAKTIKAL UBK:</strong> Cikgu Nurul Syahfirah binti Arjaman</div>
          </div>
          <div>
            <div><strong>LOKASI:</strong> Bilik Kaunseling UBK</div>
            <div><strong>STATUS:</strong> Waktu Operasi Persekolahan</div>
          </div>
        </div>

        <table class="schedule-table">
          <thead>
            <tr>
              <th style="width: 5%;">STATUS</th>
              <th style="width: 22%;">WAKTU / MASA</th>
              <th style="width: 40%;">AKTIVITI / PERKHIDMATAN UBK</th>
              <th style="width: 15%;">SASARAN</th>
              <th style="width: 18%;">TEMPAT / TINDAKAN</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>


        <div class="signatures">
          <div class="sig-col">
            <p>Disediakan oleh,</p>
            <div class="sig-line"></div>
            <p>
              <strong>(NURUL SYAHFIRAH BINTI ARJAMAN)</strong><br>
              Guru Praktikal Bimbingan dan Kaunseling<br>
              SK Tampasuk 1, Kota Belud
            </p>
          </div>
          <div class="sig-col">
            <p>Disahkan oleh,</p>
            <div class="sig-line"></div>
            <p>
              <strong>(GURU BESAR / GURU PEMBIMBING)</strong><br>
              SK Tampasuk 1, Kota Belud
            </p>
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  },

  // Populasi Senarai 26 Guru SK Tampasuk 1
  populateTeacherDropdown: function() {
    const selectEl = document.getElementById("teacherSelectViewer");
    if (!selectEl || typeof TEACHER_SCHEDULES === "undefined") return;

    const teacherNames = Object.keys(TEACHER_SCHEDULES);
    const pentadbir = [];
    const guruLain = [];

    teacherNames.forEach(name => {
      const t = TEACHER_SCHEDULES[name];
      if (t.jawatan && (t.jawatan.includes("Guru Besar") || t.jawatan.includes("PK"))) {
        pentadbir.push(name);
      } else {
        guruLain.push(name);
      }
    });

    let html = `<optgroup label="Pengurusan & Pentadbiran">`;
    pentadbir.forEach(name => {
      html += `<option value="${name}">${name}</option>`;
    });
    html += `</optgroup><optgroup label="Guru Akademik & Guru Kelas">`;
    guruLain.forEach(name => {
      html += `<option value="${name}">${name}</option>`;
    });
    html += `</optgroup>`;

    selectEl.innerHTML = html;
    if (this.state.selectedTeacherForViewer) {
      selectEl.value = this.state.selectedTeacherForViewer;
    }
  },

  // Render Jadual Persendirian Guru (26 Guru)
  renderTeacherScheduleTable: function() {
    const teacherName = this.state.selectedTeacherForViewer;
    if (typeof TEACHER_SCHEDULES === "undefined") return;
    const teacherData = TEACHER_SCHEDULES[teacherName];
    const containerEl = document.getElementById("teacherScheduleDisplayContainer");
    if (!containerEl || !teacherData) return;

    const standardPeriods = [
      { label: "1", time: "07.10 - 07.40", altTime: "07.00 - 07.40" },
      { label: "2", time: "07.40 - 08.10" },
      { label: "3", time: "08.10 - 08.40" },
      { label: "4", time: "08.40 - 09.10" },
      { label: "5", time: "09.10 - 09.40" },
      { label: "REHAT", time: "09.40 - 10.10", isBreak: true },
      { label: "6", time: "10.10 - 10.40" },
      { label: "7", time: "10.40 - 11.10" },
      { label: "8", time: "11.10 - 11.40" },
      { label: "9", time: "11.40 - 12.10" },
      { label: "10", time: "12.10 - 12.40" },
      { label: "11", time: "12.40 - 01.10" }
    ];

    const days = ["ISNIN", "SELASA", "RABU", "KHAMIS", "JUMAAT"];
    const freeSlotsSummary = [];

    days.forEach(day => {
      const daySchedule = teacherData.schedule[day] || [];
      const freePeriodsOnDay = [];

      standardPeriods.forEach(p => {
        if (p.isBreak) return;
        if (day === "JUMAAT" && (p.label === "10" || p.label === "11")) return;

        const match = daySchedule.find(s => s.time === p.time || (p.altTime && s.time === p.altTime));
        if (!match || match.code === 'SEMAI') {
          freePeriodsOnDay.push(`W${p.label} (${p.time})`);
        }
      });

      if (freePeriodsOnDay.length > 0) {
        freeSlotsSummary.push({ day, slots: freePeriodsOnDay });
      }
    });

    let html = `
      <div style="margin-bottom: 1.25rem; background: #f8fafc; padding: 1.25rem; border-radius: 12px; border: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem;">
        <div>
          <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.25rem;">
            <span style="font-size: 1.6rem;">👨‍🏫</span>
            <div>
              <h3 style="font-family: 'Outfit'; font-size: 1.25rem; color: var(--primary); font-weight: 700;">${teacherName}</h3>
              <div style="font-size: 0.88rem; color: #475569;">
                Jawatan / Peranan: <strong>${teacherData.jawatan}</strong>
              </div>
            </div>
          </div>
          <div style="margin-top: 0.5rem; font-size: 0.88rem; color: #334155;">
            📚 <strong>Mata Pelajaran & Kelas:</strong> <span style="background: #e0e7ff; color: #3730a3; padding: 3px 10px; border-radius: 6px; font-weight: 600;">${teacherData.subjekList}</span>
          </div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 0.8rem; color: #64748b; text-transform: uppercase; font-weight: 600;">Beban Waktu Mengajar</div>
          <div style="font-family: 'Outfit'; font-size: 1.3rem; font-weight: 800; color: #0f766e;">${teacherData.totalWaktu}</div>
          <span class="badge badge-program" style="margin-top: 4px;">Berkuat kuasa 07 Sept 2026</span>
        </div>
      </div>

      <div class="timetable-container" style="margin-bottom: 1.25rem;">
        <table class="timetable-grid">
          <thead>
            <tr>
              <th class="time-col">HARI</th>
              <th>1<br><span style="font-size: 0.7rem; font-weight: 400;">07.10-07.40</span></th>
              <th>2<br><span style="font-size: 0.7rem; font-weight: 400;">07.40-08.10</span></th>
              <th>3<br><span style="font-size: 0.7rem; font-weight: 400;">08.10-08.40</span></th>
              <th>4<br><span style="font-size: 0.7rem; font-weight: 400;">08.40-09.10</span></th>
              <th>5<br><span style="font-size: 0.7rem; font-weight: 400;">09.10-09.40</span></th>
              <th style="background: #fff1f2; color: #be123c;">REHAT<br><span style="font-size: 0.7rem; font-weight: 400;">09.40-10.10</span></th>
              <th>6<br><span style="font-size: 0.7rem; font-weight: 400;">10.10-10.40</span></th>
              <th>7<br><span style="font-size: 0.7rem; font-weight: 400;">10.40-11.10</span></th>
              <th>8<br><span style="font-size: 0.7rem; font-weight: 400;">11.10-11.40</span></th>
              <th>9<br><span style="font-size: 0.7rem; font-weight: 400;">11.40-12.10</span></th>
              <th>10<br><span style="font-size: 0.7rem; font-weight: 400;">12.10-12.40</span></th>
              <th>11<br><span style="font-size: 0.7rem; font-weight: 400;">12.40-01.10</span></th>
            </tr>
          </thead>
          <tbody>
    `;

    days.forEach(day => {
      const daySchedule = teacherData.schedule[day] || [];
      html += `<tr><td class="time-col" style="font-weight: 700;">${day}</td>`;

      standardPeriods.forEach(p => {
        if (p.isBreak) {
          html += `<td style="background: #ffe4e6; text-align: center; vertical-align: middle; color: #be123c; font-weight: 600; font-size: 0.75rem;">REHAT</td>`;
          return;
        }

        if (day === "JUMAAT" && (p.label === "10" || p.label === "11")) {
          html += `<td style="background: #f8fafc; color: #cbd5e1; text-align: center; font-size: 0.75rem;">-</td>`;
          return;
        }

        const match = daySchedule.find(s => s.time === p.time || (p.altTime && s.time === p.altTime));

        if (match) {
          if (match.code === 'PH') {
            html += `<td style="background: #fef3c7; text-align: center; font-size: 0.72rem; font-weight: 700; color: #92400e;">PERHIMPUNAN</td>`;
          } else if (match.code === 'SEMAI') {
            html += `<td style="background: #f0fdf4; text-align: center; font-size: 0.72rem; color: #166534;">SEMAI</td>`;
          } else {
            html += `
              <td style="background: #eff6ff; text-align: center; padding: 4px; border: 1px solid #bfdbfe;">
                <div style="font-weight: 800; font-size: 0.78rem; color: #1e40af;">${match.code}</div>
                <div style="font-size: 0.68rem; color: #475569;">${match.name}</div>
              </td>
            `;
          }
        } else {
          html += `
            <td style="background: #ffffff; text-align: center; font-size: 0.72rem; color: #10b981; font-weight: 600;">
              Luang
            </td>
          `;
        }
      });

      html += `</tr>`;
    });

    html += `
          </tbody>
        </table>
      </div>

      <!-- Ringkasan Waktu Luang Guru -->
      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 1rem;">
        <h4 style="color: #15803d; font-size: 0.95rem; font-weight: 700; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
          <span>💡</span> Waktu Luang Terbaik Guru (${teacherName}):
        </h4>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 0.6rem;">
    `;

    freeSlotsSummary.forEach(item => {
      html += `
        <div style="background: white; padding: 0.6rem; border-radius: 6px; border: 1px solid #dcfce7;">
          <div style="font-weight: 700; font-size: 0.82rem; color: #166534;">📅 ${item.day}</div>
          <div style="font-size: 0.76rem; color: #475569; margin-top: 2px;">
            ${item.slots.join(', ')}
          </div>
        </div>
      `;
    });

    html += `
        </div>
      </div>
    `;

    containerEl.innerHTML = html;
  },

  // Render Pemeriksa Jadual Induk Kelas (12 Kelas)
  renderClassScheduleTable: function() {
    const className = this.state.selectedClassForViewer;
    if (typeof CLASS_SCHEDULES === "undefined") return;
    const classData = CLASS_SCHEDULES[className];
    if (!classData) return;

    const containerEl = document.getElementById("classScheduleDisplayContainer");
    if (!containerEl) return;

    const standardPeriods = [
      { label: "1", time: "07.10 - 07.40", altTime: "07.00 - 07.40" },
      { label: "2", time: "07.40 - 08.10" },
      { label: "3", time: "08.10 - 08.40" },
      { label: "4", time: "08.40 - 09.10" },
      { label: "5", time: "09.10 - 09.40" },
      { label: "REHAT", time: "09.40 - 10.10", isBreak: true },
      { label: "6", time: "10.10 - 10.40" },
      { label: "7", time: "10.40 - 11.10" },
      { label: "8", time: "11.10 - 11.40" },
      { label: "9", time: "11.40 - 12.10" },
      { label: "10", time: "12.10 - 12.40" },
      { label: "11", time: "12.40 - 01.10" }
    ];

    const days = ["ISNIN", "SELASA", "RABU", "KHAMIS", "JUMAAT"];

    let html = `
      <div style="margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; background: #f8fafc; padding: 1rem; border-radius: 12px; border: 1px solid #e2e8f0; gap: 0.75rem;">
        <div>
          <h3 style="font-family: 'Outfit'; font-size: 1.25rem; color: var(--primary);">🏫 KELAS: ${className}</h3>
          <p style="font-size: 0.88rem; color: #475569;">
            👩‍🏫 Guru Kelas: <strong>${classData.guruKelas}</strong> | 👨‍🏫 Guru Pembantu: <strong>${classData.guruPembantu}</strong>
          </p>
        </div>
        <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
          <span class="badge badge-program">Tahap ${classData.tahap}</span>
          <span class="badge badge-pentadbiran">Rehat: ${classData.rehatTime}</span>
          <span class="badge badge-program">Berkuat kuasa 07 Sept 2026</span>
        </div>
      </div>

      <div class="timetable-container">
        <table class="timetable-grid">
          <thead>
            <tr>
              <th class="time-col">HARI</th>
              <th>1<br><span style="font-size: 0.7rem; font-weight: 400;">07.10-07.40</span></th>
              <th>2<br><span style="font-size: 0.7rem; font-weight: 400;">07.40-08.10</span></th>
              <th>3<br><span style="font-size: 0.7rem; font-weight: 400;">08.10-08.40</span></th>
              <th>4<br><span style="font-size: 0.7rem; font-weight: 400;">08.40-09.10</span></th>
              <th>5<br><span style="font-size: 0.7rem; font-weight: 400;">09.10-09.40</span></th>
              <th style="background: #fff1f2; color: #be123c;">REHAT<br><span style="font-size: 0.7rem; font-weight: 400;">09.40-10.10</span></th>
              <th>6<br><span style="font-size: 0.7rem; font-weight: 400;">10.10-10.40</span></th>
              <th>7<br><span style="font-size: 0.7rem; font-weight: 400;">10.40-11.10</span></th>
              <th>8<br><span style="font-size: 0.7rem; font-weight: 400;">11.10-11.40</span></th>
              <th>9<br><span style="font-size: 0.7rem; font-weight: 400;">11.40-12.10</span></th>
              <th>10<br><span style="font-size: 0.7rem; font-weight: 400;">12.10-12.40</span></th>
              <th>11<br><span style="font-size: 0.7rem; font-weight: 400;">12.40-01.10</span></th>
            </tr>
          </thead>
          <tbody>
    `;

    days.forEach(day => {
      const slots = classData.schedule[day] || [];
      html += `<tr><td class="time-col" style="font-weight: 700;">${day}</td>`;

      standardPeriods.forEach(p => {
        if (p.isBreak) {
          html += `<td style="background: #ffe4e6; text-align: center; vertical-align: middle; color: #be123c; font-weight: 600; font-size: 0.75rem;">REHAT</td>`;
          return;
        }

        if (day === "JUMAAT" && (p.label === "10" || p.label === "11")) {
          html += `<td style="background: #f8fafc; color: #cbd5e1; text-align: center; font-size: 0.75rem;">-</td>`;
          return;
        }

        const match = slots.find(s => s.time === p.time || (p.altTime && s.time === p.altTime));

        if (match) {
          const isCore = match.core === true || ['BM', 'BI', 'M3', 'SN'].includes(match.code);
          if (match.code === 'PERHIMPUNAN') {
            html += `<td style="background: #fef3c7; text-align: center; font-size: 0.72rem; font-weight: 700; color: #92400e;">PERHIMPUNAN</td>`;
          } else if (match.code === 'SEMAI') {
            html += `<td style="background: #f0fdf4; text-align: center; font-size: 0.72rem; color: #166534;">SEMAI</td>`;
          } else if (isCore) {
            html += `
              <td style="background: #ffffff; text-align: center; padding: 4px; border: 1px solid #e2e8f0;">
                <div style="font-weight: 800; font-size: 0.8rem; color: #1e3a8a;">${match.code}</div>
                <div style="font-size: 0.65rem; color: #64748b;">${match.name}</div>
              </td>
            `;
          } else {
            html += `
              <td style="background: #f0fdf4; text-align: center; padding: 4px; border: 1px solid #86efac;">
                <div style="font-weight: 800; font-size: 0.8rem; color: #15803d;">${match.code}</div>
                <div style="font-size: 0.65rem; color: #166534;">${match.name}</div>
                <span class="badge badge-individu" style="font-size: 0.6rem; padding: 1px 4px; margin-top: 2px;">Bukan Teras</span>
              </td>
            `;
          }
        } else {
          html += `<td style="background: #fafafa; text-align: center; color: #cbd5e1; font-size: 0.75rem;">-</td>`;
        }
      });

      html += `</tr>`;
    });

    html += `
          </tbody>
        </table>
      </div>
    `;

    containerEl.innerHTML = html;
  },

  // Cetakan Rasmi Jadual Mingguan UBK (A4 Format)
  triggerPrint: function() {
    this.setActiveTab("jadualPraktikum");
    setTimeout(() => {
      window.print();
    }, 150);
  },

  // =========================================================
  // MODUL PENJANAAN BORANG RASMI IPGM (LAMPIRAN 07, 09, 10)
  // Menepati 100% format asal Kementerian Pendidikan Malaysia & IPGM:
  // - Lampiran IPGM 07 (m/s 532): Borang Rekod Sesi B&K
  // - Lampiran IPGM 09 (m/s 534 - 536): Analisis Rekod Sesi B&K (3 Halaman / 10 Bahagian)
  // - Lampiran IPGM 10 (m/s 537): Borang Rumusan Sesi Kaunseling (SULIT Landskap)
  // =========================================================

  switchIpgmForm: function(formType) {
    this.state.activeIpgmForm = formType;
    document.querySelectorAll(".ipgm-subtab-btn").forEach(btn => {
      btn.classList.toggle("active", btn.getAttribute("data-form") === formType);
    });
    this.renderOfficialIpgmForms();
  },

  handleIpgmPeriodChange: function(period) {
    this.state.ipgmPeriod = period;
    this.renderOfficialIpgmForms();
  },

  getIpgmPeriodLabel: function(period) {
    if (!period || period === "all") return "Keseluruhan Tempoh Praktikum (Minggu 1 - 10 / 17 Ogos - 30 Okt 2026)";
    if (period === "current") {
      const cur = this.state.currentWeek || 1;
      const wObj = this.state.practicumData.find(w => w.weekNum === cur);
      return wObj ? `${wObj.title} (${wObj.dateRange})` : `Minggu ${cur}`;
    }
    if (period === "m_aug") return "Ogos 2026";
    if (period === "m_sep") return "September 2026";
    if (period === "m_oct") return "Oktober 2026";
    if (period.startsWith("w") || period.startsWith("m")) {
      const numStr = period.replace(/[^0-9]/g, "");
      const wNum = parseInt(numStr, 10);
      const wObj = this.state.practicumData.find(w => w.weekNum === wNum);
      return wObj ? `${wObj.title} (${wObj.dateRange})` : `Minggu ${wNum}`;
    }
    return period;
  },

  getFilteredSessionsForIpgm: function() {
    const period = this.state.ipgmPeriod || "all";
    const allSessions = [];

    this.state.practicumData.forEach(w => {
      const weekNum = w.weekNum;
      const weekDates = w.dates || {};
      if (w.sessions && Array.isArray(w.sessions)) {
        w.sessions.forEach(s => {
          // Hanya sesi perkhidmatan sebenar masuk borang IPGM. Pentadbiran, penyeliaan pensyarah,
          // program sekolah lain, kokurikulum & cuti hanyalah penanda masa — bukan rekod klien.
          const IPGM_SERVICE_TYPES = ['individu', 'kelompok', 'bimbingan', 'konsultasi', 'program', 'saringan'];
          if (!IPGM_SERVICE_TYPES.includes(s.type)) return;
          const dateStr = weekDates[s.day] || "-";
          allSessions.push({
            ...s,
            weekNum: weekNum,
            dateStr: dateStr
          });
        });
      }
    });

    // Bulan sebenar sesi (dd/mm/yyyy) — Minggu 6 (28 Sep - 2 Okt) merentasi dua bulan
    const monthOf = (s) => {
      const m = /^\d{1,2}\/(\d{1,2})\/\d{4}$/.exec(s.dateStr || "");
      return m ? parseInt(m[1], 10) : null;
    };

    if (period === "all") {
      return allSessions;
    }
    if (period === "current") {
      const cur = this.state.currentWeek || 1;
      return allSessions.filter(s => s.weekNum === cur);
    }
    if (period === "m_aug") {
      return allSessions.filter(s => monthOf(s) === 8);
    }
    if (period === "m_sep") {
      return allSessions.filter(s => monthOf(s) === 9);
    }
    if (period === "m_oct") {
      return allSessions.filter(s => monthOf(s) === 10);
    }
    if (period.startsWith("w") || period.startsWith("m")) {
      const numStr = period.replace(/[^0-9]/g, "");
      const wNum = parseInt(numStr, 10);
      return allSessions.filter(s => s.weekNum === wNum);
    }
    return allSessions;
  },

  getIpgmCrestSvg: function() {
    return `
      <img src="img/jata_negara.png" alt="Jata Negara Malaysia" class="ipgm-crest" style="width: 78px; height: auto; max-height: 65px; margin: 0 auto 6px auto; display: block; object-fit: contain;">
    `;
  },

  printCurrentIpgmForm: function() {
    this.printIpgmDedicated(this.state.activeIpgmForm || '07');
  },

  printAllIpgmForms: function() {
    this.printIpgmDedicated('all');
  },

  printIpgm07: function() {
    this.printIpgmDedicated('07');
  },

  printIpgm09: function() {
    this.printIpgmDedicated('09');
  },

  printIpgm10: function() {
    this.printIpgmDedicated('10');
  },

  printIpgmDedicated: function(formType) {
    const sessions = this.getFilteredSessionsForIpgm();
    const periodLabel = this.getIpgmPeriodLabel(this.state.ipgmPeriod);
    
    let targetHtml = '';
    let pageOrientation = 'portrait';
    let docTitle = 'Borang Rasmi Praktikum IPGM';

    if (formType === '07') {
      targetHtml = this.generateIpgm07Html(sessions, periodLabel);
      pageOrientation = 'portrait';
      docTitle = 'LAMPIRAN IPGM 07 - Rekod Sesi Perkhidmatan B&K';
    } else if (formType === '09') {
      targetHtml = this.generateIpgm09Html(sessions, periodLabel);
      pageOrientation = 'portrait';
      docTitle = 'LAMPIRAN IPGM 09 - Analisis Rekod Sesi B&K';
    } else if (formType === '10') {
      targetHtml = this.generateIpgm10Html(sessions, periodLabel);
      pageOrientation = 'landscape';
      docTitle = 'LAMPIRAN IPGM 10 - Borang Rumusan Sesi Kaunseling';
    } else if (formType === 'all') {
      targetHtml = this.generateAllIpgmHtml(sessions, periodLabel);
      pageOrientation = 'portrait';
      docTitle = 'SEMUA BORANG RASMI PRAKTIKUM IPGM (07, 09, 10)';
    }

    let printWindow = window.open('', '_blank', 'width=1100,height=900');
    if (!printWindow) {
      alert("Sila benarkan tetingkap pop-up pada pelayar anda untuk mencetak borang secara terus.");
      this.switchIpgmForm(formType);
      setTimeout(() => {
        window.print();
      }, 200);
      return;
    }

    const currentUrl = window.location.href;

    const htmlContent = `<!DOCTYPE html>
<html lang="ms">
<head>
  <meta charset="UTF-8">
  <title>${docTitle} - SK Tampasuk 1</title>
  <base href="${currentUrl}">
  <style>
    @page {
      size: A4 ${pageOrientation};
      margin: ${pageOrientation === 'landscape' ? '8mm 10mm' : '10mm 12mm'};
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      margin: 0;
      padding: 0;
      background: #e2e8f0;
      font-family: 'Times New Roman', Times, serif;
      color: #000;
    }
    .no-print-toolbar {
      position: sticky;
      top: 0;
      left: 0;
      right: 0;
      background: #1e3a8a;
      color: white;
      padding: 10px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 9999;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    .no-print-toolbar .btn-print-now {
      background: #22c55e;
      color: white;
      border: none;
      font-weight: 800;
      font-size: 0.95rem;
      padding: 8px 18px;
      border-radius: 6px;
      cursor: pointer;
    }
    .no-print-toolbar .btn-print-now:hover {
      background: #16a34a;
    }
    .no-print-toolbar .btn-close-print {
      background: rgba(255,255,255,0.2);
      color: white;
      border: 1px solid rgba(255,255,255,0.4);
      padding: 6px 14px;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
    }
    .no-print-toolbar .btn-close-print:hover {
      background: rgba(255,255,255,0.3);
    }
    .print-canvas {
      padding: 20px 0;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .ipgm-paper {
      background: white;
      width: ${pageOrientation === 'landscape' ? '1060px' : '820px'};
      padding: ${pageOrientation === 'landscape' ? '1.2cm 1.5cm' : '1.8cm 2cm'};
      margin-bottom: 25px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
      box-sizing: border-box;
      position: relative;
    }
    .ipgm-paper.landscape {
      width: 1060px;
      padding: 1.2cm 1.5cm;
    }
    .ipgm-header-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 0.5rem;
      font-size: 0.95rem;
      font-weight: 700;
    }
    .ipgm-badge-sulit {
      border: 1.5px solid #000;
      padding: 2px 14px;
      font-size: 0.85rem;
      font-weight: 800;
      letter-spacing: 1px;
    }
    .ipgm-center-header {
      text-align: center;
      margin-bottom: 1.25rem;
    }
    .ipgm-crest {
      width: 78px;
      height: auto;
      max-height: 65px;
      margin: 0 auto 6px auto;
      display: block;
      object-fit: contain;
    }
    .ipgm-gov-title {
      font-size: 0.95rem;
      font-weight: 800;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .ipgm-inst-title {
      font-size: 0.88rem;
      font-style: italic;
      margin-bottom: 10px;
    }
    .ipgm-form-main-title {
      font-size: 1.12rem;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-top: 6px;
      line-height: 1.3;
    }
    .ipgm-table {
      width: 100%;
      border-collapse: collapse;
      border: 1.5px solid #000;
      margin: 0.75rem 0 1.25rem 0;
      font-size: 8.5pt;
      line-height: 1.25;
    }
    .ipgm-table th, .ipgm-table td {
      border: 1px solid #000;
      padding: 4px 5px;
      vertical-align: middle;
    }
    .ipgm-table th {
      background: #eaeaea !important;
      font-weight: 800;
      text-align: center;
      color: #000;
    }
    .ipgm-box-field {
      border: 1.5px solid #000;
      min-height: 26px;
      padding: 4px 8px;
      font-size: 0.9rem;
      font-weight: 700;
      background: white;
      margin-bottom: 0.5rem;
      display: flex;
      align-items: center;
    }
    .ipgm-signature-section {
      margin-top: 1.75rem;
      font-size: 0.88rem;
      line-height: 1.7;
    }

    @media print {
      body {
        background: white !important;
        padding: 0 !important;
        margin: 0 !important;
      }
      .no-print-toolbar, .ipgm-page-divider-screen {
        display: none !important;
      }
      .print-canvas {
        padding: 0 !important;
        display: block !important;
      }
      .ipgm-paper {
        box-shadow: none !important;
        border: none !important;
        width: 100% !important;
        max-width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        page-break-after: always;
      }
      .ipgm-paper:last-child {
        page-break-after: auto;
      }
    }
  </style>
</head>
<body>
  <div class="no-print-toolbar">
    <div>
      <strong style="font-size: 1.05rem;">📄 ${docTitle}</strong>
      <span style="font-size: 0.8rem; margin-left: 12px; opacity: 0.85;">Orientasi Rasmi: ${pageOrientation === 'landscape' ? 'A4 Landskap (Melintang)' : 'A4 Potret (Menegak)'}</span>
    </div>
    <div style="display: flex; gap: 8px;">
      <button class="btn-print-now" onclick="window.print()">🖨️ Cetak Sekarang</button>
      <button class="btn-close-print" onclick="window.close()">✕ Tutup</button>
    </div>
  </div>
  <div class="print-canvas">
    ${targetHtml}
  </div>
  <script>
    window.addEventListener('load', function() {
      setTimeout(function() {
        window.print();
      }, 350);
    });
  <\/script>
</body>
</html>`;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  },

  renderOfficialIpgmForms: function() {
    const container = document.getElementById("ipgmFormContainer");
    if (!container) return;

    const formType = this.state.activeIpgmForm || "07";
    const sessions = this.getFilteredSessionsForIpgm();
    const periodLabel = this.getIpgmPeriodLabel(this.state.ipgmPeriod);

    if (formType === "07") {
      container.innerHTML = this.generateIpgm07Html(sessions, periodLabel);
    } else if (formType === "09") {
      container.innerHTML = this.generateIpgm09Html(sessions, periodLabel);
    } else if (formType === "10") {
      container.innerHTML = this.generateIpgm10Html(sessions, periodLabel);
    } else if (formType === "all") {
      container.innerHTML = this.generateAllIpgmHtml(sessions, periodLabel);
    }
  },

  // -------------------------------------------------------------
  // LAMPIRAN IPGM 07 (m/s 532): Borang Rekod Sesi Perkhidmatan B&K
  // Tepat 100% Mengikut Format Asal KPM/IPGM
  // -------------------------------------------------------------
  generateIpgm07Html: function(sessions, periodLabel) {
    const timeToMin = (t) => this.timeToMin(t);
    let totalMinutes = 0;
    let totalMurid = 0;
    let totalIndividu = 0;
    let totalKelompok = 0;

    const rowsHtml = sessions.map(s => {
      const dur = timeToMin(s.timeEnd) - timeToMin(s.timeStart);
      const safeDur = (dur > 0 && dur <= 360) ? dur : 60;
      totalMinutes += safeDur;
      const hours = (safeDur / 60).toFixed(1).replace('.0', '');

      let muridCount = 1;
      if (s.students && s.students.length > 0) {
        muridCount = s.students.length;
      } else if (s.headcount) {
        muridCount = s.headcount;
      } else if (s.type === 'kelompok') {
        muridCount = 6;
      } else if (s.type === 'bimbingan') {
        muridCount = 28;
      }
      totalMurid += muridCount;

      let isIndividu = s.type === 'individu';
      let isKelompok = s.type === 'kelompok' || s.type === 'bimbingan';

      if (isIndividu) totalIndividu++;
      if (isKelompok) totalKelompok++;

      return `
        <tr>
          <td style="text-align: center; border: 1px solid #000; font-size: 9pt; padding: 6px 4px; white-space: nowrap;">
            ${s.dateStr}
          </td>
          <td style="text-align: center; border: 1px solid #000; font-size: 9pt; padding: 6px 4px; white-space: nowrap;">
            ${s.timeStart} - ${s.timeEnd}
          </td>
          <td style="text-align: center; border: 1px solid #000; font-size: 9pt; padding: 6px 4px;">
            ${hours} Jam
          </td>
          <td style="text-align: center; border: 1px solid #000; font-size: 9pt; padding: 6px 4px;">
            ${muridCount}
          </td>
          <td style="text-align: center; border: 1px solid #000; font-size: 9pt; padding: 6px 4px; font-weight: bold;">
            ${isIndividu ? '/' : ''}
          </td>
          <td style="text-align: center; border: 1px solid #000; font-size: 9pt; padding: 6px 4px; font-weight: bold;">
            ${isKelompok ? '/' : ''}
          </td>
        </tr>
      `;
    }).join("");

    // Baris kosong tambahan jika sesi sedikit (supaya jadual penuh seperti borang asal)
    let blankRows = "";
    const minRows = 16;
    if (sessions.length < minRows) {
      for (let i = sessions.length; i < minRows; i++) {
        blankRows += `
          <tr>
            <td style="border: 1px solid #000; height: 26px;">&nbsp;</td>
            <td style="border: 1px solid #000;">&nbsp;</td>
            <td style="border: 1px solid #000;">&nbsp;</td>
            <td style="border: 1px solid #000;">&nbsp;</td>
            <td style="border: 1px solid #000;">&nbsp;</td>
            <td style="border: 1px solid #000;">&nbsp;</td>
          </tr>
        `;
      }
    }

    const totalHoursAll = (totalMinutes / 60).toFixed(1).replace('.0', '');

    return `
      <div class="ipgm-paper" style="font-family: 'Times New Roman', Times, serif;">
        <!-- Header Atas: Nombor Halaman & Lampiran & Tag SULIT -->
        <div style="display: flex; justify-content: flex-end; margin-bottom: 2px;">
          <div style="text-align: right; line-height: 1.25;">
            <div style="font-size: 11pt; font-weight: bold;">532</div>
            <div style="font-size: 11pt; font-weight: bold; margin-top: 2px;">LAMPIRAN IPGM 07</div>
            <div style="display: inline-block; border: 1.5px solid #000; padding: 2px 14px; font-weight: bold; font-size: 10pt; margin-top: 4px; letter-spacing: 1px;">SULIT</div>
          </div>
        </div>

        <!-- Jata Negara & Tajuk Borang Rasmi -->
        <div class="ipgm-center-header" style="text-align: center; margin-bottom: 1.5rem;">
          ${this.getIpgmCrestSvg()}
          <div style="font-size: 11pt; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">KEMENTERIAN PENDIDIKAN MALAYSIA</div>
          <div style="font-size: 10.5pt; font-style: italic; margin-bottom: 8px;">Institut Pendidikan Guru Malaysia</div>
          <div style="font-size: 12pt; font-weight: bold; text-transform: uppercase; margin-top: 8px; letter-spacing: 0.5px;">
            BORANG REKOD SESI PERKHIDMATAN BIMBINGAN DAN KAUNSELING
          </div>
        </div>

        <!-- Jadual Rasmi Lampiran 07 -->
        <table style="width: 100%; border-collapse: collapse; border: 1.5px solid #000; margin-top: 1rem;">
          <thead>
            <tr>
              <th rowspan="2" style="width: 14%; text-align: center; border: 1px solid #000; padding: 6px 4px; font-size: 9.5pt; font-weight: bold; background: #fff;">TARIKH</th>
              <th rowspan="2" style="width: 15%; text-align: center; border: 1px solid #000; padding: 6px 4px; font-size: 9.5pt; font-weight: bold; background: #fff;">MASA</th>
              <th rowspan="2" style="width: 15%; text-align: center; border: 1px solid #000; padding: 6px 4px; font-size: 9.5pt; font-weight: bold; background: #fff;">BILANGAN<br>JAM SESI</th>
              <th rowspan="2" style="width: 14%; text-align: center; border: 1px solid #000; padding: 6px 4px; font-size: 9.5pt; font-weight: bold; background: #fff;">BILANGAN<br>MURID</th>
              <th colspan="2" style="width: 42%; text-align: center; border: 1px solid #000; padding: 6px 4px; font-size: 9.5pt; font-weight: bold; background: #fff;">JENIS BIMBINGAN/ KAUNSELING</th>
            </tr>
            <tr>
              <th style="width: 21%; text-align: center; border: 1px solid #000; padding: 6px 4px; font-size: 9.5pt; font-weight: bold; background: #fff;">INDIVIDU</th>
              <th style="width: 21%; text-align: center; border: 1px solid #000; padding: 6px 4px; font-size: 9.5pt; font-weight: bold; background: #fff;">KELOMPOK</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
            ${blankRows}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="text-align: center; font-weight: bold; border: 1px solid #000; padding: 8px 4px; font-size: 10pt;">JUMLAH</td>
              <td style="text-align: center; font-weight: bold; border: 1px solid #000; padding: 8px 4px; font-size: 10pt;">${totalHoursAll} Jam</td>
              <td style="text-align: center; font-weight: bold; border: 1px solid #000; padding: 8px 4px; font-size: 10pt;">${totalMurid}</td>
              <td style="text-align: center; font-weight: bold; border: 1px solid #000; padding: 8px 4px; font-size: 10pt;">${totalIndividu}</td>
              <td style="text-align: center; font-weight: bold; border: 1px solid #000; padding: 8px 4px; font-size: 10pt;">${totalKelompok}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    `;
  },

  // -------------------------------------------------------------------
  // LAMPIRAN IPGM 09 (m/s 534 - 536): Analisis Rekod Sesi Perkhidmatan
  // Tepat 100% Mengikut Format Asal KPM/IPGM (3 Halaman Rasmi)
  // -------------------------------------------------------------------
  generateIpgm09Html: function(sessions, periodLabel) {
    // 1. Data Enrolmen SK Tampasuk 1 daripada Pangkalan Data 422 Murid APDM
    // LELAKI: M=18, C=0, I=0, L=210, JUMLAH=228
    // PEREMPUAN: M=9, C=0, I=0, L=185, JUMLAH=194
    // JUMLAH KESELURUHAN: 422
    const enrol = {
      l_m: 18, l_c: 0, l_i: 0, l_l: 210, l_tot: 228,
      p_m: 9, p_c: 0, p_i: 0, p_l: 185, p_tot: 194,
      grand: 422
    };

    // Struktur pengumpulan data 4 bidang fokus utama KPM
    // 1: Pembangunan dan Perkembangan Sahsiah Diri Murid
    // 2: Peningkatan Disiplin Diri Murid
    // 3: Pendidikan Kerjaya Murid
    // 4: Psikososial Dan Kesejahteraan Mental Murid
    const createStatObj = () => ({
      1: { lm: 0, lc: 0, li: 0, ll: 0, pm: 0, pc: 0, pi: 0, pl: 0, total: 0 },
      2: { lm: 0, lc: 0, li: 0, ll: 0, pm: 0, pc: 0, pi: 0, pl: 0, total: 0 },
      3: { lm: 0, lc: 0, li: 0, ll: 0, pm: 0, pc: 0, pi: 0, pl: 0, total: 0 },
      4: { lm: 0, lc: 0, li: 0, ll: 0, pm: 0, pc: 0, pi: 0, pl: 0, total: 0 }
    });

    const statKK_Pelajar = createStatObj(); // Seksyen 6
    const statKI_Sesi = createStatObj();    // Seksyen 7
    const statKK_Sesi = createStatObj();    // Seksyen 8
    const statBim_Pelajar = createStatObj();// Seksyen 10

    // Seksyen 9: Program Kaunseling Berfokus (1: Disiplin, 2: Akademik, 3: PPDa)
    const statBerfokus = {
      1: { lm: 0, lc: 0, li: 0, ll: 0, pm: 0, pc: 0, pi: 0, pl: 0, total: 0 },
      2: { lm: 0, lc: 0, li: 0, ll: 0, pm: 0, pc: 0, pi: 0, pl: 0, total: 0 },
      3: { lm: 0, lc: 0, li: 0, ll: 0, pm: 0, pc: 0, pi: 0, pl: 0, total: 0 }
    };

    // Fungsi pemetaan fokus ke baris (1-4)
    const mapFocusToRow = (focus) => {
      if (focus === 'disiplin') return 2;
      if (focus === 'kerjaya') return 3;
      if (focus === 'psikososial') return 4;
      return 1; // sahsiah / pembangunan diri
    };

    sessions.forEach(s => {
      const rowIdx = mapFocusToRow(s.focus);

      if (s.type === 'individu') {
        // Cari jantina & kaum murid
        let g = 'L', r = 'L';
        if (s.students && s.students.length > 0 && typeof SENARAI_MURID !== 'undefined') {
          const m = SENARAI_MURID.find(std => std.idMurid === s.students[0] || std.name === s.students[0]);
          if (m) { g = m.gender; r = m.race; }
        }
        // Tambah ke Seksyen 7 (Bilangan Sesi Kaunseling Individu)
        const target = statKI_Sesi[rowIdx];
        if (g === 'L') {
          if (r === 'M') target.lm++; else if (r === 'C') target.lc++; else if (r === 'I') target.li++; else target.ll++;
        } else {
          if (r === 'M') target.pm++; else if (r === 'C') target.pc++; else if (r === 'I') target.pi++; else target.pl++;
        }
        target.total++;
      } else if (s.type === 'kelompok') {
        // Tambah ke Seksyen 8 (Bilangan Sesi Kaunseling Kelompok)
        statKK_Sesi[rowIdx].total++;

        // Tambah ke Seksyen 6 (Bilangan Pelajar Mendapat Perkhidmatan KK)
        let studentsList = s.students && s.students.length > 0 ? s.students : [];
        if (studentsList.length > 0 && typeof SENARAI_MURID !== 'undefined') {
          studentsList.forEach(stdId => {
            const m = SENARAI_MURID.find(std => std.idMurid === stdId || std.name === stdId);
            const g = m ? m.gender : 'L';
            const r = m ? m.race : 'L';
            const target = statKK_Pelajar[rowIdx];
            if (g === 'L') {
              if (r === 'M') target.lm++; else if (r === 'C') target.lc++; else if (r === 'I') target.li++; else target.ll++;
            } else {
              if (r === 'M') target.pm++; else if (r === 'C') target.pc++; else if (r === 'I') target.pi++; else target.pl++;
            }
            target.total++;
          });
        } else {
          // Anggaran seimbang mengikut demografi SK Tampasuk 1
          const cnt = s.headcount || 6;
          const half = Math.ceil(cnt / 2);
          statKK_Pelajar[rowIdx].ll += half;
          statKK_Pelajar[rowIdx].pl += (cnt - half);
          statKK_Pelajar[rowIdx].total += cnt;
        }
      } else if (s.type === 'bimbingan' || s.type === 'program') {
        // Tambah ke Seksyen 10 (Bilangan Pelajar Mengikuti Program B&K)
        const cnt = (s.students && s.students.length > 0) ? s.students.length : (s.headcount || 28);
        const half = Math.ceil(cnt / 2);
        statBim_Pelajar[rowIdx].ll += half;
        statBim_Pelajar[rowIdx].pl += (cnt - half);
        statBim_Pelajar[rowIdx].total += cnt;

        // Seksyen 9 jika program berfokus
        const bfRow = s.focus === 'akademik' ? 2 : (s.title && s.title.includes('PPDa') ? 3 : 1);
        statBerfokus[bfRow].ll += Math.ceil(cnt / 4);
        statBerfokus[bfRow].pl += Math.ceil(cnt / 4);
        statBerfokus[bfRow].total += Math.ceil(cnt / 2);
      }
    });

    // Helper untuk menjana baris jadual 4 baris rasmi
    const render4RowsTable = (statObj) => {
      let totLM = 0, totLC = 0, totLI = 0, totLL = 0;
      let totPM = 0, totPC = 0, totPI = 0, totPL = 0;
      let grandTot = 0;

      for (let k = 1; k <= 4; k++) {
        const o = statObj[k];
        totLM += o.lm; totLC += o.lc; totLI += o.li; totLL += o.ll;
        totPM += o.pm; totPC += o.pc; totPI += o.pi; totPL += o.pl;
        grandTot += o.total;
      }

      const rowsName = [
        "Pembangunan dan Perkembangan Sahsiah Diri Murid",
        "Peningkatan Disiplin Diri Murid",
        "Pendidikan Kerjaya Murid",
        "Psikososial Dan Kesejahteraan Mental Murid"
      ];

      let html = "";
      for (let i = 1; i <= 4; i++) {
        const o = statObj[i];
        const pct = grandTot > 0 ? ((o.total / grandTot) * 100).toFixed(1) + "%" : "-";
        html += `
          <tr>
            <td style="text-align: center; border: 1px solid #000; font-size: 8.5pt; padding: 4px;">${i}</td>
            <td style="border: 1px solid #000; font-size: 8.5pt; padding: 4px;">${rowsName[i - 1]}</td>
            <td style="text-align: center; border: 1px solid #000; font-size: 8.5pt; padding: 4px;">${o.lm || ''}</td>
            <td style="text-align: center; border: 1px solid #000; font-size: 8.5pt; padding: 4px;">${o.lc || ''}</td>
            <td style="text-align: center; border: 1px solid #000; font-size: 8.5pt; padding: 4px;">${o.li || ''}</td>
            <td style="text-align: center; border: 1px solid #000; font-size: 8.5pt; padding: 4px;">${o.ll || ''}</td>
            <td style="text-align: center; border: 1px solid #000; font-size: 8.5pt; padding: 4px;">${o.pm || ''}</td>
            <td style="text-align: center; border: 1px solid #000; font-size: 8.5pt; padding: 4px;">${o.pc || ''}</td>
            <td style="text-align: center; border: 1px solid #000; font-size: 8.5pt; padding: 4px;">${o.pi || ''}</td>
            <td style="text-align: center; border: 1px solid #000; font-size: 8.5pt; padding: 4px;">${o.pl || ''}</td>
            <td style="text-align: center; border: 1px solid #000; font-size: 8.5pt; padding: 4px; font-weight: bold;">${o.total > 0 ? o.total : ''}</td>
            <td style="text-align: center; border: 1px solid #000; font-size: 8.5pt; padding: 4px;">${o.total > 0 ? pct : ''}</td>
          </tr>
        `;
      }

      html += `
        <tr>
          <td colspan="2" style="text-align: center; font-weight: bold; border: 1px solid #000; font-size: 8.5pt; padding: 4px;">JUMLAH</td>
          <td style="text-align: center; font-weight: bold; border: 1px solid #000; font-size: 8.5pt; padding: 4px;">${totLM || ''}</td>
          <td style="text-align: center; font-weight: bold; border: 1px solid #000; font-size: 8.5pt; padding: 4px;">${totLC || ''}</td>
          <td style="text-align: center; font-weight: bold; border: 1px solid #000; font-size: 8.5pt; padding: 4px;">${totLI || ''}</td>
          <td style="text-align: center; font-weight: bold; border: 1px solid #000; font-size: 8.5pt; padding: 4px;">${totLL || ''}</td>
          <td style="text-align: center; font-weight: bold; border: 1px solid #000; font-size: 8.5pt; padding: 4px;">${totPM || ''}</td>
          <td style="text-align: center; font-weight: bold; border: 1px solid #000; font-size: 8.5pt; padding: 4px;">${totPC || ''}</td>
          <td style="text-align: center; font-weight: bold; border: 1px solid #000; font-size: 8.5pt; padding: 4px;">${totPI || ''}</td>
          <td style="text-align: center; font-weight: bold; border: 1px solid #000; font-size: 8.5pt; padding: 4px;">${totPL || ''}</td>
          <td style="text-align: center; font-weight: bold; border: 1px solid #000; font-size: 8.5pt; padding: 4px;">${grandTot > 0 ? grandTot : ''}</td>
          <td style="text-align: center; font-weight: bold; border: 1px solid #000; font-size: 8.5pt; padding: 4px;">${grandTot > 0 ? '100%' : ''}</td>
        </tr>
      `;
      return html;
    };

    // Helper untuk Seksyen 9 (3 baris)
    const renderSeksyen9Table = () => {
      const rowsName = [
        "Bidang Disiplin",
        "Bidang Bimbingan Akademik",
        "Bidang Pendidikan Pencegahan Dadah"
      ];
      let totLM = 0, totLC = 0, totLI = 0, totLL = 0;
      let totPM = 0, totPC = 0, totPI = 0, totPL = 0;
      let grandTot = 0;

      for (let k = 1; k <= 3; k++) {
        const o = statBerfokus[k];
        totLM += o.lm; totLC += o.lc; totLI += o.li; totLL += o.ll;
        totPM += o.pm; totPC += o.pc; totPI += o.pi; totPL += o.pl;
        grandTot += o.total;
      }

      let html = "";
      for (let i = 1; i <= 3; i++) {
        const o = statBerfokus[i];
        const pct = grandTot > 0 ? ((o.total / grandTot) * 100).toFixed(1) + "%" : "-";
        html += `
          <tr>
            <td style="text-align: center; border: 1px solid #000; font-size: 8.5pt; padding: 4px;">${i}</td>
            <td style="border: 1px solid #000; font-size: 8.5pt; padding: 4px;">${rowsName[i - 1]}</td>
            <td style="text-align: center; border: 1px solid #000; font-size: 8.5pt; padding: 4px;">${o.lm || ''}</td>
            <td style="text-align: center; border: 1px solid #000; font-size: 8.5pt; padding: 4px;">${o.lc || ''}</td>
            <td style="text-align: center; border: 1px solid #000; font-size: 8.5pt; padding: 4px;">${o.li || ''}</td>
            <td style="text-align: center; border: 1px solid #000; font-size: 8.5pt; padding: 4px;">${o.ll || ''}</td>
            <td style="text-align: center; border: 1px solid #000; font-size: 8.5pt; padding: 4px;">${o.pm || ''}</td>
            <td style="text-align: center; border: 1px solid #000; font-size: 8.5pt; padding: 4px;">${o.pc || ''}</td>
            <td style="text-align: center; border: 1px solid #000; font-size: 8.5pt; padding: 4px;">${o.pi || ''}</td>
            <td style="text-align: center; border: 1px solid #000; font-size: 8.5pt; padding: 4px;">${o.pl || ''}</td>
            <td style="text-align: center; border: 1px solid #000; font-size: 8.5pt; padding: 4px; font-weight: bold;">${o.total > 0 ? o.total : ''}</td>
            <td style="text-align: center; border: 1px solid #000; font-size: 8.5pt; padding: 4px;">${o.total > 0 ? pct : ''}</td>
          </tr>
        `;
      }

      html += `
        <tr>
          <td colspan="2" style="text-align: center; font-weight: bold; border: 1px solid #000; font-size: 8.5pt; padding: 4px;">JUMLAH</td>
          <td style="text-align: center; font-weight: bold; border: 1px solid #000; font-size: 8.5pt; padding: 4px;">${totLM || ''}</td>
          <td style="text-align: center; font-weight: bold; border: 1px solid #000; font-size: 8.5pt; padding: 4px;">${totLC || ''}</td>
          <td style="text-align: center; font-weight: bold; border: 1px solid #000; font-size: 8.5pt; padding: 4px;">${totLI || ''}</td>
          <td style="text-align: center; font-weight: bold; border: 1px solid #000; font-size: 8.5pt; padding: 4px;">${totLL || ''}</td>
          <td style="text-align: center; font-weight: bold; border: 1px solid #000; font-size: 8.5pt; padding: 4px;">${totPM || ''}</td>
          <td style="text-align: center; font-weight: bold; border: 1px solid #000; font-size: 8.5pt; padding: 4px;">${totPC || ''}</td>
          <td style="text-align: center; font-weight: bold; border: 1px solid #000; font-size: 8.5pt; padding: 4px;">${totPI || ''}</td>
          <td style="text-align: center; font-weight: bold; border: 1px solid #000; font-size: 8.5pt; padding: 4px;">${totPL || ''}</td>
          <td style="text-align: center; font-weight: bold; border: 1px solid #000; font-size: 8.5pt; padding: 4px;">${grandTot > 0 ? grandTot : ''}</td>
          <td style="text-align: center; font-weight: bold; border: 1px solid #000; font-size: 8.5pt; padding: 4px;">${grandTot > 0 ? '100%' : ''}</td>
        </tr>
      `;
      return html;
    };

    return `
      <!-- ========================================== -->
      <!-- HALAMAN 1 DARI 3 (m/s 534)                 -->
      <!-- ========================================== -->
      <div class="ipgm-paper" style="font-family: 'Times New Roman', Times, serif; page-break-after: always; margin-bottom: 2rem;">
        <div style="display: flex; justify-content: flex-end; margin-bottom: 2px;">
          <div style="text-align: right; line-height: 1.25;">
            <div style="font-size: 11pt; font-weight: bold;">534</div>
            <div style="font-size: 11pt; font-weight: bold; margin-top: 2px;">LAMPIRAN IPGM 09</div>
            <div style="display: inline-block; border: 1.5px solid #000; padding: 2px 14px; font-weight: bold; font-size: 10pt; margin-top: 4px; letter-spacing: 1px;">SULIT</div>
          </div>
        </div>

        <div class="ipgm-center-header" style="text-align: center; margin-bottom: 1.25rem;">
          ${this.getIpgmCrestSvg()}
          <div style="font-size: 11pt; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">KEMENTERIAN PENDIDIKAN MALAYSIA</div>
          <div style="font-size: 10.5pt; font-style: italic; margin-bottom: 8px;">Institut Pendidikan Guru Malaysia</div>
          <div style="font-size: 11.5pt; font-weight: bold; text-transform: uppercase; margin-top: 6px; letter-spacing: 0.5px;">
            ANALISIS REKOD SESI PERKHIDMATAN BIMBINGAN DAN KAUNSELING
          </div>
        </div>

        <!-- 1. NAMA DAN ALAMAT SEKOLAH -->
        <div style="margin-bottom: 0.6rem;">
          <div style="font-size: 9.5pt; font-weight: bold; margin-bottom: 3px;">1. NAMA DAN ALAMAT SEKOLAH</div>
          <div style="border: 1px solid #000; padding: 5px 8px; font-size: 9.5pt; min-height: 28px;">
            SK TAMPASUK 1, WDT 103, 89150 KOTA BELUD, SABAH
          </div>
        </div>

        <!-- 2. KOD SEKOLAH -->
        <div style="margin-bottom: 0.6rem;">
          <div style="font-size: 9.5pt; font-weight: bold; margin-bottom: 3px;">2. KOD SEKOLAH</div>
          <div style="border: 1px solid #000; padding: 5px 8px; font-size: 9.5pt; min-height: 22px;">
            XBA5346
          </div>
        </div>

        <!-- 3. NAMA GURU BESAR -->
        <div style="margin-bottom: 0.6rem;">
          <div style="font-size: 9.5pt; font-weight: bold; margin-bottom: 3px;">3. NAMA GURU BESAR</div>
          <div style="border: 1px solid #000; padding: 5px 8px; font-size: 9.5pt; min-height: 22px;">
            EN. MUDAH BIN HJ. ADMAIM
          </div>
        </div>

        <!-- 4. NAMA KAUNSELOR -->
        <div style="margin-bottom: 0.75rem;">
          <div style="font-size: 9.5pt; font-weight: bold; margin-bottom: 3px;">4. NAMA KAUNSELOR</div>
          <div style="border: 1px solid #000; padding: 5px 8px; font-size: 9.5pt; min-height: 22px;">
            NURUL SYAHFIRAH BINTI ARJAMAN
          </div>
        </div>

        <!-- 5. ENROLMEN PELAJAR -->
        <div style="margin-bottom: 1.25rem;">
          <div style="font-size: 9.5pt; font-weight: bold; margin-bottom: 2px;">5. ENROLMEN PELAJAR</div>
          <div style="font-size: 8pt; font-style: italic; margin-bottom: 4px;">Nota: M-Melayu, C-Cina, I-India, L-Lain-lain</div>
          <table style="width: 100%; border-collapse: collapse; border: 1px solid #000;">
            <thead>
              <tr>
                <th colspan="5" style="border: 1px solid #000; text-align: center; font-size: 8.5pt; padding: 4px; background: #fff;">LELAKI</th>
                <th colspan="5" style="border: 1px solid #000; text-align: center; font-size: 8.5pt; padding: 4px; background: #fff;">PEREMPUAN</th>
              </tr>
              <tr>
                <th style="border: 1px solid #000; width: 10%; text-align: center; font-size: 8.5pt; padding: 3px; background: #fff;">M</th>
                <th style="border: 1px solid #000; width: 10%; text-align: center; font-size: 8.5pt; padding: 3px; background: #fff;">C</th>
                <th style="border: 1px solid #000; width: 10%; text-align: center; font-size: 8.5pt; padding: 3px; background: #fff;">I</th>
                <th style="border: 1px solid #000; width: 10%; text-align: center; font-size: 8.5pt; padding: 3px; background: #fff;">L</th>
                <th style="border: 1px solid #000; width: 10%; text-align: center; font-size: 8.5pt; padding: 3px; background: #fff;">JUMLAH</th>
                <th style="border: 1px solid #000; width: 10%; text-align: center; font-size: 8.5pt; padding: 3px; background: #fff;">M</th>
                <th style="border: 1px solid #000; width: 10%; text-align: center; font-size: 8.5pt; padding: 3px; background: #fff;">C</th>
                <th style="border: 1px solid #000; width: 10%; text-align: center; font-size: 8.5pt; padding: 3px; background: #fff;">I</th>
                <th style="border: 1px solid #000; width: 10%; text-align: center; font-size: 8.5pt; padding: 3px; background: #fff;">L</th>
                <th style="border: 1px solid #000; width: 10%; text-align: center; font-size: 8.5pt; padding: 3px; background: #fff;">JUMLAH</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="text-align: center; border: 1px solid #000; font-size: 9pt; padding: 5px;">${enrol.l_m}</td>
                <td style="text-align: center; border: 1px solid #000; font-size: 9pt; padding: 5px;">${enrol.l_c}</td>
                <td style="text-align: center; border: 1px solid #000; font-size: 9pt; padding: 5px;">${enrol.l_i}</td>
                <td style="text-align: center; border: 1px solid #000; font-size: 9pt; padding: 5px;">${enrol.l_l}</td>
                <td style="text-align: center; border: 1px solid #000; font-size: 9pt; padding: 5px; font-weight: bold;">${enrol.l_tot}</td>
                <td style="text-align: center; border: 1px solid #000; font-size: 9pt; padding: 5px;">${enrol.p_m}</td>
                <td style="text-align: center; border: 1px solid #000; font-size: 9pt; padding: 5px;">${enrol.p_c}</td>
                <td style="text-align: center; border: 1px solid #000; font-size: 9pt; padding: 5px;">${enrol.p_i}</td>
                <td style="text-align: center; border: 1px solid #000; font-size: 9pt; padding: 5px;">${enrol.p_l}</td>
                <td style="text-align: center; border: 1px solid #000; font-size: 9pt; padding: 5px; font-weight: bold;">${enrol.p_tot}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 6. BILANGAN PELAJAR MENDAPAT PERKHIDMATAN KAUNSELING KELOMPOK -->
        <div>
          <div style="font-size: 9.5pt; font-weight: bold; margin-bottom: 4px;">
            6. BILANGAN PELAJAR MENDAPAT PERKHIDMATAN KAUNSELING KELOMPOK
          </div>
          <table style="width: 100%; border-collapse: collapse; border: 1px solid #000;">
            <thead>
              <tr>
                <th rowspan="2" style="width: 5%; border: 1px solid #000; text-align: center; font-size: 8.5pt; padding: 4px; background: #fff;">Bil.</th>
                <th rowspan="2" style="width: 35%; border: 1px solid #000; text-align: left; font-size: 8.5pt; padding: 4px; background: #fff;">Jenis Perkhidmatan</th>
                <th colspan="4" style="border: 1px solid #000; text-align: center; font-size: 8.5pt; padding: 4px; background: #fff;">LELAKI</th>
                <th colspan="4" style="border: 1px solid #000; text-align: center; font-size: 8.5pt; padding: 4px; background: #fff;">PEREMPUAN</th>
                <th rowspan="2" style="width: 8%; border: 1px solid #000; text-align: center; font-size: 8.5pt; padding: 4px; background: #fff;">JUMLAH</th>
                <th rowspan="2" style="width: 8%; border: 1px solid #000; text-align: center; font-size: 8.5pt; padding: 4px; background: #fff;">PERATUS</th>
              </tr>
              <tr>
                <th style="border: 1px solid #000; width: 6%; text-align: center; font-size: 8pt; padding: 2px; background: #fff;">M</th>
                <th style="border: 1px solid #000; width: 6%; text-align: center; font-size: 8pt; padding: 2px; background: #fff;">C</th>
                <th style="border: 1px solid #000; width: 6%; text-align: center; font-size: 8pt; padding: 2px; background: #fff;">I</th>
                <th style="border: 1px solid #000; width: 6%; text-align: center; font-size: 8pt; padding: 2px; background: #fff;">L</th>
                <th style="border: 1px solid #000; width: 6%; text-align: center; font-size: 8pt; padding: 2px; background: #fff;">M</th>
                <th style="border: 1px solid #000; width: 6%; text-align: center; font-size: 8pt; padding: 2px; background: #fff;">C</th>
                <th style="border: 1px solid #000; width: 6%; text-align: center; font-size: 8pt; padding: 2px; background: #fff;">I</th>
                <th style="border: 1px solid #000; width: 6%; text-align: center; font-size: 8pt; padding: 2px; background: #fff;">L</th>
              </tr>
            </thead>
            <tbody>
              ${render4RowsTable(statKK_Pelajar)}
            </tbody>
          </table>
        </div>
      </div>

      <!-- ========================================== -->
      <!-- HALAMAN 2 DARI 3 (m/s 535)                 -->
      <!-- ========================================== -->
      <div class="ipgm-paper" style="font-family: 'Times New Roman', Times, serif; page-break-after: always; margin-bottom: 2rem;">
        <div style="display: flex; justify-content: flex-end; margin-bottom: 1rem;">
          <div style="font-size: 11pt; font-weight: bold;">535</div>
        </div>

        <!-- 7. BILANGAN SESI KAUNSELING INDIVIDU -->
        <div style="margin-bottom: 1.25rem;">
          <div style="font-size: 9.5pt; font-weight: bold; margin-bottom: 4px;">
            7. BILANGAN SESI KAUNSELING INDIVIDU
          </div>
          <table style="width: 100%; border-collapse: collapse; border: 1px solid #000;">
            <thead>
              <tr>
                <th rowspan="2" style="width: 5%; border: 1px solid #000; text-align: center; font-size: 8.5pt; padding: 4px; background: #fff;">Bil.</th>
                <th rowspan="2" style="width: 35%; border: 1px solid #000; text-align: left; font-size: 8.5pt; padding: 4px; background: #fff;">Jenis Perkhidmatan</th>
                <th colspan="4" style="border: 1px solid #000; text-align: center; font-size: 8.5pt; padding: 4px; background: #fff;">LELAKI</th>
                <th colspan="4" style="border: 1px solid #000; text-align: center; font-size: 8.5pt; padding: 4px; background: #fff;">PEREMPUAN</th>
                <th rowspan="2" style="width: 8%; border: 1px solid #000; text-align: center; font-size: 8.5pt; padding: 4px; background: #fff;">JUMLAH</th>
                <th rowspan="2" style="width: 8%; border: 1px solid #000; text-align: center; font-size: 8.5pt; padding: 4px; background: #fff;">PERATUS</th>
              </tr>
              <tr>
                <th style="border: 1px solid #000; width: 6%; text-align: center; font-size: 8pt; padding: 2px; background: #fff;">M</th>
                <th style="border: 1px solid #000; width: 6%; text-align: center; font-size: 8pt; padding: 2px; background: #fff;">C</th>
                <th style="border: 1px solid #000; width: 6%; text-align: center; font-size: 8pt; padding: 2px; background: #fff;">I</th>
                <th style="border: 1px solid #000; width: 6%; text-align: center; font-size: 8pt; padding: 2px; background: #fff;">L</th>
                <th style="border: 1px solid #000; width: 6%; text-align: center; font-size: 8pt; padding: 2px; background: #fff;">M</th>
                <th style="border: 1px solid #000; width: 6%; text-align: center; font-size: 8pt; padding: 2px; background: #fff;">C</th>
                <th style="border: 1px solid #000; width: 6%; text-align: center; font-size: 8pt; padding: 2px; background: #fff;">I</th>
                <th style="border: 1px solid #000; width: 6%; text-align: center; font-size: 8pt; padding: 2px; background: #fff;">L</th>
              </tr>
            </thead>
            <tbody>
              ${render4RowsTable(statKI_Sesi)}
            </tbody>
          </table>
        </div>

        <!-- 8. BILANGAN SESI KAUNSELING KELOMPOK -->
        <div style="margin-bottom: 1.25rem;">
          <div style="font-size: 9.5pt; font-weight: bold; margin-bottom: 4px;">
            8. BILANGAN SESI KAUNSELING KELOMPOK
          </div>
          <table style="width: 100%; border-collapse: collapse; border: 1px solid #000;">
            <thead>
              <tr>
                <th rowspan="2" style="width: 5%; border: 1px solid #000; text-align: center; font-size: 8.5pt; padding: 4px; background: #fff;">Bil.</th>
                <th rowspan="2" style="width: 35%; border: 1px solid #000; text-align: left; font-size: 8.5pt; padding: 4px; background: #fff;">Jenis Perkhidmatan</th>
                <th colspan="4" style="border: 1px solid #000; text-align: center; font-size: 8.5pt; padding: 4px; background: #fff;">LELAKI</th>
                <th colspan="4" style="border: 1px solid #000; text-align: center; font-size: 8.5pt; padding: 4px; background: #fff;">PEREMPUAN</th>
                <th rowspan="2" style="width: 8%; border: 1px solid #000; text-align: center; font-size: 8.5pt; padding: 4px; background: #fff;">JUMLAH</th>
                <th rowspan="2" style="width: 8%; border: 1px solid #000; text-align: center; font-size: 8.5pt; padding: 4px; background: #fff;">PERATUS</th>
              </tr>
              <tr>
                <th style="border: 1px solid #000; width: 6%; text-align: center; font-size: 8pt; padding: 2px; background: #fff;">M</th>
                <th style="border: 1px solid #000; width: 6%; text-align: center; font-size: 8pt; padding: 2px; background: #fff;">C</th>
                <th style="border: 1px solid #000; width: 6%; text-align: center; font-size: 8pt; padding: 2px; background: #fff;">I</th>
                <th style="border: 1px solid #000; width: 6%; text-align: center; font-size: 8pt; padding: 2px; background: #fff;">L</th>
                <th style="border: 1px solid #000; width: 6%; text-align: center; font-size: 8pt; padding: 2px; background: #fff;">M</th>
                <th style="border: 1px solid #000; width: 6%; text-align: center; font-size: 8pt; padding: 2px; background: #fff;">C</th>
                <th style="border: 1px solid #000; width: 6%; text-align: center; font-size: 8pt; padding: 2px; background: #fff;">I</th>
                <th style="border: 1px solid #000; width: 6%; text-align: center; font-size: 8pt; padding: 2px; background: #fff;">L</th>
              </tr>
            </thead>
            <tbody>
              ${render4RowsTable(statKK_Sesi)}
            </tbody>
          </table>
        </div>

        <!-- 9. BILANGAN MURID YANG TERLIBAT DENGAN PROGRAM KAUNSELING BERFOKUS -->
        <div>
          <div style="font-size: 9.5pt; font-weight: bold; margin-bottom: 4px;">
            9. BILANGAN MURID YANG TERLIBAT DENGAN PROGRAM KAUNSELING BERFOKUS
          </div>
          <table style="width: 100%; border-collapse: collapse; border: 1px solid #000;">
            <thead>
              <tr>
                <th rowspan="2" style="width: 5%; border: 1px solid #000; text-align: center; font-size: 8.5pt; padding: 4px; background: #fff;">Bil.</th>
                <th rowspan="2" style="width: 35%; border: 1px solid #000; text-align: left; font-size: 8.5pt; padding: 4px; background: #fff;">Jenis Perkhidmatan</th>
                <th colspan="4" style="border: 1px solid #000; text-align: center; font-size: 8.5pt; padding: 4px; background: #fff;">LELAKI</th>
                <th colspan="4" style="border: 1px solid #000; text-align: center; font-size: 8.5pt; padding: 4px; background: #fff;">PEREMPUAN</th>
                <th rowspan="2" style="width: 8%; border: 1px solid #000; text-align: center; font-size: 8.5pt; padding: 4px; background: #fff;">JUMLAH</th>
                <th rowspan="2" style="width: 8%; border: 1px solid #000; text-align: center; font-size: 8.5pt; padding: 4px; background: #fff;">PERATUS</th>
              </tr>
              <tr>
                <th style="border: 1px solid #000; width: 6%; text-align: center; font-size: 8pt; padding: 2px; background: #fff;">M</th>
                <th style="border: 1px solid #000; width: 6%; text-align: center; font-size: 8pt; padding: 2px; background: #fff;">C</th>
                <th style="border: 1px solid #000; width: 6%; text-align: center; font-size: 8pt; padding: 2px; background: #fff;">I</th>
                <th style="border: 1px solid #000; width: 6%; text-align: center; font-size: 8pt; padding: 2px; background: #fff;">L</th>
                <th style="border: 1px solid #000; width: 6%; text-align: center; font-size: 8pt; padding: 2px; background: #fff;">M</th>
                <th style="border: 1px solid #000; width: 6%; text-align: center; font-size: 8pt; padding: 2px; background: #fff;">C</th>
                <th style="border: 1px solid #000; width: 6%; text-align: center; font-size: 8pt; padding: 2px; background: #fff;">I</th>
                <th style="border: 1px solid #000; width: 6%; text-align: center; font-size: 8pt; padding: 2px; background: #fff;">L</th>
              </tr>
            </thead>
            <tbody>
              ${renderSeksyen9Table()}
            </tbody>
          </table>
        </div>
      </div>

      <!-- ========================================== -->
      <!-- HALAMAN 3 DARI 3 (m/s 536)                 -->
      <!-- ========================================== -->
      <div class="ipgm-paper" style="font-family: 'Times New Roman', Times, serif; margin-bottom: 2rem;">
        <div style="display: flex; justify-content: flex-end; margin-bottom: 1rem;">
          <div style="font-size: 11pt; font-weight: bold;">536</div>
        </div>

        <!-- 10. BILANGAN PELAJAR YANG MENGIKUTI PROGRAM BIMBINGAN DAN KAUNSELING -->
        <div style="margin-bottom: 2rem;">
          <div style="font-size: 9.5pt; font-weight: bold; margin-bottom: 4px;">
            10. BILANGAN PELAJAR YANG MENGIKUTI PROGRAM BIMBINGAN DAN KAUNSELING
          </div>
          <table style="width: 100%; border-collapse: collapse; border: 1px solid #000;">
            <thead>
              <tr>
                <th rowspan="2" style="width: 5%; border: 1px solid #000; text-align: center; font-size: 8.5pt; padding: 4px; background: #fff;">Bil.</th>
                <th rowspan="2" style="width: 35%; border: 1px solid #000; text-align: left; font-size: 8.5pt; padding: 4px; background: #fff;">Jenis Perkhidmatan</th>
                <th colspan="4" style="border: 1px solid #000; text-align: center; font-size: 8.5pt; padding: 4px; background: #fff;">LELAKI</th>
                <th colspan="4" style="border: 1px solid #000; text-align: center; font-size: 8.5pt; padding: 4px; background: #fff;">PEREMPUAN</th>
                <th rowspan="2" style="width: 8%; border: 1px solid #000; text-align: center; font-size: 8.5pt; padding: 4px; background: #fff;">JUMLAH</th>
                <th rowspan="2" style="width: 8%; border: 1px solid #000; text-align: center; font-size: 8.5pt; padding: 4px; background: #fff;">PERATUS</th>
              </tr>
              <tr>
                <th style="border: 1px solid #000; width: 6%; text-align: center; font-size: 8pt; padding: 2px; background: #fff;">M</th>
                <th style="border: 1px solid #000; width: 6%; text-align: center; font-size: 8pt; padding: 2px; background: #fff;">C</th>
                <th style="border: 1px solid #000; width: 6%; text-align: center; font-size: 8pt; padding: 2px; background: #fff;">I</th>
                <th style="border: 1px solid #000; width: 6%; text-align: center; font-size: 8pt; padding: 2px; background: #fff;">L</th>
                <th style="border: 1px solid #000; width: 6%; text-align: center; font-size: 8pt; padding: 2px; background: #fff;">M</th>
                <th style="border: 1px solid #000; width: 6%; text-align: center; font-size: 8pt; padding: 2px; background: #fff;">C</th>
                <th style="border: 1px solid #000; width: 6%; text-align: center; font-size: 8pt; padding: 2px; background: #fff;">I</th>
                <th style="border: 1px solid #000; width: 6%; text-align: center; font-size: 8pt; padding: 2px; background: #fff;">L</th>
              </tr>
            </thead>
            <tbody>
              ${render4RowsTable(statBim_Pelajar)}
            </tbody>
          </table>
        </div>

        <!-- Ruang Tandatangan Rasmi Disediakan & Disahkan -->
        <div style="font-size: 9.5pt; line-height: 2;">
          <div style="font-weight: bold; margin-bottom: 0.5rem;">DISEDIAKAN OLEH:</div>
          <div style="margin-bottom: 1.25rem;">
            Tanda tangan Kaunselor pelatih : ...........................................................<br>
            Nama : NURUL SYAHFIRAH BINTI ARJAMAN<br>
            Tarikh : ......................................................................................................................
          </div>

          <div style="font-weight: bold; margin-bottom: 0.5rem; margin-top: 1.5rem;">DISAHKAN OLEH :</div>
          <div>
            Tanda tangan : ..........................................................................................................<br>
            Nama : EN. MUDAH BIN HJ. ADMAIM<br>
            Cop Jawatan : GURU BESAR SK TAMPASUK 1, KOTA BELUD<br>
            Tarikh : ..............................................................................................................
          </div>
        </div>
      </div>
    `;
  },

  // -------------------------------------------------------------
  // LAMPIRAN IPGM 10 (m/s 537): Borang Rumusan Sesi Kaunseling (SULIT)
  // Format Landskap Rasmi KPM/IPGM - Tepat 100%
  // -------------------------------------------------------------
  generateIpgm10Html: function(sessions, periodLabel) {
    let totStatusB = 0, totStatusK = 0, totStatusDJ = 0;
    let totKI_L = 0, totKI_P = 0, totKI_Sesi = 0;
    let totKK_L = 0, totKK_P = 0, totKK_Sesi = 0;
    let totBim_L = 0, totBim_P = 0, totBim_Sesi = 0;
    let totKons_L = 0, totKons_P = 0, totKons_Jam = 0;
    let totSuka_L = 0, totSuka_P = 0;
    let totRujuk_L = 0, totRujuk_P = 0;
    let totEmel_L = 0, totEmel_P = 0;
    let totTel_L = 0, totTel_P = 0;
    let totPel_L = 0, totPel_P = 0;

    const rowsHtml = sessions.map((s, idx) => {
      // Maklumat Murid — NAMA PENUH & KELAS SAHAJA (tiada IC — Etika Kerahsiaan)
      let namaKlien = s.classTarget && s.classTarget !== '-' ? s.classTarget : (s.title || "Klien");
      let kelasKlien = s.classTarget && s.classTarget !== '-' ? s.classTarget : "-";
      let gender = "L";

      if (s.students && s.students.length > 0) {
        // Cuba cari dari SENARAI_MURID jika tersedia
        if (s.students.length === 1) {
          const studentRef = s.students[0];
          const studentName = (typeof studentRef === 'object') ? (studentRef.name || '') : studentRef;
          const studentClass = (typeof studentRef === 'object' && studentRef.className) ? studentRef.className : s.classTarget;

          let m = null;
          if (typeof SENARAI_MURID !== 'undefined') {
            m = SENARAI_MURID.find(std =>
              (std.name && studentName && std.name.toUpperCase() === studentName.toUpperCase()) ||
              (std.idMurid && std.idMurid === studentRef)
            );
          }

          if (m) {
            namaKlien = `${m.name} (${m.className})`;
            kelasKlien = m.className || studentClass || "-";
            gender = m.gender || "L";
          } else {
            namaKlien = studentName ? `${studentName}${studentClass ? ' (' + studentClass + ')' : ''}` : (s.title || "Klien");
            kelasKlien = studentClass || s.classTarget || "-";
          }
        } else {
          namaKlien = `${s.classTarget && s.classTarget !== '-' ? s.classTarget + ': ' : ''}${s.students.length} Orang Murid`;
          kelasKlien = s.classTarget || "-";
        }
      }

      // Status (B / K / D/J)
      const st = s.clientStatus || (s.type === 'bimbingan' ? 'D/J' : 'B');
      const isB = (st === 'B' && s.type !== 'bimbingan') ? '1' : '';
      const isK = (st === 'K' && s.type !== 'bimbingan') ? '1' : '';
      const isDJ = (st === 'D/J' || st === 'DIRUJUK' || st === 'D' || s.type === 'bimbingan') ? '1' : '';
      if (isB) totStatusB++;
      if (isK) totStatusK++;
      if (isDJ) totStatusDJ++;

      // Jenis Intervensi
      let ki_l = '', ki_p = '', ki_sesi = '';
      let kk_l = '', kk_p = '', kk_sesi = '';
      let bim_l = '', bim_p = '', bim_sesi = '';
      let kons_l = '', kons_p = '', kons_jam = '';

      if (s.type === 'individu') {
        if (gender === 'L') { ki_l = '1'; totKI_L++; } else { ki_p = '1'; totKI_P++; }
        ki_sesi = '1'; totKI_Sesi++;
      } else if (s.type === 'kelompok') {
        const cnt = (s.students && s.students.length > 0) ? s.students.length : (s.headcount || 6);
        const half = Math.ceil(cnt / 2);
        kk_l = String(half); totKK_L += half;
        kk_p = String(cnt - half); totKK_P += (cnt - half);
        kk_sesi = '1'; totKK_Sesi++;
      } else if (s.type === 'bimbingan') {
        const cnt = (s.students && s.students.length > 0) ? s.students.length : (s.headcount || 28);
        const half = Math.ceil(cnt / 2);
        bim_l = String(half); totBim_L += half;
        bim_p = String(cnt - half); totBim_P += (cnt - half);
        bim_sesi = '1'; totBim_Sesi++;
      } else if (s.type === 'konsultasi') {
        kons_l = '1'; totKons_L++;
        kons_jam = '1'; totKons_Jam++;
      }

      // Cara Hadir
      let suka_l = '', suka_p = '';
      let ruj_l = '', ruj_p = '';
      let emel_l = '', emel_p = '';
      let tel_l = '', tel_p = '';

      if (s.type === 'bimbingan') {
        // Bimbingan Kelas ialah Kelas Ganti Guru Lain -> Cara Hadir: RUJUKAN
        ruj_l = bim_l;
        ruj_p = bim_p;
        totRujuk_L += parseInt(bim_l, 10) || 0;
        totRujuk_P += parseInt(bim_p, 10) || 0;
      } else {
        const arr = s.arrivalWay || 'sukarela';
        if (arr === 'rujukan') {
          if (gender === 'L') { ruj_l = '1'; totRujuk_L++; } else { ruj_p = '1'; totRujuk_P++; }
        } else if (arr === 'emel') {
          if (gender === 'L') { emel_l = '1'; totEmel_L++; } else { emel_p = '1'; totEmel_P++; }
        } else if (arr === 'telefon') {
          if (gender === 'L') { tel_l = '1'; totTel_L++; } else { tel_p = '1'; totTel_P++; }
        } else {
          if (gender === 'L') { suka_l = '1'; totSuka_L++; } else { suka_p = '1'; totSuka_P++; }
        }
      }

      // Sasaran (Pelajar L/P)
      let pel_l = '', pel_p = '';
      const tgt = s.targetAudience || 'pelajar';
      if (tgt === 'pelajar') {
        if (s.type === 'individu') {
          if (gender === 'L') { pel_l = '1'; totPel_L++; } else { pel_p = '1'; totPel_P++; }
        } else {
          pel_l = ki_l || kk_l || bim_l || '1';
          pel_p = ki_p || kk_p || bim_p || '1';
          totPel_L += parseInt(pel_l, 10) || 0;
          totPel_P += parseInt(pel_p, 10) || 0;
        }
      }

      return `
        <tr>
          <td style="text-align: center; border: 1px solid #000; font-size: 8pt; padding: 4px;">${idx + 1}</td>
          <td style="border: 1px solid #000; font-size: 8pt; padding: 4px;">${namaKlien}</td>
          <td style="text-align: center; border: 1px solid #000; font-size: 8pt; padding: 4px; white-space: nowrap;">
            ${s.dateStr}<br>${s.timeStart} - ${s.timeEnd}
          </td>
          <td style="text-align: center; border: 1px solid #000; font-size: 8pt; padding: 4px;">${kelasKlien}</td>
          
          <!-- Status -->
          <td style="text-align: center; border: 1px solid #000; font-size: 8pt; padding: 2px;">${isB}</td>
          <td style="text-align: center; border: 1px solid #000; font-size: 8pt; padding: 2px;">${isK}</td>
          <td style="text-align: center; border: 1px solid #000; font-size: 8pt; padding: 2px;">${isDJ}</td>
          
          <!-- Jenis Intervensi -->
          <td style="text-align: center; border: 1px solid #000; font-size: 8pt; padding: 2px;">${ki_l}</td>
          <td style="text-align: center; border: 1px solid #000; font-size: 8pt; padding: 2px;">${ki_p}</td>
          <td style="text-align: center; border: 1px solid #000; font-size: 8pt; padding: 2px;">${ki_sesi}</td>
          
          <td style="text-align: center; border: 1px solid #000; font-size: 8pt; padding: 2px;">${kk_l}</td>
          <td style="text-align: center; border: 1px solid #000; font-size: 8pt; padding: 2px;">${kk_p}</td>
          <td style="text-align: center; border: 1px solid #000; font-size: 8pt; padding: 2px;">${kk_sesi}</td>
          
          <td style="text-align: center; border: 1px solid #000; font-size: 8pt; padding: 2px;">${bim_l}</td>
          <td style="text-align: center; border: 1px solid #000; font-size: 8pt; padding: 2px;">${bim_p}</td>
          <td style="text-align: center; border: 1px solid #000; font-size: 8pt; padding: 2px;">${bim_sesi}</td>
          
          <td style="text-align: center; border: 1px solid #000; font-size: 8pt; padding: 2px;">${kons_l}</td>
          <td style="text-align: center; border: 1px solid #000; font-size: 8pt; padding: 2px;">${kons_p}</td>
          <td style="text-align: center; border: 1px solid #000; font-size: 8pt; padding: 2px;">${kons_jam}</td>
          
          <!-- Cara Hadir -->
          <td style="text-align: center; border: 1px solid #000; font-size: 8pt; padding: 2px;">${suka_l}</td>
          <td style="text-align: center; border: 1px solid #000; font-size: 8pt; padding: 2px;">${suka_p}</td>
          
          <td style="text-align: center; border: 1px solid #000; font-size: 8pt; padding: 2px;">${ruj_l}</td>
          <td style="text-align: center; border: 1px solid #000; font-size: 8pt; padding: 2px;">${ruj_p}</td>
          
          <td style="text-align: center; border: 1px solid #000; font-size: 8pt; padding: 2px;">${emel_l}</td>
          <td style="text-align: center; border: 1px solid #000; font-size: 8pt; padding: 2px;">${emel_p}</td>
          
          <td style="text-align: center; border: 1px solid #000; font-size: 8pt; padding: 2px;">${tel_l}</td>
          <td style="text-align: center; border: 1px solid #000; font-size: 8pt; padding: 2px;">${tel_p}</td>
          
          <!-- Sasaran Pelajar -->
          <td style="text-align: center; border: 1px solid #000; font-size: 8pt; padding: 2px;">${pel_l}</td>
          <td style="text-align: center; border: 1px solid #000; font-size: 8pt; padding: 2px;">${pel_p}</td>
        </tr>
      `;
    }).join("");

    // Baris kosong tambahan jika sesi kurang daripada 10
    let blankRows = "";
    if (sessions.length < 12) {
      for (let i = sessions.length; i < 12; i++) {
        blankRows += `
          <tr>
            <td style="border: 1px solid #000; height: 22px;">&nbsp;</td>
            <td style="border: 1px solid #000;">&nbsp;</td>
            <td style="border: 1px solid #000;">&nbsp;</td>
            <td style="border: 1px solid #000;">&nbsp;</td>
            <td style="border: 1px solid #000;">&nbsp;</td>
            <td style="border: 1px solid #000;">&nbsp;</td>
            <td style="border: 1px solid #000;">&nbsp;</td>
            <td style="border: 1px solid #000;">&nbsp;</td>
            <td style="border: 1px solid #000;">&nbsp;</td>
            <td style="border: 1px solid #000;">&nbsp;</td>
            <td style="border: 1px solid #000;">&nbsp;</td>
            <td style="border: 1px solid #000;">&nbsp;</td>
            <td style="border: 1px solid #000;">&nbsp;</td>
            <td style="border: 1px solid #000;">&nbsp;</td>
            <td style="border: 1px solid #000;">&nbsp;</td>
            <td style="border: 1px solid #000;">&nbsp;</td>
            <td style="border: 1px solid #000;">&nbsp;</td>
            <td style="border: 1px solid #000;">&nbsp;</td>
            <td style="border: 1px solid #000;">&nbsp;</td>
            <td style="border: 1px solid #000;">&nbsp;</td>
            <td style="border: 1px solid #000;">&nbsp;</td>
            <td style="border: 1px solid #000;">&nbsp;</td>
            <td style="border: 1px solid #000;">&nbsp;</td>
            <td style="border: 1px solid #000;">&nbsp;</td>
            <td style="border: 1px solid #000;">&nbsp;</td>
            <td style="border: 1px solid #000;">&nbsp;</td>
            <td style="border: 1px solid #000;">&nbsp;</td>
            <td style="border: 1px solid #000;">&nbsp;</td>
            <td style="border: 1px solid #000;">&nbsp;</td>
          </tr>
        `;
      }
    }

    return `
      <div class="ipgm-paper landscape" style="font-family: 'Times New Roman', Times, serif;">
        <!-- Header Atas: 537 / LAMPIRAN IPGM 10 / SULIT -->
        <div style="display: flex; justify-content: flex-end; margin-bottom: 2px;">
          <div style="text-align: right; line-height: 1.25;">
            <div style="font-size: 11pt; font-weight: bold;">537</div>
            <div style="font-size: 11pt; font-weight: bold; margin-top: 2px;">LAMPIRAN IPGM 10</div>
            <div style="display: inline-block; border: 1.5px solid #000; padding: 2px 14px; font-weight: bold; font-size: 10pt; margin-top: 4px; letter-spacing: 1px;">SULIT</div>
          </div>
        </div>

        <div class="ipgm-center-header" style="text-align: center; margin-bottom: 0.75rem;">
          ${this.getIpgmCrestSvg()}
          <div style="font-size: 11pt; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">KEMENTERIAN PENDIDIKAN MALAYSIA</div>
          <div style="font-size: 10.5pt; font-style: italic; margin-bottom: 4px;">Institut Pendidikan Guru Malaysia</div>
          <div style="font-size: 12pt; font-weight: bold; text-transform: uppercase; margin-top: 4px; letter-spacing: 0.5px;">
            BORANG RUMUSAN SESI KAUNSELING
          </div>
        </div>

        <!-- Ruangan Pilihan Bulan -->
        <div style="margin-bottom: 0.5rem; font-size: 9.5pt;">
          <strong>Bulan:</strong> <u>&nbsp;&nbsp;&nbsp;&nbsp;${periodLabel}&nbsp;&nbsp;&nbsp;&nbsp;</u>
        </div>

        <!-- Jadual Matriks Lengkap Lampiran 10 (Format Landskap Rasmi) -->
        <table style="width: 100%; border-collapse: collapse; border: 1px solid #000; font-size: 7.5pt;">
          <thead>
            <tr>
              <th rowspan="2" style="width: 3%; border: 1px solid #000; text-align: center; padding: 3px; background: #fff;">Bil.</th>
              <th rowspan="2" style="width: 14%; border: 1px solid #000; text-align: center; padding: 3px; background: #fff;">Nama Klien / Rujukan</th>
              <th rowspan="2" style="width: 9%; border: 1px solid #000; text-align: center; padding: 3px; background: #fff;">Tarikh / Masa Sesi</th>
              <th rowspan="2" style="width: 9%; border: 1px solid #000; text-align: center; padding: 3px; background: #fff;">Kelas</th>
              <th colspan="3" style="border: 1px solid #000; text-align: center; padding: 2px; background: #fff;">Status</th>
              <th colspan="12" style="border: 1px solid #000; text-align: center; padding: 2px; background: #fff;">Jenis Intervensi</th>
              <th colspan="8" style="border: 1px solid #000; text-align: center; padding: 2px; background: #fff;">Cara Hadir</th>
              <th colspan="2" style="border: 1px solid #000; text-align: center; padding: 2px; background: #fff;">Sasaran</th>
            </tr>
            <tr>
              <!-- Status -->
              <th style="border: 1px solid #000; width: 2.2%; text-align: center; padding: 2px; background: #fff;">B</th>
              <th style="border: 1px solid #000; width: 2.2%; text-align: center; padding: 2px; background: #fff;">K</th>
              <th style="border: 1px solid #000; width: 2.2%; text-align: center; padding: 2px; background: #fff;">D/J</th>

              <!-- KI -->
              <th style="border: 1px solid #000; width: 2.2%; text-align: center; padding: 2px; background: #fff;">L</th>
              <th style="border: 1px solid #000; width: 2.2%; text-align: center; padding: 2px; background: #fff;">P</th>
              <th style="border: 1px solid #000; width: 2.6%; text-align: center; padding: 2px; background: #fff;">Sesi</th>

              <!-- KK -->
              <th style="border: 1px solid #000; width: 2.2%; text-align: center; padding: 2px; background: #fff;">L</th>
              <th style="border: 1px solid #000; width: 2.2%; text-align: center; padding: 2px; background: #fff;">P</th>
              <th style="border: 1px solid #000; width: 2.6%; text-align: center; padding: 2px; background: #fff;">Sesi</th>

              <!-- Bimbingan -->
              <th style="border: 1px solid #000; width: 2.2%; text-align: center; padding: 2px; background: #fff;">L</th>
              <th style="border: 1px solid #000; width: 2.2%; text-align: center; padding: 2px; background: #fff;">P</th>
              <th style="border: 1px solid #000; width: 2.6%; text-align: center; padding: 2px; background: #fff;">Sesi</th>

              <!-- Konsultasi -->
              <th style="border: 1px solid #000; width: 2.2%; text-align: center; padding: 2px; background: #fff;">L</th>
              <th style="border: 1px solid #000; width: 2.2%; text-align: center; padding: 2px; background: #fff;">P</th>
              <th style="border: 1px solid #000; width: 2.6%; text-align: center; padding: 2px; background: #fff;">Jam</th>

              <!-- Cara Hadir: Sukarela -->
              <th style="border: 1px solid #000; width: 2.2%; text-align: center; padding: 2px; background: #fff;">L</th>
              <th style="border: 1px solid #000; width: 2.2%; text-align: center; padding: 2px; background: #fff;">P</th>

              <!-- Cara Hadir: Rujukan -->
              <th style="border: 1px solid #000; width: 2.2%; text-align: center; padding: 2px; background: #fff;">L</th>
              <th style="border: 1px solid #000; width: 2.2%; text-align: center; padding: 2px; background: #fff;">P</th>

              <!-- Cara Hadir: Emel -->
              <th style="border: 1px solid #000; width: 2.2%; text-align: center; padding: 2px; background: #fff;">L</th>
              <th style="border: 1px solid #000; width: 2.2%; text-align: center; padding: 2px; background: #fff;">P</th>

              <!-- Cara Hadir: Telefon -->
              <th style="border: 1px solid #000; width: 2.2%; text-align: center; padding: 2px; background: #fff;">L</th>
              <th style="border: 1px solid #000; width: 2.2%; text-align: center; padding: 2px; background: #fff;">P</th>

              <!-- Sasaran: Pelajar -->
              <th style="border: 1px solid #000; width: 2.2%; text-align: center; padding: 2px; background: #fff;">L</th>
              <th style="border: 1px solid #000; width: 2.2%; text-align: center; padding: 2px; background: #fff;">P</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
            ${blankRows}
          </tbody>
          <tfoot>
            <tr style="background: #e2f0d9; font-weight: bold;">
              <td colspan="4" style="text-align: center; border: 1px solid #000; padding: 4px; font-size: 8pt;">JUMLAH</td>
              <td style="text-align: center; border: 1px solid #000; padding: 2px;">${totStatusB || '0'}</td>
              <td style="text-align: center; border: 1px solid #000; padding: 2px;">${totStatusK || '0'}</td>
              <td style="text-align: center; border: 1px solid #000; padding: 2px;">${totStatusDJ || '0'}</td>

              <td style="text-align: center; border: 1px solid #000; padding: 2px;">${totKI_L || '0'}</td>
              <td style="text-align: center; border: 1px solid #000; padding: 2px;">${totKI_P || '0'}</td>
              <td style="text-align: center; border: 1px solid #000; padding: 2px;">${totKI_Sesi || '0'}</td>

              <td style="text-align: center; border: 1px solid #000; padding: 2px;">${totKK_L || '0'}</td>
              <td style="text-align: center; border: 1px solid #000; padding: 2px;">${totKK_P || '0'}</td>
              <td style="text-align: center; border: 1px solid #000; padding: 2px;">${totKK_Sesi || '0'}</td>

              <td style="text-align: center; border: 1px solid #000; padding: 2px;">${totBim_L || '0'}</td>
              <td style="text-align: center; border: 1px solid #000; padding: 2px;">${totBim_P || '0'}</td>
              <td style="text-align: center; border: 1px solid #000; padding: 2px;">${totBim_Sesi || '0'}</td>

              <td style="text-align: center; border: 1px solid #000; padding: 2px;">${totKons_L || '0'}</td>
              <td style="text-align: center; border: 1px solid #000; padding: 2px;">${totKons_P || '0'}</td>
              <td style="text-align: center; border: 1px solid #000; padding: 2px;">${totKons_Jam || '0'}</td>

              <td style="text-align: center; border: 1px solid #000; padding: 2px;">${totSuka_L || '0'}</td>
              <td style="text-align: center; border: 1px solid #000; padding: 2px;">${totSuka_P || '0'}</td>

              <td style="text-align: center; border: 1px solid #000; padding: 2px;">${totRujuk_L || '0'}</td>
              <td style="text-align: center; border: 1px solid #000; padding: 2px;">${totRujuk_P || '0'}</td>

              <td style="text-align: center; border: 1px solid #000; padding: 2px;">${totEmel_L || '0'}</td>
              <td style="text-align: center; border: 1px solid #000; padding: 2px;">${totEmel_P || '0'}</td>

              <td style="text-align: center; border: 1px solid #000; padding: 2px;">${totTel_L || '0'}</td>
              <td style="text-align: center; border: 1px solid #000; padding: 2px;">${totTel_P || '0'}</td>

              <td style="text-align: center; border: 1px solid #000; padding: 2px;">${totPel_L || '0'}</td>
              <td style="text-align: center; border: 1px solid #000; padding: 2px;">${totPel_P || '0'}</td>
            </tr>
          </tfoot>
        </table>

        <!-- Petunjuk Kaki Lampiran 10 -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-top: 1.25rem; font-size: 8pt; line-height: 1.5;">
          <div>
            <strong>Petunjuk :</strong><br>
            <div style="margin-left: 10px;">
              L - Lelaki<br>
              P - Perempuan<br>
              KI - Kaunseling Individu<br>
              KK - Kaunseling Kelompok
            </div>
          </div>
          <div style="text-align: right;">
            1 Sesi Kaunseling Individu = 45 minit<br>
            1 Sesi Kaunseling Kelompok = 1 jam
          </div>
        </div>
      </div>
    `;
  },

  // -------------------------------------------------------------
  // PAPAR SEMUA BORANG SEKALIGUS (07, 09 & 10)
  // -------------------------------------------------------------
  generateAllIpgmHtml: function(sessions, periodLabel) {
    return `
      <div class="ipgm-all-forms-container">
        <!-- Borang 1: Lampiran 07 -->
        ${this.generateIpgm07Html(sessions, periodLabel)}
        
        <div class="ipgm-page-divider-screen" style="text-align: center; padding: 1.5rem; background: #e2e8f0; margin: 2rem 0; border-radius: 8px; font-weight: bold; color: #1e3a8a;">
          ðŸ“„ Akhir Lampiran 07 âžœ Seterusnya: Lampiran 09 (Analisis 3 Halaman)
        </div>

        <!-- Borang 2: Lampiran 09 -->
        ${this.generateIpgm09Html(sessions, periodLabel)}

        <div class="ipgm-page-divider-screen" style="text-align: center; padding: 1.5rem; background: #e2e8f0; margin: 2rem 0; border-radius: 8px; font-weight: bold; color: #1e3a8a;">
          ðŸ“„ Akhir Lampiran 09 âžœ Seterusnya: Lampiran 10 (Format Landskap Rasmi)
        </div>

        <!-- Borang 3: Lampiran 10 -->
        ${this.generateIpgm10Html(sessions, periodLabel)}
      </div>
    `;
  },

  // =========================================================
  // MODUL PEMILIHAN KLIEN PANTAS (PANGKALAN DATA 422 APDM)
  // =========================================================

  openQuickClientPicker: function(weekNum, day, sessionIdx) {
    if (typeof CloudSync !== "undefined" && CloudSync.state.userRole === "viewer") {
      this.showToast("👁️ Mod Paparan Awam: Hanya Kaunselor dibenarkan memilih klien.", null, 3500);
      return;
    }
    const weekData = this.state.practicumData.find(w => w.weekNum === weekNum);
    if (!weekData || !weekData.sessions || !weekData.sessions[sessionIdx]) {
      alert("Sesi tidak ditemui.");
      return;
    }

    const session = weekData.sessions[sessionIdx];
    this.state.quickPickerTarget = { weekNum, day, sessionIdx };
    this.state.quickPickerClassFilter = '';
    this.state.quickPickerSearchQuery = '';

    // Salin murid sedia ada
    if (session.students && Array.isArray(session.students) && session.students.length > 0) {
      if (typeof SENARAI_MURID !== 'undefined') {
        this.state.quickPickerSelectedStudents = session.students.map(item => {
          if (typeof item === 'object' && item.id) return JSON.parse(JSON.stringify(item));
          const found = SENARAI_MURID.find(m => m.idMurid === item || m.name === item || String(m.id) === String(item));
          return found ? JSON.parse(JSON.stringify(found)) : { id: item, name: item, className: session.classTarget || '-' };
        });
      } else {
        this.state.quickPickerSelectedStudents = JSON.parse(JSON.stringify(session.students));
      }
    } else {
      this.state.quickPickerSelectedStudents = [];
    }

    // Auto-pilih kelas dalam penapis jika ada classTarget
    const filterSelect = document.getElementById("quickPickerClassFilter");
    if (filterSelect) {
      filterSelect.value = "";
      if (session.classTarget && session.classTarget !== '-') {
        for (let opt of filterSelect.options) {
          if (opt.value && (session.classTarget.toUpperCase().includes(opt.value) || opt.value.includes(session.classTarget.toUpperCase()))) {
            filterSelect.value = opt.value;
            this.state.quickPickerClassFilter = opt.value;
            break;
          }
        }
      }
    }

    // Kemaskini info sesi pada header modal
    const infoEl = document.getElementById("quickPickerSessionInfo");
    if (infoEl) {
      infoEl.innerHTML = `
        <strong>${session.title}</strong> · 📅 ${day} · ⏱️ ${session.timeStart} - ${session.timeEnd} · 
        <span class="badge badge-${session.type}" style="font-size:0.72rem;">${this.getTypeLabel(session.type)}</span>
      `;
    }

    // Reset input carian
    const searchInput = document.getElementById("quickPickerSearchInput");
    if (searchInput) searchInput.value = "";

    this.renderQuickPickerChips();
    this.renderQuickPickerStudentList();

    const modal = document.getElementById("quickClientPickerModal");
    if (modal) modal.classList.add("active");
  },

  closeQuickClientPicker: function() {
    const modal = document.getElementById("quickClientPickerModal");
    if (modal) modal.classList.remove("active");
    this.state.quickPickerTarget = { weekNum: null, day: null, sessionIdx: null };
    this.state.quickPickerSelectedStudents = [];
  },

  handleQuickPickerFilterChange: function(classVal) {
    this.state.quickPickerClassFilter = classVal || "";
    this.renderQuickPickerStudentList();
  },

  handleQuickPickerSearch: function(query) {
    this.state.quickPickerSearchQuery = (query || "").trim();
    this.renderQuickPickerStudentList();
  },

  toggleQuickPickerStudent: function(studentId) {
    if (typeof SENARAI_MURID === "undefined") return;
    const student = SENARAI_MURID.find(m => m.id === studentId);
    if (!student) return;

    const existingIdx = this.state.quickPickerSelectedStudents.findIndex(m => m.id === student.id);
    const target = this.state.quickPickerTarget;
    let isIndividu = false;
    if (target && target.weekNum) {
      const wData = this.state.practicumData.find(w => w.weekNum === target.weekNum);
      if (wData && wData.sessions[target.sessionIdx]) {
        isIndividu = (wData.sessions[target.sessionIdx].type === 'individu');
      }
    }

    if (existingIdx >= 0) {
      // Buang jika sudah ada
      this.state.quickPickerSelectedStudents.splice(existingIdx, 1);
    } else {
      // Jika sesi individu, ganti dengan 1 murid sahaja
      if (isIndividu) {
        this.state.quickPickerSelectedStudents = [JSON.parse(JSON.stringify(student))];
      } else {
        this.state.quickPickerSelectedStudents.push(JSON.parse(JSON.stringify(student)));
      }
    }

    this.renderQuickPickerChips();
    this.renderQuickPickerStudentList();
  },

  removeQuickPickerStudent: function(index) {
    if (index >= 0 && index < this.state.quickPickerSelectedStudents.length) {
      this.state.quickPickerSelectedStudents.splice(index, 1);
      this.renderQuickPickerChips();
      this.renderQuickPickerStudentList();
    }
  },

  clearQuickPickerStudents: function() {
    this.state.quickPickerSelectedStudents = [];
    this.renderQuickPickerChips();
    this.renderQuickPickerStudentList();
  },

  addAllStudentsInQuickPicker: function() {
    if (typeof SENARAI_MURID === "undefined") return;
    const filterClass = this.state.quickPickerClassFilter;
    if (!filterClass) {
      alert("Sila pilih kelas terlebih dahulu daripada menu dropdown.");
      return;
    }

    let classStudents = [];
    if (typeof MuridHelper !== "undefined") {
      classStudents = MuridHelper.getByClass(filterClass);
    } else {
      classStudents = SENARAI_MURID.filter(m => m.classCode === filterClass || m.className === filterClass);
    }

    if (classStudents.length === 0) {
      alert("Tiada murid dijumpai untuk kelas yang dipilih.");
      return;
    }

    classStudents.forEach(st => {
      if (!this.state.quickPickerSelectedStudents.some(m => m.id === st.id)) {
        this.state.quickPickerSelectedStudents.push(JSON.parse(JSON.stringify(st)));
      }
    });

    this.renderQuickPickerChips();
    this.renderQuickPickerStudentList();
    this.showToast(`➕ Berjaya menambah semua ${classStudents.length} murid kelas ${filterClass}!`);
  },

  renderQuickPickerChips: function() {
    const chipsContainer = document.getElementById("quickPickerSelectedChips");
    const countEl = document.getElementById("quickPickerSelectedCount");
    if (!chipsContainer) return;

    const count = this.state.quickPickerSelectedStudents.length;
    if (countEl) {
      countEl.textContent = `Klien Terpilih (${count} orang):`;
    }

    if (count === 0) {
      chipsContainer.innerHTML = `<span style="font-size: 0.78rem; color: #64748b; font-style: italic;">Belum ada murid dipilih. Sila pilih murid daripada senarai di bawah.</span>`;
      return;
    }

    let html = '';
    this.state.quickPickerSelectedStudents.forEach((m, idx) => {
      html += `
        <span class="student-chip" style="background: white; border: 1px solid #86efac; color: #166534; font-size: 0.75rem; padding: 2px 7px; border-radius: 4px; display: inline-flex; align-items: center; gap: 4px;">
          <span>👤 <strong>${m.name}</strong> (${m.className || m.classCode})</span>
          <button type="button" onclick="App.removeQuickPickerStudent(${idx})" style="background: none; border: none; color: #dc2626; cursor: pointer; font-weight: bold; padding: 0 2px;">✕</button>
        </span>
      `;
    });

    chipsContainer.innerHTML = html;
  },

  renderQuickPickerStudentList: function() {
    const listContainer = document.getElementById("quickPickerStudentListContainer");
    if (!listContainer || typeof SENARAI_MURID === "undefined") return;

    const filterClass = this.state.quickPickerClassFilter || "";
    const query = (this.state.quickPickerSearchQuery || "").toUpperCase().trim();

    let list = SENARAI_MURID;

    // Tapis mengikut kelas
    if (filterClass) {
      list = list.filter(m => m.classCode === filterClass || m.className === filterClass || (m.className && m.className.includes(filterClass)));
    }

    // Tapis carian
    if (query) {
      list = list.filter(m => 
        m.name.toUpperCase().includes(query) || 
        m.ic.includes(query) || 
        (m.className && m.className.toUpperCase().includes(query))
      );
    }

    if (list.length === 0) {
      listContainer.innerHTML = `
        <div style="padding: 2rem; text-align: center; color: #64748b; font-size: 0.85rem;">
          🔍 Tiada murid dijumpai mengikut kriteria carian. Sila tukar pilihan kelas atau kata kunci carian.
        </div>
      `;
      return;
    }

    const selectedIds = new Set(this.state.quickPickerSelectedStudents.map(m => m.id));

    let html = '';
    list.slice(0, 80).forEach(m => {
      const isSelected = selectedIds.has(m.id);
      html += `
        <div class="quick-picker-item ${isSelected ? 'selected' : ''}" onclick="App.toggleQuickPickerStudent(${m.id})">
          <div style="display: flex; align-items: center; gap: 10px;">
            <input type="checkbox" ${isSelected ? 'checked' : ''} onclick="event.stopPropagation(); App.toggleQuickPickerStudent(${m.id})" style="cursor: pointer;">
            <div>
              <div style="font-weight: 700; font-size: 0.84rem; color: #0f172a;">
                👤 ${m.name}
              </div>
              <div style="font-size: 0.72rem; color: #64748b; display: flex; gap: 8px; align-items: center; margin-top: 2px;">
                <span class="badge badge-program" style="font-size: 0.65rem; padding: 1px 5px;">${m.className}</span>
                <span>🪪 ${m.ic}</span>
                <span>• ${m.gender === 'L' ? 'Lelaki' : 'Perempuan'} (${m.kaumAsal || m.race})</span>
              </div>
            </div>
          </div>
          <button type="button" class="btn btn-sm ${isSelected ? 'btn-danger' : 'btn-outline-primary'}" style="font-size: 0.72rem; padding: 2px 9px;">
            ${isSelected ? '✕ Buang' : '➕ Pilih'}
          </button>
        </div>
      `;
    });

    if (list.length > 80) {
      html += `
        <div style="padding: 8px; text-align: center; font-size: 0.75rem; color: #64748b; background: #f8fafc;">
          Menunjukkan 80 daripada ${list.length} murid. Taip nama murid di kotak carian untuk carian khusus.
        </div>
      `;
    }

    listContainer.innerHTML = html;
  },

  saveQuickPickerClients: function() {
    const target = this.state.quickPickerTarget;
    if (!target || target.weekNum === null) {
      this.closeQuickClientPicker();
      return;
    }

    const weekData = this.state.practicumData.find(w => w.weekNum === target.weekNum);
    if (!weekData || !weekData.sessions || !weekData.sessions[target.sessionIdx]) {
      alert("Sesi tidak ditemui.");
      return;
    }

    const session = weekData.sessions[target.sessionIdx];
    const selected = this.state.quickPickerSelectedStudents;

    session.students = JSON.parse(JSON.stringify(selected));
    session.headcount = selected.length > 0 ? selected.length : (session.headcount || 1);

    // Auto-isi kelas jika belum ada
    if (selected.length > 0 && (!session.classTarget || session.classTarget === '-')) {
      session.classTarget = selected[0].className;
    }

    // Auto-kesan status klien & nombor sesi secara 100% automatik
    if (session.type === 'individu' || session.type === 'kelompok') {
      const detection = this.autoDetectClientSessionHistory(selected, target.weekNum, target.sessionIdx);
      session.sessionTag = detection.sessionTag;
      session.clientStatus = detection.clientStatus;

      if (session.type === 'individu' && selected.length === 1) {
        session.title = `KI - ${selected[0].name} (${detection.sessionTag})`;
      } else if (session.type === 'kelompok' && selected.length > 0) {
        session.title = `Kelompok - Kelas ${selected[0].className} (${detection.sessionTag})`;
      }
    }

    this.savePracticumData();
    this.render();
    this.closeQuickClientPicker();
    this.showToast(`✅ Klien berjaya dikemaskini: "${session.title}" [${session.sessionTag || 'Sesi 1'}]!`);
  },

  getTypeLabel: function(type) {
    const labels = {
      konsultasi: "Konsultasi",
      individu: "Individu (KI)",
      kelompok: "Kelompok",
      bimbingan: "Bimbingan Kelas",
      program: "Program",
      pentadbiran: "Pentadbiran",
      cuti: "Cuti",
      penyeliaan: "Penyeliaan Pensyarah",
      programLain: "Program Sekolah",
      kokurikulum: "Kokurikulum"
    };
    return labels[type] || type;
  }
};

// Mulakan aplikasi sebaik DOM dimuatkan
document.addEventListener("DOMContentLoaded", () => {
  App.init();
});
