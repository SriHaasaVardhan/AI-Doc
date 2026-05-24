import { NextResponse } from "next/server";
import { parseGitHubUrl, buildZipballUrl } from "@/lib/utils/github-utils";
import { extractZipBuffer } from "@/lib/utils/zip-handler";
import { parseRepository } from "@/lib/parsers/parser-engine";

export async function POST(req: Request) {
  let extractionResult;
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "No URL provided" }, { status: 400 });
    }

    const repoInfo = parseGitHubUrl(url);
    if (!repoInfo) {
      return NextResponse.json({ error: "Invalid GitHub URL" }, { status: 400 });
    }

    const { owner, repo } = repoInfo;
    const zipballUrl = buildZipballUrl(owner, repo);

    // Download the ZIP from GitHub API
    const response = await fetch(zipballUrl, {
      headers: {
        'User-Agent': 'DocuGen-AI',
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!response.ok) {
      if (response.status === 404) return NextResponse.json({ error: "Repository not found or is private" }, { status: 404 });
      if (response.status === 403) return NextResponse.json({ error: "GitHub API rate limit exceeded" }, { status: 403 });
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Check size limit (50MB)
    if (buffer.length > 50 * 1024 * 1024) {
      return NextResponse.json({ error: "Repository size exceeds 50MB limit" }, { status: 400 });
    }

    // Extract ZIP
    extractionResult = await extractZipBuffer(buffer);
    
    // Parse Repository
    const summary = await parseRepository(`${owner}/${repo}`, extractionResult.files, extractionResult.folderStructure);

    return NextResponse.json(summary);

  } catch (error: unknown) {
    console.error("GitHub Import API Error:", error);
    return NextResponse.json({ error: getErrorMessage(error, "Failed to import from GitHub") }, { status: 500 });
  } finally {
    if (extractionResult?.cleanup) {
      extractionResult.cleanup();
    }
  }
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) {
    return error.message;
  }

  return typeof error === "string" ? error : fallback;
}
