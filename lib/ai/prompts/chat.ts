export interface ChatHistoryMessage {
  role: "user" | "assistant";
  content: string;
}

const CHAT_SYSTEM_PROMPT = `You are a repository-aware coding assistant embedded in a documentation tool.
Answer questions ONLY using the repository context provided below.
Rules:
- Be concise (roughly 3–8 sentences unless the user asks for detail).
- Use Markdown: short headings, bullet lists, and inline code for paths/commands.
- Reference real file paths, routes, scripts, dependencies, and symbols from the context.
- If the context does not contain enough information, say what is missing and what was checked.
- Do NOT invent libraries, endpoints, env vars, or files not supported by the context.
- Do NOT greet the user or add filler like "Great question". Answer directly.`;

const MAX_HISTORY_TURNS = 6;

function formatHistory(history: ChatHistoryMessage[]): string {
  const recent = history.slice(-MAX_HISTORY_TURNS * 2);
  if (!recent.length) return "";

  const lines = recent.map((m) => {
    const label = m.role === "user" ? "User" : "Assistant";
    return `${label}: ${m.content.trim()}`;
  });

  return `## Conversation so far\n${lines.join("\n\n")}`;
}

export function buildChatPrompt(
  question: string,
  repositoryContext: string,
  history: ChatHistoryMessage[] = []
): { system: string; user: string } {
  const historyBlock = formatHistory(history);
  const userParts = [
    "## Repository context",
    repositoryContext,
    historyBlock,
    "## Current question",
    question.trim(),
    "",
    "Answer the current question using the repository context. Stay specific to this codebase.",
  ].filter(Boolean);

  return {
    system: CHAT_SYSTEM_PROMPT,
    user: userParts.join("\n\n"),
  };
}
