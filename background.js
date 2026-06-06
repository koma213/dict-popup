browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "fetchDefinition") {
    fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(request.word)}`)
      .then(response => response.json())
      .then(data => sendResponse({ data }))
      .catch(error => {
        console.error("Fetch error:", error);
        sendResponse({ error: "Network error" });
      });
    // Returning true is required to indicate we will respond asynchronously
    return true; 
  }
});