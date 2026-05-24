import { NextResponse } from "next/server";
import { FallbackManager } from "@/lib/ai/fallback-manager";
import { OpenRouterProvider } from "@/lib/ai/providers/openrouter";
import { GroqProvider } from "@/lib/ai/providers/groq";
import { GitHubModelsProvider } from "@/lib/ai/providers/github";
import { buildChatPrompt, type ChatHistoryMessage } from "@/lib/ai/prompts/chat";
import {
  buildRepositoryChatContext,
  type ChatDocContext,
} from "@/lib/chat/repository-context";
import { buildFallbackChatResponse } from "@/lib/chat/fallback-responses";
import type { RepositorySummary } from "@/lib/parsers/types";

export const runtime = "nodejs";
export const maxDuration = 60;

interface ChatRequestBody {
  summary: RepositorySummary;
  question: string;
  messages?: ChatHistoryMessage[];
  generatedDocs?: ChatDocContext;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ChatRequestBody;
    const { summary, question, messages = [], generatedDocs } = body;

    if (!summary?.name) {
      return NextResponse.json({ error: "Missing repository summary" }, { status: 400 });
    }

    if (!question?.trim()) {
      return NextResponse.json({ error: "Missing question" }, { status: 400 });
    }

    const repositoryContext = buildRepositoryChatContext(summary, generatedDocs);
    const { system, user } = buildChatPrompt(question, repositoryContext, messages);

    try {
      const fallbackManager = new FallbackManager([
        new OpenRouterProvider(),
        new GroqProvider(),
        new GitHubModelsProvider(),
      ]);

      const result = await fallbackManager.generate(user, system);

      return NextResponse.json({
        content: result.content.trim(),
        provider: result.provider,
        fallback: false,
      });
    } catch (aiError) {
      console.error("Chat AI generation failed, using repository fallback:", aiError);

      const content = buildFallbackChatResponse(question, summary, generatedDocs);

      return NextResponse.json({
        content,
        provider: "repository-analysis",
        fallback: true,
      });
    }
  } catch (error: unknown) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return typeof error === "string" ? error : "Unknown error";
}
