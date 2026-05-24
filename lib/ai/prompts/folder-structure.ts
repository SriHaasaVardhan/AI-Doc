const SYSTEM_PROMPT = `You are a codebase documentation expert.
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

Generate a folder structure explanation with:
- **Overview** — 1-2 sentence project structure summary
- **Directory Tree** — formatted tree view
- **Directory Descriptions** — for each directory:
  - Purpose
  - Key files and what they do
- **Configuration Files** — explain config files at root level

Rules:
- Do NOT hallucinate or invent information
- Only describe folders/files present in provided data
- Use tree-style formatting (├── ─── └──)
- Keep each description to 1 line
- Output in clean markdown format`,
  };
}
