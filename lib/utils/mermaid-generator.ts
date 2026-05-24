import { RepositorySummary } from "../parsers/types";

export function generateArchitectureDiagram(summary: RepositorySummary): string {
  let diagram = `graph TD\n`;
  diagram += `  Client["Client Application"]\n`;
  
  if (summary.frameworks.includes('Next.js') || summary.frameworks.includes('React')) {
    diagram += `  UI["UI Components (React)"]\n`;
    diagram += `  Client --> UI\n`;
  }

  diagram += `  API["API / Backend Services"]\n`;
  
  if (summary.frameworks.includes('Next.js')) {
    diagram += `  UI --> API\n`;
  } else {
    diagram += `  Client --> API\n`;
  }

  if (summary.dependencies['@prisma/client'] || summary.dependencies['mongoose'] || summary.dependencies['pg']) {
    diagram += `  DB[("Database")]\n`;
    diagram += `  API --> DB\n`;
  }

  return diagram;
}

export function generateDependencyDiagram(summary: RepositorySummary): string {
  let diagram = `graph LR\n`;
  diagram += `  App["${summary.name}"]\n`;
  
  const categories: Record<string, string[]> = {
    'Core': ['react', 'next', 'express', 'vue', 'angular'],
    'Data': ['@prisma/client', 'mongoose', 'pg', 'mysql2', 'zod'],
    'UI': ['tailwindcss', 'framer-motion', 'lucide-react', 'styled-components'],
    'Tools': ['typescript', 'jest', 'vitest', 'eslint', 'prettier']
  };

  const allDeps = { ...summary.dependencies, ...summary.devDependencies };

  for (const [category, packages] of Object.entries(categories)) {
    const found = packages.filter(p => allDeps[p]);
    if (found.length > 0) {
      diagram += `  ${category}["${category} Layer"]\n`;
      diagram += `  App --> ${category}\n`;
      found.forEach(p => {
        const id = p.replace(/[^a-zA-Z0-9]/g, '');
        diagram += `  ${id}["${p}"]\n`;
        diagram += `  ${category} --> ${id}\n`;
      });
    }
  }

  return diagram;
}

export function generateAllDiagrams(summary: RepositorySummary): string {
  return `## Architecture Overview
\`\`\`mermaid
${generateArchitectureDiagram(summary)}
\`\`\`

## Core Dependencies
\`\`\`mermaid
${generateDependencyDiagram(summary)}
\`\`\`
`;
}
