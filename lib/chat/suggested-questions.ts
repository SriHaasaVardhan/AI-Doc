import type { RepositorySummary } from "@/lib/parsers/types";

function unique(items: string[], limit: number): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of items) {
    const key = item.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
    if (out.length >= limit) break;
  }
  return out;
}

function findAuthRelatedPaths(summary: RepositorySummary): string[] {
  const pattern = /auth|login|session|jwt|oauth|passport|clerk|nextauth/i;
  return summary.files
    .filter(
      (f) =>
        pattern.test(f.filePath) ||
        f.functions.some((fn) => pattern.test(fn.name)) ||
        f.classes.some((c) => pattern.test(c.name))
    )
    .map((f) => f.filePath)
    .slice(0, 3);
}

/**
 * Returns repository-specific starter questions for the chat UI.
 */
export function getSuggestedQuestions(summary: RepositorySummary): string[] {
  const questions: string[] = [];
  const name = summary.name;
  const frameworks = summary.frameworks;
  const routeCount = summary.files.reduce((n, f) => n + f.routes.length, 0);
  const scripts = Object.keys(summary.scripts);

  questions.push(`What is ${name} and what tech stack does it use?`);

  if (frameworks.length) {
    questions.push(
      `How is ${frameworks[0]} used in this project?`
    );
  }

  if (routeCount > 0) {
    questions.push(
      routeCount > 5
        ? `Summarize the ${routeCount} API routes detected in this repo`
        : "What API endpoints exist and what do they likely do?"
    );
  }

  const devScript =
    scripts.find((s) => s === "dev" || s === "start") ??
    scripts.find((s) => /dev|start|serve/i.test(s));
  if (devScript) {
    questions.push(`How do I run this project locally (e.g. \`${summary.packageManager} run ${devScript}\`)?`);
  } else if (scripts.length) {
    questions.push(`What npm/package scripts are available and what do they do?`);
  }

  if (summary.envVars.length) {
    questions.push(
      `Which environment variables (${summary.envVars.slice(0, 4).join(", ")}${summary.envVars.length > 4 ? ", …" : ""}) are needed?`
    );
  }

  if (summary.folderStructure) {
    questions.push("Explain the top-level folder structure and what each main directory is for");
  }

  const authPaths = findAuthRelatedPaths(summary);
  if (authPaths.length) {
    questions.push(
      `Where is authentication handled (e.g. \`${authPaths[0]}\`)?`
    );
  }

  const exportedFns = summary.files.flatMap((f) =>
    f.functions.filter((fn) => fn.isExported).map((fn) => ({ file: f.filePath, name: fn.name }))
  );
  if (exportedFns.length > 3) {
    questions.push("What are the main exported functions and where are they defined?");
  }

  if (summary.hasTests) {
    questions.push("How is testing set up in this repository?");
  } else {
    questions.push("Does this repo have tests, and how could I add them?");
  }

  if (frameworks.includes("Next.js")) {
    const hasApp = summary.folderStructure.includes("app/");
    questions.push(
      hasApp
        ? "How is the Next.js App Router organized in this codebase?"
        : "How is routing organized in this Next.js project?"
    );
  }

  if (Object.keys(summary.dependencies).some((d) => /prisma|drizzle|mongoose|typeorm/i.test(d))) {
    questions.push("How is database access implemented?");
  }

  return unique(questions, 4);
}

export function buildWelcomeMessage(summary: RepositorySummary): string {
  const stack =
    summary.frameworks.length > 0
      ? summary.frameworks.slice(0, 4).join(", ")
      : Object.keys(summary.languages).slice(0, 3).join(", ") || "this codebase";

  const routeCount = summary.files.reduce((n, f) => n + f.routes.length, 0);
  const hints: string[] = [];

  if (routeCount > 0) hints.push(`${routeCount} route${routeCount === 1 ? "" : "s"}`);
  if (Object.keys(summary.scripts).length) hints.push("run scripts");
  if (summary.envVars.length) hints.push("env setup");

  const hintText = hints.length
    ? ` I can help with ${hints.join(", ")}, architecture, and more.`
    : " Ask anything about structure, setup, or how the code is organized.";

  return `Hi! I've analyzed **${summary.name}** (${stack}).${hintText} Pick a suggestion below or ask your own question.`;
}
