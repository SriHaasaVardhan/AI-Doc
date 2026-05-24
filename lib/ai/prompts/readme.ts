const SYSTEM_PROMPT = `You are a technical documentation expert. Generate a professional README.md.
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

Generate a professional README.md with these sections:
- **Title** (h1) with project name
- **Badges** placeholder (build, license, version)
- **Description** — 2-3 sentence overview
- **Features** — bullet list of key capabilities
- **Tech Stack** — frameworks, languages, tools used
- **Installation** — step-by-step commands
- **Usage** — basic usage examples
- **Project Structure** — brief directory overview
- **Contributing** — short contributing guidelines
- **License** — license placeholder

Rules:
- Do NOT hallucinate or invent information
- Only reference data provided above
- Use concise bullet points, not prose
- Output in clean markdown format`,
  };
}
