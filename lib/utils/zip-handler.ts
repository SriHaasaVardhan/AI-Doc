import AdmZip from "adm-zip";
import os from "os";
import path from "path";
import fs from "fs";
import { FileEntry } from "../parsers/types";
import { shouldIgnorePath, shouldIgnoreFile, isBinaryFile, isParseableFile } from "./file-filter";

export interface ZipExtractionResult {
  extractedPath: string;
  files: FileEntry[];
  folderStructure: string;
  cleanup: () => void;
}

export async function extractZipBuffer(buffer: Buffer): Promise<ZipExtractionResult> {
  const tmpDir = path.join(os.tmpdir(), `docugen-${Date.now()}-${Math.random().toString(36).substring(7)}`);
  
  // Need to handle AdmZip synchronously as its async methods can be finicky in serverless
  const zip = new AdmZip(buffer);
  const zipEntries = zip.getEntries();
  
  const files: FileEntry[] = [];
  const paths: string[] = [];
  
  fs.mkdirSync(tmpDir, { recursive: true });

  for (const entry of zipEntries) {
    if (entry.isDirectory) continue;

    // Normalize path separators
    const entryPath = entry.entryName.replace(/\\/g, '/');
    const fileName = entry.name;
    
    // Remove top-level wrapper folder if it exists (common in GitHub downloads)
    const pathParts = entryPath.split('/');
    const cleanPath = pathParts.length > 1 ? pathParts.slice(1).join('/') : entryPath;
    
    if (shouldIgnorePath(cleanPath) || shouldIgnoreFile(fileName) || isBinaryFile(cleanPath)) {
      continue;
    }

    paths.push(cleanPath);

    // Only read content for files we actually plan to parse
    if (isParseableFile(cleanPath)) {
      try {
        const content = entry.getData().toString('utf8');
        // Simple heuristic to skip minified/compiled files or gigantic files
        if (content.length > 500 * 1024 || (content.length > 50000 && content.split('\\n').length < 10)) {
          continue;
        }

        files.push({
          path: cleanPath,
          content,
          size: entry.header.size,
          extension: path.extname(cleanPath).toLowerCase()
        });
      } catch (err) {
        console.warn(`Failed to read entry: ${cleanPath}`, err);
      }
    }
  }

  const folderStructure = buildFolderTree(paths);

  const cleanup = () => {
    try {
      if (fs.existsSync(tmpDir)) {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      }
    } catch (e) {
      console.error("Cleanup failed", e);
    }
  };

  return {
    extractedPath: tmpDir,
    files,
    folderStructure,
    cleanup
  };
}

function buildFolderTree(paths: string[]): string {
  // Sort paths alphabetically
  paths.sort();
  
  const lines: string[] = [];
  
  // Maximum number of lines in tree to avoid blowing up tokens
  const MAX_LINES = 150;
  
  for (let i = 0; i < Math.min(paths.length, MAX_LINES); i++) {
    const parts = paths[i].split('/');
    let prefix = '';
    
    for (let j = 0; j < parts.length - 1; j++) {
      prefix += '│   ';
    }
    
    lines.push(`${prefix}├── ${parts[parts.length - 1]}`);
  }
  
  if (paths.length > MAX_LINES) {
    lines.push(`... and ${paths.length - MAX_LINES} more files omitted`);
  }
  
  return lines.join('\\n');
}
