import type { RepositorySummary } from "@/lib/parsers/types";
import { truncateToTokenLimit } from "@/lib/ai/token-estimator";

/**
 * Builds a compact text summary from a RepositorySummary object.
 * Designed to minimize tokens while preserving all essential info
 * for downstream prompt templates.
 */
export function buildSummaryText(repo: RepositorySummary): string {
  const sections: string[] = [];

  // Header
  sections.push(`# ${repo.name}`);
  const languages = Object.keys(repo.languages);
  if (languages.length > 0) {
    sections.push(`Langs: ${languages.join(", ")}`);
  }

  // Frameworks
  if (repo.frameworks?.length) {
    sections.push(`Frameworks: ${repo.frameworks.join(", ")}`);
  }

  // Dependencies (just names, no versions to save tokens)
  if (repo.dependencies && Object.keys(repo.dependencies).length > 0) {
    const deps = Object.keys(repo.dependencies).join(", ");
    sections.push(`Deps: ${deps}`);
  }

  // Dev dependencies
  if (repo.devDependencies && Object.keys(repo.devDependencies).length > 0) {
    const devDeps = Object.keys(repo.devDependencies).join(", ");
    sections.push(`DevDeps: ${devDeps}`);
  }

  // Scripts
  if (repo.scripts && Object.keys(repo.scripts).length > 0) {
    const scripts = Object.entries(repo.scripts)
      .map(([k, v]) => `  ${k}: ${v}`)
      .join("\n");
    sections.push(`Scripts:\n${scripts}`);
  }

  // Folder tree
  if (repo.folderStructure) {
    sections.push(`Folder Tree:\n${repo.folderStructure}`);
  }

  // Routes
  const routes = repo.files.flatMap((file) =>
    file.routes.map((route) => `${route.method} ${route.path}`)
  );
  if (routes.length) {
    sections.push(`Routes:\n${routes.map((route) => `  - ${route}`).join("\n")}`);
  }

  // Functions
  const functions = repo.files.flatMap((file) =>
    file.functions.map((fn) => `${fn.name}(${fn.params.join(", ")})`)
  );
  if (functions.length) {
    sections.push(
      `Functions:\n${functions.map((fn) => `  - ${fn}`).join("\n")}`
    );
  }

  // Classes
  const classes = repo.files.flatMap((file) =>
    file.classes.map((classInfo) => classInfo.name)
  );
  if (classes.length) {
    sections.push(
      `Classes:\n${classes.map((className) => `  - ${className}`).join("\n")}`
    );
  }

  // Imports
  const imports = Array.from(new Set(repo.files.flatMap((file) => file.imports.map((item) => item.source))));
  if (imports.length) {
    sections.push(
      `Key Imports:\n${imports.map((source) => `  - ${source}`).join("\n")}`
    );
  }

  // Environment variables
  if (repo.envVars?.length) {
    sections.push(
      `Env Vars:\n${repo.envVars.map((e) => `  - ${e}`).join("\n")}`
    );
  }

  const raw = sections.join("\n\n");
  return truncateToTokenLimit(raw, 3500);
}
