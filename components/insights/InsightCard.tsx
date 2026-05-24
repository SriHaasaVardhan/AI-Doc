"use client";

import { motion } from "framer-motion";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface InsightItem {
  id: string;
  category:
    | "architecture"
    | "scalability"
    | "maintainability"
    | "security"
    | "performance"
    | "documentation"
    | "dependencies"
    | "deployment";
  title: string;
  description: string;
  severity: "info" | "warning" | "critical" | "success";
  confidence: number; // 0-100
}

interface InsightCardProps {
  insight: InsightItem;
  index: number;
}

// ---------------------------------------------------------------------------
// Maps
// ---------------------------------------------------------------------------
const categoryIcons: Record<InsightItem["category"], string> = {
  architecture: "🏗️",
  scalability: "📈",
  maintainability: "🔧",
  security: "🔒",
  performance: "⚡",
  documentation: "📝",
  dependencies: "📦",
  deployment: "🚀",
};

const severityColors: Record<
  InsightItem["severity"],
  { border: string; badge: string; badgeText: string; glow: string; bar: string }
> = {
  success: {
    border: "border-l-emerald-500",
    badge: "bg-emerald-500/15 text-emerald-400",
    badgeText: "Success",
    glow: "group-hover:shadow-[0_0_24px_rgba(16,185,129,0.12)]",
    bar: "from-emerald-500 to-emerald-400",
  },
  info: {
    border: "border-l-blue-500",
    badge: "bg-blue-500/15 text-blue-400",
    badgeText: "Info",
    glow: "group-hover:shadow-[0_0_24px_rgba(59,130,246,0.12)]",
    bar: "from-blue-500 to-blue-400",
  },
  warning: {
    border: "border-l-amber-500",
    badge: "bg-amber-500/15 text-amber-400",
    badgeText: "Warning",
    glow: "group-hover:shadow-[0_0_24px_rgba(245,158,11,0.12)]",
    bar: "from-amber-500 to-amber-400",
  },
  critical: {
    border: "border-l-red-500",
    badge: "bg-red-500/15 text-red-400",
    badgeText: "Critical",
    glow: "group-hover:shadow-[0_0_24px_rgba(239,68,68,0.12)]",
    bar: "from-red-500 to-red-400",
  },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function InsightCard({ insight, index }: InsightCardProps) {
  const sev = severityColors[insight.severity];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`group relative glass border-l-4 ${sev.border} ${sev.glow} transition-all duration-300 hover:-translate-y-0.5`}
    >
      {/* Severity badge — top-right */}
      <span
        className={`absolute top-3 right-3 text-[10px] font-semibold uppercase tracking-wider rounded-full px-2 py-0.5 ${sev.badge}`}
      >
        {sev.badgeText}
      </span>

      <div className="p-5 space-y-3">
        {/* Category pill */}
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 bg-white/5 rounded-full px-2.5 py-1">
          <span>{categoryIcons[insight.category]}</span>
          <span className="capitalize">{insight.category}</span>
        </span>

        {/* Title */}
        <h4 className="text-sm font-semibold text-zinc-100 leading-snug pr-16">
          {insight.title}
        </h4>

        {/* Description */}
        <p className="text-xs leading-relaxed text-zinc-400">
          {insight.description}
        </p>

        {/* Confidence bar */}
        <div className="pt-1">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
              Confidence
            </span>
            <span className="text-[10px] font-semibold text-zinc-300">
              {insight.confidence}%
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${insight.confidence}%` }}
              transition={{ duration: 0.8, delay: index * 0.07 + 0.3, ease: "easeOut" }}
              className={`h-full rounded-full bg-gradient-to-r ${sev.bar}`}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
