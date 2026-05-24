"use client";

import { motion } from "framer-motion";
import { GradientText } from "../ui/GradientText";
import { AnimatedButton } from "../ui/AnimatedButton";
import { GlassCard } from "../ui/GlassCard";
import { FloatingOrbs } from "../ui/FloatingOrbs";

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden flex items-center justify-center min-h-[90vh]">
      <FloatingOrbs />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10 w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-6"
        >
          <div className="px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-sm font-medium text-zinc-300 flex items-center gap-2">
            <span className="text-blue-400">✨</span> Powered by Free AI Models
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-tight"
        >
          Instant Technical <br />
          <GradientText>Documentation</GradientText>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Upload your repository or paste a GitHub URL. Get AI-generated READMEs, API docs, setup guides, and architecture summaries in seconds.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <AnimatedButton href="/generate" size="lg" variant="primary">
            Upload Repository
          </AnimatedButton>
          <AnimatedButton href="/generate?demo=true" size="lg" variant="ghost">
            View Demo
          </AnimatedButton>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-20 max-w-4xl mx-auto"
        >
          <GlassCard glow="blue" className="p-1 rounded-2xl">
            <div className="bg-black/40 rounded-xl overflow-hidden border border-white/5">
              <div className="flex items-center px-4 py-3 bg-white/5 border-b border-white/5 gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="ml-4 text-xs font-mono text-zinc-500">README.md</div>
              </div>
              <div className="p-6 text-left font-mono text-sm overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80 z-10 pointer-events-none" />
                <div className="text-blue-400 mb-2"># Acme SaaS Platform</div>
                <div className="text-zinc-400 mb-4">A modern, full-stack SaaS platform built with Next.js 15 App Router.</div>
                <div className="text-purple-400 mb-2">## ✨ Features</div>
                <ul className="text-zinc-400 space-y-1 mb-4">
                  <li>- Authentication — Secure login/register with NextAuth v5</li>
                  <li>- Project Management — Create, update, and delete projects</li>
                  <li>- Billing & Subscriptions — Stripe integration with checkout</li>
                </ul>
                <div className="text-cyan-400 mb-2">## 🛠 Tech Stack</div>
                <div className="text-zinc-400">Next.js 15, TypeScript 5.7, Prisma 6.0, Tailwind CSS...</div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </section>
  );
}
