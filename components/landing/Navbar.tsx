"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { GradientText } from "../ui/GradientText";
import { AnimatedButton } from "../ui/AnimatedButton";

export function Navbar() {
  const { scrollY } = useScroll();
  const background = useTransform(
    scrollY,
    [0, 50],
    ["rgba(8, 9, 13, 0)", "rgba(8, 9, 13, 0.8)"]
  );
  const backdropFilter = useTransform(
    scrollY,
    [0, 50],
    ["blur(0px)", "blur(12px)"]
  );
  const borderBottom = useTransform(
    scrollY,
    [0, 50],
    ["1px solid rgba(255,255,255,0)", "1px solid rgba(255,255,255,0.05)"]
  );

  return (
    <motion.nav
      style={{ background, backdropFilter, borderBottom }}
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight">
            <GradientText>DocuGen</GradientText>
          </span>
          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">
            AI
          </span>
        </Link>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
          <a href="#features" className="hover:text-zinc-100 transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-zinc-100 transition-colors">How it Works</a>
        </div>

        <AnimatedButton href="/generate" size="sm" variant="secondary">
          Get Started
        </AnimatedButton>
      </div>
    </motion.nav>
  );
}
