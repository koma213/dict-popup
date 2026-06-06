# Dict Popup

A lightweight Firefox extension that shows instant word definitions in a clean inline popup — just double-click any word on any page.

Powered by the [Free Dictionary API](https://dictionaryapi.dev/), which is Wiktionary-backed. This means broad coverage including obscure, archaic, and technical words that most dictionary extensions miss.

---

## Features

- **Double-click any word** to see its definition inline — no new tabs, no page navigation
- **Three themes** — dark, light, and sepia
- **Phonetic spelling** — optional IPA transcription in the popup header
- **Pronunciation audio** — optional playback button
- **Synonyms** — shown on demand (clickable link) or always visible, scoped per-word or per-definition
- **Alt-key modifier** — optionally require Alt to be held during double-click, so lookups only fire when you want them
- **Quick dismiss** — press Escape or click anywhere outside the popup to close
- Up to 3 parts of speech and 2 definitions each, kept compact and readable

## Options

Right-click the extension icon → **Manage Extension** → **Preferences**, or visit `about:addons` and click Dict Popup's settings.

| Option | Description |
|---|---|
| Theme | Dark / Light / Sepia |
| Require Alt Key | Only trigger on Alt + double-click |
| Synonym Display | Prompt (click to reveal) / Always / Disabled |
| Synonym Scope | Per Word (shown once at bottom) / Per Definition |
| Show Phonetics | Display IPA phonetic string |
| Show Audio Button | Play pronunciation audio |

## Privacy

Dict Popup collects and transmits **no personal data**. The only network request made is the word you look up, sent to `api.dictionaryapi.dev` to fetch its definition. Nothing is logged, stored externally, or tracked.

## Installation

### Signed .xpi (recommended)

Download the latest signed release from the [Releases page](https://github.com/koma213/dict-popup/releases) and drag the `.xpi` file onto any Firefox window. Because it's Mozilla-signed it installs permanently and survives restarts.

### Manual / Developer Install

1. Clone or download this repo
2. Open Firefox and go to `about:debugging`
3. Click **This Firefox** → **Load Temporary Add-on**
4. Select `manifest.json` from the repo folder

> Note: Temporary installs are removed when Firefox closes. For a permanent install use the signed .xpi above.

## License

[MIT](LICENSE)
