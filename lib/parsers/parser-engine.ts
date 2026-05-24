import { FileEntry, ParseResult, RepositorySummary } from "./types";
import { parseFallback } from "./fallback/regex-parser";

// Helper to determine language
function getLanguage(extension: string): string {
  const map: Record<string, string> = {
    '.ts': 'TypeScript',
    '.tsx': 'TSX',
    '.js': 'JavaScript',
    '.jsx': 'JSX',
    '.py': 'Python',
    '.java': 'Java',
    '.dart': 'Dart',
    '.json': 'JSON',
    '.md': 'Markdown',
    '.html': 'HTML',
    '.css': 'CSS',
  };
  return map[extension] || 'Unknown';
}

export async function parseRepository(name: string, files: FileEntry[], folderStructure: string): Promise<RepositorySummary> {
  const summary: RepositorySummary = {
    name,
    totalFiles: files.length,
    totalLines: 0,
    languages: {},
    dependencies: {},
    devDependencies: {},
    scripts: {},
    folderStructure,
    files: [],
    frameworks: [],
    packageManager: 'npm',
    hasTests: false,
    hasLinting: false,
    hasTypeScript: false,
    envVars: [],
  };

  // 1. First pass: extract metadata from configs (package.json, etc)
  for (const file of files) {
    if (file.path.endsWith('package.json')) {
      try {
        const pkg = JSON.parse(file.content);
        if (pkg.dependencies) Object.assign(summary.dependencies, pkg.dependencies);
        if (pkg.devDependencies) Object.assign(summary.devDependencies, pkg.devDependencies);
        if (pkg.scripts) Object.assign(summary.scripts, pkg.scripts);
      } catch (e) {
        console.warn('Failed to parse package.json');
      }
    } else if (file.path.includes('.env')) {
      // Very basic env var extraction
      const lines = file.content.split('\n');
      for (const line of lines) {
        if (line.trim() && !line.startsWith('#') && line.includes('=')) {
          summary.envVars.push(line.split('=')[0].trim());
        }
      }
    }
  }

  // Detect TS, Tests, Linting
  summary.hasTypeScript = !!summary.devDependencies['typescript'] || !!summary.dependencies['typescript'];
  const testDeps = ['jest', 'vitest', 'mocha', 'cypress', 'playwright'];
  const lintDeps = ['eslint', 'prettier', 'stylelint'];
  summary.hasTests = Object.keys(summary.devDependencies).some(dep => testDeps.includes(dep));
  summary.hasLinting = Object.keys(summary.devDependencies).some(dep => lintDeps.includes(dep));

  // Framework detection based on deps
  const frameworkMap: Record<string, string> = {
    'next': 'Next.js',
    'react': 'React',
    'vue': 'Vue',
    'express': 'Express',
    '@nestjs/core': 'NestJS',
    'tailwindcss': 'Tailwind CSS',
    '@prisma/client': 'Prisma'
  };

  for (const [dep, framework] of Object.entries(frameworkMap)) {
    if (summary.dependencies[dep] || summary.devDependencies[dep]) {
      summary.frameworks.push(framework);
    }
  }

  // 2. Second pass: Parse files
  for (const file of files) {
    const lang = getLanguage(file.extension);
    
    summary.languages[lang] = (summary.languages[lang] || 0) + 1;
    
    const lines = file.content.split('\n').length;
    summary.totalLines += lines;

    // For hackathon simplicity and speed, we'll use the regex parser for everything
    // It's much faster than ts-morph and less error-prone across random repos
    if (['.ts', '.tsx', '.js', '.jsx', '.py', '.java', '.dart'].includes(file.extension)) {
      try {
        const result = parseFallback(file.path, file.content, file.extension);
        result.language = lang;
        result.lineCount = lines;
        
        // Only include files that actually have something interesting
        if (result.functions.length > 0 || result.classes.length > 0 || result.routes.length > 0) {
          summary.files.push(result);
        }
      } catch (err) {
        console.warn(`Failed to parse ${file.path}`, err);
      }
    }
  }

  // Remove duplicate env vars
  summary.envVars = [...new Set(summary.envVars)];

  return summary;
}
