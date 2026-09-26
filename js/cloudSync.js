// ====================================================================
// MODUL CLOUD REAL-TIME SYNC & UNIVERSAL BACKEND ADAPTER
// Menyokong penyegerakan data jadual secara masa nyata (Real-Time)
// ke semua peranti (Telefon, Tablet, Komputer) yang membuka link web.
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
    eventSource: null,
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

    // Lakukan imbasan segerak pertama sebaik sahaja pelayar bersedia (200ms)
    setTimeout(() => {
      this.syncWithCloud();
    }, 200);
  },

  // Pembongkar Payload Praktikum Fleksibel (Universal Payload Extractor)
  // Menyokong semua bentuk kembalian Google Apps Script / Firebase / REST
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
      this.state.backendType = "gas";
    } else if (endpoint.includes("firebaseio.com") || endpoint.includes("firebasedatabase.app")) {
      this.state.backendType = "firebase";
      this.initFirebaseRealtimeStream(endpoint);
    } else if (endpoint.includes("/api/sync")) {
      this.state.backendType = "cloudflare";
    } else {
      this.state.backendType = "custom";
    }
  },

  // Sambungan Firebase Real-Time (Jika Digunakan)
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
            const parsed = this.parsePracticumPayload(res.data);
            if (parsed.data) {
              this.handleIncomingData(parsed.data, "Firebase Real-Time");
            }
          }
        } catch (err) {}
      });
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

  // 5. BroadcastChannel untuk segerak rentas-tab
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

  // 8. Pemantauan berkala (Polling real-time setiap 8 saat)
  startRealtimePolling: function() {
    if (this.state.pollTimer) clearInterval(this.state.pollTimer);
    this.state.pollTimer = setInterval(() => {
      if (this.state.isOnline && document.visibilityState === "visible" && !this.state.isSyncing) {
        this.syncWithCloud();
      }
    }, this.config.pollIntervalMs);
  },

  // 9. Fungsi Utama: Segerak dengan Cloud (Pull & Sync Pantas)
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
        const remoteTimestamp = parsed.timestamp;

        if (remoteData && Array.isArray(remoteData) && remoteData.length > 0) {
          const currentJson = JSON.stringify(App.state.practicumData);
          const remoteJson = JSON.stringify(remoteData);

          // Jika data di cloud berbeza dengan memori peranti ini
          if (currentJson !== remoteJson) {
            // Kemas kini data terus dari Cloud (Google Sheets) sebagai punca kebenaran utama
            this.handleIncomingData(remoteData, "Google Sheets (Cloud)");
            this.state.lastRemoteTimestamp = remoteTimestamp;
            localStorage.setItem("ubk_last_local_update", (remoteTimestamp || Date.now()).toString());
          }
          this.state.hasDoneInitialSync = true;
        } else if ((!remoteData || remoteData.length === 0) && this.state.userRole === "admin" && App.state.practicumData && App.state.practicumData.length > 0 && !this.state.hasDoneInitialSync) {
          // Hanya jika cloud benar-benar kosong kali pertama, muat naik data sedia ada Cikgu
          this.state.hasDoneInitialSync = true;
          await this.uploadToCloud(App.state.practicumData);
        }

        this.state.lastSyncTime = new Date();
        this.updateStatusPill("connected", "Cloud Live (Real-Time)");
      } else {
        this.updateStatusPill("error", "Ralat Cloud (" + res.status + ")");
      }
    } catch (err) {
      console.warn("Penyegerakan Cloud:", err);
      this.updateStatusPill("error", "Gagal Hubung Cloud");
    } finally {
      this.state.isSyncing = false;
    }
  },

  // 10. Muat naik kemaskini baharu ke Cloud
  uploadToCloud: async function(practicumData) {
    const timestamp = Date.now();
    localStorage.setItem("ubk_last_local_update", timestamp.toString());

    // Siarkan serta-merta kepada semua tab pelayar lain pada peranti ini
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
        await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify(payload)
        });
      } else if (this.state.backendType === "firebase") {
        let clean = endpoint.replace(/\/$/, "");
        if (!clean.endsWith(".json")) clean = `${clean}/${this.config.channelId}.json`;
        await fetch(clean, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } else {
        await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }

      this.state.lastSyncTime = new Date();
      this.updateStatusPill("connected", "Cloud Live (Real-Time)");
    } catch (err) {
      console.warn("Gagal muat naik ke cloud:", err);
      this.updateStatusPill("error", "Gagal Simpan Cloud");
    }
  },

  // 11. Kendalikan kemasukan data baharu dari Cloud atau Tab Lain
  handleIncomingData: function(newData, sourceLabel = "Cloud") {
    if (!Array.isArray(newData) || newData.length === 0) return;

    const currentJson = JSON.stringify(App.state.practicumData);
    const newJson = JSON.stringify(newData);
    if (currentJson === newJson) return;

    App.state.practicumData = newData;
    localStorage.setItem("ubk_practicum_schedule_2026", newJson);

    App.render();
    App.showToast(`🔄 Jadual dikemaskini secara langsung daripada ${sourceLabel}!`, null, 3500);
  },

  // 12. Uji Sambungan Backend
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
        return { success: false, message: `Ralat HTTP (${res.status}): Sila pastikan pangkalan data dibuka kepada awam (Anyone).` };
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

  // 15. Jana Pautan Perkongsian Pintar
  getShareableUrl: function(role = "viewer") {
    const origin = window.location.origin;
    const pathname = window.location.pathname;
    const url = new URL(pathname, origin);

    if (role === "viewer") {
      url.searchParams.set("role", "viewer");
    } else if (role === "admin") {
      url.searchParams.set("role", "admin");
    }

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
