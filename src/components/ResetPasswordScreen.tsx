import React, { useState } from 'react';
import { motion } from 'motion/react';
import { NeonButton } from './NeonButton';
import { PasswordInput } from './PasswordInput';
import { Card } from './ui/card';
import { Brain, Lock, Loader2, Sparkles, ShieldCheck } from 'lucide-react';
import { supabase } from '../utils/supabase/client';

interface ResetPasswordScreenProps {
  onSuccess: () => void;
}

export const ResetPasswordScreen: React.FC<ResetPasswordScreenProps> = ({ onSuccess }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError('New password required');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Security threshold: 6+ characters');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) throw updateError;

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 2500);
    } catch (err: any) {
      setError(err.message || 'Encryption protocol failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--cyber-bg)] flex items-center justify-center p-8 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[var(--neon-purple)]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-[var(--neon-blue)]/5 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl z-10"
      >
        <Card className="cyber-surface p-[100px] sm:p-[240px] border-1 neon-border-purple relative overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.6)]">
          <div className="absolute top-10 left-10 w-full h-10 bg-gradient-to-r from-[var(--neon-purple)] via-[var(--neon-blue)] to-[var(--neon-purple)]" />

          <div className="text-center mb-16">
            <motion.div
              initial={{ rotateY: 180, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="w-24 h-24 rounded-2xl bg-purple-500/10 mx-auto flex items-center justify-center mb-10 neon-glow-purple border border-purple-500/30"
            >
              <Lock className="w-10 h-10 text-[var(--neon-purple)]" />
            </motion.div>

            <h1 className="text-2xl font-black mb-4 bg-gradient-to-r from-[var(--neon-purple)] to-[var(--neon-blue)] bg-clip-text text-transparent uppercase tracking-[0.2em]">
              Security Protocol
            </h1>
            <p className="text-[10px] text-white/40 uppercase tracking-widest font-mono">
              Reset Token Verified • Access Granted
            </p>
          </div>

          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-10 max-w-md mx-auto">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-widest text-purple-400 font-bold ml-1">New Access Key</label>
                  <PasswordInput
                    value={password}
                    onChange={setPassword}
                    placeholder="••••••••"
                    className="cyber-surface py-5 neon-border-purple focus:neon-glow-purple text-white bg-black/40"
                    disabled={isLoading}
                    leftIcon={<ShieldCheck className="w-4 h-4 text-purple-400" />}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-widest text-purple-400 font-bold ml-1">Confirm Identity</label>
                  <PasswordInput
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    placeholder="••••••••"
                    className="cyber-surface py-5 neon-border-purple focus:neon-glow-purple text-white bg-black/40"
                    disabled={isLoading}
                    leftIcon={<ShieldCheck className="w-4 h-4 text-purple-400" />}
                  />
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-[8px] text-center p-4 bg-red-400/5 rounded-lg border border-red-400/20 uppercase tracking-widest font-mono"
                >
                  {error}
                </motion.div>
              )}

              <div className="pt-6">
                <NeonButton
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-10 text-[20px] font-black tracking-[0.3em] uppercase bg-purple-500/10 border-purple-500/30"
                  animate={true}
                  glowing={!isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-10 h-10 animate-spin mr-2 inline" />
                      Updating...
                    </>
                  ) : (
                    'Finalize Encryption'
                  )}
                </NeonButton>
              </div>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-10"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                <Sparkles className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-lg font-bold text-emerald-400 mb-4 tracking-widest uppercase">Protocol Success</h2>
              <p className="text-[9px] text-white/50 uppercase tracking-[0.2em] mb-12">Re-routing to Central Dashboard...</p>
              <div className="flex justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-400/50" />
              </div>
            </motion.div>
          )}
        </Card>
      </motion.div>

      {/* Decorative effects */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,118,0.06))] bg-[length:100%_4px,3px_100%]" />
    </div>
  );
};
