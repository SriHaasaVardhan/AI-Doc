const SYSTEM_PROMPT = `You are a developer onboarding expert.
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

Generate a step-by-step setup guide with these sections:
- **Prerequisites** — required software, versions, tools
- **Installation** — clone, install deps commands
- **Configuration** — config files to modify
- **Environment Variables** — table of required env vars:
  | Variable | Description | Required |
- **Running the Project** — dev, build, start commands
- **Running Tests** — if test scripts found
- **Common Issues** — 3-5 typical setup problems and fixes

Rules:
- Do NOT hallucinate or invent information
- Only reference dependencies/scripts found in provided data
- Use numbered steps for sequential instructions
- Use code blocks for all commands
- Output in clean markdown format`,
  };
}
