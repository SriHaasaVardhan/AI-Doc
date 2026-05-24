const SYSTEM_PROMPT = `You are an API documentation expert.
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

Generate API documentation with these sections:
- **Overview** — brief API description
- **Base URL** — if identifiable from data
- **Endpoints** — table format for each route:
  | Method | Path | Description |
  - Request body / query params (if applicable)
  - Response format
- **Authentication** — if any auth patterns found
- **Error Handling** — common error response format
- **Examples** — curl or fetch examples for key endpoints

Rules:
- Do NOT hallucinate or invent information
- Only document routes/functions found in provided data
- Use tables for endpoint listings
- Output in clean markdown format`,
  };
}
