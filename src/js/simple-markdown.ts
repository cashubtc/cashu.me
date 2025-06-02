// Simple Markdown parser to avoid external dependency
// Supports headings (#, ##, ###), bold, italics and basic unordered lists.
// Escapes HTML to reduce injection risk.

export function renderMarkdown(text: string): string {
  if (!text) return "";
  const escapeHtml = (str: string): string =>
    str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const lines = escapeHtml(text).split(/\r?\n/);
  let result = "";
  let inList = false;

  for (const line of lines) {
    if (/^\s*(?:\-|\*)\s+/.test(line)) {
      if (!inList) {
        result += "<ul>";
        inList = true;
      }
      const item = line.replace(/^\s*(?:\-|\*)\s+/, "");
      result += `<li>${item}</li>`;
      continue;
    }
    if (inList) {
      result += "</ul>";
      inList = false;
    }
    if (/^###\s+/.test(line)) {
      result += `<h3>${line.replace(/^###\s+/, "")}</h3>`;
    } else if (/^##\s+/.test(line)) {
      result += `<h2>${line.replace(/^##\s+/, "")}</h2>`;
    } else if (/^#\s+/.test(line)) {
      result += `<h1>${line.replace(/^#\s+/, "")}</h1>`;
    } else if (line.trim() === "") {
      result += "<br>";
    } else {
      result += `<p>${line}</p>`;
    }
  }
  if (inList) result += "</ul>";

  // Inline formatting
  result = result.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  result = result.replace(/\*(.+?)\*/g, "<em>$1</em>");
  return result;
}

export default renderMarkdown;
