"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ReactNode } from "react";
import { LoadingSpinner } from "./LoadingSpinner";

interface AnimatedButtonProps {
  children: ReactNode;
  onClick?: () => void;
  href?: string;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  disabled?: boolean;
  loading?: boolean;
}

export function AnimatedButton({
  children,
  onClick,
  href,
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
  loading = false,
}: AnimatedButtonProps) {
  const baseStyles = "relative inline-flex items-center justify-center font-medium transition-colors rounded-xl overflow-hidden";
  
  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-5 py-2.5 text-base",
    lg: "px-8 py-4 text-lg font-semibold",
  };

  const variantStyles = {
    primary: "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] border border-white/10",
    secondary: "glass text-zinc-200 hover:text-white hover:bg-white/10",
    ghost: "bg-transparent text-zinc-400 hover:text-white hover:bg-white/5",
  };

  const content = (
    <>
      <span className={`relative z-10 flex items-center gap-2 ${loading ? "opacity-0" : "opacity-100"}`}>
        {children}
      </span>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <LoadingSpinner size="sm" />
        </div>
      )}
      {variant === 'primary' && (
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-cyan-500 to-blue-500 opacity-0 hover:opacity-100 transition-opacity duration-300" />
      )}
    </>
  );

  const buttonClasses = `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''} ${className}`;

  if (href) {
    return (
      <Link href={href} className={buttonClasses} onClick={disabled || loading ? (e) => e.preventDefault() : undefined}>
        <motion.div whileHover={disabled ? {} : { scale: 1.02 }} whileTap={disabled ? {} : { scale: 0.98 }} className="w-full h-full flex items-center justify-center">
          {content}
        </motion.div>
      </Link>
    );
  }

  return (
    <motion.button
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      onClick={onClick}
      disabled={disabled || loading}
      className={buttonClasses}
    >
      {content}
    </motion.button>
  );
}
