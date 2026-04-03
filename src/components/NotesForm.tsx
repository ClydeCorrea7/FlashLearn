import React from 'react';
import { motion } from 'motion/react';
import { Loader2, Sparkles, BookOpen, Layers } from 'lucide-react';

interface NotesFormProps {
  subject: string;
  setSubject: (v: string) => void;
  topics: string;
  setTopics: (v: string) => void;
  tone: string;
  setTone: (v: string) => void;
  examplesToggle: boolean;
  setExamplesToggle: (v: boolean) => void;
  isGenerating: boolean;
  onGenerate: () => void;
}

export const NotesForm: React.FC<NotesFormProps> = ({
  subject,
  setSubject,
  topics,
  setTopics,
  tone,
  setTone,
  examplesToggle,
  setExamplesToggle,
  isGenerating,
  onGenerate
}) => {
  const isFormValid = subject.trim() !== '' && topics.trim() !== '';

  return (
    <div className="w-full max-w-2xl mx-auto bg-card p-6 sm:p-8 rounded-xl cyber-border shadow-lg relative overflow-hidden group">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--neon-purple)]/5 rounded-full blur-3xl -z-10 transition-transform duration-700 group-hover:scale-110" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-[var(--neon-blue)]/5 rounded-full blur-3xl -z-10 transition-transform duration-700 group-hover:scale-110" />

      <h2 className="text-xl font-bold mb-6 flex items-center">
        <Sparkles className="w-5 h-5 mr-2 text-[var(--neon-blue)]" />
        Configure Notes
      </h2>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2 flex items-center">
            <BookOpen className="w-4 h-4 mr-2 text-muted-foreground" />
            Subject Context
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Advanced Operating Systems"
            className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-[var(--neon-blue)]/50 transition-all font-['Inter']"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2 flex items-center">
            <Layers className="w-4 h-4 mr-2 text-muted-foreground" />
            Topics (Comma-separated)
          </label>
          <textarea
            value={topics}
            onChange={(e) => setTopics(e.target.value)}
            placeholder="e.g. Context Switching, CPU Scheduling, Virtual Memory"
            maxLength={500}
            className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-[var(--neon-blue)]/50 transition-all min-h-[120px] resize-y font-['Inter']"
          />
          <div className="text-right text-xs text-muted-foreground mt-1">
            {topics.length} / 500
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Tone (Explanations)
            </label>
            <div className="flex bg-secondary/50 p-1 rounded-lg border border-border/50">
              {['Professional', 'Playful'].map((t) => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                    tone === t
                      ? 'bg-[var(--neon-blue)]/20 text-[var(--neon-blue)] border border-[var(--neon-blue)]/50 shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Examples
            </label>
            <div className="flex bg-secondary/50 p-1 rounded-lg border border-border/50">
              <button
                onClick={() => setExamplesToggle(true)}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                  examplesToggle
                    ? 'bg-[var(--neon-purple)]/20 text-[var(--neon-purple)] border border-[var(--neon-purple)]/50 shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                Include
              </button>
              <button
                onClick={() => setExamplesToggle(false)}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                  !examplesToggle
                    ? 'bg-secondary text-foreground border border-border/50 shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/80'
                }`}
              >
                Skip
              </button>
            </div>
          </div>
        </div>

        <motion.button
          onClick={onGenerate}
          disabled={!isFormValid || isGenerating}
          whileHover={isFormValid && !isGenerating ? { scale: 1.02 } : {}}
          whileTap={isFormValid && !isGenerating ? { scale: 0.98 } : {}}
          className={`w-full py-4 rounded-xl flex items-center justify-center font-bold text-white transition-all mt-6 ${
            isFormValid && !isGenerating
              ? 'cyber-gradient neon-glow-blue cursor-pointer'
              : 'bg-muted text-muted-foreground cursor-not-allowed opacity-70'
          }`}
        >
          {isGenerating ? (
            <span className="flex items-center">
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Generating Notes...
            </span>
          ) : (
            <span className="flex items-center">
              <Sparkles className="w-5 h-5 mr-2" />
              Generate Notes
            </span>
          )}
        </motion.button>
      </div>
    </div>
  );
};
