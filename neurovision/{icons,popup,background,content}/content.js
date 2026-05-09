// ============================================================
// NeuroVision AI — Content Script
// Injects result overlay + applies page-wide settings
// ============================================================

// ── Create overlay container ──────────────────────────────────
function createOverlay() {
  // remove existing overlay if any
  const existing = document.getElementById("neurovision-overlay");
  if (existing) existing.remove();

  const overlay = document.createElement("div");
  overlay.id = "neurovision-overlay";
  overlay.innerHTML = `
    <div id="nv-header">
      <span id="nv-title">🧠 NeuroVision AI</span>
      <button id="nv-close">✕</button>
    </div>
    <div id="nv-body">
      <div id="nv-loading" style="display:none">
        <div class="nv-spinner"></div>
        <p>Adapting content...</p>
      </div>
      <div id="nv-content" style="display:none">
        <div id="nv-mode-badge"></div>
        <div id="nv-section-label">✨ Adapted Text</div>
        <div id="nv-adapted-text"></div>
        <div id="nv-section-label2">📄 Original Text</div>
        <div id="nv-original-text"></div>
        <button id="nv-copy-btn">📋 Copy Adapted Text</button>
      </div>
      <div id="nv-error" style="display:none">
        <p>❌ Something went wrong. Check your API key.</p>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // close button
  document.getElementById("nv-close").addEventListener("click", () => {
    overlay.remove();
  });

  // copy button
  document.getElementById("nv-copy-btn").addEventListener("click", () => {
    const text = document.getElementById("nv-adapted-text").innerText;
    navigator.clipboard.writeText(text);
    document.getElementById("nv-copy-btn").innerText = "✅ Copied!";
    setTimeout(() => {
      document.getElementById("nv-copy-btn").innerText = "📋 Copy Adapted Text";
    }, 2000);
  });

  return overlay;
}

// ── Show loading state ────────────────────────────────────────
function showLoading() {
  createOverlay();
  document.getElementById("nv-loading").style.display = "flex";
  document.getElementById("nv-content").style.display = "none";
  document.getElementById("nv-error").style.display = "none";
}

// ── Show result ───────────────────────────────────────────────
function showResult(original, adapted, mode) {
  const modeLabels = {
    "neurovision-dyslexia": { label: "Dyslexia Mode", color: "#6c63ff" },
    "neurovision-adhd":     { label: "ADHD Mode",     color: "#ff6b6b" },
    "neurovision-simple":   { label: "Simple Mode",   color: "#20bf6b" }
  };

  const modeInfo = modeLabels[mode] || { label: "Adapted", color: "#333" };

  document.getElementById("nv-loading").style.display = "none";
  document.getElementById("nv-error").style.display = "none";
  document.getElementById("nv-content").style.display = "block";

  const badge = document.getElementById("nv-mode-badge");
  badge.innerText = modeInfo.label;
  badge.style.background = modeInfo.color;

  // render **bold** markdown
  const adaptedHtml = adapted
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br>");

  document.getElementById("nv-adapted-text").innerHTML = adaptedHtml;
  document.getElementById("nv-original-text").innerText = original;
}

// ── Show error ────────────────────────────────────────────────
function showError(error) {
  document.getElementById("nv-loading").style.display = "none";
  document.getElementById("nv-content").style.display = "none";
  document.getElementById("nv-error").style.display = "block";
  document.getElementById("nv-error").innerHTML = `<p>❌ ${error}</p>`;
}

// ── Apply page-wide accessibility settings ────────────────────
function applySettings(settings) {
  // remove existing settings style
  const existing = document.getElementById("nv-settings-style");
  if (existing) existing.remove();

  const style = document.createElement("style");
  style.id = "nv-settings-style";

  let css = "body, p, div, span, li, td, th, h1, h2, h3, h4, h5, h6 {";

  if (settings.font === "dyslexic") {
    // OpenDyslexic via CDN
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.cdnfonts.com/css/opendyslexic";
    link.id = "nv-dyslexic-font";
    if (!document.getElementById("nv-dyslexic-font")) {
      document.head.appendChild(link);
    }
    css += "font-family: 'OpenDyslexic', sans-serif !important;";
  } else if (settings.font === "readable") {
    css += "font-family: 'Arial', sans-serif !important;";
  }

  if (settings.fontSize) {
    css += `font-size: ${settings.fontSize}px !important;`;
  }

  if (settings.lineHeight) {
    css += `line-height: ${settings.lineHeight} !important;`;
  }

  if (settings.letterSpacing) {
    css += `letter-spacing: ${settings.letterSpacing}px !important;`;
  }

  css += "}";

  // color filters
  if (settings.colorFilter === "high-contrast") {
    css += "body { background: #000 !important; color: #fff !important; }";
    css += "a { color: #ffff00 !important; }";
  } else if (settings.colorFilter === "warm") {
    css += "html { filter: sepia(30%) !important; }";
  } else if (settings.colorFilter === "reduced") {
    css += "html { filter: saturate(50%) !important; }";
  } else if (settings.colorFilter === "none") {
    css += "html { filter: none !important; }";
  }

  style.innerText = css;
  document.head.appendChild(style);
}

// ── Listen for messages from background ───────────────────────
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "SHOW_LOADING") showLoading();
  if (message.type === "SHOW_RESULT")  showResult(message.original, message.adapted, message.mode);
  if (message.type === "SHOW_ERROR")   showError(message.error);
  if (message.type === "APPLY_SETTINGS") applySettings(message.settings);
});
