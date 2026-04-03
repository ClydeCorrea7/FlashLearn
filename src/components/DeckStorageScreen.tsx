import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Layers, 
  Trash2, 
  Merge, 
  Search, 
  Filter, 
  Clock, 
  BookOpen, 
  AlertTriangle,
  CheckCircle2,
  X,
  Plus,
  Zap,
  MoreVertical
} from 'lucide-react';
import { AnimatedCard } from './AnimatedCard';
import { NeonButton } from './NeonButton';
import { Progress } from './ui/progress';
import { cn } from './ui/utils';

interface Deck {
  id: string;
  title: string;
  description: string;
  cardCount: number;
  masteredCount: number;
  type: string;
  lastStudied: string;
  dueCount: number;
}

interface DeckStorageScreenProps {
  decks: Deck[];
  onBack: () => void;
  onMergeDecks: (deckId1: string, deckId2: string, title: string, description: string) => Promise<void>;
  onDeleteDeck?: (deckId: string) => void;
  onOpenDeck: (deckId: string) => void;
}

export const DeckStorageScreen: React.FC<DeckStorageScreenProps> = ({ 
  decks, 
  onBack, 
  onMergeDecks,
  onDeleteDeck,
  onOpenDeck
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'static' | 'mcq'>('all');
  const [selectedForMerge, setSelectedForMerge] = useState<string[]>([]);
  const [isMerging, setIsMerging] = useState(false);
  const [mergeDetails, setMergeDetails] = useState({ title: '', description: '' });

  const filteredDecks = decks.filter(deck => {
    const matchesSearch = deck.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         deck.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || deck.type.toLowerCase() === filterType;
    return matchesSearch && matchesFilter;
  });

  const handleSelectDeck = (deckId: string) => {
    if (selectedForMerge.includes(deckId)) {
      setSelectedForMerge(prev => prev.filter(id => id !== deckId));
    } else {
      if (selectedForMerge.length < 2) {
        setSelectedForMerge(prev => [...prev, deckId]);
      }
    }
  };

  const executeMerge = async () => {
    if (selectedForMerge.length !== 2) return;
    if (!mergeDetails.title.trim()) {
      alert('Please enter a title for the merged deck');
      return;
    }

    setIsMerging(true);
    try {
      await onMergeDecks(
        selectedForMerge[0], 
        selectedForMerge[1], 
        mergeDetails.title, 
        mergeDetails.description || `Merged from existing decks on ${new Date().toLocaleDateString()}`
      );
      setSelectedForMerge([]);
      setMergeDetails({ title: '', description: '' });
    } catch (error) {
      console.error('Merge failed:', error);
    } finally {
      setIsMerging(false);
    }
  };

  const selectedDecks = decks.filter(d => selectedForMerge.includes(d.id));
  const typesMatch = selectedDecks.length === 2 && selectedDecks[0].type === selectedDecks[1].type;

  return (
    <div className="min-h-screen bg-background overflow-x-hidden pt-6 pb-24 px-4">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-[0.05] dark:opacity-20 transition-opacity">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-[var(--neon-blue)] rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--neon-purple)] rounded-full blur-[120px] animate-pulse" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <motion.div 
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 rounded-full hover:bg-secondary/50 transition-colors border border-border"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl uppercase tracking-[0.2em] font-['Press_Start_2P'] bg-gradient-to-r from-[var(--neon-blue)] to-[var(--neon-purple)] bg-clip-text text-transparent">
                Deck Storage
              </h1>
              <p className="text-[8px] sm:text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-['Press_Start_2P'] mt-2">
                Archives & Neural Merging
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative group flex-1 sm:flex-none sm:min-w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-[var(--neon-blue)] transition-colors" />
              <input 
                type="text"
                placeholder="SEARCH ARCHIVES..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-secondary/30 border border-border/50 rounded-xl py-2 pl-10 pr-4 text-xs font-mono focus:outline-none focus:border-[var(--neon-blue)] focus:ring-1 focus:ring-[var(--neon-blue)]/30 transition-all uppercase tracking-widest"
              />
            </div>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="bg-secondary/30 border border-border/50 rounded-xl px-4 py-2 text-[10px] font-mono tracking-widest focus:outline-none focus:border-[var(--neon-blue)] transition-all uppercase cursor-pointer"
            >
              <option value="all">ALL_TYPES</option>
              <option value="static">STATIC</option>
              <option value="mcq">MCQ</option>
            </select>
          </div>
        </motion.div>

        {/* Selected for Merge Bar */}
        <AnimatePresence>
          {selectedForMerge.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mb-8 p-4 bg-[var(--neon-blue)]/5 border border-[var(--neon-blue)]/30 rounded-2xl backdrop-blur-md"
            >
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto">
                  <div className="flex items-center gap-2 shrink-0">
                    <Merge className="w-5 h-5 text-[var(--neon-blue)] animate-pulse" />
                    <span className="text-[10px] font-['Press_Start_2P'] uppercase text-foreground">Merge Mode:</span>
                  </div>
                  
                  {selectedDecks.map(deck => (
                    <div key={deck.id} className="flex items-center gap-2 bg-[var(--neon-blue)]/20 px-3 py-1.5 rounded-lg border border-[var(--neon-blue)]/50 shrink-0">
                      <span className="text-xs font-bold text-foreground max-w-[120px] truncate">{deck.title}</span>
                      <button onClick={() => handleSelectDeck(deck.id)}><X className="w-3 h-3 text-red-400" /></button>
                    </div>
                  ))}

                  {selectedForMerge.length < 2 && (
                    <div className="flex items-center gap-2 border border-dashed border-muted-foreground/30 px-3 py-1.5 rounded-lg animate-pulse shrink-0">
                      <Plus className="w-3 h-3 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground tracking-widest uppercase">Select another deck</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  {selectedForMerge.length === 2 && (
                    <div className="flex-1 sm:flex-none">
                      {!typesMatch ? (
                        <div className="text-red-400 text-[8px] font-bold uppercase tracking-widest bg-red-400/10 px-3 py-2 rounded-lg border border-red-400/20 flex items-center gap-2">
                          <AlertTriangle className="w-3 h-3" />
                          Type Mismatch: Select two same-type decks
                        </div>
                      ) : (
                        <div className="flex gap-2">
                           <input 
                            type="text"
                            placeholder="NEW_DECK_TITLE"
                            value={mergeDetails.title}
                            onChange={(e) => setMergeDetails({...mergeDetails, title: e.target.value.toUpperCase()})}
                            className="bg-background/80 border border-[var(--neon-blue)]/30 rounded-lg px-3 py-1.5 text-[10px] font-mono tracking-widest focus:outline-none focus:border-[var(--neon-blue)] w-full sm:w-[180px]"
                          />
                          <NeonButton 
                            onClick={executeMerge}
                            size="sm"
                            className="shrink-0"
                            animate={true}
                          >
                            SYNTHESIZE
                          </NeonButton>
                        </div>
                      )}
                    </div>
                  )}
                  <button 
                    onClick={() => setSelectedForMerge([])}
                    className="text-[8px] text-muted-foreground uppercase tracking-widest font-bold underline decoration-dashed"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Decks Grid */}
        {filteredDecks.length === 0 ? (
          <div className="text-center py-24 border-2 border-dashed border-border rounded-3xl opacity-50">
            <Layers className="w-16 h-16 text-muted-foreground mx-auto mb-6 opacity-20" />
            <h3 className="text-xl font-['Press_Start_2P'] uppercase text-muted-foreground">Empty Archives</h3>
            <p className="text-xs text-muted-foreground mt-4 tracking-widest uppercase">No neural signatures detected</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDecks.map((deck, index) => {
              const isSelected = selectedForMerge.includes(deck.id);
              const isOtherType = selectedForMerge.length > 0 && selectedDecks[0]?.type !== deck.type;
              const progress = deck.cardCount > 0 ? (deck.masteredCount / deck.cardCount) * 100 : 0;

              return (
                <motion.div
                  key={deck.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleSelectDeck(deck.id)}
                  className="cursor-pointer"
                >
                  <AnimatedCard
                    className={cn(
                      "p-4 sm:p-6 transition-all duration-300 relative group overflow-hidden cyber-surface border-2",
                      isSelected ? "neon-border-blue ring-2 ring-[var(--neon-blue)]/50" : (deck.dueCount > 0 ? 'neon-border-magenta border-magenta-500/40' : 'neon-border-blue border-white/10'),
                      isOtherType && !isSelected && "opacity-40 grayscale"
                    )}
                    glowing={isSelected}
                    hover={true}
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

                    {/* Select Badge */}
                    <AnimatePresence>
                      {isSelected && (
                        <motion.div 
                          className="absolute top-2 right-2 z-30"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                        >
                          <div className="bg-[var(--neon-blue)] text-black p-1.5 rounded-lg shadow-[0_0_15px_rgba(59,130,246,0.6)]">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {!isSelected && (
                       <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 rounded-lg hover:bg-secondary/80 transition-colors">
                          <MoreVertical className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </div>
                    )}

                    <div className="mb-4 pr-8">
                       <div className={cn(
                        "text-[8px] font-['Press_Start_2P'] uppercase px-2 py-1 rounded bg-secondary/50 inline-block mb-3",
                        deck.type.toLowerCase() === 'mcq' ? "text-[var(--neon-purple)]" : "text-[var(--neon-blue)]"
                      )}>
                        {deck.type}
                      </div>
                      <h3 className="text-sm sm:text-base font-bold mb-2 group-hover:text-[var(--neon-blue)] transition-colors line-clamp-1 truncate text-foreground">
                        {deck.title}
                      </h3>
                      <p className="text-[10px] sm:text-xs text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
                        {deck.description || "Experimental neural learning module."}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-[10px] sm:text-xs">
                        <span className="flex items-center gap-1">
                          <Zap className="w-3 h-3 text-[var(--neon-blue)]" />
                          <span className="hidden sm:inline font-bold uppercase tracking-widest text-muted-foreground">Neural Sync</span>
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[var(--neon-blue)] font-bold">
                            {deck.masteredCount}/{deck.cardCount}
                          </span>
                          <span className="text-[var(--neon-purple)] font-mono font-bold">
                            {Math.round(progress)}%
                          </span>
                        </div>
                      </div>

                      <Progress value={progress} className="h-1.5 sm:h-2" />

                      <div className="flex justify-between text-[10px] text-muted-foreground pt-1">
                        <span className="font-bold uppercase tracking-widest">{deck.cardCount} Signatures</span>
                        <span className="font-bold uppercase tracking-widest">
                          {deck.lastStudied === 'Never' ? 'NEW_ASSET' : 'RECENT'}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4 pt-4 border-t border-border/50 justify-end">
                       <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenDeck(deck.id);
                        }}
                        className="p-2 rounded-lg hover:bg-[var(--neon-blue)]/10 text-muted-foreground hover:text-[var(--neon-blue)] transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest"
                      >
                        <BookOpen className="w-4 h-4" />
                        <span className="hidden sm:inline">Inspect</span>
                      </button>
                      {onDeleteDeck && (
                         <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('Initiate terminal deletion? This neural pattern will be permanently erased.')) {
                              onDeleteDeck(deck.id);
                            }
                          }}
                          className="p-2 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="hidden sm:inline">Scrub</span>
                        </button>
                      )}
                    </div>

                    {/* Scan Line Decor */}
                    <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--neon-blue)]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity animate-scan-line" />
                  </AnimatedCard>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
