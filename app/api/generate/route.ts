import { NextResponse } from "next/server";
import { FallbackManager } from "@/lib/ai/fallback-manager";
import { OpenRouterProvider } from "@/lib/ai/providers/openrouter";
import { GroqProvider } from "@/lib/ai/providers/groq";
import { GitHubModelsProvider } from "@/lib/ai/providers/github";
import { buildCompactSummary } from "@/lib/utils/summarizer";
import { buildCombinedPrompt } from "@/lib/ai/prompts";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(req: Request) {
  try {
    const { summary } = await req.json();

    if (!summary) {
      return NextResponse.json({ error: "Missing repository summary" }, { status: 400 });
    }

    const compactSummary = buildCompactSummary(summary);
    
    // Create a TransformStream to send SSE updates
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();
    const encoder = new TextEncoder();

    // Fire and forget generation process
    (async () => {
      try {
        await writer.write(encoder.encode(`data: ${JSON.stringify({ type: 'progress', step: `Analyzing repository and generating all documentation (this takes about 15-30s)...` })}\n\n`));
        
        const { system, user } = buildCombinedPrompt(compactSummary);
        
        let activeProvider = "Unknown";
        let combinedContent = "";
        
        try {
          const fallbackManager = new FallbackManager([
            new OpenRouterProvider(),
            new GroqProvider(),
            new GitHubModelsProvider(),
          ]);
          const result = await fallbackManager.generate(user, system);
          combinedContent = result.content;
          activeProvider = result.provider;
        } catch (e: unknown) {
          console.error(`Error generating docs:`, e);
          throw new Error(`AI Generation failed: ${getErrorMessage(e)}`);
        }

        // Parse the combined content into sections
        const results: Record<string, string> = {
          'readme': extractSection(combinedContent, 'README'),
          'api-docs': extractSection(combinedContent, 'API_DOCS'),
          'setup-guide': extractSection(combinedContent, 'SETUP_GUIDE'),
          'architecture': extractSection(combinedContent, 'ARCHITECTURE'),
          'folder-structure': extractSection(combinedContent, 'FOLDER_STRUCTURE'),
          'mermaid-diagrams': extractSection(combinedContent, 'MERMAID_DIAGRAMS'),
        };

        // Stream the results to the client
        for (const [docType, content] of Object.entries(results)) {
           await writer.write(encoder.encode(`data: ${JSON.stringify({ type: 'result', docType, content })}\n\n`));
        }

        await writer.write(encoder.encode(`data: ${JSON.stringify({ type: 'complete', provider: activeProvider, results })}\n\n`));
      } catch (err: unknown) {
        await writer.write(encoder.encode(`data: ${JSON.stringify({ type: 'error', message: getErrorMessage(err) })}\n\n`));
      } finally {
        await writer.close();
      }
    })();

    return new Response(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: unknown) {
    console.error("Generation API error:", error);
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

function extractSection(content: string, sectionName: string): string {
  const regex = new RegExp(`===${sectionName}===\\n([\\s\\S]*?)(?:===[A-Z_]+===|$)`, 'i');
  const match = content.match(regex);
  return match ? match[1].trim() : `Failed to generate ${sectionName} section.`;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return typeof error === "string" ? error : "Unknown error";
}
