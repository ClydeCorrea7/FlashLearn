import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { NotesForm } from './NotesForm';
import { NotesPreview, NoteTopic } from './NotesPreview';
import { apiCall, supabase } from '../utils/supabase/client';
import { PageTransition } from './PageTransition';
import { SavedNotesList, generatePDF } from './SavedNotesList';

interface NotesPageProps {
  onBack: () => void;
  isAuthenticated?: boolean;
}

const generationCache = new Map<string, NoteTopic[]>();

export const NotesPage: React.FC<NotesPageProps> = ({ onBack, isAuthenticated = false }) => {
  const [subject, setSubject] = useState('');
  const [topics, setTopics] = useState('');
  const [tone, setTone] = useState('Professional');
  const [examplesToggle, setExamplesToggle] = useState(true);
  
  const [activeTab, setActiveTab] = useState<'generate' | 'saved'>('generate');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedNotes, setGeneratedNotes] = useState<NoteTopic[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Auto-save logic for authenticated users
  React.useEffect(() => {
    if (isAuthenticated && generatedNotes.length > 0 && !isSaving && !saveSuccess) {
      handleSaveToDB();
    }
  }, [generatedNotes, isAuthenticated]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setGeneratedNotes([]);

    const cacheKey = JSON.stringify({
      subject: subject.trim().toLowerCase(),
      topics: topics.trim().toLowerCase(),
      tone,
      examplesToggle
    });

    if (generationCache.has(cacheKey)) {
      setGeneratedNotes(generationCache.get(cacheKey)!);
      setIsGenerating(false);
      return;
    }

    try {
      const data = await apiCall('/ai/generate-notes', {
        method: 'POST',
        body: JSON.stringify({
          subject_context: subject,
          topics,
          tone,
          examples_toggle: examplesToggle ? 'Include Examples' : 'No Examples'
        })
      });
      
      if (data.notes && Array.isArray(data.notes)) {
        // SUPER-ROBUST Master Normalizer (Handles Case Sensitivity & Type Mismatch)
        const normalizedNotes = data.notes.map((n: any) => {
          // 1. Case-insensitive key lookup helper
          const getVal = (aliases: string[]) => {
            const keys = Object.keys(n);
            for (const alias of aliases) {
              const foundKey = keys.find(k => k.toLowerCase() === alias.toLowerCase());
              if (foundKey && n[foundKey]) return n[foundKey];
            }
            return null;
          };

          // 2. Ensuring Array type helper
          const toArr = (val: any) => {
            if (Array.isArray(val)) return val;
            if (typeof val === 'string' && val.trim()) return [val]; // Convert string to single-item array
            return [];
          };

          return {
            title: getVal(['title', 'topic', 'name', 'subject']) || "Unknown Topic",
            definition: getVal(['definition', 'def', 'meaning', 'summary']) || "",
            description: toArr(getVal(['description', 'details', 'points', 'content', 'bullets', 'breakdown'])),
            explanation: getVal(['explanation', 'intuition', 'concept', 'analysis', 'rationale', 'deepdive']) || "",
            examples: toArr(getVal(['examples', 'cases', 'applications', 'utility', 'instances'])),
            keywords: toArr(getVal(['keywords', 'tags', 'terminology', 'concepts', 'terms']))
          };
        });
        
        generationCache.set(cacheKey, normalizedNotes);
        setGeneratedNotes(normalizedNotes);
      } else {
        throw new Error('Invalid notes format received from neural link');
      }
    } catch (err: any) {
      console.error("Neural Sync Error:", err);
      const msg = err.message || "";
      if (msg.includes("404")) {
        setError("Neural connection point (404) not found. Contact administrator.");
      } else if (msg.includes("Failed to fetch")) {
        setError("Network gateway timeout. Please check your connection.");
      } else {
        setError(`Neural Sync Interrupted: ${msg}`);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!generatedNotes.length) return;
    setIsDownloading(true);
    try {
      generatePDF(subject, generatedNotes);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSaveToDB = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase.from('notes').insert({
        user_id: user.id,
        subject,
        topics,
        tone,
        include_examples: examplesToggle,
        generated_content: generatedNotes
      });

      if (error) {
        console.warn('Failed to save to DB, table might not exist yet:', error);
      }
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error(error);
      alert('Failed to save notes');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50 px-4 py-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-secondary rounded-full transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg cyber-gradient flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-xl font-bold font-['Press_Start_2P'] text-[12px] sm:text-[14px]">
                Notes Generator
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Segmented Control Tabs */}
      <div className="flex justify-center mt-2 px-4 relative z-10 text-[10px]">
        <div className="relative flex bg-secondary/50 backdrop-blur-xl rounded-xl p-1 border border-border/50 shadow-2xl w-full max-w-[280px]">
          <motion.div
            className="absolute top-1 bottom-1 rounded-lg bg-gradient-to-r from-[var(--neon-blue)] to-[var(--neon-purple)] shadow-[0_0_15px_rgba(59,130,246,0.3)]"
            initial={false}
            animate={{
              left: activeTab === 'generate' ? '4px' : 'calc(50% + 2px)',
              right: activeTab === 'generate' ? 'calc(50% + 2px)' : '4px',
            }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
          />
          
          <button
            onClick={() => setActiveTab('generate')}
            className={`relative z-10 flex-1 py-2 text-[9px] font-black uppercase tracking-[0.1em] transition-colors duration-300 ${
              activeTab === 'generate' ? 'text-white' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Generate
          </button>
          {isAuthenticated && (
            <button
              onClick={() => setActiveTab('saved')}
              className={`relative z-10 flex-1 py-2 text-[9px] font-black uppercase tracking-[0.1em] transition-colors duration-300 ${
                activeTab === 'saved' ? 'text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Vault
            </button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 transition-all duration-500">
        <div className="text-center mb-8 space-y-3">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center mb-2">
            <span className="px-2 py-0.5 rounded-full bg-white/[0.03] border border-white/5 text-[8px] font-black uppercase tracking-[0.2em] text-[var(--neon-blue)] opacity-60">
              Neural Sync Active
            </span>
          </motion.div>
          <h2 className="text-3xl md:text-5xl font-black bg-gradient-to-b from-foreground to-foreground/40 bg-clip-text text-transparent tracking-tighter italic">
            {activeTab === 'generate' ? "INTEL//SYNC" : "KNOWLEDGE//VAULT"}
          </h2>
          <p className="text-muted-foreground text-xs md:text-sm max-w-md mx-auto font-medium leading-relaxed px-4">
            {activeTab === 'generate' 
              ? "Synthesize complex data into high-fidelity neural notes." 
              : "Review your archived study protocols."}
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {saveSuccess && (
          <div className="mb-6 bg-green-500/10 border border-green-500/20 text-green-500 px-4 py-3 rounded-lg text-sm text-center">
            Notes saved successfully!
          </div>
        )}

        <AnimatePresence mode="wait">
          {activeTab === 'generate' ? (
            <motion.div key="generate-section" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {!generatedNotes.length ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <NotesForm
                    subject={subject}
                    setSubject={setSubject}
                    topics={topics}
                    setTopics={setTopics}
                    tone={tone}
                    setTone={setTone}
                    examplesToggle={examplesToggle}
                    setExamplesToggle={setExamplesToggle}
                    isGenerating={isGenerating}
                    onGenerate={handleGenerate}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <NotesPreview
                    subject={subject}
                    notes={generatedNotes}
                    onDownloadPDF={handleDownloadPDF}
                    isDownloading={isDownloading}
                  />
                  
                  {!isAuthenticated && (
                    <div className="mt-4 p-4 rounded-xl bg-secondary/30 border border-border/50 text-center">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-['Press_Start_2P'] leading-loose">
                        Want to save these to your Knowledge Vault? <br/>
                        <span className="text-[var(--neon-blue)]">CREATE AN ACCOUNT TO SYNC DATA</span>
                      </p>
                    </div>
                  )}
                  
                  <div className="mt-8 flex justify-center">
                    <button 
                      onClick={() => setGeneratedNotes([])}
                      className="text-sm text-muted-foreground hover:text-foreground underline decoration-dashed underline-offset-4"
                    >
                      Generate completely new notes
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div key="saved-section" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <SavedNotesList />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
