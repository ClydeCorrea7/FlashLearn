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
    <div className="min-h-screen bg-[var(--cyber-bg)] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--neon-blue)]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[var(--neon-purple)]/5 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        <Card className="cyber-surface p-10 neon-border-blue relative overflow-hidden border-2">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[var(--neon-blue)] via-[var(--neon-purple)] to-[var(--neon-blue)] animate-pulse" />
          
          <div className="text-center">
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 12, stiffness: 100, delay: 0.2 }}
              className="w-24 h-24 rounded-full bg-cyan-500/10 mx-auto flex items-center justify-center mb-10 neon-glow-blue border-2 border-cyan-500/30 relative"
            >
              <Mail className="w-12 h-12 text-[var(--neon-blue)]" />
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5 }}
                className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1 border-4 border-[var(--cyber-surface)]"
              >
                <CheckCircle2 className="w-5 h-5 text-white" />
              </motion.div>
            </motion.div>

            <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-[var(--neon-blue)] to-[var(--neon-purple)] bg-clip-text text-transparent">
              Check Your Mail
            </h1>
            
            <div className="space-y-6 text-white/70">
              <p className="text-lg leading-relaxed">
                We've dispatched a secure recovery link to your inbox:
              </p>
              
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 group hover:border-[var(--neon-blue)]/50 transition-all duration-300">
                <span className="text-[var(--neon-blue)] font-mono font-bold text-xl break-all">
                  {email}
                </span>
              </div>
              
              <p className="text-sm leading-relaxed italic">
                Wait a few moments if you don't see it instantly, and remember to check your spam folder just in case.
              </p>
            </div>

            <div className="mt-12 space-y-4">
              <NeonButton 
                onClick={onBack}
                className="w-full py-5 text-lg font-bold tracking-[0.2em]"
                glowing={true}
              >
                BACK TO SIGN IN
              </NeonButton>
              
              <button 
                onClick={onBack}
                className="flex items-center justify-center gap-2 text-white/40 hover:text-[var(--neon-blue)] transition-colors text-sm w-full font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                Return to Login
              </button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Decorative scanline effect */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,118,0.06))] bg-[length:100%_4px,3px_100%]" />
    </div>
  );
};
