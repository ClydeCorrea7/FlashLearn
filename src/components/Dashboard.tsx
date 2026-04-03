import React, { useState } from 'react';
import { motion } from 'motion/react';
import { NeonButton } from './NeonButton';
import { AnimatedCard } from './AnimatedCard';
import { Progress } from './ui/progress';
import { Plus, BookOpen, Clock, TrendingUp, Zap, Brain, Trash2, MoreVertical, X, AlertTriangle, Layers } from 'lucide-react';

interface Deck {
  id: string;
  title: string;
  description: string;
  cardCount: number;
  masteredCount: number;
  lastStudied: string;
  dueCount: number;
}

interface DashboardProps {
  decks: Deck[];
  onCreateDeck: () => void;
  onOpenDeck: (deckId: string) => void;
  onOpenManual: () => void;
  onOpenStorage: () => void;
  onDeleteDeck?: (deckId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ decks, onCreateDeck, onOpenDeck, onOpenManual, onOpenStorage, onDeleteDeck }) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const totalCards = decks.reduce((sum, deck) => sum + deck.cardCount, 0);
  const totalMastered = decks.reduce((sum, deck) => sum + deck.masteredCount, 0);
  const overallProgress = totalCards > 0 ? (totalMastered / totalCards) * 100 : 0;

  const handleDeleteDeck = (deckId: string) => {
    if (onDeleteDeck) {
      onDeleteDeck(deckId);
    }
    setDeleteConfirm(null);
    setActiveMenu(null);
  };

  return (
    <div className="min-h-screen bg-background overflow-auto">
      <div className="max-w-6xl mx-auto p-4 pb-24">
        {/* Header with mobile-optimized spacing */}
        <motion.div
          className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h1 className="mb-2 bg-gradient-to-r from-[var(--neon-blue)] to-[var(--neon-purple)] bg-clip-text text-transparent">
              Your Decks
            </h1>
            <p className="text-muted-foreground text-sm font-medium">Continue your learning journey</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onOpenManual}
              className="flex items-center gap-2 px-4 py-2 border-2 border-border hover:border-cyan-500/50 hover:bg-cyan-500/10 rounded-lg transition-all group font-['Press_Start_2P'] text-[7px]"
            >
              <BookOpen className="w-4 h-4 text-foreground/50 group-hover:text-cyan-400" />
              <span className="hidden sm:inline text-foreground">SYSTEM_MANUAL</span>
            </button>
            <button
              onClick={onOpenStorage}
              className="flex items-center gap-2 px-4 py-2 border-2 border-border hover:border-purple-500/50 hover:bg-purple-500/10 rounded-lg transition-all group font-['Press_Start_2P'] text-[7px]"
            >
              <Layers className="w-4 h-4 text-foreground/50 group-hover:text-purple-400" />
              <span className="hidden sm:inline text-foreground">ARCHIVES</span>
            </button>
            <NeonButton
              onClick={onCreateDeck}
              className="flex items-center gap-2 w-full sm:w-auto justify-center"
              animate={true}
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Create New Deck</span>
              <span className="sm:hidden">Create Deck</span>
            </NeonButton>
          </div>
        </motion.div>

        {/* Overall Progress Card for Mobile */}
        <motion.div
          className="mb-6 sm:hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <AnimatedCard
            variant="cyber"
            className="p-4"
            glowing={true}
            delay={0.2}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-white" />
                <span className="text-white text-sm">Overall Mastery</span>
              </div>
              <div className="text-white text-lg">
                {Math.round(overallProgress)}%
              </div>
            </div>
            <Progress value={overallProgress} className="h-2 mb-2" />
            <div className="flex justify-between text-xs text-white/80">
              <span>{totalMastered} mastered</span>
              <span>{totalCards} total</span>
            </div>
          </AnimatedCard>
        </motion.div>

        {/* Stats Cards - mobile-optimized grid */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <AnimatedCard className="p-4 cyber-surface neon-border-blue" delay={0.1}>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-[var(--neon-blue)] mx-auto sm:mx-0" />
              <div className="text-center sm:text-left">
                <p className="text-xl sm:text-2xl">{decks.length}</p>
                <p className="text-muted-foreground text-xs sm:text-sm">
                  <span className="sm:hidden">Decks</span>
                  <span className="hidden sm:inline">Total Decks</span>
                </p>
              </div>
            </div>
          </AnimatedCard>

          <AnimatedCard className="p-4 cyber-surface neon-border-blue" delay={0.2}>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-[var(--neon-purple)] mx-auto sm:mx-0" />
              <div className="text-center sm:text-left">
                <p className="text-xl sm:text-2xl">{totalCards}</p>
                <p className="text-muted-foreground text-xs sm:text-sm">
                  <span className="sm:hidden">Cards</span>
                  <span className="hidden sm:inline">Total Cards</span>
                </p>
              </div>
            </div>
          </AnimatedCard>

          <AnimatedCard className="p-4 cyber-surface neon-border-blue col-span-2 sm:col-span-1" delay={0.3}>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-[var(--neon-cyan)] mx-auto sm:mx-0" />
              <div className="text-center sm:text-left flex-1">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <p className="text-xl sm:text-2xl">{totalMastered}</p>
                  <span className="hidden sm:inline text-sm text-[var(--neon-cyan)]">
                    ({Math.round(overallProgress)}%)
                  </span>
                </div>
                <p className="text-muted-foreground text-xs sm:text-sm">
                  Mastered
                </p>
              </div>
            </div>
          </AnimatedCard>
        </motion.div>



        {/* Decks Grid */}
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-lg font-medium text-foreground/80">Active Decks</h2>
        </div>

        {decks.length === 0 ? (
          <motion.div
            className="text-center py-12 sm:py-16"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <motion.div
              animate={{
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              <BookOpen className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mx-auto mb-4" />
            </motion.div>
            <h3 className="mb-2 text-lg sm:text-xl">No decks yet</h3>
            <p className="text-muted-foreground mb-6 text-sm px-4">
              Create your first deck to get started with AI-powered learning
            </p>
            <NeonButton
              onClick={onCreateDeck}
              animate={true}
              glowing={true}
              className="w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Deck
            </NeonButton>
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {decks.map((deck, index) => {
              const progress = deck.cardCount > 0 ? (deck.masteredCount / deck.cardCount) * 100 : 0;

              return (
                <motion.div
                  key={deck.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1, duration: 0.4 }}
                  className="relative"
                >
                  {/* Delete Confirmation Modal */}
                  {deleteConfirm === deck.id && (
                    <motion.div
                      className="absolute inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm rounded-xl"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <motion.div
                        className="bg-[var(--cyber-surface)] border border-red-500/30 rounded-xl p-6 max-w-sm mx-4 shadow-2xl shadow-red-500/20"
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-3 bg-red-500/10 rounded-full">
                            <AlertTriangle className="w-6 h-6 text-red-500" />
                          </div>
                          <div>
                            <h4 className="font-semibold">Delete Deck?</h4>
                            <p className="text-sm text-muted-foreground">
                              "{deck.title}"
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-6">
                          This action cannot be undone. All {deck.cardCount} cards will be permanently deleted.
                        </p>
                        <div className="flex gap-3">
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="flex-1 px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors text-sm"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleDeleteDeck(deck.id)}
                            className="flex-1 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors text-sm font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}

                  <AnimatedCard
                    className={`p-4 sm:p-6 cyber-surface transition-all ${deck.dueCount > 0 ? 'neon-border-magenta border-magenta-500/40' : 'neon-border-blue border-white/10'}`}
                    hover={true}
                    delay={index * 0.1}
                  >
                    {/* Due Badge */}
                    {deck.dueCount > 0 && (
                      <div className="absolute top-2 left-2 z-20">
                        <motion.div 
                          className="px-2 py-1 bg-magenta-500 text-white text-[8px] font-black uppercase rounded shadow-[0_0_10px_#ff00ff]"
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          {deck.dueCount} DUE
                        </motion.div>
                      </div>
                    )}
                    {/* Deck Actions Menu */}
                    <div className="absolute top-2 right-2 z-10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenu(activeMenu === deck.id ? null : deck.id);
                        }}
                        className="p-2 rounded-lg hover:bg-secondary/80 transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {/* Dropdown Menu */}
                      {activeMenu === deck.id && (
                        <motion.div
                          className="absolute right-0 top-10 bg-[var(--cyber-surface)] border border-[var(--border)] rounded-lg shadow-xl min-w-[160px] overflow-hidden"
                          initial={{ opacity: 0, scale: 0.95, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenDeck(deck.id);
                              setActiveMenu(null);
                            }}
                            className="w-full px-4 py-3 text-left text-sm hover:bg-secondary/80 transition-colors flex items-center gap-2"
                          >
                            <BookOpen className="w-4 h-4" />
                            Open
                          </button>
                          {onDeleteDeck && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteConfirm(deck.id);
                                setActiveMenu(null);
                              }}
                              className="w-full px-4 py-3 text-left text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          )}
                        </motion.div>
                      )}
                    </div>

                    {/* Click to open deck */}
                    <div onClick={() => onOpenDeck(deck.id)} className="cursor-pointer">
                      <div className="mb-4 pr-8">
                        <h3 className="mb-2 text-sm sm:text-base line-clamp-1">{deck.title}</h3>
                        <p className="text-muted-foreground text-xs sm:text-sm line-clamp-2">
                          {deck.description}
                        </p>
                      </div>

                      <div className="space-y-3">
                        {/* Mobile-optimized progress display */}
                        <div className="flex justify-between items-center text-xs sm:text-sm">
                          <span className="flex items-center gap-1">
                            <Zap className="w-3 h-3 text-[var(--neon-blue)]" />
                            <span className="hidden sm:inline">Progress</span>
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-[var(--neon-blue)]">
                              {deck.masteredCount}/{deck.cardCount}
                            </span>
                            <span className="text-[var(--neon-purple)] font-mono">
                              {Math.round(progress)}%
                            </span>
                          </div>
                        </div>

                        <Progress value={progress} className="h-1.5 sm:h-2" />

                        {/* Mobile-optimized metadata */}
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{deck.cardCount} cards</span>
                          <span className="truncate max-w-[120px] sm:max-w-none">
                            {deck.lastStudied === 'Never' ? 'New' : 'Recent'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </AnimatedCard>
                </motion.div>
              );
            })}

            {/* Storage Portal Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + decks.length * 0.1, duration: 0.4 }}
              onClick={onOpenStorage}
              className="cursor-pointer"
            >
              <AnimatedCard
                className="h-full p-6 cyber-surface border-dashed border-2 border-purple-500/30 hover:border-purple-500/60 hover:bg-purple-500/5 transition-all flex flex-col items-center justify-center text-center group"
                hover={true}
              >
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 group-hover:neon-glow-purple transition-all">
                  <Layers className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-sm font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent uppercase tracking-wider mb-2">Deck Storage</h3>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-['Press_Start_2P'] leading-relaxed">
                  Manage Archives & <br/> Neural Merging
                </p>
              </AnimatedCard>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
