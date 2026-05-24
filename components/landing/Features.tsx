"use client";

import { motion } from "framer-motion";
import { GradientText } from "../ui/GradientText";
import { GlassCard } from "../ui/GlassCard";

const features = [
  {
    icon: "📄",
    title: "README Generation",
    description: "Auto-generate comprehensive README files with project descriptions, tech stack, and badges.",
  },
  {
    icon: "🔌",
    title: "API Documentation",
    description: "Automatically extract and document all API routes, parameters, and response formats.",
  },
  {
    icon: "🚀",
    title: "Setup Guides",
    description: "Create step-by-step installation instructions by analyzing your dependencies and scripts.",
  },
  {
    icon: "🏗️",
    title: "Architecture Summary",
    description: "Get visual architecture breakdowns with auto-generated Mermaid diagrams.",
  },
  {
    icon: "🔍",
    title: "Code Health Analysis",
    description: "Automated codebase quality scoring based on architecture, complexity, and maintainability.",
  },
  {
    icon: "🌐",
    title: "GitHub Import",
    description: "No need to download ZIPs. Import directly from public GitHub URLs with one click.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 relative z-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold tracking-tight mb-4"
          >
            Everything You <GradientText variant="warm">Need</GradientText>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-zinc-400 text-lg max-w-2xl mx-auto"
          >
            A complete suite of tools to understand, document, and share your codebase in seconds.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <GlassCard hover className="p-8 h-full">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-zinc-100 mb-2">{feature.title}</h3>
                <p className="text-zinc-400 leading-relaxed">{feature.description}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
