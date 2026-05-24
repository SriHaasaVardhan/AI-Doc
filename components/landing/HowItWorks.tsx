"use client";

import { motion } from "framer-motion";
import { GradientText } from "../ui/GradientText";
import { GlassCard } from "../ui/GlassCard";

const steps = [
  {
    number: "01",
    title: "Upload",
    description: "Drop your ZIP file or paste a GitHub URL. We support JS, TS, Python, Java, and Dart.",
  },
  {
    number: "02",
    title: "Parse",
    description: "Our engine analyzes your code structure, extracting functions, classes, and dependencies safely.",
  },
  {
    number: "03",
    title: "Generate",
    description: "Optimized prompts are sent to free AI models (OpenRouter/Groq) to generate accurate docs.",
  },
  {
    number: "04",
    title: "Download",
    description: "Preview the generated markdown files, copy to clipboard, or download them all as a ZIP.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 relative z-10 bg-black/20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold tracking-tight mb-4"
          >
            How It <GradientText>Works</GradientText>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-zinc-400 text-lg max-w-2xl mx-auto"
          >
            A simple, secure pipeline that turns raw code into beautiful documentation.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {/* Connecting line for desktop */}
          <div className="hidden lg:block absolute top-[4.5rem] left-[12%] right-[12%] h-[2px] bg-gradient-to-r from-blue-500/0 via-blue-500/20 to-blue-500/0" />

          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="relative"
            >
              <GlassCard className="p-8 h-full text-center relative z-10">
                <div className="w-16 h-16 mx-auto bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center text-2xl font-bold text-blue-400 mb-6 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold text-zinc-100 mb-3">{step.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{step.description}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
