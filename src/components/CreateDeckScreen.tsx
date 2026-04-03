import React, { useState } from 'react';
import { motion } from 'motion/react';
import { NeonButton } from './NeonButton';
import { AnimatedCard } from './AnimatedCard';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { ArrowLeft, Sparkles, Loader2, Brain, Zap, Plus, FileText, Upload, File } from 'lucide-react';

interface CreateDeckScreenProps {
  onBack: () => void;
  onCreateDeck: (title: string, description: string, cards: Array<{front: string, back: string}>, mode?: 'static' | 'dynamic' | 'mcq') => void;
  onCreateDeckWithAI?: (topic: string, cardCount: number, mode?: 'static' | 'dynamic' | 'mcq') => void;
  onStartDynamicSession?: () => void;
  onOpenNotes?: () => void;
}


export const CreateDeckScreen: React.FC<CreateDeckScreenProps> = ({ 
  onBack, 
  onCreateDeck, 
  onCreateDeckWithAI,
  onStartDynamicSession,
  onOpenNotes
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [cardCount, setCardCount] = useState(10);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedMode, setSelectedMode] = useState<'static' | 'mcq' | 'dynamic'>('static');
  const [creationType, setCreationType] = useState<'selection' | 'flashcards' | 'notes'>('selection');


  const handleGenerateWithAI = async () => {
    if (selectedMode !== 'dynamic' && !title.trim()) return;
    
    if (selectedMode === 'dynamic' && onStartDynamicSession) {
      onStartDynamicSession();
      return;
    }

    if (!onCreateDeckWithAI) return;
    
    setIsGenerating(true);
    try {
      await onCreateDeckWithAI(title.trim(), cardCount, selectedMode);
    } catch (error) {
      console.error('AI generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };


  const handleCreateEmptyDeck = () => {
    if (selectedMode === 'dynamic') return;
    const deckTitle = title.trim() || `My Deck ${new Date().toLocaleDateString()}`;
    onCreateDeck(deckTitle, description, [], selectedMode);
  };



  const cardCountOptions = [5, 10, 15];

  // Check if any generation is in progress
  const isBusy = isGenerating;

  if (creationType === 'selection') {
    return (
      <div className="min-h-screen bg-background overflow-auto p-6 flex flex-col items-center justify-center space-y-12 pb-32">
        <motion.div 
          className="text-center space-y-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-black bg-gradient-to-r from-[var(--neon-blue)] to-[var(--neon-purple)] bg-clip-text text-transparent uppercase tracking-[0.2em] font-['Press_Start_2P']">
            Genesis Hub
          </h1>
          <p className="text-[8px] text-muted-foreground uppercase tracking-widest font-['Press_Start_2P']">
            Select Generation Protocol
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 w-full max-w-sm">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <AnimatedCard 
              variant="neon" 
              className="p-8 cursor-pointer group hover:neon-border-blue transition-all"
              onClick={() => setCreationType('flashcards')}
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-4 bg-[var(--neon-blue)]/20 rounded-2xl group-hover:neon-glow-blue transition-all">
                  <Plus className="w-10 h-10 text-[var(--neon-blue)]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Neural Flashcards</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">Generate AI-powered decks, MCQs, and adaptive learning sessions.</p>
                </div>
              </div>
            </AnimatedCard>
          </motion.div>

          <motion.div
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.2 }}
          >
            <AnimatedCard 
              variant="neon" 
              className="p-8 cursor-pointer group hover:neon-border-purple transition-all"
              onClick={() => {
                if (onOpenNotes) onOpenNotes();
              }}
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-4 bg-[var(--neon-purple)]/20 rounded-2xl group-hover:neon-glow-purple transition-all">
                  <FileText className="w-10 h-10 text-[var(--neon-purple)]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Neural Notes</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">Turn topics into high-fidelity academic notes and structured exports.</p>
                </div>
              </div>
            </AnimatedCard>
          </motion.div>
        </div>

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-auto">
      {/* Mobile-optimized container */}
      <div className="max-w-2xl mx-auto p-4 pb-24">
        {/* Header with improved mobile spacing */}
        <motion.div 
          className="flex items-center gap-3 mb-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <motion.button 
            onClick={() => setCreationType('selection')}
            className="p-3 rounded-xl hover:bg-secondary/50 transition-colors touch-manipulation"
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <h1 className="text-lg sm:text-xl bg-gradient-to-r from-[var(--neon-blue)] to-[var(--neon-purple)] bg-clip-text text-transparent">
            Flashcard Generation
          </h1>
        </motion.div>

        {/* Main Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <AnimatedCard 
            variant="neon" 
            className="p-6 mb-6"
            delay={0.2}
          >
            <div className="space-y-6">
              {/* Mode Selection */}
              <div>
                <label className="block mb-3 text-sm">
                  Learning Methodology
                </label>
                <div className="flex bg-secondary/30 p-1 rounded-xl border border-border/50 backdrop-blur-sm">
                  {(['static', 'mcq', 'dynamic'] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setSelectedMode(m)}
                      className={`
                        flex-1 px-4 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all
                        ${selectedMode === m 
                          ? 'bg-[var(--neon-blue)] text-white shadow-[0_0_15px_rgba(0,210,255,0.3)]' 
                          : 'text-muted-foreground hover:text-white hover:bg-white/5'
                        }
                      `}
                    >
                      {m}
                    </button>
                  ))}
                </div>
                {selectedMode === 'dynamic' && (
                  <p className="mt-2 text-xs text-purple-400">
                    No decks. No flashcards. Just drop in a topic and let our adaptive AI tutor guide you through personalized, real-time training.
                  </p>
                )}
                {selectedMode === 'mcq' && (
                  <p className="mt-2 text-xs text-magenta-400">
                    Create multiple-choice questions. AI will automatically generate dynamic distractors for you during your study sessions.
                  </p>
                )}
              </div>

              {selectedMode !== 'dynamic' && (
                <>
                  {/* Title Input */}
                  <div>
                    <label className="block mb-3 text-sm">
                      Deck Title
                    </label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., JavaScript Fundamentals, Spanish Vocabulary..."
                      className="cyber-surface neon-border-blue focus:neon-glow-blue transition-all duration-300 text-sm py-3"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block mb-3 text-sm">
                      Description (Optional)
                    </label>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe what this deck covers..."
                      className="cyber-surface neon-border-blue focus:neon-glow-blue transition-all duration-300 min-h-[80px] text-sm resize-none"
                    />
                  </div>

                  {/* Card Count Selector for AI */}
                  {onCreateDeckWithAI && (
                    <div>
                      <label className="block mb-3 text-sm">
                        Number of Cards to Generate
                      </label>
                      <div className="grid grid-cols-5 gap-2">
                        {cardCountOptions.map((count) => (
                          <motion.button
                            key={count}
                            onClick={() => setCardCount(count)}
                            className={`py-2 px-3 rounded-lg text-sm transition-all duration-200 ${
                              cardCount === count
                                ? 'cyber-gradient text-white neon-glow-blue'
                                : 'cyber-surface neon-border-blue hover:bg-secondary/50'
                            }`}
                            whileTap={{ scale: 0.95 }}
                            whileHover={{ scale: 1.05 }}
                          >
                            {count}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </AnimatedCard>
        </motion.div>

        {/* AI Generation Info Card */}
        {onCreateDeckWithAI && selectedMode !== 'dynamic' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <AnimatedCard 
              variant="cyber" 
              className="p-6 mb-6 bg-secondary/50 border-border"
              delay={0.3}
              glowing={true}
            >
              <div className="flex items-start gap-4">
                <motion.div
                  className="flex-shrink-0"
                  animate={{ 
                    rotate: [0, 360],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    rotate: { duration: 4, repeat: Infinity, ease: 'linear' },
                    scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
                  }}
                >
                  <Brain className="w-6 h-6 text-white" />
                </motion.div>
                <div className="flex-1">
                  <h4 className="text-sm mb-2 text-white flex items-center gap-2">
                    AI-Powered Generation
                    <Sparkles className="w-4 h-4" />
                  </h4>
                  <p className="text-xs text-white/80 leading-relaxed">
                    Our AI will automatically create {cardCount} {selectedMode === 'mcq' ? 'multiple-choice ' : ''}flashcards based on your topic. 
                    You can edit and customize them after generation.
                  </p>
                  
                  {/* Features list */}
                  <div className="mt-3 space-y-1">
                    {[
                      selectedMode === 'mcq' ? 'Multiple-choice generation' : 'Smart question generation',
                      selectedMode === 'mcq' ? 'Dynamic options' : 'Contextual answers',
                      'Difficulty progression'
                    ].map((feature, index) => (
                      <motion.div
                        key={feature}
                        className="flex items-center gap-2 text-xs text-white/70"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                      >
                        <Zap className="w-3 h-3" />
                        {feature}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </AnimatedCard>
          </motion.div>
        )}


        {/* Action Buttons */}
        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          {/* AI Generation / Dynamic Start Button */}
          {onCreateDeckWithAI && (
            <NeonButton
              onClick={handleGenerateWithAI}
              disabled={(selectedMode !== 'dynamic' && !title.trim()) || isBusy}
              className="w-full py-4 flex items-center justify-center gap-3 text-sm"
              animate={true}
              glowing={!isBusy && (selectedMode === 'dynamic' || !!title.trim())}
            >
              {isBusy ? (
                <motion.div
                  className="flex items-center gap-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing...</span>
                </motion.div>
              ) : (
                <motion.div
                  className="flex items-center gap-3"
                  whileHover={{ scale: 1.02 }}
                >
                  <Brain className="w-5 h-5" />
                  <span>{selectedMode === 'dynamic' ? 'Start Dynamic AI Session' : `Generate ${cardCount} ${selectedMode === 'mcq' ? 'MCQ ' : ''}Cards with AI`}</span>
                  <Sparkles className="w-4 h-4" />
                </motion.div>
              )}
            </NeonButton>
          )}
          
          {/* Manual Creation Section (Hidden if Dynamic Mode) */}
          {selectedMode !== 'dynamic' && (
            <>
              {/* Divider */}
              <div className="flex items-center gap-4 py-2">
                <div className="flex-1 h-px bg-white/10"></div>
                <span className="text-xs text-white/40 uppercase tracking-wider">or</span>
                <div className="flex-1 h-px bg-white/10"></div>
              </div>
              
              {/* Manual Creation Button */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <NeonButton
                  variant="secondary"
                  onClick={handleCreateEmptyDeck}
                  disabled={isBusy}
                  className="w-full py-5 flex items-center justify-center gap-3 text-sm bg-white/5 border-white/10 hover:bg-white/10"
                  animate={true}
                >
                  <motion.div
                    className="flex items-center gap-3"
                    whileHover={{ scale: 1.02 }}
                  >
                    <Plus className="w-5 h-5" />
                    <div className="flex flex-col items-start">
                      <span>{selectedMode === 'mcq' ? 'Create Empty MCQ Deck' : 'Create Empty Deck'}</span>
                      <span className="text-xs text-white/50">Add cards manually later</span>
                    </div>
                  </motion.div>
                </NeonButton>
              </motion.div>
            </>
          )}
          
          {/* Help text */}
            <motion.p 
              className="text-xs text-center text-muted-foreground px-4 leading-relaxed mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              Choose an option above to create your flashcard deck
            </motion.p>
        </motion.div>
      </div>
    </div>
  );
};
