const defaults = {
  requireAlt: false,
  theme: "dark",
  synonyms: "prompt",
  synScope: "word",
  showPhonetic: false,
  showAudio: false
};

function saveOptions() {
  const prefs = {
    requireAlt: document.getElementById('requireAlt').checked,
    theme: document.getElementById('theme').value,
    synonyms: document.getElementById('synonyms').value,
    synScope: document.getElementById('synScope').value,
    showPhonetic: document.getElementById('showPhonetic').checked,
    showAudio: document.getElementById('showAudio').checked
  };

  browser.storage.local.set(prefs).then(() => {
    const status = document.getElementById('status');
    status.textContent = 'Settings saved.';
    document.body.setAttribute('data-theme', prefs.theme);
    setTimeout(() => { status.textContent = ''; }, 2000);
  });
}

function restoreOptions() {
  browser.storage.local.get(defaults).then(prefs => {
    Object.keys(prefs).forEach(key => {
      const el = document.getElementById(key);
      if (el.type === 'checkbox') el.checked = prefs[key];
      else el.value = prefs[key];
    });
    document.body.setAttribute('data-theme', prefs.theme);
  });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelectorAll('input, select').forEach(el => el.addEventListener('change', saveOptions));