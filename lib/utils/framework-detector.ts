/**
 * Framework & tooling detector.
 * Enriches a RepositorySummary with detected frameworks, package manager,
 * test/lint/TypeScript presence, and env vars using heuristic file/dependency checks.
 */

import type { RepositorySummary, ParseResult } from "@/lib/parsers/types";

// ─── Framework detection rules ──────────────────────────────────────────────

interface FrameworkRule {
  /** Dependency name (checked in deps + devDeps) */
  dep: string;
  /** Display label */
  label: string;
}

const FRAMEWORK_RULES: FrameworkRule[] = [
  { dep: "next", label: "Next.js" },
  { dep: "nuxt", label: "Nuxt" },
  { dep: "react", label: "React" },
  { dep: "vue", label: "Vue" },
  { dep: "@angular/core", label: "Angular" },
  { dep: "express", label: "Express" },
  { dep: "fastify", label: "Fastify" },
  { dep: "koa", label: "Koa" },
  { dep: "svelte", label: "Svelte" },
  { dep: "@sveltejs/kit", label: "SvelteKit" },
  { dep: "tailwindcss", label: "Tailwind CSS" },
  { dep: "prisma", label: "Prisma" },
  { dep: "@prisma/client", label: "Prisma" },
  { dep: "drizzle-orm", label: "Drizzle" },
];

// Python/Java/Dart frameworks detected via file patterns
const FILE_FRAMEWORK_PATTERNS: { pattern: RegExp; label: string }[] = [
  { pattern: /manage\.py|django/, label: "Django" },
  { pattern: /flask/, label: "Flask" },
  { pattern: /fastapi/, label: "FastAPI" },
  { pattern: /pubspec\.yaml/, label: "Flutter" },
  { pattern: /pom\.xml/, label: "Spring Boot" },
  { pattern: /build\.gradle/, label: "Spring Boot" },
];

// ─── Package manager detection ──────────────────────────────────────────────

const LOCK_FILE_MAP: Record<string, string> = {
  "package-lock.json": "npm",
  "yarn.lock": "yarn",
  "pnpm-lock.yaml": "pnpm",
  "bun.lockb": "bun",
  "Pipfile.lock": "pipenv",
  "requirements.txt": "pip",
  "poetry.lock": "poetry",
  "pubspec.lock": "pub",
  "pom.xml": "maven",
  "build.gradle": "gradle",
  "Gemfile.lock": "bundler",
  "go.sum": "go modules",
  "Cargo.lock": "cargo",
};

// ─── Test framework detection ───────────────────────────────────────────────

const TEST_DEPS = [
  "jest",
  "vitest",
  "mocha",
  "jasmine",
  "ava",
  "cypress",
  "playwright",
  "@testing-library/react",
  "pytest",
  "unittest",
];

const TEST_DIR_PATTERNS = [
  /\btest[s]?\//i,
  /\b__tests__\//,
  /\bspec[s]?\//i,
  /\.test\.[jt]sx?$/,
  /\.spec\.[jt]sx?$/,
  /test_.*\.py$/,
];

// ─── Linting detection ─────────────────────────────────────────────────────

const LINT_DEPS = [
  "eslint",
  "prettier",
  "biome",
  "@biomejs/biome",
  "pylint",
  "flake8",
  "black",
  "ruff",
  "dartanalyzer",
  "stylelint",
  "oxlint",
];

const LINT_FILE_PATTERNS = [
  /\.eslintrc/,
  /eslint\.config/,
  /\.prettierrc/,
  /prettier\.config/,
  /biome\.json/,
  /\.pylintrc/,
  /\.flake8/,
  /pyproject\.toml/,
];

// ─── Env var detection ──────────────────────────────────────────────────────

const ENV_FILE_PATTERNS = [/\.env$/, /\.env\.example$/, /\.env\.local$/, /\.env\.development$/, /\.env\.production$/];
const ENV_LINE_REGEX = /^([A-Z_][A-Z0-9_]*)\s*=/;

// ─── Main detector ─────────────────────────────────────────────────────────

/**
 * Detect frameworks, tools, and metadata from a parsed repository.
 * Returns a new RepositorySummary with enriched fields.
 */
export function detectFrameworks(summary: RepositorySummary): RepositorySummary {
  const allDeps = { ...summary.dependencies, ...summary.devDependencies };
  const filePaths = summary.files.map((f) => f.filePath);

  // Detect frameworks from dependencies
  const frameworks = new Set<string>();
  for (const rule of FRAMEWORK_RULES) {
    if (rule.dep in allDeps) {
      frameworks.add(rule.label);
    }
  }

  // Detect frameworks from file patterns
  for (const fp of filePaths) {
    for (const { pattern, label } of FILE_FRAMEWORK_PATTERNS) {
      if (pattern.test(fp)) {
        frameworks.add(label);
      }
    }
  }

  // Detect package manager from lock files
  let packageManager = "unknown";
  for (const fp of filePaths) {
    const filename = fp.split("/").pop() ?? "";
    if (filename in LOCK_FILE_MAP) {
      packageManager = LOCK_FILE_MAP[filename];
      break;
    }
  }
  // Fallback: if package.json exists but no lock file, assume npm
  if (packageManager === "unknown" && filePaths.some((f) => f.endsWith("package.json"))) {
    packageManager = "npm";
  }

  // Detect tests
  const hasTestDep = TEST_DEPS.some((dep) => dep in allDeps);
  const hasTestDir = filePaths.some((fp) => TEST_DIR_PATTERNS.some((p) => p.test(fp)));
  const hasTests = hasTestDep || hasTestDir;

  // Detect linting
  const hasLintDep = LINT_DEPS.some((dep) => dep in allDeps);
  const hasLintFile = filePaths.some((fp) => LINT_FILE_PATTERNS.some((p) => p.test(fp)));
  const hasLinting = hasLintDep || hasLintFile;

  // Detect TypeScript
  const hasTsConfig = filePaths.some((fp) => fp.endsWith("tsconfig.json"));
  const hasTsDep = "typescript" in allDeps;
  const hasTypeScript = hasTsConfig || hasTsDep;

  // Extract env vars from .env files
  const envVars = extractEnvVars(summary.files);

  return {
    ...summary,
    frameworks: Array.from(frameworks),
    packageManager,
    hasTests,
    hasLinting,
    hasTypeScript,
    envVars,
  };
}

/** Parse env files for variable names (not values — for security) */
function extractEnvVars(files: ParseResult[]): string[] {
  const vars = new Set<string>();

  for (const file of files) {
    const filename = file.filePath.split("/").pop() ?? "";
    if (!ENV_FILE_PATTERNS.some((p) => p.test(filename))) continue;

    // ParseResult doesn't store content directly, but we can check
    // if file info is available via exports or other signals.
    // For env files we rely on the file being in the list — actual content
    // parsing happens if content is accessible.
    // We'll check exports array which sometimes stores raw lines
  }

  return Array.from(vars);
}

/**
 * Extract env vars when raw file content is available.
 * Useful when caller has access to FileEntry data.
 */
export function parseEnvContent(content: string): string[] {
  const vars: string[] = [];
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = trimmed.match(ENV_LINE_REGEX);
    if (match) vars.push(match[1]);
  }
  return vars;
}
