// ============================================================
// NeuroVision AI — Popup Script
// Reads settings from UI and sends to content script
// ============================================================

// ── Live range value display ──────────────────────────────────
document.getElementById("fontSize").addEventListener("input", (e) => {
  document.getElementById("fontSizeVal").innerText = e.target.value + "px";
});

document.getElementById("lineHeight").addEventListener("input", (e) => {
  document.getElementById("lineHeightVal").innerText = e.target.value;
});

document.getElementById("letterSpacing").addEventListener("input", (e) => {
  document.getElementById("letterSpacingVal").innerText = e.target.value + "px";
});

// ── Load saved settings ───────────────────────────────────────
chrome.storage.sync.get("nvSettings", (data) => {
  if (data.nvSettings) {
    const s = data.nvSettings;
    if (s.font)          document.getElementById("font").value = s.font;
    if (s.fontSize)      document.getElementById("fontSize").value = s.fontSize;
    if (s.lineHeight)    document.getElementById("lineHeight").value = s.lineHeight;
    if (s.letterSpacing) document.getElementById("letterSpacing").value = s.letterSpacing;
    if (s.colorFilter)   document.getElementById("colorFilter").value = s.colorFilter;

    document.getElementById("fontSizeVal").innerText      = (s.fontSize || 16) + "px";
    document.getElementById("lineHeightVal").innerText    = s.lineHeight || 1.5;
    document.getElementById("letterSpacingVal").innerText = (s.letterSpacing || 0) + "px";
  }
});

// ── Apply button ──────────────────────────────────────────────
document.getElementById("applyBtn").addEventListener("click", () => {
  const settings = {
    font:          document.getElementById("font").value,
    fontSize:      document.getElementById("fontSize").value,
    lineHeight:    document.getElementById("lineHeight").value,
    letterSpacing: document.getElementById("letterSpacing").value,
    colorFilter:   document.getElementById("colorFilter").value
  };

  // save settings
  chrome.storage.sync.set({ nvSettings: settings });

  // send to active tab
  chrome.runtime.sendMessage({
    type: "APPLY_PAGE_SETTINGS",
    settings: settings
  });

  // visual feedback
  const btn = document.getElementById("applyBtn");
  btn.innerText = "✅ Applied!";
  btn.style.background = "#20bf6b";
  setTimeout(() => {
    btn.innerText = "✅ Apply to This Page";
    btn.style.background = "#6c63ff";
  }, 1500);
});

// ── Reset button ──────────────────────────────────────────────
document.getElementById("resetBtn").addEventListener("click", () => {
  const resetSettings = {
    font: "default",
    fontSize: 16,
    lineHeight: 1.5,
    letterSpacing: 0,
    colorFilter: "none"
  };

  chrome.storage.sync.set({ nvSettings: resetSettings });

  chrome.runtime.sendMessage({
    type: "APPLY_PAGE_SETTINGS",
    settings: resetSettings
  });

  // reset UI
  document.getElementById("font").value          = "default";
  document.getElementById("fontSize").value      = 16;
  document.getElementById("lineHeight").value    = 1.5;
  document.getElementById("letterSpacing").value = 0;
  document.getElementById("colorFilter").value   = "none";
  document.getElementById("fontSizeVal").innerText      = "16px";
  document.getElementById("lineHeightVal").innerText    = "1.5";
  document.getElementById("letterSpacingVal").innerText = "0px";
});
