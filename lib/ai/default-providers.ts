import type { AIProvider } from "./types";
import { GoogleProvider } from "./providers/google";
import { GroqProvider } from "./providers/groq";
import { GitHubModelsProvider } from "./providers/github";
import { OpenRouterProvider } from "./providers/openrouter";

/** Primary chain: OpenRouter → Groq → Google (each skipped if its API key is unset). */
export function createAIProviders(): AIProvider[] {
  return [
    new OpenRouterProvider(),
    new GroqProvider(),
    new GoogleProvider(),
    new GitHubModelsProvider(),
  ];
}
