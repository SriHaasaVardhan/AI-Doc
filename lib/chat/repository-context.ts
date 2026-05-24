import type { RepositorySummary } from "@/lib/parsers/types";
import { buildCompactSummary } from "@/lib/utils/summarizer";
import { truncateToTokenLimit } from "@/lib/ai/token-estimator";

export interface ChatDocContext {
  readme?: string;
  setupGuide?: string;
  architecture?: string;
  apiDocs?: string;
}

const DOC_EXCERPT_LIMIT = 900;

function excerpt(text: string | undefined, maxChars: number): string {
  if (!text?.trim()) return "";
  const trimmed = text.trim();
  if (trimmed.length <= maxChars) return trimmed;
  return `${trimmed.slice(0, maxChars).trimEnd()}…`;
}

function buildMetadataBlock(summary: RepositorySummary): string {
  const lines: string[] = ["## Repository metadata"];

  lines.push(`- Name: ${summary.name}`);
  lines.push(`- Files: ${summary.totalFiles} | Lines: ${summary.totalLines}`);
  lines.push(`- Package manager: ${summary.packageManager || "unknown"}`);
  lines.push(`- TypeScript: ${summary.hasTypeScript ? "yes" : "no"}`);
  lines.push(`- Tests detected: ${summary.hasTests ? "yes" : "no"}`);
  lines.push(`- Linting detected: ${summary.hasLinting ? "yes" : "no"}`);

  const langs = Object.entries(summary.languages)
    .sort((a, b) => b[1] - a[1])
    .map(([lang, count]) => `${lang} (${count} files)`);
  if (langs.length) {
    lines.push(`- Languages: ${langs.join(", ")}`);
  }

  if (summary.frameworks.length) {
    lines.push(`- Frameworks: ${summary.frameworks.join(", ")}`);
  }

  const depCount = Object.keys(summary.dependencies).length;
  const devDepCount = Object.keys(summary.devDependencies).length;
  if (depCount || devDepCount) {
    lines.push(`- Dependencies: ${depCount} prod, ${devDepCount} dev`);
  }

  const routeCount = summary.files.reduce((n, f) => n + f.routes.length, 0);
  const fnCount = summary.files.reduce((n, f) => n + f.functions.length, 0);
  const classCount = summary.files.reduce((n, f) => n + f.classes.length, 0);
  lines.push(`- Parsed symbols: ${routeCount} routes, ${fnCount} functions, ${classCount} classes`);

  if (summary.envVars.length) {
    lines.push(`- Env vars (detected): ${summary.envVars.join(", ")}`);
  }

  return lines.join("\n");
}

function buildGeneratedDocsBlock(docs?: ChatDocContext): string {
  if (!docs) return "";

  const sections: string[] = [];
  const perSection = Math.floor(DOC_EXCERPT_LIMIT / 4);

  const add = (label: string, content?: string) => {
    const excerpted = excerpt(content, perSection);
    if (excerpted) sections.push(`### ${label}\n${excerpted}`);
  };

  add("README (generated)", docs.readme);
  add("Setup guide (generated)", docs.setupGuide);
  add("Architecture (generated)", docs.architecture);
  add("API docs (generated)", docs.apiDocs);

  if (!sections.length) return "";
  return `## Prior generated documentation\n${sections.join("\n\n")}`;
}

/**
 * Builds a single context block for repository chat prompts.
 * Uses parsed intelligence plus optional generated doc excerpts.
 */
export function buildRepositoryChatContext(
  summary: RepositorySummary,
  docs?: ChatDocContext
): string {
  const parts = [
    buildMetadataBlock(summary),
    "## Parsed repository intelligence",
    buildCompactSummary(summary),
    buildGeneratedDocsBlock(docs),
  ].filter(Boolean);

  return truncateToTokenLimit(parts.join("\n\n"), 4000);
}
