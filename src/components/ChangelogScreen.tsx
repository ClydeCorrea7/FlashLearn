import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Terminal,
  Cloud,
  Zap,
  Cpu,
  Layers,
  Sparkles,
  History
} from "lucide-react";
import { NeonButton } from "./NeonButton";
import { AnimatedCard } from "./AnimatedCard";

interface ChangelogScreenProps {
  onBack: () => void;
}

export const ChangelogScreen: React.FC<ChangelogScreenProps> = ({ onBack }) => {
  const [openVersion, setOpenVersion] = useState<string | null>('1.2.3');

  const releases = [
    {
      version: '1.2.3',
      description: 'FlashLearn Pro Protocol',
      changes: [
        'Major Delete Module Revamp: Tactical button nodes with reactive neon glow',
        'High-Visibility Color Shift (Cyan/Red) for critical override protocols',
        'Industrial-Grade Study Buttons: 120px Reveal Answer/Pattern touchpoints',
        'Optimized NavigationBar: Horizontal layout for streamlined access',
        'UI Spacing Refinement: Standardized h-12 gaps in study interactions',
        'Visual Polishing: Removed redundant card icons and fixed button alignments',
        'Chat Stability: Resolved message occlusion in Dynamic Sessions'
      ]
    },
    {
      version: '1.2.2',
      description: 'Password Recovery Ecosystem',
      changes: [
        'Enhanced Password Recovery with secure Supabase integration',
        'Dedicated separate screen for Recovery Confirmation',
        'Implemented 60s cooldown timer for security reset requests',
        'Unified Supabase GoTrueClient instance (Fix redundancy)',
        'Optimized NavigationBar: Removed slide-up animations for instant loading'
      ]
    },
    { version: '1.2.1', description: 'Dynamic Learning Stability', changes: ['Deep UI Polishing for Dynamic Sessions', 'Fixed Input Box/Keyboard overlap on mobile', 'Added Gradient Styling to Session Headers', 'Stability and HMR persistence improvements'] },
    { version: '1.2.0', description: 'Dynamic Learning Engine', changes: ['AI Dynamic Learning Sessions introduced', 'PDF Transcript Export for tutoring', 'Adaptive Personality for AI Tutor', 'Real-time Round Tracking'] },
    { version: '1.1.1', description: 'AI Core Refinement', changes: ['Performance optimization for Supabase calls', 'Fixed AI Generation timeout issues', 'General Stability Refinement'] },
    { version: '1.1.0', description: 'MCQ & Progress', changes: ['MCQ Mode implemented with AI distractors', 'Mastered Status Persistence logic', 'Standardized Deck Naming Convention'] },
    { version: '1.0.0', description: 'Initial Launch', changes: ['Initial Release', 'AI Core Flashcard Generation', 'Cyber-Aesthetic Dashboard UI'] }
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden pt-6 pb-20 px-4">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-20">
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
            className="p-2 rounded-full hover:bg-secondary/50 transition-colors border border-white/10"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl uppercase tracking-[0.2em] font-['Press_Start_2P'] bg-gradient-to-r from-[var(--neon-cyan)] to-[var(--neon-blue)] bg-clip-text text-transparent">
              SYSTEM_LOGS
            </h1>
            <p className="text-[8px] font-['Press_Start_2P'] text-muted-foreground mt-1 tracking-widest">
              DEPLOYMENT_HISTORY :: v1.2.3
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
              <div className="p-3 bg-[var(--neon-cyan)]/20 rounded-xl neon-border-blue shrink-0">
                <Terminal className="w-6 h-6 text-[var(--neon-cyan)]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white mb-2 uppercase tracking-wider">Evolution Registry</h2>
                <p className="text-blue-100/70 text-sm leading-relaxed text-justify">
                  Official registry of all system updates and patches applied to the FlashLearn core environment.
                  Each entry documents neural optimizations, UI refactorings, and infrastructure stability patches.
                  Stay updated on project progression.
                </p>
              </div>
            </div>
          </AnimatedCard>
        </motion.div>

        {/* Status indicator bar */}
        <div className="mb-8 font-mono text-[10px] p-2 bg-black/40 border-l-2 border-[var(--neon-cyan)] flex justify-between items-center overflow-hidden whitespace-nowrap uppercase tracking-widest">
          <div className="flex gap-4">
            <span className="text-[var(--neon-cyan)] animate-pulse">LAST_DEPLOY: 2026.03.30</span>
            <span className="text-white/40">BRANCH: PRODUCTION</span>
            <span className="text-white/40">ENV: SUPABASE_LIVE</span>
          </div>
          <div className="flex gap-2">
            <Cloud className="w-3 h-3 text-white/40" />
            <History className="w-3 h-3 text-white/40" />
          </div>
        </div>

        {/* Changelog Accordion List */}
        <div className="space-y-4">
          {releases.map((release, index) => (
            <motion.div
              key={release.version}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + (index * 0.1) }}
              className={`rounded-xl border transition-all duration-300 overflow-hidden ${openVersion === release.version
                  ? 'bg-white/10 border-cyan-500/30'
                  : 'bg-white/5 border-white/5 hover:bg-white/[0.07] border-white/10'
                }`}
            >
              <button
                onClick={() => setOpenVersion(openVersion === release.version ? null : release.version)}
                className="w-full flex items-center justify-between p-5 text-left group"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg transition-colors ${openVersion === release.version ? 'bg-cyan-500/20 text-cyan-400' : 'bg-white/5 text-white/30 group-hover:text-cyan-400'
                    }`}>
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-cyan-400 font-['Press_Start_2P'] text-[10px]">v{release.version}</span>
                      <span className="w-1 h-1 rounded-full bg-white/20" />
                      <span className="text-xs text-white/80 font-medium group-hover:text-white transition-colors uppercase tracking-wider">{release.description}</span>
                    </div>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 text-white/20 transition-transform duration-300 group-hover:text-cyan-400 ${openVersion === release.version ? 'rotate-90 text-cyan-400' : ''}`} />
              </button>

              <AnimatePresence>
                {openVersion === release.version && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  >
                    <div className="px-6 pb-6 border-t border-white/5 pt-5 bg-black/20">
                      <ul className="space-y-4">
                        {release.changes.map((change, i) => (
                          <motion.li
                            key={i}
                            className="text-xs text-white/60 flex items-start gap-4 leading-relaxed"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500/50 mt-1.5 shrink-0 shadow-[0_0_8px_#06b6d4]" />
                            {change}
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Footer Action */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <NeonButton onClick={onBack} animate={true} glowing={true} className="px-8 border-cyan-500/50 text-cyan-400">
            <span className="mr-2">TERMINATE_LOGS</span>
            <ChevronLeft className="w-3 h-3 inline rotate-180" />
          </NeonButton>
        </motion.div>
      </div>
    </div>
  );
};
