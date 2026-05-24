"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  glow?: "blue" | "purple" | "cyan" | "none";
  hover?: boolean;
  strong?: boolean;
}

export function GlassCard({ children, className = "", glow = "none", hover = false, strong = false }: GlassCardProps) {
  const baseClass = strong ? "glass-strong" : "glass";
  const glowClass = glow !== "none" ? `glow-${glow}` : "";
  
  return (
    <motion.div
      whileHover={hover ? { scale: 1.02, filter: "brightness(1.1)" } : undefined}
      transition={{ duration: 0.2 }}
      className={`${baseClass} ${glowClass} ${className} relative overflow-hidden`}
    >
      {hover && (
        <div className="absolute inset-0 border-gradient opacity-0 hover:opacity-100 transition-opacity duration-300" />
      )}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
