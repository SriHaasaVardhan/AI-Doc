import type { RepositorySummary } from "./parsers/types";
import type { HealthAnalysis, InsightItem } from "./demo-data";

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

// Simple in-memory store for passing data between pages
class Store {
  private summary: RepositorySummary | null = null;
  private generationResult: GenerationResult | null = null;
  private healthAnalysis: HealthAnalysis | null = null;
  private insights: InsightItem[] | null = null;

  setSummary(data: RepositorySummary) { this.summary = data; }
  getSummary() { return this.summary; }

  setGenerationResult(data: GenerationResult) { this.generationResult = data; }
  getGenerationResult() { return this.generationResult; }

  setHealthAnalysis(data: HealthAnalysis) { this.healthAnalysis = data; }
  getHealthAnalysis() { return this.healthAnalysis; }

  setInsights(data: InsightItem[]) { this.insights = data; }
  getInsights() { return this.insights; }

  clear() {
    this.summary = null;
    this.generationResult = null;
    this.healthAnalysis = null;
    this.insights = null;
  }
}

export const globalStore = new Store();
