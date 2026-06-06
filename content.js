(() => {
  const POPUP_CLASS = "__dict_popup__";
  let popupCounter = 0;

  const defaults = {
    requireAlt: false,
    theme: "dark",
    synonyms: "prompt",
    synScope: "word",      // "word" | "definition"
    showPhonetic: false,
    showAudio: false
  };

  function getPrefs() {
    return browser.storage.local.get(defaults);
  }

  function removeAllPopups() {
    document.querySelectorAll(`.${POPUP_CLASS}`).forEach(el => el.remove());
  }

  function isInsideAnyPopup(el) {
    return el.closest(`.${POPUP_CLASS}`) !== null;
  }

  function buildSynLine(syns) {
    const el = document.createElement("div");
    el.className = "dp-syns";
    el.textContent = syns.join(", ");
    return el;
  }

  function makeSynDisplay(syns, prefs, popup) {
    if (!syns.length) return;
    if (prefs.synonyms === "always") {
      popup.appendChild(buildSynLine(syns));
    } else {
      const link = document.createElement("div");
      link.className = "dp-syn-link";
      link.textContent = "synonyms";
      link.addEventListener("click", e => {
        e.stopPropagation();
        link.replaceWith(buildSynLine(syns));
      });
      popup.appendChild(link);
    }
  }

  function buildPopup(data, prefs, x, y) {
    const entry = data[0];
    const id = `__dict_popup_${++popupCounter}__`;

    const popup = document.createElement("div");
    popup.id = id;
    popup.className = POPUP_CLASS;
    popup.setAttribute("data-dp-theme", prefs.theme);

    // Header
    const header = document.createElement("div");
    header.className = "dp-header";

    const wordEl = document.createElement("span");
    wordEl.className = "dp-word";
    wordEl.textContent = entry.word;
    header.appendChild(wordEl);

    if (prefs.showPhonetic || prefs.showAudio) {
      const phoneticText = entry.phonetics?.find(p => p.text)?.text || entry.phonetic || null;
      const audioUrl     = entry.phonetics?.find(p => p.audio)?.audio || null;

      if (prefs.showPhonetic && phoneticText) {
        const ph = document.createElement("span");
        ph.className = "dp-phonetic";
        ph.textContent = phoneticText;
        header.appendChild(ph);
      }

      if (prefs.showAudio && audioUrl) {
        const btn = document.createElement("button");
        btn.className = "dp-audio-btn";
        btn.title = "Play pronunciation";
        btn.textContent = "▶";
        btn.addEventListener("click", e => {
          e.stopPropagation();
          new Audio(audioUrl).play().catch(() => {
            btn.textContent = "✖";
            setTimeout(() => { btn.textContent = "▶"; }, 2000);
          });
        });
        header.appendChild(btn);
      }
    }

    popup.appendChild(header);

    // Collect all word-level synonyms upfront if scope is "word"
    const wordSyns = prefs.synScope === "word" ? [...new Set(
      entry.meanings.flatMap(m =>
        (m.synonyms || []).concat(m.definitions.flatMap(d => d.synonyms || []))
      )
    )].slice(0, 10) : [];

    // Meanings
    entry.meanings.slice(0, 3).forEach(meaning => {
      const pos = document.createElement("div");
      pos.className = "dp-pos";
      pos.textContent = meaning.partOfSpeech;
      popup.appendChild(pos);

      meaning.definitions.slice(0, 2).forEach((def, i) => {
        const row = document.createElement("div");
        row.className = "dp-def";
        row.textContent = `${i + 1}. ${def.definition}`;
        popup.appendChild(row);
      });

      // Per-definition synonyms
      if (prefs.synonyms !== "off" && prefs.synScope === "definition") {
        const syns = [...new Set(
          meaning.definitions.flatMap(d => d.synonyms || [])
            .concat(meaning.synonyms || [])
        )].slice(0, 8);
        makeSynDisplay(syns, prefs, popup);
      }
    });

    // Whole-word synonyms shown once at the bottom
    if (prefs.synonyms !== "off" && prefs.synScope === "word") {
      makeSynDisplay(wordSyns, prefs, popup);
    }

    positionPopup(popup, x, y);
    return popup;
  }

  function positionPopup(popup, x, y) {
    popup.style.left = "0px";
    popup.style.top  = "0px";
    if (!popup.isConnected) document.body.appendChild(popup);

    requestAnimationFrame(() => {
      const pw = popup.offsetWidth || 300;
      const ph = popup.offsetHeight || 20;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const sx = window.scrollX;
      const sy = window.scrollY;

      let left = x + sx;
      let top  = y + sy + 22; // Added slight offset to clear the cursor

      if (left + pw > vw + sx) left = vw + sx - pw - 8;
      if (top  + ph > vh + sy) top  = y  + sy - ph - 8;

      popup.style.left = `${left}px`;
      popup.style.top  = `${top}px`;
    });
  }

  function showPopup(word, x, y) {
    const placeholderId = `__dict_popup_${popupCounter + 1}__`;
    const placeholder = document.createElement("div");
    placeholder.id = placeholderId;
    placeholder.className = `${POPUP_CLASS} dp-loading`;
    placeholder.setAttribute("data-dp-theme", "dark");
    placeholder.textContent = "Looking up…";
    positionPopup(placeholder, x, y);

    Promise.all([
      getPrefs(),
      browser.runtime.sendMessage({ type: "fetchDefinition", word: word })
    ]).then(([prefs, response]) => {
      if (!document.getElementById(placeholderId)) return;

      const data = response?.data;
      if (!Array.isArray(data) || !data[0]?.meanings?.length) {
        placeholder.textContent = `No definition found.`;
        placeholder.classList.remove('dp-loading');
        placeholder.setAttribute("data-dp-theme", prefs.theme);
        setTimeout(() => { if (placeholder) placeholder.remove(); }, 2500);
        return;
      }

      const popup = buildPopup(data, prefs, x, y);
      placeholder.replaceWith(popup);
    }).catch(() => {
      const el = document.getElementById(placeholderId);
      if (el) el.textContent = "Network error — check your connection.";
    });
  }

  document.addEventListener("dblclick", e => {
    getPrefs().then(prefs => {
      if (prefs.requireAlt && !e.altKey) return;
      // Improved regex to support Unicode/accented characters
      const word = (window.getSelection()?.toString().trim() || "").replace(/[^\p{L}\p{M}'-]/gu, "");
      if (!word) return;
      if (!isInsideAnyPopup(e.target)) removeAllPopups();
      showPopup(word, e.clientX, e.clientY);
      e.stopPropagation();
    });
  });

  document.addEventListener("click", e => {
    if (!isInsideAnyPopup(e.target)) removeAllPopups();
  });

  document.addEventListener("keydown", e => {
    if (e.key === "Escape") removeAllPopups();
  });
})();
