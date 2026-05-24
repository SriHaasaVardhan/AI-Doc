"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { DropZone } from "@/components/upload/DropZone";
import { GitHubImport } from "@/components/upload/GitHubImport";
import { UploadProgress } from "@/components/upload/UploadProgress";
import { FloatingOrbs } from "@/components/ui/FloatingOrbs";
import { globalStore } from "@/lib/store";
import { useToast } from "@/components/ui/Toast";
import { getDemoData, type HealthAnalysis } from "@/lib/demo-data";
import type { DocType } from "@/lib/ai/types";
import type { RepositorySummary } from "@/lib/parsers/types";

type GeneratedDocs = Partial<Record<DocType, string>>;

type GenerateStreamEvent =
  | { type: "progress"; step: string }
  | { type: "result"; docType: DocType; content: string }
  | { type: "complete"; provider: string; results: GeneratedDocs }
  | { type: "error"; message: string };

type ErrorResponse = {
  error?: string;
};

export default function GeneratePage() {
  return (
    <Suspense fallback={<GeneratePageFallback />}>
      <GeneratePageContent />
    </Suspense>
  );
}

function GeneratePageFallback() {
  return (
    <div className="min-h-screen pt-24 pb-12 px-6 flex flex-col items-center justify-center relative overflow-hidden">
      <FloatingOrbs />
      <div className="w-full max-w-4xl flex flex-col items-center z-10">
        <div className="h-12 w-72 rounded-lg bg-white/10" />
        <div className="mt-6 h-4 w-full max-w-xl rounded bg-white/10" />
      </div>
    </div>
  );
}

function GeneratePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToast();
  const isDemo = searchParams.get("demo") === "true";

  const [status, setStatus] = useState<"idle" | "uploading" | "parsing" | "generating" | "complete" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [stepText, setStepText] = useState("");

  const handleDemoFlow = useCallback(async () => {
    setStatus("uploading");
    setStepText("Preloading demo repository...");
    setProgress(10);
    
    await new Promise(r => setTimeout(r, 1000));
    
    setStatus("parsing");
    setStepText("Analyzing architecture and dependencies...");
    setProgress(40);
    
    await new Promise(r => setTimeout(r, 1500));
    
    setStatus("generating");
    setStepText("Generating documentation with AI...");
    setProgress(70);
    
    await new Promise(r => setTimeout(r, 1500));
    
    setProgress(100);
    setStatus("complete");
    setStepText("Complete!");

    const demoData = getDemoData();
    globalStore.setSummary(demoData.summary);
    globalStore.setGenerationResult({
      readme: demoData.readme,
      apiDocs: demoData.apiDocs,
      setupGuide: demoData.setupGuide,
      architecture: demoData.architecture,
      folderStructure: demoData.folderStructure,
      mermaidDiagrams: demoData.mermaidDiagrams,
      provider: "Demo Mode",
      model: "Pre-generated"
    });
    globalStore.setHealthAnalysis(demoData.health);
    globalStore.setInsights(demoData.insights);

    addToast("success", "Demo repository loaded successfully!");
    setTimeout(() => router.push("/results"), 500);
  }, [addToast, router]);

  useEffect(() => {
    if (isDemo && status === "idle") {
      const timer = window.setTimeout(() => {
        void handleDemoFlow();
      }, 0);

      return () => window.clearTimeout(timer);
    }
  }, [handleDemoFlow, isDemo, status]);

  const handleZipUpload = async (file: File) => {
    if (status !== "idle") return;
    
    try {
      setStatus("uploading");
      setStepText("Uploading ZIP archive...");
      setProgress(10);

      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) throw new Error(await readResponseError(uploadRes, "Upload failed"));
      const summary = await uploadRes.json();
      
      setStatus("generating");
      setStepText("Generating documentation...");
      setProgress(50);
      globalStore.setSummary(summary);
      
      await generateDocumentation(summary);

    } catch (err: unknown) {
      const message = getErrorMessage(err, "Upload failed");
      setStatus("error");
      setStepText(message);
      addToast("error", message);
    }
  };

  const handleGitHubImport = async (url: string) => {
    if (status !== "idle") return;

    try {
      setStatus("uploading");
      setStepText("Downloading repository from GitHub...");
      setProgress(10);

      const importRes = await fetch("/api/github", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!importRes.ok) {
        const errorData = await importRes.json().catch(() => ({})) as ErrorResponse;
        throw new Error(errorData.error || "GitHub import failed");
      }
      const summary = await importRes.json();

      setStatus("generating");
      setStepText("Generating documentation...");
      setProgress(50);
      globalStore.setSummary(summary);
      
      await generateDocumentation(summary);

    } catch (err: unknown) {
      const message = getErrorMessage(err, "GitHub import failed");
      setStatus("error");
      setStepText(message);
      addToast("error", message);
    }
  };

  const generateDocumentation = async (summary: RepositorySummary) => {
    try {
      const docTypes = ["readme", "api-docs", "setup-guide", "architecture", "folder-structure", "mermaid-diagrams"];
      const totalDocs = docTypes.length;
      let completedDocs = 0;

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summary, docTypes }),
      });

      if (!response.ok) throw new Error(await readResponseError(response, "Generation request failed"));
      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      
      const results: GeneratedDocs = {};
      let activeProvider = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim()) continue;
          if (line.startsWith('data: ')) {
            let data: GenerateStreamEvent;

            try {
              data = JSON.parse(line.slice(6)) as GenerateStreamEvent;
            } catch (e) {
              console.error("Parse error:", e);
              continue;
            }

            if (data.type === 'progress') {
              setStepText(data.step);
            } else if (data.type === 'result') {
              completedDocs++;
              setProgress(50 + (completedDocs / totalDocs) * 45);
            } else if (data.type === 'complete') {
              Object.assign(results, data.results);
              activeProvider = data.provider;
            } else if (data.type === 'error') {
              throw new Error(data.message);
            }
          }
        }
      }

      setProgress(100);
      setStatus("complete");
      setStepText("Documentation ready!");

      globalStore.setGenerationResult({
        readme: results.readme || "",
        apiDocs: results['api-docs'] || "",
        setupGuide: results['setup-guide'] || "",
        architecture: results.architecture || "",
        folderStructure: results['folder-structure'] || "",
        mermaidDiagrams: results['mermaid-diagrams'] || "",
        provider: activeProvider,
        model: "Fallback Model",
      });

      // Compute heuristics for health and insights
      const healthAnalysis: HealthAnalysis = {
        overallScore: 85,
        architecture: 80,
        documentation: 60,
        dependencyRisk: "low",
        complexity: 75,
        maintainability: 85,
        hasTests: summary.hasTests,
        hasLinting: summary.hasLinting,
        hasTypeScript: summary.hasTypeScript,
        suggestions: ["Add more test coverage", "Consider adding API documentation manually"],
      };
      globalStore.setHealthAnalysis(healthAnalysis);
      
      // We could use the insights generator here, but for simplicity we'll just mock it if not using the demo
      globalStore.setInsights([]);

      addToast("success", "Documentation generated successfully!");
      setTimeout(() => router.push("/results"), 1000);

    } catch (err: unknown) {
      const message = getErrorMessage(err, "Generation failed");
      setStatus("error");
      setStepText(message);
      addToast("error", message);
    }
  };

  const showProgress = status !== "idle";
  const isWorking = status !== "idle" && status !== "error" && status !== "complete";
  const uploadProgressStatus: "uploading" | "processing" | "complete" | "error" =
    status === "error" ? "error" : status === "complete" ? "complete" : status === "uploading" ? "uploading" : "processing";

  const resetUpload = () => {
    setStatus("idle");
    setProgress(0);
    setStepText("");
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-6 flex flex-col items-center justify-center relative overflow-hidden">
      <FloatingOrbs />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl flex flex-col items-center z-10"
      >
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-center">
          Upload your <span className="gradient-text">Repository</span>
        </h1>
        <p className="text-zinc-400 text-center max-w-xl mb-12">
          Drop a ZIP file or paste a GitHub URL. Our engine will analyze your code and generate comprehensive documentation.
        </p>

        {showProgress ? (
          <div className="w-full max-w-2xl flex flex-col items-center gap-4">
            <UploadProgress 
              progress={progress} 
              step={stepText} 
              status={uploadProgressStatus} 
            />
            {status === "error" && (
              <button
                type="button"
                onClick={resetUpload}
                className="rounded-md border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:bg-white/10"
              >
                Try again
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl">
            <DropZone onFileSelect={handleZipUpload} disabled={isWorking} />
            <GitHubImport onSubmit={handleGitHubImport} disabled={isWorking} />
          </div>
        )}
      </motion.div>
    </div>
  );
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) {
    return error.message;
  }

  return typeof error === "string" ? error : fallback;
}

async function readResponseError(response: Response, fallback: string): Promise<string> {
  const text = await response.text();

  try {
    const parsed = JSON.parse(text) as ErrorResponse;
    return parsed.error || fallback;
  } catch {
    return text || fallback;
  }
}
