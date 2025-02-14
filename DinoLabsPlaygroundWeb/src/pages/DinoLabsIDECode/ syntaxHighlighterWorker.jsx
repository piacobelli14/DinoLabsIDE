// Import the parser functions needed for syntax highlighting.
// If you are using a bundler, ensure that these functions are available to the worker.
import { syntaxHighlight, escapeHtml } from "./DinoLabsIDEParser";

// Listen for messages from the main thread.
self.addEventListener("message", (e) => {
  const { viewCode, language, searchTerm, isCaseSensitive } = e.data;
  let highlighted;
  if ((language || "").toLowerCase() === "unknown") {
    highlighted = escapeHtml(viewCode).replace(/\n/g, "<br/>");
  } else {
    highlighted = syntaxHighlight(
      viewCode,
      language.toLowerCase(),
      searchTerm,
      isCaseSensitive
    );
  }
  // Post the highlighted code back to the main thread.
  self.postMessage({ highlighted });
});
