"use client";

import { useState } from "react";
import { GlassCard } from "../ui/GlassCard";
import { AnimatedButton } from "../ui/AnimatedButton";
import { isValidGitHubUrl } from "@/lib/utils/github-utils";

interface GitHubImportProps {
  onSubmit: (url: string) => void;
  disabled?: boolean;
  loading?: boolean;
}

export function GitHubImport({ onSubmit, disabled = false, loading = false }: GitHubImportProps) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!url.trim()) {
      setError("Please enter a GitHub URL");
      return;
    }

    if (!isValidGitHubUrl(url)) {
      setError("Please enter a valid public GitHub repository URL (e.g., https://github.com/facebook/react)");
      return;
    }

    onSubmit(url);
  };

  return (
    <GlassCard className="w-full h-full">
      <div className="p-8 h-full flex flex-col justify-center">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-xl">
            <svg height="24" width="24" viewBox="0 0 16 16" fill="white">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">Import from GitHub</h3>
            <p className="text-sm text-zinc-400">Public repositories only</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <input
              type="text"
              value={url}
              onChange={(e) => { setUrl(e.target.value); setError(""); }}
              disabled={disabled || loading}
              placeholder="https://github.com/owner/repo"
              className={`w-full px-4 py-3 bg-black/40 border rounded-xl outline-none text-white transition-colors ${
                error ? "border-red-500 focus:border-red-500" : "border-white/10 focus:border-blue-500"
              }`}
            />
            {error && <p className="text-sm text-red-400 mt-2">{error}</p>}
          </div>

          <AnimatedButton 
            variant="primary" 
            size="md" 
            disabled={disabled || loading}
            loading={loading}
            className="w-full mt-2"
          >
            Import Repository
          </AnimatedButton>
        </form>
      </div>
    </GlassCard>
  );
}
