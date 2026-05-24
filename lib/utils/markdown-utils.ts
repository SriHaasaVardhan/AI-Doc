/**
 * Markdown download & clipboard utilities.
 * Client-side helpers for downloading generated documentation files.
 */

"use client";

/** Trigger a browser download of a markdown string as a file */
export function downloadMarkdown(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/** Download multiple markdown documents as individual files */
export function downloadAllDocs(docs: Record<string, string>): void {
  // Small delay between downloads to avoid browser blocking
  let delay = 0;
  for (const [docType, content] of Object.entries(docs)) {
    const filename = formatDocFilename(docType);
    setTimeout(() => downloadMarkdown(content, filename), delay);
    delay += 300;
  }
}

/** Copy text to clipboard, returns true on success */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers or non-secure contexts
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(textarea);
      return ok;
    } catch {
      return false;
    }
  }
}

/** Map a doc type slug to a proper filename */
export function formatDocFilename(docType: string): string {
  const mapping: Record<string, string> = {
    readme: "README.md",
    api: "API_DOCS.md",
    "api-docs": "API_DOCS.md",
    apiDocs: "API_DOCS.md",
    setup: "SETUP_GUIDE.md",
    "setup-guide": "SETUP_GUIDE.md",
    setupGuide: "SETUP_GUIDE.md",
    architecture: "ARCHITECTURE.md",
    contributing: "CONTRIBUTING.md",
    changelog: "CHANGELOG.md",
    folder: "FOLDER_STRUCTURE.md",
    folderStructure: "FOLDER_STRUCTURE.md",
    "folder-structure": "FOLDER_STRUCTURE.md",
    diagrams: "DIAGRAMS.md",
    health: "HEALTH_REPORT.md",
  };

  return mapping[docType] ?? `${docType.toUpperCase().replace(/\s+/g, "_")}.md`;
}
