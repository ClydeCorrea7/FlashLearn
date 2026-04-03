import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NeonButton } from './NeonButton';
import { Card } from './ui/card';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface RecoverySuccessScreenProps {
  email: string;
  onBack: () => void;
}

export const RecoverySuccessScreen: React.FC<RecoverySuccessScreenProps> = ({ email, onBack }) => {
  return (
    <div className="min-h-screen bg-[var(--cyber-bg)] flex items-center justify-center p-8 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-0 w-full h-[50%] bg-[var(--neon-blue)]/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-0 w-full h-[50%] bg-[var(--neon-purple)]/5 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl z-10"
      >
        <Card className="cyber-surface p-20 sm:p-32 border-2 neon-border-blue relative overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--neon-blue)] via-[var(--neon-purple)] to-[var(--neon-blue)] opacity-50" />
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--neon-purple)] via-[var(--neon-blue)] to-[var(--neon-purple)] opacity-50" />

          <div className="text-center flex flex-col items-center gap-16">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="w-20 h-20 rounded-xl bg-cyan-500/5 flex items-center justify-center neon-glow-blue border border-cyan-500/20 relative"
            >
              <Mail className="w-8 h-8 text-[var(--neon-blue)] opacity-80" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-[var(--neon-blue)] rounded-full animate-ping" />
            </motion.div>

            <div className="space-y-6">
              <h1 className="text-xl font-bold tracking-[0.3em] uppercase bg-gradient-to-r from-[var(--neon-blue)] to-[var(--neon-purple)] bg-clip-text text-transparent">
                Link Dispatched
              </h1>
              <p className="text-[15px] text-white/40 tracking-widest uppercase font-mono">
                Recovery Protocol Active
              </p>
            </div>

            <div className="w-full max-w-sm space-y-12">
              <div className="relative group">
                <div className="absolute inset-0 bg-[var(--neon-blue)]/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative p-6 rounded-lg bg-black/40 border border-white/5 flex flex-col gap-3">
                  <span className="text-[15px] text-white/30 uppercase tracking-widest font-mono">Target Address</span>
                  <span className="text-[var(--neon-blue)] font-mono text-[10px] break-all selection:bg-[var(--neon-blue)] selection:text-black">
                    {email}
                  </span>
                </div>
              </div>

              <p className="text-[8px] leading-relaxed text-white/30 tracking-wider px-6 uppercase font-mono">
                Verification required. Please validate the secure link in your inbox. Check spam if necessary.
              </p>
            </div>

            <div className="w-full max-w-xs pt-12">
              <NeonButton
                onClick={onBack}
                className="w-full py-5 text-[9px] font-black tracking-[0.3em] uppercase border-white/10 hover:border-[var(--neon-blue)]/50"
                glowing={false}
              >
                Return to Login
              </NeonButton>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Decorative scanline effect */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,118,0.06))] bg-[length:100%_4px,3px_100%]" />
    </div>
  );
};
