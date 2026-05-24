import { AIProvider } from "../types";

export class GitHubModelsProvider implements AIProvider {
  name = "GitHub Models (GPT-4o mini)";
  private apiUrl = "https://models.inference.ai.azure.com/chat/completions";
  private model = "gpt-4o-mini";

  isAvailable(): boolean {
    return !!process.env.GITHUB_TOKEN;
  }

  async generate(prompt: string, systemPrompt: string): Promise<string> {
    const response = await fetch(this.apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GITHUB_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        temperature: 0.3,
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`GitHub Models API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "";
  }

  async *generateStream(prompt: string, systemPrompt: string): AsyncGenerator<string, void, unknown> {
    const response = await fetch(this.apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GITHUB_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        temperature: 0.3,
        stream: true,
      })
    });

    if (!response.ok) {
      throw new Error(`GitHub Models Stream API error: ${response.status}`);
    }

    if (!response.body) throw new Error("No response body");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.trim() === 'data: [DONE]') return;
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              const content = data.choices[0]?.delta?.content;
              if (content) yield content;
            } catch (e) {
              // Ignore parse errors from incomplete chunks
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
}
