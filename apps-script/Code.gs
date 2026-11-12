/**
 * KirpiGlobal: saytdan gələn müraciətləri Google Sheets cədvəlinə yazır.
 * Quraşdırma addımları: QURAŞDIRMA.md
 *
 * Bu kod cədvəlin öz Apps Script layihəsində işləyir
 * (cədvəldə: Extensions > Apps Script).
 */

var SHEET_NAME = 'Müraciətlər';
var HEADERS = ['Tarix', 'Növ', 'Ad və soyad', 'Mobil nömrə', 'Universitet və ya ölkə', 'Paket', 'Status'];
var TYPES = { research: 'Araşdırma', consultation: 'Konsultasiya' };
var PACKAGES = ['', 'Seçim', 'Müraciət', 'Tam yol'];
var MAX_TEXT = 100;      // ad və universitet/ölkə üçün ən uzun mətn
var MAX_BODY = 2000;     // bütün sorğunun ən böyük ölçüsü (simvol)

/** Saytdan gələn hər göndəriş bura düşür. */
function doPost(e) {
  try {
    var body = e && e.postData && e.postData.contents;
    if (!body || body.length > MAX_BODY) return reply_(false, 'Sorğu boşdur və ya çox uzundur');

    var data;
    try {
      data = JSON.parse(body);
    } catch (err) {
      return reply_(false, 'Sorğu oxunmadı');
    }
    if (!data || typeof data !== 'object') return reply_(false, 'Sorğu oxunmadı');

    // Honeypot: gizli sahəni yalnız botlar doldurur.
    if (text_(data.website)) return reply_(false, 'Rədd edildi');

    var type = text_(data.type);
    if (!TYPES[type]) return reply_(false, 'Növ yanlışdır');

    var phone = text_(data.phone);
    if (!/^\+994[1-9]\d{8}$/.test(phone)) return reply_(false, 'Nömrə yanlışdır');

    var name = text_(data.name);
    var target = text_(data.target);
    var pack = text_(data.package);

    if (name.length > MAX_TEXT || target.length > MAX_TEXT) return reply_(false, 'Mətn çox uzundur');

    if (type === 'research') {
      if (target.length < 2) return reply_(false, 'Universitet və ya ölkə boşdur');
      name = '';
      pack = '';
    } else {
      if (name.length < 2) return reply_(false, 'Ad və soyad boşdur');
      if (PACKAGES.indexOf(pack) === -1) return reply_(false, 'Paket yanlışdır');
      target = '';
    }

    var row = [
      Utilities.formatDate(new Date(), 'Asia/Baku', 'dd.MM.yyyy HH:mm:ss'),
      TYPES[type],
      safe_(name),
      phone,
      safe_(target),
      pack,
      '' // Status: komanda özü doldurur
    ];

    // Eyni anda iki müraciət gələrsə, sətirlər bir-birinin üstünə yazılmasın.
    var lock = LockService.getScriptLock();
    lock.waitLock(20000);
    try {
      var sheet = getSheet_();
      var range = sheet.getRange(sheet.getLastRow() + 1, 1, 1, row.length);
      // Düz mətn formatı: "+994..." rəqəmə çevrilmir, heç bir mətn düstur kimi işləmir.
      range.setNumberFormat('@');
      range.setValues([row]);
    } finally {
      lock.releaseLock();
    }
    return reply_(true);
  } catch (err) {
    console.error(err);
    return reply_(false, 'Server xətası');
  }
}

/** Ünvanı brauzerdə açanda görünən yoxlama cavabı. */
function doGet() {
  return reply_(true, 'KirpiGlobal forması işləyir');
}

/** Bir dəfə əl ilə işə salın: vərəqi və sütun başlıqlarını yaradır, icazə istəyir. */
function setup() {
  getSheet_();
}

function getSheet_() {
  var book = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = book.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = book.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight('bold');
    sheet.setFrozenRows(1);
    sheet.setColumnWidths(1, HEADERS.length, 180);
  }
  return sheet;
}

/** Hər dəyəri təmiz, tək sətirlik mətnə çevirir. */
function text_(value) {
  if (typeof value !== 'string') return '';
  return value.replace(/[\u0000-\u001F\u007F]/g, ' ').replace(/\s+/g, ' ').trim();
}

/** Mətn düstur işarəsi ilə başlayırsa, onu zərərsiz edir. */
function safe_(value) {
  return value.replace(/^[=+\-@]+/, '').trim();
}

function reply_(ok, message) {
  var result = { ok: ok };
  if (message) result[ok ? 'message' : 'error'] = message;
  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
}
