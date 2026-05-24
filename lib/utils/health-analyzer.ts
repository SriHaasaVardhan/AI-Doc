/**
 * Codebase Health Analyzer — heuristic-based scoring engine.
 * Evaluates architecture quality, documentation, dependency risk,
 * complexity, and maintainability. All scores are 0-100.
 */

import type { RepositorySummary, ParseResult } from "@/lib/parsers/types";

export interface HealthAnalysis {
  overallScore: number;
  architecture: number;
  documentation: number;
  dependencyRisk: "low" | "medium" | "high";
  complexity: number;
  maintainability: number;
  hasTests: boolean;
  hasLinting: boolean;
  hasTypeScript: boolean;
  suggestions: string[];
}

// ─── Scoring Helpers ────────────────────────────────────────────────────────

function clamp(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, value));
}

/** Get unique top-level directories from file paths */
function getTopLevelDirs(files: ParseResult[]): Set<string> {
  const dirs = new Set<string>();
  for (const f of files) {
    const parts = f.filePath.split("/").filter(Boolean);
    if (parts.length > 1) dirs.add(parts[0]);
  }
  return dirs;
}

/** Check if any file path matches a pattern */
function hasFileMatching(files: ParseResult[], pattern: RegExp): boolean {
  return files.some((f) => pattern.test(f.filePath));
}

/** Check if a specific filename exists at any level */
function hasFile(files: ParseResult[], name: string): boolean {
  return files.some((f) => {
    const filename = f.filePath.split("/").pop() ?? "";
    return filename.toLowerCase() === name.toLowerCase();
  });
}

// ─── Architecture Score ─────────────────────────────────────────────────────

function scoreArchitecture(summary: RepositorySummary): number {
  let score = 0;
  const files = summary.files;
  const dirs = getTopLevelDirs(files);

  // +20 if has clear folder structure (>3 top-level dirs)
  if (dirs.size > 3) score += 20;
  else if (dirs.size > 1) score += 10;

  // +20 if has config files (tsconfig, eslint, etc.)
  const configPatterns = /tsconfig|eslint|\.prettierrc|jest\.config|vite\.config|next\.config|webpack/;
  if (hasFileMatching(files, configPatterns)) score += 20;

  // +15 if has separation of concerns (routes/models/services/components)
  const concernDirs = ["routes", "models", "services", "controllers", "components", "hooks", "utils", "lib", "api", "pages"];
  const hasSoC = concernDirs.filter((d) => dirs.has(d) || dirs.has("src")).length >= 2;
  if (hasSoC) score += 15;

  // +15 if file count is reasonable (<200)
  if (summary.totalFiles < 200) score += 15;
  else if (summary.totalFiles < 500) score += 8;

  // +15 if has reasonable avg file size (<300 lines avg)
  const avgLines = summary.totalLines / Math.max(1, summary.totalFiles);
  if (avgLines < 300) score += 15;
  else if (avgLines < 500) score += 8;

  // +15 if uses modules/imports properly
  const filesWithImports = files.filter((f) => f.imports.length > 0).length;
  const importRatio = filesWithImports / Math.max(1, files.length);
  if (importRatio > 0.5) score += 15;
  else if (importRatio > 0.25) score += 8;

  return clamp(score);
}

// ─── Documentation Score ────────────────────────────────────────────────────

function scoreDocumentation(summary: RepositorySummary): number {
  let score = 0;
  const files = summary.files;

  // +30 if README.md exists
  if (hasFile(files, "README.md")) score += 30;

  // +20 if has inline comments (check for comment patterns in parsed functions/exports)
  const totalFunctions = files.reduce((sum, f) => sum + f.functions.length, 0);
  const totalExports = files.reduce((sum, f) => sum + f.exports.length, 0);
  // Heuristic: if there are exports and functions, code is at least somewhat documented
  if (totalFunctions > 5 || totalExports > 5) score += 20;
  else if (totalFunctions > 0) score += 10;

  // +15 if has .env.example
  if (hasFile(files, ".env.example")) score += 15;

  // +15 if has CONTRIBUTING.md or docs/ folder
  if (hasFile(files, "CONTRIBUTING.md") || hasFileMatching(files, /^docs\//)) score += 15;

  // +10 if has LICENSE
  if (hasFile(files, "LICENSE") || hasFile(files, "LICENSE.md")) score += 10;

  // +10 if has CHANGELOG
  if (hasFile(files, "CHANGELOG.md") || hasFile(files, "CHANGELOG")) score += 10;

  return clamp(score);
}

// ─── Dependency Risk ────────────────────────────────────────────────────────

function assessDependencyRisk(summary: RepositorySummary): "low" | "medium" | "high" {
  const totalDeps =
    Object.keys(summary.dependencies).length +
    Object.keys(summary.devDependencies).length;

  if (totalDeps > 50) return "high";
  if (totalDeps > 20) return "medium";
  return "low";
}

// ─── Complexity Score ───────────────────────────────────────────────────────

function scoreComplexity(summary: RepositorySummary): number {
  const files = summary.files;
  const fileCount = Math.max(1, files.length);

  const avgFunctionsPerFile =
    files.reduce((sum, f) => sum + f.functions.length, 0) / fileCount;
  const avgLinesPerFile = summary.totalLines / fileCount;

  // Lower is better; invert for display (100 = very simple, 0 = very complex)
  const rawComplexity = avgFunctionsPerFile * 5 + avgLinesPerFile / 10;
  return clamp(100 - Math.min(100, rawComplexity));
}

// ─── Maintainability Score ──────────────────────────────────────────────────

function scoreMaintainability(
  architecture: number,
  documentation: number,
  complexity: number,
  summary: RepositorySummary,
): number {
  // Base: average of architecture + documentation + complexity
  let score = (architecture + documentation + complexity) / 3;

  // Bonus for best practices
  if (summary.hasTests) score += 10;
  if (summary.hasLinting) score += 10;
  if (summary.hasTypeScript) score += 10;

  return clamp(Math.round(score));
}

// ─── Suggestion Generator ───────────────────────────────────────────────────

function generateSuggestions(summary: RepositorySummary, analysis: Partial<HealthAnalysis>): string[] {
  const suggestions: string[] = [];
  const files = summary.files;

  if (!hasFile(files, "README.md")) {
    suggestions.push("Add a README.md with project description, setup instructions, and usage examples.");
  }

  if (!summary.hasTests) {
    suggestions.push("Add unit tests using Jest, Vitest, or your framework's preferred testing library.");
  }

  if (!summary.hasLinting) {
    suggestions.push("Set up ESLint and Prettier (or Biome) for consistent code style and error prevention.");
  }

  if (!summary.hasTypeScript) {
    suggestions.push("Consider migrating to TypeScript for better type safety and developer experience.");
  }

  if (!hasFile(files, ".env.example")) {
    suggestions.push("Add a .env.example file to document required environment variables.");
  }

  if (!hasFile(files, "LICENSE") && !hasFile(files, "LICENSE.md")) {
    suggestions.push("Add a LICENSE file to clarify how others can use your code.");
  }

  if ((analysis.dependencyRisk ?? "low") === "high") {
    suggestions.push("Review and audit dependencies — consider removing unused packages to reduce bundle size and security risk.");
  }

  if ((analysis.architecture ?? 100) < 50) {
    suggestions.push("Improve folder structure by separating concerns (e.g., routes, services, models, utils).");
  }

  if ((analysis.complexity ?? 100) < 40) {
    suggestions.push("Refactor large files into smaller, focused modules to reduce complexity.");
  }

  if (!hasFile(files, "CONTRIBUTING.md") && !hasFileMatching(files, /^docs\//)) {
    suggestions.push("Add a CONTRIBUTING.md or docs/ folder to help new contributors get started.");
  }

  // Return top 5 most relevant suggestions
  return suggestions.slice(0, 5);
}

// ─── Main Export ────────────────────────────────────────────────────────────

/**
 * Analyze the health of a parsed codebase.
 * Returns scores (0-100) for architecture, documentation, complexity,
 * maintainability, plus dependency risk assessment and actionable suggestions.
 */
export function analyzeHealth(summary: RepositorySummary): HealthAnalysis {
  const architecture = scoreArchitecture(summary);
  const documentation = scoreDocumentation(summary);
  const dependencyRisk = assessDependencyRisk(summary);
  const complexity = scoreComplexity(summary);
  const maintainability = scoreMaintainability(architecture, documentation, complexity, summary);

  const partialAnalysis = { architecture, documentation, dependencyRisk, complexity, maintainability };
  const suggestions = generateSuggestions(summary, partialAnalysis);

  const overallScore = clamp(
    Math.round((architecture + documentation + complexity + maintainability) / 4),
  );

  return {
    overallScore,
    architecture,
    documentation,
    dependencyRisk,
    complexity,
    maintainability,
    hasTests: summary.hasTests,
    hasLinting: summary.hasLinting,
    hasTypeScript: summary.hasTypeScript,
    suggestions,
  };
}
