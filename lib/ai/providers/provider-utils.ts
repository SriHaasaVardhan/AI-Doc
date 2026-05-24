export class ProviderApiError extends Error {
  status: number;
  body: string;

  constructor(providerName: string, status: number, body: string) {
    super(`${providerName} API error: ${status} ${extractProviderMessage(body)}`);
    this.name = "ProviderApiError";
    this.status = status;
    this.body = body;
  }
}

export function getEnvList(name: string): string[] {
  return (process.env[name] || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function getEnvNumber(name: string, fallback: number): number {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

export async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit,
  timeoutMs = getEnvNumber("AI_TIMEOUT_MS", 30000)
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

export async function createProviderError(providerName: string, response: Response): Promise<ProviderApiError> {
  const body = await response.text();
  return new ProviderApiError(providerName, response.status, body);
}

export function shouldRetryProviderError(error: unknown): boolean {
  if (error instanceof ProviderApiError) {
    return [408, 500, 502, 503, 504].includes(error.status);
  }

  return error instanceof Error && error.name === "AbortError";
}

export function shouldTryNextModel(error: unknown): boolean {
  if (!(error instanceof ProviderApiError)) {
    return false;
  }

  return [400, 402, 404, 408, 429, 500, 502, 503, 504].includes(error.status);
}

type ChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: unknown;
    };
  }>;
};

export function extractChatContent(data: unknown): string {
  const content = (data as ChatCompletionResponse)?.choices?.[0]?.message?.content;
  return typeof content === "string" ? content.trim() : "";
}

function extractProviderMessage(body: string): string {
  try {
    const parsed = JSON.parse(body);
    const message = parsed?.error?.message || parsed?.message;
    const raw = parsed?.error?.metadata?.raw;

    if (message && raw) {
      return `${message}: ${raw}`;
    }

    if (message) {
      return message;
    }
  } catch {
    // Fall through to the plain text body.
  }

  return body.slice(0, 500);
}
