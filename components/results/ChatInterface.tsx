"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "../ui/GlassCard";
import ReactMarkdown from "react-markdown";
import type { RepositorySummary } from "@/lib/parsers/types";
import type { ChatDocContext } from "@/lib/chat/repository-context";
import {
  getSuggestedQuestions,
  buildWelcomeMessage,
} from "@/lib/chat/suggested-questions";

interface Message {
  role: "user" | "assistant";
  content: string;
  fallback?: boolean;
}

interface ChatInterfaceProps {
  summaryData: RepositorySummary;
  generatedDocs?: ChatDocContext;
}

export function ChatInterface({ summaryData, generatedDocs }: ChatInterfaceProps) {
  const welcomeMessage = useMemo(
    () => buildWelcomeMessage(summaryData),
    [summaryData]
  );

  const starterPrompts = useMemo(
    () => getSuggestedQuestions(summaryData),
    [summaryData]
  );

  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: welcomeMessage },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async (e?: React.FormEvent, presetPrompt?: string) => {
    if (e) e.preventDefault();

    const userMessage = presetPrompt || input;
    if (!userMessage.trim() || isLoading) return;

    setInput("");
    const historyForApi = messages.filter((m) => m.role === "user" || m.role === "assistant");
    const newMessages: Message[] = [
      ...messages,
      { role: "user", content: userMessage },
    ];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          summary: summaryData,
          question: userMessage,
          messages: historyForApi.map(({ role, content }) => ({ role, content })),
          generatedDocs,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Chat request failed");
      }

      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: data.content,
          fallback: data.fallback === true,
        },
      ]);
    } catch {
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content:
            "Sorry, I could not reach the chat service. Check your connection and try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px]">
      <GlassCard className="flex-1 p-4 mb-4 overflow-y-auto custom-scrollbar flex flex-col gap-4">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] p-4 rounded-2xl ${
                msg.role === "user"
                  ? "bg-blue-600 text-white rounded-br-sm"
                  : "bg-white/10 text-zinc-200 border border-white/5 rounded-bl-sm prose prose-invert prose-sm"
              }`}
            >
              {msg.role === "user" ? (
                msg.content
              ) : (
                <>
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                  {msg.fallback && (
                    <p className="mt-2 text-[10px] text-zinc-500 not-prose border-t border-white/5 pt-2">
                      Answered from parsed repository data (AI unavailable)
                    </p>
                  )}
                </>
              )}
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="bg-white/10 border border-white/5 p-4 rounded-2xl rounded-bl-sm flex gap-1">
              <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </GlassCard>

      {messages.length === 1 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {starterPrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => handleSubmit(undefined, prompt)}
              className="text-xs px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-zinc-300 transition-colors text-left"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Ask about ${summaryData.name}…`}
          className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-white px-6 rounded-xl font-medium transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  );
}
