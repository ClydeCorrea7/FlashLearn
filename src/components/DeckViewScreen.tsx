import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NeonButton } from './NeonButton';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { ArrowLeft, Play, Plus, Edit2, Trash2, Check, X, Save, AlertTriangle, FileText, ListChecks } from 'lucide-react';
import { DeckImportExport } from './DeckImportExport';

interface Flashcard {
  id: string;
  front: string;
  back: string;
  mastered: boolean;
}

interface Deck {
  id: string;
  title: string;
  description: string;
  cards: Flashcard[];
  preferredMode: import('../utils/supabase/client').LearningMode;
  dueCount: number;
}

interface DeckViewScreenProps {
  deck: Deck;
  onBack: () => void;
  onStartStudy: (deckId: string) => void;
  onUpdateDeck: (deck: Deck) => void;
  onDeleteDeck: (deckId: string) => void;
}

export const DeckViewScreen: React.FC<DeckViewScreenProps> = ({ 
  deck, 
  onBack, 
  onStartStudy, 
  onUpdateDeck,
  onDeleteDeck
}) => {
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [editedFront, setEditedFront] = useState('');
  const [editedBack, setEditedBack] = useState('');
  const [newCardFront, setNewCardFront] = useState('');
  const [newCardBack, setNewCardBack] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);

  const masteredCount = deck.cards.filter(card => card.mastered).length;
  const progress = deck.cards.length > 0 ? (masteredCount / deck.cards.length) * 100 : 0;

  const handleAddCard = () => {
    if (!newCardFront.trim() || !newCardBack.trim()) return;
    
    const newCard: Flashcard = {
      id: Date.now().toString(),
      front: newCardFront,
      back: newCardBack,
      mastered: false
    };
    
    onUpdateDeck({
      ...deck,
      cards: [...deck.cards, newCard]
    });
    
    setNewCardFront('');
    setNewCardBack('');
  };

  const handleStartEditCard = (card: Flashcard) => {
    setEditingCardId(card.id);
    setEditedFront(card.front);
    setEditedBack(card.back);
  };

  const handleSaveEditCard = () => {
    if (!editingCardId || !editedFront.trim() || !editedBack.trim()) return;
    
    onUpdateDeck({
      ...deck,
      cards: deck.cards.map(card => 
        card.id === editingCardId
          ? { ...card, front: editedFront, back: editedBack }
          : card
      )
    });
    
    setEditingCardId(null);
    setEditedFront('');
    setEditedBack('');
  };

  const handleCancelEdit = () => {
    setEditingCardId(null);
    setEditedFront('');
    setEditedBack('');
  };

  const handleDeleteCard = (cardId: string) => {
    onUpdateDeck({
      ...deck,
      cards: deck.cards.filter(card => card.id !== cardId)
    });
  };

  return (
    <div className="min-h-screen bg-background overflow-auto">
      <div className="max-w-4xl mx-auto p-4 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="p-2 rounded-lg hover:bg-secondary transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-[var(--neon-blue)] to-[var(--neon-purple)] bg-clip-text text-transparent">
                  {deck.title}
                </h1>
                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter border ${
                  deck.preferredMode === 'mcq' 
                    ? 'bg-magenta-500/10 border-magenta-500/30 text-magenta-500' 
                    : 'bg-blue-500/10 border-blue-500/30 text-blue-500'
                }`}>
                  {deck.preferredMode === 'mcq' ? 'MCQ Deck' : 'Static Deck'}
                </span>
              </div>
              <p className="text-muted-foreground text-sm line-clamp-1">{deck.description}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <NeonButton 
              onClick={() => onStartStudy(deck.id)}
              animate={true}
              glowing={true}
              size="sm"
              className="flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              <Play className="w-4 h-4" />
              <span>Study Now</span>
            </NeonButton>
          </div>
        </div>


        {/* Stats & Actions Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-8">
          <div className="flex-1">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Deck Mastery</span>
              <span className="text-sm text-[var(--neon-blue)]">{Math.round(progress)}%</span>
            </div>
            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-[var(--neon-blue)] to-[var(--neon-purple)]"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1 }}
              />
            </div>
            <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
              <span>{deck.cards.length} Total Cards</span>
              <span>{masteredCount} Mastered</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <DeckImportExport 
              title="PORTABILITY"
              onExport={() => ({
                title: deck.title,
                description: deck.description,
                cards: deck.cards.map(c => ({ front: c.front, back: c.back }))
              })}
            />
            <button 
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors border border-red-500/20"
              title="Delete Deck"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Add Card Section */}
        <AnimatePresence>
          {showAddCard ? (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8 p-6 rounded-2xl cyber-surface neon-border-blue"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg">Create New Card</h3>
                <button onClick={() => setShowAddCard(false)}>
                  <X className="w-5 h-5 text-muted-foreground hover:text-white" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-muted-foreground uppercase mb-1 block">
                    {deck.preferredMode === 'mcq' ? 'Question' : 'Front (Question)'}
                  </label>
                  <Input 
                    value={newCardFront}
                    onChange={(e) => setNewCardFront(e.target.value)}
                    placeholder="Enter the question..."
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground uppercase mb-1 block">
                    {deck.preferredMode === 'mcq' ? 'Correct Answer' : 'Back (Answer)'}
                  </label>
                  <Textarea 
                    value={newCardBack}
                    onChange={(e) => setNewCardBack(e.target.value)}
                    placeholder={deck.preferredMode === 'mcq' ? "Enter the correct answer..." : "Enter the answer..."}
                  />
                </div>
                <div className="flex gap-3">
                  <NeonButton onClick={handleAddCard} className="flex-1">
                    Add Card
                  </NeonButton>
                  <button 
                    onClick={() => setShowAddCard(false)}
                    className="flex-1 bg-secondary hover:bg-secondary/80 rounded-xl transition-colors text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <button 
              onClick={() => setShowAddCard(true)}
              className="w-full py-4 border-2 border-dashed border-white/10 rounded-2xl text-muted-foreground hover:text-white hover:border-[var(--neon-blue)]/50 transition-all flex items-center justify-center gap-2 mb-8 group"
            >
              <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Add New Card
            </button>
          )}
        </AnimatePresence>

        {/* Cards List */}
        <div className="grid grid-cols-1 gap-4 mb-8">
          {deck.cards.map((card) => (
            <Card key={card.id} className="p-4 sm:p-6 cyber-surface border-white/10">
              {editingCardId === card.id ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-muted-foreground uppercase mb-1 block text-left">
                      {deck.preferredMode === 'mcq' ? 'Question' : 'Front'}
                    </label>
                    <Input 
                      value={editedFront}
                      onChange={(e) => setEditedFront(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground uppercase mb-1 block text-left">
                      {deck.preferredMode === 'mcq' ? 'Correct Answer' : 'Back'}
                    </label>
                    <Textarea 
                      value={editedBack}
                      onChange={(e) => setEditedBack(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={handleSaveEditCard}
                      className="p-2 bg-[var(--neon-blue)]/20 text-[var(--neon-blue)] rounded-lg hover:bg-[var(--neon-blue)]/30 transition-colors"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={handleCancelEdit}
                      className="p-2 bg-secondary text-muted-foreground rounded-lg hover:bg-secondary/80 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 space-y-3">
                    <div>
                      <span className="text-[10px] text-[var(--neon-blue)] uppercase font-bold tracking-widest block mb-1">
                        {deck.preferredMode === 'mcq' ? 'Question' : 'Front'}
                      </span>
                      <p className="text-sm font-medium">{card.front}</p>
                    </div>
                    <div className="pt-3 border-t border-white/5">
                      <span className="text-[10px] text-[var(--neon-purple)] uppercase font-bold tracking-widest block mb-1">
                        {deck.preferredMode === 'mcq' ? 'Correct Answer' : 'Back'}
                      </span>
                      <p className="text-sm text-muted-foreground">{card.back}</p>
                    </div>
                    {card.mastered && (
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[9px] uppercase font-bold rounded border border-emerald-500/20 mt-2">
                        <Check className="w-3 h-3" />
                        Mastered
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <button 
                      onClick={() => handleStartEditCard(card)}
                      className="p-2 text-muted-foreground hover:bg-secondary rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteCard(card.id)}
                      className="p-2 text-red-400/60 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Delete Deck Confirmation Modal */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-[var(--cyber-surface)] border border-red-500/30 rounded-2xl p-8 max-w-md w-full"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-4 bg-red-500/10 rounded-full">
                    <AlertTriangle className="w-8 h-8 text-red-500" />
                  </div>
                  <h3 className="text-xl font-bold">Delete this Deck?</h3>
                </div>
                <p className="text-muted-foreground mb-8 leading-relaxed">
                  You are about to permanently delete <span className="text-white font-bold">"{deck.title}"</span> and all its {deck.cards.length} flashcards. This action cannot be reversed.
                </p>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 py-3 bg-secondary hover:bg-secondary/80 rounded-xl transition-colors font-medium text-sm"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                      onDeleteDeck(deck.id);
                      onBack();
                    }}
                    className="flex-1 py-3 bg-red-500 hover:bg-red-600 rounded-xl transition-colors font-bold text-sm text-white"
                  >
                    Delete Deck
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
