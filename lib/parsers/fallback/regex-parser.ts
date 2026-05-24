import { ParseResult, FunctionInfo, ClassInfo, RouteInfo, ImportInfo } from "../types";

export function parseFallback(filePath: string, content: string, extension: string): ParseResult {
  void extension;

  const functions: FunctionInfo[] = [];
  const classes: ClassInfo[] = [];
  const routes: RouteInfo[] = [];
  const imports: ImportInfo[] = [];
  
  const lines = content.split('\n');

  // Extremely basic regex matching for hackathon speed and fault tolerance
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Detect JS/TS Functions
    if (line.includes('function ') || line.includes('=> {') || line.match(/^[a-zA-Z0-9_]+\s*\([^)]*\)\s*\{/)) {
      const isExported = line.includes('export ');
      const isAsync = line.includes('async ');
      
      let name = "anonymous";
      const nameMatch = line.match(/(?:function\s+|const\s+|let\s+|var\s+)([a-zA-Z0-9_]+)/);
      if (nameMatch) name = nameMatch[1];
      else {
        const methodMatch = line.match(/^([a-zA-Z0-9_]+)\s*\(/);
        if (methodMatch) name = methodMatch[1];
      }

      if (name && name !== 'anonymous') {
        functions.push({
          name,
          params: [], // Hard to parse reliably with regex
          isAsync,
          isExported,
          lineNumber: i + 1
        });
      }
    }

    // Detect JS/TS/Python/Java Classes
    if (line.includes('class ')) {
      const nameMatch = line.match(/class\s+([a-zA-Z0-9_]+)/);
      if (nameMatch) {
        classes.push({
          name: nameMatch[1],
          methods: [],
          properties: [],
          isExported: line.includes('export ') || line.includes('public '),
        });
      }
    }

    // Detect API Routes (Express, Fastify, Next.js, etc)
    if (line.match(/(app|router|server)\.(get|post|put|delete|patch)\s*\(/)) {
      const match = line.match(/(app|router|server)\.(get|post|put|delete|patch)\s*\(\s*['"]([^'"]+)['"]/);
      if (match) {
        routes.push({
          method: match[2].toUpperCase(),
          path: match[3],
        });
      }
    }
    
    // Next.js App Router route handlers
    if (filePath.includes('route.ts') || filePath.includes('route.js')) {
      const methodMatch = line.match(/export\s+(?:async\s+)?function\s+(GET|POST|PUT|DELETE|PATCH)\s*\(/);
      if (methodMatch) {
        routes.push({
          method: methodMatch[1],
          path: filePath.replace('app/', '/').replace('/route.ts', '').replace('/route.js', ''),
        });
      }
    }
  }

  return {
    filePath,
    language: 'Unknown',
    functions,
    classes,
    routes,
    imports,
    exports: [],
    lineCount: lines.length
  };
}
