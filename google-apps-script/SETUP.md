# Connect the site to a Google Sheet (5 minutes)

This turns your contact form and the "Ask Ayush" chatbot into a lead database you
can open any time in Google Sheets. It costs nothing and needs no server —
it uses a small Google Apps Script attached to your own Google account.

## 1. Create the sheet
1. Go to [sheets.google.com](https://sheets.google.com) → **Blank spreadsheet**.
2. Rename it, e.g. **"Ayush Mittal — Website Leads"**.

## 2. Add the script
1. In the sheet, go to **Extensions → Apps Script**.
2. Delete the placeholder code in `Code.gs`.
3. Open `google-apps-script/Code.gs` from this folder, copy everything, and paste it in.
4. Click the **Save** icon (or Ctrl/Cmd+S).

## 3. Deploy as a Web App
1. Click **Deploy → New deployment**.
2. Click the gear icon next to "Select type" → choose **Web app**.
3. Set:
   - **Execute as:** Me (your Google account)
   - **Who has access:** Anyone
4. Click **Deploy**.
5. Google will ask you to authorize the script — click **Authorize access**,
   choose your account, then **Advanced → Go to (your project name) (unsafe)**
   → **Allow**. This warning is normal for a script you wrote yourself; it
   only writes rows into your own sheet.
6. Copy the **Web app URL** shown (it ends in `/exec`).

## 4. Connect the website
1. Open `assets/chatbot.js` in this folder.
2. Find this line near the top:
   ```js
   var GAS_URL = "PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE";
   ```
3. Replace the placeholder with the URL you copied, keeping the quotes.
4. Save. That's the only file that needs the URL — the contact form logs
   through the same function automatically.

## 5. Test it
1. Open the site, click the **Ask Ayush** chat bubble (your photo) (bottom-right), ask a
   question, then answer 2 messages so the lead form appears — fill it in
   and click **Send to Ayush**.
2. Also submit the form on the Contact page.
3. Check your Google Sheet — three tabs should appear automatically:
   - **Contact Leads** — every contact-form submission
   - **Chatbot Leads** — every visitor who left their name & email in chat
   - **Chatbot Log** — the full back-and-forth of every chat session, so
     you have context before you reply to a lead
4. If nothing shows up, open the Web App URL directly in a browser — you
   should see "Ayush Mittal website logger is running." If you see a
   Google sign-in or permission error instead, redo step 3 and make sure
   "Who has access" is set to **Anyone**.

## Notes
- The site posts with `mode: "no-cors"`, so it can't confirm the write
  succeeded — it always shows a success message optimistically. Rows will
  still appear in the sheet a second or two later. Use the test in step 5
  to confirm end to end.
- Re-run **Deploy → Manage deployments → Edit → New version** any time you
  change `Code.gs`, or the live URL will keep serving the old script.
- Sort/filter/star rows freely in the sheet — the script only ever appends
  new rows, it never reads or rewrites existing ones.
