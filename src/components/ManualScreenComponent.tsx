import React from "react";
import { motion } from "motion/react";
import {
  BookOpen,
  ChevronLeft,
  Zap,
  Brain,
  Sparkles,
  TrendingUp,
  Settings,
  Shield,
  Smartphone,
  Cpu,
  Layers,
  Target,
  Terminal
} from "lucide-react";
import { NeonButton } from "./NeonButton";
import { AnimatedCard } from "./AnimatedCard";

interface ManualScreenProps {
  onBack: () => void;
}

export const ManualScreen: React.FC<ManualScreenProps> = ({ onBack }) => {
  const sections = [
    {
      icon: Layers,
      title: "STATIC PROTOCOL",
      content: "Traditional front-and-back flashcards. Best for quick memorization of facts, terms, and definitions. To generate: Select 'Static' mode in 'Create Deck', provide a title, and use AI core generation or manual input.",
      color: "var(--neon-blue)",
      shadow: "rgba(59, 130, 246, 0.5)"
    },
    {
      icon: Target,
      title: "MCQ INTERFACE",
      content: "Multiple-choice questions with AI-driven distractors. Enhances recognition and testing skills. To generate: Select 'MCQ' mode in 'Create Deck', define your topic, and let the AI construct the question set and dynamic options.",
      color: "var(--neon-magenta)",
      shadow: "rgba(255, 0, 255, 0.5)"
    },
    {
      icon: Cpu,
      title: "DYNAMIC SESSIONS",
      content: "Real-time conversational learning with an adaptive AI tutor. No decks required. To initiate: Select 'Dynamic' mode in 'Create Deck', then calibrate your topic, level, and session objectives in the session setup.",
      color: "var(--neon-purple)",
      shadow: "rgba(139, 92, 246, 0.5)"
    },
    {
      icon: Sparkles,
      title: "NEURAL NOTES",
      content: "AI-synthesized academic notes with high-fidelity formatting. Best for deep thematic study. To generate: Select 'Notes' mode in 'Create Dashboard', configure your subject context and topics, then download or archive to your vault.",
      color: "var(--neon-blue)",
      shadow: "rgba(59, 130, 246, 0.5)"
    }
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden pt-6 pb-20 px-4">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-[0.05] dark:opacity-20 transition-opacity">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-[var(--neon-cyan)] rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--neon-blue)] rounded-full blur-[120px] animate-pulse" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          className="flex items-center gap-4 mb-8"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <button
            onClick={onBack}
            className="p-2 rounded-full hover:bg-secondary/50 transition-colors border border-border"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl uppercase tracking-[0.2em] font-['Press_Start_2P'] bg-gradient-to-r from-[var(--neon-blue)] to-[var(--neon-purple)] bg-clip-text text-transparent">
              SYSTEM_MANUAL
            </h1>
            <p className="text-[8px] font-['Press_Start_2P'] text-muted-foreground mt-1 tracking-widest">
              PROTOCOL_VERSION :: 1.1.0
            </p>
          </div>
        </motion.div>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-10"
        >
          <AnimatedCard variant="cyber" className="p-6 overflow-hidden relative" glowing={true}>
            <div className="flex items-start gap-4">
              <div className="p-3 bg-[var(--neon-blue)]/30 rounded-xl neon-border-blue shrink-0">
                <BookOpen className="w-6 h-6 text-foreground" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground mb-2 uppercase tracking-wider">Welcome to FlashLearn</h2>
                <p className="text-foreground/80 text-sm leading-relaxed text-justify">
                  The FlashLearn interface is designed for high-efficiency information retention. This manual provides technical documentation on the core sub-systems and protocol handling within the application. Follow each directive to optimize your learning output.
                </p>
              </div>
            </div>
          </AnimatedCard>
        </motion.div>

        {/* Terminal/Status Bar */}
        <div className="mb-8 font-mono text-[10px] p-2 bg-secondary/30 dark:bg-black/40 border-l-2 border-[var(--neon-cyan)] flex justify-between items-center overflow-hidden whitespace-nowrap uppercase tracking-widest">
          <div className="flex gap-4">
            <span className="text-[var(--neon-blue)] animate-pulse">STATUS: ONLINE</span>
            <span className="text-foreground/40">LATENCY: 12ms</span>
            <span className="text-foreground/40">BUFFER: STABLE</span>
          </div>
          <div className="flex gap-2">
            <Layers className="w-3 h-3 text-white/40" />
            <Cpu className="w-3 h-3 text-white/40" />
            <Sparkles className="w-3 h-3 text-white/40" />
          </div>
        </div>

        {/* Manual Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + (index * 0.1) }}
              >
                <AnimatedCard
                  className="h-full p-6 cyber-surface group hover:neon-border-blue transition-all"
                  delay={index * 0.1}
                >
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-transform group-hover:scale-110 group-hover:rotate-3"
                    style={{
                      backgroundColor: `${section.color}20`,
                      border: `1px solid ${section.color}40`,
                      boxShadow: `0 0 15px ${section.shadow}`
                    }}
                  >
                    <Icon className="w-6 h-6" style={{ color: section.color }} />
                  </div>
                  <h3 className="text-sm font-['Press_Start_2P'] mb-3 tracking-tighter" style={{ color: section.color }}>
                    {section.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {section.content}
                  </p>
                </AnimatedCard>
              </motion.div>
            );
          })}
        </div>

        {/* Footer removed to streamline navigation via header */}
      </div>
    </div>
  );
};
