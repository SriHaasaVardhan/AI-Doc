import { NextResponse } from "next/server";
import AdmZip from "adm-zip";

export async function POST(req: Request) {
  try {
    const { docs, repoName, format } = await req.json();

    if (!docs || typeof docs !== 'object') {
      return NextResponse.json({ error: "Invalid documentation payload" }, { status: 400 });
    }

    if (format === 'zip') {
      const zip = new AdmZip();
      
      const safeRepoName = (repoName || "repository").replace(/[^a-zA-Z0-9_-]/g, "_");
      
      for (const [filename, content] of Object.entries(docs)) {
        if (typeof content === 'string') {
          zip.addFile(filename, Buffer.from(content, "utf8"));
        }
      }

      const zipBuffer = zip.toBuffer();

      return new NextResponse(zipBuffer, {
        headers: {
          "Content-Type": "application/zip",
          "Content-Disposition": `attachment; filename="docugen-${safeRepoName}.zip"`,
        },
      });
    }

    return NextResponse.json({ error: "Unsupported format" }, { status: 400 });

  } catch (error: unknown) {
    console.error("Export API Error:", error);
    return NextResponse.json({ error: getErrorMessage(error, "Failed to generate export") }, { status: 500 });
  }
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) {
    return error.message;
  }

  return typeof error === "string" ? error : fallback;
}
