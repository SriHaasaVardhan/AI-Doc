/**
 * Java regex-based parser.
 * Extracts classes, methods, imports, and Spring routes.
 */

import type {
  ParseResult,
  FunctionInfo,
  ClassInfo,
  RouteInfo,
  ImportInfo,
} from "@/lib/parsers/types";

/**
 * Parse a Java file using regex patterns.
 */
export function parseJava(filePath: string, content: string): ParseResult {
  const result: ParseResult = {
    filePath,
    language: "Java",
    functions: [],
    classes: [],
    routes: [],
    imports: [],
    exports: [],
    lineCount: content.split("\n").length,
  };

  try {
    extractImports(content, result);
  } catch { /* partial */ }

  try {
    extractClasses(content, result);
  } catch { /* partial */ }

  try {
    extractMethods(content, result);
  } catch { /* partial */ }

  try {
    extractRoutes(content, result);
  } catch { /* partial */ }

  return result;
}

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------

function extractImports(content: string, result: ParseResult): void {
  const importRegex = /^import\s+(static\s+)?([a-zA-Z0-9_.]+(?:\.\*)?)\s*;/gm;
  let match: RegExpExecArray | null;

  while ((match = importRegex.exec(content)) !== null) {
    const source = match[2];
    const isStatic = !!match[1];
    const parts = source.split(".");
    const specifier = parts[parts.length - 1];

    result.imports.push({
      source,
      specifiers: [isStatic ? `static ${specifier}` : specifier],
      isDefault: false,
    });
  }
}

// ---------------------------------------------------------------------------
// Classes & Interfaces
// ---------------------------------------------------------------------------

function extractClasses(content: string, result: ParseResult): void {
  // Matches: [public|protected|private] [abstract|final] [static] class|interface|enum ClassName [extends Base] [implements I1, I2]
  const classRegex =
    /(?:^|\n)\s*(?:(public|protected|private)\s+)?(?:(abstract|final)\s+)?(?:(static)\s+)?(?:class|interface|enum)\s+(\w+)(?:<[^>]*>)?(?:\s+extends\s+(\w+)(?:<[^>]*>)?)?(?:\s+implements\s+([\w\s,<>]+?))?(?:\s*\{)/gm;
  let match: RegExpExecArray | null;

  while ((match = classRegex.exec(content)) !== null) {
    const name = match[4];
    const extendsName = match[5] || undefined;
    const implementsRaw = match[6];
    const implementsList = implementsRaw
      ? implementsRaw
          .split(",")
          .map((s) => s.trim().replace(/<.*>/, ""))
          .filter(Boolean)
      : undefined;

    const isExported = match[1] === "public";

    // Extract methods belonging to this class
    const methods: string[] = [];
    const properties: string[] = [];

    // Find the class body (between opening { and matching closing })
    const classBodyStart = match.index + match[0].length;
    const classBody = extractBalancedBlock(content, classBodyStart - 1);

    if (classBody) {
      // Methods inside class body
      const methodRegex =
        /(?:public|protected|private)?\s*(?:static\s+)?(?:final\s+)?(?:abstract\s+)?(?:synchronized\s+)?(?:<[^>]*>\s+)?(\w+(?:<[^>]*>)?(?:\[\])?)\s+(\w+)\s*\(/gm;
      let methodMatch: RegExpExecArray | null;
      while ((methodMatch = methodRegex.exec(classBody)) !== null) {
        const returnType = methodMatch[1];
        const methodName = methodMatch[2];
        // Skip constructor (same name as class) from methods list but still include
        if (methodName !== name || returnType !== name) {
          methods.push(methodName);
        }
      }

      // Fields / properties
      const fieldRegex =
        /(?:public|protected|private)\s+(?:static\s+)?(?:final\s+)?(\w+(?:<[^>]*>)?(?:\[\])?)\s+(\w+)\s*[;=]/gm;
      let fieldMatch: RegExpExecArray | null;
      while ((fieldMatch = fieldRegex.exec(classBody)) !== null) {
        if (!methods.includes(fieldMatch[2])) {
          properties.push(fieldMatch[2]);
        }
      }
    }

    result.classes.push({
      name,
      methods: [...new Set(methods)],
      properties: [...new Set(properties)],
      isExported,
      extends: extendsName,
      implements:
        implementsList && implementsList.length > 0
          ? implementsList
          : undefined,
    });
  }
}

// ---------------------------------------------------------------------------
// Methods (top-level / standalone — also catches class methods as functions)
// ---------------------------------------------------------------------------

function extractMethods(content: string, result: ParseResult): void {
  // Comprehensive Java method pattern
  const methodRegex =
    /(?:^|\n)\s*(?:(@\w+(?:\([^)]*\))?)\s*\n?\s*)?(?:(public|protected|private)\s+)?(?:(static)\s+)?(?:(final)\s+)?(?:(abstract)\s+)?(?:(synchronized)\s+)?(?:<[^>]*>\s+)?(\w+(?:<[^>]*>)?(?:\[\])?)\s+(\w+)\s*\(([^)]*)\)/gm;
  let match: RegExpExecArray | null;

  while ((match = methodRegex.exec(content)) !== null) {
    const annotation = match[1] || "";
    const visibility = match[2] || "";
    const isStatic = !!match[3];
    const returnType = match[7];
    const name = match[8];
    const rawParams = match[9].trim();

    // Skip if it looks like a control structure or constructor call
    if (["if", "for", "while", "switch", "catch", "return", "new", "throw"].includes(name)) continue;
    // Skip if returnType is a keyword
    if (["class", "interface", "enum", "import", "package", "return"].includes(returnType)) continue;

    const params = rawParams
      ? rawParams
          .split(",")
          .map((p) => p.trim())
          .filter(Boolean)
          .map((p) => {
            // Remove annotations like @RequestBody
            const cleaned = p.replace(/@\w+\s*/, "").trim();
            return cleaned;
          })
      : [];

    const lineNumber = content.slice(0, match.index).split("\n").length;

    result.functions.push({
      name,
      params,
      returnType: returnType !== "void" ? returnType : undefined,
      isAsync: false, // Java doesn't have async keyword
      isExported: visibility === "public",
      lineNumber,
    });

    // Check for annotation-based exports (Spring controllers are public API)
    if (annotation.startsWith("@") && visibility === "public") {
      result.exports.push(name);
    }
  }
}

// ---------------------------------------------------------------------------
// Routes (Spring)
// ---------------------------------------------------------------------------

function extractRoutes(content: string, result: ParseResult): void {
  // @RequestMapping, @GetMapping, @PostMapping, etc.
  const mappingRegex =
    /@(GetMapping|PostMapping|PutMapping|PatchMapping|DeleteMapping|RequestMapping)\s*(?:\(\s*(?:value\s*=\s*)?['"]?([^'")\s,]+)['"]?(?:.*?method\s*=\s*RequestMethod\.(\w+))?[^)]*\))?/gi;
  let match: RegExpExecArray | null;

  while ((match = mappingRegex.exec(content)) !== null) {
    const annotation = match[1].toLowerCase();
    const path = match[2] || "/";

    let method: string;
    if (match[3]) {
      method = match[3].toUpperCase();
    } else if (annotation === "requestmapping") {
      method = "ALL";
    } else {
      // Derive from annotation name
      method = annotation
        .replace("mapping", "")
        .toUpperCase();
    }

    // Try to find the handler method name on the next line
    const afterAnnotation = content.slice(
      match.index + match[0].length,
      match.index + match[0].length + 200
    );
    const handlerMatch = afterAnnotation.match(
      /(?:public|private|protected)\s+\S+\s+(\w+)\s*\(/
    );

    result.routes.push({
      method,
      path,
      handler: handlerMatch?.[1],
    });
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Extract content between balanced braces starting at the given position.
 * Returns the content inside the outermost braces, or null if unbalanced.
 */
function extractBalancedBlock(
  content: string,
  startPos: number
): string | null {
  if (content[startPos] !== "{") return null;

  let depth = 0;
  let i = startPos;

  for (; i < content.length; i++) {
    if (content[i] === "{") depth++;
    else if (content[i] === "}") {
      depth--;
      if (depth === 0) {
        return content.slice(startPos + 1, i);
      }
    }
  }

  // Unbalanced — return what we have
  return content.slice(startPos + 1);
}
