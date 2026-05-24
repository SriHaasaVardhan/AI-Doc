import { AIProvider } from "../types";
import {
  createProviderError,
  extractChatContent,
  fetchWithTimeout,
  getEnvList,
  shouldTryNextModel,
} from "./provider-utils";

const DEFAULT_MODELS = [
  "openai/gpt-oss-20b:free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "google/gemma-4-31b-it:free",
  "google/gemma-4-26b-a4b-it:free",
];

export class OpenRouterProvider implements AIProvider {
  name = "OpenRouter";
  private apiUrl = "https://openrouter.ai/api/v1/chat/completions";

  isAvailable(): boolean {
    return !!process.env.OPENROUTER_API_KEY;
  }

  async generate(prompt: string, systemPrompt: string): Promise<string> {
    const errors: Error[] = [];

    for (const model of this.getModels()) {
      try {
        return await this.generateWithModel(model, prompt, systemPrompt);
      } catch (error) {
        if (error instanceof Error) {
          errors.push(error);
        }

        if (!shouldTryNextModel(error)) {
          throw error;
        }
      }
    }

    throw new Error(`OpenRouter failed for all configured models. ${errors.map((error) => error.message).join(" | ")}`);
  }

  async *generateStream(prompt: string, systemPrompt: string): AsyncGenerator<string, void, unknown> {
    const errors: Error[] = [];

    for (const model of this.getModels()) {
      try {
        let chunkCount = 0;

        for await (const chunk of this.generateStreamWithModel(model, prompt, systemPrompt)) {
          chunkCount++;
          yield chunk;
        }

        if (chunkCount > 0) {
          return;
        }
      } catch (error) {
        if (error instanceof Error) {
          errors.push(error);
        }

        if (!shouldTryNextModel(error)) {
          throw error;
        }
      }
    }

    throw new Error(`OpenRouter stream failed for all configured models. ${errors.map((error) => error.message).join(" | ")}`);
  }

  private async generateWithModel(model: string, prompt: string, systemPrompt: string): Promise<string> {
    const response = await fetchWithTimeout(this.apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.OPENROUTER_SITE_URL || "http://localhost:3000",
        "X-Title": process.env.OPENROUTER_APP_NAME || "AI Doc Generator",
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
      throw await createProviderError(`OpenRouter (${model})`, response);
    }

    const data = await response.json();
    const content = extractChatContent(data);

    if (!content) {
      throw new Error(`OpenRouter (${model}) returned an empty response.`);
    }

    return content;
  }

  private async *generateStreamWithModel(model: string, prompt: string, systemPrompt: string): AsyncGenerator<string, void, unknown> {
    const response = await fetchWithTimeout(this.apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.OPENROUTER_SITE_URL || "http://localhost:3000",
        "X-Title": process.env.OPENROUTER_APP_NAME || "AI Doc Generator",
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
      throw await createProviderError(`OpenRouter Stream (${model})`, response);
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

  private getModels(): string[] {
    const configuredModels = [
      ...getEnvList("OPENROUTER_MODELS"),
      ...getEnvList("OPENROUTER_MODEL"),
    ];
    const models = configuredModels.length > 0 ? [...configuredModels, ...DEFAULT_MODELS] : DEFAULT_MODELS;

    return Array.from(new Set(models));
  }
}
