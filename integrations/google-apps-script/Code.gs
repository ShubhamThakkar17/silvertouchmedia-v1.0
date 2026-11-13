/**
 * Lead sink for the website: appends one row per lead to the active sheet.
 * Deploy as a web app (Execute as: Me, Who has access: Anyone) and put the URL in
 * SHEETS_WEBHOOK_URL. Set SECRET below to the same value as SHEETS_WEBHOOK_SECRET.
 *
 * The website sends: { secret, columns: [...names], row: [...values] }.
 * The header row is created on the first lead and extended if new columns appear.
 */
var SECRET = 'replace-with-your-SHEETS_WEBHOOK_SECRET';
var SHEET_NAME = 'Leads';

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var body = JSON.parse(e.postData.contents);
    if (!body || body.secret !== SECRET) return json({ ok: false, error: 'unauthorised' });
    var columns = body.columns || [];
    var row = body.row || [];

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);

    var header = sheet.getLastRow() > 0 ? sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0] : [];
    if (header.length === 0) {
      sheet.appendRow(columns);
      sheet.setFrozenRows(1);
      header = columns;
    } else {
      columns.forEach(function (c) {
        if (header.indexOf(c) === -1) {
          header.push(c);
          sheet.getRange(1, header.length).setValue(c);
        }
      });
    }

    var out = header.map(function (h) {
      var i = columns.indexOf(h);
      var v = i === -1 ? '' : row[i];
      // Stop spreadsheet formula injection from user-entered text.
      return typeof v === 'string' && /^[=+\-@]/.test(v) ? "'" + v : v;
    });
    sheet.appendRow(out);
    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function json(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
