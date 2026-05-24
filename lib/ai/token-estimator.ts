// Rough estimation: 1 token ≈ 4 characters in English text
export function estimateTokens(text: string): number {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}

export function truncateToTokenLimit(text: string, maxTokens: number): string {
  if (!text) return "";
  const currentTokens = estimateTokens(text);
  if (currentTokens <= maxTokens) return text;
  
  // Safe truncation margin
  const allowedChars = Math.floor(maxTokens * 3.8);
  return text.substring(0, allowedChars) + "\n\n...[Content truncated for length]...";
}

export function isWithinLimit(text: string, maxTokens: number): boolean {
  return estimateTokens(text) <= maxTokens;
}
