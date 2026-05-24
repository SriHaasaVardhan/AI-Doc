"use client";

import { motion } from "framer-motion";
import { HealthAnalysis } from "@/lib/demo-data";
import { GlassCard } from "../ui/GlassCard";

interface HealthDashboardProps {
  health: HealthAnalysis;
}

export function HealthDashboard({ health }: HealthDashboardProps) {
  if (!health) return null;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400 bg-green-500/10 border-green-500/20";
    if (score >= 60) return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
    return "text-red-400 bg-red-500/10 border-red-500/20";
  };

  const getMetricColor = (score: number, inverse = false) => {
    const isGood = inverse ? score <= 40 : score >= 80;
    const isOk = inverse ? score <= 70 : score >= 60;
    
    if (isGood) return "bg-green-500";
    if (isOk) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Overall Score */}
        <GlassCard className="p-6 md:col-span-1 flex flex-col items-center justify-center text-center">
          <h3 className="text-sm text-zinc-400 mb-4">Overall Score</h3>
          <div className={`text-5xl font-bold rounded-full w-32 h-32 flex items-center justify-center border-4 ${getScoreColor(health.overallScore)}`}>
            {Math.round(health.overallScore)}
          </div>
        </GlassCard>

        {/* Detailed Metrics */}
        <GlassCard className="p-6 md:col-span-3">
          <h3 className="text-sm text-zinc-400 mb-6">Core Metrics</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <MetricBar label="Architecture" score={health.architecture} color={getMetricColor(health.architecture)} />
            <MetricBar label="Maintainability" score={health.maintainability} color={getMetricColor(health.maintainability)} />
            <MetricBar label="Documentation" score={health.documentation} color={getMetricColor(health.documentation)} />
            <MetricBar label="Complexity" score={health.complexity} color={getMetricColor(health.complexity, true)} inverse />
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Technical Features */}
        <GlassCard className="p-6">
          <h3 className="text-sm text-zinc-400 mb-4">Technical Foundation</h3>
          <div className="space-y-3">
            <FeatureRow label="Type Safety (TypeScript)" active={health.hasTypeScript} />
            <FeatureRow label="Automated Tests" active={health.hasTests} />
            <FeatureRow label="Code Linting" active={health.hasLinting} />
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
              <span className="text-sm text-zinc-300">Dependency Risk</span>
              <span className={`text-xs px-2 py-1 rounded-full uppercase font-bold ${
                health.dependencyRisk === 'low' ? 'bg-green-500/20 text-green-400' :
                health.dependencyRisk === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              }`}>{health.dependencyRisk}</span>
            </div>
          </div>
        </GlassCard>

        {/* Actionable Suggestions */}
        <GlassCard className="p-6">
          <h3 className="text-sm text-zinc-400 mb-4">Actionable Suggestions</h3>
          <ul className="space-y-3">
            {health.suggestions.map((suggestion, i) => (
              <motion.li 
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-3 text-sm text-zinc-300 items-start bg-white/5 p-3 rounded-lg"
              >
                <span className="text-blue-400 shrink-0">💡</span>
                <span>{suggestion}</span>
              </motion.li>
            ))}
          </ul>
        </GlassCard>
      </div>
    </div>
  );
}

function MetricBar({ label, score, color, inverse = false }: { label: string, score: number, color: string, inverse?: boolean }) {
  return (
    <div>
      <div className="flex justify-between items-end mb-2">
        <span className="text-sm text-zinc-300">{label}</span>
        <span className="text-xs font-mono text-zinc-500">{Math.round(score)}/100</span>
      </div>
      <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-full ${color}`}
        />
      </div>
    </div>
  );
}

function FeatureRow({ label, active }: { label: string, active: boolean }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
      <span className="text-sm text-zinc-300">{label}</span>
      {active ? (
        <span className="flex items-center gap-1 text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          Present
        </span>
      ) : (
        <span className="flex items-center gap-1 text-xs text-red-400 bg-red-500/10 px-2 py-1 rounded">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          Missing
        </span>
      )}
    </div>
  );
}
