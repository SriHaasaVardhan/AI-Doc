const SYSTEM_PROMPT = `You are a software architect.
- Output clean markdown
- Be concise and accurate
- Do NOT hallucinate or invent information
- Only use provided data`;

export function buildPrompt(summary: string): {
  system: string;
  user: string;
} {
  return {
    system: SYSTEM_PROMPT,
    user: `Based ONLY on the following repository data:

${summary}

Generate an architecture overview with these sections:
- **High-Level Design** — overall system architecture in 3-5 sentences
- **Components** — bullet list of major components with brief description
- **Data Flow** — how data moves through the system
- **Design Patterns** — patterns observed (MVC, middleware, etc.)
- **Key Technologies** — frameworks, libraries, and their roles
- **Entry Points** — main entry files and what they do

Rules:
- Do NOT hallucinate or invent information
- Only describe patterns visible in provided data
- Keep descriptions concise (1-2 lines per component)
- Output in clean markdown format`,
  };
}
