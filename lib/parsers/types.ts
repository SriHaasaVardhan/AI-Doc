export interface FunctionInfo {
  name: string;
  params: string[];
  returnType?: string;
  isAsync: boolean;
  isExported: boolean;
  lineNumber?: number;
}

export interface ClassInfo {
  name: string;
  methods: string[];
  properties: string[];
  isExported: boolean;
  extends?: string;
  implements?: string[];
}

export interface RouteInfo {
  method: string;
  path: string;
  handler?: string;
}

export interface ImportInfo {
  source: string;
  specifiers: string[];
  isDefault: boolean;
}

export interface ParseResult {
  filePath: string;
  language: string;
  functions: FunctionInfo[];
  classes: ClassInfo[];
  routes: RouteInfo[];
  imports: ImportInfo[];
  exports: string[];
  lineCount: number;
}

export interface FileEntry {
  path: string;
  content: string;
  size: number;
  extension: string;
}

export interface RepositorySummary {
  name: string;
  totalFiles: number;
  totalLines: number;
  languages: Record<string, number>;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  scripts: Record<string, string>;
  folderStructure: string;
  files: ParseResult[];
  frameworks: string[];
  packageManager: string;
  hasTests: boolean;
  hasLinting: boolean;
  hasTypeScript: boolean;
  envVars: string[];
}
