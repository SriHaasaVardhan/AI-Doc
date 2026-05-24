import path from "path";

const IGNORE_DIRS = [
  "node_modules", "dist", "build", ".next", "coverage", ".git", 
  "__pycache__", ".idea", ".vscode", ".gradle", "target", "out", 
  ".dart_tool", ".pub-cache", "vendor"
];

const IGNORE_FILES = [
  ".DS_Store", "Thumbs.db", "package-lock.json", "yarn.lock", "pnpm-lock.yaml", 
  "Pipfile.lock", "poetry.lock", "Gemfile.lock", "composer.lock"
];

const BINARY_EXTENSIONS = new Set([
  ".exe", ".dll", ".so", ".dylib", ".bin", ".obj", ".o", ".class", 
  ".jar", ".war", ".woff", ".woff2", ".ttf", ".eot", ".ico", 
  ".png", ".jpg", ".jpeg", ".gif", ".svg", ".bmp", ".webp", 
  ".mp4", ".mp3", ".avi", ".mov", ".pdf", ".zip", ".tar", 
  ".gz", ".rar", ".7z", ".sqlite", ".sqlite3", ".db"
]);

const PARSEABLE_EXTENSIONS = new Set([
  ".ts", ".tsx", ".js", ".jsx", ".py", ".java", ".dart", 
  ".json", ".md", ".yaml", ".yml", ".toml", ".env", 
  ".env.example", ".env.local", ".xml", ".gradle", ".properties",
  ".html", ".css", ".scss", ".sql", ".sh", ".bash"
]);

const MAX_FILE_SIZE = 500 * 1024; // Increased to 500KB for better coverage

export function shouldIgnorePath(filePath: string): boolean {
  const parts = filePath.split(/[/\\]/);
  // Check if any directory part is in IGNORE_DIRS
  return parts.some(part => IGNORE_DIRS.includes(part));
}

export function shouldIgnoreFile(fileName: string): boolean {
  return IGNORE_FILES.includes(fileName);
}

export function isParseableFile(filePath: string): boolean {
  const ext = path.extname(filePath).toLowerCase();
  // If it has no extension, assume it might be parseable (like Dockerfile, Makefile)
  if (!ext) return true;
  return PARSEABLE_EXTENSIONS.has(ext);
}

export function isBinaryFile(filePath: string): boolean {
  const ext = path.extname(filePath).toLowerCase();
  return BINARY_EXTENSIONS.has(ext);
}

export function filterFiles(filePaths: string[]): string[] {
  return filePaths.filter(filePath => {
    const fileName = path.basename(filePath);
    if (shouldIgnorePath(filePath)) return false;
    if (shouldIgnoreFile(fileName)) return false;
    if (isBinaryFile(filePath)) return false;
    return true;
  });
}
