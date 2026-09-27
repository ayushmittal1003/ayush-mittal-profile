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

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var type = body.type;
    var cfg = SHEETS[type];
    if (!cfg) return ContentService.createTextOutput(JSON.stringify({ status: "ignored" })).setMimeType(ContentService.MimeType.JSON);

    var ss = SpreadsheetApp.getActiveSpreadsheet();
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
    sheet.appendRow(row);

    return ContentService.createTextOutput(JSON.stringify({ status: "ok" })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: String(err) })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput("Ayush Mittal website logger is running.").setMimeType(ContentService.MimeType.TEXT);
}
