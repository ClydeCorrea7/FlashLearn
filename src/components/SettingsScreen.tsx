import React from 'react';
import { Card } from './ui/card';
import { Switch } from './ui/switch';
import { NeonButton } from './NeonButton';
import { ArrowLeft, Moon, Sun, Bell, User, Shield, HelpCircle, LogOut, Trash2, AlertTriangle, ChevronRight, Copy, CheckCircle2, BookOpen, Mail, ShieldCheck, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from './ThemeProvider';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { DeleteAccountModule } from './DeleteAccountModule';
import { RecoverySuccessScreen } from './RecoverySuccessScreen';
import { authAPI } from '../utils/api';

interface SettingsScreenProps {
  onBack: () => void;
  onSignOut: () => void;
  onStartPurge: () => void;
  onOpenChangelog: () => void;
  user?: any;
  isDeleting?: boolean;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ 
  onBack, 
  onSignOut, 
  onStartPurge, 
  onOpenChangelog,
  user, 
  isDeleting = false 
}) => {
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    if (activeTab) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [activeTab]);

  const copyEmail = () => {
    navigator.clipboard.writeText('clydecorrea78@gmail.com');
    toast.success('Email copied to clipboard!');
  };



  const SupportContent = () => (
    <div className="space-y-6">
      <div className="text-center p-8 rounded-2xl bg-white/5 border border-white/10">
        <div className="w-16 h-16 bg-[var(--neon-purple)]/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-[var(--neon-purple)]" />
        </div>
        <h3 className="text-xl font-bold mb-2">Need Help?</h3>
        <p className="text-sm text-white/60 mb-6">Our support team is ready to assist you with any questions or technical issues.</p>
        
        <div className="p-4 rounded-xl bg-black/40 border border-white/10 flex flex-col items-center gap-3">
          <p className="text-xs uppercase text-white/40 tracking-widest font-['Press_Start_2P']">Official Support Email</p>
          <p className="text-lg font-bold text-[var(--neon-blue)] break-all">clydecorrea78@gmail.com</p>
          <NeonButton onClick={copyEmail} variant="secondary" className="mt-2 flex items-center gap-2">
            <Copy className="w-4 h-4" />
            Copy Email ID
          </NeonButton>
        </div>
      </div>
    </div>
  );

  const PrivacyContent = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
        <ShieldCheck className="w-6 h-6 text-green-400" />
        <h3 className="font-bold text-green-400">Data Security</h3>
      </div>
      
      <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4">
        <p className="text-sm text-white/80 leading-relaxed">
          At FlashLearn, your data security is our top priority. We leverage <span className="text-[var(--neon-blue)] font-bold">Supabase</span>, a world-class backend infrastructure, to ensure your information is protected.
        </p>
        <p className="text-sm text-white/70 leading-relaxed italic border-l-2 border-white/20 pl-4">
          "Supabase provides enterprise-grade security including Row Level Security (RLS), encrypted storage, and robust authentication protocols. Your flashcards and personal data are stored in isolated environments, ensuring that only you can access your learning material."
        </p>
        <p className="text-sm text-white/80 leading-relaxed">
          By utilizing Supabase's secure cloud infrastructure, we guarantee that your study progress and decks are synced safely across all your devices without compromising your privacy.
        </p>
      </div>
    </div>
  );



  const [lastResetRequest, setLastResetRequest] = useState<number>(0);
  const cooldownPeriod = 60000; // 1 minute

  const handleResetPassword = async () => {
    if (!user?.email) return;
    
    const now = Date.now();
    if (now - lastResetRequest < cooldownPeriod) {
      const remaining = Math.ceil((cooldownPeriod - (now - lastResetRequest)) / 1000);
      toast.error(`Please wait ${remaining} seconds before requesting again.`);
      return;
    }

    const loadingToast = toast.loading('Sending reset email...');
    try {
      await authAPI.resetPassword(user.email);
      setLastResetRequest(Date.now());
      toast.dismiss(loadingToast);
      setShowResetModal(true);
    } catch (err: any) {
      toast.dismiss(loadingToast);
      if (err.status === 429 || err.message?.includes('429')) {
        toast.error('Too Many Requests: Please wait a minute before trying again.');
      } else {
        toast.error(err.message || 'Failed to send reset email');
      }
    }
  };

  const handleSignOut = () => {
    if (confirm('Are you sure you want to sign out?')) {
      onSignOut();
    }
  };

  return (
    <div className="min-h-screen bg-[var(--cyber-bg)] p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={onBack}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="bg-gradient-to-r from-[var(--neon-blue)] to-[var(--neon-purple)] bg-clip-text text-transparent">
            Settings
          </h1>
        </div>

        <div className="space-y-6">
          {/* User Info */}
          {user && (
            <Card className="cyber-surface p-6 neon-border-blue">
              <h3 className="mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Account
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 cyber-gradient rounded-full flex items-center justify-center neon-glow-blue">
                    <span className="text-white text-lg">
                      {user.user_metadata?.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div>
                    <p>{user.user_metadata?.name || 'FlashLearn User'}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <NeonButton
                  variant="secondary"
                  onClick={handleSignOut}
                  className="flex items-center gap-2 w-full justify-center"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </NeonButton>
                <NeonButton
                  variant="secondary"
                  onClick={handleResetPassword}
                  className="flex items-center gap-2 w-full justify-center mt-2"
                >
                  <Lock className="w-4 h-4" />
                  Reset Password
                </NeonButton>
              </div>
            </Card>
          )}

          {/* Appearance */}
          <Card className="cyber-surface p-6 neon-border-blue">
            <h3 className="mb-4 flex items-center gap-2">
              {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              Appearance
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p>Dark Mode</p>
                  <p className="text-sm text-muted-foreground">
                    {theme === 'dark' ? 'Enabled' : 'Disabled'} - Futuristic cyber aesthetic
                  </p>
                </div>
                <Switch
                  checked={theme === 'dark'}
                  onCheckedChange={toggleTheme}
                />
              </div>
            </div>
          </Card>

          {/* Study Preferences */}
          <Card className="cyber-surface p-6 neon-border-blue">
            <h3 className="mb-4">Study Preferences</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p>Shuffle cards</p>
                  <p className="text-sm text-muted-foreground">
                    Randomize card order during study sessions
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </Card>

          {/* Help & Support */}
          <Card className="cyber-surface p-6 neon-border-blue">
            <h3 className="mb-4 flex items-center gap-2">
              <HelpCircle className="w-5 h-5" />
              Help & Support
            </h3>
            <div className="space-y-3">

              <button 
                onClick={() => setActiveTab('support')}
                className="w-full text-left p-3 rounded-lg hover:bg-secondary/20 transition-colors flex justify-between items-center group"
              >
                <div>
                  <p className="group-hover:text-[var(--neon-blue)] transition-colors">Contact Support</p>
                  <p className="text-sm text-muted-foreground">Get help with technical issues</p>
                </div>
                <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-[var(--neon-blue)]" />
              </button>
              <button 
                onClick={() => setActiveTab('privacy')}
                className="w-full text-left p-3 rounded-lg hover:bg-secondary/20 transition-colors flex justify-between items-center group"
              >
                <div>
                  <p className="group-hover:text-[var(--neon-blue)] transition-colors">Privacy Policy</p>
                  <p className="text-sm text-muted-foreground">How we protect your data</p>
                </div>
                <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-[var(--neon-blue)]" />
              </button>
              <button 
                onClick={onOpenChangelog}
                className="w-full text-left p-3 rounded-lg hover:bg-secondary/20 transition-colors flex justify-between items-center group"
              >
                <div>
                  <p className="group-hover:text-[var(--neon-blue)] transition-colors">Change Logs</p>
                  <p className="text-sm text-muted-foreground">See what's new in v1.2.3</p>
                </div>
                <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-[var(--neon-blue)]" />
              </button>
            </div>
          </Card>

          {/* Modal Overlay */}
          <AnimatePresence>
            {activeTab && (
              <motion.div 
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="cyber-surface max-w-lg w-full max-h-[80vh] overflow-y-auto p-6 neon-border-blue relative cyber-scrollbar pr-2"
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                >
                  <button 
                    onClick={() => setActiveTab(null)}
                    className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5 rotate-180" />
                  </button>

                  <div className="mt-4">

                    {activeTab === 'support' && <SupportContent />}
                    {activeTab === 'privacy' && <PrivacyContent />}
                  </div>

                  <div className="mt-8">
                    <NeonButton 
                      onClick={() => setActiveTab(null)}
                      className="w-full"
                      variant="secondary"
                    >
                      Close Window
                    </NeonButton>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Delete Account - Danger Zone */}
          <Card className="cyber-surface p-6 neon-border-red border-2">
            <h3 className="mb-4 flex items-center gap-2 text-red-500">
              <Trash2 className="w-5 h-5" />
              Danger Zone
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-red-500 font-medium">Delete Account</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Permanently delete your account, all your decks, cards, and progress. This action cannot be undone.
                  </p>
                </div>
              </div>
              <NeonButton
                variant="destructive"
                onClick={onStartPurge}
                className="flex items-center gap-2 w-full justify-center group"
              >
                <Trash2 className="w-4 h-4 group-hover:animate-bounce" />
                TERMINATE ACCOUNT
              </NeonButton>
            </div>
          </Card>

          {/* App Info */}
          <Card className="cyber-surface p-6 neon-border-blue">
            <div className="text-center space-y-2">
              <div className="cyber-gradient w-12 h-12 rounded-full mx-auto flex items-center justify-center neon-glow-blue mb-4">
                <span className="text-white">FL</span>
              </div>
              <h4>FlashLearn</h4>
              <p className="text-sm text-muted-foreground">Version 1.2.2</p>
              <p className="text-xs text-muted-foreground">
                AI-Powered Flashcards for Smarter Learning
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* Reset Password Success Modal */}
      <AnimatePresence>
        {showResetModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="cyber-surface max-w-md w-full p-8 neon-border-blue text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--neon-blue)] to-[var(--neon-purple)]" />
              
              <div className="relative z-10">
                <div className="w-20 h-20 rounded-full bg-cyan-500/10 mx-auto flex items-center justify-center mb-6 neon-glow-blue border border-cyan-500/40">
                  <Mail className="w-10 h-10 text-[var(--neon-blue)]" />
                </div>
                
                <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-[var(--neon-blue)] to-[var(--neon-purple)] bg-clip-text text-transparent">
                  Recovery Sent
                </h3>
                
                <p className="text-white/80 text-base mb-8 leading-relaxed px-2">
                  A secure recovery link has been dispatched to:<br/>
                  <span className="text-[var(--neon-blue)] font-bold text-lg block my-3 p-3 rounded-lg bg-[var(--neon-blue)]/5 border border-[var(--neon-blue)]/20 break-all">
                    {user?.email}
                  </span>
                  Please verify your inbox and follow the instructions to secure your account.
                </p>
                
                <NeonButton 
                  onClick={() => setShowResetModal(false)}
                  className="w-full py-4 font-bold tracking-[0.2em] text-sm"
                  glowing={true}
                >
                  OKAY, GOT IT
                </NeonButton>
              </div>
              
              {/* Background Glows */}
              <div className="absolute -top-10 -left-10 w-48 h-48 bg-[var(--neon-purple)]/5 rounded-full blur-3xl" />
              <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-[var(--neon-blue)]/5 rounded-full blur-3xl" />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};