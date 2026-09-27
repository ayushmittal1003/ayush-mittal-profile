/**
 * Ayush Mittal website — lead & chat logger.
 * Deploy this bound to a Google Sheet as a Web App (see SETUP.md).
 * Every submission from the contact form or the Ask Ayush chatbot lands
 * as a new row in one of three sheet tabs, created automatically:
 *   - "Contact Leads"  (contact page form)
 *   - "Chatbot Leads"  (name/email left inside the chat)
 *   - "Chatbot Log"    (every chat message, for context)
 */

var SHEETS = {
  contact_form: { name: "Contact Leads", cols: ["Timestamp", "Session", "Page", "Name", "Email", "Company", "Subject", "Message"] },
  chatbot_lead: { name: "Chatbot Leads", cols: ["Timestamp", "Session", "Page", "Name", "Email", "Message", "Transcript"] },
  chatbot_log:  { name: "Chatbot Log",   cols: ["Timestamp", "Session", "Page", "Sender", "Message"] }
};

var SHEET_TITLE = "Ayush Mittal — Website Leads";

// Works bound to a sheet, or standalone: creates the sheet on first use and remembers its ID.
function getSpreadsheet() {
  var bound = SpreadsheetApp.getActiveSpreadsheet();
  if (bound) return bound;
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty("SHEET_ID");
  if (id) return SpreadsheetApp.openById(id);
  var ss = SpreadsheetApp.create(SHEET_TITLE);
  props.setProperty("SHEET_ID", ss.getId());
  return ss;
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    var body = JSON.parse(e.postData.contents);
    var type = body.type;
    var cfg = SHEETS[type];
    if (!cfg) return ContentService.createTextOutput(JSON.stringify({ status: "ignored" })).setMimeType(ContentService.MimeType.JSON);

    lock.waitLock(20000);
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName(cfg.name);
    if (!sheet) {
      sheet = ss.insertSheet(cfg.name);
      sheet.appendRow(cfg.cols);
      sheet.setFrozenRows(1);
    }

    var row;
    if (type === "contact_form") {
      row = [new Date(), body.session || "", body.page || "", body.name || "", body.email || "", body.company || "", body.subject || "", body.message || ""];
    } else if (type === "chatbot_lead") {
      row = [new Date(), body.session || "", body.page || "", body.name || "", body.email || "", body.message || "", body.transcript || ""];
    } else if (type === "chatbot_log") {
      row = [new Date(), body.session || "", body.page || "", body.sender || "", body.message || ""];
    }
    sheet.appendRow(row.map(safe));

    return ContentService.createTextOutput(JSON.stringify({ status: "ok" })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: String(err) })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

// Visitor text starting with = + - @ would otherwise run as a spreadsheet formula.
function safe(v) {
  if (typeof v !== "string") return v;
  v = v.slice(0, 45000);
  return /^[=+\-@]/.test(v) ? "'" + v : v;
}

function doGet(e) {
  var ss = getSpreadsheet();
  return ContentService.createTextOutput("Ayush Mittal website logger is running.\nLeads sheet: " + ss.getUrl()).setMimeType(ContentService.MimeType.TEXT);
}

// Run once from the Apps Script editor to grant access and create the leads sheet.
function setup() {
  var ss = getSpreadsheet();
  Object.keys(SHEETS).forEach(function (type) {
    var cfg = SHEETS[type];
    if (!ss.getSheetByName(cfg.name)) {
      var sh = ss.insertSheet(cfg.name);
      sh.appendRow(cfg.cols);
      sh.setFrozenRows(1);
    }
  });
  var blank = ss.getSheetByName("Sheet1");
  if (blank && ss.getSheets().length > 1 && blank.getLastRow() === 0) ss.deleteSheet(blank);
  Logger.log("Leads sheet: " + ss.getUrl());
}
