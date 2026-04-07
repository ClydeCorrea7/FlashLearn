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

export const APP_VERSION = '1.3.5';

export const ChangelogScreen: React.FC<ChangelogScreenProps> = ({ onBack }) => {
  const [openVersion, setOpenVersion] = useState<string | null>(APP_VERSION);

  const releases = [
    {
      version: '1.3.5',
      description: 'Neural Stability & Data Healing',
      changes: [
        'Neural Sync Hardening: Implemented a Super-Transformer normalization layer for robust AI data extraction',
        'Case-Insensitive Key Discovery: Resolved issue where capitalized AI keys (e.g., "Definition") caused blank fields',
        'Type-Aware Rendering: Added object recovery logic to render text even if the AI returns JSON objects instead of strings',
        'Explicit Gateway Routing: Hardcoded route aliases for the Neural Notes module to ensure 100% connectivity',
        'Structural Overhaul: Integrated a "Master-Level" prompt to enforce dense, non-empty academic generation',
        'Defensive PDF Export: Hardened generatePDF logic with recursive array checks to prevent export crashes'
      ]
    },
    {
      version: '1.3.4',
      description: 'Neural Presets & Visual Sync',
      changes: [
        'Neural Presets: Integrated 6 professionally calibrated color signatures (Red, Blue, Purple, Green, Yellow, Grey)',
        'Adaptive UI Synchronization: Real-time gradient updates across all buttons, cards, and headers',
        'Themed Global Scrollbars: Scrollbar thumb and hover aesthetics now adapt to the chosen neural path',
        'Persistence Protocol: Standardized localStorage archival for all visual customization choices',
        'Dynamic Variable Injection: Real-time CSS variable manipulation for global neon core colors'
      ]
    },
    {
      version: '1.3.3',
      description: 'Archives Hub & Neural Merging',
      changes: [
        'Deck Storage Screen: Centralized knowledge vault for managing all created assets',
        'Neural Merging Engine: Tactical synthesis of two same-type decks into composite signatures',
        'Light Mode Hardening: Global UI audit and remediation for full accessibility parity',
        'Archives Portal: Dual entry points via Dashboard card and dedicated navigation header',
        'Deduplication Protocol: Automatic removal of duplicate signatures during neural merging',
        'Notification Core: Re-engineered alert system with theme-aware high-contrast components'
      ]
    },
    {
      version: '1.3.2',
      description: 'Neural Refinement Protocol',
      changes: [
        'Neural Hub Entry: Integrated a "Genesis" selection screen for unauthenticated users',
        'Guest Protocol: Enabled full Neural Note generation/download for anonymous users',
        'Automated Vault Archival: Proactive saving protocol for authenticated note generation',
        'Advanced Tone Engine: Dual-layer tone handling (Hybrid Academic/Teacher logic)',
        'Boundary Guard (PDF): Strict horizontal and vertical rhythmic enforcement for document exports',
        'Typography Calibration: Globally scaled PDF font-system (+2pt) for enhanced legibility',
        'System Manual v1.0.5: Documented Neural Notes protocol and streamlined navigation'
      ]
    },
    {
      version: '1.3.1',
      description: 'Neural Security Protocol',
      changes: [
        'Mandatory Email Confirmation: Integrated Supabase Auth authorization links for all new accounts',
        'Intelligent Password Recovery: Integrated real-time registration checks via profiles mirroring',
        'Direct Database Verification: Switched from auth code checks to direct profiles table querying',
        'Path-Based Redirection: Optimized /reset-password URL routing for better reliability',
        'Session Shielding: Automated session invalidation for unverified neural links',
        'Profile Sync Trigger: PostgreSQL triggers for automatic auth-to-table replication'
      ]
    },
    {
      version: '1.3.0',
      description: 'Neural Note Architecture',
      changes: [
        'Neural Note Generation: Build high-fidelity academic notes using GPT-4o-mini',
        'Pixel Hybrid Design: Hybrid aesthetic (Courier headers / Helvetica body) for max readability',
        'Advanced PDF Engine: Custom jsPDF implementation with structured sectioning and neon accents',
        'Module Integration: Direct entry point from Create tab',
        'Topic Validation: 500-character safety limit for optimized AI output quality'
      ]
    },
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
            className="p-2 rounded-full hover:bg-secondary/50 transition-colors border border-border"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl uppercase tracking-[0.2em] font-['Press_Start_2P'] bg-gradient-to-r from-[var(--neon-cyan)] to-[var(--neon-blue)] bg-clip-text text-transparent">
              SYSTEM_LOGS
            </h1>
            <p className="text-[8px] font-['Press_Start_2P'] text-muted-foreground mt-1 tracking-widest">
              DEPLOYMENT_HISTORY :: v1.3.5
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
                <p className="text-white/90 text-sm leading-relaxed text-justify">
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
            <span className="text-[var(--neon-cyan)] animate-pulse font-bold">LAST_DEPLOY: 2026.04.07</span>
            <span className="text-foreground/40 font-bold">BRANCH: PRODUCTION</span>
            <span className="text-foreground/40 font-bold">ENV: SUPABASE_LIVE</span>
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
                  <div className={`p-2 rounded-lg transition-colors ${openVersion === release.version ? 'bg-[var(--neon-cyan)]/20 text-[var(--neon-cyan)]' : 'bg-secondary text-foreground/30 group-hover:text-[var(--neon-cyan)]'
                    }`}>
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[var(--neon-cyan)] font-['Press_Start_2P'] text-[10px]">v{release.version}</span>
                      <span className="w-1 h-1 rounded-full bg-foreground/20" />
                      <span className="text-xs text-foreground/80 font-bold group-hover:text-[var(--neon-cyan)] transition-colors uppercase tracking-wider">{release.description}</span>
                    </div>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 text-foreground/20 transition-transform duration-300 group-hover:text-[var(--neon-cyan)] ${openVersion === release.version ? 'rotate-90 text-[var(--neon-cyan)]' : ''}`} />
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
                            className="text-xs text-foreground/70 flex items-start gap-4 leading-relaxed"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--neon-cyan)]/50 mt-1.5 shrink-0 shadow-[0_0_8px_#06b6d4]" />
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

        {/* Footer removed to streamline navigation */}
      </div>
    </div>
  );
};
