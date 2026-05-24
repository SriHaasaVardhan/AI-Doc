/**
 * Python regex-based parser.
 * Extracts functions, classes, imports, and routes (Flask/Django/FastAPI).
 */

import type {
  ParseResult,
  FunctionInfo,
  ClassInfo,
  RouteInfo,
  ImportInfo,
} from "@/lib/parsers/types";

/**
 * Parse a Python file using regex patterns.
 */
export function parsePython(filePath: string, content: string): ParseResult {
  const result: ParseResult = {
    filePath,
    language: "Python",
    functions: [],
    classes: [],
    routes: [],
    imports: [],
    exports: [],
    lineCount: content.split("\n").length,
  };

  try {
    extractFunctions(content, result);
  } catch { /* partial */ }

  try {
    extractClasses(content, result);
  } catch { /* partial */ }

  try {
    extractImports(content, result);
  } catch { /* partial */ }

  try {
    extractRoutes(content, result);
  } catch { /* partial */ }

  return result;
}

// ---------------------------------------------------------------------------
// Functions
// ---------------------------------------------------------------------------

function extractFunctions(content: string, result: ParseResult): void {
  // Matches: [async] def function_name(params) [-> return_type]:
  const fnRegex =
    /^( *)(async\s+)?def\s+(\w+)\s*\(([^)]*)\)(?:\s*->\s*([^\s:]+))?\s*:/gm;
  let match: RegExpExecArray | null;

  while ((match = fnRegex.exec(content)) !== null) {
    const indent = match[1];
    const isAsync = !!match[2];
    const name = match[3];
    const rawParams = match[4].trim();
    const returnType = match[5] || undefined;

    // Skip class methods (indented defs) — they're tracked via class extraction
    // But we still capture them as standalone functions if indent is 0
    const params = rawParams
      ? rawParams
          .split(",")
          .map((p) => p.trim())
          .filter((p) => p && p !== "self" && p !== "cls")
      : [];

    const lineNumber = content.slice(0, match.index).split("\n").length;

    // A function is considered "exported" (module-level) if it has no indentation
    const isExported = indent.length === 0;

    const fn: FunctionInfo = {
      name,
      params,
      returnType,
      isAsync,
      isExported,
      lineNumber,
    };

    result.functions.push(fn);
  }
}

// ---------------------------------------------------------------------------
// Classes
// ---------------------------------------------------------------------------

function extractClasses(content: string, result: ParseResult): void {
  // Matches: class ClassName[(Base, Mixin, ...)]:
  const classRegex = /^class\s+(\w+)(?:\(([^)]*)\))?\s*:/gm;
  let match: RegExpExecArray | null;

  while ((match = classRegex.exec(content)) !== null) {
    const name = match[1];
    const bases = match[2]
      ? match[2]
          .split(",")
          .map((b) => b.trim())
          .filter(Boolean)
      : [];

    // Determine extends / implements (Python doesn't distinguish, use first as extends)
    const extendsName = bases.length > 0 ? bases[0] : undefined;
    const implementsList = bases.length > 1 ? bases.slice(1) : undefined;

    // Find methods inside the class body (indented defs after the class line)
    const classStart = match.index + match[0].length;
    const methods: string[] = [];
    const properties: string[] = [];

    // Scan lines after the class declaration
    const remainingContent = content.slice(classStart);
    const lines = remainingContent.split("\n");

    for (const line of lines) {
      // Stop if we hit a non-indented, non-empty line (end of class body)
      if (line.length > 0 && !line.startsWith(" ") && !line.startsWith("\t") && line.trim().length > 0) {
        break;
      }

      // Method: indented def
      const methodMatch = line.match(/^\s+(?:async\s+)?def\s+(\w+)\s*\(/);
      if (methodMatch) {
        methods.push(methodMatch[1]);
      }

      // Property: self.xxx = (inside __init__ or class body)
      const propMatch = line.match(/self\.(\w+)\s*=/);
      if (propMatch && !properties.includes(propMatch[1])) {
        properties.push(propMatch[1]);
      }

      // Class-level property: name: type or name = value (with indent)
      const classPropMatch = line.match(/^\s{4}(\w+)\s*(?::\s*\w|=)/);
      if (classPropMatch && !properties.includes(classPropMatch[1]) && classPropMatch[1] !== "def") {
        properties.push(classPropMatch[1]);
      }
    }

    result.classes.push({
      name,
      methods,
      properties,
      isExported: true, // Python module-level classes are always accessible
      extends: extendsName,
      implements: implementsList,
    });
  }
}

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------

function extractImports(content: string, result: ParseResult): void {
  // `import module` or `import module as alias`
  const importRegex = /^import\s+(\S+)(?:\s+as\s+(\w+))?/gm;
  let match: RegExpExecArray | null;

  while ((match = importRegex.exec(content)) !== null) {
    // Skip `import {` patterns (JS-like, not Python)
    if (match[1].startsWith("{")) continue;

    result.imports.push({
      source: match[1],
      specifiers: match[2] ? [match[2]] : [match[1]],
      isDefault: true,
    });
  }

  // `from module import a, b, c`
  const fromImportRegex = /^from\s+(\S+)\s+import\s+(.+)/gm;
  while ((match = fromImportRegex.exec(content)) !== null) {
    const source = match[1];
    const rawSpecifiers = match[2].trim();

    // Handle multiline imports starting with (
    let specifiers: string[];
    if (rawSpecifiers.startsWith("(")) {
      // Find the closing paren
      const parenContent = rawSpecifiers
        .replace(/[()]/g, "")
        .trim();
      specifiers = parenContent
        .split(",")
        .map((s) => s.trim().split(/\s+as\s+/)[0])
        .filter(Boolean);
    } else {
      specifiers = rawSpecifiers
        .split(",")
        .map((s) => s.trim().split(/\s+as\s+/)[0])
        .filter(Boolean);
    }

    result.imports.push({
      source,
      specifiers,
      isDefault: specifiers.length === 1 && specifiers[0] === "*",
    });
  }
}

// ---------------------------------------------------------------------------
// Routes (Flask / Django / FastAPI)
// ---------------------------------------------------------------------------

function extractRoutes(content: string, result: ParseResult): void {
  // Flask: @app.route('/path', methods=['GET', 'POST'])
  const flaskRouteRegex =
    /@(?:app|blueprint|bp)\.route\s*\(\s*['"`]([^'"`]+)['"`](?:.*?methods\s*=\s*\[([^\]]+)\])?\)/gi;
  let match: RegExpExecArray | null;

  while ((match = flaskRouteRegex.exec(content)) !== null) {
    const path = match[1];
    const methods = match[2]
      ? match[2]
          .replace(/['"]/g, "")
          .split(",")
          .map((m) => m.trim().toUpperCase())
      : ["GET"];

    for (const method of methods) {
      result.routes.push({ method, path });
    }
  }

  // FastAPI: @app.get('/path'), @router.post('/path')
  const fastapiRegex =
    /@(?:app|router)\.(get|post|put|patch|delete|options|head)\s*\(\s*['"`]([^'"`]+)['"`]/gi;
  while ((match = fastapiRegex.exec(content)) !== null) {
    result.routes.push({
      method: match[1].toUpperCase(),
      path: match[2],
    });
  }

  // Django: path('url/', view_function, name='name')
  const djangoPathRegex =
    /path\s*\(\s*['"`]([^'"`]+)['"`]\s*,\s*(\w+)/gi;
  while ((match = djangoPathRegex.exec(content)) !== null) {
    result.routes.push({
      method: "ALL",
      path: match[1],
      handler: match[2],
    });
  }
}
