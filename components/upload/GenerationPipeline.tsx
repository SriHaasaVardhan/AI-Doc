"use client";

import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface GenerationPipelineProps {
  currentStep: number; // 0-8
  logs: string[];
  status: "running" | "complete" | "error";
}

const PIPELINE_STEPS = [
  { icon: "📦", label: "Extracting ZIP", detail: "Unpacking repository contents" },
  { icon: "🔍", label: "Filtering files", detail: "Removing noise & binary files" },
  { icon: "🔬", label: "Parsing repository", detail: "Analyzing project structure" },
  { icon: "⚡", label: "Extracting functions/classes/routes", detail: "Deep code analysis" },
  { icon: "📊", label: "Building repository summary", detail: "Aggregating metadata" },
  { icon: "🤖", label: "Sending optimized AI request", detail: "Preparing context window" },
  { icon: "📝", label: "Generating README", detail: "Crafting documentation" },
  { icon: "📡", label: "Generating API docs", detail: "Mapping endpoints & schemas" },
  { icon: "✅", label: "Finalizing documentation", detail: "Post-processing & formatting" },
];

function StepIcon({
  step,
  currentStep,
  status,
}: {
  step: number;
  currentStep: number;
  status: string;
}) {
  const isComplete = step < currentStep || (step === currentStep && status === "complete" && step === 8);
  const isActive = step === currentStep && status === "running";
  const isError = step === currentStep && status === "error";

  if (isComplete) {
    return (
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="w-10 h-10 rounded-xl bg-green-500/20 border border-green-500/30 flex items-center justify-center"
      >
        <svg
          className="w-5 h-5 text-green-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </motion.div>
    );
  }

  if (isError) {
    return (
      <motion.div
        animate={{ rotate: [0, -5, 5, -5, 0] }}
        transition={{ duration: 0.5, repeat: 2 }}
        className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center"
      >
        <svg
          className="w-5 h-5 text-red-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </motion.div>
    );
  }

  if (isActive) {
    return (
      <motion.div
        className="relative w-10 h-10 rounded-xl bg-accent-blue/20 border border-accent-blue/40 flex items-center justify-center"
        animate={{ boxShadow: ["0 0 0px rgba(59,130,246,0)", "0 0 20px rgba(59,130,246,0.4)", "0 0 0px rgba(59,130,246,0)"] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {/* Spinner ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-xl border-2 border-transparent border-t-accent-blue"
        />
        <span className="text-lg">{PIPELINE_STEPS[step].icon}</span>
      </motion.div>
    );
  }

  // Pending
  return (
    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center opacity-40">
      <span className="text-lg grayscale">{PIPELINE_STEPS[step].icon}</span>
    </div>
  );
}

export default function GenerationPipeline({
  currentStep,
  logs,
  status,
}: GenerationPipelineProps) {
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const progressPercent =
    status === "complete"
      ? 100
      : status === "error"
      ? (currentStep / (PIPELINE_STEPS.length - 1)) * 100
      : (currentStep / (PIPELINE_STEPS.length - 1)) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="glass-strong rounded-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            animate={
              status === "running"
                ? {
                    boxShadow: [
                      "0 0 0px rgba(59,130,246,0)",
                      "0 0 15px rgba(59,130,246,0.5)",
                      "0 0 0px rgba(59,130,246,0)",
                    ],
                  }
                : {}
            }
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-3 h-3 rounded-full bg-accent-blue"
          />
          <h3 className="text-lg font-semibold gradient-text">
            AI Generation Pipeline
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-zinc-400">
            Step {Math.min(currentStep + 1, PIPELINE_STEPS.length)}/{PIPELINE_STEPS.length}
          </span>
          {status === "complete" && (
            <motion.span
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs font-medium"
            >
              Complete
            </motion.span>
          )}
          {status === "error" && (
            <motion.span
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs font-medium"
            >
              Error
            </motion.span>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Pipeline Steps */}
        <div className="p-6 lg:w-1/2 lg:border-r border-white/5">
          <div className="relative">
            {/* Vertical connecting line */}
            <div className="absolute left-5 top-5 bottom-5 w-px bg-white/10">
              <motion.div
                className="absolute top-0 left-0 w-full bg-gradient-to-b from-accent-blue via-accent-purple to-accent-cyan"
                initial={{ height: "0%" }}
                animate={{ height: `${progressPercent}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>

            {/* Steps */}
            <div className="space-y-1">
              {PIPELINE_STEPS.map((step, i) => {
                const isComplete = i < currentStep || (status === "complete" && i <= currentStep);
                const isActive = i === currentStep && status === "running";

                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06, duration: 0.4 }}
                    className={`relative flex items-center gap-4 p-2 rounded-xl transition-all duration-300 ${
                      isActive
                        ? "bg-accent-blue/5"
                        : isComplete
                        ? "bg-green-500/3"
                        : ""
                    }`}
                  >
                    <StepIcon step={i} currentStep={currentStep} status={status} />
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium truncate transition-colors ${
                          isActive
                            ? "text-accent-blue"
                            : isComplete
                            ? "text-green-400"
                            : "text-zinc-500"
                        }`}
                      >
                        {step.label}
                      </p>
                      <AnimatePresence>
                        {isActive && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="text-xs text-zinc-400 mt-0.5"
                          >
                            {step.detail}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="text-xs font-mono text-accent-blue"
                      >
                        ...
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Terminal Log Output */}
        <div className="lg:w-1/2 flex flex-col">
          <div className="px-4 py-2 border-b border-white/5 flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <div className="w-3 h-3 rounded-full bg-green-500/60" />
            </div>
            <span className="text-xs font-mono text-zinc-500 ml-2">
              pipeline.log
            </span>
          </div>
          <div
            ref={logContainerRef}
            className="flex-1 p-4 overflow-y-auto max-h-[340px] min-h-[340px] bg-black/30 font-mono text-xs"
          >
            <AnimatePresence initial={false}>
              {logs.map((log, i) => (
                <motion.div
                  key={`${i}-${log}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex gap-2 leading-6"
                >
                  <span className="text-zinc-600 select-none shrink-0">
                    {String(i + 1).padStart(3, " ")}
                  </span>
                  <span
                    className={
                      log.startsWith("[ERROR]")
                        ? "text-red-400"
                        : log.startsWith("[DONE]") || log.startsWith("[SUCCESS]")
                        ? "text-green-400"
                        : log.startsWith("[INFO]")
                        ? "text-accent-blue"
                        : log.startsWith("[WARN]")
                        ? "text-yellow-400"
                        : "text-zinc-400"
                    }
                  >
                    {log}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
            {status === "running" && (
              <motion.span
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="inline-block w-2 h-4 bg-accent-blue ml-8 mt-1"
              />
            )}
          </div>
        </div>
      </div>

      {/* Bottom progress bar */}
      <div className="h-1 bg-white/5">
        <motion.div
          className="h-full bg-gradient-to-r from-accent-blue via-accent-purple to-accent-cyan"
          initial={{ width: "0%" }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </motion.div>
  );
}
