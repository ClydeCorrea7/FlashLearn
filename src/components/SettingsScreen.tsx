import React from 'react';
import { Card } from './ui/card';
import { Switch } from './ui/switch';
import { NeonButton } from './NeonButton';
import { ArrowLeft, Moon, Sun, Bell, User, Shield, HelpCircle, LogOut, Trash2, AlertTriangle, ChevronRight, Copy, CheckCircle2, BookOpen, Mail, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from './ThemeProvider';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { DeleteAccountModule } from './DeleteAccountModule';

interface SettingsScreenProps {
  onBack: () => void;
  onSignOut: () => void;
  onStartPurge: () => void;
  user?: any;
  isDeleting?: boolean;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ 
  onBack, 
  onSignOut, 
  onStartPurge, 
  user, 
  isDeleting = false 
}) => {
  const [activeTab, setActiveTab] = useState<string | null>(null);
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

  const ManualContent = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 p-4 rounded-xl bg-[var(--neon-blue)]/10 border border-[var(--neon-blue)]/20">
        <div className="p-2 bg-[var(--neon-blue)]/20 rounded-lg">
          <BookOpen className="w-5 h-5 text-[var(--neon-blue)]" />
        </div>
        <div>
          <h3 className="font-bold text-[var(--neon-blue)]">User Manual</h3>
          <p className="text-xs text-white/50 uppercase tracking-widest font-['Press_Start_2P']">Card Generation</p>
        </div>
      </div>

      <div className="space-y-4">
        {[
          { step: 1, title: 'Enter a Topic', text: 'On the Create Deck screen, enter the subject you want to learn (e.g., "Quantum Physics").' },
          { step: 2, title: 'Select Capacity', text: 'Choose how many cards you want the AI to generate (5, 10, or 15 cards).' },
          { step: 3, title: 'Generate', text: 'Tap "Generate with AI". Our engine will research the topic and build high-quality flashcards.' },
          { step: 4, title: 'Review & Save', text: 'Your new deck will appear instantly. You can edit any card to add personal notes or images.' }
        ].map((item) => (
          <div key={item.step} className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 font-bold text-[var(--neon-blue)]">
              {item.step}
            </div>
            <div>
              <p className="font-bold text-sm mb-1">{item.title}</p>
              <p className="text-sm text-white/60 leading-relaxed">{item.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

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

  const ChangelogContent = () => {
    const [openVersion, setOpenVersion] = useState<string | null>('1.2.1');
    
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
          <div className="p-2 bg-cyan-500/20 rounded-lg">
            <BookOpen className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="font-bold text-cyan-400 text-lg">System Logs</h3>
            <p className="text-[9px] text-white/40 uppercase tracking-[0.2em] font-['Press_Start_2P']">Release Registry</p>
          </div>
        </div>

        <div className="space-y-3">
          {[
            { version: '1.2.1', description: 'Dynamic Learning Stability', changes: ['Deep UI Polishing for Dynamic Sessions', 'Fixed Input Box/Keyboard overlap on mobile', 'Added Gradient Styling to Session Headers', 'Stability and HMR persistence improvements'] },
            { version: '1.2.0', description: 'Dynamic Learning Engine', changes: ['AI Dynamic Learning Sessions introduced', 'PDF Transcript Export for tutoring', 'Adaptive Personality for AI Tutor', 'Real-time Round Tracking'] },
            { version: '1.1.1', description: 'AI Core Refinement', changes: ['Performance optimization for Supabase calls', 'Fixed AI Generation timeout issues', 'General Stability Refinement'] },
            { version: '1.1.0', description: 'MCQ & Progress', changes: ['MCQ Mode implemented with AI distractors', 'Mastered Status Persistence logic', 'Standardized Deck Naming Convention'] },
            { version: '1.0.0', description: 'Initial Launch', changes: ['Initial Release', 'AI Core Flashcard Generation', 'Cyber-Aesthetic Dashboard UI'] }
          ].map((release) => (
            <div key={release.version} className={`rounded-xl border transition-all duration-300 overflow-hidden ${openVersion === release.version ? 'bg-white/10 border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.1)]' : 'bg-white/5 border-white/10 hover:bg-white/[0.07]'}`}>
              <button 
                onClick={() => setOpenVersion(openVersion === release.version ? null : release.version)}
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-cyan-400 font-bold text-sm">v{release.version}</span>
                    <span className="w-1 h-1 rounded-full bg-white/20" />
                    <span className="text-xs text-white/60 font-medium">{release.description}</span>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 text-white/20 transition-transform duration-300 ${openVersion === release.version ? 'rotate-90 text-cyan-400' : ''}`} />
              </button>
              
              <AnimatePresence>
                {openVersion === release.version && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  >
                    <div className="px-5 pb-5 border-t border-white/5 pt-4">
                      <ul className="space-y-3">
                        {release.changes.map((change, i) => (
                          <li key={i} className="text-xs text-white/50 flex items-start gap-3 leading-relaxed">
                            <span className="w-1 h-1 rounded-full bg-cyan-500/50 mt-1.5 shrink-0" />
                            {change}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    );
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
                onClick={() => setActiveTab('manual')}
                className="w-full text-left p-3 rounded-lg hover:bg-secondary/20 transition-colors flex justify-between items-center group"
              >
                <div>
                  <p className="group-hover:text-[var(--neon-blue)] transition-colors">How to Use FlashLearn</p>
                  <p className="text-sm text-muted-foreground">Learn about features and best practices</p>
                </div>
                <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-[var(--neon-blue)]" />
              </button>
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
                onClick={() => setActiveTab('changelog')}
                className="w-full text-left p-3 rounded-lg hover:bg-secondary/20 transition-colors flex justify-between items-center group"
              >
                <div>
                  <p className="group-hover:text-[var(--neon-blue)] transition-colors">Change Logs</p>
                  <p className="text-sm text-muted-foreground">See what's new in v1.2.1</p>
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
                    {activeTab === 'manual' && <ManualContent />}
                    {activeTab === 'support' && <SupportContent />}
                    {activeTab === 'privacy' && <PrivacyContent />}
                    {activeTab === 'changelog' && <ChangelogContent />}
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
              <p className="text-sm text-muted-foreground">Version 1.2.1</p>
              <p className="text-xs text-muted-foreground">
                AI-Powered Flashcards for Smarter Learning
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};