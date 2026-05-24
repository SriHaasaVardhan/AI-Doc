import { RepositorySummary } from "../parsers/types";
import { estimateTokens, truncateToTokenLimit } from "../ai/token-estimator";

export function buildCompactSummary(summary: RepositorySummary): string {
  let text = `Project: ${summary.name}\n`;
  text += `Tech Stack: ${summary.frameworks.join(', ')} | PM: ${summary.packageManager}\n`;
  text += `Stats: ${summary.totalFiles} files, ${summary.totalLines} lines\n\n`;

  text += `Dependencies:\n`;
  const mainDeps = Object.entries(summary.dependencies).slice(0, 15);
  for (const [dep, version] of mainDeps) {
    text += `- ${dep}: ${version}\n`;
  }
  
  if (Object.keys(summary.scripts).length > 0) {
    text += `\nScripts:\n`;
    for (const [name, cmd] of Object.entries(summary.scripts)) {
      text += `- ${name}: ${cmd}\n`;
    }
  }

  if (summary.envVars.length > 0) {
    text += `\nEnvironment Variables:\n${summary.envVars.join(', ')}\n`;
  }

  text += `\nFolder Structure:\n${summary.folderStructure}\n\n`;
  
  text += `Key Components:\n`;
  
  for (const file of summary.files) {
    // Skip empty files
    if (file.functions.length === 0 && file.classes.length === 0 && file.routes.length === 0) {
      continue;
    }

    text += `\nFile: ${file.filePath}\n`;
    
    if (file.routes.length > 0) {
      text += `  Routes:\n`;
      file.routes.forEach(r => {
        text += `    - ${r.method} ${r.path}\n`;
      });
    }

    if (file.classes.length > 0) {
      text += `  Classes:\n`;
      file.classes.forEach(c => {
        const methods = c.methods.length > 0 ? ` (Methods: ${c.methods.join(', ')})` : '';
        const ext = c.extends ? ` extends ${c.extends}` : '';
        text += `    - ${c.name}${ext}${methods}\n`;
      });
    }

    if (file.functions.length > 0) {
      text += `  Functions:\n`;
      file.functions.forEach(f => {
        if (f.isExported) {
          text += `    - ${f.name}(${f.params.join(', ')})\n`;
        }
      });
    }
  }

  // Ensure we don't blow up context window (roughly 12000 chars = ~3000 tokens)
  return truncateToTokenLimit(text, 3500);
}
