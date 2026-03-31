import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NeonButton } from './NeonButton';
import { PasswordInput } from './PasswordInput';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Brain, Sparkles, Loader2, Mail, Lock, User } from 'lucide-react';
import { supabase } from '../utils/supabase/client';
import { RecoverySuccessScreen } from './RecoverySuccessScreen';

interface SimpleAuthScreenProps {
  onAuthSuccess: (userData: { name: string; email: string }) => void;
}

export const SimpleAuthScreen: React.FC<SimpleAuthScreenProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const [lastResetRequest, setLastResetRequest] = useState<number>(0);
  const cooldownPeriod = 60000; // 1 minute

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email) {
      setError('Please enter your email address');
      return;
    }

    if (isForgotPassword) {
      const now = Date.now();
      if (now - lastResetRequest < cooldownPeriod) {
        const remaining = Math.ceil((cooldownPeriod - (now - lastResetRequest)) / 1000);
        setError(`Please wait ${remaining}s before requesting another link`);
        return;
      }

      setIsLoading(true);
      setError('');
      try {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(formData.email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (resetError) throw resetError;
        setLastResetRequest(Date.now());
        setShowSuccessModal(true);
      } catch (err: any) {
        if (err.status === 429 || err.message?.includes('429')) {
           setError('Too many requests. Please wait 1 minute.');
        } else {
           setError(err.message || 'Failed to send reset link');
        }
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (!formData.password) {
      setError('Please enter your password');
      return;
    }

    if (!isLogin && !formData.name) {
      setError('Please enter your name');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      let result;
      
      if (isLogin) {
        // Sign in with Supabase
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        
        if (signInError) {
          throw new Error(signInError.message);
        }
        
        result = {
          name: data.user?.user_metadata?.name || data.user?.email?.split('@')[0] || 'User',
          email: data.user?.email || formData.email
        };
      } else {
        // Sign up with Supabase - simplified, no metadata
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
        });
        
        if (signUpError) {
          console.error("Signup error:", signUpError);
          throw new Error(signUpError.message);
        }
        
        if (signUpData.user) {
          result = {
            name: formData.name || signUpData.user.email?.split('@')[0] || 'User',
            email: signUpData.user.email || formData.email
          };
          
          // Update user metadata after signup (separate call)
          if (formData.name) {
            try {
              await supabase.auth.updateUser({
                data: { name: formData.name }
              });
            } catch (metaError) {
              console.warn("Could not update user metadata:", metaError);
            }
          }
        } else {
          throw new Error('Signup completed but user data not returned. Please try signing in.');
        }
      }
      
      onAuthSuccess(result);
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setIsForgotPassword(false);
    setError('');
    setFormData({ name: '', email: '', password: '' });
  };

  if (showSuccessModal) {
    return (
      <RecoverySuccessScreen 
        email={formData.email} 
        onBack={() => {
          setShowSuccessModal(false);
          setIsForgotPassword(false);
          setIsLogin(true);
        }} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--cyber-bg)] via-[var(--background)] to-[var(--cyber-bg)] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <Card className="cyber-surface w-full max-w-md p-8 neon-border-blue">
          <motion.div 
            className="text-center mb-8"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <div className="relative mx-auto w-16 h-16 mb-4">
              <motion.div 
                className="cyber-gradient w-16 h-16 rounded-full flex items-center justify-center neon-glow-blue"
                animate={{ 
                  boxShadow: [
                    '0 0 20px rgba(59, 130, 246, 0.4)',
                    '0 0 30px rgba(139, 92, 246, 0.6)',
                    '0 0 20px rgba(59, 130, 246, 0.4)'
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Brain className="w-8 h-8 text-white" />
              </motion.div>
              <motion.div 
                className="absolute -top-1 -right-1 w-6 h-6 bg-[var(--neon-purple)] rounded-full flex items-center justify-center neon-glow-purple"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              >
                <Sparkles className="w-3 h-3 text-white" />
              </motion.div>
            </div>
            <motion.h2 
              className="mb-2 bg-gradient-to-r from-[var(--neon-blue)] to-[var(--neon-purple)] bg-clip-text text-transparent"
              key={isForgotPassword ? 'forgot' : isLogin ? 'login' : 'signup'}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {isForgotPassword ? 'Reset Password' : isLogin ? 'Welcome Back' : 'Join FlashLearn'}
            </motion.h2>
            <motion.p 
              className="text-muted-foreground text-sm"
              key={isForgotPassword ? 'forgot-desc' : isLogin ? 'login-desc' : 'signup-desc'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              {isForgotPassword 
                ? 'Enter your email to receive a recovery link' 
                : isLogin 
                  ? 'Sign in to continue your learning journey' 
                  : 'Create your account to get started'}
            </motion.p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && !isForgotPassword && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <label className="block text-sm mb-2">Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Your full name"
                    className="pl-10 cyber-surface neon-border-blue focus:neon-glow-blue text-white"
                    disabled={isLoading}
                  />
                </div>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              <label className="block text-sm mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="your@email.com"
                  className="pl-10 cyber-surface neon-border-blue focus:neon-glow-blue text-white"
                  disabled={isLoading}
                  required
                />
              </div>
            </motion.div>

            {!isForgotPassword && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm">Password</label>
                  {isLogin && (
                    <button
                      type="button"
                      onClick={() => setIsForgotPassword(true)}
                      className="text-[10px] text-[var(--neon-purple)] hover:text-[var(--neon-blue)] transition-colors uppercase font-mono tracking-tighter"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <PasswordInput
                  value={formData.password}
                  onChange={(value) => handleInputChange('password', value)}
                  placeholder="••••••••"
                  className="cyber-surface neon-border-blue focus:neon-glow-blue text-white"
                  disabled={isLoading}
                  leftIcon={<Lock className="w-4 h-4" />}
                />
              </motion.div>
            )}

            {error && (
              <motion.div 
                className="text-red-400 text-sm text-center p-2 bg-red-400/10 rounded-lg border border-red-400/20"
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                {error}
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.3 }}
            >
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
                    {isForgotPassword ? 'Sending...' : isLogin ? 'Signing In...' : 'Creating...'}
                  </>
                ) : (
                  isForgotPassword ? 'Send Recovery Link' : isLogin ? 'Sign In' : 'Create Account'
                )}
              </NeonButton>
            </motion.div>
          </form>

          <motion.div 
            className="mt-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.3 }}
          >
            <p className="text-muted-foreground text-sm mb-2">
              {isForgotPassword 
                ? "Remember your password?" 
                : isLogin 
                  ? "Don't have an account?" 
                  : "Already have an account?"}
            </p>
            <motion.button
              type="button"
              onClick={isForgotPassword ? () => setIsForgotPassword(false) : toggleAuthMode}
              className="text-[var(--neon-blue)] hover:text-[var(--neon-purple)] transition-colors text-sm"
              disabled={isLoading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isForgotPassword ? 'Back to Sign In' : isLogin ? 'Create Account' : 'Sign In'}
            </motion.button>
          </motion.div>
        </Card>
      </motion.div>
    </div>
  );
};

