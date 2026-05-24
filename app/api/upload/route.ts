import { NextResponse } from "next/server";
import { extractZipBuffer } from "@/lib/utils/zip-handler";
import { parseRepository } from "@/lib/parsers/parser-engine";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  let extractionResult;
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (!file.name.endsWith(".zip")) {
      return NextResponse.json({ error: "File must be a ZIP archive" }, { status: 400 });
    }

    const maxUploadSizeMb = Number(process.env.MAX_UPLOAD_SIZE_MB || 50);

    if (file.size > maxUploadSizeMb * 1024 * 1024) {
      return NextResponse.json({ error: `File size exceeds ${maxUploadSizeMb}MB limit` }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Extract ZIP
    extractionResult = await extractZipBuffer(buffer);
    
    // Parse Repository
    const repoName = file.name.replace('.zip', '');
    const summary = await parseRepository(repoName, extractionResult.files, extractionResult.folderStructure);

    return NextResponse.json(summary);

  } catch (error: unknown) {
    console.error("Upload API Error:", error);
    return NextResponse.json({ error: getErrorMessage(error, "Failed to process upload") }, { status: 500 });
  } finally {
    // Ensure cleanup happens
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
