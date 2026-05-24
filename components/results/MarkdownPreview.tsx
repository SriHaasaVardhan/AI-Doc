"use client";

import ReactMarkdown from "react-markdown";
import { GlassCard } from "../ui/GlassCard";

interface MarkdownPreviewProps {
  content: string;
}

export function MarkdownPreview({ content }: MarkdownPreviewProps) {
  if (!content) {
    return (
      <div className="h-64 flex items-center justify-center text-zinc-500">
        No content available.
      </div>
    );
  }

  return (
    <GlassCard className="p-8 prose prose-invert max-w-none prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10 prose-headings:text-zinc-100 prose-a:text-blue-400">
      <ReactMarkdown>{content}</ReactMarkdown>
    </GlassCard>
  );
}
