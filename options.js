const defaults = {
  requireAlt: false,
  theme: "dark",
  synonyms: "prompt",
  synScope: "word",
  showPhonetic: false,
  showAudio: false
};

browser.storage.local.get(defaults).then(prefs => {
  document.getElementById("requireAlt").checked   = prefs.requireAlt;
  document.getElementById("theme").value          = prefs.theme;
  document.getElementById("synonyms").value       = prefs.synonyms;
  document.getElementById("synScope").value       = prefs.synScope;
  document.getElementById("showPhonetic").checked = prefs.showPhonetic;
  document.getElementById("showAudio").checked    = prefs.showAudio;
});

document.getElementById("save").addEventListener("click", () => {
  browser.storage.local.set({
    requireAlt:   document.getElementById("requireAlt").checked,
    theme:        document.getElementById("theme").value,
    synonyms:     document.getElementById("synonyms").value,
    synScope:     document.getElementById("synScope").value,
    showPhonetic: document.getElementById("showPhonetic").checked,
    showAudio:    document.getElementById("showAudio").checked,
  }).then(() => {
    const s = document.getElementById("saved");
    s.style.opacity = 1;
    setTimeout(() => s.style.opacity = 0, 1500);
  });
});
