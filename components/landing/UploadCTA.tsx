"use client";

import { motion } from "framer-motion";
import { GlassCard } from "../ui/GlassCard";
import { AnimatedButton } from "../ui/AnimatedButton";

export function UploadCTA() {
  return (
    <section className="py-32 relative z-10">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <GlassCard glow="purple" strong className="p-12 text-center rounded-3xl relative overflow-hidden">
            {/* Background glow effects inside card */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" />
            
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4">
                Ready to Document Your Code?
              </h2>
              <p className="text-lg text-zinc-400 mb-8 max-w-xl mx-auto">
                Get started in seconds. No sign-up required. Completely free during the hackathon.
              </p>
              
              <div className="flex flex-col items-center gap-4">
                <AnimatedButton href="/generate" size="lg" variant="primary" className="px-10">
                  Start Generating Now
                </AnimatedButton>
                <p className="text-sm text-zinc-500">
                  Supports ZIP files (≤50MB) and public GitHub URLs
                </p>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </section>
  );
}
