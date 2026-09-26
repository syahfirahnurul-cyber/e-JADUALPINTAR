// =========================================================
// MODUL CLOUD REAL-TIME SYNC & PERKONGSIAN PAUTAN WEB RASMI
// Menyokong penyegerakan data jadual secara masa nyata (Real-Time)
// ke semua peranti (Telefon, Tablet, Komputer) yang membuka link web.
// =========================================================

const CloudSync = {
  // Konfigurasi Utama
  config: {
    channelId: "sk_tampasuk1_ubk_2026",
    // Endpoint sandaran awan masa nyata (REST & SSE realtime compatible)
    apiBase: "https://api.jsonbin.io/v3/b",
    // Saluran BroadcastChannel untuk segerak rentas-tab serta-merta (0ms latency)
    broadcastChannelName: "ubk_schedule_realtime_bus",
    pollIntervalMs: 8000, // Imbas kemaskini cloud setiap 8 saat jika tab aktif
    adminPin: "2026"      // PIN lalai kaunselor untuk buka mod pentadbir pada peranti lain
  },

  state: {
    isOnline: navigator.onLine,
    syncStatus: "connecting", // 'connected', 'syncing', 'offline', 'error'
    lastSyncTime: null,
    lastRemoteTimestamp: 0,
    userRole: "admin",        // 'admin' (Kaunselor) atau 'viewer' (Pelawat/Guru/Murid)
    broadcastChannel: null,
    pollTimer: null,
    isSyncing: false
  },

  init: function() {
    this.detectRoleFromUrl();
    this.initBroadcastChannel();
    this.initNetworkListeners();
    this.initVisibilityListeners();
    this.startRealtimePolling();

    // Lakukan imbasan segerak pertama sebaik sahaja dimuatkan
    setTimeout(() => {
      this.syncWithCloud();
    }, 800);
  },

  // 1. Kenal pasti peranan pengguna (Kaunselor vs Pelawat) dari URL
  detectRoleFromUrl: function() {
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
      // Lalai: Jika di peranti peribadi pertama, mod admin
      this.state.userRole = "admin";
    }

    this.applyRoleUi();
  },

  // 2. Sesuaikan UI mengikut peranan (Viewer Mode: lindungi data daripada terpadam)
  applyRoleUi: function() {
    const isViewer = this.state.userRole === "viewer";
    document.body.classList.toggle("mode-viewer", isViewer);
    document.body.classList.toggle("mode-admin", !isViewer);

    // Kemas kini label banner jika wujud
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

    // Kawal butang tindakan sekiranya mod paparan aktif
    const addBtn = document.querySelector(".btn-primary[onclick*='openAddSessionModal']");
    if (addBtn) {
      addBtn.style.display = isViewer ? "none" : "";
    }
  },

  // 3. Log masuk mod pentadbir (Kaunselor) menggunakan PIN
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

  // 4. Kunci semula ke mod paparan
  lockToViewerMode: function() {
    this.state.userRole = "viewer";
    localStorage.setItem("ubk_user_role", "viewer");
    this.applyRoleUi();
    App.showToast("🔒 Mod Paparan Awam (Semakan Sahaja) diaktifkan.", null, 3000);
    App.render();
  },

  // 5. Inisialisasi BroadcastChannel (Segerak antara tab pada komputer/peranti sama)
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
    } catch (e) {
      console.warn("BroadcastChannel tidak disokong oleh pelayar:", e);
    }

    // Sandaran 'storage' event listener
    window.addEventListener("storage", (e) => {
      if (e.key === "ubk_practicum_schedule_2026" && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          this.handleIncomingData(parsed, "Penyimpanan Tempatan");
        } catch (err) {}
      }
    });
  },

  // 6. Listener Status Rangkaian (Online / Offline)
  initNetworkListeners: function() {
    window.addEventListener("online", () => {
      this.state.isOnline = true;
      this.updateStatusPill("connected", "Online (Real-Time)");
      App.showToast("🌐 Sambungan internet pulih. Menyelaras dengan Cloud...", null, 3000);
      this.syncWithCloud();
    });

    window.addEventListener("offline", () => {
      this.state.isOnline = false;
      this.updateStatusPill("offline", "Luar Talian");
      App.showToast("⚠️ Tiada internet. Beroperasi dalam mod luar talian (data disimpan setempat).", null, 4000);
    });
  },

  // 7. Pengesanan keaktifan tab (sync serta-merta apabila pengguna buka semula tab)
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

  // 9. Fungsi Utama: Segerak dengan Cloud (Pull & Push Pintar)
  syncWithCloud: async function() {
    if (!this.state.isOnline || this.state.isSyncing) return;
    this.state.isSyncing = true;
    this.updateStatusPill("syncing", "Menyemak Cloud...");

    try {
      // Ambil konfigurasi cloud kustom jika ada
      const cloudEndpoint = localStorage.getItem("ubk_cloud_endpoint") || "";
      const cloudKey = localStorage.getItem("ubk_cloud_key") || this.config.channelId;

      // Logik Segerak: Semak timestamp remote vs local
      const localUpdated = parseInt(localStorage.getItem("ubk_last_local_update") || "0", 10);

      // Sekiranya ada Firebase DB URL atau REST DB
      if (cloudEndpoint) {
        const res = await fetch(`${cloudEndpoint.replace(/\/$/, '')}/${cloudKey}.json`, {
          method: "GET",
          headers: { "Accept": "application/json" }
        });

        if (res.ok) {
          const remoteData = await res.json();
          if (remoteData && remoteData.practicumData) {
            const remoteTimestamp = remoteData.updatedAt || 0;
            if (remoteTimestamp > localUpdated) {
              // Remote lebih baru -> Kemaskini local!
              this.handleIncomingData(remoteData.practicumData, "Cloud Live");
              this.state.lastRemoteTimestamp = remoteTimestamp;
              localStorage.setItem("ubk_last_local_update", remoteTimestamp.toString());
            } else if (localUpdated > remoteTimestamp && this.state.userRole === "admin") {
              // Local lebih baru dan peranan admin -> Muat naik ke cloud!
              await this.uploadToCloud(App.state.practicumData);
            }
          }
        }
      }

      this.state.lastSyncTime = new Date();
      this.updateStatusPill("connected", "Cloud Live (Real-Time)");
    } catch (err) {
      console.warn("Penyegerakan Cloud:", err);
      this.updateStatusPill("connected", "Tersimpan Tempatan");
    } finally {
      this.state.isSyncing = false;
    }
  },

  // 10. Muat naik kemaskini baharu ke Cloud (Dipanggil automatik setiap kali Cikgu simpan sesi)
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

    if (!this.state.isOnline) return;

    this.updateStatusPill("syncing", "Menyimpan ke Cloud...");

    try {
      const cloudEndpoint = localStorage.getItem("ubk_cloud_endpoint") || "";
      const cloudKey = localStorage.getItem("ubk_cloud_key") || this.config.channelId;

      if (cloudEndpoint) {
        await fetch(`${cloudEndpoint.replace(/\/$/, '')}/${cloudKey}.json`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            channelId: cloudKey,
            updatedAt: timestamp,
            updatedBy: "Cikgu Nurul Syahfirah binti Arjaman",
            practicumData: practicumData
          })
        });
      }

      this.state.lastSyncTime = new Date();
      this.updateStatusPill("connected", "Cloud Live (Real-Time)");
    } catch (err) {
      console.warn("Gagal muat naik ke cloud:", err);
      this.updateStatusPill("connected", "Tersimpan Tempatan");
    }
  },

  // 11. Kendalikan kemasukan data baharu dari Cloud atau Tab Lain
  handleIncomingData: function(newData, sourceLabel = "Cloud") {
    if (!Array.isArray(newData) || newData.length === 0) return;

    // Semak sama ada data benar-benar berbeza untuk elak render berulang
    const currentJson = JSON.stringify(App.state.practicumData);
    const newJson = JSON.stringify(newData);
    if (currentJson === newJson) return;

    App.state.practicumData = newData;
    localStorage.setItem("ubk_practicum_schedule_2026", newJson);

    // Kemas kini keseluruhan paparan aplikasi secara reaktif
    App.render();

    // Paparkan notifikasi kemaskini halus
    App.showToast(`🔄 Jadual dikemaskini secara langsung daripada ${sourceLabel}!`, null, 3500);
  },

  // 12. Kemas kini lencana status di header banner
  updateStatusPill: function(status, text) {
    this.state.syncStatus = status;

    const iconEl = document.getElementById("cloudStatusIcon");
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
    }

    if (iconEl) iconEl.textContent = icon;
    if (labelEl) labelEl.textContent = text || "Cloud Live";
    if (dotEl) {
      dotEl.textContent = icon;
      dotEl.style.color = bg;
    }
  },

  // 13. Jana Pautan Perkongsian Pintar
  getShareableUrl: function(role = "viewer") {
    const origin = window.location.origin;
    const pathname = window.location.pathname;
    const url = new URL(pathname, origin);

    if (role === "viewer") {
      url.searchParams.set("role", "viewer");
    } else if (role === "admin") {
      url.searchParams.set("role", "admin");
    }

    return url.toString();
  },

  // 14. Jana Kod QR Dinamik
  getQrCodeUrl: function(targetUrl, size = 200) {
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=10&data=${encodeURIComponent(targetUrl)}`;
  }
};

// Autostart bila script dimuatkan
if (typeof window !== "undefined") {
  window.CloudSync = CloudSync;
}
