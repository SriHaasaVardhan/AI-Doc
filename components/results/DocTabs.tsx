"use client";

import { motion } from "framer-motion";

interface DocTabsProps {
  activeTab: string;
  onChange: (tabId: string) => void;
  availableDocs: string[];
}

const TABS = [
  { id: "readme", label: "README", icon: "📄" },
  { id: "api-docs", label: "API Docs", icon: "🔌" },
  { id: "setup-guide", label: "Setup Guide", icon: "🚀" },
  { id: "architecture", label: "Architecture", icon: "🏗️" },
  { id: "folder-structure", label: "File Structure", icon: "📁" },
  { id: "mermaid-diagrams", label: "Diagrams", icon: "📊" },
  { id: "health", label: "Health Report", icon: "🏥" },
  { id: "insights", label: "AI Insights", icon: "💡" },
  { id: "chat", label: "Ask AI", icon: "💬" }
];

export function DocTabs({ activeTab, onChange, availableDocs }: DocTabsProps) {
  // Always include health, insights, and chat
  const visibleTabs = TABS.filter(t => 
    ['health', 'insights', 'chat'].includes(t.id) || availableDocs.includes(t.id)
  );

  return (
    <div className="flex overflow-x-auto custom-scrollbar border-b border-white/10 mb-6 pb-px">
      {visibleTabs.map((tab) => {
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative whitespace-nowrap ${
              isActive ? "text-blue-400" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
            
            {isActive && (
              <motion.div
                layoutId="activeTabIndicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
                initial={false}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
