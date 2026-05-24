import { AIProvider } from "./types";
import { retryWithBackoff } from "./retry";
import { getEnvNumber, shouldRetryProviderError } from "./providers/provider-utils";

export class FallbackManager {
  private providers: AIProvider[];

  constructor(providers: AIProvider[]) {
    this.providers = providers.filter(p => p.isAvailable());
    if (this.providers.length === 0) {
      console.warn("No AI providers available. Check environment variables.");
    }
  }

  async generate(prompt: string, systemPrompt: string): Promise<{content: string, provider: string}> {
    if (this.providers.length === 0) {
      throw new Error("No AI providers configured or available.");
    }

    let lastError: unknown;

    for (const provider of this.providers) {
      try {
        console.log(`Attempting generation with provider: ${provider.name}`);
        const content = await retryWithBackoff(
          () => provider.generate(prompt, systemPrompt),
          getEnvNumber("AI_MAX_RETRIES", 2),
          2000,
          shouldRetryProviderError
        );
        return { content, provider: provider.name };
      } catch (err: unknown) {
        console.error(`Provider ${provider.name} failed:`, err);
        lastError = err;
        
        // If we hit a rate limit, try to parse the retry_after_seconds from the error message
        const errorMessage = getErrorMessage(err);
        if (errorMessage.includes("429")) {
          const match = errorMessage.match(/"retry_after_seconds"\s*:\s*(\d+(?:\.\d+)?)/);
          let waitTime = 5000; // Default 5s
          
          if (match && match[1]) {
            waitTime = Math.ceil(parseFloat(match[1])) * 1000 + 1000; // Add 1s buffer
            console.log(`Rate limit hit. Waiting ${waitTime/1000}s before falling back...`);
          } else {
            // Check for Retry-After header format
            const headerMatch = errorMessage.match(/"Retry-After"\s*:\s*"(\d+)"/i);
            if (headerMatch && headerMatch[1]) {
              waitTime = parseInt(headerMatch[1], 10) * 1000 + 1000;
              console.log(`Rate limit hit (Header). Waiting ${waitTime/1000}s before falling back...`);
            }
          }
          
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }

    throw new Error(`All providers failed. Last error: ${getErrorMessage(lastError)}`);
  }

  async *generateStream(prompt: string, systemPrompt: string): AsyncGenerator<{chunk: string, provider: string}, void, unknown> {
    if (this.providers.length === 0) {
      throw new Error("No AI providers configured or available.");
    }

    let lastError: unknown;

    for (const provider of this.providers) {
      try {
        console.log(`Attempting streaming with provider: ${provider.name}`);
        // We don't retry streaming to avoid duplicating chunks, if it fails we just fall back
        const stream = provider.generateStream(prompt, systemPrompt);
        
        let chunkCount = 0;
        for await (const chunk of stream) {
          chunkCount++;
          yield { chunk, provider: provider.name };
        }
        
        // If we got here and actually yielded chunks, we're done
        if (chunkCount > 0) return;
      } catch (err) {
        console.error(`Provider ${provider.name} stream failed:`, err);
        lastError = err;
      }
    }

    throw new Error(`All providers failed. Last error: ${getErrorMessage(lastError)}`);
  }
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return typeof error === "string" ? error : "Unknown error";
}
