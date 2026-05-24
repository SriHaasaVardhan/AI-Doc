"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface GradientTextProps {
  children: ReactNode;
  className?: string;
  variant?: "cool" | "warm";
}

export function GradientText({ children, className = "", variant = "cool" }: GradientTextProps) {
  const textClass = variant === "warm" ? "gradient-text-warm" : "gradient-text";

  return (
    <motion.span
      initial={{ opacity: 0.8, filter: "brightness(1)" }}
      animate={{ opacity: 1, filter: "brightness(1.2)" }}
      transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
      className={`${textClass} ${className}`}
    >
      {children}
    </motion.span>
  );
}
