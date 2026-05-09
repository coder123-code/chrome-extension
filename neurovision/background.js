// ============================================================
// NeuroVision AI — Background Service Worker
// Handles: context menu, Groq API calls, messaging
// ============================================================

const GROQ_API_KEY = "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"; // get free at console.groq.com
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

// ── Create right-click context menu ──────────────────────────
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "neurovision-dyslexia",
    title: "🧠 Simplify for Dyslexia",
    contexts: ["selection"]
  });

  chrome.contextMenus.create({
    id: "neurovision-adhd",
    title: "⚡ Simplify for ADHD",
    contexts: ["selection"]
  });

  chrome.contextMenus.create({
    id: "neurovision-simple",
    title: "✨ Make Simpler (Plain English)",
    contexts: ["selection"]
  });
});

// ── Handle context menu clicks ────────────────────────────────
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const selectedText = info.selectionText;
  if (!selectedText) return;

  // tell content script to show loading
  chrome.tabs.sendMessage(tab.id, { type: "SHOW_LOADING" });

  let prompt = "";

  if (info.menuItemId === "neurovision-dyslexia") {
    prompt = `You are helping a person with dyslexia. 
Rewrite the following text with:
- Short sentences (max 10 words each)
- Simple, common words only
- No jargon or complex vocabulary
- Clear paragraph breaks
- Bullet points where possible

Text: "${selectedText}"

Return ONLY the rewritten text, nothing else.`;

  } else if (info.menuItemId === "neurovision-adhd") {
    prompt = `You are helping a person with ADHD. 
Rewrite the following text with:
- Very short sentences
- Bold the most important words (use **word**)
- Remove all unnecessary filler words
- Use bullet points for any list of ideas
- Put the most important point FIRST
- Maximum 3 sentences per paragraph

Text: "${selectedText}"

Return ONLY the rewritten text, nothing else.`;

  } else if (info.menuItemId === "neurovision-simple") {
    prompt = `Rewrite the following text in the simplest possible plain English.
Use words a 10-year-old would understand.
Keep all the important information but make it very easy to read.

Text: "${selectedText}"

Return ONLY the rewritten text, nothing else.`;
  }

  try {
    const result = await callGroq(prompt);
    chrome.tabs.sendMessage(tab.id, {
      type: "SHOW_RESULT",
      original: selectedText,
      adapted: result,
      mode: info.menuItemId
    });
  } catch (err) {
    chrome.tabs.sendMessage(tab.id, {
      type: "SHOW_ERROR",
      error: err.message
    });
  }
});

// ── Groq API call ─────────────────────────────────────────────
async function callGroq(prompt) {
  const response = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: "llama3-8b-8192",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 1024
    })
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
}

// ── Handle messages from popup ────────────────────────────────
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "APPLY_PAGE_SETTINGS") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {
        type: "APPLY_SETTINGS",
        settings: message.settings
      });
    });
  }
});
