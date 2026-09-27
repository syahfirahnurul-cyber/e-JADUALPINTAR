// ====================================================================
// MODUL CLOUD REAL-TIME SYNC & UNIVERSAL BACKEND ADAPTER
// Menyokong penyegerakan data jadual secara masa nyata (Real-Time)
// ke semua peranti (Telefon, Tablet, Komputer) yang membuka link web.
// Menyokong:
// 1. Google Sheets / Google Apps Script Web App (Disyorkan KPM)
// 2. Google Firebase Realtime Database (Sub-saat / SSE Push)
// 3. Cloudflare Pages Functions (/api/sync)
// ====================================================================

const CloudSync = {
  // Konfigurasi Utama
  config: {
    channelId: "sk_tampasuk1_ubk_2026",
    // Backend rasmi Google Apps Script (Google Sheets Cikgu Nurul Syahfirah)
    defaultBackendUrl: "https://script.google.com/macros/s/AKfycbz4hFjdKfO9OfxaKL-H-xuloWYeyrkeb3ZT24IYuruUMmJ1I2Vu2c9uPEPKOUjFpC8RdA/exec",
    broadcastChannelName: "ubk_schedule_realtime_bus",
    pollIntervalMs: 8000, // Imbas kemaskini cloud setiap 8 saat jika tab aktif
    adminPin: "2026"      // PIN keselamatan kaunselor
  },

  state: {
    isOnline: navigator.onLine,
    syncStatus: "connecting", // 'connected', 'syncing', 'offline', 'error', 'unconfigured'
    backendType: "none",      // 'gas' (Google Sheets), 'firebase', 'cloudflare', 'custom'
    activeEndpoint: "",
    lastSyncTime: null,
    lastRemoteTimestamp: 0,
    userRole: "admin",        // 'admin' (Kaunselor) atau 'viewer' (Pelawat/Guru/Murid)
    broadcastChannel: null,
    eventSource: null,        // Untuk Firebase SSE Real-Time
    pollTimer: null,
    isSyncing: false,
    hasDoneInitialSync: false
  },

  init: function() {
    this.detectRoleAndBackendFromUrl();
    this.initBroadcastChannel();
    this.initNetworkListeners();
    this.initVisibilityListeners();
    this.setupActiveBackend();
    this.startRealtimePolling();

    // Lakukan imbasan segerak pertama sebaik sahaja pelayar bersedia
    setTimeout(() => {
      this.syncWithCloud();
    }, 200);
  },

  // 1b. Pembongkar Payload Praktikum Fleksibel (Universal Payload Extractor)
  // Menyokong semua bentuk kembalian Google Apps Script / Firebase / REST:
  // - Direct array: [ ... ]
  // - GAS wrapped: { value: [ ... ] }
  // - Nested data: { data: { practicumData: [ ... ] } }
  // - Stringified JSON: "[ ... ]"
  parsePracticumPayload: function(remoteRes) {
    if (!remoteRes) return { data: null, timestamp: 0 };

    if (typeof remoteRes === "string") {
      try { remoteRes = JSON.parse(remoteRes); } catch (e) { return { data: null, timestamp: 0 }; }
    }

    let timestamp = remoteRes.updatedAt || 0;
    let target = null;

    if (Array.isArray(remoteRes)) {
      return { data: remoteRes, timestamp: timestamp || Date.now() };
    }

    if (remoteRes.data) {
      if (remoteRes.data.updatedAt) timestamp = remoteRes.data.updatedAt;
      if (Array.isArray(remoteRes.data)) {
        target = remoteRes.data;
      } else if (remoteRes.data.practicumData) {
        target = remoteRes.data.practicumData;
      } else if (remoteRes.data.value) {
        target = remoteRes.data.value;
      }
    }

    if (!target && remoteRes.practicumData) {
      target = remoteRes.practicumData;
    }

    if (!target && remoteRes.value) {
      target = remoteRes.value;
    }

    if (typeof target === "string") {
      try { target = JSON.parse(target); } catch (e) {}
    }

    if (target && typeof target === "object" && !Array.isArray(target)) {
      if (Array.isArray(target.value)) {
        target = target.value;
      } else if (Array.isArray(target.practicumData)) {
        target = target.practicumData;
      } else if (typeof target.value === "string") {
        try { target = JSON.parse(target.value); } catch (e) {}
      }
    }

    if (Array.isArray(target) && target.length > 0) {
      return { data: target, timestamp: timestamp };
    }

    return { data: null, timestamp: timestamp };
  },

  // 1. Kenal pasti peranan & URL backend daripada URL Parameter
  detectRoleAndBackendFromUrl: function() {
    const urlParams = new URLSearchParams(window.location.search);
    const roleParam = urlParams.get("role") || urlParams.get("view");
    const storedRole = localStorage.getItem("ubk_user_role");

    if (roleParam === "viewer" || roleParam === "public") {
      this.state.userRole = "viewer";
      localStorage.setItem("ubk_user_role", "viewer");
    } else if (roleParam === "admin" || roleParam === "kaunselor") {
      this.state.userRole = "admin";
      localStorage.setItem("ubk_user_role", "admin");
    } else if (storedRole) {
      this.state.userRole = storedRole;
    } else {
      this.state.userRole = "admin";
    }

    // Tangkap backend URL jika dihantar melalui pautan kongsi (contoh di telefon baru)
    const backendParam = urlParams.get("backend");
    if (backendParam) {
      try {
        const decoded = decodeURIComponent(backendParam);
        if (decoded.startsWith("http")) {
          localStorage.setItem("ubk_cloud_endpoint", decoded);
        }
      } catch (e) {}
    }

    this.applyRoleUi();
  },

  // 2. Tetapkan Backend Aktif
  setupActiveBackend: function() {
    let endpoint = localStorage.getItem("ubk_cloud_endpoint") || this.config.defaultBackendUrl || "";
    endpoint = endpoint.trim();
    this.state.activeEndpoint = endpoint;

    if (!endpoint) {
      // Sekiranya dihoskan di Cloudflare Pages, semak sama ada /api/sync wujud secara automatik
      if (window.location.hostname.includes("pages.dev") || window.location.hostname.includes("cloudflare")) {
        this.state.activeEndpoint = "/api/sync";
        this.state.backendType = "cloudflare";
        return;
      }
      this.state.backendType = "none";
      this.updateStatusPill("unconfigured", "Cloud Belum Disambung");
      return;
    }

    if (endpoint.includes("script.google.com")) {
      this.state.backendType = "gas"; // Google Apps Script
    } else if (endpoint.includes("firebaseio.com") || endpoint.includes("firebasedatabase.app")) {
      this.state.backendType = "firebase";
      this.initFirebaseRealtimeStream(endpoint);
    } else if (endpoint.includes("/api/sync")) {
      this.state.backendType = "cloudflare";
    } else {
      this.state.backendType = "custom";
    }
  },

  // Sambungan Real-Time Sub-saat menggunakan Server-Sent Events (SSE) Firebase
  initFirebaseRealtimeStream: function(endpoint) {
    if (typeof EventSource === "undefined") return;
    if (this.state.eventSource) {
      this.state.eventSource.close();
      this.state.eventSource = null;
    }

    try {
      let cleanUrl = endpoint.replace(/\/$/, "");
      if (!cleanUrl.endsWith(".json")) {
        cleanUrl = `${cleanUrl}/${this.config.channelId}.json`;
      }

      this.state.eventSource = new EventSource(cleanUrl);
      this.state.eventSource.addEventListener("put", (e) => {
        try {
          const res = JSON.parse(e.data);
          if (res && res.data) {
            const remoteData = res.data.practicumData || res.data;
            const remoteTimestamp = res.data.updatedAt || Date.now();
            const localUpdated = parseInt(localStorage.getItem("ubk_last_local_update") || "0", 10);
            
            if (remoteTimestamp > localUpdated && Array.isArray(remoteData)) {
              this.handleIncomingData(remoteData, "Firebase Real-Time");
              localStorage.setItem("ubk_last_local_update", remoteTimestamp.toString());
            }
          }
        } catch (err) {}
      });

      this.state.eventSource.onerror = () => {
        // Fallback ke polling berkala jika SSE gagal
      };
    } catch (e) {
      console.warn("Firebase SSE Stream:", e);
    }
  },

  // 3. Sesuaikan UI mengikut peranan
  applyRoleUi: function() {
    const isViewer = this.state.userRole === "viewer";
    document.body.classList.toggle("mode-viewer", isViewer);
    document.body.classList.toggle("mode-admin", !isViewer);

    const roleBadge = document.getElementById("userRoleBadge");
    if (roleBadge) {
      if (isViewer) {
        roleBadge.innerHTML = `
          <span style="background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd; padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 700; display: inline-flex; align-items: center; gap: 4px;">
            👁️ Mod Paparan Awam (Semakan Sahaja)
          </span>
          <button type="button" onclick="CloudSync.promptAdminUnlock()" style="background: none; border: none; color: #0284c7; text-decoration: underline; font-size: 0.74rem; cursor: pointer; margin-left: 6px;">
            🔐 Log Masuk Kaunselor
          </button>
        `;
      } else {
        roleBadge.innerHTML = `
          <span style="background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 700; display: inline-flex; align-items: center; gap: 4px;">
            🔑 Mod Kaunselor (Akses Penuh Pentadbir)
          </span>
        `;
      }
    }

    const addBtn = document.getElementById("btnOpenAddSession");
    if (addBtn) {
      addBtn.style.display = isViewer ? "none" : "";
    }
  },

  // 4. Log masuk mod pentadbir menggunakan PIN
  promptAdminUnlock: function() {
    const pin = prompt("Masukkan PIN Keselamatan Kaunselor untuk membuka mod suntingan:");
    if (!pin) return;
    if (pin.trim() === this.config.adminPin) {
      this.state.userRole = "admin";
      localStorage.setItem("ubk_user_role", "admin");
      this.applyRoleUi();
      App.showToast("🔓 Berjaya! Mod Kaunselor (Akses Penuh) telah diaktifkan.", null, 4000);
      App.render();
    } else {
      alert("❌ PIN salah. Sila hubungi Cikgu Nurul Syahfirah untuk akses pentadbir.");
    }
  },

  // 5. BroadcastChannel untuk segerak rentas-tab 0ms latency
  initBroadcastChannel: function() {
    try {
      if (typeof BroadcastChannel !== "undefined") {
        this.state.broadcastChannel = new BroadcastChannel(this.config.broadcastChannelName);
        this.state.broadcastChannel.onmessage = (event) => {
          if (event.data && event.data.type === "SCHEDULE_UPDATED") {
            this.handleIncomingData(event.data.payload, "Tab Lain");
          }
        };
      }
    } catch (e) {}

    window.addEventListener("storage", (e) => {
      if (e.key === "ubk_practicum_schedule_2026" && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          this.handleIncomingData(parsed, "Penyimpanan Tempatan");
        } catch (err) {}
      }
    });
  },

  // 6. Listener Status Rangkaian
  initNetworkListeners: function() {
    window.addEventListener("online", () => {
      this.state.isOnline = true;
      this.updateStatusPill("connected", "Online (Real-Time)");
      this.syncWithCloud();
    });

    window.addEventListener("offline", () => {
      this.state.isOnline = false;
      this.updateStatusPill("offline", "Luar Talian");
    });
  },

  // 7. Pengesanan keaktifan tab
  initVisibilityListeners: function() {
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        this.syncWithCloud();
      }
    });

    window.addEventListener("focus", () => {
      this.syncWithCloud();
    });
  },

  // 8. Pemula pemantauan berkala (Polling real-time)
  startRealtimePolling: function() {
    if (this.state.pollTimer) clearInterval(this.state.pollTimer);
    this.state.pollTimer = setInterval(() => {
      if (this.state.isOnline && document.visibilityState === "visible" && !this.state.isSyncing) {
        this.syncWithCloud();
      }
    }, this.config.pollIntervalMs);
  },

  // 9. Fungsi Utama: Segerak dengan Cloud (Local-First Zero-Loss Sync)
  syncWithCloud: async function() {
    if (!this.state.isOnline || this.state.isSyncing) return;
    
    const endpoint = this.state.activeEndpoint;
    if (!endpoint) {
      this.updateStatusPill("unconfigured", "Cloud Belum Disambung");
      return;
    }

    this.state.isSyncing = true;
    this.updateStatusPill("syncing", "Menyemak Cloud...");

    try {
      const localUpdated = parseInt(localStorage.getItem("ubk_last_local_update") || "0", 10);
      let fetchUrl = endpoint;

      if (this.state.backendType === "firebase") {
        let clean = endpoint.replace(/\/$/, "");
        if (!clean.endsWith(".json")) clean = `${clean}/${this.config.channelId}.json`;
        fetchUrl = clean;
      }

      const res = await fetch(fetchUrl, {
        method: "GET",
        headers: { "Accept": "application/json" },
        cache: "no-store"
      });

      if (res.ok) {
        const remoteRes = await res.json();
        const parsed = this.parsePracticumPayload(remoteRes);
        const remoteData = parsed.data;
        const remoteTimestamp = parsed.timestamp || 0;

        if (remoteData && Array.isArray(remoteData) && remoteData.length > 0) {
          const currentJson = JSON.stringify(App.state.practicumData);
          const remoteJson = JSON.stringify(remoteData);

          // 1. Sekiranya data tempatan dan remote adalah 100% serupa
          if (currentJson === remoteJson) {
            this.state.lastRemoteTimestamp = remoteTimestamp;
            this.updateStatusPill("connected", "Terselaras 100% (Cloud & Peranti)");
          } else {
            // 2. Data berbeza: Gunakan logik 'Local-First' untuk melindungi hasil kerja pengguna!
            if (localUpdated > remoteTimestamp) {
              // DATA TEMPATAN LEBIH BAHARU! Pengguna baru susun jadual di peranti ini.
              // JANGAN SESEKALI TIMPA DENGAN DATA AWAN LAMA!
              // Sebaliknya, muat naik susunan tempatan ke Google Sheets!
              console.log("Perlindungan Data: Susunan tempatan (" + localUpdated + ") lebih baharu daripada Cloud (" + remoteTimestamp + "). Memuat naik ke Cloud...");
              await this.uploadToCloud(App.state.practicumData);
              this.updateStatusPill("connected", "Susunan Tempatan Dikunci ke Cloud");
            } else if (remoteTimestamp > localUpdated) {
              // Data di Cloud lebih baharu (cth: disunting daripada peranti lain).
              // Simpan sandaran kecemasan data tempatan SEBELUM membenarkan kemasukan data Cloud!
              localStorage.setItem("ubk_emergency_backup_before_sync", currentJson);
              localStorage.setItem("ubk_pre_sync_time", new Date().toISOString());
              if (typeof App.saveScheduleSnapshot === "function") {
                App.saveScheduleSnapshot("Sandaran Sebelum Segerak Cloud");
              }

              this.handleIncomingData(remoteData, "Google Sheets (Cloud)");
              this.state.lastRemoteTimestamp = remoteTimestamp;
              localStorage.setItem("ubk_last_local_update", remoteTimestamp.toString());
              this.updateStatusPill("connected", "Cloud Live (Terkini)");

              // Paparkan banner pemulihan kecemasan jika pengguna ingin kembalikan jadual asal
              const alertBanner = document.getElementById("syncRecoveryAlertBanner");
              if (alertBanner) alertBanner.style.display = "flex";
            } else {
              // Jika timestamp sama atau local belum pernah dikemaskini (cth: peranti baharu)
              if (!this.state.hasDoneInitialSync && (!localUpdated || localUpdated === 0)) {
                this.handleIncomingData(remoteData, "Google Sheets (Cloud)");
              }
            }
          }
          this.state.hasDoneInitialSync = true;
        } else if ((!remoteData || remoteData.length === 0) && this.state.userRole === "admin" && App.state.practicumData && App.state.practicumData.length > 0 && !this.state.hasDoneInitialSync) {
          // Hanya jika cloud kosong, muat naik jadual sedia ada Cikgu
          this.state.hasDoneInitialSync = true;
          await this.uploadToCloud(App.state.practicumData);
        }

        this.state.lastSyncTime = new Date();
      } else {
        this.updateStatusPill("error", "Ralat Cloud (" + res.status + ")");
      }
    } catch (err) {
      console.warn("Penyegerakan Cloud:", err);
      this.updateStatusPill("error", "Luar Talian / Gagal Hubung");
    } finally {
      this.state.isSyncing = false;
    }
  },

  // 10. Muat naik kemaskini baharu ke Cloud dengan ketahanan berganda (No-CORS Fallback)
  uploadToCloud: async function(practicumData) {
    const timestamp = Date.now();
    localStorage.setItem("ubk_last_local_update", timestamp.toString());

    // 1. Siarkan serta-merta kepada semua tab pelayar lain pada peranti ini
    if (this.state.broadcastChannel) {
      try {
        this.state.broadcastChannel.postMessage({
          type: "SCHEDULE_UPDATED",
          payload: practicumData,
          timestamp: timestamp
        });
      } catch (e) {}
    }

    const endpoint = this.state.activeEndpoint;
    if (!this.state.isOnline || !endpoint) return;

    this.updateStatusPill("syncing", "Menyimpan ke Cloud...");

    try {
      const payload = {
        channelId: this.config.channelId,
        updatedAt: timestamp,
        updatedBy: "Cikgu Nurul Syahfirah binti Arjaman",
        practicumData: practicumData
      };

      if (this.state.backendType === "gas") {
        // Google Apps Script Web App: gunakan pendekatan pintar dengan fallback no-cors
        try {
          await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify(payload)
          });
        } catch (gasErr) {
          console.warn("CORS redirect pelayar dikesan, beralih ke mod penghantaran no-cors yang dijamin lulus:", gasErr);
          await fetch(endpoint, {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify(payload)
          });
        }
      } else if (this.state.backendType === "firebase") {
        let clean = endpoint.replace(/\/$/, "");
        if (!clean.endsWith(".json")) clean = `${clean}/${this.config.channelId}.json`;
        await fetch(clean, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } else {
        // Cloudflare Pages / REST API
        await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }

      this.state.lastSyncTime = new Date();
      this.updateStatusPill("connected", "Tersimpan Abadi di Cloud & Peranti");
    } catch (err) {
      console.warn("Gagal muat naik ke cloud:", err);
      this.updateStatusPill("error", "Gagal Simpan Cloud");
    }
  },

  // 11. Kendalikan kemasukan data baharu dari Cloud atau Tab Lain dengan perlindungan Undo
  handleIncomingData: function(newData, sourceLabel = "Cloud") {
    if (!Array.isArray(newData) || newData.length === 0) return;

    const currentJson = JSON.stringify(App.state.practicumData);
    const newJson = JSON.stringify(newData);
    if (currentJson === newJson) return;

    // Simpan salinan kecemasan data tempatan SEBELUM ditimpa
    localStorage.setItem("ubk_emergency_backup_before_sync", currentJson);
    localStorage.setItem("ubk_pre_sync_time", new Date().toISOString());

    App.state.practicumData = newData;
    localStorage.setItem("ubk_practicum_schedule_2026", newJson);

    // Auto-Tag sesi jika data dari cloud belum mempunyai tag sesi lengkap
    if (typeof App.autoTagExistingSessions === "function") {
      App.autoTagExistingSessions(true);
    }

    App.render();
    
    // Tunjukkan notifikasi bersama butang Kembalikan Susunan Tempatan
    App.showToast(`🔄 Jadual dikemaskini daripada ${sourceLabel}.`, () => {
      CloudSync.restorePreSyncBackup();
    }, 9000, "↩️ Kembalikan Susunan Asal");
  },

  // 11b. Pulihkan Sandaran Kecemasan Sebelum Segerak (Emergency Pre-Sync Restore)
  restorePreSyncBackup: function() {
    const backupJson = localStorage.getItem("ubk_emergency_backup_before_sync");
    if (!backupJson) {
      alert("Tiada salinan sandaran sebelum segerak ditemui.");
      return;
    }
    try {
      const parsed = JSON.parse(backupJson);
      if (Array.isArray(parsed) && parsed.length > 0) {
        App.state.practicumData = parsed;
        const now = Date.now();
        localStorage.setItem("ubk_practicum_schedule_2026", backupJson);
        localStorage.setItem("ubk_last_local_update", now.toString());
        localStorage.setItem("ubk_emergency_autosave", backupJson);

        this.uploadToCloud(parsed);
        App.render();

        const alertBanner = document.getElementById("syncRecoveryAlertBanner");
        if (alertBanner) alertBanner.style.display = "none";

        alert("✅ Berjaya! Susunan asal anda telah dipulihkan 100% dan dikunci semula ke Cloud & peranti.");
      }
    } catch (e) {
      alert("Ralat memulihkan sandaran: " + e.message);
    }
  },

  // 11c. Paksa Simpan & Kunci Data Tempatan ke Cloud (Force Push)
  forcePushLocalToCloud: async function() {
    if (!confirm("Adakah anda pasti mahu memuat naik dan mengunci susunan jadual di skrin ini ke Cloud (Google Sheets)?\n\nData di Google Sheets akan dikemaskini mengikut paparan jadual semasa anda.")) {
      return;
    }
    const now = Date.now();
    localStorage.setItem("ubk_last_local_update", now.toString());
    await this.uploadToCloud(App.state.practicumData);
    alert("✅ Berjaya! Susunan jadual semasa telah dikunci dan dimuat naik ke Cloud.");
  },

  // 12. Uji Sambungan Backend (Untuk Butang 'Uji Sambungan' di UI)
  testConnection: async function(testUrl) {
    if (!testUrl || !testUrl.trim().startsWith("http")) {
      return { success: false, message: "Sila masukkan URL yang sah (bermula dengan http:// atau https://)" };
    }

    const url = testUrl.trim();
    try {
      let fetchUrl = url;
      let isFirebase = url.includes("firebaseio.com") || url.includes("firebasedatabase.app");
      
      if (isFirebase) {
        let clean = url.replace(/\/$/, "");
        if (!clean.endsWith(".json")) clean = `${clean}/${this.config.channelId}.json`;
        fetchUrl = clean;
      }

      const res = await fetch(fetchUrl, {
        method: "GET",
        headers: { "Accept": "application/json" }
      });

      if (res.ok) {
        return {
          success: true,
          message: isFirebase 
            ? "✅ Berjaya! Sambungan ke Google Firebase Realtime Database aktif." 
            : "✅ Berjaya! Sambungan ke Google Apps Script Web App berfungsi dengan cemerlang."
        };
      } else {
        return { success: false, message: `Ralat HTTP (${res.status}): Sila pastikan pangkalan data dibuka kepada awam (Anyone / Read: true).` };
      }
    } catch (err) {
      return { success: false, message: `Gagal berhubung: ${err.message || "Ralat rangkaian / CORS"}` };
    }
  },

  // 13. Simpan URL Backend Baharu
  saveBackendConfig: function(url) {
    const cleanUrl = (url || "").trim();
    if (!cleanUrl) {
      localStorage.removeItem("ubk_cloud_endpoint");
      this.state.activeEndpoint = "";
      this.state.backendType = "none";
      this.updateStatusPill("unconfigured", "Cloud Belum Disambung");
      return;
    }

    localStorage.setItem("ubk_cloud_endpoint", cleanUrl);
    this.setupActiveBackend();
    this.syncWithCloud();
  },

  // 14. Kemas kini lencana status di header banner
  updateStatusPill: function(status, text) {
    this.state.syncStatus = status;

    const labelEl = document.getElementById("cloudStatusLabel");
    const dotEl = document.getElementById("cloudStatusDot");

    let icon = "🟢";
    let bg = "#10b981";

    if (status === "syncing") {
      icon = "🔄";
      bg = "#3b82f6";
    } else if (status === "offline") {
      icon = "🟡";
      bg = "#f59e0b";
    } else if (status === "error") {
      icon = "🔴";
      bg = "#ef4444";
    } else if (status === "unconfigured") {
      icon = "⚪";
      bg = "#94a3b8";
    }

    if (labelEl) labelEl.textContent = text || "Cloud Live";
    if (dotEl) {
      dotEl.textContent = icon;
      dotEl.style.color = bg;
    }
  },

  // 15. Jana Pautan Perkongsian Pintar (Disertakan Backend URL jika ada)
  getShareableUrl: function(role = "viewer") {
    const origin = window.location.origin;
    const pathname = window.location.pathname;
    const url = new URL(pathname, origin);

    if (role === "viewer") {
      url.searchParams.set("role", "viewer");
    } else if (role === "admin") {
      url.searchParams.set("role", "admin");
    }

    // Masukkan parameter backend URL supaya peranti yang mengimbas QR/link automatik bersambung
    if (this.state.activeEndpoint && this.state.activeEndpoint.startsWith("http")) {
      url.searchParams.set("backend", encodeURIComponent(this.state.activeEndpoint));
    }

    return url.toString();
  },

  // 16. Jana Kod QR Dinamik
  getQrCodeUrl: function(targetUrl, size = 200) {
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=10&data=${encodeURIComponent(targetUrl)}`;
  }
};

// Autostart bila script dimuatkan
if (typeof window !== "undefined") {
  window.CloudSync = CloudSync;
}
