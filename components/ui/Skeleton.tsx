"use client";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "card" | "circle";
}

export function Skeleton({ className = "", variant = "text" }: SkeletonProps) {
  const baseClass = "relative overflow-hidden bg-zinc-800/50 rounded-md";
  
  const variantClass = {
    text: "h-4 w-full",
    card: "h-32 w-full rounded-xl",
    circle: "h-12 w-12 rounded-full",
  };

  return (
    <div className={`${baseClass} ${variantClass[variant]} ${className}`}>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-zinc-700/50 to-transparent" />
    </div>
  );
}
