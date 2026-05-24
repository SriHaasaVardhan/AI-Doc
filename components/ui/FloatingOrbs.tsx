"use client";

import { motion } from "framer-motion";

export function FloatingOrbs() {
  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
      <motion.div
        animate={{
          y: [0, -50, 0],
          x: [0, 30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[20%] left-[20%] w-96 h-96 bg-blue-500/10 rounded-full blur-[100px]"
      />
      <motion.div
        animate={{
          y: [0, 40, 0],
          x: [0, -40, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-[20%] right-[20%] w-[30rem] h-[30rem] bg-purple-500/10 rounded-full blur-[120px]"
      />
      <motion.div
        animate={{
          y: [0, -30, 0],
          x: [0, -20, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 5 }}
        className="absolute top-[40%] left-[60%] w-80 h-80 bg-cyan-500/10 rounded-full blur-[100px]"
      />
    </div>
  );
}
