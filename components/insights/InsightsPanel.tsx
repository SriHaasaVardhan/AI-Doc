"use client";

import { motion, AnimatePresence } from "framer-motion";
import InsightCard from "@/components/insights/InsightCard";
import type { InsightItem } from "@/components/insights/InsightCard";

export type { InsightItem };

interface InsightsPanelProps {
  insights: InsightItem[];
  loading?: boolean;
}

// ---------------------------------------------------------------------------
// Skeleton card for loading state
// ---------------------------------------------------------------------------
function SkeletonCard({ index }: { index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.06 }}
      className="glass border-l-4 border-l-zinc-700 p-5 space-y-3"
    >
      <div className="h-4 w-20 rounded-full bg-white/5 animate-pulse" />
      <div className="h-4 w-3/4 rounded bg-white/5 animate-pulse" />
      <div className="space-y-1.5">
        <div className="h-3 w-full rounded bg-white/5 animate-pulse" />
        <div className="h-3 w-5/6 rounded bg-white/5 animate-pulse" />
      </div>
      <div className="pt-1 space-y-1">
        <div className="flex items-center justify-between">
          <div className="h-2.5 w-16 rounded bg-white/5 animate-pulse" />
          <div className="h-2.5 w-8 rounded bg-white/5 animate-pulse" />
        </div>
        <div className="h-1.5 rounded-full bg-white/5" />
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Panel
// ---------------------------------------------------------------------------
export default function InsightsPanel({ insights, loading }: InsightsPanelProps) {
  return (
    <section className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <motion.span
          animate={{ rotate: [0, 15, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}
          className="text-2xl"
        >
          ✨
        </motion.span>
        <h2 className="text-xl font-bold gradient-text">Repository Insights</h2>
      </div>

      <AnimatePresence mode="wait">
        {/* Loading */}
        {loading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} index={i} />
            ))}
          </motion.div>
        )}

        {/* Empty state */}
        {!loading && insights.length === 0 && (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="glass py-16 flex flex-col items-center gap-3 text-center"
          >
            <span className="text-4xl">🔍</span>
            <p className="text-zinc-400 text-sm">No insights generated yet.</p>
            <p className="text-zinc-500 text-xs max-w-md">
              Upload a repository to receive AI-powered analysis of its architecture,
              maintainability, dependencies, and more.
            </p>
          </motion.div>
        )}

        {/* Insights grid */}
        {!loading && insights.length > 0 && (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {insights.map((insight, i) => (
              <InsightCard key={insight.id} insight={insight} index={i} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
