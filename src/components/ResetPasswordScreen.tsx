import React, { useState } from 'react';
import { motion } from 'motion/react';
import { NeonButton } from './NeonButton';
import { PasswordInput } from './PasswordInput';
import { Card } from './ui/card';
import { Brain, Sparkles, Loader2, Lock } from 'lucide-react';
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
      setError('Please enter a new password');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
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
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--cyber-bg)] via-[var(--background)] to-[var(--cyber-bg)] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <Card className="cyber-surface w-full max-w-md p-8 neon-border-blue">
          <div className="text-center mb-8">
            <div className="relative mx-auto w-16 h-16 mb-4">
              <div className="cyber-gradient w-16 h-16 rounded-full flex items-center justify-center neon-glow-blue">
                <Brain className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="mb-2 bg-gradient-to-r from-[var(--neon-blue)] to-[var(--neon-purple)] bg-clip-text text-transparent">
              Set New Password
            </h2>
            <p className="text-muted-foreground text-sm">
              Your recovery link was verified. Choose a strong new password.
            </p>
          </div>

          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm mb-2">New Password</label>
                <PasswordInput
                  value={password}
                  onChange={setPassword}
                  placeholder="••••••••"
                  className="cyber-surface neon-border-blue focus:neon-glow-blue text-white"
                  disabled={isLoading}
                  leftIcon={<Lock className="w-4 h-4" />}
                />
              </div>

              <div>
                <label className="block text-sm mb-2">Confirm Password</label>
                <PasswordInput
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  placeholder="••••••••"
                  className="cyber-surface neon-border-blue focus:neon-glow-blue text-white"
                  disabled={isLoading}
                  leftIcon={<Lock className="w-4 h-4" />}
                />
              </div>

              {error && (
                <div className="text-red-400 text-sm text-center p-2 bg-red-400/10 rounded-lg border border-red-400/20">
                  {error}
                </div>
              )}

              <NeonButton
                type="submit"
                disabled={isLoading}
                className="w-full py-3 flex items-center justify-center gap-2"
                animate={true}
                glowing={!isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Password'
                )}
              </NeonButton>
            </form>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-4"
            >
              <div className="text-[var(--neon-blue)] text-lg font-bold">Password Updated!</div>
              <p className="text-sm text-muted-foreground">Redirecting you to the dashboard...</p>
              <div className="flex justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--neon-blue)]" />
              </div>
            </motion.div>
          )}
        </Card>
      </motion.div>
    </div>
  );
};
