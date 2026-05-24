/**
 * TypeScript / JavaScript AST parser using ts-morph.
 * Handles .ts, .tsx, .js, .jsx files.
 * Uses in-memory file system so no disk I/O is needed.
 */

import { Project, ScriptKind, SyntaxKind, Node } from "ts-morph";
import type {
  ParseResult,
  FunctionInfo,
  ClassInfo,
  RouteInfo,
  ImportInfo,
} from "@/lib/parsers/types";

// Map file extensions to ts-morph ScriptKind
const SCRIPT_KIND_MAP: Record<string, ScriptKind> = {
  ".ts": ScriptKind.TS,
  ".tsx": ScriptKind.TSX,
  ".js": ScriptKind.JS,
  ".jsx": ScriptKind.JSX,
};

/**
 * Parse a TypeScript / JavaScript file and extract structured metadata.
 * Returns partial results on error — never throws.
 */
export function parseTypeScript(
  filePath: string,
  content: string
): ParseResult {
  const result: ParseResult = {
    filePath,
    language: getLanguage(filePath),
    functions: [],
    classes: [],
    routes: [],
    imports: [],
    exports: [],
    lineCount: content.split("\n").length,
  };

  try {
    const ext = getExtension(filePath);
    const scriptKind = SCRIPT_KIND_MAP[ext] ?? ScriptKind.TS;

    const project = new Project({
      useInMemoryFileSystem: true,
      compilerOptions: {
        allowJs: true,
        jsx: ext === ".tsx" || ext === ".jsx" ? 2 /* React */ : undefined,
        strict: false,
        noEmit: true,
      },
    });

    const sourceFile = project.createSourceFile(
      `virtual${ext}`,
      content,
      { scriptKind }
    );

    // ── Functions ──────────────────────────────────────────────────────
    extractFunctions(sourceFile, result);

    // ── Classes ────────────────────────────────────────────────────────
    extractClasses(sourceFile, result);

    // ── Imports ────────────────────────────────────────────────────────
    extractImports(sourceFile, result);

    // ── Exports ────────────────────────────────────────────────────────
    extractExports(sourceFile, result);

    // ── Routes (Express / Fastify / Hono / Next.js) ───────────────────
    extractRoutes(sourceFile, result, content);
  } catch {
    // Return whatever we managed to extract so far
  }

  return result;
}

// ---------------------------------------------------------------------------
// Extractors
// ---------------------------------------------------------------------------

function extractFunctions(sourceFile: Node, result: ParseResult): void {
  try {
    // Top-level function declarations
    for (const fn of sourceFile.getDescendantsOfKind(
      SyntaxKind.FunctionDeclaration
    )) {
      try {
        const name = fn.getName();
        if (!name) continue;

        const params = fn.getParameters().map((p) => {
          const typeNode = p.getTypeNode();
          const typeName = typeNode ? `: ${typeNode.getText()}` : "";
          return `${p.getName()}${typeName}`;
        });

        const returnType = fn.getReturnTypeNode()?.getText();

        result.functions.push({
          name,
          params,
          returnType,
          isAsync: fn.isAsync(),
          isExported: fn.isExported(),
          lineNumber: fn.getStartLineNumber(),
        });
      } catch {
        continue;
      }
    }

    // Arrow functions / function expressions assigned to variables
    for (const varDecl of sourceFile.getDescendantsOfKind(
      SyntaxKind.VariableDeclaration
    )) {
      try {
        const initializer = varDecl.getInitializer();
        if (!initializer) continue;

        const isArrow = Node.isArrowFunction(initializer);
        const isFnExpr = Node.isFunctionExpression(initializer);
        if (!isArrow && !isFnExpr) continue;

        const fnNode = initializer as unknown as {
          getParameters: () => Array<{
            getName: () => string;
            getTypeNode: () => { getText: () => string } | undefined;
          }>;
          getReturnTypeNode: () => { getText: () => string } | undefined;
          isAsync: () => boolean;
        };

        const name = varDecl.getName();
        const params = fnNode.getParameters().map((p) => {
          const typeNode = p.getTypeNode();
          const typeName = typeNode ? `: ${typeNode.getText()}` : "";
          return `${p.getName()}${typeName}`;
        });
        const returnType = fnNode.getReturnTypeNode()?.getText();

        // Check if the variable statement is exported
        const varStatement = varDecl.getFirstAncestorByKind(
          SyntaxKind.VariableStatement
        );
        const isExported = varStatement?.isExported() ?? false;

        result.functions.push({
          name,
          params,
          returnType,
          isAsync: fnNode.isAsync(),
          isExported,
          lineNumber: varDecl.getStartLineNumber(),
        });
      } catch {
        continue;
      }
    }
  } catch {
    // Partial extraction is fine
  }
}

function extractClasses(sourceFile: Node, result: ParseResult): void {
  try {
    for (const cls of sourceFile.getDescendantsOfKind(
      SyntaxKind.ClassDeclaration
    )) {
      try {
        const name = cls.getName();
        if (!name) continue;

        const methods = cls
          .getMethods()
          .map((m) => m.getName())
          .filter(Boolean);

        const properties = cls
          .getProperties()
          .map((p) => p.getName())
          .filter(Boolean);

        const extendsExpr = cls.getExtends();
        const extendsName = extendsExpr?.getExpression().getText();

        const implementsArr = cls
          .getImplements()
          .map((i) => i.getText());

        result.classes.push({
          name,
          methods,
          properties,
          isExported: cls.isExported(),
          extends: extendsName,
          implements: implementsArr.length > 0 ? implementsArr : undefined,
        });
      } catch {
        continue;
      }
    }
  } catch {
    // Partial extraction
  }
}

function extractImports(sourceFile: Node, result: ParseResult): void {
  try {
    for (const imp of sourceFile.getDescendantsOfKind(
      SyntaxKind.ImportDeclaration
    )) {
      try {
        const source = imp.getModuleSpecifierValue();
        const specifiers: string[] = [];
        let isDefault = false;

        const defaultImport = imp.getDefaultImport();
        if (defaultImport) {
          specifiers.push(defaultImport.getText());
          isDefault = true;
        }

        const namedImports = imp.getNamedImports();
        for (const named of namedImports) {
          specifiers.push(named.getName());
        }

        const namespaceImport = imp.getNamespaceImport();
        if (namespaceImport) {
          specifiers.push(`* as ${namespaceImport.getText()}`);
        }

        result.imports.push({ source, specifiers, isDefault });
      } catch {
        continue;
      }
    }
  } catch {
    // Partial extraction
  }
}

function extractExports(sourceFile: Node, result: ParseResult): void {
  try {
    // Named exports
    for (const exp of sourceFile.getDescendantsOfKind(
      SyntaxKind.ExportDeclaration
    )) {
      try {
        const namedExports = exp.getNamedExports();
        for (const named of namedExports) {
          result.exports.push(named.getName());
        }
      } catch {
        continue;
      }
    }

    // Re-exported defaults, export assignments
    for (const exp of sourceFile.getDescendantsOfKind(
      SyntaxKind.ExportAssignment
    )) {
      try {
        result.exports.push(
          exp.isExportEquals() ? "module.exports" : "default"
        );
      } catch {
        continue;
      }
    }

    // Exported functions / classes / variables (already tracked, just add to exports list)
    for (const fn of result.functions) {
      if (fn.isExported) result.exports.push(fn.name);
    }
    for (const cls of result.classes) {
      if (cls.isExported) result.exports.push(cls.name);
    }
  } catch {
    // Partial extraction
  }
}

/**
 * Detect routes from Express/Fastify/Hono patterns and Next.js API route exports.
 */
function extractRoutes(
  sourceFile: Node,
  result: ParseResult,
  content: string
): void {
  try {
    // ── Express / Fastify / Hono style: app.get('/path', handler) ────
    const routeCallRegex =
      /(?:app|router|server|route)\.(get|post|put|patch|delete|options|head|all)\s*\(\s*['"`]([^'"`]+)['"`]/gi;
    let match: RegExpExecArray | null;
    while ((match = routeCallRegex.exec(content)) !== null) {
      result.routes.push({
        method: match[1].toUpperCase(),
        path: match[2],
      });
    }

    // ── Next.js App Router: export async function GET/POST/... ────────
    const nextRouteRegex =
      /export\s+(?:async\s+)?function\s+(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\s*\(/gi;
    while ((match = nextRouteRegex.exec(content)) !== null) {
      // Infer path from file path
      const routePath = inferNextRouteFromPath(result.filePath);
      result.routes.push({
        method: match[1].toUpperCase(),
        path: routePath,
        handler: match[1].toUpperCase(),
      });
    }

    // ── Hono style: app.route('/path', handler) ──────────────────────
    const honoRouteRegex =
      /\.route\s*\(\s*['"`]([^'"`]+)['"`]/gi;
    while ((match = honoRouteRegex.exec(content)) !== null) {
      result.routes.push({
        method: "USE",
        path: match[1],
      });
    }
  } catch {
    // Route detection is best-effort
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getExtension(filePath: string): string {
  const lastDot = filePath.lastIndexOf(".");
  return lastDot >= 0 ? filePath.slice(lastDot).toLowerCase() : "";
}

function getLanguage(filePath: string): string {
  const ext = getExtension(filePath);
  switch (ext) {
    case ".ts":
      return "TypeScript";
    case ".tsx":
      return "TypeScript (JSX)";
    case ".js":
      return "JavaScript";
    case ".jsx":
      return "JavaScript (JSX)";
    default:
      return "TypeScript";
  }
}

/**
 * Infer a Next.js route path from the file path.
 * e.g. `app/api/users/[id]/route.ts` → `/api/users/[id]`
 */
function inferNextRouteFromPath(filePath: string): string {
  const normalised = filePath.replace(/\\/g, "/");

  // Find the 'app/' segment
  const appIdx = normalised.indexOf("app/");
  if (appIdx < 0) return filePath;

  let routePart = normalised.slice(appIdx + 4); // after 'app/'
  // Remove the filename (route.ts, route.js, etc.)
  routePart = routePart.replace(/\/?(route|page)\.(ts|tsx|js|jsx)$/, "");

  return "/" + routePart;
}
