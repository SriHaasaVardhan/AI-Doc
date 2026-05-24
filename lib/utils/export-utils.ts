import { HealthAnalysis } from "../demo-data";

export function downloadMarkdown(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function formatDocFilename(docType: string): string {
  const map: Record<string, string> = {
    'readme': 'README.md',
    'api-docs': 'API_DOCUMENTATION.md',
    'setup-guide': 'SETUP_GUIDE.md',
    'architecture': 'ARCHITECTURE.md',
    'folder-structure': 'FOLDER_STRUCTURE.md',
    'mermaid-diagrams': 'DIAGRAMS.md'
  };
  return map[docType] || `${docType}.md`;
}

export function generateHealthReport(health: HealthAnalysis): string {
  return `# Codebase Health Report

## Overall Score: ${Math.round(health.overallScore)}/100

### Metrics
- **Architecture Quality**: ${Math.round(health.architecture)}/100
- **Documentation Completeness**: ${Math.round(health.documentation)}/100
- **Maintainability**: ${Math.round(health.maintainability)}/100
- **Code Complexity**: ${Math.round(health.complexity)}/100 (Lower is better)
- **Dependency Risk**: ${health.dependencyRisk.toUpperCase()}

### Features Detected
- Tests: ${health.hasTests ? '✅' : '❌'}
- Linting: ${health.hasLinting ? '✅' : '❌'}
- TypeScript: ${health.hasTypeScript ? '✅' : '❌'}

### Actionable Suggestions
${health.suggestions.map(s => `- ${s}`).join('\n')}
`;
}
