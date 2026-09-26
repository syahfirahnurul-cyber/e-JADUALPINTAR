// ====================================================================
// BACKEND REAL-TIME SISTEM JADUAL UBK SK TAMPASUK 1
// Platform: Google Apps Script + Google Sheets (100% Percuma Selamanya)
// Disediakan Khas untuk: Cikgu Nurul Syahfirah binti Arjaman
// ====================================================================
//
// PANDUAN LANGKAH DEMI LANGKAH UNTUK CIKGU (Hanya Ambil Masa 3 Minit):
// --------------------------------------------------------------------
// 1. Buka pelayar web dan layari: https://sheets.google.com
// 2. Klik '+' untuk cipta lembaran baharu (Beri nama: "Pangkalan Data UBK SK Tampasuk 1").
// 3. Pada menu atas, klik 'Extensions' (atau 'Pelanjutan') > pilih 'Apps Script'.
// 4. Padam apa-apa kod sedia ada di dalamnya, salin SELURUH kod di bawah ini dan tampal ke situ.
// 5. Klik ikon Simpan 💾 (atau Ctrl + S).
// 6. Klik butang biru besar 'Deploy' (Guna) di sudut kanan atas > pilih 'New deployment' (Guna Baharu).
// 7. Klik ikon gear ⚙️ di sebelah 'Select type' > pilih 'Web app' (Aplikasi Web).
// 8. Isikan tetapan berikut dengan teliti:
//    - Description: UBK Backend Realtime
//    - Execute as: 'Me' (Akaun Google saya)
//    - Who has access: 'Anyone' (Sesiapa sahaja)  <-- PENTING agar telefon & laptop boleh membaca data!
// 9. Klik 'Deploy'. Google akan meminta kebenaran (Review Permissions) > pilih emel anda >
//    klik 'Advanced' (Lanjutan) > klik 'Go to Untitled project (unsafe)' > klik 'Allow' (Benarkan).
// 10. Salin 'Web App URL' yang dipaparkan (bermula dengan: https://script.google.com/macros/s/...../exec).
// 11. Masukkan URL tersebut ke dalam Sistem Jadual UBK di butang '🟢 Live Sync' > Tetapan Backend!
//
// Selesai! Sekarang semua sesi yang cikgu simpan di komputer akan terus disegerakkan ke telefon
// dan mana-mana peranti secara automatik!
// ====================================================================

function doGet(e) {
  try {
    var props = PropertiesService.getScriptProperties();
    var rawData = props.getProperty("SCHEDULE_DATA");
    var timestampStr = props.getProperty("UPDATED_AT") || "0";
    
    // Sekiranya PropertiesService kosong, cuba baca dari Sheet
    if (!rawData) {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      if (ss) {
        var sheet = ss.getActiveSheet();
        var sheetVal = sheet.getRange("B2").getValue();
        if (sheetVal && typeof sheetVal === "string" && sheetVal.length > 5) {
          rawData = sheetVal;
        }
      }
    }
    
    var practicumData = null;
    if (rawData) {
      try {
        practicumData = JSON.parse(rawData);
      } catch (errJson) {
        practicumData = null;
      }
    }
    
    var response = {
      status: "success",
      channelId: "sk_tampasuk1_ubk_2026",
      updatedAt: parseInt(timestampStr, 10) || Date.now(),
      practicumData: practicumData
    };
    
    return ContentService.createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    var requestBody = "";
    if (e && e.postData && e.postData.contents) {
      requestBody = e.postData.contents;
    } else {
      throw new Error("Tiada data POST dikesan.");
    }
    
    var parsed = JSON.parse(requestBody);
    var practicumData = parsed.practicumData || parsed;
    var timestamp = parsed.updatedAt || Date.now();
    
    var jsonString = JSON.stringify(practicumData);
    
    // 1. Simpan ke Script Properties (Sangat pantas, sub-saat)
    var props = PropertiesService.getScriptProperties();
    props.setProperty("SCHEDULE_DATA", jsonString);
    props.setProperty("UPDATED_AT", timestamp.toString());
    
    // 2. Simpan juga salinan ke Google Sheets sebagai rekod sandaran selamat
    try {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      if (ss) {
        var sheet = ss.getActiveSheet();
        sheet.setName("Log Jadual UBK");
        
        sheet.getRange("A1").setValue("Kemaskini Terakhir:");
        sheet.getRange("B1").setValue(new Date(timestamp).toLocaleString("ms-MY"));
        
        sheet.getRange("A2").setValue("Data JSON Penuh:");
        sheet.getRange("B2").setValue(jsonString);
        
        sheet.getRange("A3").setValue("Dikemaskini Oleh:");
        sheet.getRange("B3").setValue(parsed.updatedBy || "Cikgu Nurul Syahfirah");
      }
    } catch (errSheet) {
      // Abaikan jika sheet sedang dikunci, Script Properties sudah memadai
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Data jadual UBK berjaya disimpan dan disegerakkan!",
      updatedAt: timestamp
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
