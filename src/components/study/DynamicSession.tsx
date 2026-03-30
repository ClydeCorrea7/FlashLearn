import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NeonButton } from '../NeonButton';
import { AnimatedCard } from '../AnimatedCard';
import { Brain, Send, ArrowLeft, Loader2, Sparkles, User, Bot, Target, Download, Home } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { jsPDF } from 'jspdf';

interface DynamicSessionProps {
  onClose: () => void;
}

type Message = {
  id: string;
  role: 'system' | 'ai' | 'user';
  content: string;
  feedback?: string;
  isInitial?: boolean;
};

export const DynamicSession: React.FC<DynamicSessionProps> = ({ onClose }) => {
  const [phase, setPhase] = useState<'setup' | 'chat'>('setup');
  
  // Setup State
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState('Beginner');
  const [goal, setGoal] = useState('Conceptual Understanding');
  const [rounds, setRounds] = useState<number>(5);
  const [contextStr, setContextStr] = useState('');
  
  // Chat State
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputStr, setInputStr] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Current Question Object (to keep track contextually)
  const currentQuestionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [keyboardOffset, setKeyboardOffset] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.visualViewport) return;
    
    const onResize = () => {
      const offset = window.innerHeight - window.visualViewport!.height;
      setKeyboardOffset(offset > 50 ? offset : 0);
    };

    window.visualViewport.addEventListener('resize', onResize);
    return () => window.visualViewport?.removeEventListener('resize', onResize);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleStartSession = async () => {
    if (!topic.trim()) return;
    
    setPhase('chat');
    setIsLoading(true);
    
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-bc46df65/ai/dynamic/init`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
          'apikey': publicAnonKey
        },
        body: JSON.stringify({ topic, level, goal, contextStr })
      });
      
      if (!response.ok) throw new Error('Failed to initialize session');
      const data = await response.json();
      
      const { nextQuestion } = data;
      currentQuestionRef.current = nextQuestion;
      
      setMessages([
        {
          id: Date.now().toString(),
          role: 'system',
          content: `Link established. Initializing learning protocol for: ${topic} [${level}]. Focus: ${goal}.`,
          isInitial: true
        },
        {
          id: (Date.now() + 1).toString(),
          role: 'ai',
          content: nextQuestion.question
        }
      ]);
    } catch (err) {
      console.error(err);
      setMessages([{
        id: 'error',
        role: 'system',
        content: 'Failed to establish neural link. Please check your connection and try again.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitContext = async (e?: React.FormEvent, overrideStr?: string) => {
    e?.preventDefault();
    const finalStr = overrideStr !== undefined ? overrideStr : inputStr;
    
    if (!finalStr.trim() || isLoading) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: finalStr.trim()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputStr('');
    setIsLoading(true);
    
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-bc46df65/ai/dynamic/evaluate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
          'apikey': publicAnonKey
        },
         body: JSON.stringify({
           topic,
           level,
           goal,
           prev_q: currentQuestionRef.current?.question,
           expected_concept: currentQuestionRef.current?.expected_concept,
           user_ans: overrideStr === "I don't know the answer. Please explain it to me." ? "I don't know" : userMessage.content
         })
      });
      
      if (!response.ok) throw new Error('Failed to evaluate response');
      const data = await response.json();
      
      const { status, feedback, nextQuestion } = data;
      
      // Update the user message to append the feedback
      setMessages(prev => 
         prev.map(m => m.id === userMessage.id ? { ...m, feedback } : m)
      );
      
      // Check if we hit the rounds limit
      const aiQuestionsCount = messages.filter(m => m.role === 'ai').length + 1; // +1 because we are about to add the next one if it exists
      
      // Add the next question or finish
      if (nextQuestion && aiQuestionsCount <= rounds) {
        currentQuestionRef.current = nextQuestion;
        setTimeout(() => {
            setMessages(prev => [...prev, {
              id: Date.now().toString(),
              role: 'ai',
              content: nextQuestion.question
            }]);
            setIsLoading(false);
        }, 800); // slight delay for visual pacing
      } else {
        setTimeout(() => {
            setMessages(prev => [...prev, {
              id: Date.now().toString(),
              role: 'system',
              content: `Session complete. You have finished all ${rounds} rounds.`
            }]);
            setIsLoading(false);
            currentQuestionRef.current = null;
        }, 800);
      }
      
    } catch (err) {
      console.error(err);
      setIsLoading(false);
      setMessages(prev => [...prev, {
         id: Date.now().toString(),
         role: 'system',
         content: 'Neural link interrupted. Please try re-sending.'
      }]);
    }
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const contentWidth = pageWidth - (margin * 2);

    // Header
    doc.setFillColor(168, 85, 247); // Purple theme
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text(`DYNAMIC LEARNING SESSION`, margin, 20);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`TOPIC: ${topic.toUpperCase()} | LEVEL: ${level} | GOAL: ${goal}`, margin, 32);

    let y = 55;
    
    messages.forEach((msg) => {
      if (msg.role === 'system') {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(9);
        doc.setTextColor(150, 150, 150);
        doc.text(`[${msg.content}]`, margin, y);
        y += 10;
        return;
      }

      const roleName = msg.role === 'ai' ? 'AI TUTOR' : 'USER';
      const roleColor = msg.role === 'ai' ? [168, 85, 247] : [6, 182, 212]; // Purple vs Cyan

      // Role label
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(roleColor[0], roleColor[1], roleColor[2]);
      doc.text(roleName + ":", margin, y);
      y += 6;

      // Message content
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(40, 40, 50);
      const lines = doc.splitTextToSize(msg.content, contentWidth);
      doc.text(lines, margin, y);
      y += (lines.length * 6) + 5;

      // Feedback if any
      if (msg.feedback) {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        const feedbackLines = doc.splitTextToSize(`Feedback: ${msg.feedback}`, contentWidth - 10);
        doc.text(feedbackLines, margin + 5, y);
        y += (feedbackLines.length * 5) + 8;
      } else {
        y += 5;
      }

      // Page break check
      if (y > 270) {
        doc.addPage();
        y = 30;
      }
    });

    // Footer
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(200);
        doc.text(`FlashLearn AI Session Logs - Page ${i} of ${pageCount}`, pageWidth/2, 290, { align: 'center' });
    }

    doc.save(`dynamic-session-${topic.toLowerCase().replace(/\s+/g, '-')}.pdf`);
  };

  if (phase === 'setup') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <AnimatedCard className="max-w-md w-full p-6 sm:p-8 cyber-surface neon-border-purple relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500" />
           
           <button 
             onClick={onClose}
             className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-white transition-colors"
           >
             <ArrowLeft className="w-5 h-5" />
           </button>
           
           <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center animate-pulse shadow-[0_0_30px_rgba(168,85,247,0.4)]">
                <Brain className="w-8 h-8 text-purple-400" />
              </div>
           </div>
           
           <h2 className="text-2xl font-black text-center mb-2 uppercase tracking-widest bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
             Dynamic Protocol
           </h2>
           <p className="text-center text-sm text-white/50 mb-8">
             Configure parameters for your real-time adaptive AI session.
           </p>
           
           <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase text-purple-400 mb-1 tracking-widest">
                  Target Concept / Topic
                </label>
                <input 
                  type="text"
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  placeholder="e.g. Quantum Entanglement"
                  className="w-full bg-black/50 border border-purple-500/30 rounded-lg px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-purple-400 focus:shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all"
                  autoFocus
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-[10px] font-black uppercase text-purple-400 mb-1 tracking-widest">
                      Skill Threshold
                    </label>
                    <select
                      value={level}
                      onChange={e => setLevel(e.target.value)}
                      className="w-full bg-black/50 border border-purple-500/30 rounded-lg px-4 py-3 text-white focus:outline-none appearance-none"
                    >
                      <option>Beginner</option>
                      <option>Intermediate</option>
                      <option>Advanced</option>
                      <option>Expert</option>
                    </select>
                 </div>
                 <div>
                    <label className="block text-[10px] font-black uppercase text-purple-400 mb-1 tracking-widest">
                      Primary Objective
                    </label>
                    <select
                      value={goal}
                      onChange={e => setGoal(e.target.value)}
                      className="w-full bg-black/50 border border-purple-500/30 rounded-lg px-4 py-3 text-white focus:outline-none appearance-none"
                    >
                      <option>General Understanding</option>
                      <option>Exam Prep</option>
                      <option>Deep Dive</option>
                      <option>Quick Review</option>
                    </select>
                 </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-[10px] font-black uppercase text-purple-400 mb-1 tracking-widest">
                      Total Rounds
                    </label>
                    <select
                      value={rounds}
                      onChange={e => setRounds(Number(e.target.value))}
                      className="w-full bg-black/50 border border-purple-500/30 rounded-lg px-4 py-3 text-white focus:outline-none appearance-none"
                    >
                      <option value={3}>3 Rounds (Short)</option>
                      <option value={5}>5 Rounds (Standard)</option>
                      <option value={10}>10 Rounds (Intense)</option>
                      <option value={15}>15 Rounds (Mastery)</option>
                    </select>
                 </div>
                 
                 <div>
                    <label className="block text-[10px] font-black uppercase text-purple-400 mb-1 tracking-widest">
                      Context Constraints
                    </label>
                    <input 
                      type="text"
                      value={contextStr}
                      onChange={e => setContextStr(e.target.value)}
                      placeholder="e.g. Include formulas"
                      className="w-full bg-black/50 border border-purple-500/30 rounded-lg px-4 py-3 text-white placeholder-white/20 focus:outline-none"
                    />
                 </div>
              </div>
           </div>
           
           <NeonButton 
             onClick={handleStartSession}
             disabled={!topic.trim()}
             glowing={true}
             className="w-full mt-8 py-4 bg-purple-500/20 text-purple-400 hover:bg-purple-500/30"
           >
             <Sparkles className="w-5 h-5 mr-2 inline-block" />
             Initiate Link
           </NeonButton>
        </AnimatedCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col pt-4 overflow-hidden relative">
      {/* Ambient Micro-Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-purple-500/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-cyan-500/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Header */}
      <header className="px-4 py-3 shrink-0 flex items-center justify-between border-b border-purple-500/20 bg-background/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
           <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/70 hover:text-white">
             <ArrowLeft className="w-5 h-5" />
           </button>
            <div>
              <div className="text-sm font-black dynamic-header-gradient uppercase tracking-widest drop-shadow-[0_0_10px_rgba(168,85,247,0.3)]">
                Dynamic Link: {topic}
              </div>
              <p className="text-[10px] text-white/50">{level} • {goal} • {rounds} Rounds</p>
           </div>
        </div>
        <div className="flex items-center gap-2">
           <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
           <span className="text-[10px] uppercase font-black tracking-widest text-emerald-500">Online</span>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide">
         <div className="max-w-3xl mx-auto flex flex-col gap-6 pt-4 pb-32">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'system' && (
                     <div className="w-full text-center">
                        <span className="inline-block px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-[10px] text-purple-300 font-mono tracking-widest uppercase shadow-[0_0_15px_rgba(168,85,247,0.1)]">
                           {msg.content}
                        </span>
                     </div>
                  )}
                  
                  {msg.role === 'ai' && (
                     <div className="flex items-start gap-3 max-w-[85%] sm:max-w-[70%]">
                        <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(168,85,247,0.3)] mt-1">
                          <Bot className="w-4 h-4 text-purple-400" />
                        </div>
                        <div className="p-4 rounded-2xl bg-secondary/40 border border-white/5 backdrop-blur-sm text-sm leading-relaxed shadow-lg">
                           {msg.content}
                        </div>
                     </div>
                  )}
                  
                  {msg.role === 'user' && (
                     <div className="flex flex-col items-end gap-3 max-w-[85%] sm:max-w-[75%]">
                       <div className="flex items-start gap-3">
                          <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 backdrop-blur-md text-sm leading-relaxed shadow-[0_0_20px_rgba(6,182,212,0.1)] text-cyan-50/90 order-1">
                             {msg.content}
                          </div>
                          <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(6,182,212,0.3)] mt-1 order-2">
                            <User className="w-4 h-4 text-cyan-400" />
                          </div>
                       </div>
                       
                       {/* Nested Evaluation Feedback */}
                        {msg.feedback && (
                          <motion.div 
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mr-11 bg-purple-500/5 border border-purple-500/20 p-3 rounded-xl text-xs text-purple-200/70 max-w-[90%] flex items-start gap-2 shadow-sm"
                          >
                            <Target className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                            <p className="italic">{msg.feedback}</p>
                          </motion.div>
                        )}
                     </div>
                  )}
                </motion.div>
              ))}
              
              {isLoading && (
                 <motion.div
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   className="flex justify-start w-full"
                 >
                    <div className="flex items-start gap-3">
                       <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center shrink-0">
                         <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                       </div>
                       <div className="px-4 py-3 rounded-2xl bg-secondary/40 border border-white/5 h-10 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                       </div>
                    </div>
                 </motion.div>
              )}

              {/* End of Session Actions */}
              {!isLoading && !currentQuestionRef.current && messages.length > 2 && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center gap-4 py-8 border-t border-purple-500/10 mt-6"
                >
                  <p className="text-xs font-black uppercase text-purple-400 tracking-widest bg-purple-500/10 px-4 py-2 rounded-full border border-purple-500/20 mb-2">
                    Session Protocol Finalized
                  </p>
                  <div className="flex flex-wrap justify-center gap-4 w-full">
                    <NeonButton 
                      onClick={handleDownloadPDF}
                      className="flex-1 max-w-[200px] border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Save Transcript
                    </NeonButton>
                    <NeonButton 
                      onClick={onClose}
                      className="flex-1 max-w-[200px] border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                    >
                      <Home className="w-4 h-4 mr-2" />
                      Home Dashboard
                    </NeonButton>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
         </div>
      </div>

      {/* Input Area */}
      {currentQuestionRef.current && (
        <div 
          className="shrink-0 p-4 border-t border-white/10 bg-background/90 backdrop-blur-lg fixed left-0 w-full z-20 safe-area-bottom transition-[bottom] duration-100 ease-out"
          style={{ bottom: `${keyboardOffset}px` }}
        >
           <div className="max-w-3xl mx-auto flex flex-col gap-2">
              {!isLoading && (
                <div className="flex justify-end">
                  <button 
                    type="button"
                    onClick={() => handleSubmitContext(undefined, "I don't know the answer. Please explain it to me.")}
                    className="text-xs text-purple-400 hover:text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1.5 border border-purple-500/20"
                  >
                    <Brain className="w-3.5 h-3.5" />
                    Reveal Answer
                  </button>
                </div>
              )}
              <form onSubmit={(e) => handleSubmitContext(e)} className="flex gap-2 relative">
                 <input
                   type="text"
                   value={inputStr}
                   onChange={e => setInputStr(e.target.value)}
                   disabled={isLoading}
                   placeholder="Formulate response..."
                   className="flex-1 bg-secondary/50 border border-white/10 rounded-xl px-4 py-4 text-sm focus:outline-none focus:border-purple-500/50 focus:bg-secondary disabled:opacity-50 transition-all pr-12 shadow-xl"
                 />
                 <button
                   type="submit"
                   disabled={!inputStr.trim() || isLoading}
                   className="absolute right-2 top-2 bottom-2 aspect-square rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white disabled:opacity-50 disabled:grayscale transition-all hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                 >
                   <Send className="w-4 h-4 relative -left-0.5" />
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};
