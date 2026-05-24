import { AIProvider } from "../types";
import { createProviderError, extractChatContent, fetchWithTimeout } from "./provider-utils";

export class GroqProvider implements AIProvider {
  name = "GroqCloud";
  private apiUrl = "https://api.groq.com/openai/v1/chat/completions";

  isAvailable(): boolean {
    return !!process.env.GROQ_API_KEY;
  }

  async generate(prompt: string, systemPrompt: string): Promise<string> {
    const model = this.getModel();
    const response = await fetchWithTimeout(this.apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        temperature: 0.3,
      })
    });

    if (!response.ok) {
      throw await createProviderError(`Groq (${model})`, response);
    }

    const data = await response.json();
    const content = extractChatContent(data);

    if (!content) {
      throw new Error(`Groq (${model}) returned an empty response.`);
    }

    return content;
  }

  async *generateStream(prompt: string, systemPrompt: string): AsyncGenerator<string, void, unknown> {
    const model = this.getModel();
    const response = await fetchWithTimeout(this.apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        temperature: 0.3,
        stream: true,
      })
    });

    if (!response.ok) {
      throw await createProviderError(`Groq Stream (${model})`, response);
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
            } catch {
              // Ignore parse errors from incomplete chunks
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  private getModel(): string {
    return process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
  }
}
