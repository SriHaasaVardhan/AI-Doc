"use client";

import { motion } from "framer-motion";
import { InsightItem } from "@/lib/demo-data";
import { GlassCard } from "../ui/GlassCard";

interface InsightsPanelProps {
  insights: InsightItem[];
}

export function InsightsPanel({ insights }: InsightsPanelProps) {
  if (!insights || insights.length === 0) {
    return (
      <GlassCard className="p-8 text-center text-zinc-500">
        No insights generated for this repository.
      </GlassCard>
    );
  }

  const getIcon = (category: string) => {
    switch (category) {
      case 'architecture': return '🏗️';
      case 'scalability': return '📈';
      case 'maintainability': return '🛠️';
      case 'security': return '🔒';
      case 'performance': return '⚡';
      case 'documentation': return '📄';
      case 'dependencies': return '📦';
      case 'deployment': return '🚀';
      default: return '💡';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'success': return 'bg-green-500/10 border-green-500/30 text-green-400';
      case 'warning': return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400';
      case 'critical': return 'bg-red-500/10 border-red-500/30 text-red-400';
      case 'info':
      default: return 'bg-blue-500/10 border-blue-500/30 text-blue-400';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {insights.map((insight, i) => (
        <motion.div
          key={insight.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <GlassCard hover className="h-full p-6 flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{getIcon(insight.category)}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${getSeverityColor(insight.severity)}`}>
                  {insight.severity.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-zinc-500">Confidence</span>
                <div className="w-10 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${insight.confidence > 90 ? 'bg-green-500' : insight.confidence > 70 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                    style={{ width: `${insight.confidence}%` }}
                  />
                </div>
              </div>
            </div>
            
            <h3 className="text-lg font-semibold text-zinc-100 mb-2">{insight.title}</h3>
            <p className="text-sm text-zinc-400 leading-relaxed flex-grow">{insight.description}</p>
          </GlassCard>
        </motion.div>
      ))}
    </div>
  );
}
