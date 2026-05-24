/**
 * Dart regex-based parser.
 * Extracts functions, classes, imports, and Flutter/Dart metadata.
 */

import type {
  ParseResult,
  FunctionInfo,
  ClassInfo,
  ImportInfo,
} from "@/lib/parsers/types";

/**
 * Parse a Dart file using regex patterns.
 */
export function parseDart(filePath: string, content: string): ParseResult {
  const result: ParseResult = {
    filePath,
    language: "Dart",
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
    extractFunctions(content, result);
  } catch { /* partial */ }

  try {
    extractExports(content, result);
  } catch { /* partial */ }

  return result;
}

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------

function extractImports(content: string, result: ParseResult): void {
  // import 'package:xxx/xxx.dart';
  // import 'dart:core';
  // import 'relative.dart' as alias;
  // import 'package:xxx/xxx.dart' show Class1, Class2;
  // import 'package:xxx/xxx.dart' hide Class1;
  const importRegex =
    /import\s+['"]([^'"]+)['"](?:\s+as\s+(\w+))?(?:\s+(?:show|hide)\s+([\w\s,]+))?/gm;
  let match: RegExpExecArray | null;

  while ((match = importRegex.exec(content)) !== null) {
    const source = match[1];
    const alias = match[2];
    const showHide = match[3];

    const specifiers: string[] = [];
    if (alias) {
      specifiers.push(alias);
    } else if (showHide) {
      specifiers.push(
        ...showHide
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      );
    } else {
      // Extract the library name from the path
      const parts = source.split("/");
      const last = parts[parts.length - 1].replace(".dart", "");
      specifiers.push(last);
    }

    result.imports.push({
      source,
      specifiers,
      isDefault: !showHide && !alias,
    });
  }
}

// ---------------------------------------------------------------------------
// Classes
// ---------------------------------------------------------------------------

function extractClasses(content: string, result: ParseResult): void {
  // class ClassName [extends Base] [with Mixin1, Mixin2] [implements I1, I2] {
  // abstract class ClassName ...
  // mixin ClassName on Base {
  const classRegex =
    /(?:^|\n)\s*(?:abstract\s+)?(?:class|mixin)\s+(\w+)(?:<[^>]*>)?(?:\s+extends\s+(\w+)(?:<[^>]*>)?)?(?:\s+with\s+([\w\s,<>]+?))?(?:\s+implements\s+([\w\s,<>]+?))?\s*\{/gm;
  let match: RegExpExecArray | null;

  while ((match = classRegex.exec(content)) !== null) {
    const name = match[1];
    const extendsName = match[2] || undefined;
    const mixins = match[3]
      ? match[3]
          .split(",")
          .map((s) => s.trim().replace(/<.*>/, ""))
          .filter(Boolean)
      : [];
    const implementsRaw = match[4]
      ? match[4]
          .split(",")
          .map((s) => s.trim().replace(/<.*>/, ""))
          .filter(Boolean)
      : [];

    // Combine mixins and implements for the implements field
    const implementsList = [...mixins, ...implementsRaw];

    // Extract methods and properties from class body
    const classBodyStart = match.index + match[0].length;
    const classBody = extractBalancedBlock(content, classBodyStart - 1);

    const methods: string[] = [];
    const properties: string[] = [];

    if (classBody) {
      // Methods: ReturnType methodName(params) [async] {
      // or: void methodName(params);
      // or: Future<Type> methodName(params) async {
      const methodRegex =
        /(?:static\s+)?(?:\w+(?:<[^>]*>)?(?:\?)?)\s+(\w+)\s*\([^)]*\)/gm;
      let methodMatch: RegExpExecArray | null;
      while ((methodMatch = methodRegex.exec(classBody)) !== null) {
        const methodName = methodMatch[1];
        if (!["if", "for", "while", "switch", "catch", "return"].includes(methodName)) {
          methods.push(methodName);
        }
      }

      // Properties: [final|late|static] Type name;
      const propRegex =
        /(?:final\s+|late\s+|static\s+)*(?:\w+(?:<[^>]*>)?(?:\?)?)\s+(\w+)\s*[;=]/gm;
      let propMatch: RegExpExecArray | null;
      while ((propMatch = propRegex.exec(classBody)) !== null) {
        const propName = propMatch[1];
        if (
          !methods.includes(propName) &&
          !["if", "for", "while", "return", "super", "this"].includes(propName)
        ) {
          properties.push(propName);
        }
      }
    }

    result.classes.push({
      name,
      methods: [...new Set(methods)],
      properties: [...new Set(properties)],
      isExported: !name.startsWith("_"), // Dart: _ prefix = private
      extends: extendsName,
      implements: implementsList.length > 0 ? implementsList : undefined,
    });
  }
}

// ---------------------------------------------------------------------------
// Functions (top-level)
// ---------------------------------------------------------------------------

function extractFunctions(content: string, result: ParseResult): void {
  // Top-level functions:
  // ReturnType functionName(params) [async] {
  // void main(List<String> args) {
  // Future<void> fetchData() async {
  const fnRegex =
    /(?:^|\n)(\w+(?:<[^>]*>)?(?:\?)?)\s+(\w+)\s*\(([^)]*)\)\s*(async)?\s*\{/gm;
  let match: RegExpExecArray | null;

  while ((match = fnRegex.exec(content)) !== null) {
    const returnType = match[1];
    const name = match[2];
    const rawParams = match[3].trim();
    const isAsync = !!match[4] || returnType.startsWith("Future");

    // Skip if it looks like a class/control structure
    if (["class", "if", "for", "while", "switch", "catch", "interface", "enum"].includes(returnType)) continue;
    if (["if", "for", "while", "switch", "catch"].includes(name)) continue;

    const params = rawParams
      ? rawParams
          .split(",")
          .map((p) => p.trim())
          .filter(Boolean)
          .map((p) => {
            // Clean up: remove required, braces
            return p.replace(/[{}]/g, "").replace(/^required\s+/, "").trim();
          })
      : [];

    const lineNumber = content.slice(0, match.index).split("\n").length;

    result.functions.push({
      name,
      params,
      returnType,
      isAsync,
      isExported: !name.startsWith("_"),
      lineNumber,
    });
  }
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

function extractExports(content: string, result: ParseResult): void {
  // export 'package:xxx/xxx.dart';
  const exportRegex = /export\s+['"]([^'"]+)['"]\s*;/gm;
  let match: RegExpExecArray | null;

  while ((match = exportRegex.exec(content)) !== null) {
    result.exports.push(match[1]);
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function extractBalancedBlock(
  content: string,
  startPos: number
): string | null {
  if (content[startPos] !== "{") return null;

  let depth = 0;

  for (let i = startPos; i < content.length; i++) {
    if (content[i] === "{") depth++;
    else if (content[i] === "}") {
      depth--;
      if (depth === 0) {
        return content.slice(startPos + 1, i);
      }
    }
  }

  return content.slice(startPos + 1);
}
