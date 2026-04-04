import React from 'react';
import { motion } from 'motion/react';
import { BookOpen, List, Lightbulb } from 'lucide-react';
import { NotesControls } from './NotesControls';

export interface NoteTopic {
  title: string;
  definition: string;
  description: (string | { subPoint: string[] })[];
  explanation: string;
  examples: string[];
  keywords: string[];
}

interface NotesPreviewProps {
  subject: string;
  notes: NoteTopic[];
  onDownloadPDF: () => void;
  isDownloading?: boolean;
}

export const NotesPreview: React.FC<NotesPreviewProps> = ({ 
  subject, 
  notes, 
  onDownloadPDF, 
  isDownloading 
}) => {
  if (!notes || notes.length === 0) return null;

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-10 mt-6 pb-20">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <h2 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-[var(--neon-blue)] via-white to-[var(--neon-purple)] bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(59,130,246,0.2)] uppercase tracking-tighter italic">
          {subject}
        </h2>
        <div className="h-0.5 w-16 bg-gradient-to-r from-[var(--neon-blue)] to-transparent mx-auto rounded-full opacity-40" />
      </motion.div>
      
      <div className="space-y-12">
        {notes.map((topic, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="relative group"
          >
            {/* Topic Card Backdrop Glow */}
            <div className="absolute -inset-0.5 bg-gradient-to-br from-[var(--neon-blue)]/10 to-[var(--neon-purple)]/10 rounded-3xl blur-xl opacity-20 group-hover:opacity-60 transition duration-1000" />
            
            <div className="relative bg-[#0a0c10]/60 backdrop-blur-2xl p-8 rounded-3xl border border-white/5 shadow-2xl flex flex-col gap-10 overflow-hidden text-left">
               {/* Accent decoration */}
               <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--neon-blue)]/5 rounded-full blur-3xl -z-10" />

               <div className="flex items-center gap-5 border-b border-white/5 pb-5">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[var(--neon-blue)]/20 to-[var(--neon-blue)]/5 flex items-center justify-center border border-[var(--neon-blue)]/20 text-[var(--neon-blue)] font-black text-xl italic shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                    {index + 1}
                  </div>
                  <h3 className="text-2xl font-bold text-white tracking-tight group-hover:text-[var(--neon-blue)] transition-colors duration-300">
                    {topic.title}
                  </h3>
               </div>
              
              <div className="grid grid-cols-1 gap-10">
                {/* Definition Module */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--neon-blue)] shadow-[0_0_8px_rgba(59,130,246,1)]" />
                    <label className="text-[10px] uppercase tracking-[0.3em] font-black text-slate-500">
                      Primary Definition
                    </label>
                  </div>
                  <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 leading-relaxed text-slate-300 text-[15px] font-medium italic relative">
                    <div className="absolute inset-y-6 left-0 w-[2px] bg-[var(--neon-blue)] rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                    {topic.definition}
                  </div>
                </div>
                
                {/* Description Module */}
                <div className="space-y-6">
                  <label className="text-[10px] uppercase tracking-[0.3em] font-black text-slate-500 pl-1">
                    Neural Breakdown
                  </label>
                  <div className="space-y-5 pl-1">
                    {topic.description?.map((desc, i) => {
                      if (typeof desc === 'string') {
                        return (
                          <div key={i} className="flex gap-5 group/item">
                            <span className="text-[var(--neon-blue)] font-black text-[10px] mt-1.5 shrink-0 opacity-40 group-hover/item:opacity-100 transition-opacity">0{i + 1}</span>
                            <span className="text-slate-400 group-hover:text-slate-200 transition-colors leading-relaxed tracking-wide text-[14px]">{desc}</span>
                          </div>
                        );
                      } else if (desc?.subPoint) {
                        return (
                          <div key={i} className="ml-11 space-y-3.5 border-l border-white/5 pl-6 py-1">
                            {desc.subPoint.map((sub, j) => (
                              <div key={j} className="flex gap-3 items-center text-left">
                                <div className="w-1 h-1 rounded-full bg-slate-700 group-hover:bg-[var(--neon-blue)]/40 transition-colors" />
                                <span className="text-xs font-medium text-slate-500 leading-relaxed italic">{sub}</span>
                              </div>
                            ))}
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
                
                {/* Insights vs Application Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                    <div className="space-y-4 bg-white/[0.02] p-6 rounded-2xl border border-white/5">
                        <label className="text-[10px] uppercase tracking-[0.3em] font-black text-[var(--neon-purple)] flex items-center gap-2">
                           <Lightbulb className="w-3.5 h-3.5" />
                           Intuition
                        </label>
                        <p className="text-slate-400 text-sm leading-relaxed italic opacity-80">{topic.explanation}</p>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-600 pl-1">
                           Pragmatic Use-Cases
                        </label>
                        <ul className="space-y-4 list-none p-0 m-0">
                            {topic.examples?.map((ex, i) => (
                                <li key={i} className="text-xs text-slate-500 bg-white/[0.01] p-3 rounded-xl border border-white/5 hover:border-white/10 transition-colors flex gap-3 text-left">
                                    <span className="text-[var(--neon-purple)] font-black">»</span>
                                    {ex}
                                </li>
                            )) || <li className="text-xs text-slate-600 italic">No examples generated</li>}
                        </ul>
                    </div>
                </div>
                
                {topic.keywords && topic.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-6 border-t border-white/5 mt-2">
                    {topic.keywords?.map((kw: string, i: number) => (
                      <span key={i} className="px-3 py-1 bg-white/[0.03] text-[9px] font-black rounded-lg border border-white/5 text-slate-600 uppercase tracking-widest hover:text-[var(--neon-blue)] hover:border-[var(--neon-blue)]/20 transition-all cursor-default">
                        # {kw}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        className="mt-10 border-t border-white/5 pt-12 flex justify-center"
      >
        <NotesControls 
          onDownloadPDF={onDownloadPDF} 
          isDownloading={isDownloading} 
        />
      </motion.div>
    </div>
  );
};
