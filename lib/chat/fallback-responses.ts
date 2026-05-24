import type { RepositorySummary } from "@/lib/parsers/types";
import type { ChatDocContext } from "./repository-context";

function matches(question: string, patterns: RegExp[]): boolean {
  const q = question.toLowerCase();
  return patterns.some((p) => p.test(q));
}

function listRoutes(summary: RepositorySummary): string[] {
  return summary.files.flatMap((file) =>
    file.routes.map((r) => `- \`${r.method} ${r.path}\`${r.handler ? ` (${r.handler})` : ""} — \`${file.filePath}\``)
  );
}

function listScripts(summary: RepositorySummary): string[] {
  return Object.entries(summary.scripts).map(
    ([name, cmd]) => `- \`${name}\`: \`${cmd}\``
  );
}

function listKeyFiles(summary: RepositorySummary, pattern: RegExp, limit = 8): string[] {
  return summary.files
    .filter((f) => pattern.test(f.filePath))
    .map((f) => `- \`${f.filePath}\``)
    .slice(0, limit);
}

function excerptFromDocs(docs: ChatDocContext | undefined, key: keyof ChatDocContext): string | undefined {
  const text = docs?.[key]?.trim();
  if (!text) return undefined;
  return text.length > 1200 ? `${text.slice(0, 1200).trimEnd()}…` : text;
}

/**
 * Rule-based answer used ONLY when AI providers are unavailable or fail.
 * Grounded in parsed repository intelligence and optional generated docs.
 */
export function buildFallbackChatResponse(
  question: string,
  summary: RepositorySummary,
  docs?: ChatDocContext
): string {
  const q = question.trim();
  const frameworks = summary.frameworks.join(", ") || "not detected";
  const routes = listRoutes(summary);
  const scripts = listScripts(summary);

  if (matches(q, [/architect|design|pattern|structure|organiz/])) {
    const archDoc = excerptFromDocs(docs, "architecture");
    if (archDoc) {
      return `### Architecture (${summary.name})\n\n${archDoc}\n\n*Generated from prior documentation analysis (AI unavailable).*`;
    }
    const parts = [
      `### Architecture overview — ${summary.name}`,
      `- **Stack:** ${frameworks}`,
      `- **Scale:** ${summary.totalFiles} files, ${summary.totalLines.toLocaleString()} lines`,
      `- **TypeScript:** ${summary.hasTypeScript ? "yes" : "no"} | **Tests:** ${summary.hasTests ? "yes" : "no"}`,
    ];
    if (summary.folderStructure) {
      parts.push("\n**Top-level layout:**\n```\n" + summary.folderStructure.split("\n").slice(0, 18).join("\n") + "\n```");
    }
    const mainClasses = summary.files
      .flatMap((f) => f.classes.map((c) => `\`${c.name}\` in \`${f.filePath}\``))
      .slice(0, 8);
    if (mainClasses.length) {
      parts.push("\n**Key classes:**\n" + mainClasses.map((c) => `- ${c}`).join("\n"));
    }
    parts.push("\n*Answer derived from parsed repository data (AI unavailable).*");
    return parts.join("\n");
  }

  if (matches(q, [/run|start|setup|install|local|dev|prerequisite|env/])) {
    const setupDoc = excerptFromDocs(docs, "setupGuide");
    if (setupDoc) {
      return `### Setup — ${summary.name}\n\n${setupDoc}\n\n*From generated setup guide (AI unavailable).*`;
    }
    const parts = [`### How to run **${summary.name}**`, `- **Package manager:** ${summary.packageManager || "unknown"}`];
    if (scripts.length) {
      parts.push("\n**Scripts:**\n" + scripts.join("\n"));
    }
    if (summary.envVars.length) {
      parts.push("\n**Environment variables:** " + summary.envVars.map((e) => `\`${e}\``).join(", "));
    }
    const deps = Object.keys(summary.dependencies).slice(0, 12);
    if (deps.length) {
      parts.push("\n**Key dependencies:** " + deps.join(", "));
    }
    parts.push("\n*Answer derived from package metadata (AI unavailable).*");
    return parts.join("\n");
  }

  if (matches(q, [/api|route|endpoint|rest/])) {
    const apiDoc = excerptFromDocs(docs, "apiDocs");
    if (apiDoc && routes.length === 0) {
      return `### API — ${summary.name}\n\n${apiDoc}\n\n*From generated API docs (AI unavailable).*`;
    }
    if (routes.length) {
      return `### API routes in **${summary.name}** (${routes.length})\n\n${routes.slice(0, 20).join("\n")}${routes.length > 20 ? `\n\n…and ${routes.length - 20} more` : ""}\n\n*Parsed from source files (AI unavailable).*`;
    }
    return `No HTTP routes were detected in the parsed files for **${summary.name}**. Check server entry points or framework-specific routing folders.\n\n*Parsed analysis only (AI unavailable).*`;
  }

  if (matches(q, [/auth|login|session|jwt|oauth|security/])) {
    const authFiles = listKeyFiles(summary, /auth|login|session|jwt|oauth|middleware|passport|clerk|nextauth/i);
    const authSymbols = summary.files.flatMap((f) => [
      ...f.functions.filter((fn) => /auth|login|session/i.test(fn.name)).map((fn) => `\`${fn.name}()\` in \`${f.filePath}\``),
      ...f.classes.filter((c) => /auth|login|session/i.test(c.name)).map((c) => `\`class ${c.name}\` in \`${f.filePath}\``),
    ]).slice(0, 10);

    if (!authFiles.length && !authSymbols.length) {
      return `No obvious authentication modules were found in **${summary.name}** during static analysis. Search for middleware, session providers, or auth libraries in dependencies.\n\n*Parsed analysis only (AI unavailable).*`;
    }
    const parts = [`### Authentication clues — ${summary.name}`];
    if (authFiles.length) parts.push("\n**Related files:**\n" + authFiles.join("\n"));
    if (authSymbols.length) parts.push("\n**Related symbols:**\n" + authSymbols.map((s) => `- ${s}`).join("\n"));
    const authDeps = Object.keys(summary.dependencies).filter((d) =>
      /auth|jwt|session|passport|clerk|next-auth|nextauth|bcrypt|argon/i.test(d)
    );
    if (authDeps.length) {
      parts.push("\n**Auth-related dependencies:** " + authDeps.join(", "));
    }
    parts.push("\n*Parsed analysis only (AI unavailable).*");
    return parts.join("\n");
  }

  if (matches(q, [/folder|director|file structure|layout|tree/])) {
    return `### Folder structure — ${summary.name}\n\n\`\`\`\n${summary.folderStructure || "(not available)"}\n\`\`\`\n\n*Parsed tree (AI unavailable).*`;
  }

  if (matches(q, [/depend|package|library|stack|framework|tech/])) {
    const mainDeps = Object.entries(summary.dependencies).slice(0, 15);
    const devDeps = Object.entries(summary.devDependencies).slice(0, 10);
    const parts = [
      `### Tech stack — ${summary.name}`,
      `- **Frameworks:** ${frameworks}`,
      `- **Languages:** ${Object.keys(summary.languages).join(", ") || "unknown"}`,
    ];
    if (mainDeps.length) {
      parts.push("\n**Dependencies:**\n" + mainDeps.map(([k, v]) => `- ${k}@${v}`).join("\n"));
    }
    if (devDeps.length) {
      parts.push("\n**Dev dependencies:**\n" + devDeps.map(([k, v]) => `- ${k}@${v}`).join("\n"));
    }
    return parts.join("\n") + "\n\n*From package manifests (AI unavailable).*";
  }

  if (matches(q, [/function|class|export|symbol|module/])) {
    const items = summary.files.flatMap((f) => {
      const fns = f.functions
        .filter((fn) => fn.isExported)
        .map((fn) => `- \`${fn.name}(${fn.params.join(", ")})\` — \`${f.filePath}\``);
      const cls = f.classes
        .filter((c) => c.isExported)
        .map((c) => `- \`class ${c.name}\`${c.methods.length ? ` — methods: ${c.methods.slice(0, 5).join(", ")}` : ""} — \`${f.filePath}\``);
      return [...fns, ...cls];
    }).slice(0, 18);

    if (!items.length) {
      return `No exported functions or classes were highlighted in the parse results for **${summary.name}**.\n\n*Parsed analysis only (AI unavailable).*`;
    }
    return `### Key symbols — ${summary.name}\n\n${items.join("\n")}\n\n*Parsed exports (AI unavailable).*`;
  }

  // Default: compact repo overview
  const readmeExcerpt = excerptFromDocs(docs, "readme");
  if (readmeExcerpt) {
    return `### About ${summary.name}\n\n${readmeExcerpt}\n\n*From generated README (AI unavailable).*`;
  }

  return [
    `### ${summary.name} — quick overview`,
    `- **Frameworks:** ${frameworks}`,
    `- **Files / lines:** ${summary.totalFiles} / ${summary.totalLines.toLocaleString()}`,
    routes.length ? `- **Routes detected:** ${routes.length}` : null,
    scripts.length ? `- **Scripts:** ${Object.keys(summary.scripts).join(", ")}` : null,
    summary.envVars.length ? `- **Env vars:** ${summary.envVars.join(", ")}` : null,
    "",
    "Try asking about architecture, setup, API routes, folder structure, or authentication.",
    "",
    "*Answer derived from parsed repository data (AI unavailable).*",
  ]
    .filter((line) => line !== null)
    .join("\n");
}
