AYUSH MITTAL – PORTFOLIO WEBSITE

Live: https://ayush-mittal-product.vercel.app  (Vercel project: ayush-mittal-product)

What's here
  index, experience, case-studies, contact (.html)  the 4 pages (served at /, /experience, /case-studies, /contact via vercel.json), each with its own SEO
                                                      title, description, keywords,
                                                      Open Graph and schema.org data
  assets/styles.css            site styles
  assets/site.js               film-reel animation, copy-email, contact form
  assets/chatbot.css / .js     "Ask Ayush" chatbot widget (bottom-right, uses assets/ayush.jpg)
  api/chat.js                  Vercel serverless function: answers chat questions with Claude
  lib/knowledge.js             the resume/LinkedIn profile the chatbot answers from
  google-apps-script/          Apps Script that logs leads and chats into a Google Sheet
  robots.txt, sitemap.xml      search engine indexing

Deploy
  vercel deploy --prod         (from this folder)

Chatbot
  "Ask Ayush" answers from lib/knowledge.js via api/chat.js. It needs the environment
  variable ANTHROPIC_API_KEY set in Vercel (Project > Settings > Environment Variables);
  without it the widget falls back to built-in answers in assets/chatbot.js.
  To change what it knows, edit lib/knowledge.js and redeploy.

Lead logging (Google Sheets)
  See google-apps-script/SETUP.md. The Web App URL goes into GAS_URL at the top of
  assets/chatbot.js. Tabs created automatically: Contact Leads, Chatbot Leads, Chatbot Log.
