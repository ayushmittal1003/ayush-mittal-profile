/*
  Ask Ayush — Ayush Mittal's site assistant.
  Answers come from /api/chat (Claude, grounded in Ayush's resume). If that endpoint
  is unavailable, a small built-in knowledge base answers instead. Chat activity and
  leads are logged to Google Sheets through GAS_URL (see google-apps-script/SETUP.md).
*/
(function(){
  "use strict";

  // Paste your Google Apps Script Web App URL here (see google-apps-script/SETUP.md).
  var GAS_URL = "https://script.google.com/macros/s/AKfycbxRj4fhEH8iGfrQiPPqEbjIPeO_pVz445UKKCTM9mYNXfVl1C0ZWzk7c8hqGvAwBz7SkQ/exec";
  var CHAT_API = "/api/chat";

  var EMAIL = "ayushproduct1210@gmail.com";
  var WHATSAPP = "+91 78885 58921 (wa.me/917888558921)";
  var LINKEDIN = "linkedin.com/in/ayush-mittal-product";
  var scriptSrc = (document.currentScript && document.currentScript.src) || "";
  var PHOTO = scriptSrc ? scriptSrc.replace(/chatbot\.js(\?.*)?$/, "ayush.jpg") : "assets/ayush.jpg";

  var QUICK = [
    "What does Ayush specialize in?",
    "Tell me about his product management experience.",
    "What AI products has he built?",
    "Walk me through one of his projects.",
    "Why should we hire Ayush?",
    "What's his approach to product management?"
  ];

  var KB = [
    { k: ["speciali","focus","expertise","good at","what does he do"],
      a: "Ayush specializes in 0-to-1 product builds, growth and monetization, and technical product management. At ReflexPrep he owns product strategy, pricing, payments, growth and AI automation end to end across Web, Android and iOS." },
    { k: ["experience","background","career","journey","history","years"],
      a: "Ayush is a Senior Product Manager at ReflexPrep (Feb 2025 to now), where he grew revenue from ₹1.35 Cr to ₹3.1 Cr (+130% YoY) and MAU from 20K to 60K+. He also did freelance PM work for HobFit (500K+ users) and Nexteir, after two years as a software engineer at DXC Technology and Apisero. He's a B.Tech from NIT Jalandhar." },
    { k: ["ai","artificial","chatbot","automation","agent","llm","claude","gpt"],
      a: "Ayush built and deployed AI support agents across WhatsApp, Instagram, Email and Web at ReflexPrep. Support cost fell from ₹89K to ₹15K a month (-83%) and response time went from 1-2 days to about 30 minutes. He also built this assistant with Claude Code." },
    { k: ["project","walk me","example","case study","fmge","launch","0-to-1","0 to 1"],
      a: "A good one is the FMGE vertical at ReflexPrep. Ayush owned it 0-to-1: product, tech, onboarding, payments, question bank and go-to-market, and it went live in April 2026. He also launched HAMMER and TROCAR, quiz products that drew 700 and 400 participants. The Case studies page has six case studies with numbers." },
    { k: ["hire","why should","why him","why ayush","strength","value","fit"],
      a: "Three reasons: he owns revenue, not just roadmaps (+130% YoY revenue and 25% lower CAC at ReflexPrep); he's technical, with two years as a software engineer; and he covers product, growth, tech and AI, so one person can write the PRD, fix the funnel and ship the release." },
    { k: ["approach","philosophy","process","how does he work","framework","method"],
      a: "Data first, funnel first. Ayush instruments the whole funnel, finds where users drop off, and runs tight experiments on pricing, onboarding and messaging. He writes PRDs that map directly to APIs and events, and prefers shipping something small to production over debating a big spec." },
    { k: ["payment","razorpay","paytm","checkout"],
      a: "Ayush moved ReflexPrep's payments from Paytm to Razorpay with fallback and failure-recovery flows, alerts and a redesigned checkout. Payment conversion went from 27% to 50%." },
    { k: ["growth","funnel","conversion","cac","retention","renewal"],
      a: "At ReflexPrep, Ayush took free-trial activation from 20% to 70%, monthly paid users from 2.5K to 7K, cut CAC from ₹712 to ₹536, and lifted renewals from 6% to 40% with behaviour-based CleverTap journeys." },
    { k: ["personal project","side project","machine learning","ml ","opencv","nlp","college project"],
      a: "Ayush's personal projects include a YouTube ad view prediction model (Random Forest, 92%+ accuracy), NLP review classification (81% accuracy), a buyer-vs-browser classifier at NIT Jalandhar, a Python + SQL banking automation app, and OpenCV projects like an invisibility cloak and face and smile detection. They're on the Case studies page." },
    { k: ["eddgi","marketing","branding","social media"],
      a: "Ayush was a part-time Marketing Consultant at Eddgi (Apr-Jul 2020), working on branding, social media campaigns, SEO and email marketing. He later optimised Meta Ads and ran pricing and referral growth at HobFit." },
    { k: ["intern","internship","accenture","deloitte","insidesherpa"],
      a: "In 2020 Ayush was a Machine Learning Intern at Internship Studio, and completed the Accenture Australia Discovery Program and Deloitte Technology Consulting virtual internships through InsideSherpa." },
    { k: ["hobfit","wellness","sirona"],
      a: "At HobFit (Aug-Nov 2025, part-time) Ayush lifted checkout conversion from about 2% to 10%, set up end-to-end tracking and Day-0 engagement funnels, led pricing with time-zone-based coupons, launched Refer, Earn & Extend, and owned releases across web, Play Store and App Store." },
    { k: ["salesforce","apisero","metronet","tableau"],
      a: "At Apisero (2021-22) Ayush automated Salesforce lead workflows with SQL, SOQL and Apex (-45% manual effort) and built Einstein Analytics forecasting models (+20% accuracy, +12% quarterly revenue) for Metronet." },
    { k: ["contact","email","reach","talk","call","meet","connect","touch","whatsapp","phone","number","mobile"],
      a: "You can WhatsApp Ayush at " + WHATSAPP + ", email him at " + EMAIL + ", or find him on LinkedIn at " + LINKEDIN + ". Or leave your name and email here and he'll get back to you personally." },
    { k: ["resume","cv"],
      a: "You can download Ayush's resume as a PDF from the homepage or the Experience page." },
    { k: ["education","college","university","nit","degree","btech","b.tech"],
      a: "Ayush has a B.Tech from the National Institute of Technology, Jalandhar (2016-2020), CGPA 7.84." },
    { k: ["skill","stack","tools","sql","python","analytics"],
      a: "Product: strategy, PRDs, 0-to-1, A/B testing, pricing, GTM. Growth and analytics: funnels, CRO, GA4, CleverTap, BigQuery. Technical: SQL, Python, REST APIs, Next.js, Razorpay. AI: agents, chatbots, prompt engineering, Claude Code." },
    { k: ["location","based","where","remote","delhi","ncr","relocat"],
      a: "Ayush is based in Delhi NCR, India, and works remotely with teams in India and abroad." },
    { k: ["available","open to","full time","full-time","freelance","fractional","role","looking"],
      a: "Ayush is open to Senior PM and Product Lead roles, plus selective freelance or fractional projects, especially in EdTech, HealthTech, consumer subscription and B2B SaaS. Leave your details here and he'll follow up." },
    { k: ["salary","ctc","compensation","notice","visa"],
      a: "Ayush prefers to discuss that directly. Leave your name and email here, or write to " + EMAIL + ", and he'll get back to you." }
  ];

  var FALLBACK = "I don't have a ready answer for that. I can tell you about Ayush's experience, AI work, projects, skills or how to reach him, or you can leave your email and he'll answer personally.";

  function localAnswer(text){
    var t = text.toLowerCase();
    if (/^\s*(hi|hello|hey)\b/.test(t)) return "Hi! This is Ask Ayush. Ask me anything about Ayush's experience, projects or approach to product management.";
    if (/thank/.test(t)) return "You're welcome! Anything else you'd like to know about Ayush?";
    var best = null, bestScore = 0;
    KB.forEach(function(e){
      var s = 0;
      e.k.forEach(function(k){ if (t.indexOf(k) !== -1) s += k.length; });
      if (s > bestScore){ bestScore = s; best = e.a; }
    });
    return best || FALLBACK;
  }

  function sessionId(){
    try {
      var v = sessionStorage.getItem("loop_session");
      if (!v){ v = "s-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2,8); sessionStorage.setItem("loop_session", v); }
      return v;
    } catch(e){ return "s-" + Date.now().toString(36); }
  }

  function log(type, data){
    if (!GAS_URL || GAS_URL.indexOf("PASTE_") === 0) return;
    var payload = Object.assign({ type: type, session: sessionId(), page: location.pathname, ts: new Date().toISOString() }, data);
    try {
      fetch(GAS_URL, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(payload) }).catch(function(){});
    } catch(e){}
  }

  var esc = function(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]; }); };
  var svgClose = '<svg class="ic-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>';
  var svgSend = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4 20-7Z"/></svg>';

  function mount(){
    var toggle = document.createElement("button");
    toggle.id = "loop-toggle";
    toggle.type = "button";
    toggle.setAttribute("aria-label", "Open Ask Ayush, Ayush's AI assistant");
    toggle.setAttribute("aria-expanded", "false");
    toggle.innerHTML = '<img class="ic-chat face" src="' + PHOTO + '" alt="">' + svgClose + '<span class="dot" aria-hidden="true"></span>';
    document.body.appendChild(toggle);

    var widget = document.createElement("div");
    widget.id = "loop-widget";
    widget.setAttribute("role", "dialog");
    widget.setAttribute("aria-label", "Ask Ayush chat");
    widget.innerHTML =
      '<div class="loop-head">' +
        '<img class="loop-avatar" src="' + PHOTO + '" alt="Ayush Mittal">' +
        '<div class="who"><b>Ask Ayush <i aria-hidden="true"></i></b><span>Ask anything about Ayush’s experience, projects &amp; PM journey</span></div>' +
        '<button class="loop-close" type="button" aria-label="Close chat">&times;</button>' +
      '</div>' +
      '<div class="loop-body" id="loop-body" aria-live="polite"></div>' +
      '<div class="loop-input">' +
        '<input id="loop-text" type="text" maxlength="1000" placeholder="Ask me about Ayush…" autocomplete="off">' +
        '<button class="loop-send" id="loop-send" type="button" aria-label="Send">' + svgSend + '</button>' +
      '</div>';
    document.body.appendChild(widget);

    var body = widget.querySelector("#loop-body");
    var input = widget.querySelector("#loop-text");
    var sendBtn = widget.querySelector("#loop-send");
    var history = [];
    var userTurns = 0, leadShown = false, opened = false, busy = false, aiAvailable = true;

    function timeNow(){ return new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false }); }
    function scroll(){ body.scrollTop = body.scrollHeight; }

    function addRow(who, text){
      var row = document.createElement("div");
      row.className = "loop-row " + who;
      row.innerHTML = (who === "bot" ? '<img class="mini" src="' + PHOTO + '" alt="">' : "") +
        '<div><div class="loop-bubble">' + esc(text) + '</div><div class="loop-time">' + timeNow() + '</div></div>';
      body.appendChild(row);
      scroll();
    }

    function addTyping(){
      var row = document.createElement("div");
      row.className = "loop-row bot";
      row.innerHTML = '<img class="mini" src="' + PHOTO + '" alt=""><div class="loop-bubble loop-typing"><span></span><span></span><span></span></div>';
      body.appendChild(row);
      scroll();
      return row;
    }

    function addChips(){
      var wrap = document.createElement("div");
      wrap.className = "loop-chips";
      QUICK.forEach(function(q){
        var chip = document.createElement("button");
        chip.type = "button";
        chip.className = "loop-chip";
        chip.textContent = q;
        chip.addEventListener("click", function(){ wrap.remove(); send(q); });
        wrap.appendChild(chip);
      });
      body.appendChild(wrap);
      scroll();
    }

    function clearPrompts(){
      body.querySelectorAll(".loop-chips").forEach(function(el){ el.remove(); });
    }

    function addFollowUp(){
      addRow("bot", "Do you want to know more?");
      var wrap = document.createElement("div");
      wrap.className = "loop-chips loop-follow";
      [["Yes", "yes"], ["No", "no"]].forEach(function(opt){
        var b = document.createElement("button");
        b.type = "button";
        b.className = "loop-chip " + opt[1];
        b.textContent = opt[0];
        b.addEventListener("click", function(){
          clearPrompts();
          addRow("user", opt[0]);
          log("chatbot_log", { sender: "user", message: opt[0] });
          var reply = opt[1] === "yes"
            ? "Sure! Pick a topic below, or type your own question."
            : "Thank you! आपका दिन शुभ हो।";
          setTimeout(function(){
            addRow("bot", reply);
            log("chatbot_log", { sender: "bot", message: reply });
            if (opt[1] === "yes") addChips();
          }, 300);
        });
        wrap.appendChild(b);
      });
      body.appendChild(wrap);
      scroll();
    }

    function addLeadForm(){
      if (leadShown) return;
      leadShown = true;
      var wrap = document.createElement("div");
      wrap.className = "loop-lead";
      wrap.innerHTML =
        '<p><strong>Want Ayush to follow up personally?</strong> Leave your details.</p>' +
        '<input class="ln" placeholder="Your name" autocomplete="name">' +
        '<input class="le" type="email" placeholder="Work email" autocomplete="email">' +
        '<textarea class="lm" placeholder="Role or project you have in mind (optional)"></textarea>' +
        '<div class="row"><span class="msg"></span><button type="button">Send to Ayush</button></div>';
      body.appendChild(wrap);
      scroll();
      var btn = wrap.querySelector("button");
      btn.addEventListener("click", function(){
        var name = wrap.querySelector(".ln").value.trim();
        var email = wrap.querySelector(".le").value.trim();
        var msg = wrap.querySelector(".lm").value.trim();
        var status = wrap.querySelector(".msg");
        if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){ status.textContent = "Add your name and a valid email."; status.className = "msg err"; return; }
        var transcript = history.map(function(m){ return (m.role === "user" ? "Visitor: " : "Ask Ayush: ") + m.content; }).join("\n");
        log("chatbot_lead", { name: name, email: email, message: msg, transcript: transcript });
        status.textContent = "Sent. Ayush will be in touch.";
        status.className = "msg ok";
        wrap.querySelectorAll("input,textarea,button").forEach(function(el){ el.disabled = true; });
      });
    }

    function askAI(){
      if (!aiAvailable) return Promise.resolve(null);
      return fetch(CHAT_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history })
      }).then(function(r){
        if (r.status === 503 || r.status === 404 || r.status === 405) aiAvailable = false;
        if (!r.ok) return null;
        return r.json().then(function(d){ return d && d.reply ? d.reply : null; });
      }).catch(function(){ return null; });
    }

    function send(text){
      text = String(text || "").trim();
      if (!text || busy) return;
      busy = true;
      sendBtn.disabled = true;
      input.value = "";
      clearPrompts();
      addRow("user", text);
      history.push({ role: "user", content: text });
      userTurns++;
      log("chatbot_log", { sender: "user", message: text });

      var typing = addTyping();
      var started = Date.now();
      askAI().then(function(reply){
        var answer = reply || localAnswer(text);
        var wait = Math.max(0, 450 - (Date.now() - started));
        setTimeout(function(){
          typing.remove();
          addRow("bot", answer);
          history.push({ role: "assistant", content: answer });
          log("chatbot_log", { sender: "bot", message: answer });
          if (userTurns >= 2) addLeadForm();
          addFollowUp();
          busy = false;
          sendBtn.disabled = false;
          input.focus();
        }, wait);
      });
    }

    sendBtn.addEventListener("click", function(){ send(input.value); });
    input.addEventListener("keydown", function(ev){ if (ev.key === "Enter") send(input.value); });

    function openWidget(){
      widget.classList.add("open");
      toggle.setAttribute("aria-expanded", "true");
      if (!opened){
        opened = true;
        var hint = document.createElement("div");
        hint.className = "loop-hint";
        hint.textContent = "How can I help?";
        body.appendChild(hint);
        addRow("bot", "Hi! I'm Ask Ayush, Ayush's AI assistant. Ask me anything about his experience, projects, products or product management journey.");
        addChips();
        log("chatbot_log", { sender: "bot", message: "session_start" });
      }
      setTimeout(function(){ input.focus(); }, 80);
    }
    function closeWidget(){
      widget.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    }

    toggle.addEventListener("click", function(){ widget.classList.contains("open") ? closeWidget() : openWidget(); });
    widget.querySelector(".loop-close").addEventListener("click", closeWidget);
    document.addEventListener("keydown", function(ev){ if (ev.key === "Escape") closeWidget(); });
    document.querySelectorAll("[data-open-loop]").forEach(function(el){
      el.addEventListener("click", function(ev){ ev.preventDefault(); openWidget(); });
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();

  window.LoopLog = log;
})();
