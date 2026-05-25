import { AIProvider } from "../types";
import { createProviderError, fetchWithTimeout } from "./provider-utils";

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
};

export class GoogleProvider implements AIProvider {
  name = "Google Gemini";
  private baseUrl = "https://generativelanguage.googleapis.com/v1beta/models";

  isAvailable(): boolean {
    return !!process.env.GOOGLE_API_KEY;
  }

  async generate(prompt: string, systemPrompt: string): Promise<string> {
    const model = this.getModel();
    const response = await fetchWithTimeout(
      `${this.baseUrl}/${model}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GOOGLE_API_KEY!,
        },
        body: JSON.stringify(this.buildRequestBody(prompt, systemPrompt)),
      }
    );

    if (!response.ok) {
      throw await createProviderError(`Google Gemini (${model})`, response);
    }

    const data = (await response.json()) as GeminiResponse;
    const content = extractGeminiContent(data);

    if (!content) {
      throw new Error(`Google Gemini (${model}) returned an empty response.`);
    }

    return content;
  }

  async *generateStream(prompt: string, systemPrompt: string): AsyncGenerator<string, void, unknown> {
    const model = this.getModel();
    const response = await fetchWithTimeout(
      `${this.baseUrl}/${model}:streamGenerateContent?alt=sse`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GOOGLE_API_KEY!,
        },
        body: JSON.stringify(this.buildRequestBody(prompt, systemPrompt)),
      }
    );

    if (!response.ok) {
      throw await createProviderError(`Google Gemini Stream (${model})`, response);
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
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;

          const payload = trimmed.slice(5).trim();
          if (!payload || payload === "[DONE]") continue;

          try {
            const data = JSON.parse(payload) as GeminiResponse;
            const text = extractGeminiContent(data);
            if (text) yield text;
          } catch {
            // Ignore parse errors from incomplete chunks
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  private buildRequestBody(prompt: string, systemPrompt: string) {
    return {
      systemInstruction: {
        parts: [{ text: systemPrompt }],
      },
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.3,
      },
    };
  }

  private getModel(): string {
    return process.env.GOOGLE_MODEL || "gemini-2.0-flash";
  }
}

function extractGeminiContent(data: GeminiResponse): string {
  const parts = data.candidates?.[0]?.content?.parts;
  if (!parts?.length) return "";

  return parts
    .map((part) => part.text || "")
    .join("")
    .trim();
}
