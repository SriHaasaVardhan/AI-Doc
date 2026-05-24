export interface AIProvider {
  name: string;
  generate(prompt: string, systemPrompt: string): Promise<string>;
  generateStream(prompt: string, systemPrompt: string): AsyncGenerator<string, void, unknown>;
  isAvailable(): boolean;
}

export interface AIRequestOptions {
  maxTokens?: number;
  temperature?: number;
  timeout?: number;
}

export interface AIResponse {
  content: string;
  provider: string;
  model: string;
  tokensUsed?: number;
}

export type DocType = 'readme' | 'api-docs' | 'setup-guide' | 'architecture' | 'folder-structure' | 'mermaid-diagrams';

export interface GenerationResult {
  readme: string;
  apiDocs: string;
  setupGuide: string;
  architecture: string;
  folderStructure: string;
  mermaidDiagrams: string;
  provider: string;
  model: string;
}
