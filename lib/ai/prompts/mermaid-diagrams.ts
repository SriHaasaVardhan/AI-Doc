const SYSTEM_PROMPT = `You are a diagram expert using Mermaid syntax.
- Output ONLY valid Mermaid code blocks
- Do NOT include any other text outside code blocks
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

Generate exactly 3 Mermaid diagrams. Output ONLY valid Mermaid code blocks, each wrapped in \`\`\`mermaid ... \`\`\` fences.

1. **Architecture Overview** (graph TD)
   - Show main components and their relationships
   - Use descriptive node labels
   - Max 10 nodes

2. **API/Data Flow** (sequenceDiagram)
   - Show request flow from client through system layers
   - Include key services/modules
   - Max 8 interactions

3. **Module Structure** (graph LR)
   - Show folder/module groupings
   - Show dependencies between modules
   - Max 8 nodes

Rules:
- Do NOT hallucinate or invent information
- Output ONLY valid Mermaid syntax
- Quote node labels containing special characters
- No HTML in labels
- Each diagram must be in a separate mermaid code block`,
  };
}
