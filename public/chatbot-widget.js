/**
 * LogicMate Chatbot Widget
 * Usage:
 *   <script>window.LMChatbot = { embedKey: "YOUR_EMBED_KEY", color: "#7c3aed" };</script>
 *   <script src="https://www.logicmate.io/chatbot-widget.js" async></script>
 */
(function () {
  if (typeof window === "undefined") return;
  if (window.__lmChatbotLoaded) return;
  window.__lmChatbotLoaded = true;

  var cfg = window.LMChatbot || {};
  var EMBED_KEY = cfg.embedKey;
  var COLOR = cfg.color || "#7c3aed";
  var API_URL = cfg.apiUrl || "https://api.logicmate.io/api/v1";
  var WELCOME = cfg.welcomeMessage || "Hi! How can I help you today?";
  var WELCOME_AR = cfg.welcomeMessageAr || "مرحباً! كيف أقدر أساعدك اليوم؟";
  var BOT_NAME = cfg.botName || "LogicMate Assistant";

  if (!EMBED_KEY) {
    console.error("[LMChatbot] Missing embedKey — widget not initialized.");
    return;
  }

  // ── Session ID (persisted per browser) ──────────────────────
  function getSessionId() {
    var key = "lm_chat_session_" + EMBED_KEY;
    var id = null;
    try { id = localStorage.getItem(key); } catch (e) {}
    if (!id) {
      id = "sess_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 10);
      try { localStorage.setItem(key, id); } catch (e) {}
    }
    return id;
  }
  var sessionId = getSessionId();

  // ── Detect RTL / Arabic preference ──────────────────────────
  var isAr = (navigator.language || "").toLowerCase().indexOf("ar") === 0;

  // ── Styles ───────────────────────────────────────────────────
  var css = ""
    + ".lm-cb-bubble{position:fixed;bottom:20px;" + (isAr ? "left:20px" : "right:20px") + ";width:58px;height:58px;border-radius:50%;background:" + COLOR + ";box-shadow:0 6px 24px rgba(0,0,0,0.25);cursor:pointer;z-index:999999;display:flex;align-items:center;justify-content:center;transition:transform .2s ease;border:none;}"
    + ".lm-cb-bubble:hover{transform:scale(1.06);}"
    + ".lm-cb-bubble svg{width:26px;height:26px;}"
    + ".lm-cb-panel{position:fixed;bottom:90px;" + (isAr ? "left:20px" : "right:20px") + ";width:360px;max-width:calc(100vw - 40px);height:520px;max-height:calc(100vh - 140px);background:#fff;border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,0.25);z-index:999999;display:none;flex-direction:column;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;}"
    + ".lm-cb-panel.open{display:flex;}"
    + ".lm-cb-header{background:" + COLOR + ";color:#fff;padding:16px 18px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;}"
    + ".lm-cb-header-title{font-size:14px;font-weight:700;}"
    + ".lm-cb-header-sub{font-size:11px;opacity:.85;margin-top:2px;}"
    + ".lm-cb-close{background:rgba(255,255,255,0.15);border:none;color:#fff;width:26px;height:26px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:16px;line-height:1;}"
    + ".lm-cb-messages{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px;background:#f7f7f9;}"
    + ".lm-cb-msg{max-width:80%;padding:9px 13px;border-radius:14px;font-size:13px;line-height:1.5;word-wrap:break-word;}"
    + ".lm-cb-msg.user{align-self:" + (isAr ? "flex-start" : "flex-end") + ";background:" + COLOR + ";color:#fff;border-bottom-" + (isAr ? "left" : "right") + "-radius:4px;}"
    + ".lm-cb-msg.bot{align-self:" + (isAr ? "flex-end" : "flex-start") + ";background:#fff;color:#111;border:1px solid #e5e5e5;border-bottom-" + (isAr ? "right" : "left") + "-radius:4px;}"
    + ".lm-cb-typing{align-self:" + (isAr ? "flex-end" : "flex-start") + ";display:flex;gap:4px;padding:10px 13px;background:#fff;border:1px solid #e5e5e5;border-radius:14px;}"
    + ".lm-cb-dot{width:6px;height:6px;border-radius:50%;background:#999;animation:lmcbBlink 1.2s infinite;}"
    + ".lm-cb-dot:nth-child(2){animation-delay:.2s;} .lm-cb-dot:nth-child(3){animation-delay:.4s;}"
    + "@keyframes lmcbBlink{0%,80%,100%{opacity:.3;}40%{opacity:1;}}"
    + ".lm-cb-inputbar{display:flex;align-items:center;gap:8px;padding:12px;border-top:1px solid #eee;background:#fff;flex-shrink:0;}"
    + ".lm-cb-input{flex:1;border:1px solid #ddd;border-radius:9999px;padding:9px 14px;font-size:13px;outline:none;font-family:inherit;}"
    + ".lm-cb-input:focus{border-color:" + COLOR + ";}"
    + ".lm-cb-send{background:" + COLOR + ";border:none;width:34px;height:34px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;}"
    + ".lm-cb-send svg{width:15px;height:15px;fill:#fff;}"
    + ".lm-cb-footer{text-align:center;padding:5px;font-size:10px;color:#aaa;background:#fff;}"
    + ".lm-cb-footer a{color:#aaa;text-decoration:none;}";

  var styleEl = document.createElement("style");
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  // ── Bubble ───────────────────────────────────────────────────
  var bubble = document.createElement("button");
  bubble.className = "lm-cb-bubble";
  bubble.setAttribute("aria-label", "Open chat");
  bubble.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>';

  // ── Panel ────────────────────────────────────────────────────
  var panel = document.createElement("div");
  panel.className = "lm-cb-panel";
  panel.innerHTML =
    '<div class="lm-cb-header">'
    + '<div><div class="lm-cb-header-title">' + escapeHtml(BOT_NAME) + '</div><div class="lm-cb-header-sub">' + (isAr ? "عادة يرد خلال دقائق" : "Usually replies in a few seconds") + '</div></div>'
    + '<button class="lm-cb-close" aria-label="Close">×</button>'
    + '</div>'
    + '<div class="lm-cb-messages" id="lm-cb-messages"></div>'
    + '<div class="lm-cb-inputbar">'
    + '<input class="lm-cb-input" id="lm-cb-input" type="text" placeholder="' + (isAr ? "اكتب رسالتك..." : "Type a message...") + '" />'
    + '<button class="lm-cb-send" id="lm-cb-send" aria-label="Send"><svg viewBox="0 0 24 24"><path d="M2 21l21-9L2 3v7l15 2-15 2z"></path></svg></button>'
    + '</div>'
    + '<div class="lm-cb-footer">' + (isAr ? "بدعم من" : "Powered by") + ' <a href="https://www.logicmate.io" target="_blank" rel="noopener">LogicMate</a></div>';

  document.body.appendChild(bubble);
  document.body.appendChild(panel);

  var messagesEl = panel.querySelector("#lm-cb-messages");
  var inputEl = panel.querySelector("#lm-cb-input");
  var sendBtn = panel.querySelector("#lm-cb-send");
  var closeBtn = panel.querySelector(".lm-cb-close");

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function addMessage(role, text) {
    var el = document.createElement("div");
    el.className = "lm-cb-msg " + (role === "user" ? "user" : "bot");
    el.textContent = text;
    messagesEl.appendChild(el);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function showTyping() {
    var el = document.createElement("div");
    el.className = "lm-cb-typing";
    el.id = "lm-cb-typing-indicator";
    el.innerHTML = '<div class="lm-cb-dot"></div><div class="lm-cb-dot"></div><div class="lm-cb-dot"></div>';
    messagesEl.appendChild(el);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function hideTyping() {
    var el = document.getElementById("lm-cb-typing-indicator");
    if (el) el.remove();
  }

  var opened = false;
  function openPanel() {
    panel.classList.add("open");
    opened = true;
    if (messagesEl.children.length === 0) {
      addMessage("bot", isAr ? WELCOME_AR : WELCOME);
    }
    setTimeout(function () { inputEl.focus(); }, 50);
  }
  function closePanel() {
    panel.classList.remove("open");
    opened = false;
  }

  bubble.addEventListener("click", function () {
    if (opened) closePanel(); else openPanel();
  });
  closeBtn.addEventListener("click", closePanel);

  var sending = false;
  function send() {
    var text = inputEl.value.trim();
    if (!text || sending) return;
    addMessage("user", text);
    inputEl.value = "";
    sending = true;
    sendBtn.disabled = true;
    showTyping();

    fetch(API_URL + "/chat/" + EMBED_KEY, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: sessionId, message: text, channel: "website" }),
    })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        hideTyping();
        addMessage("bot", data.reply || (isAr ? "عذراً، صار خطأ. حاول مرة ثانية." : "Sorry, something went wrong. Please try again."));
      })
      .catch(function () {
        hideTyping();
        addMessage("bot", isAr ? "عذراً، صار خطأ. حاول مرة ثانية." : "Sorry, something went wrong. Please try again.");
      })
      .finally(function () {
        sending = false;
        sendBtn.disabled = false;
      });
  }

  sendBtn.addEventListener("click", send);
  inputEl.addEventListener("keydown", function (e) {
    if (e.key === "Enter") send();
  });
})();
