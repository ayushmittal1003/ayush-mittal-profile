(function(){
  "use strict";
  var EMAIL = "ayushproduct1210@gmail.com";
  var esc = function(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]; }); };

  document.addEventListener("click", async function(ev){
    var t = ev.target.closest("button");
    if (!t) return;
    if (t.id === "copy-email" || t.dataset.copy){
      var txt = t.dataset.copy ? document.getElementById(t.dataset.copy).textContent : EMAIL;
      var label = t.textContent;
      try { await navigator.clipboard.writeText(txt); t.textContent = "Copied"; }
      catch(e){
        var node = document.getElementById(t.dataset.copy || "email-v");
        var r = document.createRange(); r.selectNodeContents(node);
        var s = getSelection(); s.removeAllRanges(); s.addRange(r);
        t.textContent = "Selected, press Ctrl+C";
      }
      setTimeout(function(){ t.textContent = label; }, 2200);
    }
  });

  (function reel(){
    var root = document.getElementById("reel");
    if (!root) return;
    var track = document.getElementById("reel-track");
    var count = document.getElementById("reel-count");
    var originals = Array.prototype.slice.call(track.children);
    var n = originals.length;
    originals.forEach(function(f){
      var c = f.cloneNode(true);
      c.setAttribute("aria-hidden", "true");
      c.classList.add("in");
      track.appendChild(c);
    });
    var all = track.children;
    var reduced = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    var idx = 0, timer = null, paused = false;
    var pad = function(v){ return (v < 10 ? "0" : "") + v; };

    function step(){ return all[1].offsetLeft - all[0].offsetLeft; }
    function place(animate){
      track.classList.toggle("moving", !!animate);
      track.style.transform = "translateX(" + (-idx * step()) + "px)";
      count.textContent = "Scene " + pad((idx % n) + 1) + " / " + pad(n);
    }
    function flash(i){
      var f = all[i];
      if (!f || reduced) return;
      f.classList.remove("flash"); void f.offsetWidth; f.classList.add("flash");
    }
    function go(delta){
      if (delta < 0 && idx === 0){ idx = n; place(false); void track.offsetWidth; }
      idx += delta;
      place(!reduced);
      flash(idx);
      if (reduced && idx >= n){ idx = 0; place(false); }
    }
    track.addEventListener("transitionend", function(){
      if (idx >= n){ idx = 0; place(false); }
    });
    function tick(){ if (!paused) go(1); }
    function start(){ if (!reduced && !timer) timer = setInterval(tick, 3000); }

    document.getElementById("reel-next").addEventListener("click", function(){ go(1); });
    document.getElementById("reel-prev").addEventListener("click", function(){ go(-1); });
    root.addEventListener("mouseenter", function(){ paused = true; });
    root.addEventListener("mouseleave", function(){ paused = false; });
    root.addEventListener("focusin", function(){ paused = true; });
    root.addEventListener("focusout", function(){ paused = false; });
    window.addEventListener("resize", function(){ place(false); });

    if (reduced){ root.classList.remove("intro"); place(false); return; }
    originals.forEach(function(f, i){ setTimeout(function(){ f.classList.add("in"); }, 200 + i * 360); });
    setTimeout(function(){
      root.classList.remove("intro");
      originals.forEach(function(f){ f.classList.remove("in"); });
      start();
    }, 200 + n * 360 + 800);
  })();

  document.addEventListener("submit", function(ev){
    if (ev.target.id !== "contact-form") return;
    ev.preventDefault();
    var f = function(id){ return document.getElementById(id); };
    var name = f("f-name").value.trim();
    var email = f("f-email").value.trim();
    var company = f("f-company").value.trim();
    var type = f("f-type").value;
    var msg = f("f-msg").value.trim();
    var bad = [];
    f("f-name").setAttribute("aria-invalid", String(!name)); if (!name) bad.push("your name");
    var okEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    f("f-email").setAttribute("aria-invalid", String(!okEmail)); if (!okEmail) bad.push("a valid email");
    f("f-msg").setAttribute("aria-invalid", String(!msg)); if (!msg) bad.push("a message");
    var st = f("f-status");
    if (bad.length){ st.textContent = "Add " + bad.join(", ") + " to send."; st.className = "status err"; return; }

    if (window.LoopLog) window.LoopLog("contact_form", { name: name, email: email, company: company, subject: type, message: msg });

    var subject = type + " — " + name + (company ? " (" + company + ")" : "");
    var body = "Hi Ayush,\n\n" + msg + "\n\n— " + name + (company ? ", " + company : "") + "\n" + email;
    var href = "mailto:" + EMAIL + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
    st.textContent = "Your message is ready and has been logged.";
    st.className = "status ok";
    var box = f("f-ready");
    box.innerHTML = '<div class="ready"><strong>If your email app didn’t open, copy this and send it to ' + EMAIL + '.</strong><pre id="f-copytext">Subject: ' + esc(subject) + '\n\n' + esc(body) + '</pre><div class="cta"><a class="btn sm" href="' + esc(href) + '">Open in email app</a><button class="btn ghost sm" type="button" data-copy="f-copytext">Copy message</button></div></div>';
    box.hidden = false;
    window.location.href = href;
  });
})();
