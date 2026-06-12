export function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function statusLabel(status) {
  if (status === "mastered") return "已掌握";
  if (status === "learning") return "学习中";
  return "新词";
}

export function statusClass(status) {
  if (status === "mastered") return "mastered";
  if (status === "learning") return "learning";
  return "new";
}

export function normalizeLevel(level) {
  if (level === "IELTS") return "雅思";
  return level || "词库";
}

export function highlightWord(example, word) {
  const safeExample = escapeHtml(example);
  const escapedWord = escapeRegExp(word);
  return safeExample.replace(new RegExp(`\\b(${escapedWord})\\b`, "gi"), "<strong>$1</strong>");
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function createPage(className = "") {
  const page = document.createElement("section");
  page.className = `page ${className}`.trim();
  return page;
}

export function setHTML(target, html) {
  target.innerHTML = html;
  return target;
}

export function downloadJSON(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
