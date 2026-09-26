// ====================================================================
// BACKEND REAL-TIME SISTEM JADUAL UBK SK TAMPASUK 1
// Platform: Google Apps Script + Google Sheets (100% Percuma Selamanya)
// Disediakan Khas untuk: Cikgu Nurul Syahfirah binti Arjaman
// ====================================================================
//
// FUNGSI SKRIP INI:
// 1. Menyimpan data secara 'Real-Time' untuk disegerakkan ke telefon & komputer.
// 2. Mengisi rekod sesi jadual terus ke dalam Google Sheets dalam bentuk
//    jadual yang kemas (Minggu, Tarikh, Hari, Masa, Tajuk Sesi, Klien, dll).
// ====================================================================

function doGet(e) {
  try {
    var props = PropertiesService.getScriptProperties();
    var rawData = props.getProperty("SCHEDULE_DATA");
    var timestampStr = props.getProperty("UPDATED_AT") || "0";
    
    // Sekiranya PropertiesService kosong, baca dari Sheet
    if (!rawData) {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      if (ss) {
        var rawSheet = ss.getSheetByName("Data_JSON");
        if (rawSheet) {
          var val = rawSheet.getRange("A1").getValue();
          if (val && typeof val === "string") rawData = val;
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
    
    // 1. Simpan ke Script Properties untuk capaian real-time pantas
    var props = PropertiesService.getScriptProperties();
    props.setProperty("SCHEDULE_DATA", jsonString);
    props.setProperty("UPDATED_AT", timestamp.toString());
    
    // 2. Susun dan tulis terus ke dalam Google Sheets dalam bentuk jadual cantik
    try {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      if (ss && Array.isArray(practicumData)) {
        tulisJadualCantikKeSheet(ss, practicumData, timestamp);
      }
    } catch (errSheet) {
      Logger.log("Ralat menulis ke sheet: " + errSheet);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Data jadual UBK berjaya disimpan dan disegerakkan ke Google Sheets!",
      updatedAt: timestamp
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ====================================================================
// FUNGSI UNTUK MENULIS SEMUA SESI KE DALAM GOOGLE SHEET (KEMAS & TERSUSUN)
// ====================================================================
function tulisJadualCantikKeSheet(ss, practicumData, timestamp) {
  var sheetName = "Senarai Sesi UBK 2026";
  var sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  sheet.clear();
  
  // Header Lajur Rasmi
  var headers = [
    "Minggu", 
    "Tarikh", 
    "Hari", 
    "Masa Mula", 
    "Masa Tamat", 
    "Tajuk Sesi / Aktiviti", 
    "Jenis Sesi", 
    "Kelas / Sasaran", 
    "Bil. Klien", 
    "Nama Klien / Murid Terlibat", 
    "Status Sesi", 
    "Fokus IPGM", 
    "Cara Hadir",
    "Nota Kaunselor"
  ];
  
  var rows = [headers];
  
  if (Array.isArray(practicumData)) {
    practicumData.forEach(function(week) {
      var weekTitle = week.title || ("Minggu " + week.weekNum);
      if (week.sessions && Array.isArray(week.sessions)) {
        week.sessions.forEach(function(s) {
          var dateStr = (week.dates && week.dates[s.day]) ? week.dates[s.day] : "";
          
          var studentList = "";
          if (s.students && Array.isArray(s.students) && s.students.length > 0) {
            studentList = s.students.map(function(st) { return st.name; }).join(", ");
          }
          
          rows.push([
            weekTitle,
            dateStr,
            s.day || "",
            s.timeStart || "",
            s.timeEnd || "",
            s.title || "",
            (s.type || "").toUpperCase(),
            s.classTarget || "",
            s.headcount || 1,
            studentList,
            (s.status || "belum").toUpperCase(),
            s.focus || "sahsiah",
            s.arrivalWay || "sukarela",
            s.notes || ""
          ]);
        });
      }
    });
  }
  
  if (rows.length > 1) {
    sheet.getRange(1, 1, rows.length, headers.length).setValues(rows);
    
    // Format Header Cantik (Biru KPM & Teks Putih)
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground("#1e3a8a");
    headerRange.setFontColor("#ffffff");
    headerRange.setFontWeight("bold");
    headerRange.setHorizontalAlignment("center");
    
    sheet.setFrozenRows(1);
    
    // Auto-fit lajur
    for (var c = 1; c <= headers.length; c++) {
      sheet.autoResizeColumn(c);
    }
  }
  
  // Simpan juga salinan JSON mentah dalam sheet tersembunyi untuk sandaran
  var jsonSheet = ss.getSheetByName("Data_JSON");
  if (!jsonSheet) jsonSheet = ss.insertSheet("Data_JSON");
  jsonSheet.clear();
  jsonSheet.getRange("A1").setValue(JSON.stringify(practicumData));
  jsonSheet.hideSheet();
}

// ====================================================================
// BUTANG MANUAL: JALANKAN INI SEKIRANYA SHEET CIKGU MASIH KOSONG
// (Klik butang 'Run' / 'Jalankan' untuk fungsi ini di Apps Script)
// ====================================================================
function isiDataSekarang() {
  var props = PropertiesService.getScriptProperties();
  var rawData = props.getProperty("SCHEDULE_DATA");
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  if (rawData && ss) {
    var data = JSON.parse(rawData);
    tulisJadualCantikKeSheet(ss, data, Date.now());
    Logger.log("✅ Berjaya mengisi Google Sheet daripada memori!");
  } else {
    Logger.log("Sila buka laman web dan klik butang 'Simpan & Segerak' untuk menghantar jadual.");
  }
}
