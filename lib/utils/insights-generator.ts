import { RepositorySummary } from "../parsers/types";
import { InsightItem } from "../demo-data";

export function generateInsights(summary: RepositorySummary): InsightItem[] {
  const insights: InsightItem[] = [];
  let idCounter = 1;
  const add = (insight: Omit<InsightItem, 'id'>) => insights.push({ ...insight, id: String(idCounter++) });

  // 1. Architecture Style
  if (summary.frameworks.includes('Next.js')) {
    const hasApp = summary.folderStructure.includes('├── app/');
    const hasPages = summary.folderStructure.includes('├── pages/');
    add({
      category: 'architecture',
      title: 'Next.js Architecture',
      description: `Project uses Next.js with the ${hasApp ? 'App Router' : ''}${hasApp && hasPages ? ' and ' : ''}${hasPages ? 'Pages Router' : ''}.`,
      severity: 'info',
      confidence: 100
    });
  }

  // 2. Project Purpose
  const hasFrontend = summary.frameworks.some(f => ['React', 'Vue', 'Next.js'].includes(f));
  const hasBackend = summary.frameworks.some(f => ['Express', 'Next.js', 'NestJS'].includes(f));
  if (hasFrontend && hasBackend) {
    add({
      category: 'architecture',
      title: 'Full-stack Application',
      description: 'Contains both frontend UI components and backend API routes.',
      severity: 'info',
      confidence: 90
    });
  }

  // 3. Maintainability
  if (summary.hasTypeScript) {
    add({
      category: 'maintainability',
      title: 'Strong Type Safety',
      description: 'TypeScript is used, reducing runtime errors and improving developer experience.',
      severity: 'success',
      confidence: 100
    });
  } else {
    add({
      category: 'maintainability',
      title: 'Missing Type Safety',
      description: 'Project is primarily JavaScript. Consider migrating to TypeScript for better maintainability.',
      severity: 'warning',
      confidence: 90
    });
  }

  // 4. Testing
  if (summary.hasTests) {
    add({
      category: 'maintainability',
      title: 'Test Infrastructure Present',
      description: 'Testing frameworks detected. Good foundation for reliable code.',
      severity: 'success',
      confidence: 100
    });
  } else {
    add({
      category: 'maintainability',
      title: 'No Tests Detected',
      description: 'Consider adding a testing framework like Jest or Vitest to ensure code reliability.',
      severity: 'critical',
      confidence: 80
    });
  }

  // 5. Code Quality
  if (summary.totalLines > 0) {
    const avgLines = summary.totalLines / summary.totalFiles;
    if (avgLines > 400) {
      add({
        category: 'scalability',
        title: 'Large File Sizes',
        description: `Average file size is high (~${Math.round(avgLines)} lines). Consider breaking down large files into smaller modules.`,
        severity: 'warning',
        confidence: 85
      });
    } else {
      add({
        category: 'scalability',
        title: 'Modular Codebase',
        description: `Average file size is healthy (~${Math.round(avgLines)} lines), indicating good modularity.`,
        severity: 'success',
        confidence: 85
      });
    }
  }

  // 6. Dependencies
  const depCount = Object.keys(summary.dependencies).length;
  if (depCount > 40) {
    add({
      category: 'dependencies',
      title: 'High Dependency Count',
      description: `Project has ${depCount} production dependencies. Review for potential bloat or security risks.`,
      severity: 'warning',
      confidence: 95
    });
  } else {
    add({
      category: 'dependencies',
      title: 'Healthy Dependency Count',
      description: `${depCount} production dependencies is a manageable amount.`,
      severity: 'success',
      confidence: 95
    });
  }

  return insights;
}
